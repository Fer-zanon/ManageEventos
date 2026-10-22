#!/usr/bin/env python3
"""Check structural requirements for course SVG diagrams."""

from __future__ import annotations

import re
import sys
from pathlib import Path
from xml.etree import ElementTree as ET


SVG_NS = "{http://www.w3.org/2000/svg}"
NON_RENDERED_ROOT_TAGS = {"title", "desc", "defs", "metadata", "style"}


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def numeric(value: str | None) -> float | None:
    if not value:
        return None
    match = re.fullmatch(r"\s*([0-9]+(?:\.[0-9]+)?)\s*(?:px)?\s*", value)
    return float(match.group(1)) if match else None


def check_svg(path: Path) -> list[str]:
    errors: list[str] = []
    try:
        source = path.read_text(encoding="utf-8")
        root = ET.fromstring(source)
    except (OSError, UnicodeError, ET.ParseError) as error:
        return [f"cannot parse SVG: {error}"]

    if local_name(root.tag) != "svg":
        return ["root element must be <svg>"]

    view_box = root.get("viewBox")
    if not view_box:
        fail(errors, "root <svg> is missing viewBox")
    if not root.get("width") or not root.get("height"):
        fail(errors, "root <svg> must set width and height")
    if root.get("role") != "img":
        fail(errors, 'root <svg> must set role="img"')

    titles = root.findall(f".//{SVG_NS}title")
    descriptions = root.findall(f".//{SVG_NS}desc")
    if not titles or not (titles[0].text or "").strip():
        fail(errors, "SVG needs a non-empty <title>")
    if not descriptions or not (descriptions[0].text or "").strip():
        fail(errors, "SVG needs a non-empty <desc>")

    aria_ids = set((root.get("aria-labelledby") or "").split())
    title_id = titles[0].get("id") if titles else None
    desc_id = descriptions[0].get("id") if descriptions else None
    if not title_id or not desc_id or not {title_id, desc_id}.issubset(aria_ids):
        fail(errors, "aria-labelledby must reference the <title> and <desc> IDs")

    ids = [element.get("id") for element in root.iter() if element.get("id")]
    duplicates = sorted({item for item in ids if ids.count(item) > 1})
    if duplicates:
        fail(errors, f"duplicate IDs: {', '.join(duplicates)}")

    width = numeric(root.get("width"))
    height = numeric(root.get("height"))
    rounded_clips: set[str] = set()
    for clip in root.findall(f".//{SVG_NS}clipPath"):
        clip_id = clip.get("id")
        rect = clip.find(f"{SVG_NS}rect")
        if not clip_id or rect is None:
            continue
        radius = numeric(rect.get("rx")) or numeric(rect.get("ry"))
        if (
            radius
            and width
            and height
            and numeric(rect.get("width")) == width
            and numeric(rect.get("height")) == height
        ):
            rounded_clips.add(clip_id)

    clipped_groups = {
        match.group(1)
        for group in root.findall(f"{SVG_NS}g")
        if (match := re.fullmatch(r"url\(#([^)]+)\)", group.get("clip-path") or ""))
    }
    active_clips = rounded_clips & clipped_groups
    if not active_clips:
        fail(errors, "canvas needs a full-size rounded clipPath used by a root group")

    rendered_root_children = [
        child
        for child in root
        if local_name(child.tag) not in NON_RENDERED_ROOT_TAGS
    ]
    if any(
        local_name(child.tag) != "g"
        or not re.fullmatch(
            r"url\(#(?:" + "|".join(map(re.escape, active_clips)) + r")\)",
            child.get("clip-path") or "",
        )
        for child in rendered_root_children
    ):
        fail(errors, "put every root-level rendered element inside the rounded clipped group")

    style_text = "\n".join(
        "".join(style.itertext()) for style in root.findall(f".//{SVG_NS}style")
    )
    has_animation = bool(
        re.search(r"\banimation(?:-name)?\s*:", style_text)
        or root.findall(f".//{SVG_NS}animate")
        or root.findall(f".//{SVG_NS}animateMotion")
        or root.findall(f".//{SVG_NS}animateTransform")
    )
    if has_animation and "prefers-reduced-motion" not in style_text:
        fail(errors, "animated SVG needs a prefers-reduced-motion rule")

    for element in root.iter():
        marker = any(
            element.get(attribute)
            for attribute in ("marker-start", "marker-mid", "marker-end")
        )
        if not marker:
            continue
        inline_animation = "animation" in (element.get("style") or "")
        animated_class = any(
            re.search(
                rf"\.{re.escape(class_name)}\s*\{{[^}}]*\banimation(?:-name)?\s*:",
                style_text,
                re.DOTALL,
            )
            for class_name in (element.get("class") or "").split()
        )
        child_animation = any(
            local_name(child.tag) in {"animate", "animateMotion", "animateTransform"}
            for child in element
        )
        if inline_animation or animated_class or child_animation:
            fail(errors, "animated connection lines must not use arrowhead markers")
            break

    return errors


def main(arguments: list[str]) -> int:
    if not arguments:
        print("usage: check_svg_structure.py SVG [SVG ...]", file=sys.stderr)
        return 2

    failed = False
    for value in arguments:
        path = Path(value)
        errors = check_svg(path)
        if errors:
            failed = True
            for error in errors:
                print(f"ERROR {path}: {error}", file=sys.stderr)
        else:
            print(f"OK {path}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
