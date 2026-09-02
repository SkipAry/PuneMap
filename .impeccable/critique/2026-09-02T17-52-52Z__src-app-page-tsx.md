---
target: /
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 4
target_identity: "file:C:\\Users\\udgar\\OneDrive\\Desktop\\Projects\\Industrymap\\src\\app\\page.tsx"
target_fingerprint: "sha256:46e0576b21e2013dbf397b4586010c5ec7b0bef7fcc79e0bada74c098b76f851"
target_path: "C:\\Users\\udgar\\OneDrive\\Desktop\\Projects\\Industrymap\\src\\app\\page.tsx"
timestamp: 2026-09-02T17-52-52Z
slug: src-app-page-tsx
---
Method: dual-agent (A: design review · B: detector + browser evidence)

**Evidence caveat.** During Assessment A the local server was serving a stale build — the HTML referenced `webpack-1a7109b326bc338a.js` while disk held `webpack-f770e18f0301afd5.js`, so that request 400'd and **React never hydrated**. Independently confirmed, and confirmed **local-only**: the same check against production returned 200. Consequence: no click interaction, mobile filter sheet, map behaviour, or the 120ms filter transition was exercised live. Every filter state was instead driven through the URL against SSR (which renders correctly), and interaction findings are source-derived. The server has since been restarted and now serves matching chunks.

## Design Health Score

Mode: **Operate**. All ten heuristics apply — this is a task surface, so Flexibility (7) and Help (10) are scored, not `n/a`.

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | `?crane=40` leaves all five crane chips unpressed with no readout anywhere, while the header still counts it as a filter |
| 2 | Match System / Real World | 4 | Domain terms used exactly and unsoftened; lakh grouping correct; specs-before-commercials matches the user's own mental order |
| 3 | User Control and Freedom | 2 | `router.replace` on every filter write — Back exits the search instead of undoing a filter; no per-filter revert |
| 4 | Consistency and Standards | 2 | `.chip` carries three unrelated semantics; Docks no-constraint is `0` while Crane's is `Any`; height/power chips toggle off on re-click, crane/docks don't |
| 5 | Error Prevention | 2 | `crane` is the one URL param `parseFilters` never clamps; the `0` Docks chip invites the inverse mental model |
| 6 | Recognition Rather Than Recall | 3 | Every control text-labelled, no icon-only anything — but Cluster sits below the rail fold and mobile collapses active filters to a bare count |
| 7 | Flexibility and Efficiency | 3 | URL-as-state restores exactly on cold load; preset chips are real accelerators — but no numeric entry for a user defined by exact numbers |
| 8 | Aesthetic and Minimalist Design | 3 | Genuinely disciplined, but the Two Marks Rule breaks structurally at 4 filters (5 signal marks) |
| 9 | Error Recovery | 2 | Empty state names the closest miss, but it isn't a link, isn't quantified, and the only exit is Clear all |
| 10 | Help and Documentation | 2 | The entire null contract is explained by `title=` — hover-only, inert on touch, which PRODUCT.md names as a primary context |
| **Total** | | **26/40** | **Acceptable — significant improvements needed** |

## Design Specificity Verdict

**Authored for industrial-shed search. Not category-interchangeable.**

**LLM assessment.** Lifting this composition into another product would break it. The spec strip is domain-shaped rather than layout-shaped: five fixed cells (`height / crane / power / docks / floor`) at 62px each at 360px, all 25 on-screen values un-clipped, order never varying. The rail's vertical order is an argument, not a default — Building specs occupies 637px before Size and 772px before Commercials, inverting every competitor named in PRODUCT.md, and paying a real cost for it. `Provision only` as a crane value distinct from both null and zero is knowledge of the building, not a component-library affordance. The null-exclusion notice exists nowhere in any UI kit.

Where it drifts generic: the masthead is anyone's, the mobile "Filters · N active" bar is the standard portal pattern, and **the map is the most interchangeable element on screen** — 46% of desktop, 38% of the phone, with no industrial reading beyond pin-radius-by-area, an encoding invisible until already known.

**Deterministic scan.** CLI detector, exit 2, **1 finding**: `design-system-font-size` (advisory) at `src/app/globals.css:298` — `font-size: 10px` on `.maplibregl-ctrl-attrib`, off the 11/13/15/19/24/30/38 ramp. Verified real. It is third-party map chrome, but it is now a genuine DESIGN.md violation since the ramp is documented.

In-page detector across three views found: `tight-leading` (line-height 1.20 vs 1.30 floor), `text-overflow` on `span.spec-label.truncate` (185–200px), and on the detail page `shape-assembled-illustration` (inline SVG, 57 primitives).

**Where they agree / disagree.** The detector and the review agree on nothing directly — which is itself the finding. The detector found one advisory nit and three pattern hits; the review found four P1s it cannot see. Assessing the three in-page hits:

