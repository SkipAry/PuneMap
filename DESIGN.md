---
name: Pune Industrial Space
description: A map-first search tool for Pune industrial buildings, where every other surface is summoned rather than standing, fronted by a numbered document that argues for it.
colors:
  ink: "#101828"
  muted: "#5d6775"
  faint: "#98a2b3"
  action: "#1862dc"
  ground: "#eef1f5"
  surface: "#ffffff"
  rail: "#fbfbfa"
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
  hero:
    fontFamily: "Google Sans, Google Sans Text, system-ui, sans-serif"
    fontSize: "clamp(2.125rem, 5.4vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.03
    letterSpacing: "-0.032em"
  display:
    fontFamily: "Google Sans, Google Sans Text, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.018em"
  lede:
    fontFamily: "Google Sans, Google Sans Text, system-ui, sans-serif"
    fontSize: "clamp(1rem, 1.4vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
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
  readout:
    fontFamily: "Google Sans, Google Sans Text, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
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
  key:
    fontFamily: "Google Sans, Google Sans Text, system-ui, sans-serif"
    fontSize: "0.65625rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0.05em"
    textTransform: "uppercase"
rounded:
  mark: "5px"
  tile: "8px"
  control: "10px"
  tool: "12px"
  card: "14px"
  panel: "16px"
  pill: "999px"
spacing:
  hair: "6px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
layout:
  breakpoint-panel: "820px"
  breakpoint-wide: "1180px"
  toolbar-h: "60px"
  toolbar-max: "80rem"
  drawer-w: "min(300px, 86vw)"
  drawer-w-wide: "min(420px, 92vw)"
  detail-col: "minmax(420px, 34rem)"
  reading-measure: "48rem"
  landing-wrap: "68rem"
  topbar-h: "60px"
components:
  panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "0"
  drawer:
    backgroundColor: "{colors.rail}"
    textColor: "{colors.ink}"
    rounded: "0"
    padding: "10px"
    width: "{layout.drawer-w}"
  drawer-wide:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "0"
    padding: "0"
    width: "{layout.drawer-w-wide}"
  tool-tile:
    backgroundColor: "rgba(255, 255, 255, 0.92)"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.tool}"
    padding: "6px 12px"
    height: "32px"
  tool-field:
    backgroundColor: "rgba(255, 255, 255, 0.92)"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.tool}"
    padding: "8px 12px 8px 38px"
    height: "38px"
  cluster-tray:
    backgroundColor: "rgba(255, 255, 255, 0.95)"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "6px"
  icon-btn:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "9px"
    height: "34px"
    width: "34px"
  rail-link:
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.tile}"
    padding: "7px 8px"
  cluster-row:
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    padding: "6px 8px"
  dial:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.readout}"
    rounded: "{rounded.control}"
    padding: "8px 10px 9px"
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

**Creative North Star: "Territory First"**

The map is the territory and it holds the whole screen. Every other surface is summoned:
it arrives when the user asks for it, does one job, and leaves. Nothing stands on screen
holding ground it is not using.

The map is full-bleed at every width. Three surfaces stand on it: a 60px band across the
top carrying identity, the Map/List switch, the search field, Filters, the basemap switch
and Add space; a tray of cluster chips across the bottom; and the result list down the
start edge. All three are translucent, so the territory reads through them. Everything
else is summoned.

Sections and clusters live off-canvas in a drawer behind one button. The filter set lives
off-canvas in a second, wider drawer that slides in from the same edge. Both are native
`<dialog>` elements, so the browser owns focus trapping, Esc and inertness, and both
animate with a transform rather than with JavaScript holding the state.

**The band is the whole site's chrome, not the map's.** Every page wears it — floating on
the search screen, sticky on a document — with the same tiles at the same radius. Only its
width changes, to line up with whatever the page puts underneath it. Clicking a result used
to move the reader from a band of tiles to a plain white bar with a different control
language, which reads as arriving somewhere else entirely.

