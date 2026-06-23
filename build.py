#!/usr/bin/env python3
"""
Build pipeline: downloads the Framer-published site, cleans it up,
and outputs deployment-ready HTML to site/.

Usage: python build.py
"""

import json
import re
from pathlib import Path

import requests
from bs4 import BeautifulSoup, Comment

SITE_URL = "https://strong-motivation-722518.framer.app"
# /journal is intentionally excluded: in Framer it still holds the default blog
# template filler (generic "business intelligence / AI analytics" posts), not real
# Lyzor content. Re-add it here once the page has genuine content in Framer.
PAGES = {
    "index.html": "/",
    "contact.html": "/contact",
}

ROOT = Path(__file__).parent
RAW_DIR = ROOT / "raw_site_export"
SITE_DIR = ROOT / "site"
CSS_DIR = SITE_DIR / "css"

# Style blocks Framer inlines in <head>. Only the font CSS is safe to extract into an
# external file. The SSR-critical CSS (data-framer-css-ssr-minified) and the breakpoint
# CSS (data-framer-breakpoint-css, whose `.hidden-*` rules hide the inactive responsive
# variants) MUST stay inline: externalizing them lets the browser paint before the CSS
# applies, causing a flash of unstyled content where all three breakpoint variants render
# at once. Framer inlines them for exactly this reason — keep them inline.
STYLE_MAP = {
    "data-framer-font-css": "fonts.css",
}

# The hero heading renders in Manrope at this weight. Its webfont is referenced deep inside
# fonts.css, so the browser discovers it late: the heading first paints in the metric-adjusted
# fallback (Arial via "Manrope Placeholder"), which is wide enough to wrap the heading onto a
# second line, then reflows to one line once Manrope loads. Preloading exactly this file in the
# <head> makes the browser fetch it eagerly so it's ready at first paint, removing the reflow.
# Update the weight if the hero heading text style changes in Framer.
HERO_FONT_FAMILY = "Manrope"
HERO_FONT_WEIGHT = 500
FONT_ORIGIN = "https://framerusercontent.com"


def download_pages():
    """Download published pages into raw_site_export/."""
    RAW_DIR.mkdir(exist_ok=True)
    pages = {}
    for filename, path in PAGES.items():
        url = SITE_URL + path
        print(f"  Downloading {url}")
        resp = requests.get(url)
        resp.raise_for_status()
        html = resp.content.decode("utf-8")
        (RAW_DIR / filename).write_bytes(resp.content)
        pages[filename] = html
    return pages


def remove_badge_css(css):
    """Strip #__framer-badge-container rules from CSS text, including @supports wrappers."""
    css = re.sub(
        r'@supports\s*\([^)]*\)\s*\{\s*#__framer-badge-container\s*\{[^}]*\}\s*\}',
        '', css, flags=re.DOTALL
    )
    css = re.sub(
        r'#__framer-badge-container\s*\{[^}]*\}',
        '', css, flags=re.DOTALL
    )
    return css


def clean_html(soup):
    """Remove Framer branding and editor artifacts from the parsed HTML."""
    # 1. Remove Framer comments (<!-- Made in Framer ... -->, <!-- Published ... -->)
    for comment in soup.find_all(string=lambda t: isinstance(t, Comment)):
        text = comment.strip()
        if text.startswith("Made in Framer"):
            comment.extract()

    # 2. Remove Framer editor preload script
    for script in soup.find_all("script"):
        if script.string and "framer.com/edit/init.mjs" in script.string:
            script.decompose()

    # 3. Remove Framer meta tags that aren't useful outside Framer
    for meta in soup.find_all("meta"):
        name = meta.get("name", "") or meta.get("content", "")
        if name in ("framer-search-index", "framer-search-index-fallback", "framer-html-plugin"):
            meta.decompose()
        elif meta.get("name") == "generator" and "Framer" in (meta.get("content") or ""):
            meta.decompose()

    # 4. Remove Framer badge — the container element, CSS rules, and import map entry
    badge = soup.find(id="__framer-badge-container")
    if badge:
        badge.decompose()

    for style in soup.find_all("style"):
        if style.string and "__framer-badge-container" in style.string:
            style.string = remove_badge_css(style.string)

    for script in soup.find_all("script", attrs={"type": "importmap"}):
        if script.string and "__framer-badge" in script.string:
            try:
                importmap = json.loads(script.string)
                importmap.get("imports", {}).pop("__framer-badge", None)
                script.string = json.dumps(importmap, separators=(",", ":"))
            except json.JSONDecodeError:
                pass

    return soup


def extract_styles(soup, css_written):
    """Extract <style> blocks into separate CSS files, replace with <link> tags."""
    for attr, filename in STYLE_MAP.items():
        style_tag = soup.find("style", attrs={attr: True})
        if not style_tag:
            continue

        # Write CSS file (only once, they're identical across pages)
        if not css_written:
            css_path = CSS_DIR / filename
            css_path.write_text(style_tag.string or "", encoding="utf-8")

        # Replace <style> with <link>
        link = soup.new_tag("link", rel="stylesheet", href=f"css/{filename}")
        # Preserve the data attribute for traceability
        link[attr] = ""
        style_tag.replace_with(link)

    return soup


def find_font_url(font_css, family, weight):
    """Return the woff2 URL for a given font-family + weight from the font CSS text."""
    for face in re.findall(r'@font-face\s*\{[^}]*\}', font_css, re.DOTALL):
        if f'font-family: "{family}"' not in face:
            continue
        if not re.search(rf'font-weight:\s*{weight}\b', face):
            continue
        url = re.search(r'url\("([^"]+)"\)', face)
        if url:
            return url.group(1)
    return None


def preload_hero_font(soup, font_css):
    """Inject a preconnect + font preload for the hero heading weight, so the real font is
    ready at first paint and the heading doesn't reflow from two lines to one."""
    url = find_font_url(font_css, HERO_FONT_FAMILY, HERO_FONT_WEIGHT)
    head = soup.find("head")
    if not url or head is None:
        return soup

    anchor = soup.find("link", attrs={"data-framer-font-css": True}) or head.find("link")

    if not soup.find("link", attrs={"rel": "preconnect", "href": FONT_ORIGIN}):
        preconnect = soup.new_tag("link", attrs={"rel": "preconnect", "href": FONT_ORIGIN, "crossorigin": ""})
        anchor.insert_before(preconnect) if anchor else head.append(preconnect)

    preload = soup.new_tag("link", attrs={
        "rel": "preload", "as": "font", "type": "font/woff2", "href": url, "crossorigin": ""
    })
    anchor.insert_before(preload) if anchor else head.append(preload)
    return soup


def build():
    print("Step 1: Downloading pages...")
    pages = download_pages()

    print("Step 2: Cleaning and extracting styles...")
    SITE_DIR.mkdir(exist_ok=True)
    CSS_DIR.mkdir(exist_ok=True)

    css_written = False
    for filename, html in pages.items():
        print(f"  Processing {filename}")
        soup = BeautifulSoup(html, "html.parser")
        soup = clean_html(soup)

        font_style = soup.find("style", attrs={"data-framer-font-css": True})
        font_css = (font_style.string or "") if font_style else ""

        soup = extract_styles(soup, css_written)
        soup = preload_hero_font(soup, font_css)
        css_written = True

        out_path = SITE_DIR / filename
        out_path.write_text(soup.prettify(), encoding="utf-8")

    print(f"Done. Output in {SITE_DIR}/")


if __name__ == "__main__":
    build()