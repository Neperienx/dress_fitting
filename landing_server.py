#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import secrets
import sqlite3
from cgi import FieldStorage
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler
from pathlib import Path
import re
from socketserver import TCPServer
from string import Template
from urllib.parse import parse_qs, urlparse

BASE_DIR = Path(__file__).resolve().parent
CONTENT_PATH = BASE_DIR / "landing-content.json"
TEMPLATE_PATH = BASE_DIR / "index.html"
DB_PATH = BASE_DIR / "stores.db"
DEFAULT_DRESS_PHOTO_PATH = "images/default-dress.svg"
STORE_DRESS_PHOTO_DIR = BASE_DIR / "images" / "store_dresses"
ALLOWED_DRESS_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}


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
              created_at TEXT NOT NULL,
              FOREIGN KEY(store_id) REFERENCES stores(id)
            )
            """
        )


def generate_invite_code() -> str:
    return secrets.token_hex(3).upper()


def normalize_photo_path(photo_path: str | None) -> str:
    if photo_path:
        return photo_path
    return DEFAULT_DRESS_PHOTO_PATH


def normalize_store_payload(store: dict) -> dict:
    payload = dict(store)
    dress_photo_urls = payload.get("dress_photo_urls") or []
    if not dress_photo_urls and payload.get("dress_photo_path"):
        dress_photo_urls = [payload.get("dress_photo_path")]
    payload["dress_photo_urls"] = dress_photo_urls
    payload["dress_photo_url"] = normalize_photo_path(
        dress_photo_urls[0] if dress_photo_urls else payload.get("dress_photo_path")
    )
    return payload


def fetch_store_dress_photos(conn: sqlite3.Connection, store_id: int) -> list[str]:
    rows = conn.execute(
        """
        SELECT photo_path
        FROM store_dress_photos
        WHERE store_id = ?
        ORDER BY created_at DESC, id DESC
        """,
        (store_id,),
    ).fetchall()
    return [row[0] for row in rows]


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
            store["dress_photo_urls"] = fetch_store_dress_photos(conn, store["id"])
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
        "dress_photo_url": DEFAULT_DRESS_PHOTO_PATH,
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
        normalized_store["dress_photo_urls"] = fetch_store_dress_photos(
            conn, normalized_store["id"]
        )
    return normalize_store_payload(normalized_store)


def save_store_dress_photo(store_id: int, filename: str, content: bytes) -> str | None:
    extension = Path(filename).suffix.lower()
    if extension not in ALLOWED_DRESS_EXTENSIONS:
        return None
    STORE_DRESS_PHOTO_DIR.mkdir(parents=True, exist_ok=True)
    unique_suffix = secrets.token_hex(8)
    relative_path = Path("images") / "store_dresses" / f"store-{store_id}-{unique_suffix}{extension}"
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
        payload["dress_photo_urls"] = fetch_store_dress_photos(conn, store_id)
    return normalize_store_payload(payload)


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
                photo_url=escape(store.get("photoUrl") or DEFAULT_DRESS_PHOTO_PATH),
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


def render_store_details(copy: dict) -> str:
    return f"""
      <div class="container store-details-page">
        <div class="dashboard-header">
          <div>
            <p class="eyebrow">{escape(copy.get("eyebrow") or "Store management")}</p>
            <h2>{escape(copy.get("title") or "Store details")}</h2>
            <p class="lead">{escape(copy.get("subtitle") or "Manage your store and dress photos in one place.")}</p>
          </div>
        </div>

        <div class="dashboard-panel store-detail">
          <p class="store-detail-name" data-store-details-name>
            {escape(copy.get("empty") or "Select a store from the overview first.")}
          </p>
          <p class="store-detail-location" data-store-details-address></p>
          <p class="store-detail-meta" data-store-details-photo-count></p>
        </div>

        <div class="dashboard-panel">
          <h3>{escape(copy.get("photoTitle") or "Upload bridal dress photos")}</h3>
          <form class="store-form" data-dress-photo-form>
            <label>
              {escape(copy.get("photoUploadLabel") or "Dress photo")}
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
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
        </div>

        <div class="dashboard-panel">
          <h3>{escape(copy.get("galleryTitle") or "Dress photo gallery")}</h3>
          <div class="dress-photo-grid" data-dress-miniatures></div>
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
            upload = form["dress_photo"] if "dress_photo" in form else None
            if upload is None or not getattr(upload, "filename", ""):
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(
                    json.dumps({"error": "dress_photo is required."}).encode("utf-8")
                )
                return
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

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
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
        if parsed.path in {"/stores/details", "/stores/details/"}:
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
