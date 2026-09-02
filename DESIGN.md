---
name: Pune Industrial Space
description: A spec-first search tool for Pune industrial buildings, drawn like an engineering title block.
colors:
  concrete-paper: "#e9ebe8"
  drawing-ink: "#16191a"
  gantry-steel: "#4a5c6a"
  hazard-signal: "#e24a0f"
  chalk-surface: "#fbfbfa"
  hairline-rule: "color-mix(in srgb, #16191a 12%, transparent)"
  container-edge: "color-mix(in srgb, #16191a 10%, transparent)"
  status-ready: "#2f6b4f"
  status-under-construction: "#8a6d1f"
  status-built-to-suit: "#4a5c6a"
  status-leased-out: "#6b6b67"
typography:
  display:
    fontFamily: "Google Sans, Google Sans Text, system-ui, sans-serif"
    fontSize: "2.375rem"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Google Sans, Google Sans Text, system-ui, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  heading:
    fontFamily: "Google Sans, Google Sans Text, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.01em"
  body:
    fontFamily: "Google Sans, Google Sans Text, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  numeric:
    fontFamily: "Google Sans, Google Sans Text, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
    fontFeature: "tabular-nums"
  label:
    fontFamily: "Google Sans, Google Sans Text, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.015em"
rounded:
  strip: "0"
  card: "2px"
  chip: "4px"
spacing:
  hair: "6px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
components:
  card:
    backgroundColor: "{colors.chalk-surface}"
    textColor: "{colors.drawing-ink}"
    rounded: "{rounded.card}"
    padding: "12px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.drawing-ink}"
    rounded: "{rounded.chip}"
    padding: "6px 10px"
    height: "28px"
  chip-active:
    backgroundColor: "transparent"
    textColor: "{colors.drawing-ink}"
    rounded: "{rounded.chip}"
    padding: "6px 10px"
    height: "28px"
  checkbox:
    backgroundColor: "{colors.chalk-surface}"
    textColor: "{colors.drawing-ink}"
    rounded: "2px"
    size: "24px"
  checkbox-checked:
    backgroundColor: "{colors.hazard-signal}"
    textColor: "{colors.chalk-surface}"
    rounded: "2px"
    size: "24px"
  spec-cell:
    backgroundColor: "transparent"
    textColor: "{colors.drawing-ink}"
    typography: "{typography.numeric}"
    rounded: "{rounded.strip}"
    padding: "0 6px"
---

> **SUPERSEDED — do not build to this file.** On 3 Sep 2026 the owner replaced this
> visual world with "The Estate Wayfinding System": full-bleed map, floating sign panels,
> per-cluster zone colour, Light/Voyager basemaps. The search screen is rebuilt; the
> detail, cluster and about pages still carry retired styling. This file is rewritten from
> the shipped code once the world is complete across all surfaces. Until then the binding
> record is `.impeccable/surfaces/src-app-page-tsx.md`.

# Design System: Pune Industrial Space

## Overview

**Creative North Star: "The Title Block"**

A title block is the boxed panel in the corner of an engineering drawing where every
dimension, material and tolerance is named, in fixed positions, so a reader can find any
value without hunting. Nothing in it is decorative. A blank field means the value was not
specified — it never means zero.

That is the whole system. The five-cell spec strip on every result card *is* a title
block: the same five specs, in the same order, in the same horizontal positions, on every
card, so a user scanning twenty listings compares the same number in the same place every
time. That alignment is not a styling choice; it is the product working. Everything else —
the hairline rules, the near-absent radius, the one accent colour — exists to keep that
reading surface uninterrupted.

The register is **exact, quiet and unornamented**. The contrast between card and page is
deliberately low, because the numbers carry the hierarchy, not the container. Components
are **drawn, not styled**: they read as marks on a drawing — hairlines, ticks, boxes,
cross-hairs — rather than as web widgets. The checkbox is drawn rather than native for
exactly this reason.

**Key Characteristics:**

- Five colour values, no gradients anywhere
- Hairline rules (1px, ink at 12%) as the single repeated motif
- Tabular figures everywhere a number appears — mandatory, not preference
- Flat: no shadows at all, depth from 1px borders and tonal ground
- Sentence case throughout; never uppercase labels
- One accent colour, capped at two appearances per screen

## Colors

Five values total, plus a muted status set. The palette is cool and mineral — concrete and
drawing ink, not paper and warmth.

### Primary

- **Hazard Signal** (`#e24a0f`): The only accent, and it never marks a user's choice —
  it marks what the tool is reporting about itself: the focus ring, the highlighted map
  pin, and the control that reverses a null exclusion. Its rarity is the entire point —
  see The Two Marks Rule.

