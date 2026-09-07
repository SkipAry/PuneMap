# Apple fluid-interface audit — Pune Industrial Space

Audited against *Designing Fluid Interfaces* (WWDC 2018), *The Details of UI Typography* (2020),
*Principles of Great Design* (2026). Target: `punemap-silk.vercel.app`, build `8ad6e65`.
Read-only. Nothing changed.

## Verdict

The **structure** is Apple-correct and the **response layer is missing**. Spatial model,
easing curve, dialog semantics and type hierarchy are all deliberate and mostly right. But
the interface never acknowledges a press. On a phone — where this product gets used, standing
in a shed — every tap is silent until the screen changes. That is the one finding that
outranks the rest.

## Findings, most severe first

### 1. Nothing responds to a press · §1 Response · **blocker**

The project stylesheet defines **zero `:active` rules**. It defines 15 `:hover` rules.
Enumerated live over every loaded stylesheet: the only 4 `:active` selectors on the page come
from MapLibre's own CSS, not ours.

Hover does not exist on touch. So on a phone, a tap on a result card, a cluster chip, the menu
button, or "Add space for free" produces **no visual change at all** until navigation or state
completes.

It is worse than the default, because the browser's fallback is suppressed too:

```
getComputedStyle(document.body).webkitTapHighlightColor → "rgba(0, 0, 0, 0)"
```

Tailwind's preflight zeroes the tap highlight. Nothing replaced it.

> "The moment lag appears, the feeling of directness falls off a cliff."

Affected: `.chip`, `.btn-action`, `.btn-quiet`, `.card`, `.rail-link`, `.cluster-row`,
`.icon-btn`, `.tool-btn`.

**Fix.** A press state on each, on pointer-down, ~100ms:

```css
.btn-action:active { transform: scale(0.97); filter: brightness(0.96); }
.card:active       { transform: scale(0.995); }
.chip:active       { background: rgba(16, 24, 40, 0.09); }
```

Scale on the card must be small — it is a large surface, and 0.97 on a 400px card reads as a
lurch. The button can take more because it is small.

### 2. Tapping a result gives no pending state · §1 Response · **major**

No `loading.tsx`, `error.tsx` or `template.tsx` exists anywhere under `src/app/`. A result card
navigates to a server-rendered `/shed/[slug]`. Between the tap and the paint there is no
skeleton, no spinner, no pressed card held down — nothing.

Combined with finding 1, tapping a listing on a slow connection is indistinguishable from the
app having ignored you. This is the single most-used interaction on the site.

**Fix.** `src/app/shed/[slug]/loading.tsx` with the detail page's own skeleton — the band, and
a spec strip of muted blocks. It costs one file and covers every listing.

### 3. A 220ms dead wait on the menu → Filters handoff · §1 Response · **major**

`src/components/site-menu.tsx:182`

```ts
handoff.current = setTimeout(onFilters, 220);
```

Press "Filters" in the drawer and the interface does nothing for 220ms by construction, so the
menu can finish sliding out before the filters slide in. The reasoning is sound — two drawers
should not cross on one edge — but the remedy is an artificial timer on the input path, which
is exactly what §1 says to hunt down and delete.

**Fix.** Start the filter drawer's entrance immediately and let the two transforms overlap by
~120ms; the outgoing panel is already past 90% of its travel by then (measured below). If they
must be strictly sequential, drive the second from the first's `transitionend` rather than a
magic number that will drift the moment the duration changes.

### 4. Eighteen tap targets below 44×44 · §10 Gesture design · **major**

Measured on `/search` at desktop width; every one is worse on a phone:

| Control | Size |
| --- | --- |
| `.icon-btn` — the menu button, primary navigation | 34 × 34 |
| Cluster chips (`All Pune`, `Chakan`, …) | ~100 × **34** |
| `.tool-btn` — Filters | 40 × **32** |
| `.btn-action` — Add space | 108 × **36** |
| MapLibre zoom in / out | 29 × 29 |

Height is the failure in every case; width is mostly fine. Apple's floor is 44pt.

**Fix.** Raise `min-height` to 44px on the touch breakpoint, or keep the visual size and add
hit padding via a transparent `::before` inset — the skill's ~10px hysteresis point. The
MapLibre buttons need a `.maplibregl-ctrl button { width: 44px; height: 44px }` override under
the same media query.

### 5. Reduced motion is applied with a sledgehammer · §14 Accessibility · **moderate**

`src/app/globals.css:1027`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0ms !important;
    animation-duration: 0ms !important;
  }
}
```

This removes *all* feedback, not just the vestibular kind. Apple's position is that reduced
motion means a **gentler equivalent**, not none: keep opacity cross-fades and colour changes,
drop slides, parallax and overshoot.

The concrete loss is `.result-card`'s 120ms opacity fade — the one orchestrated moment in the
product, telling the reader which cards stopped matching. Under reduced motion, cards vanish
between frames with no explanation.

**Fix.** Neutralise transforms, preserve opacity:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-property: opacity, background-color, border-color, color; }
  dialog.drawer { transform: none; }
}
```

### 6. No `prefers-reduced-transparency`, no `prefers-contrast` · §14 · **moderate**

Neither query appears anywhere in the stylesheet, and the design leans hard on translucency:
`backdrop-filter` on the toolbar, the cluster tray, `.panel`, and the map chrome — five call
sites at `blur(12–14px) saturate(1.4)`.

