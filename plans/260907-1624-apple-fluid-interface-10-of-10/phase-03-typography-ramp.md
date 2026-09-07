# Phase 3 — Typography ramp

**Sections:** §15 Typography · **Risk:** low · **Score after:** 8.8

The smallest phase. Half of §15 is already right; this finishes it.

## Context

- [Audit finding 8](../reports/apple-design-audit-260907-1609-fluid-interface-audit-report.md)
- `globals.css:84` — `h1, h2, h3 { line-height: 1.15; letter-spacing: -0.018em; }`, one value
  for three sizes.
- Already correct and **not to be disturbed**: `.label` at `+0.01em` (positive tracking on
  small text), the landing display at `-0.032em / 1.03`, `.num` tabular figures.

## Requirements

1. Tracking and leading differ per size level, tightening as size grows.
2. Layout scales with the reader's text-size setting rather than breaking.

## Files

**Modify**
- `src/app/globals.css` — the `@layer base` heading block, and any fixed-px spacing that should
  follow text size

## Steps

### 3.1 Split the heading ramp

Replace the single rule:

```css
@layer base {
  h1 { font-weight: 700; font-size: var(--text-3xl); line-height: 1.08; letter-spacing: -0.028em; }
  h2 { font-weight: 700; font-size: var(--text-xl); line-height: 1.15; letter-spacing: -0.020em; }
  h3 { font-weight: 700; font-size: var(--text-lg); line-height: 1.25; letter-spacing: -0.010em; }
}
```

Direction is what matters more than the exact numbers: **as size grows, tracking goes more
negative and leading gets tighter.** Body stays at `1.5 / 0`, which is already right.

Check every existing heading still reads correctly — several pages set their own size utility
on an `h1`/`h2`, which will now fight the base `font-size`. Either drop the base sizes and keep
only tracking/leading per level, or audit the overrides. **The safer version is
tracking/leading only:**

```css
h1 { line-height: 1.08; letter-spacing: -0.028em; }
h2 { line-height: 1.15; letter-spacing: -0.020em; }
h3 { line-height: 1.25; letter-spacing: -0.010em; }
```

Prefer this. It cannot break a layout.

### 3.2 Optical sizing

```css
body { font-optical-sizing: auto; }
```

A no-op unless the stack resolves to a variable font with an `opsz` axis, and free if it does
not. The project uses a system font stack — on Apple platforms this reaches SF, which has real
optical sizing.

### 3.3 Respect the reader's text size

Audit fixed-px spacing that should scale with text. The band token is the important one:

```css
--band-h: 61px;   /* fixed: a 44px control plus padding does not scale with body text */
```

That one should stay in px — it is sized by its controls, not its text. But padding *inside*
text blocks (`.spec-cell` at `6px 6px 5px`, `.label` blocks) should move to `em` so a reader at
200% text size does not get text touching the cell edge.

Scope this narrowly: convert padding only where the box contains text and is sized by it. Do
not convert layout geometry.

### 3.4 Verify the small end stays positive

Regression guard: `.label` must keep `letter-spacing: 0.01em`. If a future refactor pulls
`.label` into the heading ramp it will get negative tracking at `text-xs`, which is the exact
error §15 warns about.

## Validation

- Screenshot the four heading contexts before/after: cluster `h1`, shed `h1`, `group-heading`
  `h2`, and any `h3` in the About page. Compare at 100%.
- Set browser font size to 200% (`about:preferences` or the Chrome appearance setting, not
  page zoom) and confirm no text touches a container edge and nothing overflows on `/chakan`
  and `/list-your-space`.
- Assert computed `letter-spacing` differs across `h1`/`h2`/`h3` and that `.label` is positive.
- `npm run build && npx tsc --noEmit`.

## Risks & rollback

- The `font-size` variant of 3.1 will collide with per-page size utilities. Use the
  tracking/leading-only version unless you audit every heading.
- 200% text size is a genuinely different layout; expect to find pre-existing problems there
  that are not caused by this phase. Note them, do not fix them here.
- One-file change, trivially revertable.