- `tight-leading` — **false positive.** It fires on `.spec-label`, an 11px single-line label. 1.2 leading on a one-line label is correct; the rule targets body copy.
- `text-overflow` — **partial false positive.** `truncate` is intentional and visually ellipsised, so it isn't a defect on the card. But it *is* real on the masthead subtitle, which degrades to "Sheds, wareho…" at 360px while carrying no information — that should simply drop below `sm`.
- `shape-assembled-illustration` — **false positive.** The 57 primitives are the plot-plan locator: data, not decorative shape assembly.

**Visual overlays.** Injection succeeded on all three views and the overlay server was started and confirmed stopped. The overlays are no longer live — the tab has since been closed and the server killed, so there is nothing for you to look at now.

## Overall Impression

The reading surface is genuinely excellent and the control layer is where every point is lost. The spec strip, the null contract, and the specs-before-commercials rail order are the best things here and they are all *display*. The moment the user tries to act — undo a filter, type a number he already knows, reach a broker — the design thins out. 26/40 is an honest score for a product whose core idea is fully realised and whose interaction model is not yet.

The single biggest opportunity: **the null-exclusion disclosure is the most defensible thing in this product and it is set in the smallest type on the screen.**

## What's Working

**1. The spec strip survives 360px intact — and that is the whole product.** Five cells at exactly 62px, 25 values un-clipped, zero horizontal overflow, order never varying. It holds because the type shrinks and the grid doesn't, and because `tabular-nums` sits on `.num` rather than being sprinkled — so `15.0m / 12.0m / 16.5m` align digit-for-digit down a column. That mechanism is the difference between this and a spreadsheet, at the hardest breakpoint.

**2. Filter order is a stated argument.** 637px of rail before Size. It costs something real — Cluster falls below the fold — and the design pays it deliberately. The first thing a returning user's hand learns is the spec block.

**3. The null contract is implemented end to end.** Verified in a single DOM read: em dash in Gantry Steel (visually distinct from ink at scanning speed), `title="Not stated in the listing"`, a live count of exactly what the filter removed, and one control that reverses it. `?crane=10` hid 32 of 60 and the screen said so in plain integers. Commercial search products essentially never disclose the size of what they hide.

## Priority Issues

**[P1] Back does not undo a filter — it exits the search.**
- *Why it matters:* The interaction model is "tighten until too tight, then loosen," and the universal loosening gesture is Back. Here it leaves the site, or — after a click into `/shed/[slug]` — returns to the pre-filter state and destroys the shortlist. There is no undo of any kind except the nuclear Clear all.
- *Fix:* `router.push` for user-initiated filter changes; keep `replace` only for programmatic normalisation.
- *Suggested command:* `/impeccable harden`

**[P1] An active crane filter can be completely invisible.**
- *Why it matters:* `crane` is the only spec with no numeric readout, and the only param `parseFilters` doesn't clamp (`n > 0`, no ceiling — verified). At `?crane=40` all five chips read unpressed, nothing on screen states a 40T constraint, yet the header says 3 filters. Shared URLs are this product's distribution mechanism; a recipient sees a count that reconciles with nothing and cannot remove the filter.
- *Fix:* Give the crane row the same label/readout header the range controls have, driven by `filters.crane` regardless of chip match. Clamp `crane` in `parseFilters`.
- *Suggested command:* `/impeccable harden`

**[P1] The screen's most consequential sentence is set in its quietest type.**
- *Why it matters:* The null-exclusion notice uses `.spec-label` (11px/500/steel) — the metadata tier — to report that half the inventory is hidden, and "Include them" measures 76×19px at 375px, under any touch minimum. Contrast passes at 5.78:1; the problem is rank, not legibility. This is the trust moment of the entire product and the hierarchy calls it a footnote.
- *Fix:* Promote to body tier (15px ink) in a ruled block; collapse multiple exclusions into one sentence with a union count; make "Include them" a full 28px chip; and add the clause PRODUCT.md principle 4 already implies — unstated does not mean absent, these are worth a call.
- *Suggested command:* `/impeccable typeset`

**[P1] Loose mode discards the transparency it exists to provide.**
- *Why it matters:* `?crane=10&loose=1` renders "47 sheds match 1 filter". 32 of those don't state a crane — they were exempted, not matched. The breakdown vanishes in loose mode and no card marks which population it belongs to. This is precisely the failure PRODUCT.md principle 2 is written against: the strict view is scrupulously honest, the loose view is one click away and quietly asserts 32 unknowns "match".
- *Fix:* Change loose-mode copy to "15 sheds match · 32 more don't state it", keep the breakdown visible, and tint the relaxed spec cell on exempted cards so a scan separates the two populations.
- *Suggested command:* `/impeccable clarify`

