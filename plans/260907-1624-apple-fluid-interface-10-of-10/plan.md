# Apple fluid-interface: 6/10 → 10/10

**Status:** not started
**Branch:** `main` (recommend `feat/fluid-interface`)
**Baseline:** `8ad6e65`, audited at 6/10 in
[the audit report](../reports/apple-design-audit-260907-1609-fluid-interface-audit-report.md)

## What "10/10" means here

The score is my rubric against the `apple-design` skill's sections, not an external
certification. 10/10 = **no applicable principle left unaddressed**.

Five sections currently score N/A — direct manipulation, velocity handoff, momentum
projection, rubber-banding, multimodal — because the product has no gesture surface of its
own. They cannot be scored without building one. Phase 5 builds the one surface that earns
its place: the mobile list as a draggable sheet over the map, which is what Apple Maps does
and what this product structurally is.

**We are not adding a gesture for the sake of the rubric anywhere else.** Phases 1–4 and 7
raise real scores on what already exists. Phase 6 is the only other new interaction and it is
a dismissal gesture people already expect from a drawer.

## Phases

| # | Phase | Sections | Score after | Risk |
| --- | --- | --- | --- | --- |
| 1 | [Response layer](phase-01-response-layer.md) | §1, §10 | 8.0 | low |
| 2 | [Accessibility & materials](phase-02-accessibility-and-materials.md) | §14, §12 | 8.6 | low |
| 3 | [Typography ramp](phase-03-typography-ramp.md) | §15 | 8.8 | low |
| 4 | [Spring engine](phase-04-spring-engine.md) | §4, §3 | 9.1 | medium |
| 5 | [Draggable map sheet](phase-05-draggable-map-sheet.md) | §2, §5, §6, §9 | 9.7 | **high** |
| 6 | [Grabbable drawers](phase-06-grabbable-drawers.md) | §3, §8 | 9.9 | medium |
| 7 | [Haptics & verification](phase-07-haptics-and-verification.md) | §13, §11 | 10.0 | low |

Phases 1–3 are independent of each other and of everything after. **Phase 4 is a hard
dependency of 5 and 6** — both need the spring integrator and the velocity handoff it exposes.
Phase 7 must run last; its job is to verify the whole.

Stopping after Phase 3 (8.8) is a defensible ship. Everything a user would *feel* is in
Phases 1–2.

## Dependencies

```
1 ──┐
2 ──┼──> 7
3 ──┤
4 ──┴──> 5 ──> 7
     └──> 6 ──> 7
```

## Global constraints

- **No animation library.** Phase 4 hand-rolls a ~60-line spring integrator rather than adding
  Motion. This project has six runtime dependencies on purpose, and we need 1-D springs on
  `transform` only. Rationale and the rejected alternative are in Phase 4.
- **Restraint over bounce.** `DESIGN.md`'s north star is "Territory First". Default every
  spring to critically damped (`damping 1.0`); bounce is permitted *only* where the user's own
  flick supplied the momentum — the sheet in Phase 5. Nothing overshoots because it opened.
- **Animate `transform` and `opacity` only.** One existing violation (`box-shadow` on
  `.card:hover`) is fixed in Phase 1.
- **Every phase leaves the site shippable.** No phase depends on a later one to not regress.
- **Touch is the target.** Every acceptance criterion that can be checked on a phone is checked
  at 375×812 with touch emulation, not just at desktop width.

## Acceptance criteria for the whole plan

1. Every interactive element shows a state change within one frame of pointer-down.
2. No control's hit area is under 44×44 CSS px on a touch pointer.
3. `prefers-reduced-motion`, `prefers-reduced-transparency` and `prefers-contrast` each change
   rendering, and reduced motion preserves opacity feedback rather than removing it.
4. The mobile list sheet tracks the finger 1:1, respects grab offset, projects momentum on
   release, rubber-bands at its bounds, and can be caught and reversed mid-flight.
5. No fixed-duration transition remains on any surface a user can touch.
6. Type tracking and leading differ per size level.
7. Zero regressions: `npm run build`, `npm test`, `npx tsc --noEmit` clean; the click-sweep
   findings from `8ad6e65` stay fixed.
8. No new runtime dependency.

## Verification

Each phase names its own checks. Phase 7 re-runs the full audit and the production click sweep.
Reports land in [`reports/`](reports/).
