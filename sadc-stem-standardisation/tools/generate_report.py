#!/usr/bin/env python3
"""Generate a Markdown regional report from the SADC STEM standardisation dataset.

Usage:
    python3 tools/generate_report.py [--out reports/latest.md]

Reads framework/dimensions.json, framework/countries.json and data/assessments.json
(relative to the repo root) and writes a Markdown summary: regional index, per-dimension
regional averages, weakest dimensions, and a per-country breakdown with priority actions.
"""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def maturity_label(scale, score):
    rounded = round(score)
    for level in scale:
        if level["level"] == rounded:
            return level["label"]
    return "Unknown"


def build_report(dimensions_doc, countries, assessments):
    dimensions = dimensions_doc["dimensions"]
    scale = dimensions_doc["maturityScale"]
    scores = assessments["scores"]
    meta = assessments["_meta"]

    def overall(code):
        vals = [scores[code].get(d["id"], 0) for d in dimensions]
        return sum(vals) / len(vals)

    def dim_regional_avg(dim_id):
        vals = [scores[c["code"]].get(dim_id, 0) for c in countries]
        return sum(vals) / len(vals)

    country_overall = {c["code"]: overall(c["code"]) for c in countries}
    regional_avg = sum(country_overall.values()) / len(country_overall)
    regional_index_pct = round((regional_avg / 4) * 100)

    dim_avgs = {d["id"]: dim_regional_avg(d["id"]) for d in dimensions}
    weakest = sorted(dimensions, key=lambda d: dim_avgs[d["id"]])[:3]

    lines = []
    lines.append("# SADC STEM Standardisation Report")
    lines.append("")
    lines.append(f"Data last updated: **{meta['lastUpdated']}** ({meta['updatedBy']})")
    lines.append("")
    lines.append(f"## Regional STEM Standardisation Index: {regional_index_pct}%")
    lines.append("")
    lines.append("| Dimension | Regional average (0-4) | Maturity |")
    lines.append("|---|---|---|")
    for d in dimensions:
        avg = dim_avgs[d["id"]]
        lines.append(f"| {d['name']} | {avg:.2f} | {maturity_label(scale, avg)} |")
    lines.append("")

    lines.append("## Weakest regional dimensions (priority for intervention)")
    lines.append("")
    for d in weakest:
        lines.append(f"### {d['name']} (avg {dim_avgs[d['id']]:.2f})")
        lines.append(f"{d['improvementScope']}")
        lines.append("")
        for a in d["actions"]:
            lines.append(f"- {a}")
        lines.append("")

    lines.append("## Country breakdown")
    lines.append("")
    lines.append("| Country | " + " | ".join(d["name"] for d in dimensions) + " | Overall |")
    lines.append("|---|" + "---|" * (len(dimensions) + 1))
    for c in sorted(countries, key=lambda c: -country_overall[c["code"]]):
        row_scores = [str(scores[c["code"]].get(d["id"], 0)) for d in dimensions]
        lines.append(f"| {c['name']} | " + " | ".join(row_scores) + f" | {country_overall[c['code']]:.1f} |")
    lines.append("")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default=str(ROOT / "reports" / "latest.md"))
    args = parser.parse_args()

    dimensions_doc = load_json(ROOT / "framework" / "dimensions.json")
    countries = load_json(ROOT / "framework" / "countries.json")
    assessments = load_json(ROOT / "data" / "assessments.json")

    report = build_report(dimensions_doc, countries, assessments)

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(report, encoding="utf-8")
    print(f"Report written to {out_path}")


if __name__ == "__main__":
    main()
