#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import secrets
import sqlite3
import base64
from cgi import FieldStorage
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler
from io import BytesIO
from pathlib import Path
import re
from socketserver import TCPServer
from string import Template
from urllib import request
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlparse

from PIL import Image

BASE_DIR = Path(__file__).resolve().parent
CONTENT_PATH = BASE_DIR / "landing-content.json"
TAG_OPTIONS_PATH = BASE_DIR / "tag-options.json"
TEMPLATE_PATH = BASE_DIR / "index.html"
DB_PATH = BASE_DIR / "stores.db"
DEFAULT_DRESS_PHOTO_PATH = "images/default/default-dress.svg"
STORE_DRESS_PHOTO_BASE_DIR = BASE_DIR / "images" / "stores"
OPENAI_KEY_PATH = BASE_DIR / "key.txt"
OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"
OPENAI_AUTOLABEL_MODEL = "gpt-4.1-nano"
AUTOLABEL_MAX_DIMENSION = 768
AUTOLABEL_JPEG_QUALITY = 75
ALLOWED_DRESS_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
DEFAULT_SESSION_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".svg",
    ".avif",
    ".gif",
    ".bmp",
    ".jfif",
}


def init_db() -> None:
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS stores (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              location TEXT NOT NULL,
              owner_email TEXT NOT NULL,
              dress_photo_path TEXT,
              invite_code TEXT NOT NULL,
              created_at TEXT NOT NULL
            )
            """
        )
        columns = conn.execute("PRAGMA table_info(stores)").fetchall()
        column_names = {column[1] for column in columns}
        if "dress_photo_path" not in column_names:
            conn.execute("ALTER TABLE stores ADD COLUMN dress_photo_path TEXT")
        if "invite_code" not in column_names:
            conn.execute("ALTER TABLE stores ADD COLUMN invite_code TEXT")
        if "created_at" not in column_names:
            conn.execute("ALTER TABLE stores ADD COLUMN created_at TEXT")

        # Backfill newly added columns for stores created before these fields existed.
        existing_codes = {
            row[0]
            for row in conn.execute(
                "SELECT UPPER(invite_code) FROM stores WHERE invite_code IS NOT NULL AND TRIM(invite_code) != ''"
            ).fetchall()
            if row[0]
        }
        missing_code_rows = conn.execute(
            "SELECT id FROM stores WHERE invite_code IS NULL OR TRIM(invite_code) = ''"
        ).fetchall()
        for row in missing_code_rows:
            invite_code = generate_invite_code()
            while invite_code in existing_codes:
                invite_code = generate_invite_code()
            existing_codes.add(invite_code)
            conn.execute(
                "UPDATE stores SET invite_code = ? WHERE id = ?",
                (invite_code, row[0]),
            )

        now_iso = datetime.now(timezone.utc).isoformat()
        conn.execute(
            "UPDATE stores SET created_at = ? WHERE created_at IS NULL OR TRIM(created_at) = ''",
            (now_iso,),
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS store_members (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              store_id INTEGER NOT NULL,
              member_email TEXT NOT NULL,
              joined_at TEXT NOT NULL,
              UNIQUE(store_id, member_email),
              FOREIGN KEY(store_id) REFERENCES stores(id)
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS store_dress_photos (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              store_id INTEGER NOT NULL,
              photo_path TEXT NOT NULL,
              price REAL,
              tags_json TEXT,
              created_at TEXT NOT NULL,
              FOREIGN KEY(store_id) REFERENCES stores(id)
            )
            """
        )
        photo_columns = conn.execute("PRAGMA table_info(store_dress_photos)").fetchall()
        photo_column_names = {column[1] for column in photo_columns}
        if "price" not in photo_column_names:
            conn.execute("ALTER TABLE store_dress_photos ADD COLUMN price REAL")
        if "tags_json" not in photo_column_names:
            conn.execute("ALTER TABLE store_dress_photos ADD COLUMN tags_json TEXT")
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS default_dress_metadata (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              photo_path TEXT NOT NULL UNIQUE,
              tags_json TEXT,
              updated_at TEXT NOT NULL
            )
            """
        )


def generate_invite_code() -> str:
    return secrets.token_hex(3).upper()


def normalize_photo_path(photo_path: str | None) -> str:
    if photo_path:
        return photo_path
    return get_default_dress_photo_path()


def get_default_dress_photo_path() -> str:
    source_path = Path(DEFAULT_DRESS_PHOTO_PATH)
    default_candidates = [
        source_path,
        source_path.with_suffix(".png"),
        source_path.with_suffix(".jpg"),
        source_path.with_suffix(".jpeg"),
        Path("images/default-dress.svg"),
        Path("images/default-dress.png"),
        Path("images/default-dress.jpg"),
        Path("images/default-dress.jpeg"),
    ]
    for candidate in default_candidates:
        relative_candidate = str(candidate)
        if (BASE_DIR / relative_candidate).exists():
            return relative_candidate
    return DEFAULT_DRESS_PHOTO_PATH


def list_default_dress_photos() -> list[str]:
    default_dir = BASE_DIR / "images" / "default"
    if not default_dir.exists() or not default_dir.is_dir():
        return [get_default_dress_photo_path()]

    photos = [
        str(path.relative_to(BASE_DIR)).replace("\\", "/")
        for path in sorted(default_dir.rglob("*"))
        if path.is_file() and path.suffix.lower() in DEFAULT_SESSION_EXTENSIONS
    ]
    return photos or [get_default_dress_photo_path()]


def fetch_default_dress_metadata() -> list[dict]:
    photos = list_default_dress_photos()
    if not photos:
        return []
    with sqlite3.connect(DB_PATH) as conn:
        rows = conn.execute(
            """
            SELECT photo_path, tags_json
            FROM default_dress_metadata
            WHERE photo_path IN ({placeholders})
            """.format(placeholders=",".join("?" for _ in photos)),
            photos,
        ).fetchall()
    tags_by_photo = {row[0]: parse_tags(row[1]) for row in rows}
    return [{"photo_path": photo, "tags": tags_by_photo.get(photo, [])} for photo in photos]


def update_default_dress_metadata(photo_path: str, tags: list[str]) -> bool:
    normalized_path = (photo_path or "").strip()
    if not normalized_path:
        return False
    available_photos = set(list_default_dress_photos())
    if normalized_path not in available_photos:
        return False
    updated_at = datetime.now(timezone.utc).isoformat()
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            INSERT INTO default_dress_metadata (photo_path, tags_json, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(photo_path) DO UPDATE SET
              tags_json = excluded.tags_json,
              updated_at = excluded.updated_at
            """,
            (normalized_path, json.dumps(tags), updated_at),
        )
    return True


def normalize_store_payload(store: dict) -> dict:
    payload = dict(store)
    dress_photos = payload.get("dress_photos") or []
    dress_photo_urls = [photo.get("photo_path") for photo in dress_photos if photo.get("photo_path")]
    if not dress_photo_urls and payload.get("dress_photo_path"):
        dress_photo_urls = [payload.get("dress_photo_path")]
    payload["dress_photos"] = dress_photos
    payload["dress_photo_urls"] = dress_photo_urls
    payload["dress_photo_url"] = normalize_photo_path(
        dress_photo_urls[0] if dress_photo_urls else payload.get("dress_photo_path")
    )
    return payload


