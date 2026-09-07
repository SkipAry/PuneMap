# Phase 2 — Accessibility & materials

**Sections:** §14 Reduced motion & accessibility, §12 Materials & depth · **Risk:** low
**Score after:** 8.6

Independent of every other phase. This is the one that matters most to the readers who need it
most, and it is almost entirely CSS.

## Context

- [Audit findings 5, 6, 7, 9, 10](../reports/apple-design-audit-260907-1609-fluid-interface-audit-report.md)
- Current: reduced motion zeroes *all* duration with `!important`; no transparency or contrast
  query exists; five `backdrop-filter` sites all at `blur(12–14px)`.

## Requirements

1. Reduced motion removes movement, keeps opacity feedback.
2. Reduced transparency makes every floating surface opaque.
3. Increased contrast gives every floating surface a defined border.
4. Material thickness tracks surface size.
5. No hard divider where scrolling content meets floating chrome.

## Files

**Modify**
- `src/app/globals.css` — all five items
- `src/components/add-space-form.tsx:61` — honour the motion preference
- `src/lib/` — wherever `prefersReducedMotion()` lives (already used by `search-shell.tsx:152`)

## Steps

### 2.1 Rewrite the reduced-motion block

Replace the blanket duration kill at `globals.css:1027`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    /* Movement goes; the fades that carry meaning stay. */
    transition-property: opacity, background-color, border-color, color, filter;
    animation-duration: 0ms !important;
  }
  dialog.drawer { transform: none; }
  dialog.drawer, dialog.drawer::backdrop { transition-duration: 200ms; }
}
```

The drawer then cross-fades in place instead of sliding — §14's "gentler equivalent". Confirm
`@starting-style` still drives the fade with `transform` neutralised; if it does not, give the
reduced-motion drawer an explicit `opacity` pair.

`.result-card`'s 120ms opacity fade must survive. That is the check.

### 2.2 Reduced transparency

```css
@media (prefers-reduced-transparency: reduce) {
  .panel, .toolbar, .chipbar-tray, dialog.drawer {
    background: var(--color-surface);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}
```

Open question in `plan.md`: solid white vs `--color-surface`. The map is the ground on every
screen, so pure white may read heavier than intended — decide by looking, not by reasoning.

### 2.3 Increased contrast

```css
@media (prefers-contrast: more) {
  .panel, .toolbar, .chipbar-tray, dialog.drawer {
    background: #fff;
    backdrop-filter: none;
    border-color: var(--color-ink);
  }
  .label, .text-muted { color: var(--color-ink); }
}
```

The muted-text override matters: `--color-muted` over a translucent panel is the lowest
contrast pair in the design.

### 2.4 Material weight by surface size

Bigger reads thicker:

```css
.panel        { backdrop-filter: blur(20px) saturate(1.8); }  /* was 14px */
.toolbar      { backdrop-filter: blur(12px) saturate(1.4); }  /* unchanged */
.chipbar-tray { backdrop-filter: blur(8px)  saturate(1.3); }  /* was 12px */
```

Keep `--shadow-panel` on the large surface and give the tray a lighter shadow, so weight is
carried by two signals rather than one.

### 2.5 Scroll edge instead of a divider

The list panel header currently uses `border-b border-line` while results scroll under it.
Replace with a mask that only appears when content is actually scrolled:

```css
.list-scroll { --edge: 0; }
.list-scroll[data-scrolled="true"] { --edge: 1; }
.list-head::after {
  content: ""; position: absolute; inset: 100% 0 auto; height: 14px;
  background: linear-gradient(rgba(16,24,40,0.07), transparent);
  opacity: var(--edge); transition: opacity 160ms ease;
}
```

Set `data-scrolled` from a scroll listener on the results container (`scrollTop > 2`), or from
an `IntersectionObserver` sentinel — the observer costs less and does not fire per frame.

### 2.6 The unconditional smooth scroll

`add-space-form.tsx:61`:

```ts
culprit.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
```

The helper already exists and `search-shell.tsx:152` already uses it. This fires on a
validation failure — the worst moment to move the page under a motion-sensitive reader.

## Validation

- Emulate each of the three preferences (`Rendering` pane, or CDP `Emulation.setEmulatedMedia`)
  and screenshot `/search` and `/shed/<slug>` in each. Three preferences × two pages.
- With reduced motion on: filter to fewer results and confirm cards still **fade** rather than
  vanish; confirm the drawer does not translate.
- With reduced transparency on: assert `backdrop-filter` computes to `none` on all four
  surfaces and no map is visible through any panel.
- Contrast check `--color-muted` on `.panel` under `prefers-contrast: more` — must reach 7:1.
- Scroll the result list; assert the edge mask fades in only after `scrollTop > 2`.
- `npm run build && npm test && npx tsc --noEmit`.

## Risks & rollback

- `prefers-reduced-transparency` has no Firefox support; the fallback is today's behaviour,
  which is acceptable. Do not polyfill.
- 2.4 changes the look of every screen subtly. Review the two screenshots side by side before
  committing — a 20px blur on the list panel over a busy map can muddy small type.
- 2.5 adds a listener to the hottest scroll surface in the product. Use the observer, and
  verify no scroll jank at 375px with 56 cards.
- Each step is independently revertable.
