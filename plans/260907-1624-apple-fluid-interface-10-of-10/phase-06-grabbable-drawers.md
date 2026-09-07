# Phase 6 — Grabbable drawers & directional hinting

**Sections:** §3 Interruptibility, §8 Hint in the direction of the gesture · **Risk:** medium
**Score after:** 9.9

**Depends on Phase 4.** Independent of Phase 5, though both use `src/lib/gesture.ts` — build
that in whichever lands first.

## Requirements

1. The menu and filter drawers dismiss with a swipe toward their own edge.
2. A drawer can be caught mid-animation and reversed without waiting.
3. Reversal blends velocity rather than cutting it.
4. Intermediate motion telegraphs the outcome.

## Files

**Create**
- `src/components/use-drawer-drag.ts` — the shared hook, used by both drawers

**Modify**
- `src/components/site-menu.tsx` — menu drawer
- `src/components/search-shell.tsx` — filter drawer
- `src/app/globals.css` — remove the `transform` transition on `dialog.drawer` (the spring owns
  it now)

## Steps

### 6.1 Swipe to dismiss

Both drawers enter from the inline start. So both dismiss toward the inline start — §7's
symmetric path, which the current CSS already honours and which the gesture must not break.

Pointer capture on the drawer surface; horizontal drag toward the start edge moves it 1:1.
Vertical movement inside the drawer scrolls the cluster list — same disambiguation problem as
Phase 5.7, but easier: the axes are perpendicular. Commit to an axis after ~10px and cancel the
other.

`touch-action: pan-y` on the drawer lets the browser own vertical scrolling while we take
horizontal — this is the cheap answer and it is the right one.

### 6.2 Decide dismiss vs return by velocity sign, not position

From the Quick Reference: at release, **velocity sign decides**, not how far it travelled. A
fast flick toward the edge dismisses from 10% travel; a slow drag to 60% and a pause returns.

Fall back to position only when velocity is near zero (< ~50px/s).

### 6.3 Catch mid-flight

`pointerdown` during the open or close spring: stop it, read the live transform, carry the
spring's velocity into the drag. The drawer follows the finger from wherever it actually is.

The failure §3 names — "a closing modal the user grabs again should follow the finger, not
finish closing first, then reopen" — is exactly what a `<dialog>` does by default if you let
`close()` run. So the gesture must intercept before `close()`, and only call it once the
dismiss spring settles.

### 6.4 Keep the dialog's semantics

The `<dialog>` still owns focus trapping, Escape, inertness and the backdrop. The spring owns
only `transform`. `close()` fires when the dismiss animation **completes**, not when the
gesture starts — otherwise focus returns while the panel is still on screen.

Escape must still close instantly. Do not route it through the gesture.

### 6.5 Backdrop tracks the drag

The backdrop's opacity follows the drawer's position rather than its own fixed transition:
drag the drawer 40% out and the scrim is at 60% opacity. This is §8 — the intermediate frames
tell you what releasing will do.

Requires moving the backdrop opacity off its CSS transition and onto the same driver.

### 6.6 Directional hint on the handoff

With the 220ms timer gone (Phase 1.5), the menu→filters handoff becomes a real opportunity: the
outgoing menu and incoming filter panel both move along the same axis, so the filter panel
should begin entering while the menu is still leaving. The overlap *is* the hint — it shows the
two are the same drawer changing contents, not two unrelated panels.

## Validation

- Flick the menu drawer toward the start edge at 10% travel: it dismisses.
- Drag to 60% slowly, release with near-zero velocity: it returns.
- Open the drawer, grab at ~80ms, drag back: assert no position discontinuity > 4px and that
  the drawer never completes its open before following the finger.
- Assert `document.activeElement` returns to the menu button only after the dismiss settles,
  never mid-animation.
- Escape closes instantly at any point, including mid-drag.
- Backdrop opacity is proportional to drawer travel — sample at 25%, 50%, 75%.
- Keyboard: drawer still opens with Enter, traps focus, closes on Escape, returns focus.
  **The gesture must add nothing that a keyboard user loses.**
- Reduced motion: no drag springs; dismissal is immediate with a cross-fade. The drag itself
  still tracks.
- `npm run build && npm test && npx tsc --noEmit`.

## Risks & rollback

- **Focus management is the sharp edge.** Calling `close()` at the wrong moment moves focus
  while the panel is still visible, which is worse than no gesture at all. Test with a screen
  reader, not only with assertions.
- Horizontal swipe from the screen's start edge collides with iOS Safari's back gesture. The
  drawer occupies that edge when open, which is the good case; verify a drag starting *on* the
  edge does not trigger navigation.
- Removing the CSS `transform` transition while any code path still expects it will produce a
  drawer that teleports. Grep for anything reading `transitionend` on the drawer before
  deleting.
- Rollback: delete the hook, restore the CSS transition. The `<dialog>` markup does not change,
  so nothing structural depends on this.