def parse_tags(raw_tags: str | None) -> list[str]:
    if not raw_tags:
        return []
    try:
        tags = json.loads(raw_tags)
    except json.JSONDecodeError:
        return []
    if not isinstance(tags, list):
        return []
    return [str(tag) for tag in tags if str(tag).strip()]


def fetch_store_dress_photos(conn: sqlite3.Connection, store_id: int) -> list[dict]:
    rows = conn.execute(
        """
        SELECT photo_path, price, tags_json
        FROM store_dress_photos
        WHERE store_id = ?
        ORDER BY created_at DESC, id DESC
        """,
        (store_id,),
    ).fetchall()
    photos = []
    for row in rows:
        photos.append(
            {
                "photo_path": row[0],
                "price": row[1],
                "tags": parse_tags(row[2]),
            }
        )
    return photos


def fetch_stores(user_email: str) -> list[dict]:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            """
            SELECT DISTINCT stores.id, stores.name, stores.location, stores.owner_email,
                            stores.dress_photo_path, stores.invite_code, stores.created_at
            FROM stores
            LEFT JOIN store_members ON stores.id = store_members.store_id
            WHERE stores.owner_email = ? OR store_members.member_email = ?
            ORDER BY stores.id DESC
            """,
            (user_email, user_email),
        ).fetchall()
        stores = []
        for row in rows:
            store = dict(row)
            store["dress_photos"] = fetch_store_dress_photos(conn, store["id"])
            stores.append(normalize_store_payload(store))
    return stores


def create_store(name: str, location: str, owner_email: str) -> dict:
    invite_code = generate_invite_code()
    created_at = datetime.now(timezone.utc).isoformat()
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute(
            """
            INSERT INTO stores (name, location, owner_email, invite_code, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (name, location, owner_email, invite_code, created_at),
        )
        store_id = cursor.lastrowid
    return {
        "id": store_id,
        "name": name,
        "location": location,
        "owner_email": owner_email,
        "dress_photo_path": None,
        "dress_photo_urls": [],
        "dress_photo_url": get_default_dress_photo_path(),
        "invite_code": invite_code,
        "created_at": created_at,
    }


def join_store(invite_code: str, member_email: str) -> dict | None:
    invite_code = invite_code.strip().upper()
    member_email = member_email.strip().lower()
    if not invite_code or not member_email:
        return None
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        store = conn.execute(
            """
            SELECT id, name, location, owner_email, dress_photo_path, invite_code, created_at
            FROM stores
            WHERE invite_code = ?
            """,
            (invite_code,),
        ).fetchone()
        if not store:
            return None
        joined_at = datetime.now(timezone.utc).isoformat()
        conn.execute(
            """
            INSERT OR IGNORE INTO store_members (store_id, member_email, joined_at)
            VALUES (?, ?, ?)
            """,
            (store["id"], member_email, joined_at),
        )
        normalized_store = dict(store)
        normalized_store["dress_photos"] = fetch_store_dress_photos(
            conn, normalized_store["id"]
        )
    return normalize_store_payload(normalized_store)


def save_store_dress_photo(store_id: int, filename: str, content: bytes) -> str | None:
    extension = Path(filename).suffix.lower()
    if extension not in ALLOWED_DRESS_EXTENSIONS:
        return None
    store_dir = STORE_DRESS_PHOTO_BASE_DIR / f"store-{store_id}"
    store_dir.mkdir(parents=True, exist_ok=True)
    unique_suffix = secrets.token_hex(8)
    relative_path = Path("images") / "stores" / f"store-{store_id}" / f"dress-{unique_suffix}{extension}"
    full_path = BASE_DIR / relative_path
    full_path.write_bytes(content)
    created_at = datetime.now(timezone.utc).isoformat()
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            INSERT INTO store_dress_photos (store_id, photo_path, created_at)
            VALUES (?, ?, ?)
            """,
            (store_id, str(relative_path), created_at),
        )
        conn.execute(
            "UPDATE stores SET dress_photo_path = ? WHERE id = ?",
            (str(relative_path), store_id),
        )
    return str(relative_path)


def remove_store_dress_photo(store_id: int, photo_path: str) -> bool:
    normalized_photo_path = (photo_path or "").strip()
    if not normalized_photo_path:
        return False
    with sqlite3.connect(DB_PATH) as conn:
        deleted = conn.execute(
            """
            DELETE FROM store_dress_photos
            WHERE store_id = ? AND photo_path = ?
            """,
            (store_id, normalized_photo_path),
        )
        if deleted.rowcount < 1:
            return False
        latest_photo_row = conn.execute(
            """
            SELECT photo_path
            FROM store_dress_photos
            WHERE store_id = ?
            ORDER BY created_at DESC, id DESC
            LIMIT 1
            """,
            (store_id,),
        ).fetchone()
        conn.execute(
            "UPDATE stores SET dress_photo_path = ? WHERE id = ?",
            ((latest_photo_row[0] if latest_photo_row else None), store_id),
        )

    full_photo_path = BASE_DIR / normalized_photo_path
    if full_photo_path.exists() and full_photo_path.is_file():
        full_photo_path.unlink()
    return True


def fetch_store_by_id(store_id: int) -> dict | None:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        store = conn.execute(
            """
            SELECT id, name, location, owner_email, dress_photo_path, invite_code, created_at
            FROM stores
            WHERE id = ?
            """,
            (store_id,),
        ).fetchone()
        if not store:
            return None
        payload = dict(store)
        payload["dress_photos"] = fetch_store_dress_photos(conn, store_id)
    return normalize_store_payload(payload)


def update_store_dress_photo_metadata(
    store_id: int, photo_path: str, price: float | None, tags: list[str]
) -> bool:
    normalized_photo_path = (photo_path or "").strip()
    if not normalized_photo_path:
        return False
    tags_json = json.dumps(tags)
    with sqlite3.connect(DB_PATH) as conn:
        result = conn.execute(
            """
            UPDATE store_dress_photos
            SET price = ?, tags_json = ?
            WHERE store_id = ? AND photo_path = ?
            """,
            (price, tags_json, store_id, normalized_photo_path),
        )
    return result.rowcount > 0


def load_tag_options() -> dict:
    with TAG_OPTIONS_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def get_openai_api_key() -> str:
    if not OPENAI_KEY_PATH.exists():
        return ""
    return OPENAI_KEY_PATH.read_text(encoding="utf-8").strip()


def guess_mime_type(photo_path: str) -> str:
    extension = Path(photo_path).suffix.lower()
    if extension == ".png":
        return "image/png"
    if extension == ".webp":
        return "image/webp"
    return "image/jpeg"


def prepare_autolabel_image(photo_path: str) -> dict | None:
    source_path = BASE_DIR / photo_path
    if not source_path.exists() or not source_path.is_file():
        return None

    with Image.open(source_path) as image:
        original_width, original_height = image.size
        resized = image.copy()
        resized.thumbnail((AUTOLABEL_MAX_DIMENSION, AUTOLABEL_MAX_DIMENSION), Image.Resampling.LANCZOS)
        sent_width, sent_height = resized.size
        if resized.mode not in {"RGB", "L"}:
            resized = resized.convert("RGB")

        output = BytesIO()
        resized.save(output, format="JPEG", quality=AUTOLABEL_JPEG_QUALITY, optimize=True)
        encoded = base64.b64encode(output.getvalue()).decode("ascii")

    return {
        "data_url": f"data:image/jpeg;base64,{encoded}",
        "original_width": original_width,
        "original_height": original_height,
        "sent_width": sent_width,
        "sent_height": sent_height,
        "mime_type": "image/jpeg",
        "encoded_bytes": len(encoded),
    }


