#!/usr/bin/env python3
"""Validate canonical CSVs and build the static graph used by docs/."""

import argparse
import csv
import datetime
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
OUTPUT = ROOT / "docs" / "graph.json"
REVIEW_STATUSES = {"audited", "legacy_unreviewed"}
CLAIM_KINDS = {"institutional_statement", "public_record", "external_report", "analysis", "allegation"}
CONFIDENCE = {"confirmed", "strong", "contextual", "inferred"}
PARTIAL_DATE = re.compile(r"^\d{4}(?:-\d{2}(?:-\d{2})?)?$")


def check_date(value, owner, field, full=False):
    if not value:
        return
    if not PARTIAL_DATE.fullmatch(value) or (full and len(value) != 10):
        raise ValueError(f"{owner}: invalid {field}: {value!r}")
    try:
        normalized = value + ("-01-01" if len(value) == 4 else "-01" if len(value) == 7 else "")
        datetime.date.fromisoformat(normalized)
    except ValueError as error:
        raise ValueError(f"{owner}: invalid {field}: {value!r}") from error


def read_csv(name):
    with (DATA / name).open(newline="", encoding="utf-8") as file:
        rows = list(csv.DictReader(file))
    if any(None in row or any(value is None for value in row.values()) for row in rows):
        raise ValueError(f"{name}: malformed CSV row")
    return rows


def indexed(rows, kind):
    result = {}
    for row in rows:
        key = row["id"]
        if not key or key in result:
            raise ValueError(f"{kind}: missing or duplicate ID: {key!r}")
        result[key] = row
    return result


def source_ids(value, owner, sources):
    ids = value.split("|") if value else []
    for source_id in ids:
        if source_id not in sources:
            raise ValueError(f"{owner}: unknown source {source_id!r}")
    return ids


def build():
    nodes = read_csv("nodes.csv")
    edges = read_csv("edges.csv")
    source_rows = read_csv("sources.csv")
    node_index = indexed(nodes, "nodes")
    indexed(edges, "edges")
    sources = indexed(source_rows, "sources")

    for source in source_rows:
        if not source["url"].startswith("https://"):
            raise ValueError(f"{source['id']}: source URL must use HTTPS")
        check_date(source["published_date"], source["id"], "published_date")
        check_date(source["last_checked"], source["id"], "last_checked", full=True)

    for node in nodes:
        source_ids(node["source_ids"], node["id"], sources)

    for edge in edges:
        edge_id = edge["id"]
        if edge["source"] not in node_index or edge["target"] not in node_index:
            raise ValueError(f"{edge_id}: unknown endpoint")
        ids = source_ids(edge["source_ids"], edge_id, sources)
        if edge["review_status"] not in REVIEW_STATUSES:
            raise ValueError(f"{edge_id}: invalid review status")
        if edge["confidence"] not in CONFIDENCE:
            raise ValueError(f"{edge_id}: invalid confidence")
        if edge["claim_kind"] and edge["claim_kind"] not in CLAIM_KINDS:
            raise ValueError(f"{edge_id}: invalid claim kind")
        if edge["claim_kind"] == "allegation" and edge["confidence"] == "confirmed":
            raise ValueError(f"{edge_id}: an allegation cannot be confirmed by its label")
        for field in ("date_start", "date_end", "last_verified"):
            check_date(edge[field], edge_id, field, full=(field == "last_verified"))
        if edge["review_status"] == "audited":
            for field in ("basis", "claim_kind", "source_locator", "last_verified", "caveat"):
                if not edge[field]:
                    raise ValueError(f"{edge_id}: audited edge missing {field}")
            if not ids or any(not sources[sid]["last_checked"] for sid in ids):
                raise ValueError(f"{edge_id}: audited sources need IDs and check dates")
        if edge["amount_usd"] and (not edge["amount_usd"].isdigit() or int(edge["amount_usd"]) <= 0):
            raise ValueError(f"{edge_id}: invalid USD amount")

    def node_element(row):
        return {"data": {
            "id": row["id"], "label": row["name"], "type": row["type"],
            "cluster": row["cluster"], "summary": row["summary"],
            "philosophy": row["stated_philosophy"], "location": row["location"],
            "notes": row["notes"], "sources": row["source_ids"]
        }}

    def edge_element(row):
        return {"data": {
            "id": row["id"], "source": row["source"], "target": row["target"],
            "relationship": row["relationship"], "confidence": row["confidence"],
            "basis": row["basis"], "sources": row["source_ids"],
            **{key: row[key] for key in (
                "claim_kind", "review_status", "source_locator", "date_start",
                "date_end", "amount_usd", "last_verified", "caveat"
            )}
        }}

    graph = {
        "nodes": [node_element(row) for row in nodes],
        "edges": [edge_element(row) for row in edges],
        "sources": {row["id"]: {
            "title": row["title"], "url": row["url"], "source_type": row["source_type"],
            "published_date": row["published_date"], "last_checked": row["last_checked"]
        } for row in source_rows}
    }
    stats = {
        "nodes": len(nodes), "edges": len(edges),
        "events": len(read_csv("events.csv")),
        "calendars": len(read_csv("calendars.csv")), "sources": len(source_rows)
    }
    return graph, stats


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="validate and compare generated files")
    args = parser.parse_args()
    graph, stats = build()
    expected_graph = json.dumps(graph, indent=2, ensure_ascii=False) + "\n"
    expected_stats = json.dumps(stats, indent=2) + "\n"
    if args.check:
        for path, expected in ((OUTPUT, expected_graph), (DATA / "stats.json", expected_stats)):
            if not path.exists() or path.read_text(encoding="utf-8") != expected:
                raise SystemExit(f"Out of date: {path.relative_to(ROOT)}. Run scripts/build_graph.py")
        print(f"Validated {stats['nodes']} nodes, {stats['edges']} edges, {stats['sources']} sources.")
    else:
        OUTPUT.write_text(expected_graph, encoding="utf-8")
        (DATA / "stats.json").write_text(expected_stats, encoding="utf-8")
        print(f"Built {stats['nodes']} nodes, {stats['edges']} edges, {stats['sources']} sources.")


if __name__ == "__main__":
    main()
