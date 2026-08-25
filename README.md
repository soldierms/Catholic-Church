# Ghanaian Catholic Community of Chicago

Website for the Ghanaian Catholic Community of Chicago, which worships at
**Blessed Maria Gabriella Parish**, 2248 W Washington Blvd, Chicago, IL 60612.

The community was inaugurated in February 2017 by the Archdiocese of Chicago
with the personal blessing of His Eminence Cardinal Blase J. Cupich — the first
such inauguration of a Ghanaian community of Catholic worshipers in the
Archdiocese. Sunday Ghanaian Mass is at **2:00 PM**.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home — welcome, mission summary, Mass times |
| `about.html` | Our Story — founding, milestones, mission |
| `worship.html` | Worship & Mass times, sacraments, map |
| `ministries.html` | Ministries and community groups |
| `gallery.html` | Photo gallery (placeholders pending real photos) |
| `contact.html` | Contact details, "Why reach out", parish staff |

Shared assets live in `css/style.css` and `js/main.js`.

## Design

A glassmorphism design system: frosted translucent panels
(`backdrop-filter: blur() saturate()`) layered over a fixed mesh-gradient
backdrop, with the Ghanaian flag palette (maroon, gold, forest green), a
kente-inspired accent strip, and a system font stack (SF Pro / Inter).

Fully responsive, with a glass mobile nav below 760px.

## Build

The site is plain static HTML/CSS/JS and runs as-is — no build step is required
to develop or deploy it. Open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000
```

To generate a minified, deploy-ready copy in `dist/`:

```bash
python3 build.py
```

The build script has no third-party dependencies (stock Python 3 only). It
minifies CSS, HTML and JS, trimming roughly 14% of total payload. The CSS
minifier is string-aware so the embedded SVG data URI is preserved byte for
byte.

Deploy either the repository root or `dist/` — both are self-contained.

## Notes

- Gallery images are colored placeholders; swap in real community photos.
- Mass times can shift for feast days — the site directs visitors to confirm
  with the parish office at 312-733-1068.