def build_autolabel_schema(tag_options: dict) -> tuple[dict, dict]:
    category_fields = {
        "core_silhouette_coverage": "silhouette",
        "neckline_coverage": "neckline",
        "back_types": "back_type",
        "sleeve_type": "sleeve_type",
        "fabric": "fabric",
        "accessories": "accessories",
    }
    labels_by_field: dict[str, list[str]] = {field: [] for field in category_fields.values()}
    tag_id_by_label: dict[str, str] = {}

    for category in tag_options.get("categories", []):
        category_id = category.get("id")
        field = category_fields.get(category_id)
        if not field:
            continue
        for tag in category.get("tags", []):
            tag_id = str(tag.get("id") or "").strip()
            label_en = str((tag.get("label") or {}).get("en") or "").strip()
            if not tag_id or not label_en:
                continue
            labels_by_field[field].append(label_en)
            tag_id_by_label[label_en.lower()] = tag_id

    schema = {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "silhouette": {"type": "string", "enum": labels_by_field["silhouette"]},
            "neckline": {"type": "string", "enum": labels_by_field["neckline"]},
            "back_type": {"type": "string", "enum": labels_by_field["back_type"]},
            "sleeve_type": {"type": "string", "enum": labels_by_field["sleeve_type"]},
            "fabric": {"type": "string", "enum": labels_by_field["fabric"]},
            "accessories": {
                "type": "array",
                "items": {"type": "string", "enum": labels_by_field["accessories"]},
                "uniqueItems": True,
            },
            "needs_review": {"type": "boolean"},
            "notes": {"type": "string"},
        },
        "required": [
            "silhouette",
            "neckline",
            "back_type",
            "sleeve_type",
            "fabric",
            "accessories",
            "needs_review",
        ],
    }
    return schema, tag_id_by_label


def map_autolabel_output_to_tag_ids(raw_output: dict, tag_id_by_label: dict[str, str]) -> list[str]:
    if not isinstance(raw_output, dict):
        return []

    selected: list[str] = []
    text_values: list[str] = []
    for field in ["silhouette", "neckline", "back_type", "sleeve_type", "fabric"]:
        value = raw_output.get(field)
        if isinstance(value, str):
            text_values.append(value)
    accessories = raw_output.get("accessories")
    if isinstance(accessories, list):
        text_values.extend(str(value) for value in accessories if str(value).strip())

    normalized_text = "\n".join(text_values).lower()
    for label, tag_id in tag_id_by_label.items():
        if label in normalized_text and tag_id not in selected:
            selected.append(tag_id)
    return selected


