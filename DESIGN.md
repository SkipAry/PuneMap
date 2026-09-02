---
name: Pune Industrial Space
description: A map-first search tool for Pune industrial buildings, signed like an industrial estate.
colors:
  ink: "#101828"
  muted: "#5d6775"
  faint: "#98a2b3"
  action: "#1862dc"
  ground: "#eef1f5"
  surface: "#ffffff"
  panel: "rgba(255, 255, 255, 0.94)"
  line: "rgba(16, 24, 40, 0.08)"
  line-strong: "rgba(16, 24, 40, 0.16)"
  tile: "rgba(16, 24, 40, 0.035)"
  track: "rgba(16, 24, 40, 0.12)"
  segment-bed: "rgba(16, 24, 40, 0.06)"
  scrim: "rgba(16, 24, 40, 0.45)"
  zone-chakan: "#e07b39"
  zone-bhosari: "#2e7fd4"
  zone-talegaon: "#12a594"
  zone-ranjangaon: "#8659d6"
  zone-wagholi: "#de4a5f"
  zone-nigdi: "#c79213"
  zone-hinjawadi: "#1b96b8"
  zone-pirangut: "#3e9e5a"
  zone-other: "#7a8290"
typography:
  display:
    fontFamily: "Google Sans, Google Sans Text, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.018em"
  title:
    fontFamily: "Google Sans, Google Sans Text, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.018em"
  body:
    fontFamily: "Google Sans, Google Sans Text, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  numeric:
    fontFamily: "Google Sans, Google Sans Text, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
    fontFeature: "tabular-nums"
  control:
    fontFamily: "Google Sans, Google Sans Text, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "normal"
  label:
    fontFamily: "Google Sans, Google Sans Text, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0.01em"
rounded:
  mark: "5px"
  tile: "8px"
  control: "10px"
  card: "14px"
  panel: "16px"
  pill: "999px"
spacing:
  hair: "6px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
components:
  panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "0"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "12px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
    height: "32px"
  chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
    height: "32px"
  btn-action:
    backgroundColor: "{colors.action}"
    textColor: "{colors.surface}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "7px 14px"
    height: "36px"
  btn-quiet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "7px 14px"
    height: "36px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
    height: "40px"
  spec-cell:
    backgroundColor: "{colors.tile}"
    textColor: "{colors.ink}"
    typography: "{typography.numeric}"
    rounded: "{rounded.tile}"
    padding: "6px"
---

# Design System: Pune Industrial Space

## Overview

**Creative North Star: "The Estate Wayfinding System"**

An industrial estate does two things to make itself navigable. It signs its zones by
colour, so you find your corridor before you read a word. And it hangs those signs *over*
the territory rather than printing a map on a board somewhere else.

Both are literal here. The map is the page — not a panel in a three-column shell, but the
ground everything else floats on. Each of the eight clusters owns a hue, and that hue
appears identically on the map pin, the filter chip, the card dot and the cluster page, so
"Chakan is amber" is learned once and then read everywhere without a legend.

The register is **colourful, minimal and friendly**: saturated zone hues doing real work,
one blue for actions, and otherwise a near-white ground that stays out of the way. Colour
is never decoration in this system. Every hue on screen is either a zone or an action, and
if a mark cannot say which of those it is, it should not be coloured.

**Key Characteristics:**