For a reader who has asked the OS to reduce transparency (a common low-vision setting), every
floating surface on the search screen stays semi-transparent over a moving map.

**Fix.**

```css
@media (prefers-reduced-transparency: reduce) {
  .panel, .toolbar, .chipbar-tray { background: #fff; backdrop-filter: none; }
}
@media (prefers-contrast: more) {
  .panel, .toolbar, .chipbar-tray { background: #fff; border-color: var(--color-ink); }
}
```

### 7. One smooth-scroll ignores the motion preference · §14 · **minor**

`src/components/add-space-form.tsx:61` — `scrollIntoView({ block: "center", behavior: "smooth" })`,
unconditional. `src/components/search-shell.tsx:152` does the same call correctly:
`behavior: prefersReducedMotion() ? "auto" : "smooth"`.

The helper already exists. The form path just doesn't use it. This fires on a validation
failure — the exact moment a motion-sensitive reader is already stressed.

### 8. One tracking value serves three type sizes · §15 Typography · **minor**

`globals.css:84`

```css
h1, h2, h3 { font-weight: 700; line-height: 1.15; letter-spacing: -0.018em; }
```

Tracking is size-specific — that is the core of the typography talk. A cluster page's `h1`
(`text-3xl`) and an `h3` a third of that size cannot share a value: it is too loose on the h1
and too tight on the h3. Line-height `1.15` has the same problem in reverse.

The ramp already exists elsewhere and is correct where it does — the landing display sets
`-0.032em / 1.03`, `.label` sets `+0.01em` at `text-xs` (positive tracking on small text, which
is right). The app pages just never got it.

**Fix.** Split per level: h1 `-0.028em / 1.08`, h2 `-0.02em / 1.15`, h3 `-0.01em / 1.25`.

### 9. Material thickness doesn't track surface size · §12 Materials · **minor**

`.panel` (the 416px-wide, ~750px-tall list column) uses `blur(14px)`. The cluster tray — a 46px
strip — uses `blur(12px)`. The toolbar band uses `blur(12px)`. Three surfaces of wildly
different weight read as the same material.

Apple: bigger surfaces should read as thicker — stronger blur, deeper shadow.

**Fix.** Push `.panel` to `blur(20px) saturate(1.8)` with the existing deeper `--shadow-panel`,
and drop the tray to `blur(8px)`. Small change, and it is what makes a stack read as layers
rather than as one flat sheet of frosting.

### 10. A hard 1px divider where content meets floating chrome · §12 · **minor**

The list panel's header is separated with `border-b border-line` while results scroll beneath
it. Apple replaced these with a scroll edge effect — a short blur/gradient mask that appears
only where scrolling content actually passes under floating chrome.

Low priority, but it is the difference between "a box with a header" and "content moving under
glass".

## What is already right

Worth stating, because these are the expensive things to get wrong and they are not wrong:

- **The easing is the iOS sheet curve.** `cubic-bezier(0.32, 0.72, 0, 1)` on the drawer —
  strongly front-loaded deceleration. Measured live: 90ms into a 240ms transition the 300px
  drawer sits at −1px, i.e. ~99.7% travelled. Motion resolves fast and settles gently, which is
  the feel the whole talk is arguing for.
- **Spatial consistency holds.** §7. The menu and the filter set are the same off-canvas drawer
  from the same inline-start edge, and each exits along the path it entered. There is one edge
  for things to slide from, which was a deliberate decision recorded in `DESIGN.md`.
- **Both directions animate without JavaScript owning state.** `@starting-style` +
  `transition: display allow-discrete` on a native `<dialog>`. No enter/exit class bookkeeping
  to fall out of sync.
- **Native `<dialog>` + `showModal()`** brings focus trapping, Escape, and page inertness from
  the platform rather than a reimplementation. §16 Familiarity.
- **Dim to focus.** The modal drawer pairs with a `rgba(16,24,40,0.4)` backdrop that fades in
  with the panel — §12's "dim to focus" for a blocking task.
- **Tabular figures on every comparable number** (`.num`, `font-variant-numeric: tabular-nums`).
  This product exists so a reader can scan twenty buildings vertically; proportional digits
  would break the one thing it is for.
- **Layout stability.** `.result-card { min-height: 148px }` reserves space so a filter change
  reflows without shifting the page.

## Suggested order

1. Press states (§1) — one CSS block, transforms the entire feel on touch.
2. `loading.tsx` for the shed route — one file.
3. 44px touch targets under a touch media query.
4. Delete the 220ms handoff timer.
5. Reduced-motion / reduced-transparency / contrast — one block each.
6. Type ramp, material weights, scroll edge.

Items 1–4 are the ones a user would feel. 5 is the one that matters most to the readers who
need it most.

## Unresolved questions

- Is a press state on `.card` wanted at all, given a card is a navigation target rather than a
  control? Apple would say yes — the tap needs acknowledging — but it changes the reading
  surface, and this product's cards are dense.
- The 44px target floor conflicts with the current band height (`--band-h: 61px`) if the
  toolbar controls all grow. Does the band grow on touch, or do the controls get hit padding
  without growing visually?
- Reduced transparency: fall back to solid white, or to the existing `--color-surface`? The map
  is the ground everywhere, so solid white may read as a heavier interface than intended.
