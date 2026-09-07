# Phase 1 — Response layer

**Sections:** §1 Response, §10 Gesture details · **Risk:** low · **Score after:** 8.0

Everything a user physically feels. No new dependencies, no new interactions — this phase only
makes the existing ones acknowledge being touched.

## Context

- [Audit findings 1–4](../reports/apple-design-audit-260907-1609-fluid-interface-audit-report.md)
- Measured: 0 `:active` rules in project CSS, 15 `:hover`. 18 controls under 44×44 on
  `/search`. `-webkit-tap-highlight-color` computes to `rgba(0,0,0,0)`.

## Requirements

1. Every control changes visibly within one frame of pointer-down.
2. No touch target under 44×44.
3. A card tap shows a pending state before the next page paints.
4. No artificial timer on any input path.

## Files

**Modify**
- `src/app/globals.css` — press states, touch-size media query, `.card` transition property
- `src/components/site-menu.tsx` — delete the 220ms handoff timer
- `src/components/listing-card.tsx` — pending state on navigation

**Create**
- `src/app/shed/[slug]/loading.tsx`

## Steps

### 1.1 Press states

Add beside each existing `:hover` in `globals.css`. Values differ by surface size — a 400px
card cannot take the same scale as a 36px button:

```css
.btn-action:active { transform: scale(0.97); filter: brightness(0.96); }
.btn-quiet:active  { transform: scale(0.97); background: rgba(16, 24, 40, 0.04); }
.icon-btn:active   { transform: scale(0.92); background: rgba(16, 24, 40, 0.09); }
.chip:active       { transform: scale(0.97); background: rgba(16, 24, 40, 0.09); }
.card:active       { transform: scale(0.995); }
.rail-link:active,
.cluster-row:active { background: rgba(16, 24, 40, 0.09); }
```

Each needs `transition: transform 100ms ease-out` on the base rule, and each base rule must
already establish a `transform` so the `:active` value has something to interpolate from.

**Cascade warning.** `.chipbar-tray .chip` is unlayered and beat the layered `.chip` pressed
state once already (`DESIGN.md`, Unlayered Cascade Rule, six occurrences). The tray's chips
need their `:active` written **in the same unlayered block** as
`.chipbar-tray .chip[aria-pressed="true"]`, not in `@layer components`. Verify with
`getComputedStyle` under a synthetic pointer-down, not by reading the file.

### 1.2 Restore a tap acknowledgement

Tailwind preflight zeroes the tap highlight. Now that we paint our own press states this is
correct — but confirm no control relies on the browser default by auditing anything
interactive that is *not* in the list above (raw `<a>` in prose, the skip link).

### 1.3 Touch targets

```css
@media (pointer: coarse) {
  .icon-btn { width: 44px; height: 44px; }
  .chip, .tool-btn, .btn-action, .btn-quiet { min-height: 44px; }
  .maplibregl-ctrl button { width: 44px; height: 44px; }
}
```

`--band-h: 61px` currently fits a 34px control with padding. A 44px control needs the band to
grow on coarse pointers — set `--band-h: 72px` inside the same query. **This shifts every
`top`/`inset` that references `--band-h`**: `.notice-strip`, `.list-view`,
`.shell-map .maplibregl-ctrl-top-right`. All three read the token, so they follow
automatically — verify, don't assume.

Alternative if the band must not grow: keep the 34px visual and add hit padding —

```css
.icon-btn::before { content: ""; position: absolute; inset: -5px; }
```

— which needs `position: relative` on the control. Decide before implementing; see the open
question in `plan.md`.

### 1.4 Pending state on a listing tap

Create `src/app/shed/[slug]/loading.tsx` rendering the detail page's own chrome — the band,
then muted blocks in the spec-strip grid. Reuse `SiteHeader` so the band does not flash.

In `listing-card.tsx`, mark the tapped card while the navigation is in flight, using
`useLinkStatus` (Next 15) on the card's link:

```tsx
const { pending } = useLinkStatus();
// data-pending={pending || undefined} on the card root
```

```css
.card[data-pending="true"] { opacity: 0.62; }
```

This is the honest fix: the card stays visibly held until the next screen arrives.

### 1.5 Delete the 220ms handoff

`site-menu.tsx:182`. Replace the timer with the drawer's own `transitionend`, or open the
filter drawer immediately and let the two transforms overlap — the outgoing panel is ~99%
travelled by 90ms of its 240ms transition (measured), so the crossing the timer was avoiding
is not visible at a 120ms overlap.

Removing the timer also removes the `handoff` ref and its unmount cleanup.

### 1.6 Compositor hygiene

`.card { transition: box-shadow 140ms ease }` animates a non-compositor property on a large
surface. Replace with an inset pseudo-element carrying the shadow and transition its `opacity`.

## Validation

- Synthetic `pointerdown` on one control of each class; assert computed `transform` or
  `background-color` differs from rest within 1 frame.
- `document.querySelectorAll('button,a[href],input,select')` → zero results under 44×44 with
  `pointer: coarse` emulated. (The 1×1 skip link is exempt; it is visually hidden until focus.)
- Throttle to Slow 3G, tap a card, confirm the held state appears before the next paint.
- Tap "Filters" in the menu; assert the filter dialog has `open` within 150ms of the click.
- `npm run build && npm test && npx tsc --noEmit`.
- Re-check the six `8ad6e65` fixes on `/search`: pressed chip legible, zoom reachable, tray
  clear of the attribution and the list column.

## Risks & rollback

- **Band height change** is the one thing that can break layout. It moves three positioned
  elements at once. If it goes wrong, take the hit-padding route in 1.3 instead — it changes
  no geometry.
- **`useLinkStatus`** requires the card's `<Link>` to be a client component. If
  `listing-card.tsx` is a server component today, this means a small client wrapper around the
  link only — do not convert the whole card.
- Rollback is per-step; nothing here is structural.
