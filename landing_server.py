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
        <div class="login-card">
          <h2>{escape(copy.get("formTitle"))}</h2>
          <form class="store-form login-form">
            <label>
              {escape(copy.get("emailLabel"))}
              <input type="email" placeholder="{escape(copy.get("emailPlaceholder"))}" />
            </label>
            <label>
              {escape(copy.get("passwordLabel"))}
              <input type="password" placeholder="{escape(copy.get("passwordPlaceholder"))}" />
            </label>
            <div class="login-actions">
              <button class="button" type="button">{escape(copy.get("primaryButton"))}</button>
              <a class="text-link" href="#">{escape(copy.get("secondaryLink"))}</a>
            </div>
          </form>
        </div>
        <div class="login-card support-card">
          <h3>{escape(copy.get("supportTitle"))}</h3>
          <p class="lead">{escape(copy.get("supportBody"))}</p>
          <a class="button secondary" href="#">{escape(copy.get("supportButton"))}</a>
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
              >
                <span class="store-name">{name}</span>
                <span class="store-location">{location}</span>
              </button>
            """.format(
                name=escape(store.get("name")),
                location=escape(store.get("location")),
                manager=escape(store.get("manager")),
                invite=escape(store.get("inviteCode")),
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
            <div class="store-detail" data-empty-text="{escape(copy.get("detailEmpty"))}">
              <p class="store-detail-name">{escape(copy.get("detailEmpty"))}</p>
              <p class="store-detail-location"></p>
              <ul class="store-detail-meta"></ul>
            </div>
          </div>
        </div>
        <div class="dashboard-actions">
          <div class="dashboard-panel" id="create-store">
            <h3>{escape(copy.get("createTitle"))}</h3>
            <p class="lead">{escape(copy.get("createDescription"))}</p>
            <form class="store-form">
              <label>
                {escape(copy.get("createNameLabel"))}
                <input type="text" placeholder="{escape(copy.get("createNamePlaceholder"))}" />
              </label>
              <label>
                {escape(copy.get("createLocationLabel"))}
                <input type="text" placeholder="{escape(copy.get("createLocationPlaceholder"))}" />
              </label>
              <button class="button" type="button">{escape(copy.get("createButton"))}</button>
            </form>
          </div>
          <div class="dashboard-panel">
            <h3>{escape(copy.get("joinTitle"))}</h3>
            <p class="lead">{escape(copy.get("joinDescription"))}</p>
            <form class="store-form">
              <label>
                {escape(copy.get("joinLabel"))}
                <input type="text" placeholder="{escape(copy.get("joinPlaceholder"))}" />
              </label>
              <button class="button secondary" type="button">{escape(copy.get("joinButton"))}</button>
            </form>
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
    "login": render_login,
    "dashboard": render_dashboard,
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
    def do_GET(self) -> None:
        parsed = urlparse(self.path)
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
        super().do_GET()


def run(port: int) -> None:
    with TCPServer(("", port), LandingHandler) as httpd:
        print(f"Landing page running at http://localhost:{port}")
        httpd.serve_forever()


if __name__ == "__main__":
    run(port=8000)
