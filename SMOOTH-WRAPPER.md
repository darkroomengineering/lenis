# Smooth wrapper — two ways to own a scroll

## Where Lenis is today

Lenis smooths a page by taking the scroll away from the browser. It listens for wheel and touch, cancels the browser's own reaction, turns the event into a delta, moves a target, and writes the real scroll position every frame. That one decision gave Lenis everything it is known for. It works with one line on any scrollable element. The page stays the real scroller, so `scrollY` is always true and anchors, sticky, observers and find-in-page keep working. And because Lenis holds the input, it can do things a browser never will: infinite scroll, custom snapping, per-gesture speed and inertia.

The same decision is also where most of the hard problems come from. Every gesture has to be re-implemented from raw events, and touch is the one that never quite closes. To keep a WebGL scene in sync with the DOM on a phone, the only option has been `syncTouch`, which replays iOS inertia in JavaScript. It is close, but it is not the platform. The toolbar stops collapsing, pull-to-refresh and overscroll navigation disappear, text-selection handles break, and scroll chaining out of an iframe never reaches Lenis. Sites have had to choose between native touch with a canvas that drifts, and a synced canvas on a page that no longer feels like the phone.

## What Smooth wrapper changes

Smooth wrapper flips the ownership. The browser scrolls the page, natively, with nothing intercepted. Lenis scrolls a fixed, `overflow: hidden` wrapper toward the page position every frame. The window is the target, the wrapper is what you see, and both are real scroll containers.

There is no markup to add. `body` is the wrapper and `html` is the scroller: `lenis/sync` sets `overflow: auto` and the content height on `html`, pins `body` as a sticky `100dvh` box with `overflow: hidden`, and restores all of it on destroy.

That flip fixes the touch problem at the root rather than by emulation. Wheel, touch, keyboard, scrollbar and iframes behave as on a plain page. On iOS the toolbar collapses, pull-to-refresh, overscroll navigation, rubber-band and selection handles all work, because the page really is scrolling. The wrapper runs with no lerp: the feel is the platform's own inertia, and DOM and canvas read one shared scroll value. Inside the wrapper the DOM stays real: sticky, fixed, IntersectionObserver and scroll-driven animations keep working, and when the browser scrolls the wrapper itself, for an anchor, a focused input or scroll anchoring, Lenis adopts it and moves the page along. Because the page scroll runs on the compositor, a busy main thread delays only the visual catch-up, never the gesture or the scrollbar. Everything above the scroll position is unchanged: `scroll`, `velocity`, events, `scrollTo`, snap and the React and Vue bindings read from the same place they always did.

## Its limits

Infinite scroll is gone, because neither scroller can move past the content height. The page has to be wrapped, so this is a root-level tool and not a one-liner on any element. It is vertical only for now. And snapping has to work from the release and the page's `scrollend`, not from the gesture.

Everything else virtual scroll does with the input, smoothing, multipliers, inertia curves, gesture-level snap steering, is not a goal here. Those belong to core, and on desktop you use core.

## Benefits and drawbacks

**Benefits**

- Find-in-page works. The body is a sticky, not fixed, box, so the browser's search walk climbs past it to the root, the window scrolls, and the mirror reveals the match. Confirmed with a real Ctrl+F.
- No markup. `body` is the wrapper and `html` carries the content height and the page scrollbar. `lenis/sync` applies the four inline styles itself and restores them on destroy. The same HTML serves core on desktop.
- Nothing is intercepted. Touch stays native: no `preventDefault`, no delta extraction, no inertia emulation.
- The platform stays intact on iOS: toolbar collapse, pull-to-refresh, overscroll navigation, rubber-band and selection handles all work. Confirmed on device.
- `scrollY` is right. With `lerp: 0` the body mirrors the window in the same frame, so window scroll listeners, IntersectionObserver, ScrollTrigger on its default scroller and `scroll(root)` timelines all read the painted position without knowing sync exists.
- Perfect scroll sync. `on("scroll")` fires after the axis advanced and before the body write and the paint, so a consumer reads the exact value that frame paints with. Measured: same-frame every frame, where a scroll listener trails by one frame.
- Sync, not smoothing. `lerp` is 0: the body mirrors the window every frame, the feel is exactly the platform's, and DOM and canvas read one value.
- The DOM stays real: `position: sticky`, `position: fixed`, IntersectionObserver and scroll-driven animations through a named timeline on `body` all work.
- Browser-initiated scrolls reconcile. Anchors, focus, `scrollIntoView` and scroll anchoring move the body; `lenis/sync` adopts the position and brings the window along.
- Third-party scroll locks compose. Base UI locks `html`, the target freezes, the body has nothing to follow, and the styles are restored on close. Verified.
- The target runs on the compositor. A busy main thread delays only the mirror, never the gesture.
- Small: about 2 KB gzipped, built from the same axis, dimensions and emitter as core, with the same consumer API: `scroll`, `velocity`, `direction`, `progress`, `scrollTo`, `on("scroll")`.

