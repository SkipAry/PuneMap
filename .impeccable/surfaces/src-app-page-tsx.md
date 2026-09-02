---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: []
---

## Scope

`/` — the search screen. Visitor mode: Operate. Replacement visual world; product truth, content and the null contract are unchanged.

## Audience and task

A factory or logistics manager sourcing a building around Pune, arriving with numbers (30,000 sq ft, 12m clear height, 10T crane, 150 HP). Task: narrow ~300 buildings to ~4 and phone a broker. Constraint: the result list stays the map's text equivalent.

## Direction contract

THESIS: An industrial estate's own wayfinding system — colour-coded zones, pictograms, sign panels floating over the territory. It refuses the three-column proptech shell where a map is boxed into a leftover column; here the territory is the page and the panels sit on it like signage.

OWN-WORLD: Full-bleed map ground. Floating sign panels: white at 94%, `backdrop-filter: blur(14px)`, 16px radius, 1px hairline, one soft shadow. Each of the eight clusters owns a zone hue used identically on pin, chip and card edge; availability rides pin ring style, never hue. One azure action accent (#1B6EF3) for controls. Google Sans throughout, tabular figures on every comparable number.

STORY: He recognises his corridor by colour before reading a word, filters on crane and height, and reaches a phone number.

FIRST VIEWPORT: Map fills the viewport. A floating top bar (66px) carries wordmark, search, filter trigger, basemap toggle (Light / Voyager) and a filled azure "+ Add space for free". Results ride a floating panel on the right (380px, inset 16px); cluster chips float along the bottom. Map centre stays clear of panels.

FORM: Estate wayfinding, candidate 5 of 7; seed key 9d52674d.

RAISE (from Viewfinder Bracket HUD, competitive): panels anchor to safe-area edges and the centre stays clear — never a panel over the pins being read.

RAISE (from Struck Cathode Gauze, declined): no dividers or boxes inside panels; separation by space and colour field alone.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Basemap for "Voyager": CARTO's own needs an API key; using OpenFreeMap Liberty as the keyless colourful equivalent until a key exists.
- Cluster hue set must stay ≥3:1 against the map ground in both basemap styles.
