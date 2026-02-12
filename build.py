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
PAGES = {
    "index.html": "/",
    "contact.html": "/contact",
    "journal.html": "/journal",
}

ROOT = Path(__file__).parent
RAW_DIR = ROOT / "raw_site_export"
SITE_DIR = ROOT / "site"
CSS_DIR = SITE_DIR / "css"

STYLE_MAP = {
    "data-framer-font-css": "fonts.css",
    "data-framer-breakpoint-css": "breakpoints.css",
    "data-framer-css-ssr-minified": "styles.css",
}


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
        if text.startswith("Made in Framer") or text.startswith("Published "):
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
        soup = extract_styles(soup, css_written)
        css_written = True

        out_path = SITE_DIR / filename
        out_path.write_text(soup.prettify(), encoding="utf-8")

    print(f"Done. Output in {SITE_DIR}/")


if __name__ == "__main__":
    build()