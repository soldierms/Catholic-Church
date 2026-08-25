#!/usr/bin/env python3
"""
Build script for the Ghanaian Catholic Community of Chicago site.

Produces a minified, deploy-ready copy of the site in dist/.
No third-party dependencies - runs on a stock Python 3 install.

Usage:  python3 build.py
"""

import os
import re
import shutil
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(ROOT, "dist")

PAGES = [
    "index.html",
    "about.html",
    "worship.html",
    "ministries.html",
    "gallery.html",
    "contact.html",
]

# ---------------------------------------------------------------------------
# String-safe helpers
#
# The stylesheet embeds an SVG data URI that contains spaces, colons and
# quotes. Naive regex minification corrupts it, so quoted strings are pulled
# out and restored after the whitespace passes have run.
# ---------------------------------------------------------------------------

STRING_RE = re.compile(r"""("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')""")


def _protect(text):
    """Replace quoted strings with placeholders. Returns (text, strings)."""
    strings = []

    def stash(match):
        strings.append(match.group(0))
        return "\x00%d\x00" % (len(strings) - 1)

    return STRING_RE.sub(stash, text), strings


def _restore(text, strings):
    for index, value in enumerate(strings):
        text = text.replace("\x00%d\x00" % index, value)
    return text


# ---------------------------------------------------------------------------
# Minifiers
# ---------------------------------------------------------------------------


def minify_css(css):
    css, strings = _protect(css)
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)      # comments
    css = re.sub(r"\s+", " ", css)                        # collapse whitespace
    css = re.sub(r"\s*([{}:;,>])\s*", r"\1", css)         # tighten separators
    css = re.sub(r";}", "}", css)                         # trailing semicolons
    return _restore(css, strings).strip()


def minify_html(html):
    html = re.sub(r"<!--(?!\[if).*?-->", "", html, flags=re.S)  # drop comments
    # Strip per-line indentation and blank lines only. The newline itself is
    # kept, so whitespace between inline elements still renders as one space.
    lines = [line.strip() for line in html.split("\n")]
    return "\n".join(line for line in lines if line)


def minify_js(js):
    out = []
    for line in js.split("\n"):
        stripped = line.strip()
        if not stripped or stripped.startswith("//"):
            continue
        out.append(stripped)
    return "\n".join(out)


# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------


def build():
    if os.path.isdir(DIST):
        shutil.rmtree(DIST)
    os.makedirs(os.path.join(DIST, "css"))
    os.makedirs(os.path.join(DIST, "js"))

    saved = 0
    total = 0

    def emit(rel_path, source_text, minified_text):
        nonlocal saved, total
        target = os.path.join(DIST, rel_path)
        with open(target, "w", encoding="utf-8") as handle:
            handle.write(minified_text)
        before = len(source_text.encode("utf-8"))
        after = len(minified_text.encode("utf-8"))
        saved += before - after
        total += before
        pct = (1 - after / before) * 100 if before else 0
        print("  %-22s %6d -> %6d bytes  (-%.1f%%)" % (rel_path, before, after, pct))

    print("Building dist/ ...")

    for page in PAGES:
        source = open(os.path.join(ROOT, page), encoding="utf-8").read()
        emit(page, source, minify_html(source))

    css_source = open(os.path.join(ROOT, "css", "style.css"), encoding="utf-8").read()
    emit(os.path.join("css", "style.css"), css_source, minify_css(css_source))

    js_source = open(os.path.join(ROOT, "js", "main.js"), encoding="utf-8").read()
    emit(os.path.join("js", "main.js"), js_source, minify_js(js_source))

    pct = (saved / total * 100) if total else 0
    print("\nDone. dist/ is deploy-ready - %d bytes saved (-%.1f%%)." % (saved, pct))


if __name__ == "__main__":
    try:
        build()
    except OSError as error:
        sys.exit("Build failed: %s" % error)
