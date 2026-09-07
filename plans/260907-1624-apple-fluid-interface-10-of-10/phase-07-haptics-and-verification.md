# Phase 7 — Haptics & verification

**Sections:** §13 Multimodal feedback, §11 Frame-level smoothness · **Risk:** low
**Score after:** 10.0

Runs last. Half of it is a small feature; half is proving the other six phases actually landed.

## Requirements

1. Haptic feedback on genuine commits, and nowhere else.
2. No audio.
3. Motion verified frame-by-frame, not at full speed.
4. The whole rubric re-scored against evidence.

## Files

**Create**
- `src/lib/haptics.ts`
- `plans/260907-1624-apple-fluid-interface-10-of-10/reports/` — the re-audit

**Modify**
- `src/components/map-sheet.tsx` (Phase 5) — snap commit
- `src/components/add-space-form.tsx` — submission success / failure

## Steps

### 7.1 No sound

§13 says feedback must earn its place. A tool used standing in a warehouse, or quietly at a
desk during a workday, has no moment that a sound improves. Audio would be feedback added for
the rubric, which the rubric itself argues against.

**Decision: haptics only.** Record it, so a later reader does not "fix" the omission.

### 7.2 Haptics, on real commits only

```ts
export function tap(pattern: number | number[] = 8) {
  if (!("vibrate" in navigator)) return;
  if (prefersReducedMotion()) return;   // treat as a reduce-feedback signal
  navigator.vibrate(pattern);
}
```

Fire on exactly three events:

| Event | Pattern | Why it qualifies |
| --- | --- | --- |
| Sheet snaps to a detent | `8` | The moment the sheet commits — §13 causality |
| Submission accepted | `[10, 40, 10]` | A real success |
| Submission rejected | `[24]` | A real error |

**Nowhere else.** Not on chip taps, not on filter changes, not on drawer open. Over-feedback
trains people to ignore all of it (§13 utility).

### 7.3 Harmony

The haptic fires on the **same frame** as the visual it accompanies. For the sheet, that is the
frame the spring settles — inside the settle callback, not on `pointerup`. A haptic that
precedes its visual by 100ms reads as a glitch.

### 7.4 Frame-level check

§11: smoothness is about what is in the frames.

- Record the sheet drag and the drawer dismiss with a performance trace; confirm no frame
  exceeds 16.7ms during either gesture.
- Confirm only `transform` and `opacity` animate — audit computed styles during a gesture, and
  confirm no layout or paint in the trace's main thread rows.
- Add `will-change: transform` to the sheet and drawer **only while a gesture is active**, and
  remove it on settle. A permanent `will-change` on a large surface costs memory for nothing.
- Check per-frame positional delta on the fastest flick; if it strobes, the projection is
  overshooting what the display can show.

### 7.5 Re-audit

Re-run the full `apple-design` audit that produced the 6/10, section by section, with the same
method: enumerate stylesheets for `:active`, measure targets under 44px, emulate all three
accessibility preferences, sample the spring, verify the handoff seam.

Write it to
`plans/260907-1624-apple-fluid-interface-10-of-10/reports/apple-design-reaudit-<date>-fluid-interface-rescore-report.md`
with the before/after table. **Score honestly.** If the sheet's scroll conflict shipped in the
degraded form from Phase 5's rollback note, that is a 9.8, and the report says 9.8.

### 7.6 Re-run the production click sweep

The `8ad6e65` sweep found eight defects. Phases 1–6 touch the same surfaces. Re-run it against
the deployed build: every route, every control, desktop and mobile, console and network
watched, and the standing constraint that **no form submission is ever completed**.

### 7.7 Record it in DESIGN.md

New named rules earned by this work, in the existing voice:

- Press feedback is not optional on touch, because hover does not exist there.
- Bounce is earned by the user's momentum, never granted by the interface.
- A gesture surface must remain operable without a pointer.

## Validation

- Haptics fire exactly three times in a full session walkthrough; assert by stubbing
  `navigator.vibrate` and counting calls.
- No `navigator.vibrate` call when `prefers-reduced-motion` is set.
- Trace shows no frame > 16.7ms during a sheet flick on a mid-range Android profile (4× CPU
  throttle).
- `will-change` is absent from computed styles at rest.
- Re-audit report exists, with per-section before/after.
- `npm run build && npm test && npx tsc --noEmit` clean.

## Risks & rollback

- `navigator.vibrate` is unsupported on iOS Safari. The guard handles it; do not reach for a
  library or an audio-based workaround to fake it. The feature degrades to nothing, which is
  correct.
- Vibration on Android requires a user gesture in the same task. Firing from a spring settle
  callback may fall outside that window — verify on a real device; if it is blocked, fire on
  `pointerup` with the snap already decided, and accept the small harmony cost.
- 7.5 is the phase's real deliverable. If the re-audit lands below 10, the honest move is to
  publish that number and name what is missing — not to adjust the rubric.