def run_openai_autolabel(photo_path: str) -> dict:
    api_key = get_openai_api_key()
    if not api_key:
        return {"error": "OpenAI key missing. Add key.txt with your API key."}

    prepared_image = prepare_autolabel_image(photo_path)
    if not prepared_image:
        return {"error": "Photo not found on disk."}

    tag_options = load_tag_options()
    schema, tag_id_by_label = build_autolabel_schema(tag_options)
    payload = {
        "model": OPENAI_AUTOLABEL_MODEL,
        "input": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": (
                            "Label this bridal dress image using ONLY the allowed English enum values. "
                            "Choose the single best value for silhouette, neckline, back_type, sleeve_type, and fabric. "
                            "For accessories choose zero or more clearly present options. "
                            'If uncertain set "needs_review" true and provide short notes. '
                            "Return only JSON matching the schema."
                        ),
                    },
                    {
                        "type": "input_image",
                        "image_url": prepared_image["data_url"],
                        "detail": "low",
                    },
                ],
            }
        ],
        "text": {
            "format": {
                "type": "json_schema",
                "name": "bridal_dress_tags",
                "strict": True,
                "schema": schema,
            }
        },
    }

    req = request.Request(
        OPENAI_RESPONSES_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with request.urlopen(req, timeout=60) as response:
            response_data = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        error_message = error.read().decode("utf-8")
        return {"error": f"OpenAI request failed: {error_message}"}
    except (URLError, TimeoutError) as error:
        return {"error": f"OpenAI request failed: {error}"}

    output_text = response_data.get("output_text")
    if not output_text and isinstance(response_data.get("output"), list):
        for item in response_data["output"]:
            for content in item.get("content", []):
                if content.get("type") == "output_text" and content.get("text"):
                    output_text = content["text"]
                    break
            if output_text:
                break

    try:
        model_output = json.loads(output_text or "{}")
    except json.JSONDecodeError:
        return {"error": "Unable to parse model JSON output."}

    selected_tags = map_autolabel_output_to_tag_ids(model_output, tag_id_by_label)
    usage = response_data.get("usage") or {}
    return {
        "tags": selected_tags,
        "model_output": model_output,
        "debug": {
            "model": OPENAI_AUTOLABEL_MODEL,
            "input_tokens": usage.get("input_tokens"),
            "output_tokens": usage.get("output_tokens"),
            "total_tokens": usage.get("total_tokens"),
            "sent_width": prepared_image["sent_width"],
            "sent_height": prepared_image["sent_height"],
            "original_width": prepared_image["original_width"],
            "original_height": prepared_image["original_height"],
            "mime_type": prepared_image["mime_type"],
        },
    }


def load_content() -> dict:
    with CONTENT_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def escape(value: str | None) -> str:
    if value is None:
        return ""
    return html.escape(str(value))


def resolve_image_src(src: str | None) -> str | None:
    if not src:
        return None
    source_path = Path(src)
    if source_path.suffix.lower() in {".png", ".jpg", ".jpeg"}:
        return src
    base = source_path.with_suffix("")
    for suffix in (".png", ".jpg", ".jpeg"):
        candidate = f"{base}{suffix}"
        if (BASE_DIR / candidate).exists():
            return candidate
    return None


def render_language_switcher(locales: dict, active_locale: str, base_path: str) -> str:
    links = []
    for key, locale in locales.items():
        label = escape(locale.get("label", key))
        active_class = " active" if key == active_locale else ""
        links.append(
            f'<a class="language-link{active_class}" href="{base_path}?lang={escape(key)}">{label}</a>'
        )
    return "".join(links)


def render_hero(copy: dict) -> str:
    highlights = "".join(
        f"<li>{escape(item)}</li>" for item in copy.get("highlights", [])
    )
    image = copy.get("image") or {}
    image_html = ""
    image_src = resolve_image_src(image.get("src"))
    if image_src:
        image_html = (
            f'<div class="hero-media">'
            f'<img src="{escape(image_src)}" '
            f'alt="{escape(image.get("alt"))}" loading="lazy" />'
            f"</div>"
        )
    return f"""
      <div class="container hero">
        <div>
          <p class="eyebrow">{escape(copy.get("eyebrow"))}</p>
          <h1>{escape(copy.get("title"))}</h1>
          <p class="lead">{escape(copy.get("subtitle"))}</p>
          <div class="cta-row">
            <a class="button" href="#">{escape(copy.get("primaryCta"))}</a>
            <a class="button secondary" href="#">{escape(copy.get("secondaryCta"))}</a>
          </div>
        </div>
        <div class="hero-card">
          {image_html}
          <h3>{escape(copy.get("mediaTitle"))}</h3>
          <p class="lead">{escape(copy.get("mediaText"))}</p>
          <ul class="steps">{highlights}</ul>
        </div>
      </div>
    """


def render_logo_cloud(copy: dict) -> str:
    logos = "".join(
        f'<div class="card">{escape(logo)}</div>' for logo in copy.get("logos", [])
    )
    return f"""
      <div class="container">
        <p class="eyebrow">{escape(copy.get("title"))}</p>
        <div class="card-grid">{logos}</div>
      </div>
    """


def render_feature_list(copy: dict) -> str:
    items = "".join(
        """
          <article class="card">
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        """.format(
            title=escape(item.get("title")),
            description=escape(item.get("description")),
        )
        for item in copy.get("items", [])
    )
    return f"""
      <div class="container">
        <p class="eyebrow">{escape(copy.get("eyebrow"))}</p>
        <h2>{escape(copy.get("title"))}</h2>
        <p class="lead">{escape(copy.get("subtitle"))}</p>
        <div class="card-grid">{items}</div>
      </div>
    """


def render_split(copy: dict) -> str:
    stats = "".join(
        """
          <div class="stat">
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        """.format(
            value=escape(stat.get("value")),
            label=escape(stat.get("label")),
        )
        for stat in copy.get("stats", [])
    )
    image = copy.get("image") or {}
    image_html = ""
    image_src = resolve_image_src(image.get("src"))
    if image_src:
        image_html = (
            f'<div class="split-media">'
            f'<img src="{escape(image_src)}" '
            f'alt="{escape(image.get("alt"))}" loading="lazy" />'
            f"</div>"
        )
    return f"""
      <div class="container split">
        <div>
          <p class="eyebrow">{escape(copy.get("eyebrow"))}</p>
          <h2>{escape(copy.get("title"))}</h2>
          <p class="lead">{escape(copy.get("description"))}</p>
          <div class="stat-grid">{stats}</div>
        </div>
        <div class="hero-card">
          <p class="eyebrow">{escape(copy.get("imageLabel"))}</p>
          {image_html}
          <div class="card-grid">
            <div class="card">
              <h3>Session</h3>
              <p>Ella · 3:00 PM · 12 gowns pre-loaded</p>
            </div>
            <div class="card">
              <h3>Top 10</h3>
              <p>Shared with bride + follow-up scheduled</p>
            </div>
          </div>
        </div>
      </div>
    """


def render_steps(copy: dict) -> str:
    steps = "".join(
        """
          <li>
            <strong>{index}. {title}</strong>
            <p>{description}</p>
          </li>
        """.format(
            index=index + 1,
            title=escape(step.get("title")),
            description=escape(step.get("description")),
        )
        for index, step in enumerate(copy.get("steps", []))
    )
    return f"""
      <div class="container">
        <p class="eyebrow">{escape(copy.get("eyebrow"))}</p>
        <h2>{escape(copy.get("title"))}</h2>
        <ol class="steps">{steps}</ol>
      </div>
    """


def render_testimonial(copy: dict) -> str:
    return f"""
      <div class="container">
        <div class="testimonial">
          <p class="quote">“{escape(copy.get("quote"))}”</p>
          <strong>{escape(copy.get("name"))}</strong>
          <p class="lead">{escape(copy.get("role"))}</p>
        </div>
      </div>
    """


def render_cta(copy: dict) -> str:
    return f"""
      <div class="container">
        <div class="hero-card">
          <h2>{escape(copy.get("title"))}</h2>
          <p class="lead">{escape(copy.get("subtitle"))}</p>
          <div class="cta-row">
            <a class="button" href="#">{escape(copy.get("primaryCta"))}</a>
            <a class="button secondary" href="#">{escape(copy.get("secondaryCta"))}</a>
          </div>
        </div>
      </div>
    """


def render_login(copy: dict) -> str:
    return f"""
      <div class="container login-shell">
        <div class="login-card">
          <p class="eyebrow">{escape(copy.get("eyebrow"))}</p>
          <h1>{escape(copy.get("title"))}</h1>
          <p class="lead">{escape(copy.get("subtitle"))}</p>
        </div>
        <div class="login-card auth-card" data-auth-card>
          <div class="auth-panel" data-auth-panel="login">
            <h2>{escape(copy.get("formTitle"))}</h2>
            <form class="store-form login-form" data-auth-form="login">
              <label>
                {escape(copy.get("usernameLabel"))}
                <input
                  type="text"
                  name="username"
                  placeholder="{escape(copy.get("usernamePlaceholder"))}"
                  autocomplete="username"
                  required
                />
              </label>
              <label>
                {escape(copy.get("passwordLabel"))}
                <input
                  type="password"
                  name="password"
                  placeholder="{escape(copy.get("passwordPlaceholder"))}"
                  autocomplete="current-password"
                  required
                />
              </label>
              <div class="login-actions">
                <button class="button" type="submit">{escape(copy.get("primaryButton"))}</button>
                <button class="text-link" type="button" data-auth-toggle="signup">
                  {escape(copy.get("supportButton"))}
                </button>
              </div>
              <p class="auth-message" data-auth-message role="status" aria-live="polite"></p>
            </form>
          </div>
          <div class="auth-panel is-hidden" data-auth-panel="signup">
            <h2>{escape(copy.get("supportTitle"))}</h2>
            <p class="lead">{escape(copy.get("supportBody"))}</p>
            <form class="store-form login-form" data-auth-form="signup">
              <label>
                {escape(copy.get("usernameLabel"))}
                <input
                  type="text"
                  name="username"
                  placeholder="{escape(copy.get("usernamePlaceholder"))}"
                  autocomplete="username"
                  required
                />
              </label>
              <label>
                {escape(copy.get("passwordLabel"))}
                <input
                  type="password"
                  name="password"
                  placeholder="{escape(copy.get("passwordPlaceholder"))}"
                  autocomplete="new-password"
                  required
                />
              </label>
              <div class="login-actions">
                <button class="button secondary" type="submit">
                  {escape(copy.get("supportButton"))}
                </button>
                <button class="text-link" type="button" data-auth-toggle="login">
                  {escape(copy.get("primaryButton"))}
                </button>
              </div>
              <p class="auth-message" data-auth-message role="status" aria-live="polite"></p>
            </form>
          </div>
        </div>
      </div>
    """


def render_dashboard(copy: dict) -> str:
    stores = copy.get("stores", [])
    store_tiles = []
    store_tiles.append(
        """
          <a class="store-tile add-tile" href="#create-store" aria-label="Create a new store">
            <span class="store-plus">+</span>
            <span class="store-label">{create_label}</span>
          </a>
        """.format(
            create_label=escape(copy.get("createLabel")),
        )
    )
    for store in stores:
        store_tiles.append(
            """
              <button
                class="store-tile"
                type="button"
                data-name="{name}"
                data-location="{location}"
                data-manager="{manager}"
                data-invite="{invite}"
                data-photo-url="{photo_url}"
                data-photo-urls='{photo_urls}'
                data-store-id="{store_id}"
              >
                <span class="store-name">{name}</span>
                <span class="store-location">{location}</span>
              </button>
            """.format(
                name=escape(store.get("name")),
                location=escape(store.get("location")),
                manager=escape(store.get("manager")),
                invite=escape(store.get("inviteCode")),
                photo_url=escape(store.get("photoUrl") or get_default_dress_photo_path()),
                photo_urls=escape(json.dumps(store.get("dress_photo_urls") or [])),
                store_id=escape(store.get("id")),
            )
        )
    tiles_html = "\n".join(store_tiles)
    return f"""
      <div class="container dashboard" id="dashboard">
        <div class="dashboard-header">
          <div>
            <p class="eyebrow">{escape(copy.get("eyebrow"))}</p>
            <h2>{escape(copy.get("title"))}</h2>
            <p class="lead">{escape(copy.get("subtitle"))}</p>
          </div>
          <div class="dashboard-note">
            <p><strong>{escape(copy.get("noteTitle"))}</strong></p>
            <p>{escape(copy.get("noteBody"))}</p>
          </div>
        </div>
        <div class="dashboard-grid">
          <div class="dashboard-panel">
            <h3>{escape(copy.get("storesTitle"))}</h3>
            <div class="store-grid">{tiles_html}</div>
          </div>
          <div class="dashboard-panel detail-panel">
            <h3>{escape(copy.get("detailTitle"))}</h3>
            <div
              class="store-detail"
              data-empty-text="{escape(copy.get("detailEmpty"))}"
            >
              <p class="store-detail-name" data-store-overview-name>
                {escape(copy.get("detailEmpty"))}
              </p>
              <p class="store-detail-location" data-store-overview-address></p>
              <p class="store-detail-meta" data-store-overview-photo-count></p>
              <a class="button secondary is-disabled" href="#" data-store-details-link>
                {escape(copy.get("detailsButton") or "Go to store details")}
              </a>
              <a class="button" href="/session">
                {escape(copy.get("sessionButton") or "Start Session")}
              </a>
            </div>
          </div>
        </div>
        <div class="dashboard-actions">
          <div class="dashboard-panel" id="create-store">
            <h3>{escape(copy.get("createTitle"))}</h3>
            <p class="lead">{escape(copy.get("createDescription"))}</p>
            <form class="store-form" data-store-form>
              <label>
                {escape(copy.get("createNameLabel"))}
                <input
                  type="text"
                  placeholder="{escape(copy.get("createNamePlaceholder"))}"
                  data-store-name
                  required
                />
              </label>
              <label>
                {escape(copy.get("createLocationLabel"))}
                <input
                  type="text"
                  placeholder="{escape(copy.get("createLocationPlaceholder"))}"
                  data-store-location
                  required
                />
              </label>
              <button class="button" type="button" data-store-submit>
                {escape(copy.get("createButton"))}
              </button>
              <p
                class="auth-message form-message"
                data-store-message
                role="status"
                aria-live="polite"
              ></p>
            </form>
          </div>
          <div class="dashboard-panel">
            <h3>{escape(copy.get("joinTitle"))}</h3>
            <p class="lead">{escape(copy.get("joinDescription"))}</p>
            <form class="store-form" data-store-join-form>
              <label>
                {escape(copy.get("joinLabel"))}
                <input
                  type="text"
                  placeholder="{escape(copy.get("joinPlaceholder"))}"
                  data-store-join-code
                  required
                />
              </label>
              <button class="button secondary" type="button" data-store-join-submit>
                {escape(copy.get("joinButton"))}
              </button>
              <p
                class="auth-message form-message"
                data-store-join-message
                role="status"
                aria-live="polite"
              ></p>
            </form>
          </div>
        </div>
      </div>
    """


def render_session(copy: dict) -> str:
    return f"""
      <div class="container dashboard" id="session-route">
        <div class="dashboard-header">
          <div>
            <p class="eyebrow">{escape(copy.get("eyebrow") or "Session launcher")}</p>
            <h2>{escape(copy.get("title") or "Start Session")}</h2>
            <p class="lead">{escape(copy.get("subtitle") or "Pick a store to launch a bridal swipe session.")}</p>
          </div>
        </div>
        <div class="dashboard-panel">
          <h3>{escape(copy.get("storesTitle") or "Choose your store")}</h3>
          <p class="store-detail-location" data-session-route-message></p>
          <div class="store-grid" data-session-route-grid></div>
        </div>
      </div>
    """


def render_store_details(copy: dict) -> str:
    return f"""
      <div class="container store-details-page bridal-shell">
        <aside class="bridal-sidebar">
          <div class="bridal-sidebar-brand">
            <span class="bridal-brand-badge">WL</span>
            <span>{escape(copy.get("brandName") or "White Lace Bridal")}</span>
          </div>
          <nav class="bridal-sidebar-nav">
            <button class="bridal-nav-item is-active" type="button" data-mobile-tab="management">Dashboard</button>
            <button class="bridal-nav-item" type="button" data-mobile-tab="session">Start Session</button>
            <button class="bridal-nav-item" type="button" data-mobile-tab="inventory">Inventory</button>
            <a class="bridal-nav-item" href="#">Studio Settings</a>
            <a class="bridal-nav-item" href="#">Team &amp; Store</a>
          </nav>
        </aside>

        <div class="bridal-main">
          <header class="bridal-topbar">
            <div>
              <p class="eyebrow">{escape(copy.get("eyebrow") or "Store management")}</p>
              <h2>{escape(copy.get("title") or "Welcome back, Anna")}</h2>
            </div>
            <div class="bridal-topbar-actions">
              <span class="bridal-pill">{escape(copy.get("brandName") or "White Lace Bridal")}</span>
              <span class="bridal-avatar">👰</span>
            </div>
          </header>

          <div class="mobile-app-shell" data-mobile-app-shell>
            <div class="mobile-app-panel" data-mobile-panel="management">
              <section class="dashboard-panel bridal-hero-panel">
                <div>
                  <h3>{escape(copy.get("sessionTitle") or "Start a New Bridal Session")}</h3>
                  <p class="lead">{escape(copy.get("subtitle") or "Guide a bride through your beautiful dresses.")}</p>
                  <button class="button" type="button" data-start-session-button>Start Session</button>
                </div>
                <img src="/images/hero.svg" alt="Bridal consultant helping a bride" />
              </section>

              <div class="bridal-card-row">
                <div class="dashboard-panel bridal-mini-card">
                  <h3>{escape(copy.get("galleryTitle") or "Manage Inventory")}</h3>
                  <p class="store-detail-location" data-store-details-photo-count>248 dresses available</p>
                </div>
                <div class="dashboard-panel bridal-mini-card">
                  <h3>{escape(copy.get("metadataTitle") or "Upload Studio Defaults")}</h3>
                  <p class="store-detail-location">10 reference photos set</p>
                </div>
                <div class="dashboard-panel bridal-mini-card">
                  <h3>Invite Team Members</h3>
                  <p class="store-detail-location">5 active stylists</p>
                </div>
              </div>

              <div class="dashboard-panel store-detail">
                <h3>{escape(copy.get("detailTitle") or "Store details")}</h3>
                <p class="store-detail-name" data-store-details-name>
                  {escape(copy.get("empty") or "Select a store from the overview first.")}
                </p>
                <p class="store-detail-location" data-store-details-address></p>
                <p class="store-detail-meta" data-store-details-owner></p>
                <p class="store-detail-meta" data-store-details-invite></p>
                <p class="store-detail-meta" data-store-details-created></p>
              </div>
            </div>

            <div class="mobile-app-panel is-hidden" data-mobile-panel="inventory">
              <div class="dashboard-panel dress-preview-panel">
                <h3>{escape(copy.get("galleryTitle") or "Manage Inventory")}</h3>
                <p class="store-detail-location">Select a miniature to preview and tag it, then upload or remove dresses as needed.</p>
                <img class="dress-preview-image is-hidden" data-dress-preview-image alt="Detailed dress preview" />
                <div class="dress-photo-grid" data-dress-miniatures></div>
              </div>

              <div class="dashboard-panel bridal-form-grid">
                <section>
                  <h3>{escape(copy.get("photoTitle") or "Upload bridal dress photos")}</h3>
                  <form class="store-form" data-dress-photo-form>
                    <label>
                      {escape(copy.get("photoUploadLabel") or "Dress photo")}
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp"
                        multiple
                        data-dress-photo-input
                      />
                    </label>
                    <button class="button secondary" type="submit" data-dress-photo-submit>
                      {escape(copy.get("photoUploadButton") or "Upload photo")}
                    </button>
                    <p
                      class="auth-message form-message"
                      data-dress-photo-message
                      role="status"
                      aria-live="polite"
                    ></p>
                  </form>
                </section>

                <section>
                  <h3>{escape(copy.get("metadataTitle") or "Dress metadata")}</h3>
                  <form class="store-form" data-dress-metadata-form>
                    <label>
                      {escape(copy.get("metadataPriceLabel") or "Price")}
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="{escape(copy.get('metadataPricePlaceholder') or 'e.g. 1299.00')}"
                        data-dress-price-input
                      />
                    </label>
                    <div class="dress-tag-options" data-dress-tag-options></div>
                    <button class="button secondary" type="button" data-dress-autolabel-button>
                      Autolabel
                    </button>
                    <button class="button secondary" type="submit" data-dress-metadata-submit>
                      {escape(copy.get("metadataSaveButton") or "Save metadata")}
                    </button>
                    <p class="auth-message form-message" data-dress-metadata-message role="status" aria-live="polite"></p>
                  </form>
                </section>
              </div>
            </div>

            <div class="mobile-app-panel is-hidden" data-mobile-panel="session">
              <div class="dashboard-panel session-panel" data-swipe-session-panel>
                <div class="session-panel-header">
                  <div>
                    <h3>{escape(copy.get("sessionTitle") or "Default Session")}</h3>
                    <p class="lead">{escape(copy.get("sessionSubtitle") or "Start a quick like/dislike swiping session from your default dress folder.")}</p>
                  </div>
                </div>
              <div class="session-store-picker is-hidden" data-session-store-picker>
                <label>
                  For what store would you like to initiate a session?
                  <select data-session-store-select></select>
                </label>
                <button class="button secondary" type="button" data-session-store-confirm>Use this store</button>
              </div>
              <p class="auth-message form-message" data-session-message role="status" aria-live="polite"></p>
              <div class="swipe-workspace is-hidden" data-swipe-workspace>
                <div class="swipe-card" data-swipe-card>
                  <span class="swipe-chip" data-swipe-category-chip></span>
                  <img class="swipe-image" data-swipe-image alt="Dress session photo" />
                  <p class="swipe-caption" data-swipe-caption></p>
                </div>
                <div class="swipe-actions">
                  <button class="button secondary swipe-action" type="button" data-swipe-dislike>
                    ← Dislike
                  </button>
                  <button class="button swipe-action" type="button" data-swipe-like>
                    Like →
                  </button>
                </div>
                <p class="store-detail-meta" data-swipe-progress></p>
                <p class="store-detail-meta" data-swipe-selected-tags></p>
              </div>
              <div class="session-results is-hidden" data-session-results>
                <h4>Session Insights</h4>
                <p class="store-detail-location">Review preference signals and ranked in-stock matches for this bride.</p>
                <div class="session-results-tabs" role="tablist" aria-label="Session result tabs">
                  <button class="session-results-tab is-active" type="button" role="tab" aria-selected="true" data-session-results-tab="insights">
                    Tag insights
                  </button>
                  <button class="session-results-tab" type="button" role="tab" aria-selected="false" data-session-results-tab="ranking">
                    Dress ranking
                  </button>
                </div>
                <div class="session-results-panel" data-session-results-panel="insights">
                  <div class="session-bars" data-session-bars></div>
                </div>
                <div class="session-results-panel is-hidden" data-session-results-panel="ranking">
                  <div class="session-ranking" data-session-ranking>
                    <div class="session-ranking-viewer">
                      <img class="session-ranking-image" data-session-ranking-image alt="Ranked dress preview" />
                    </div>
                    <div class="session-ranking-actions">
                      <button class="button secondary" type="button" data-session-ranking-prev>←</button>
                      <button class="button secondary" type="button" data-session-ranking-next>→</button>
                    </div>
                    <p class="store-detail-meta" data-session-ranking-position></p>
                    <p class="store-detail-location" data-session-ranking-caption></p>
                    <p class="store-detail-location" data-session-ranking-score></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

            <nav class="mobile-bottom-tabs" aria-label="Store workflow tabs">
              <button class="mobile-bottom-tab is-active" type="button" data-mobile-tab="management">Dashboard</button>
              <button class="mobile-bottom-tab" type="button" data-mobile-tab="session">Start Session</button>
              <button class="mobile-bottom-tab" type="button" data-mobile-tab="inventory">Inventory</button>
            </nav>
          </div>
        </div>
      </div>
    """


def render_admin(copy: dict) -> str:
    return f"""
      <div class="container store-details-page">
        <div class="dashboard-header">
          <div>
            <p class="eyebrow">{escape(copy.get("eyebrow") or "Admin")}</p>
            <h2>{escape(copy.get("title") or "Default dress tag manager")}</h2>
            <p class="lead">{escape(copy.get("subtitle") or "Tag every default dress once and reuse labels in every session.")}</p>
          </div>
        </div>
        <div class="dashboard-panel">
          <h3>{escape(copy.get("gridTitle") or "Default dress library")}</h3>
          <p class="store-detail-location">{escape(copy.get("gridSubtitle") or "Changes are shared across all stores.")}</p>
          <p class="auth-message form-message" data-admin-message role="status" aria-live="polite"></p>
          <div class="admin-grid" data-admin-grid></div>
        </div>
      </div>
    """


def render_footer(copy: dict) -> str:
    links = "".join(
        f'<a href="#">{escape(link)}</a>' for link in copy.get("links", [])
    )
    return f"""
      <div class="container footer">
        <strong>{escape(copy.get("title"))}</strong>
        <p>{escape(copy.get("description"))}</p>
        <div class="footer-links">{links}</div>
      </div>
    """


RENDERERS = {
    "hero": render_hero,
    "logoCloud": render_logo_cloud,
    "featureList": render_feature_list,
    "split": render_split,
    "steps": render_steps,
    "testimonial": render_testimonial,
    "cta": render_cta,
    "login": render_login,
    "dashboard": render_dashboard,
    "storeDetails": render_store_details,
    "session": render_session,
    "admin": render_admin,
    "footer": render_footer,
}


def build_sections(content: dict, locale: str, page_id: str) -> str:
    sections = []
    default_locale = content.get("defaultLocale")
    page_blocks = content.get("pages", {}).get(page_id)
    for block in content.get("blocks", []):
        if page_blocks and block.get("id") not in page_blocks:
            continue
        copy = block.get("content", {}).get(locale) or block.get("content", {}).get(
            default_locale
        )
        renderer = RENDERERS.get(block.get("type"))
        if not copy or not renderer:
            continue
        theme_class = " section alt" if block.get("theme") == "alt" else " section"
        section_html = renderer(copy)
        sections.append(f"<section class=\"{theme_class.strip()}\">{section_html}</section>")
    return "".join(sections)


def render_page(locale: str, page_id: str) -> str:
    content = load_content()
    default_locale = content.get("defaultLocale")
    if locale not in content.get("locales", {}):
        locale = default_locale
    base_path = "/" if page_id == "landing" else f"/{page_id}"
    language_switcher = render_language_switcher(content.get("locales", {}), locale, base_path)
    sections = build_sections(content, locale, page_id)
    page_titles = {
        "landing": "Bridal Studio Sessions — Dress Shop Platform",
        "login": "Log in — Bridal Studio Sessions",
        "stores": "Stores — Bridal Studio Sessions",
        "store-details": "Store Details — Bridal Studio Sessions",
        "session": "Start Session — Bridal Studio Sessions",
        "admin": "Admin — Bridal Studio Sessions",
    }
    page_title = page_titles.get(page_id, page_titles["landing"])
    template_text = TEMPLATE_PATH.read_text(encoding="utf-8")
    template = Template(template_text)
    return template.safe_substitute(
        page_title=page_title,
        language_switcher=language_switcher,
        sections=sections,
        html_lang=locale,
    )


class LandingHandler(SimpleHTTPRequestHandler):
    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        autolabel_match = re.fullmatch(r"/api/stores/(\d+)/dress-photo-autolabel", parsed.path)
        if autolabel_match:
            store_id = int(autolabel_match.group(1))
            store = fetch_store_by_id(store_id)
            if not store:
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Store not found."}).encode("utf-8"))
                return
            try:
                length = int(self.headers.get("Content-Length", "0"))
            except ValueError:
                length = 0
            payload = self.rfile.read(length).decode("utf-8") if length else ""
            try:
                data = json.loads(payload) if payload else {}
            except json.JSONDecodeError:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Invalid JSON payload."}).encode("utf-8"))
                return

            owner_email = (data.get("owner_email") or "").strip().lower()
            if owner_email != (store.get("owner_email") or "").strip().lower():
                self.send_response(403)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(
                    json.dumps({"error": "Only the store owner can autolabel dress metadata."}).encode("utf-8")
                )
                return

            photo_path = (data.get("photo_path") or "").strip()
            matching_photo = next(
                (photo for photo in (store.get("dress_photos") or []) if photo.get("photo_path") == photo_path),
                None,
            )
            if not matching_photo:
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Photo not found for this store."}).encode("utf-8"))
                return

            result = run_openai_autolabel(photo_path)
            if result.get("error"):
                self.send_response(502)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": result["error"]}).encode("utf-8"))
                return

            updated = update_store_dress_photo_metadata(
                store_id=store_id,
                photo_path=photo_path,
                price=matching_photo.get("price"),
                tags=result.get("tags") or [],
            )
            if not updated:
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Photo not found."}).encode("utf-8"))
                return

            updated_store = fetch_store_by_id(store_id)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(
                json.dumps(
                    {
                        "store": updated_store,
                        "debug": result.get("debug") or {},
                        "model_output": result.get("model_output") or {},
                    }
                ).encode("utf-8")
            )
            return

        dress_photo_match = re.fullmatch(r"/api/stores/(\d+)/dress-photo", parsed.path)
        if dress_photo_match:
            store_id = int(dress_photo_match.group(1))
            store = fetch_store_by_id(store_id)
            if not store:
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Store not found."}).encode("utf-8"))
                return
            content_type = self.headers.get("Content-Type") or ""
            if "multipart/form-data" not in content_type:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(
                    json.dumps({"error": "multipart/form-data is required."}).encode("utf-8")
                )
                return

            form = FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={
                    "REQUEST_METHOD": "POST",
                    "CONTENT_TYPE": content_type,
                    "CONTENT_LENGTH": self.headers.get("Content-Length", "0"),
                },
            )
            uploads = form["dress_photo"] if "dress_photo" in form else None
            owner_email = (
                form["owner_email"].value.strip().lower()
                if "owner_email" in form and getattr(form["owner_email"], "value", "")
                else ""
            )
            if owner_email != (store.get("owner_email") or "").strip().lower():
                self.send_response(403)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(
                    json.dumps(
                        {"error": "Only the store owner can upload dress photos."}
                    ).encode("utf-8")
                )
                return
            upload_items = uploads if isinstance(uploads, list) else [uploads] if uploads else []
            valid_uploads = [
                upload
                for upload in upload_items
                if upload is not None and getattr(upload, "filename", "")
            ]
            if not valid_uploads:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(
                    json.dumps({"error": "dress_photo is required."}).encode("utf-8")
                )
                return
            for upload in valid_uploads:
                content = upload.file.read() if upload.file else b""
                if not content:
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(
                        json.dumps({"error": "Uploaded file is empty."}).encode("utf-8")
                    )
                    return
                photo_path = save_store_dress_photo(store_id, upload.filename, content)
                if not photo_path:
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(
                        json.dumps(
                            {
                                "error": "Only .png, .jpg, .jpeg, and .webp files are supported.",
                            }
                        ).encode("utf-8")
                    )
                    return
            updated_store = fetch_store_by_id(store_id)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(updated_store).encode("utf-8"))
            return

        if parsed.path == "/api/stores":
            try:
                length = int(self.headers.get("Content-Length", "0"))
            except ValueError:
                length = 0
            payload = self.rfile.read(length).decode("utf-8") if length else ""
            try:
                data = json.loads(payload) if payload else {}
            except json.JSONDecodeError:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(
                    json.dumps({"error": "Invalid JSON payload."}).encode("utf-8")
                )
                return

            name = (data.get("name") or "").strip()
            location = (data.get("location") or "").strip()
            owner_email = (data.get("owner_email") or "").strip().lower()
            if not name or not location or not owner_email:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(
                    json.dumps(
                        {"error": "name, location, and owner_email are required."}
                    ).encode("utf-8")
                )
                return

            store = create_store(name, location, owner_email)
            self.send_response(201)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(store).encode("utf-8"))
            return
        if parsed.path == "/api/stores/join":
            try:
                length = int(self.headers.get("Content-Length", "0"))
            except ValueError:
                length = 0
            payload = self.rfile.read(length).decode("utf-8") if length else ""
            try:
                data = json.loads(payload) if payload else {}
            except json.JSONDecodeError:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(
                    json.dumps({"error": "Invalid JSON payload."}).encode("utf-8")
                )
                return

            invite_code = (data.get("invite_code") or "").strip().upper()
            member_email = (data.get("member_email") or "").strip().lower()
            if not invite_code or not member_email:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(
                    json.dumps(
                        {"error": "invite_code and member_email are required."}
                    ).encode("utf-8")
                )
                return

            store = join_store(invite_code, member_email)
            if not store:
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(
                    json.dumps({"error": "Invite code not found."}).encode("utf-8")
                )
                return

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(store).encode("utf-8"))
            return

        self.send_response(404)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Not found."}).encode("utf-8"))

    def do_PUT(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/default-dress-metadata":
            try:
                length = int(self.headers.get("Content-Length", "0"))
            except ValueError:
                length = 0
            payload = self.rfile.read(length).decode("utf-8") if length else ""
            try:
                data = json.loads(payload) if payload else {}
            except json.JSONDecodeError:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Invalid JSON payload."}).encode("utf-8"))
                return

            photo_path = (data.get("photo_path") or "").strip()
            raw_tags = data.get("tags")
            if raw_tags is None:
                raw_tags = []
            if not isinstance(raw_tags, list):
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "tags must be an array."}).encode("utf-8"))
                return
            tags = [str(tag).strip() for tag in raw_tags if str(tag).strip()]

            updated = update_default_dress_metadata(photo_path, tags)
            if not updated:
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Default photo not found."}).encode("utf-8"))
                return

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"photos": fetch_default_dress_metadata()}).encode("utf-8"))
            return

        metadata_match = re.fullmatch(r"/api/stores/(\d+)/dress-photo-metadata", parsed.path)
        if not metadata_match:
            self.send_response(404)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Not found."}).encode("utf-8"))
            return

        store_id = int(metadata_match.group(1))
        store = fetch_store_by_id(store_id)
        if not store:
            self.send_response(404)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Store not found."}).encode("utf-8"))
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        payload = self.rfile.read(length).decode("utf-8") if length else ""
        try:
            data = json.loads(payload) if payload else {}
        except json.JSONDecodeError:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Invalid JSON payload."}).encode("utf-8"))
            return

        owner_email = (data.get("owner_email") or "").strip().lower()
        if owner_email != (store.get("owner_email") or "").strip().lower():
            self.send_response(403)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(
                json.dumps({"error": "Only the store owner can update dress metadata."}).encode("utf-8")
            )
            return

        photo_path = (data.get("photo_path") or "").strip()
        raw_tags = data.get("tags")
        if raw_tags is None:
            raw_tags = []
        if not isinstance(raw_tags, list):
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "tags must be an array."}).encode("utf-8"))
            return
        tags = [str(tag).strip() for tag in raw_tags if str(tag).strip()]

        raw_price = data.get("price")
        price = None
        if raw_price not in (None, ""):
            try:
                price = float(raw_price)
            except (TypeError, ValueError):
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "price must be a number."}).encode("utf-8"))
                return
            if price < 0:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "price must be positive."}).encode("utf-8"))
                return

        updated = update_store_dress_photo_metadata(store_id, photo_path, price, tags)
        if not updated:
            self.send_response(404)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Photo not found."}).encode("utf-8"))
            return

        updated_store = fetch_store_by_id(store_id)
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(updated_store).encode("utf-8"))

    def do_DELETE(self) -> None:
        parsed = urlparse(self.path)
        dress_photo_match = re.fullmatch(r"/api/stores/(\d+)/dress-photo", parsed.path)
        if dress_photo_match:
            store_id = int(dress_photo_match.group(1))
            store = fetch_store_by_id(store_id)
            if not store:
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Store not found."}).encode("utf-8"))
                return

            try:
                length = int(self.headers.get("Content-Length", "0"))
            except ValueError:
                length = 0
            payload = self.rfile.read(length).decode("utf-8") if length else ""
            try:
                data = json.loads(payload) if payload else {}
            except json.JSONDecodeError:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(
                    json.dumps({"error": "Invalid JSON payload."}).encode("utf-8")
                )
                return

            owner_email = (data.get("owner_email") or "").strip().lower()
            photo_path = (data.get("photo_path") or "").strip()
            if owner_email != (store.get("owner_email") or "").strip().lower():
                self.send_response(403)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(
                    json.dumps(
                        {"error": "Only the store owner can remove dress photos."}
                    ).encode("utf-8")
                )
                return
            if not photo_path:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(
                    json.dumps({"error": "photo_path is required."}).encode("utf-8")
                )
                return

            removed = remove_store_dress_photo(store_id, photo_path)
            if not removed:
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(
                    json.dumps({"error": "Photo not found."}).encode("utf-8")
                )
                return

            updated_store = fetch_store_by_id(store_id)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(updated_store).encode("utf-8"))
            return

        self.send_response(404)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Not found."}).encode("utf-8"))

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/default-dress-photos":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"photos": list_default_dress_photos()}).encode("utf-8"))
            return
        if parsed.path == "/api/default-dress-metadata":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"photos": fetch_default_dress_metadata()}).encode("utf-8"))
            return
        if parsed.path == "/api/tag-options":
            try:
                options = load_tag_options()
            except (FileNotFoundError, json.JSONDecodeError):
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(
                    json.dumps({"error": "Tag options are unavailable."}).encode("utf-8")
                )
                return
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(options).encode("utf-8"))
            return
        if parsed.path == "/api/stores":
            query = parse_qs(parsed.query)
            owner_email = (query.get("owner", [""])[0]).strip().lower()
            if not owner_email:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(
                    json.dumps({"error": "owner query param is required."}).encode("utf-8")
                )
                return
            stores = fetch_stores(owner_email)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"stores": stores}).encode("utf-8"))
            return
        if parsed.path in {"", "/"}:
            query = parse_qs(parsed.query)
            locale = query.get("lang", [""])[0]
            page = render_page(locale, "landing")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(page.encode("utf-8"))
            return
        if parsed.path in {"/login", "/login/"}:
            query = parse_qs(parsed.query)
            locale = query.get("lang", [""])[0]
            page = render_page(locale, "login")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(page.encode("utf-8"))
            return
        if parsed.path in {"/stores", "/stores/"}:
            query = parse_qs(parsed.query)
            locale = query.get("lang", [""])[0]
            page = render_page(locale, "stores")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(page.encode("utf-8"))
            return
        if parsed.path in {"/admin", "/admin/"}:
            query = parse_qs(parsed.query)
            locale = query.get("lang", [""])[0]
            page = render_page(locale, "admin")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(page.encode("utf-8"))
            return
        if parsed.path in {"/session", "/session/"}:
            query = parse_qs(parsed.query)
            locale = query.get("lang", [""])[0]
            page = render_page(locale, "session")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(page.encode("utf-8"))
            return
        if parsed.path in {"/stores/details", "/stores/details/"}:
            query = parse_qs(parsed.query)
            locale = query.get("lang", [""])[0]
            page = render_page(locale, "store-details")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(page.encode("utf-8"))
            return
        if parsed.path in {"/details", "/details/"}:
            query = parse_qs(parsed.query)
            locale = query.get("lang", [""])[0]
            page = render_page(locale, "store-details")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(page.encode("utf-8"))
            return
        super().do_GET()


def run(port: int) -> None:
    init_db()
    with TCPServer(("", port), LandingHandler) as httpd:
        print(f"Landing page running at http://localhost:{port}")
        httpd.serve_forever()


if __name__ == "__main__":
    run(port=8000)
