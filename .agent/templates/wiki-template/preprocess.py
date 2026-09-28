#!/usr/bin/env python3
"""
Pre-process staged docs for the product wiki build.

Two transforms:
  1. Strip blocks between <!-- wiki:hide --> and <!-- /wiki:hide --> markers.
  2. Filter rows with status 'planned' out of product-roadmap.md Feature
     Catalog table (customer-facing wiki shows only shipped + in-flight).

Run after staging docs/01-product and docs/05-releases into .wiki-build/docs/,
before `mkdocs build`.

Usage:
    python preprocess.py <staged-docs-dir>
"""

import re
import sys
from pathlib import Path


WIKI_HIDE_PATTERN = re.compile(
    r"<!--\s*wiki:hide\s*-->.*?<!--\s*/wiki:hide\s*-->",
    re.DOTALL,
)


def strip_wiki_hide_blocks(text: str) -> str:
    return WIKI_HIDE_PATTERN.sub("", text)


def filter_planned_rows(text: str) -> str:
    """Remove markdown table rows whose Status column equals 'planned'.

    Only operates on tables inside files named product-roadmap.md.
    Keeps `in-backlog`, `in-flight`, `shipped` rows.
    """
    lines = text.splitlines(keepends=True)
    out = []
    for line in lines:
        stripped = line.strip()
        # Heuristic: table data row (starts and ends with '|') containing 'planned' as a status cell
        if (
            stripped.startswith("|")
            and stripped.endswith("|")
            and re.search(r"\|\s*planned\s*\|", stripped, re.IGNORECASE)
        ):
            continue
        out.append(line)
    return "".join(out)


def process_file(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    transformed = strip_wiki_hide_blocks(text)
    if path.name == "product-roadmap.md":
        transformed = filter_planned_rows(transformed)
    if transformed != text:
        path.write_text(transformed, encoding="utf-8")
        print(f"  transformed: {path}")


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: preprocess.py <staged-docs-dir>", file=sys.stderr)
        return 2
    root = Path(sys.argv[1])
    if not root.is_dir():
        print(f"error: {root} is not a directory", file=sys.stderr)
        return 2
    for md in root.rglob("*.md"):
        process_file(md)
    print("preprocess complete")
    return 0


if __name__ == "__main__":
    sys.exit(main())