**[P2] Docks `0` means "any" and reads pressed on every default screen.**
- *Why it matters:* `0` is a legitimate dock count. A manager reading a pressed `0` reasonably concludes he is filtering *to* zero-dock sheds — the inverse of the truth — and it is the one chip that looks active before he touches anything. `includeLeased` has the mirror problem: relaxing a constraint increments the filter count, so `?leased=1` reads "60 sheds match 1 filter".
- *Fix:* Relabel to "Any" to match the Crane row; exclude `includeLeased` from `activeFilterCount` or count relaxations separately.
- *Suggested command:* `/impeccable clarify`

## Persona Red Flags

**Alex (impatient power user).** No numeric entry anywhere — he arrives knowing "13.5m, 30,000 sq ft, 150 HP", but height needs a 0.5-step drag and **area is a log-scaled dual slider** where 30,000 is a pixel-hunt. The one audience whose requirements are literally numbers cannot type a number. Back doesn't undo. No sort control, so he can't find the ceiling of the market. Credit: URL-as-state genuinely serves him — the filtered URL pastes into WhatsApp and restores exactly.

**Sam (accessibility-dependent).** **47 tab stops before the first result link.** A "Skip to results" link exists and works, but there's no route back into the rail — changing one filter after reading results means a full re-traverse. **No `<h1>` and no `<main>` landmark — independently verified on production**, so the document outline starts at the filter group names and the page has no title in the accessibility tree. `Leased out` (`#9A9A96` on chalk) is ≈2.8:1 and DESIGN.md prescribes rendering it at 60% opacity, taking it to ≈1.8:1 — the status a user most needs to catch is the least visible. Credit: focus ring is correct at every stop, `aria-live` on the count, real `input[type=range]` with `aria-valuetext`.

**Casey (distracted mobile).** 38vh of unlabelled grey above every result — no skeleton, no "Loading map", just `<div className="size-full bg-paper" />`. First card at 461px of 812px. On the Indian mobile networks PRODUCT.md names, that blank is the first impression. Active filters are invisible behind a bare count. The map is sticky, so 38% of the phone is permanently spent on the element she's least likely to use one-handed. Credit: primary action sits in the thumb zone and state survives interruption entirely.

**Rajesh (the factory manager — project-specific).** His headline path needs scrolling: `cluster + height + crane` in three interactions, but **Cluster starts at 1054px inside an 826px rail** at 1280×900. Two of his three filters are above the fold; the third is below nine other groups. 150 HP is exactly reachable (`POWER_STEP = 25`); 30,000 sq ft — the number he leads with — is the hardest to enter. And his conversion moment has no affordance: no number, no broker, no source link on the card, and Back from the detail page destroys his shortlist.

## Minor Observations

- `.chip` styles filter toggles, the "Show 12 more" pagination button, and the mobile "Filters" opener identically — three meanings, one appearance.
- Height/power chips toggle off on re-click; crane/docks chips don't. Same-looking control, different escape behaviour.
- **The Two Marks Rule is structurally unenforceable as written** — four filters produce five signal marks, so the accent degrades to ambient exactly as filter count rises.
- `MinRange`'s no-constraint state parks the handle at the track minimum, so the height slider *looks* set to 6m while the readout says "any".
- `min-height: 170px` is doing real work — reserved height holds, reflow doesn't shift the page.
- Verified contrast: steel 6.77:1, Ready 6.14:1, Under construction 4.81:1 (marginal), Leased out fails.
- Header `Search` (36×13px) and `About` (33×13px) are under the WCAG 2.2 24×24 minimum.
- With JS disabled the page is fully readable and every filter restores from the URL — but no filter is *operable*: the rail is `onClick`-only with no form fallback, and on mobile isn't in the DOM at all. "Useful without JS" holds for reading, not for filtering.
- `globals.css:298` — 10px map attribution is off the documented ramp.

## Questions to Consider

1. **The Two Marks Rule survives one filter and dies at three.** Either the rule is wrong for a multi-filter tool, or active chips shouldn't be the accent at all — should the ink inset stroke carry every active state, reserving hazard-signal exclusively for the null reversal, so the one orange thing always means "the tool is hiding something from you"?
2. **The map takes 46% of desktop and 38% of the phone. What is it earning?** Pin colour repeats the availability text; pin radius repeats the headline area. What would this screen become if the map were a toggle and the list were 700px wide with four spec columns visible at once?
3. **You built the null-exclusion counter and then hid it in metadata type.** If the honest count were 15px ink in a ruled block, does the differentiator become visible in a screenshot — which is how this will actually be shared?
4. **The conversion event has no home.** The goal is a phone call and intent peaks on the search screen, yet the card carries no number, no broker, no source link. Is the detail page load-bearing, or inherited from portal convention?
5. **If incompleteness is the normal case, is "strict vs loose" the right model at all?** What if the list were always one list, sorted into *confirmed* and *not stated* bands, with the second framed as the call sheet?
