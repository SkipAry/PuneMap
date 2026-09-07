# Phase 4 — Spring engine

**Sections:** §4 Behavior over animation, §3 Interruptibility · **Risk:** medium
**Score after:** 9.1

The foundation for Phases 5 and 6. Builds nothing a user sees on its own — it replaces the
mechanism underneath the drawers so that motion can start from the current value and inherit a
velocity.

## Why not a library

`motion` would cost ~2.6kb (mini) to ~18kb and one runtime dependency. This project ships six
runtime dependencies deliberately, and we need exactly one thing: a 1-D critically-damped
spring on `transform`, with an injectable initial velocity.

A spring integrator that does that is ~60 lines. **Hand-roll it.** If Phase 5 later needs
2-D independent springs, gesture recognisers and layout animation, revisit — that is the
threshold where a library starts paying for itself.

Rejected: CSS `linear()` easing generated from a spring. It produces the right *shape* but
cannot accept a release velocity, which is the entire point of §5.

## Requirements

1. Animate from the **presentation** value, never the target.
2. Accept an initial velocity.
3. Re-target mid-flight without a velocity discontinuity.
4. Parameterised as Apple does it: `damping` (overshoot) and `response` (speed), not
   mass/stiffness.
5. Respect `prefers-reduced-motion` by snapping to target.

## Files

**Create**
- `src/lib/spring.ts` — the integrator
- `src/lib/spring.test.ts` — assertions, run by `npm test`

**Modify**
- `package.json` — add the new test file to the `test` script
- `src/components/site-menu.tsx`, `src/components/search-shell.tsx` — drawers driven by the
  spring instead of CSS transitions (only if Phase 6 follows; otherwise leave CSS in place)

## Steps

### 4.1 The integrator

```ts
export type SpringOpts = {
  /** 1.0 = critically damped, no overshoot. < 1 bounces. */
  damping?: number;
  /** Seconds to approach the target. Not a duration - a spring has none. */
  response?: number;
  /** Units per second at t=0. Hand the gesture's release velocity here. */
  velocity?: number;
};
```

Semi-implicit Euler, stepped on `requestAnimationFrame`, converting Apple's two parameters to
stiffness/damping internally:

```
stiffness = (2π / response)²
damping   = 4π · dampingRatio / response
```

Settle when `|x − target| < 0.01 && |v| < 0.01`, then snap and stop the loop.

Clamp `dt` to ~32ms so a backgrounded tab does not integrate a single enormous step and fling
the element off screen. This is the bug that will bite if it is skipped.

### 4.2 Re-targeting without a brick wall

`retarget(next)` changes the target and **keeps `x` and `v` untouched**. That is what makes a
reversal continuous — the §3 "brick wall" comes from resetting velocity to zero on re-target.
The integrator must never do that.

### 4.3 Reduced motion

The factory reads `prefersReducedMotion()` once per animation start. When set: jump to target,
fire the completion callback, never start a rAF loop.

### 4.4 Defaults, per `DESIGN.md` restraint

| Use | damping | response |
| --- | --- | --- |
| Drawer open/close (no gesture preceded it) | 1.0 | 0.35 |
| Sheet released from a drag (Phase 5) | 0.8 | 0.30 |
| Reposition | 1.0 | 0.40 |

Bounce only where the user's own flick supplied momentum. Nothing overshoots because it opened.

### 4.5 Drive the drawers

Only worth doing as part of Phase 6, which needs it. If Phase 6 is not being built, **stop
after 4.4** — a CSS transition that no one can grab is not worse than a spring no one can grab,
and swapping it buys nothing but risk.

When it is done: the `<dialog>` keeps owning open/closed state, focus trap and inertness. The
spring owns only `transform`. Do not reimplement the dialog.

## Validation

`src/lib/spring.test.ts`, assertion-based, no framework — matching the two existing test files:

- Critically damped (`damping: 1.0`) never exceeds its target: sample 200 steps, assert
  `max(x) <= target + 0.001`.
- `damping: 0.8` does overshoot, and settles within ~1.5 × response.
- Initial velocity changes the path: `velocity: 500` reaches 90% of target measurably sooner
  than `velocity: 0`.
- Re-target mid-flight preserves velocity: capture `v` before and after `retarget()`, assert
  equal.
- `dt` clamp: feed a 5000ms step, assert `x` stays finite and within bounds.
- Reduced motion: assert the callback fires once with the target and rAF is never scheduled.

Then: `npm test` (all three files), `npx tsc --noEmit`, `npm run build`.

## Risks & rollback

- **Backgrounded-tab `dt` explosion** is the classic failure. The clamp in 4.1 is not optional.
- A spring on `transform` while a CSS `transition` on the same property still exists will
  fight it. When 4.5 lands, the CSS transition on `dialog.drawer` must be **removed**, not
  overridden — this is the Unlayered Cascade trap in another costume.
- Reduced motion must be re-verified after 4.5; the Phase 2 block assumes CSS drives the
  drawer.
- 4.1–4.4 are additive and ship safely on their own. 4.5 is the only step that changes
  behaviour, and it reverts by restoring the CSS transition.