**Drawbacks**

- No infinite scroll. Neither scroller can move past the content height.
- No gesture-level snap steering. Snap works from the release and the window's `scrollend`.
- Vertical only, for now.

Not goals, so not counted: smoothing, per-gesture multipliers and inertia curves, a desktop scrollbar. Minor and accepted: print needs a stylesheet that resets the body; if you opt into a `lerp`, anything reading `scrollY` runs one step ahead of the body. A sticky body is in flow, so a modal that hides the page scrollbar and reserves a gutter no longer shifts anything, measured with Base UI on a classic-scrollbar desktop.

**Find-in-page, the sticky path.** Chrome only search-scrolls containers the user can scroll, skips the rest and keeps climbing, but a `position: fixed` box ends the climb. A `position: sticky` body does not: pinned at `top: 0` with a `100dvh` height inside an `html` that owns the scroll, it behaves exactly like the fixed one (pinning, body scrolling, sticky and fixed children, max scroll all measured identical) and lets the walk reach the root, where the window scrolls by the delta and the mirror reveals the match at the exact spot. The old objection to sticky, a body that is itself a scroll container capturing a sticky child, cannot occur here because body is the sticky box and html is its scroller. `lenis/sync` styles the body sticky for this reason. Confirmed with a real Ctrl+F: find-in-page works.

## How they fit

The split is by input, not by taste. `lenis/sync` has one purpose: perfect scroll sync on touch. It does not smooth, it does not shape gestures, and it does not replace core on desktop. Core stays the tool for wheel, with every capability it has today.

The two are meant to run on the same markup. On a touch device, `lenis/sync` mirrors the page scroll into the wrapper. On desktop, core takes the wrapper as its element, intercepts wheel over it and scrolls it itself; the body is never given a height, so nothing else scrolls. One DOM, two engines, picked at runtime:

```js
const lenis = matchMedia('(pointer: coarse)').matches
  ? new LenisSync()
  : new Lenis({ wrapper: '#smooth-wrapper', content: '#smooth-content' })
```

Consumers do not care which one they got: `scroll`, `velocity`, `on('scroll')` and `scrollTo` read the same on both. Two things to settle on the desktop path: core only drives elements it sees as scroll containers, so the wrapper needs `overflow: auto` there instead of `hidden`, and that brings back its scrollbar, to hide or to replace.

## Packaging: `lenis/sync`

The promise: minimal scroll sync. It just puts the scroll in the main thread, verbatim.

Smooth wrapper ships as its own entry, `lenis/sync`, not as a mode of core. It is a different tool for a different purpose, and a mode would drag every gesture option along as something to document and ignore. The sync class is a sibling built from the same internals as core, the axes, the animation, the dimensions and the emitter, with a few hundred lines of its own: the window listener driving the target, the reconcile rule, body sizing, passive input tags and a small `scrollTo`. It exposes the same instance shape, so `lenis/snap` and the React and Vue bindings work against it with small adjustments rather than copies. About 2 KB gzipped against 8 KB for core.

## Prototype

A Lenis-free prototype lives in [`playground/smooth-wrapper/`](./playground/smooth-wrapper/) and is served at `/smooth-wrapper`. It carries fixtures for everything claimed above: sticky and fixed inside the content, IntersectionObserver, named scroll timelines, anchors, a focusable input, iframes, and per-input lerp (1 on touch, 0.1 on wheel).