The result list is the exception to summoning, and deliberately so: it is the map's text
equivalent, so it is never something a reader has to go and find. From 820px it is always
on screen — a column down the start edge in map view, the full width in list view. Only a
phone, which has room for one or the other, makes it a switch.

Two arrangements were dropped on the way here. A standing 244px navigation rail spent a
quarter of every wide screen on navigation almost nobody was using. A result column
carrying a bank of six dials showed "Any" six times over before anyone had asked for
anything; the column stayed, the dials went.

`/` is the one surface that is not the tool. It is a numbered document that argues for
the tool, and it argues by running the real filter over the real listings rather than by
describing what the filter would do.

The colour system is unchanged and is still the wayfinding move: each cluster owns a hue,
used identically on the map pin, the drawer row, the card dot and the cluster page, so
"Chakan is amber" is learned once and read everywhere without a legend.

**Key Characteristics:**

- Full-bleed map at every width; one band of controls on it, one tray of clusters
- Every control in the band is its own translucent tile, not a compartment in a bar
- Navigation and filters are drawers that slide from the same edge, never standing chrome
- The result list is always on screen from 820px; a switch only where a phone forces one
- Nine zone hues carrying cluster identity across map, tray, drawer, cards and pages
- One action blue (#1862dc) for controls, never for identity
- Tabular figures on every comparable number, in fixed cells that never reorder
- A wordmark and no monogram — the name is the mark
- A landing page built as a numbered spec document, with live figures in it

## Colors

### Primary

- **Action Blue** (`#1862dc`): Every control the user can press — the Add-space button,
  Include-them, the focus ring, slider handles, checked boxes, a set dial's border. It
  marks *what you can do*, never *what a thing is*.

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
- **Surface** (`#ffffff`): The paper a surface is printed on. Cards, dials, the result
  column, the filter drawer, inputs, and the reading pages' column. Body copy set straight
  onto the Ground was the one place on the site that read as unfinished rather than as a
  choice, so About, Privacy and List a property sit on paper like everything else.
- **Ground** (`#eef1f5`): The page behind everything, the map fallback, the bed the locator
  column sits on, and the margin around a reading page's paper.
- **Rail** (`#fbfbfa`): The menu drawer only - a half-step off Surface, so the drawer reads
  as a different kind of surface from the column it slid over.
- **Panel** (white at 94%): Surfaces that genuinely float over the map, on a 14px blur —
  the result column, the map's own controls, the phone sheet.
- **Line** / **Line-strong** (ink at 8% / 16%): Borders and dividers.

### Named Rules

**The Zone Rule.** A cluster owns a hue and carries it identically on the map pin, the
drawer row, the card dot and its own page. Availability never takes a hue — it rides the
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

- **Hero** (700, clamp 34→56px, 1.03, −0.032em): The landing headline. The only type on
  the site that goes past the app scale, and it exists on one surface.
- **Display** (700, 36px, 1.15, −0.018em): Page titles on reading pages.
- **Lede** (400, clamp 16→18px, 1.55, muted): The paragraph under a landing heading.
- **Title** (700, 18px): Card headlines and dialog headings.
- **Body** (400, 15px, 1.5, max ~62ch): Prose.
- **Numeric** (600, 15px, tabular-nums): Every comparable number.
- **Readout** (700, 22px, tabular-nums, −0.025em): A dial's value. Its unit rides along at
  11px in Muted, so the number keeps the weight and the unit does not compete.
- **Control** (500, 13px): Chips, buttons, segmented controls.
- **Label** (500, 11px, +0.01em, muted): Spec labels and metadata. Sentence case.
- **Key** (500, 10.5px, +0.05em, uppercase, muted): The one uppercase tier, reserved for a
  dial's name and a landing panel's header — a legend engraved on a housing, not a heading.

App scale: 11 / 13 / 15 / 18 / 22 / 28 / 36.

### Named Rules

**The Tabular Figures Rule.** Any number a user might compare against another uses
`font-variant-numeric: tabular-nums`. Proportional figures break the vertical scan, which
is the one thing this interface exists to support.

**The Sentence Case Rule.** Labels are sentence case. The Key tier is the single exception
and it is not a heading — it names a control, the way a legend is engraved beside a gauge.
Never letterspaced small caps, never monospace standing in for "technical".

**The Measure Belongs To The Text Rule.** A `ch` measure is set on the element that
carries the font size, never on a wrapper. `max-w-[24ch]` on a 15px div around a 56px
headline is a 192px column, which is how the landing hero first shipped and had to be
fixed.

## Layout

### The search screen

The map is `absolute inset-0` at every width. Over it:

- **The band.** Full width at `top: 0`, 60px, transparent with a hairline under it, its
  contents capped at 80rem and centred. Left to right: brand tile with the menu button,
  Map/List switch, search field (`flex: 1`), Filters, basemap switch, Add space. The
  switches drop out below their breakpoints — Map/List under 640px, basemap under 1180px —
  leaving menu, search, Filters and Add space, which fit 360px.
- **The tray.** Centred at `bottom: 1rem`, scrolling horizontally, holding "All Pune" and
  every cluster with live stock. On a phone it also carries the Map/List switch.
- **The list.** Inset under the band and above the tray. From 820px it is always present:
  384px wide down the start edge in map view (416px past 1180px), full width capped at
  80rem in list view. Its card grid is keyed to the *view*, not the viewport — one column
  as a sidebar, two from 700px and three from 1100px once it has the width — because at
  1100px the same window holds one column beside a map and three without it. Below 820px
  it is hidden in map view, and the tray's Map/List chip brings it back.
- MapLibre's own controls sit top-left with a `margin-top` clearing the band.

**The opening view is fitted to the listings**, once, on first load — bounds of every
listing that carries coordinates, with padding measured rather than assumed: the column
width is read from `--list-w` so it cannot drift from the CSS, and the sample-data warning
is measured because it is conditional. `maxZoom: 11.5` stops a single surviving listing
from opening at street level, where a lone pin says nothing about where it is. After that
first fit the viewport belongs to the user, and a filter change never moves it.

The map opens on Voyager. The style is set when the map is built rather than swapped after
load, which used to cost a second style fetch and show the wrong basemap while it happened.

### The document pages

The same band, sticky, then:

- `.shell--detail` (`minmax(420px, 34rem) / 1fr`) — listing and cluster pages. The text
  column scrolls with the document; the second column holds a static SVG locator that is
  `position: sticky` under the band at `100dvh - 60px`. Sticky rather than a fixed pane, so
  the page keeps ordinary document scrolling and the band stays put.
- Reading pages — About, Privacy, List a property, and the 404 — are one centred column of
  paper at a 48rem measure, with the ground showing around it.

The listing page grows a fixed call bar at the bottom below 768px, because the phone call
is the conversion and it would otherwise sit below the entire specification.

### The landing page

`.wrap` is a 68rem measure with 1.25rem gutters. Sections are separated by a hairline and
`clamp(2.75rem, 6vw, 4.5rem)` of vertical space — never by a tinted band. Each carries a
two-digit marker (`01`, `02`, …) in Faint beside its heading, which is what makes the page
read as a specification rather than as marketing. The hero is `1fr / 25rem` from 1024px
and stacks below that; sections 02 and 04 are `1fr / 22rem`, with the prose at its own
measure on the left and a figure of evidence on the right.

### The band's three measures

The band spans the window and centres its tiles on whatever the page puts beneath them, so
its first tile starts where the content starts and its last ends where the content ends:

- **wide** — no cap. Listing and cluster pages, whose content begins at the window edge.
- **reading** — 48rem from 820px. About, Privacy, List a property, the 404.
- **wrap** — 65.5rem. The landing. Its `.wrap` is a 68rem *border* box holding 1.25rem of
  padding either side, so matching it means taking the measure inside that padding; capping
  at 68rem leaves the band 12px wide on each side of the content.

### Named Rules

**The Summoned Surface Rule.** If a surface is not being used right now, it is not on
screen. Navigation and filters slide in on request and slide out again. The test is
whether a first-time visitor would use it in their first ten seconds; the map and the
result list pass, a list of section links does not.

**The One Edge Rule.** Everything that slides, slides in from the inline start. Two
drawers arriving from two different edges would make the user learn the interface twice.

**The Standing Surfaces Rule.** The map carries a band, a tray and the result list, and
nothing else stands on it. A fourth permanent surface has to displace one of those three,
not join them.

**The Reserved Height Rule.** Result cards declare `min-height: 148px` so a filter change
reflows without shifting the page. CLS on the search screen is 0 and must stay 0.

**The Text Equivalent Rule.** The result list is always present and never behind a tab on
desktop — it is the map's accessible equivalent.

**The Unlayered Cascade Rule.** A component class that sets `display` is shown and hidden
with a plain media query, never with `hidden` / `md:hidden`. These classes are unlayered
and beat Tailwind's layered utilities, so the utility silently loses and the element stays
on screen at a width it has no business being at. This has now happened five times —
`.rail` twice, `.call-bar`, `.tool-seg`, `.tool-btn` — and it never announces itself,
because nothing errors. When a component class and a utility disagree about the same
property, delete the losing declaration rather than stacking an override on it.

**The Container, Not The Window Rule.** A grid inside a fixed-width column is keyed to that
column, never to the viewport. `md:grid-cols-2` in a 544px reading column gives each card
248px, and a five-cell spec strip in 248px ellipses the height and the power off every one
of them — 31 clipped values on a single cluster page. The same rule sends the result list's
card grid to the *view* rather than the window, because at 1100px the same window holds one
column beside a map and three without it.

**The Shrinkable Card Rule.** A card in a grid carries `min-width: 0`. A grid item may not
shrink below its min-content by default, and a listing card's min-content is about 350px of
nowrap spec cells, which burst a 367px column and pushed the whole page sideways. The strip
is built to clip with an ellipsis, so it is allowed to — but see the rule above: it should
never have to.

## Elevation & Depth

This system uses real depth, because on the search screen everything genuinely does float
above a map and needs to read that way. Two shadows only:

### Shadow Vocabulary

- **Panel** (`0 8px 28px rgba(16,24,40,0.12), 0 1px 3px rgba(16,24,40,0.08)`): The result
  column, the floating masthead, the map's own control cluster, and a card on hover.
- **Raised** (`0 2px 8px rgba(16,24,40,0.1)`): Small controls that sit above a panel —
  action buttons, the active segment, slider handles.

`backdrop-filter: blur(14px) saturate(1.4)` rides with Panel, which is what makes those
surfaces read as glass over territory rather than as boxes covering it. Drawers are the
exception: they are opaque and carry a deeper `0 24px 64px` shadow, because a drawer is
not hovering over the map — it has come in front of the whole screen, and its backdrop
says so.

The document pages carry no shadow at all. A sticky masthead with a 1px underline and a
column with a 1px border are the entire depth budget there.

### Named Rules

**The Two Shadows Rule.** Panel and Raised are the entire vocabulary for floating
surfaces. The drawer shadow is not a third tier — it belongs to the modal layer, with the
backdrop that comes with it.

**The Earned Float Rule.** Translucency and blur are for surfaces sitting over the map. A
column in a document gets a border.

## Shapes

- **999px — controls.** Chips, buttons and segments are pills.
- **16px — floating panels.** 14px — cards and map chrome. 10px — inputs and dials.
  8px - spec tiles, drawer rows and the focus ring. 5px — the drawn checkbox mark, the one
  step small enough to stay square-ish at 16px.
- **0 - full-height surfaces.** A drawer and a document column have square corners. Only
  something that floats free of an edge gets rounded.
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

**It stays readable at 360px by giving up padding, not characters.** Five cells leave about
44px for a value there and "200HP" wants 48, so below 390px the cell drops its inline
padding to 4px and the figure drops one step to 13px. A clipped spec number is the one
failure this component cannot have: the whole product is the claim that you can read these.

### Toolbar tile

Everything in the band is one of these: 12px radius, white at 92% over a 12px blur, a
1px line border and the Raised shadow. Squarer than the pill controls used inside a page,
because a row of pills over a map reads as loose beads while a row of tiles reads as one
band. Three shapes share it — the segmented switch (2px padding, 8px inner buttons, the
active one filled Action Blue), the button (32px, 13px semibold, icon plus label), and the
search field (38px, icon inset 38px from the start edge).

### Cluster tray

One 16px-radius container at the bottom of the map, white at 95% over a blur, scrolling
horizontally. Inside it a chip is a tile, not a pill: transparent until pressed, then
filled with its zone hue. It holds "All Pune" as the reset and every cluster with live
stock.

The clusters were here once before, as loose chips floating directly on the map, where the
result panel covered between two and four of them at every width. They came back when the
panel left. One tray rather than nine floating pills, so they read as a set.

### Dial

A bordered readout: the spec name in Key with a chevron, above the value in Readout with
its unit at 11px. Set takes an Action Blue border, a 5% Action fill and an Action-coloured
key — a filled state rather than a second border drawn inside the first. Three of them
carry the landing hero's requirement.

### Menu drawer

`min(300px, 86vw)`, full height, on the Rail colour, sliding in from the inline start.
Wordmark and a close button, three section links, then every cluster with live stock as a
row carrying its hue dot, name and count, and a quiet "List it free, no fee" prompt at the
foot. One component, two jobs: on the search screen the rows are buttons that toggle a
cluster filter; on a document page the same rows are links to that cluster's page. Any row
that acts closes the drawer behind itself.

### Filter drawer

The same drawer, wider (`min(420px, 92vw)`) and on Surface, holding the full filter set
with "Show N" in its header. It arrives from the same edge as the menu, so there is one
place things come from.

Both drawers are native `<dialog>` opened with `showModal()`. The slide is a `transform`
transition with `overlay`/`display` set to `allow-discrete` and a `@starting-style` rule,
so it animates open *and* closed without React owning the animation state.

Icons are drawn as inline SVG. An emoji standing in for an icon set renders differently on
every platform and belongs to none of them.

### Masthead

Brand tile carrying the menu button and the wordmark, then the page's own controls, then a
single action at the end. No monogram: a lettermark in a rounded square beside a
five-syllable name is the default move of a template, and it was adding a logo where the
name already does the work.

Floating over the map on the search screen; sticky and solid everywhere else. The search
screen and the landing build their own row from the shared tiles, because one leads with
Filters and a basemap switch and the other with "Open the map"; every other page uses the
component. A nav item pointing at the page you are on renders `aria-current="page"` in
Action Blue rather than being dropped, so the row does not reshuffle when you land there.

### Static locator

An inline-SVG locator diagram used as the second column on listing and cluster pages:
nearby listings as zone-coloured ticks, this one called out with a short surveyor's mark,
plus a Pune reference mark, a compass phrase ("18 km north-west of Pune") and a scale bar.
No tile service, no key, no client JavaScript.

Three rules keep it honest and full:

- **Bounds are fitted to the frame's aspect before projecting**, so the projection stays
  isotropic and the scale bar does not lie in one direction.
- **The frame must hold this plot and Pune; context may only widen it while it stays
  near** — a neighbour is a point no further from this shed than Pune is. The listing page
  passes every listing on the site, and without that rule a single outlier set the bounds
  and squeezed the eight real clusters into a third of the drawing.
- **The viewBox matches the box it is given** — 5:3 inline, 15:14 in the near-square pane.
  One ratio for both letterboxed the pane to 63% of its height, which reads as a
  half-empty diagram rather than as the frame it is.

The callout is a mark, not a pair of axes. Full-width rules through the plot read as a
graph and competed with the point they were identifying.

### Zone chip

A pill with a 9px dot in its cluster hue. Active fills with that hue and turns the text
white. Used on document pages and the 404; the menu drawer carries the same job inside
the app.

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
renders hollow (white fill, zone ring); leased out drops to 45% opacity. Clusters step
15/19/24px by point count and go white with ink text when their members span more than one
zone.

**The grouping radius is in pixels, so it is tied to the opening zoom.** It buys a distance
on the ground only at one zoom level, and changing where the map opens silently changes
what it does: fitting the view to the listings put it three times closer than the radius
had been chosen for, which split one corridor into two same-coloured bubbles reading "2"
and "11" beside a tray that said 13. Retune it whenever the opening view moves.

### Dialog

Native `<dialog>` so the browser owns focus trapping, Esc and inertness. 16px radius, solid
white, a deep shadow, and a scrim of ink at 45% with a 2px blur.

### Sample notice

A red-tinted band above any set of listings presented as inventory, shown only while every
row in it is scaffolding. It keys off the non-allocatable `+91555` phone prefix, so it
removes itself the moment real listings land rather than waiting for someone to remember.

It lives **inside** the result list, under its header, because that is where the inventory
it warns about is presented. A floating copy exists for the one screen with no list to hold
it — a phone in map view — and is hidden everywhere else. Floating on every screen, it
landed on top of the list's own heading and count.

## Do's and Don'ts

### Do:

- **Do** take a cluster hue from `src/lib/clusters.ts`; never hard-code one.
- **Do** keep the spec strip's five cells fixed in order and position at every breakpoint.
- **Do** use `tabular-nums` on every comparable number.
- **Do** render unknowns as an em dash in Faint with a "Not stated in the listing" tooltip.
- **Do** let the map keep the screen. A new surface earns its space or it slides away.
- **Do** show what the data spans where a control is unset, rather than the word "Any".
- **Do** put a `ch` measure on the element that sets the font size.
- **Do** let a grouped pin stay white when its members span more than one zone.
- **Do** compute a landing figure from the real data through the real filter. A number on
  that page that cannot be traced to `getListings()` does not belong on it.
- **Do** read the evidence back against the sentence beside it. Putting the spec coverage
  on screen contradicted a paragraph claiming listings are half-empty, because height and
  docks are stated on 55 of 56. The copy changed, not the table.
- **Do** key a grid to the column it sits in, not to the window.
- **Do** open the map on the listings, and only once. After that the viewport is the
  user's.

### Don't:

- **Don't** give navigation permanent width. If it is not being used, it is off-canvas.
- **Don't** introduce a second edge for things to slide from.
- **Don't** put a monogram beside the wordmark.
- **Don't** hide a component class with a Tailwind utility. Unlayered CSS wins; use a
  media query in the same stylesheet. Five times now.
- **Don't** let a page set its body copy straight onto the ground. Content goes on paper.
- **Don't** trust a grep of the HTML to tell you what a page looks like. The search screen
  sat on its loading fallback in production while every route check returned 200, and the
  404's band was in the RSC payload rather than the shell. Open it in a browser.
- **Don't** give a card a coloured side border. The dot carries the zone; a 3px edge is the
  standard tell of a generated interface.
- **Don't** colour anything that is neither a zone nor an action.
- **Don't** use a zone hue to mean availability, or an availability colour to mean a zone.
- **Don't** invent a third shadow.
- **Don't** render an unknown as `0`, `N/A`, or a hidden row.
- **Don't** put area or rent above the building specs in any filter, dial or table
  ordering — that inversion is the product's reason to exist.
- **Don't** animate anything except the 120ms filter-change fade, and honour
  `prefers-reduced-motion` by cutting it to 0ms.