- Full-bleed map; every other surface is a floating sign panel
- Nine zone hues carrying cluster identity across map, chips, cards and pages
- One action blue (#1862dc) for controls, never for identity
- Translucent white panels at 94% with a 14px backdrop blur
- Pill-shaped controls; 14–16px radii on cards and panels
- Tabular figures on every comparable number

## Colors

### Primary

- **Action Blue** (`#1862dc`): Every control the user can press — the Add-space button,
  Include-them, the focus ring, slider handles, checked boxes. It marks *what you can do*,
  never *what a thing is*.

### Secondary

The nine zone hues. Spread around the wheel at similar chroma and lightness so no cluster
shouts louder than another, and each clears 3:1 on both basemaps.

- **Chakan** `#e07b39` · **Bhosari** `#2e7fd4` · **Talegaon** `#12a594` ·
  **Ranjangaon** `#8659d6` · **Wagholi** `#de4a5f` · **Nigdi** `#c79213` ·
  **Hinjawadi** `#1b96b8` · **Pirangut** `#3e9e5a` · **Other** `#7a8290`

They live in `src/lib/clusters.ts` and are mirrored nowhere else.

### Neutral

- **Ink** (`#101828`): All primary text and the pressed-chip fill.
- **Muted** (`#5d6775`): Secondary text and labels. Darkened from #667085, which cleared
  4.5:1 on white but only reached 4.39 on the Ground the reading pages sit on.
- **Faint** (`#98a2b3`): Unstated values and placeholders — visibly weaker than real data.
- **Ground** (`#eef1f5`): The page behind everything, and the map fallback.
- **Panel** (white at 94%): Every floating surface, over a 14px blur.
- **Line** / **Line-strong** (ink at 8% / 16%): Borders and dividers.

### Named Rules

**The Zone Rule.** A cluster owns a hue and carries it identically on the map pin, the
filter chip, the card dot and its own page. Availability never takes a hue — it rides the
pin's ring (solid, hollow for built-to-suit, faded for leased out) so both encodings share
one pin without fighting.

**The Earned Colour Rule.** A grouped map pin wears a zone colour only when *every*
listing inside it belongs to that zone. A genuinely mixed group stays white with ink text.
Averaging two hues would produce a colour that means nothing, and this map's colours must
always mean something.

**The Two Jobs Rule.** Every coloured mark on screen is either a zone or an action. If a
mark cannot say which, it is not coloured.

## Typography

**One family: Google Sans** (with Google Sans Text, then system-ui). Weights 400–700; the
family has no width axis, so tiers are separated by size, weight and tracking.

**Character:** Geometric, friendly and highly legible at small sizes — signage typography,
which is what an estate is actually labelled with.

### Hierarchy

- **Display** (700, 36px, 1.15, −0.018em): Page titles on reading pages.
- **Title** (700, 18px): Card headlines and dialog headings.
- **Body** (400, 15px, 1.5, max ~62ch): Prose.
- **Numeric** (600, 15px, tabular-nums): Every comparable number.
- **Control** (500, 13px): Chips, buttons, segmented controls.
- **Label** (500, 11px, +0.01em, muted): Spec labels and metadata. Sentence case.

Scale: 11 / 13 / 15 / 18 / 22 / 28 / 36.

### Named Rules

**The Tabular Figures Rule.** Any number a user might compare against another uses
`font-variant-numeric: tabular-nums`. Proportional figures break the vertical scan, which
is the one thing this interface exists to support.

**The Sentence Case Rule.** Labels are sentence case. Never uppercase, never letterspaced
small caps, never monospace standing in for "technical".

## Layout

`/` is full-bleed: the map fills the viewport and everything floats on it. A 60px top bar
inset 12px, a 390px result panel inset right, the zone legend centred along the bottom,
and the basemap switch bottom-left. Below `lg` the result panel becomes a bottom sheet
starting at 46% height, so the territory stays visible; it collapses to a 3.5rem handle.

Reading pages (`/shed/[slug]`, `/[cluster]`, `/about`, `/list-your-space`) use a solid
sticky header and a centred column on the ground colour.

### Named Rules

**The Clear Centre Rule.** Panels hug the safe-area edges and the centre of the map stays
clear. A panel must never sit over the pins a user is reading.

**The Reserved Height Rule.** Result cards declare `min-height: 148px` so a filter change
reflows without shifting the page. CLS on the search screen is 0 and must stay 0.

**The Text Equivalent Rule.** The result list is always present and never behind a tab on
desktop — it is the map's accessible equivalent.

## Elevation & Depth

This system uses real depth, because panels genuinely float above a map and need to read
that way. Two shadows only:

### Shadow Vocabulary

- **Panel** (`0 8px 28px rgba(16,24,40,0.12), 0 1px 3px rgba(16,24,40,0.08)`): Any floating
  sign panel, and a card on hover.
- **Raised** (`0 2px 8px rgba(16,24,40,0.1)`): Small controls that sit above a panel —
  action buttons, the active segment, slider handles.

Panels also carry `backdrop-filter: blur(14px) saturate(1.4)`, which is what makes them
read as glass over territory rather than as opaque boxes covering it.

### Named Rules

**The Two Shadows Rule.** Panel and Raised are the entire vocabulary. A third shadow means
a new elevation tier was invented rather than reused.

## Shapes

Everything is generously rounded, because signage is:

- **999px — controls.** Chips, buttons and segments are pills.
- **16px — floating panels.** 14px — cards and map chrome. 10px — inputs. 8px — spec
  tiles and the focus ring. 5px — the drawn checkbox mark, the one step small enough to
  stay square-ish at 16px.
- Circles only for map pins and zone dots, which are data marks.

Borders are 1px. The card is a plain rounded rectangle with **no coloured side border** —
the zone reaches it through the dot beside the locality.

## Components

### Spec strip (signature component)

Five equal tiles, fixed order — height, crane, power, docks, floor — each a number over an
11px label on a faint tile. Never collapses, reorders or drops a cell at any breakpoint
down to 360px. An unstated spec occupies its slot with an em dash in Faint plus a
`title="Not stated in the listing"` tooltip. Long values take short forms
(`Plain RCC` → `RCC`) rather than reflowing the grid.

### Zone chip

A pill with an 9px dot in its cluster hue. Active fills with that hue and turns the text
white. Doubles as the map legend and the cluster filter — one control, two jobs.

### Chips (non-zone)

White pill, 1px border, 32px min height. Active fills Ink. No-constraint options ("Any")
are resets and never render pressed.

### Buttons

- **Action:** Action Blue pill, white text, 36px, Raised shadow.
- **Quiet:** white pill with a 1px border; the cancel and secondary role.

### Cards

White, 14px radius, 1px line border, no shadow at rest and Panel shadow on hover. Selected
from a map pin: a 2px Action Blue ring.

### Map pins

Circle in the cluster's zone hue, radius stepped by built-up area across four buckets, with
a soft same-hue halo at 18% so a pin stays findable over busy basemap colour. Built-to-suit
renders hollow (white fill, zone ring); leased out drops to 45% opacity.

### Dialog

Native `<dialog>` so the browser owns focus trapping, Esc and inertness. 16px radius, solid
white, a deep shadow, and a scrim of ink at 45% with a 2px blur.

## Do's and Don'ts

### Do:

- **Do** take a cluster hue from `src/lib/clusters.ts`; never hard-code one.
- **Do** keep the spec strip's five cells fixed in order and position at every breakpoint.
- **Do** use `tabular-nums` on every comparable number.
- **Do** render unknowns as an em dash in Faint with a "Not stated in the listing" tooltip.
- **Do** keep the map centre clear of panels.
- **Do** let a grouped pin stay white when its members span more than one zone.

### Don't:

- **Don't** give a card a coloured side border. The dot carries the zone; a 3px edge is the
  standard tell of a generated interface.
- **Don't** colour anything that is neither a zone nor an action.
- **Don't** use a zone hue to mean availability, or an availability colour to mean a zone.
- **Don't** invent a third shadow.
- **Don't** render an unknown as `0`, `N/A`, or a hidden row.
- **Don't** put area or rent above the building specs in any filter or table ordering —
  that inversion is the product's reason to exist.
- **Don't** animate anything except the 120ms filter-change fade, and honour
  `prefers-reduced-motion` by cutting it to 0ms.
