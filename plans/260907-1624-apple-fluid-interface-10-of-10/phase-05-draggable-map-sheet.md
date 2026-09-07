# Phase 5 — The draggable map sheet

**Sections:** §2 Direct manipulation, §5 Velocity handoff, §6 Momentum projection,
§9 Rubber-banding · **Risk:** **high** · **Score after:** 9.7

The only genuinely new interaction in this plan, and the one that makes four N/A sections
scoreable. **Depends on Phase 4.**

## Why this one is justified

Below 820px the list and map are an either/or toggle: you are looking at territory or at
results, never both. A sheet you drag between peek, half and full is what Apple Maps, Google
Maps and every transit app does, because it is the correct answer to "I need to see where it
is *and* what it is at the same time."

This is not a gesture invented to satisfy a rubric. It removes a mode from the product.

## Requirements

1. Sheet tracks the finger 1:1, respecting where it was grabbed.
2. Release projects momentum and snaps to the nearest projected detent.
3. Release velocity is handed to the spring — no seam between drag and animation.
4. Dragging past the top rubber-bands rather than stopping dead.
5. The sheet can be caught mid-flight and reversed.
6. Scrolling the list inside the sheet never fights the sheet's own drag.

## Files

**Create**
- `src/components/map-sheet.tsx` — the gesture surface
- `src/lib/gesture.ts` — velocity history, `project()`, `rubberband()`

**Modify**
- `src/components/search-shell.tsx` — mobile list becomes the sheet; the Map/List chip either
  goes or becomes a detent jump
- `src/app/globals.css` — sheet geometry, grabber, detent transitions

## Steps

### 5.1 Detents

Three, as fractions of viewport height, measured from the bottom:

| Detent | Height | Purpose |
| --- | --- | --- |
| `peek` | 96px | Grabber + match count. Map is the screen. |
| `half` | 52dvh | Two cards visible beside the map. The default. |
| `full` | calc(100dvh − var(--band-h) − 8px) | The list, as today. |

Default on load: `half`. `peek` replaces "Map view"; `full` replaces "List view".

### 5.2 1:1 tracking with grab offset

Pointer Events, capture on down so tracking survives the pointer leaving the element:

```ts
el.setPointerCapture(e.pointerId);
const grabOffset = e.clientY - el.getBoundingClientRect().top;
```

**Never** centre the sheet on the finger. The offset from the grab point is the illusion.

`touch-action: none` on the grabber only — not on the sheet body, which must still scroll.

### 5.3 Velocity history

Keep the last ~5 `pointermove` samples as `{y, t}` and compute velocity over the most recent
~60–80ms window, not from the final two events — the last two are noisy and a slow final frame
reads as zero velocity, which kills every flick.

Discard samples older than 100ms at release.

### 5.4 Momentum projection

Apple's exponential-decay form from the *Designing Fluid Interfaces* sample. **Not** the
textbook `v²/2a`:

```ts
export function project(velocity: number, decelerationRate = 0.998) {
  return (velocity / 1000) * decelerationRate / (1 - decelerationRate);
}
```

```ts
const projected = currentY + project(releaseVelocity);
const detent = nearestDetent(projected);   // choose from the projection, not the release point
```

This is what makes a flick throw the sheet past the neighbouring detent instead of snapping
back to it.

### 5.5 Velocity handoff

Hand the raw release velocity to the Phase 4 spring as its initial velocity, targeting the
chosen detent. `damping: 0.8, response: 0.30` — bounce is earned here, because a flick preceded
it.

The seam between drag and animation is the thing being eliminated. If you can see the moment
the finger lifts, this step is wrong.

### 5.6 Rubber-banding

Past `full` (dragging up beyond the top detent):

```ts
export function rubberband(overshoot: number, dimension: number, c = 0.55) {
  return (overshoot * dimension * c) / (dimension + c * Math.abs(overshoot));
}
```

Below `peek`, the same. Resistance rises with distance; the sheet never stops dead and never
leaves the screen.

### 5.7 Scroll vs drag disambiguation

The hard part. Rules:

- Sheet below `full`: the grabber drags; the list body does not scroll.
- Sheet at `full` and list `scrollTop === 0`: a downward drag on the body drags the sheet.
- Sheet at `full` and list `scrollTop > 0`: the body scrolls; the sheet does not move.
- ~10px movement threshold before committing to either, then track 1:1.

Detect both candidates from the first move and cancel the loser once intent is clear (§10).
Do not use a recogniser that only reports a final state.

### 5.8 Interruptibility

A sheet mid-spring must be grabbable. On `pointerdown`, stop the spring, read the **live**
transform as the new `x`, and carry the spring's current velocity into the drag. Starting from
the target value is the visible-jump bug §3 names.

### 5.9 Reduced motion

No projection, no spring: snap to the nearest detent by position alone, cross-fade. The drag
itself still tracks 1:1 — direct manipulation is not vestibular motion and must not be removed.

## Validation

- **1:1 fidelity:** synthesise a pointer drag of 200px; assert the sheet's translate changed by
  200px ± 1, and that the grab offset held (grab near the bottom edge, assert the top edge did
  not jump to the finger).
- **Projection:** a fast flick from `half` lands on `full`; the same displacement performed
  slowly lands back on `half`. This asymmetry is the whole feature — assert both.
- **Handoff:** sample the sheet's position for 3 frames after release; the first-frame delta
  must be within 20% of the last drag frame's delta. A seam shows up here as a sudden drop.
- **Rubber-band:** drag 200px past `full`; assert actual travel is well under 200px and
  monotonically resisting.
- **Interrupt:** start a spring to `full`, grab at ~80ms, assert no position discontinuity
  (> 4px between the last spring frame and the first drag frame).
- **Scroll conflict:** at `full` with `scrollTop > 0`, drag down on a card — the list scrolls,
  the sheet must not move. Then at `scrollTop === 0`, the same drag moves the sheet.
- Reduced motion: assert no rAF loop runs on release.
- The full click sweep from `8ad6e65` re-run at 375×812.
- `npm run build && npm test && npx tsc --noEmit`.

## Risks & rollback

**This is the phase that can regress the product.** It touches the core screen and replaces a
working mode toggle with a gesture.

- **Scroll/drag conflict (5.7) is where this fails.** If it cannot be made reliable on a real
  phone, ship the sheet with drag on the grabber only and no body-drag. Score drops ~0.2;
  usability does not.
- The Map/List chip disappearing removes a discoverable control. Keep a visible grabber with a
  clear affordance, and consider retaining the chip as a detent jump for keyboard and
  non-touch users. **The sheet must be operable without a pointer** — arrow keys or the chip.
- `dvh` shifts with mobile browser chrome. Detents in `dvh` will move as the URL bar hides.
  Recompute detent pixel positions on `resize` and on `visualViewport` changes.
- Behind a flag, or on its own branch, until it has been used on a real phone for a day.
- Rollback: the sheet is a new component; reverting means restoring the `data-view` toggle in
  `search-shell.tsx`. Keep that code path intact until the sheet has shipped and settled.
