# Smooth wrapper — two ways to own a scroll

## Where Lenis is today

Lenis smooths a page by taking the scroll away from the browser. It listens for wheel and touch, cancels the browser's own reaction, turns the event into a delta, moves a target, and writes the real scroll position every frame. That one decision gave Lenis everything it is known for. It works with one line on any scrollable element. The page stays the real scroller, so `scrollY` is always true and anchors, sticky, observers and find-in-page keep working. And because Lenis holds the input, it can do things a browser never will: infinite scroll, custom snapping, per-gesture speed and inertia.

The same decision is also where most of the hard problems come from. Every gesture has to be re-implemented from raw events, and touch is the one that never quite closes. To keep a WebGL scene in sync with the DOM on a phone, the only option has been `syncTouch`, which replays iOS inertia in JavaScript. It is close, but it is not the platform. The toolbar stops collapsing, pull-to-refresh and overscroll navigation disappear, text-selection handles break, and scroll chaining out of an iframe never reaches Lenis. Sites have had to choose between native touch with a canvas that drifts, and a synced canvas on a page that no longer feels like the phone.

## What Smooth wrapper changes

Smooth wrapper flips the ownership. The browser scrolls the page, natively, with nothing intercepted. Lenis scrolls a fixed, `overflow: hidden` wrapper toward the page position every frame. The window is the target, the wrapper is what you see, and both are real scroll containers.

```html
<body>
  <div id="smooth-wrapper">   <!-- position: fixed; inset: 0; overflow: hidden -->
    <div id="smooth-content">
      <!-- all page content -->
    </div>
  </div>
  <!-- position: fixed elements can stay outside -->
</body>
```

That flip fixes the touch problem at the root rather than by emulation. Wheel, touch, keyboard, scrollbar and iframes behave as on a plain page. On iOS the toolbar collapses, pull-to-refresh, overscroll navigation, rubber-band and selection handles all work, because the page really is scrolling. On touch the wrapper can run with no lerp at all, so the feel is the platform's own inertia while DOM and canvas still read one shared scroll value. Smoothing on touch becomes a choice instead of the price of syncing. Inside the wrapper the DOM stays real: sticky, fixed, IntersectionObserver and scroll-driven animations keep working, and when the browser scrolls the wrapper itself, for an anchor, a focused input or scroll anchoring, Lenis adopts it and moves the page along. Because the page scroll runs on the compositor, a busy main thread delays only the visual catch-up, never the gesture or the scrollbar. Everything above the scroll position is unchanged: `scroll`, `velocity`, events, `scrollTo`, snap and the React and Vue bindings read from the same place they always did.

## Its limits

The flip is honest about what it costs. Infinite scroll is gone, because neither scroller can move past the content height. Find-in-page is gone, because Chrome only search-scrolls containers the user can scroll. The page has to be wrapped, so this is a root-level mode and not a one-liner on any element. `scrollY` reports the target, not what is on screen, so anything that reads the window, ScrollTrigger by default, has to be pointed at the wrapper. And without interception there is nothing between "smoothed" and "not": no multipliers, no inertia curves, and snapping has to work from the page's `scrollend` instead of from the gesture.

## Benefits and drawbacks

**Benefits**

- Nothing is intercepted. Wheel, touch, keyboard, scrollbar and iframes stay native: no `preventDefault`, no delta normalization, no inertia emulation.
- The platform stays intact on iOS: toolbar collapse, pull-to-refresh, overscroll navigation, rubber-band and selection handles all work. Confirmed on device.
- Perfect scroll sync. `on("scroll")` fires inside the raf, after the axis advanced and before the wrapper write and the paint, so a consumer reads the exact value that frame paints with. Measured: same-frame every frame, where a scroll listener trails by one frame.
- Sync first, smoothing second. The default `lerp: 0` mirrors the window every frame, so the feel is exactly native on every input and the sync stays. Smoothing is opt-in, per input.
- The DOM inside the wrapper is real: `position: sticky`, `position: fixed`, IntersectionObserver and scroll-driven animations through a named timeline all work.
- Browser-initiated scrolls reconcile. Anchors, focus, `scrollIntoView` and scroll anchoring move the wrapper; Lenis adopts the position and brings the window along.
- The target runs on the compositor. A busy main thread delays only the visual catch-up, never the gesture or the scrollbar.
- Small: about 2 KB gzipped, built from the same axis, dimensions and emitter as core, with the same consumer API: `scroll`, `velocity`, `direction`, `progress`, `scrollTo`, `on("scroll")`.

**Drawbacks**

- No infinite scroll. Neither scroller can move past the content height.
- No find-in-page. Chrome only search-scrolls containers the user can scroll, and stops climbing at a fixed box.
- The DOM shape is mandatory: a fixed `overflow: hidden` wrapper around the content. Root-level only; nested scrollers are on their own.
- `scrollY` is the target, not what is on screen. Anything reading the window, ScrollTrigger by default or a bare `scroll()` timeline, must be pointed at the wrapper.
- No per-gesture control. No multiplier, no inertia curve, no gesture-level snap steering; snap has to work from the window's `scrollend`, and input discrimination is best-effort through passive listeners.
- Programmatic `scrollTo` moves the scrollbar to the target at once while the content animates toward it.
- Everything that scrolls the window gets smoothed, scroll restoration included; an immediate sync at init covers the boot case.
- Print needs a stylesheet that resets the wrapper.
- Vertical only, for now.

## How they fit

Neither replaces the other. Virtual scroll stays the default and the general tool, for any element, with every capability it has today. Smooth wrapper is the right tool for one job that virtual scroll could never do cleanly: a scroll-synced site where touch has to stay native. They share one engine but ship as two entries, because they serve two purposes. The choice for a site is short. If DOM and canvas must stay in sync on touch and you can live without infinite scroll and find-in-page, wrap the page. Otherwise, nothing changes.

## Packaging: `lenis/light`

Smooth wrapper ships as its own entry, `lenis/light`, not as a mode of core. It is a different tool for a different purpose, and a mode would drag every gesture option along as something to document and ignore. The light class is a sibling built from the same internals as core, the axes, the animation, the dimensions and the emitter, with about two hundred lines of its own: the window listener driving the target, the reconcile rule, body sizing, per-input lerp and a small `scrollTo`. It exposes the same instance shape, so `lenis/snap` and the React and Vue bindings work against it with small adjustments rather than copies. Roughly 3 KB gzipped against 8 KB for core.

## Prototype

A Lenis-free prototype lives in [`playground/smooth-wrapper/`](./playground/smooth-wrapper/) and is served at `/smooth-wrapper`. It carries fixtures for everything claimed above: sticky and fixed inside the content, IntersectionObserver, named scroll timelines, anchors, a focusable input, iframes, and per-input lerp (1 on touch, 0.1 on wheel).