### Neutral

- **Concrete Paper** (`#e9ebe8`): Page ground. A cool grey-green, deliberately not cream
  and not white — it is the colour of a cured slab, and it makes chalk surfaces read as
  raised without a shadow.
- **Drawing Ink** (`#16191a`): All body text, headings, numbers, and every rule and
  border. Near-black, never pure black.
- **Gantry Steel** (`#4a5c6a`): Secondary text, spec labels, unstated-value em dashes, and
  map water. It is the "this is context, not data" colour.
- **Chalk Surface** (`#fbfbfa`): Card and elevated-surface fill. Sits barely above
  Concrete Paper; the low contrast is intentional.
- **Hairline Rule** (ink at 12%): Dimension lines between spec cells and under numbers.
- **Container Edge** (ink at 10%): Card and input borders. The only thing standing in for
  elevation.

### Tertiary

Availability status, muted by design — these are data, not decoration, and must never
out-shout Hazard Signal.

- **Ready** (`#2f6b4f`), **Under construction** (`#8a6d1f`), **Built-to-suit** (`#4a5c6a`),
  **Leased out** (`#6b6b67`). Leased out was darkened from `#9a9a96` to clear 4.5:1 on
  Chalk Surface as text; the map mutes it with layer opacity instead, so the one status a
  user most needs to catch is never the least legible.

### Named Rules

**The Two Marks Rule.** Hazard Signal appears at most **twice** on any given screen, and
never on a control the user set. Active filters are marked in Drawing Ink; signal is
reserved for the focus ring, the highlighted pin, and the null-exclusion reversal. This is
what makes the cap survive a real search — marking filters in signal meant four filters
produced five orange marks, and the accent decayed to ambient exactly as the user got more
invested.

**The No-Warmth Rule.** Warm cream backgrounds, terracotta, clay accents, near-black
grounds with acid green, gradient washes and glassmorphism are banned outright. The ground
is cool and mineral or it is wrong.

**The Unknown Is Grey Rule.** An unstated value renders as an em dash in Gantry Steel,
never in Drawing Ink. Stated data is ink; absence is steel. A user must be able to tell
the two apart at scanning speed without reading.

## Typography

**One family: Google Sans** (with Google Sans Text, then system-ui). Weights 400–700 only;
the family carries no width axis.

**Character:** Neutral, geometric and unfussy — it recedes so the numbers dominate. The
label tier is separated by weight and tracking rather than by a condensed cut, because no
condensed cut exists in this family.

### Hierarchy

- **Display** (700, 38px, 1.05, −0.015em): Page titles on detail and cluster pages. Left
  aligned always.
- **Title** (700, 19px, 1.05): Result card headlines — the area-and-type line.
- **Heading** (700, 13px, +0.01em): Section headings, always over a 1px rule.
- **Body** (400, 15px, 1.55, max 70ch): Prose. The only tier that wraps at length.
- **Numeric** (600, 15px, tabular-nums, −0.01em): Every number in a spec strip, table or
  commercial line.
- **Label** (500, 11px, +0.015em, Gantry Steel): Spec labels, field labels, metadata.
  Sentence case.

Scale is a 1.25 ratio: 11 / 13 / 15 / 19 / 24 / 30 / 38.

### Named Rules

**The Tabular Figures Rule.** Any number a user might compare against another number uses
`font-variant-numeric: tabular-nums`. Proportional figures break the vertical scan, which
is the one thing this interface exists to support. This is not negotiable.

**The Sentence Case Rule.** Labels are sentence case. Never uppercase, never letterspaced
small caps, never a monospace face standing in for "technical".

## Layout

Desktop (≥1024px) is a fixed three-column shell with no outer page scroll: a 300px filter
rail, a 380px result list that scrolls, and the map filling the remainder. Each column
manages its own overflow.

Below 1024px the layout stacks: map sticky to the top 38vh, results scrolling beneath it,
and filters in a full-height sheet behind a sticky bottom bar carrying the active count.

Spacing rhythm is tight — 6 / 8 / 12 / 16 / 24px. Density is a feature: a manager
comparing twenty buildings wants more on screen, not more air.

**Named Rules**

**The Reserved Height Rule.** Result cards declare a `min-height` (170px) so a filter
change reflows without shifting the page. Cumulative Layout Shift on the search screen is
0 and must stay 0.

**The Text Equivalent Rule.** The result list is always present and never behind a tab on
desktop. It is the map's accessible equivalent, so the map may never be the only way to
read the data.

## Elevation & Depth

