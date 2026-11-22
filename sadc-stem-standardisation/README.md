# SADC STEM Standardisation Tracker

A small, dependency-free toolkit for tracking and driving progress on standardised STEM
education across the 16 SADC member states — turning the regional policy analysis (SADCQF,
UNESCO/HAQAA, SADC Teacher Standards) into a measurable, updatable framework instead of a
one-off report.

It has five parts:

1. **`framework/`** — the data model: 7 standardisation dimensions (each with a 0-4 maturity
   scale and concrete improvement actions), the 16 SADC member states, and the proposed
   **SADC Harmonised Identification Number** format.
2. **`data/assessments.json`** — the current maturity scores per country per dimension. This
   is the file you update as better data becomes available; everything else derives from it.
3. **`data/demographics.json`** — per-country population, school-age cohort, gender, urban/rural
   and GDP-per-capita figures used to contextualise the STEM scores.
4. **`webapp/`** — a static, interactive **dashboard** (no build step, no external
   dependencies) that visualises the data, lets you edit scores in the browser, and includes
   a demo validator for the harmonised ID format.
5. **`tools/generate_report.py`** and **`tools/id_validator.py`** — CLIs that turn the same
   dataset into a Markdown report, and validate/decode harmonised ID numbers.

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
- A country detail view with demographic context (population, school-age cohort, gender,
  urban/rural, GDP per capita) and the priority actions for that country's weakest dimensions.
- An **edit mode** to update scores directly and download a new `assessments.json`.
- A **SADC Harmonised Identification Number** format demo: paste a synthetic 13-digit test
  number and it decodes birth date, country, and sex per the proposed regional format — see
  [Harmonised Identification Number](#harmonised-identification-number) below. Never enter a
  real person's ID number; this is a format-compliance demo, not a lookup of any real person.

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
- Add or edit demographic indicators in `data/demographics.json`; the dashboard's country
  detail panel and the report's country table pick them up automatically.

## Harmonised Identification Number

`framework/identification.json` defines a **proposed** SADC Harmonised Identification Number:
a 13-digit format built on South Africa's Home Affairs ID model (embedded date of birth plus a
Luhn check digit), extended for regional use with a 2-digit country code and a standardised
sex digit (ISO/IEC 5218) at the end:

```
YYMMDD SSS CC Z X
  |     |   |  | '-- sex (ISO/IEC 5218: 0 not known, 1 male, 2 female, 9 not applicable)
  |     |   |  '---- Luhn check digit over digits 1-11
  |     |   '------- 2-digit SADC country code (framework/countries.json numericCode)
  |     '----------- per-day/per-country sequence number
  '----------------- date of birth
```

Validate and decode a number from the command line:

```bash
python3 tools/id_validator.py 8001010031381
```

Both the CLI and the dashboard's "format validator (demo)" panel only decode the digits you
give them — they do not look up, store, or identify any real person, and cannot determine
anyone's identity or origin from nothing. **Use synthetic/test numbers only.**

## Background

See [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md) for the full regional analysis this framework
is built on, and how each of the five improvement areas (curriculum & assessment alignment,
teacher quality & mobility, gender equity, regional collaboration, and qualification
recognition) maps to the tracked dimensions.
