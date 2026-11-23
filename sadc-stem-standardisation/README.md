# SADC STEM Standardisation Tracker

A small, dependency-free toolkit for tracking and driving progress on standardised STEM
education across the 16 SADC member states — turning the regional policy analysis (SADCQF,
UNESCO/HAQAA, SADC Teacher Standards) into a measurable, updatable framework instead of a
one-off report.

It has three parts:

1. **`framework/`** — the data model: 7 standardisation dimensions (each with a 0-4 maturity
   scale and concrete improvement actions) and the 16 SADC member states.
2. **`data/assessments.json`** — the current maturity scores per country per dimension. This
   is the file you update as better data becomes available; everything else derives from it.
3. **`webapp/`** — a static, interactive **dashboard** (no build step, no external
   dependencies) that visualises the data and lets you edit scores in the browser.
4. **`tools/generate_report.py`** — a CLI that turns the same dataset into a Markdown report
   (regional index, weakest dimensions, per-country breakdown) for sharing outside the browser.

## Quick start

```bash
# from the sadc-stem-standardisation/ directory
python3 -m http.server 8000
# then open http://localhost:8000/webapp/ in a browser
```

(A local server is required — browsers block `fetch()` of local JSON files opened directly
via `file://`.)

The dashboard shows:

- A regional STEM standardisation index (0-100%) and per-dimension regional averages.
- A sortable country &times; dimension maturity matrix, colour-coded by maturity level.
- A country detail view with the priority actions for that country's weakest dimensions.
- An **edit mode** to update scores directly and download a new `assessments.json`.

## Updating the data

The dashboard is designed to be refreshed as real data comes in — you don't need to touch code:

1. Open the dashboard and click **Enable editing**.
2. Update any score (0-4) in the matrix.
3. Click **Download updated data** to save a new `assessments.json`.
4. Replace `data/assessments.json` with the downloaded file (or edit it directly by hand — it's
   plain JSON) and commit the change.

Alternatively, edit `data/assessments.json` directly and regenerate the Markdown report:

```bash
python3 tools/generate_report.py --out reports/latest.md
```

## Extending the framework

- Add or edit dimensions (and their maturity descriptors / recommended actions) in
  `framework/dimensions.json`.
- The dashboard, report generator, and country matrix all read from this file, so a new
  dimension or action shows up everywhere automatically — no other code changes needed.

## Background

See [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md) for the full regional analysis this framework
is built on, and how each of the five improvement areas (curriculum & assessment alignment,
teacher quality & mobility, gender equity, regional collaboration, and qualification
recognition) maps to the tracked dimensions.
