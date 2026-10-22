---
name: author-svg-diagrams
description: Create, revise, or review repository-native SVG diagrams for the Miracle Devs tutorial and presentation. Use when adding or changing SVG charts, architecture views, story flows, cards, labels, connectors, or animations, and when fixing rounded corners, clipped or bleeding text, undersized labels, inaccessible graphics, or animated lines with arrowheads.
---

# Author SVG Diagrams

Create diagrams that explain one idea quickly, match the course narrative, and remain correct at their real rendered size. Treat visual inspection as part of implementation, not as optional polish.

## 1. Establish the diagram's job

1. Read `docs/design.md`, the section that embeds the diagram, and one or two nearby SVGs that already fit the same surface.
2. Read the applicable addendum in `docs/prompts/content-modification.prompt.md` when the request changes course content or story continuity.
3. Write the one-sentence takeaway before drawing. Remove any shape, label, or connector that does not support it.
4. Continue the FutureAI/Nova narrative where the surrounding lesson uses it. Keep Miracle Devs in the role of a software company consuming AI products, not a model or harness provider.
5. Prefer an SVG maintained as repository code. Do not generate a raster image for a chart that can be expressed clearly with vectors and text.

## 2. Build a bounded canvas

Set explicit `width`, `height`, and `viewBox` values. Reserve a consistent outer margin before placing content. Keep filters, shadows, circles, and animated strokes within that budget.

Round all four canvas corners with both a background rectangle and a matching clipping path. Put every rendered element inside the clipped group so edge decorations cannot repaint square corners:

```svg
<defs>
  <clipPath id="topicCanvasClip">
    <rect width="1200" height="700" rx="24" />
  </clipPath>
</defs>
<g clip-path="url(#topicCanvasClip)">
  <rect width="1200" height="700" rx="24" fill="#fdfdfd" />
  <!-- all visible diagram elements -->
</g>
```

Prefix gradients, filters, masks, clip paths, keyframes, and other IDs with a short diagram-specific name. Keep IDs unique because several SVGs can appear on one page.

Use cards, spacing, neutral surfaces, restrained shadows, and semantic colors from the established visual language. Pair status colors with visible text or another explicit indicator; never make color the only carrier of meaning.

## 3. Fit text deliberately

Remember that SVG `<text>` does not wrap automatically.

1. Start with the established font stack and a readable size for the target surface.
2. Keep generous internal padding between every label and its card boundary.
3. Split long copy into explicit lines with separate `<text>` elements or `<tspan>` rows.
4. Shorten the copy, widen or heighten the card, or reorganize the layout before shrinking the font.
5. Keep headings, labels, and footnotes inside the `viewBox`; do not rely on overflow being hidden to conceal a layout error.
6. Inspect the final embedded scale. Text that fits numerically but is unreadable in the tutorial or from a presentation audience's distance still fails.

Avoid `foreignObject` unless the repository already requires it for the target surface. Native SVG text is more predictable in direct asset rendering and presentation export.

## 4. Draw understandable flows

Place connectors behind nodes and keep routes clear of text. Use direct spatial order before adding lines. Use icons and decorative elements only when they make the relationship easier to understand.

For an animated connection line:

- animate the stroke or dash movement;
- do not add `marker-start`, `marker-mid`, or `marker-end` arrowheads;
- give the animation a diagram-specific keyframe name; and
- provide a `prefers-reduced-motion: reduce` rule that removes the motion while preserving the relationship.

Use an arrowhead only on a static connector when direction is otherwise ambiguous. Keep animated paths simple, as required by the content-modification addenda.

## 5. Preserve accessibility

Include a concise `<title>` and a useful `<desc>`, connect them with `aria-labelledby`, and set `role="img"` on the root SVG. Describe the takeaway and important relationships instead of listing every shape.

Keep contrast strong, use logical reading order in the source, and duplicate no essential meaning exclusively through animation, position, or color.

## 6. Validate structure and appearance

Run the structural checker on every changed diagram:

```powershell
python .agents/skills/author-svg-diagrams/scripts/check_svg_structure.py path/to/diagram.svg
```

The checker verifies the accessible name, unique IDs, rounded canvas clip, reduced-motion handling, and the animated-line arrowhead rule. It cannot prove that text fits.

Render and inspect every changed SVG after editing. Review the direct asset and the page or slide where it is embedded. At minimum, verify:

- all four outer corners are visibly rounded against a contrasting surround;
- no text, shape, shadow, or animated stroke bleeds outside its intended bounds;
- every label has padding and no line is clipped or truncated;
- font sizes remain readable at the actual tutorial or presentation scale;
- connectors do not cross labels and the flow is understandable without animation;
- the visual remains clear, easy to understand, and consistent with adjacent diagrams; and
- reduced-motion mode leaves a complete static explanation.

For presentation assets, inspect at 1280 x 720 and 1920 x 1080 when those are supported output sizes. For tutorial assets, inspect the rendered desktop page and a narrow layout when the image scales responsively.

Run the relevant build and tests plus `git diff --check` before handing off. Report what was visually inspected; do not claim that a source-only review proved the diagram has no visual defects.
