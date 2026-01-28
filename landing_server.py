#!/usr/bin/env python3
from __future__ import annotations

import html
import json
from http.server import SimpleHTTPRequestHandler
from pathlib import Path
from socketserver import TCPServer
from string import Template
from urllib.parse import parse_qs, urlparse

BASE_DIR = Path(__file__).resolve().parent
CONTENT_PATH = BASE_DIR / "landing-content.json"
TEMPLATE_PATH = BASE_DIR / "index.html"


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


def render_language_switcher(locales: dict, active_locale: str) -> str:
    links = []
    for key, locale in locales.items():
        label = escape(locale.get("label", key))
        active_class = " active" if key == active_locale else ""
        links.append(
            f'<a class="language-link{active_class}" href="/?lang={escape(key)}">{label}</a>'
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
    "footer": render_footer,
}


def build_sections(content: dict, locale: str) -> str:
    sections = []
    default_locale = content.get("defaultLocale")
    for block in content.get("blocks", []):
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


def render_page(locale: str) -> str:
    content = load_content()
    default_locale = content.get("defaultLocale")
    if locale not in content.get("locales", {}):
        locale = default_locale
    language_switcher = render_language_switcher(content.get("locales", {}), locale)
    sections = build_sections(content, locale)
    template_text = TEMPLATE_PATH.read_text(encoding="utf-8")
    template = Template(template_text)
    return template.safe_substitute(
        page_title="Bridal Studio Sessions — Dress Shop Platform",
        language_switcher=language_switcher,
        sections=sections,
        html_lang=locale,
    )


class LandingHandler(SimpleHTTPRequestHandler):
    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path in {"", "/"}:
            query = parse_qs(parsed.query)
            locale = query.get("lang", [""])[0]
            page = render_page(locale)
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(page.encode("utf-8"))
            return
        super().do_GET()


def run(port: int) -> None:
    with TCPServer(("", port), LandingHandler) as httpd:
        print(f"Landing page running at http://localhost:{port}")
        httpd.serve_forever()


if __name__ == "__main__":
    run(port=8000)
