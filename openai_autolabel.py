from __future__ import annotations

import base64
import json
from io import BytesIO
from pathlib import Path
from urllib import request
from urllib.error import HTTPError, URLError

from PIL import Image

OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"
OPENAI_AUTOLABEL_MODEL = "gpt-4.1-nano"
AUTOLABEL_MAX_DIMENSION = 768
AUTOLABEL_JPEG_QUALITY = 75


def get_openai_api_key(key_path: Path) -> str:
    if not key_path.exists():
        return ""
    return key_path.read_text(encoding="utf-8").strip()


def prepare_autolabel_image(photo_path: str, base_dir: Path) -> dict | None:
    source_path = base_dir / photo_path
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
            "notes",
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


def run_openai_autolabel(photo_path: str, base_dir: Path, openai_key_path: Path, tag_options: dict) -> dict:
    debug_info = {
        "model": OPENAI_AUTOLABEL_MODEL,
        "photo_path": photo_path,
    }
    api_key = get_openai_api_key(openai_key_path)
    if not api_key:
        return {
            "error": "OpenAI key missing. Add key.txt with your API key.",
            "debug": {**debug_info, "stage": "config", "reason": "missing_api_key"},
        }

    prepared_image = prepare_autolabel_image(photo_path, base_dir)
    if not prepared_image:
        return {
            "error": "Photo not found on disk.",
            "debug": {**debug_info, "stage": "prepare_image", "reason": "photo_not_found"},
        }
    debug_info.update(
        {
            "sent_width": prepared_image["sent_width"],
            "sent_height": prepared_image["sent_height"],
            "original_width": prepared_image["original_width"],
            "original_height": prepared_image["original_height"],
            "mime_type": prepared_image["mime_type"],
        }
    )

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
                            'If confident set "needs_review" false and set "notes" to an empty string. '
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
        return {
            "error": f"OpenAI request failed (HTTP {error.code}).",
            "debug": {
                **debug_info,
                "stage": "openai_request",
                "http_status": error.code,
                "openai_error": error_message,
            },
        }
    except (URLError, TimeoutError) as error:
        return {
            "error": "OpenAI request failed due to network/timeout error.",
            "debug": {
                **debug_info,
                "stage": "openai_request",
                "reason": type(error).__name__,
                "details": str(error),
            },
        }
    except Exception as error:
        return {
            "error": "Autolabel failed before receiving a model response.",
            "debug": {
                **debug_info,
                "stage": "openai_request",
                "reason": type(error).__name__,
                "details": str(error),
            },
        }

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
        return {
            "error": "Unable to parse model JSON output.",
            "debug": {
                **debug_info,
                "stage": "parse_model_output",
                "output_text_preview": (output_text or "")[:500],
            },
        }

    selected_tags = map_autolabel_output_to_tag_ids(model_output, tag_id_by_label)
    usage = response_data.get("usage") or {}
    return {
        "tags": selected_tags,
        "model_output": model_output,
        "debug": {
            **debug_info,
            "input_tokens": usage.get("input_tokens"),
            "output_tokens": usage.get("output_tokens"),
            "total_tokens": usage.get("total_tokens"),
            "stage": "success",
        },
    }
