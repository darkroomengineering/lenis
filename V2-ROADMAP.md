# Lenis v2 Roadmap

## Philosophy shift

Lenis was originally built for developers syncing WebGL and DOM through smooth scrolling. Over time it became the standard smooth scroll library, widely adopted by designers, no-code users, and AI-assisted workflows. Most users just want reliable smooth scrolling out of the box.

**v2 inverts the paradigm: bulletproof by default, opt out for advanced use cases.**

`new Lenis()` should just work — no configuration, no CSS import to remember, no gotchas.

**v2 also moves Lenis closer to the native APIs.** Wherever the platform already defines a concept, Lenis adopts its name and its semantics instead of inventing its own: `maxScroll` mirrors [`scrollTopMax`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTopMax)/[`scrollLeftMax`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeftMax), `isScrollable` follows [MDN's definition](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#determine_if_the_content_of_an_element_is_overflowing) (a [scroll container](https://developer.mozilla.org/en-US/docs/Glossary/Scroll_container) with overflowing content), root overflow follows the [CSS overflow-propagation spec](https://drafts.csswg.org/css-overflow/#overflow-propagation), boundary detection follows MDN's ["totally scrolled"](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#determine_if_an_element_has_been_totally_scrolled) recipe, and gestures on a non-scrollable axis chain natively instead of being captured. Lenis should be a faithful mirror of the browser's scroll model with animation on top — every property has a citable platform definition, and when in doubt, do what the browser would do.

**The principle is scoped: mirror the platform where it's the authority, exceed it where it's the ceiling.** Scroll geometry, scrollability, and overflow semantics belong to the browser — Lenis mirrors them. Snapping is the opposite case: CSS Scroll Snap can't express lenis/snap's best features (`directional` mode, velocity prediction, snap callbacks, 2D cell selection), so lenis/snap deliberately goes beyond the platform — that's the point of owning the snapping system. When we diverge, we don't borrow names: `align` matches `scroll-snap-align` because the semantics truly match, while `directional` and `lock` get their own words — naming them after CSS properties they don't implement would be a false cognate.

---

## Status legend

- ✅ Shipped on the `v2` branch
- 🚧 Partial / in progress
- ⏳ Planned, not started

---

## Breaking changes

### ✅ Default values flip

Options that were opt-in in v1 are now default-on:

| Option | v1 default | v2 default | Rationale |
|--------|-----------|-----------|-----------|
| `autoRaf` | `false` | `true` | Most users forget to set up the raf loop |
| `autoToggle` | `false` | **removed** — always on (see below) | Overflow changes are handled automatically; no opt-out |
| `anchors` | `false` | `true` | Anchor links should just work |
| `allowNestedScroll` → `nested` | `false` | `{ mode: 'native' }` | Modals and nested containers just work; opt into `mode: 'smooth'` to adopt them with their own Lenis instance ([`NESTED-PLAN.md`](./NESTED-PLAN.md)) |
| `stopInertiaOnNavigate` | `false` | `true` | Prevents scroll bleed on navigation |
| `dimensions.mode` | (was `naiveDimensions: false`) | `'observe'` when `content` is defined, `'read'` otherwise | More reliable for most setups, no manual `naiveDimensions` toggle |

### ✅ Options restructure

Flat options → nested `wheel` and `touch` groups for related config:

```js
// v1
new Lenis({
  smoothWheel: true,
  wheelMultiplier: 1,
  syncTouch: true,
  syncTouchLerp: 0.075,
  touchMultiplier: 1,
  touchInertiaExponent: 1.7,
  lerp: 0.1,
  naiveDimensions: false,
})

// v2
new Lenis({
  wheel: {
    smooth: true,
    lerp: 0.1,
    multiplier: 1,
  },
  touch: {
    smooth: true,
    lerp: 0.1,
    multiplier: 1,
    inertia: 2,
    // optional fine-tuning overrides that only apply on iOS
    ios: {
      lerp: 0.05,
      inertia: 1.7,
    },
  },
  dimensions: {
    mode: 'observe',
  },
})
```

### ✅ Options rename

| v1 | v2 | Reason |
|----|-----|--------|
| `syncTouch` | `touch.smooth` | Mirrors `wheel.smooth`, clearer intent |
| `syncTouchLerp` | `touch.lerp` | Grouped under `touch` |
| `touchMultiplier` | `touch.multiplier` | Grouped under `touch` |
| `touchInertiaExponent` | `touch.inertia` | Grouped under `touch` |
| `smoothWheel` | `wheel.smooth` | Grouped under `wheel` |
| `wheelMultiplier` | `wheel.multiplier` | Grouped under `wheel` |
| `lerp` | `wheel.lerp` | Grouped under `wheel` |
| `virtualScroll`, `prevent` | `onGesture` | Unified into a single transform/cancel callback |
| `naiveDimensions` | `dimensions` | "Naive" was a CS term; the new option is a richer config object with a smart default |
| `autoResize` | `dimensions.autoResize` | Co-located with the dimensions concern it belongs to |

### ✅ Properties rename

| v1 | v2 | Reason |
|----|-----|--------|
| `isStopped` | `isScrollable` | MDN semantics: a scroll container with overflowing content; **polarity inverted** |
| `limit` | `maxScroll` | Mirrors `scrollTopMax` / `scrollLeftMax` |
| `dimensions` | `scrollingBox` | `Dimensions` class rebuilt as `ScrollingBox` around the platform's scroll vocabulary |
| `isTouching` | `isTouch` | Mirrors the gesture `type`; companion `isWheel` added — both reflect the last gesture (`undefined` after `reset()`) |

`isScrolling` (`'native' \| 'smooth' \| false`) stays as-is — no three-way `isWheelScrolling` / `isTouchScrolling` / `isProgrammaticScrolling` split. Callers compose: `isScrolling && isTouch`, `isScrolling && isWheel`, programmatic ≈ `isScrolling === 'smooth' && !isTouch && !isWheel`.

### ✅ Remove `start()` / `stop()`, `autoToggle`, and `scrollTo`'s `lock` / `force`

The CSS is the source of truth: Lenis observes the root's overflow and reacts. Users set `overflow` themselves (or via a class) to pause/resume. `scrollTo` is now unconditional — it always runs, matching native `Element.scrollTo()`.

- ✅ Removed `lenis.start()` / `lenis.stop()` from the public API
- ✅ Removed the `autoToggle` option (always on, no longer configurable)
- ✅ `isStopped` → `isScrollable` — derived from `ScrollingBox` (scroll container + overflowing content), refreshed on resize and on overflow transition events; a flip resets the affected axis. The `lenis-stopped` class is removed
- ✅ Removed `scrollTo`'s `force` option — `scrollTo` always executes now, so there's nothing to force past
- ✅ Removed `scrollTo`'s `lock` option — compose `lenis.lock()` / `lenis.unlock()` via `onStart` / `onComplete` instead
- ✅ `isLocked` narrowed — now only suppresses user wheel/touch input (and tap-to-stop); programmatic `scrollTo` is unaffected. Toggled solely via `lock()` / `unlock()` (no longer cleared by `reset()`)
- ⏳ Document the pattern: set `overflow: hidden` / `clip` on the root to pause, remove it to resume
- Migration:
  - `start()` / `stop()` → flip a CSS overflow property
  - `scrollTo(t, { force: true })` → `scrollTo(t)`
  - `scrollTo(t, { lock: true })` → `scrollTo(t, { onStart: () => lenis.lock(), onComplete: () => lenis.unlock() })`
  - `lenis.isStopped` → `!lenis.isScrollable`; `lenis.isTouching` → `lenis.isTouch`

### lenis/react

- [x] Split `root` into two orthogonal props: `root` (target window, render no wrapper divs) and `rootContext` (register in the global store so `useLenis` reaches it anywhere). `rootContext` defaults to `root`. Removes the overloaded `root="asChild"` string.
- [x] Use `useSyncExternalStore` for state management (`store.ts`)
- [x] Named instances: `<ReactLenis name="sidebar">` → `useLenis('sidebar')`. The single-slot global store became a keyed registry; the global root is just the entry under `ROOT_KEY`, so `rootContext` and `name` share one mechanism.

---

## Internal refactors

### ✅ `GesturesHandler` replaces `VirtualScroll`

The old `virtual-scroll` abstraction was a general-purpose gesture library — Lenis only used a slice of it. It has been replaced by a focused `GesturesHandler` class that does exactly what Lenis needs (wheel + touch → normalized deltas with a `type` discriminator) and nothing more. The old `virtual-scroll.ts` is gone; the new `gestures-handler.ts` is ~160 lines and easier to maintain.

### ✅ `isScrollableElement` extracted to `utils.ts`

The private `hasNestedScroll` method that detected whether a composed-path element could handle the gesture itself was extracted as a pure function in `utils.ts`, decoupled from the `Lenis` class and reusable from other packages.

### ✅ `Dimensions` → `ScrollingBox`

Renamed (`lenis.dimensions` → `lenis.scrollingBox`) and rebuilt around the platform's scroll vocabulary. It now owns all scrollability state: `maxScroll` (was `limit`), `isScrollContainer` (with root overflow propagation per the CSS spec), `isOverflowing`, `isScrollable`, and an `'overflow style changed'` event driven by `transition-behavior: allow-discrete` transitions (from the recommended CSS), with resize as the fallback refresh. `Axis` / `Lenis` dropped their duplicate detection (`checkOverflow`, `cssOverflow`); gesture gating reads the cached `ScrollingBox` state — nothing touches `getComputedStyle` on the hot path — and boundary checks use MDN's 1px "totally scrolled" threshold so fractional scroll positions (zoom, DPR, Safari overscroll) resolve correctly.

It still accepts the `DimensionsOptions` bag (`{ mode, autoResize, debounce }`) and applies its own defaults, including the smart `mode = content ? 'observe' : 'read'` default. `lenis.ts` just forwards the user's config without pre-baking values.

---

## New features

### ✅ `onGesture` callback

Replaces `virtualScroll` + `prevent`. Single transform/cancel callback called once per gesture, before Lenis consumes the deltas:

```ts
new Lenis({
  onGesture: (data, lenis) => {
    // return false to cancel the gesture
    if (someCondition) return false
    // return modified data to change what Lenis sees
    return { ...data, deltaY: data.deltaY * 2 }
    // or return nothing (void) to observe without modifying — treated as pass-through
  },
})
```

The `GestureData` payload includes `deltaX`, `deltaY`, the original `event`, and a `type: 'wheel' | 'touch'` discriminator so callers don't need to sniff `event.type`.

### ✅ iOS-specific touch tuning

iOS devices have subtly different touch physics than Android. `touch.ios` provides a fine-tuning escape hatch for `lerp`, `inertia`, `duration`, and `easing` on iOS only:

```ts
new Lenis({
  touch: {
    smooth: true,
    inertia: 2,            // applies everywhere
    ios: { inertia: 1.7 }, // iOS-only override on top
  },
})
```

iOS detection handles the iPadOS 13+ desktop-UA case via `navigator.maxTouchPoints`.

### 🚧 Multi-axis scrolling

Simultaneous horizontal + vertical scrolling (2D canvas, maps, spreadsheets, layouts that scroll both ways), opt-in via `new Lenis({ orientation: 'both' })`. Single-axis API stays unchanged; you gain `lenis.x` / `lenis.y`.

**Full design + step-by-step plan: [`MULTI-AXIS-PLAN.md`](./MULTI-AXIS-PLAN.md).**

Current state: **core mechanics are implemented and verified working.** The `Axis` class (`packages/core/src/axis.ts`) is clean — per-axis state, `reset`, `advance`, `scrollTo`, `scroll`/`maxScroll`/`progress`/`isScrollable`. `Lenis` delegates to `this.x` / `this.y`, and `orientation: 'both'` is wired through gesture routing, scroll emission, the single per-frame DOM write, `scrollTo`, and `isScrollable`. `lenis/snap` is 2D-aware (per-axis `align`, 2D candidate selection). Verified in a browser on `playground/two-axis`: diagonal `scrollTo`, combined-delta wheel (both axes), DOM sync, and 2D snap to cell centers all behave.

**Decision — top-level scalars stay.** `lenis.scroll` / `velocity` / `progress` etc. remain single-axis conveniences delegating to the active axis (`y` in `'both'` mode); ~99% of users are single-axis and keeping them scalar avoids shape-shifting types and per-frame allocations. In 2D, `lenis.x` / `lenis.y` are the canonical API (the native mirror of `scrollX`/`scrollY`), documented in the README's multi-axis guide.

Remaining before stable:

- ⏳ Real touch / trackpad-inertia testing on devices (only wheel + programmatic verified so far)
- ⏳ Resolve the top-level `duration` / `easing` scope question (see [Open design questions](#open-design-questions))
- ⏳ Polished examples (the two-axis playground is still a raw test bed)

### 🚧 Drag-to-scroll

Mouse drag as a first-class input (`drag: { enabled: true }`) — grab the page and fling it, like a touch surface. Lives in core: `GesturesHandler` emits `type: 'drag'` gestures into the same pipeline as wheel/touch, so axis routing, nested-scroll/`data-lenis-prevent`, release inertia (touch fling math) and reduced-motion all apply for free. 4px threshold keeps clicks and text selection native; the trailing click after a real drag is swallowed. Completes the multi-axis story — a mouse can't scroll a 2D canvas without it. `playground/drag` exercises it; needs cross-browser validation.

### 🚧 Nested smooth scroll (recursive adoption)

`nested: { mode: 'smooth', filter }` (opt-in at launch) — a gesture landing on a nested scrollable element creates (and caches) a Lenis instance on it and hands the in-flight gesture over, so every scrollable surface inherits the feel from the very first wheel tick; recursion falls out naturally since children run the same config. Children are advanced by the parent's raf (no own loop — the leak-prevention backbone) and swept on disconnect. Replaces `allowNestedScroll` (`true` → the default `'native'`; `false` → `{ mode: 'none' }`). **Full design + step-by-step plan: [`NESTED-PLAN.md`](./NESTED-PLAN.md).**

### ⏳ Keyboard controls

Route arrow/page/space/home/end through `scrollTo` so keyboard scrolling is smooth like every other input (today it goes native and bypasses smoothing). Must never hijack keys while focus is in an input, and respects `prefers-reduced-motion` for free via `scrollAxisTo`. With drag this completes "one scroll pipeline for every input".

### ⏳ `lenis/slider` package

Slider built on core + snap + drag: a real scroll container (progressive enhancement, native semantics) where CSS owns layout and Lenis owns feel and state (active index, events, loop, autoplay). Deliberately not Swiper — anything layout-shaped stays in CSS.

### ⏳ Auto CSS injection

Inject critical styles at runtime so users never have to import `lenis.css` manually. This is the most common setup mistake.

### ⏳ Scrollbar plugin

Optional overlay scrollbar plugin (similar to [OverlayScrollbars](https://github.com/KingSora/OverlayScrollbars)) that hides the native scrollbar and renders a fully styleable overlay one driven by Lenis state. Goals:

- Opt-in plugin (`lenis/scrollbar`) — does not affect core bundle size
- Works on `window` and on any scroll container
- Respects Lenis virtual scroll position (not the native one)
- Drag-to-scroll, click-on-track, auto-hide, and hover states
- Themeable via CSS variables / data attributes, no hardcoded styles
- Accessibility: keyboard focus, ARIA roles, `prefers-reduced-motion`

### ⏳ Pull to refresh & UI collapse

Support native pull-to-refresh and browser UI collapse when `touch.smooth` is enabled.

### ⏳ Prevent mobile UI collapse (built-in)

Built-in opt-in to keep the mobile browser chrome (address bar, bottom toolbar) from collapsing/expanding while scrolling. Today this requires manual CSS hacks (`height: 100dvh` containers, `overflow: hidden` on `html`, `position: fixed` wrappers) that are easy to get wrong and fight Lenis. Lenis should handle it natively:

- Toggle via `touch.preventUICollapse: true` (or similar)
- Locks the viewport height so layout doesn't jump as the URL bar shows/hides
- Works alongside `touch.smooth` without extra setup
- No-op on desktop and on browsers where chrome doesn't collapse

### ⏳ Development warnings

Warn in development mode when `infinite` is used on `html`/`body` (causes flicker on iOS).

### Examples

- ✅ `playground/touch` — native vs Lenis side-by-side for debugging `touch.smooth` on real devices
- 🚧 `playground/two-axis` — 5×5 viewport-sized grid for 2D scroll testing (corner cells colour-coded); functional test bed, not yet a polished example
- 🚧 `playground/vertical` + `playground/horizontal` — scenario validation twins: same-axis nested, cross-axis nested, `data-lenis-prevent`, anchors, `stopInertiaOnNavigate`
- ⏳ Framework integrations
- ⏳ Common patterns (modals, drawers, etc.)

#### Examples to release (feature showcases)

- ⏳ **Infinite two-axis grid + snap** — the v2 headline demo: `orientation: 'both'` + `infinite: true`, snap to cells. Reference: [oneupstudio.it](https://www.oneupstudio.it/)
- 🚧 **Stacked cards** — 100vh `sticky top: 0` wrappers, 4/3 cards, snap to each (`playground/sticky-cards` has the mechanics; needs the visual pass). Reference: [stackhealth.darkroom.engineering](https://stackhealth.darkroom.engineering/)
- ⏳ **Autoscroll (cinema)** — auto-advancing reel, pauses on interaction. Reference: [mhvkj4-3000.csb.app](https://mhvkj4-3000.csb.app/)
- 🚧 **Slideshow** — snap-centered slides with proportional custom scrollbar (`playground/slideshow` has the mechanics; needs the visual pass)
- ⏳ **Touch setup** — 100vh wrapper + scroll on a body child, the mobile-app-like layout (`touch.smooth` on a non-window wrapper)
- ⏳ **Vertical gesture for horizontal scroll** — `orientation: 'horizontal'` + `gestureOrientation: 'both'`/`'vertical'`, wheel scrolls the rail

---

## Housekeeping

- [ ] Check if GSAP ScrollTrigger integration is still necessary
- [ ] Deprecate `lenis/snap` `type` option (legacy)

---

## Open design questions

### Top-level `duration` and `easing`

With per-axis `wheel.duration`, `wheel.easing`, `touch.duration`, `touch.easing`, the top-level `LenisOptions.duration` / `LenisOptions.easing` now only serve as defaults for programmatic `lenis.scrollTo()` calls. Should they:

- **Stay** — they act as the "programmatic default" layer (current behavior)
- **Move** — rename to make their scope explicit, e.g. `scrollTo: { duration, easing }`
- **Remove** — programmatic `scrollTo` falls back to `wheel.duration` / `wheel.easing`

---

## Documentation restructure

Invert the docs to match the new philosophy:

**v1 structure:** "Here's the minimal setup → here's how to enable things"

**v2 structure:** "It works out of the box → here's how to customize/disable things"

- Lead with zero-config usage
- Group advanced options in a dedicated section
- Reduce the Settings table to only what power users need to tweak

---

## Migration guide

TBD — will provide a v1 → v2 migration guide covering:
- Changed default values
- Renamed/restructured options (`smoothWheel` → `wheel.smooth`, etc.)
- `virtualScroll` / `prevent` → `onGesture`
- `naiveDimensions` → `dimensions` object with `mode` / `autoResize` / `debounce`
- `autoResize` moved into `dimensions`
- Removed `start()` / `stop()` (→ CSS overflow) and `autoToggle` (always on)
- Removed `scrollTo` options `force` (→ no longer needed) and `lock` (→ `onStart`/`onComplete` + `lock()`/`unlock()`)
- Renamed properties: `isStopped` → `isScrollable` (inverted, and now requires overflowing content — not just overflow CSS), `isTouching` → `isTouch` (+ new `isWheel`); `isScrolling` unchanged
- Renamed properties: `limit` → `maxScroll`, `dimensions` → `scrollingBox` (class `Dimensions` → `ScrollingBox`)
- Removed the `lenis-stopped` class
- React package changes