**There are no shadows in this system — none, anywhere, including overlays.** Depth is
carried entirely by a 1px border (Container Edge) and the tonal step from Concrete Paper
to Chalk Surface. The mobile filter sheet separates itself with a full-bleed ground and a
rule, not a drop shadow. MapLibre's own control shadows are explicitly overridden to none.

The one thing that looks like a shadow is not one: active chips use
`box-shadow: inset 0 0 0 1px` to thicken their border without shifting layout. That is a
stroke, not elevation, and it is permitted.

### Named Rules

**The Flat Forever Rule.** No `box-shadow` that casts. If a surface needs to feel above
another, raise its tone to Chalk Surface and give it a 1px edge. A soft grey card shadow
is the single fastest way to make this product look like the proptech apps it is defined
against.

## Shapes

Radius is near-absent and carries meaning by degree:

- **0px — the spec strip.** The title block is a hard grid; a rounded corner would soften
  the one element that must read as a drawing.
- **2px — cards and inputs.** Just enough to avoid a hairline-sharp corner artefact.
- **4px — chips.** The only pill-adjacent shape in the system, and still nowhere near a
  pill.

Nothing else is rounded. Nothing is circular except map pins, which are data marks scaled
by floor area.

Borders are always exactly 1px. Spec cells are separated by vertical hairlines; numbers
sit above a horizontal hairline with their label beneath — the dimension-line motif,
repeated everywhere and used nowhere decoratively.

## Components

### Spec strip (signature component)

The system's defining element. Five equal columns, fixed order — height, crane, power,
docks, floor — each cell a number over a 1px rule over an 11px label.

- **Never collapses, never reorders, never drops a cell** at any breakpoint down to 360px.
- An unstated spec occupies its slot with an em dash in Gantry Steel and a
  `title="Not stated in the listing"` tooltip.
- Cells clip with ellipsis rather than wrapping; long values get short forms
  (`Plain RCC` → `RCC`) rather than a reflowed grid.

### Chips

- **Shape:** 4px radius, 28px minimum height, transparent fill, 1px Container Edge border.
- **Active:** border and text switch to Drawing Ink, plus a 1px inset stroke. Never
  Hazard Signal — a filter is the user's choice, not a signal from the tool.
- **No-constraint options** ("Any") are resets, not selections: they never render pressed.
  A group with nothing pressed is the correct display of "no constraint here".

### Cards

- **Shape:** 2px radius, Chalk Surface fill, 1px Container Edge, no shadow.
- **Padding:** 12px. **Min-height:** 170px, reserved against reflow.
- **Selected (from a map pin):** 2px Drawing Ink outline, inset. Not Hazard Signal —
  selection is not a filter.

### Checkbox

Drawn, not native: a 24px transparent hit area containing a 14px drawn box (1px Drawing
Ink, 2px radius). Checked fills with Hazard Signal and a 2px Chalk inset. The hit area
meets the touch minimum without a heavy-looking control.

### Range inputs

The track is a 1px Drawing Ink line at 35% opacity; the thumb is a 2px × 14px vertical
tick — a gauge mark, not a knob. Focus turns the tick Hazard Signal.

### Map

Pins are circles coloured by availability and stepped in radius by floor area across four
buckets, so size reads before any label does. Clusters are Concrete Paper circles with a
1px Drawing Ink stroke. No auto-fly, no bouncing, no pulsing markers.

## Do's and Don'ts

### Do:

- **Do** keep the spec strip's five cells fixed in order and position at every breakpoint;
  shrink the type before you touch the grid.
- **Do** use `tabular-nums` on every comparable number.
- **Do** render unknowns as an em dash in Gantry Steel with a "Not stated in the listing"
  tooltip.
- **Do** carry depth with a 1px border and a tonal step to Chalk Surface.
- **Do** keep labels sentence case at 11px/500 with +0.015em tracking.
- **Do** count Hazard Signal before shipping a screen. Two is the cap, and none of them
  may be a control the user set.

### Don't:

- **Don't** add a `box-shadow` that casts — not on cards, not on hover, not on the mobile
  sheet.
- **Don't** introduce a warm cream or off-white ground, terracotta or clay accent, gradient
  wash, or glassmorphism.
- **Don't** render an unknown as `0`, `N/A`, or a hidden row.
- **Don't** uppercase a label or reach for a monospace face to signal "technical".
- **Don't** put area or rent above the building specs in any filter or table ordering —
  that inversion is the product's reason to exist.
- **Don't** number sections `01 / 02 / 03`. Nothing here is a sequence.
- **Don't** animate anything except the filter-change transition (120ms fade out, 200ms
  reflow, 0ms under `prefers-reduced-motion`). No scroll reveals, no hover lifts, no
  page-load sequences.
