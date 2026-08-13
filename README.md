[![LENIS](https://assets.darkroom.engineering/lenis/banner.gif)](https://github.com/darkroomengineering/lenis)

[![npm](https://img.shields.io/npm/v/lenis?colorA=E30613&colorB=000000
)](https://www.npmjs.com/package/lenis)
[![downloads](https://img.shields.io/npm/dm/lenis?colorA=E30613&colorB=000000
)](https://www.npmjs.com/package/lenis)
[![size](https://img.shields.io/bundlephobia/minzip/lenis?label=size&colorA=E30613&colorB=000000)](https://bundlephobia.com/package/lenis)

## Introduction

Lenis ("smooth" in latin) is a lightweight, robust, and performant smooth scroll library. It's designed by [@darkroom.engineering](https://twitter.com/darkroomdevs) to be simple to use and easy to integrate into your projects. It's built with performance in mind and is optimized for modern browsers. It's perfect for creating smooth scrolling experiences on your website such as WebGL scroll syncing, parallax effects, and much more, see [Demo](https://lenis.darkroom.engineering/) and [Showcase](https://www.lenis.dev/showcase).

Read our [Manifesto](https://github.com/darkroomengineering/lenis/blob/main/MANIFESTO.md) to learn more about the inspiration behind Lenis.

<br/>

- [Sponsors](#sponsors)
- [Packages](#packages)
- [Showcase](https://www.lenis.dev/showcase)
- [Installation](#installation)
- [Setup](#setup)
- [No-code usage](#no-code-usage)
- [Settings](#settings)
- [Properties](#properties)
- [Methods](#methods)
- [Events](#events)
- [Multi-axis scrolling](#multi-axis-scrolling)
- [Considerations](#considerations)
- [Limitations](#limitations)
- [Troubleshooting](#troubleshooting)
- [Tutorials](#tutorials)
- [Plugins](#plugins)
- [License](#license)

<br/>

## Sponsors

If you’ve used Lenis and it made your site feel just a little more alive, consider [sponsoring](https://github.com/sponsors/darkroomengineering).

Your support helps us smooth out the internet one library at a time—and lets us keep building tools that care about the details most folks overlook.

<a href="https://www.osmo.supply/?utm_source=lenis.dev"><img src="https://www.lenis.dev/sponsors/osmo.png" width="128"/></a>
<br/>

<!-- sponsors -->
[![Jesse Winton](https://img.logo.dev/cosmos.so?size=64&token=pk_E-KcYZmdT--jxwGY3dAs1Q&fallback=404)](mailto:jesse@cosmos.so) [![smsunarto](https://github.com/smsunarto.png?size=64)](https://github.com/smsunarto) [![bizarro](https://github.com/bizarro.png?size=64)](https://github.com/bizarro) [![itsoffbrand](https://github.com/itsoffbrand.png?size=64)](https://github.com/itsoffbrand) [![arkconclave](https://github.com/arkconclave.png?size=64)](https://github.com/arkconclave) [![Tamas Bodo](https://img.logo.dev/framerpod.com?size=64&token=pk_E-KcYZmdT--jxwGY3dAs1Q&fallback=404)](mailto:hello@framerpod.com) [![glauber-sampaio](https://github.com/glauber-sampaio.png?size=64)](https://github.com/glauber-sampaio) [![cachet-studio](https://github.com/cachet-studio.png?size=64)](https://github.com/cachet-studio) [![OHO-Design](https://github.com/OHO-Design.png?size=64)](https://github.com/OHO-Design) [![joevingracien](https://github.com/joevingracien.png?size=64)](https://github.com/joevingracien) [![Lazar Filipovic](https://ui-avatars.com/api/?name=Lazar+Filipovic&size=64)](mailto:webdesignbylazar@gmail.com)
<!-- sponsors -->

<br/>
<a href="https://vercel.com/oss">
  <img alt="Vercel OSS Program" src="https://vercel.com/oss/program-badge.svg" />
</a>

<br/>

## Packages

- [lenis](https://github.com/darkroomengineering/lenis/blob/main/README.md)
- [lenis/react](https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md)
- [lenis/vue](https://github.com/darkroomengineering/lenis/tree/main/packages/vue/README.md)
- [lenis/framer](https://lenis.framer.website/)
- [lenis/snap](https://github.com/darkroomengineering/lenis/tree/main/packages/snap/README.md)

<br/>

## Installation

Using a package manager:

```bash
npm i lenis
# or
yarn add lenis
# or
pnpm add lenis
```

```js
import Lenis from 'lenis'
```

<br/>

Using scripts:

```html
<script src="https://unpkg.com/lenis@1.3.21/dist/lenis.min.js"></script> 
```


<br/>

## Setup

### Basic:

```js
// Initialize Lenis (runs its own requestAnimationFrame loop by default)
const lenis = new Lenis();

// Listen for the scroll event and log the event data
lenis.on('scroll', (e) => {
  console.log(e);
});
```

### Custom raf loop:

```js
// Initialize Lenis without its internal raf loop
const lenis = new Lenis({ autoRaf: false });

// Use requestAnimationFrame to continuously update the scroll
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);
```

### Recommended CSS:

**Import stylesheet:**
```js
import 'lenis/dist/lenis.css'
```

**Or link the CSS file:**

```html
<link rel="stylesheet" href="https://unpkg.com/lenis@1.3.21/dist/lenis.css">
```

**Or add it manually:**

[See lenis.css stylesheet](./packages/core/lenis.css)

### GSAP ScrollTrigger:
```js
// Initialize a new Lenis instance for smooth scrolling, driven by GSAP's ticker
const lenis = new Lenis({ autoRaf: false });

// Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
lenis.on('scroll', ScrollTrigger.update);

// Add Lenis's requestAnimationFrame (raf) method to GSAP's ticker
// This ensures Lenis's smooth scroll animation updates on each GSAP tick
gsap.ticker.add((time) => {
  lenis.raf(time * 1000); // Convert time from seconds to milliseconds
});

// Disable lag smoothing in GSAP to prevent any delay in scroll animations
gsap.ticker.lagSmoothing(0);

```

<br/>

## No-code usage

One line, no build step — just drop this into your HTML:

```html
<link rel="stylesheet" href="https://unpkg.com/lenis@1.3.21/dist/lenis.css">
<script src="https://unpkg.com/lenis@1.3.21/dist/lenis.min.js"></script> 
<script>new Lenis()</script>
```

That's it, your page now has smooth scrolling — the defaults already handle most of the usual issues:
- compatibility with other packages (nested scroll)
- smooth anchors
- scroll inertia stopped on page change

<br/>


## Settings

| Option                  | Type                       | Default                                                    | Description                                                                                                                                                                                                                                                 |
|-------------------------|----------------------------|------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `allowNestedScroll`     | `boolean`                  | `true`                                                     | Let nested scrollable elements scroll natively. ⚠️ Checks the DOM tree on every scroll event — if that's a performance concern, disable it and use `data-lenis-prevent` attributes instead (see [Nested scroll](#nested-scroll)).                             |
| `anchors`               | `boolean, ScrollToOptions` | `true`                                                     | Scroll to anchor links when clicked. Pass `ScrollToOptions` to customize the scroll (e.g. `{ offset: 100 }`).                                                                                                                                                 |
| `autoRaf`               | `boolean`                  | `true`                                                     | Automatically run the `requestAnimationFrame` loop. Set to `false` to drive it yourself via `lenis.raf(time)`.                                                                                                                                                |
| `content`               | `HTMLElement`              | `undefined`                                                | The element that contains the scrolled content, usually `wrapper`'s direct child (`document.documentElement` when `wrapper` is `window`). Providing it enables `ResizeObserver`-based dimensions (`dimensions.mode: 'observe'`).                              |
| `dimensions`            | `object`                   | `{ autoResize: true, debounce: 500, mode: content ? 'observe' : 'read' }` | How scroll dimensions are computed. `'observe'` uses `ResizeObserver` (requires `content`), `'read'` reads `scrollWidth`/`scrollHeight` directly (⚠️ can cause reflows). With `autoResize: false` you must call `.resize()` manually.          |
| `eventsTarget`          | `HTMLElement, Window`      | `wrapper`                                                  | The element that will listen to `wheel` and `touch` events.                                                                                                                                                                                                   |
| `gestureOrientation`    | `string`                   | `'vertical'` if `orientation` is `vertical`, else `'both'` | The orientation of the gestures. Can be `vertical`, `horizontal` or `both`. Has no effect when `orientation: 'both'`.                                                                                                                                         |
| `infinite`              | `boolean`                  | `false`                                                    | Enable infinite scrolling! `touch: { smooth: true }` is required on touch devices ([See example](https://codepen.io/ClementRoche/pen/OJqBLod)).                                                                                                               |
| `onGesture`             | `function`                 | `undefined`                                                | Called on every gesture before it's consumed (replaces v1 `virtualScroll`). Return `false` to cancel it, or a modified `GestureData` to alter it. Example: `({ deltaY, ...data }) => ({ ...data, deltaY: deltaY / 2 })`.                                      |
| `orientation`           | `string`                   | `vertical`                                                 | The orientation of the scrolling. Can be `vertical`, `horizontal` or `both` (see [Multi-axis scrolling](#multi-axis-scrolling)).                                                                                                                              |
| `overscroll`            | `boolean`                  | `true`                                                     | Similar to CSS overscroll-behavior (https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior).                                                                                                                                                    |
| `respectReducedMotion`  | `boolean`                  | `true`                                                     | Honor the user's `prefers-reduced-motion` setting: smoothing is disabled and programmatic scrolls are instant, while scroll keeps running on the main thread ([see Reduced motion](#reduced-motion)).                                                          |
| `stopInertiaOnNavigate` | `boolean`                  | `true`                                                     | Stop scroll inertia when an internal link is clicked.                                                                                                                                                                                                         |
| `touch`                 | `object`                   | `{ smooth: false, lerp: 0.1, multiplier: 1, inertia: 2 }`  | Touch scroll behavior (replaces v1 `syncTouch*`/`touchMultiplier`), see [Wheel, touch & iOS](#wheel-touch--ios).                                                                                                                                              |
| `wheel`                 | `object`                   | `{ smooth: true, lerp: 0.1, multiplier: 1 }`               | Wheel scroll behavior (replaces v1 `smoothWheel`/`wheelMultiplier`/`lerp`), see [Wheel, touch & iOS](#wheel-touch--ios).                                                                                                                                      |
| `wrapper`               | `HTMLElement, Window`      | `window`                                                   | The element that will be used as the scroll container.                                                                                                                                                                                                        |
<br/>

### Wheel, touch & iOS

Wheel and touch gestures are configured independently. Smoothing is on by default for wheel and off for touch — native touch scrolling is already smooth:

```js
new Lenis({
  wheel: { smooth: true, lerp: 0.1, multiplier: 1 },
  touch: { smooth: false, multiplier: 1 },
})
```

Set `touch: { smooth: true }` to let Lenis drive touch scrolling too — it mimics native touch scroll while keeping it synced (required for `infinite` on touch devices, can be unstable on iOS<16). It's tuned by `lerp`, `multiplier` and `inertia` (release momentum strength).

Touch physics feel different on iOS, so on iOS devices (iPhone, and iPad even when it reports as macOS) Lenis swaps in iOS-specific touch values — `{ inertia: 1.7, lerp: 0.05 }` by default. Pass `touch.ios` to override them; keys you set replace the iOS defaults, anything else falls back to your base `touch` values:

```js
new Lenis({
  touch: {
    smooth: true,
    inertia: 2, // Android & others
    ios: { inertia: 1.5, lerp: 0.06 }, // iPhone & iPad
  },
})
```

Both `wheel` and `touch` also accept `duration`/`easing` instead of `lerp` to switch to time-based animation. At runtime, `lenis.isWheel` / `lenis.isTouch` tell you which input drove the last gesture.

<br/>

## Properties

Scroll state properties (`scroll`, `velocity`, `direction`, …) read the *active* axis — `x` when `orientation: 'horizontal'`, `y` otherwise. In `orientation: 'both'` mode, read each axis via `lenis.x` / `lenis.y` (see [Multi-axis scrolling](#multi-axis-scrolling)).

| Property                | Type              | Description                                                                |
|-------------------------|-------------------|----------------------------------------------------------------------------|
| `actualScroll`          | `number`          | Current scroll value registered by the browser                             |
| `animatedScroll`        | `number`          | Current scroll value                                                       |
| `className` (getter)    | `string`          | `rootElement` className                                                    |
| `direction`             | `number`          | `1`: scrolling forward, `-1`: scrolling backward, `0`: idle                |
| `isHorizontal` (getter) | `boolean`         | Whether or not the instance is horizontal                                  |
| `isLocked` (getter)     | `boolean`         | Whether user-initiated scrolling is currently suppressed, via `lock()` or `scrollTo(target, { lock: true })` (replaces v1 `isStopped`) |
| `isScrollable` (getter) | `boolean`         | Whether the wrapper can currently scroll: it's a [scroll container](https://developer.mozilla.org/en-US/docs/Glossary/Scroll_container) with overflowing content (see [Scrollability detection](#scrollability-detection)) |
| `isScrolling` (getter)  | `boolean, string` | Whether or not the scroll is being animated, `smooth`, `native` or `false` |
| `isSmooth` (getter)     | `boolean`         | Whether `isScrolling` is `smooth`                                          |
| `isTouch` / `isWheel`   | `boolean`         | Whether the last gesture was a touch / a wheel                             |
| `lastVelocity`          | `number`          | Last scroll velocity                                                       |
| `options`               | `object`          | Instance options                                                           |
| `prefersReducedMotion` (getter) | `boolean` | Whether the user prefers reduced motion and Lenis is honoring it           |
| `progress` (getter)     | `number`          | Scroll progress from `0` to `1`                                            |
| `rootElement` (getter)  | `HTMLElement`     | Element on which Lenis is instanced                                        |
| `scroll` (getter)       | `number`          | Current scroll value (handles infinite scroll if activated)                |
| `maxScroll` (getter)    | `number`          | Maximum scroll value, mirrors [`scrollTopMax`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTopMax)/[`scrollLeftMax`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeftMax) (was `limit` in v1) |
| `scrollingBox`          | `object`          | `ScrollingBox` instance — the wrapper's scroll geometry, mirroring the element's scroll properties: `width`, `height`, `scrollWidth`, `scrollHeight`, `maxScroll`, `isScrollContainer`, `isOverflowing`, `isScrollable` (was `dimensions` in v1) |
| `targetScroll`          | `number`          | Target scroll value                                                        |
| `time`                  | `number`          | Time elapsed since instance creation                                       |
| `userData` (getter)     | `object`          | `userData` of the in-flight `scrollTo`, forwarded through `scroll` events  |
| `velocity`              | `number`          | Current scroll velocity                                                    |
| `x` / `y`               | `Axis`            | Per-axis state — each exposes `scroll`, `targetScroll`, `animatedScroll`, `actualScroll`, `velocity`, `lastVelocity`, `direction`, `progress`, `maxScroll` and `isScrollable` |

<br/>

## Methods

| Method                      | Description                                                                     | Arguments                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
|-----------------------------|---------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `destroy()`                 | Destroys the instance and removes all events.                                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `lock()` / `unlock()`       | Suppress / restore user-initiated scrolling on both axes (replaces v1 `stop()`/`start()`). Programmatic `scrollTo` still runs while locked. |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `on(event, callback)`       | Subscribe to an [instance event](#events). Returns an unsubscribe function.     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `off(event, callback)`      | Unsubscribe from an [instance event](#events).                                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `raf(time)`                 | Must be called every frame if `autoRaf: false`.                                 | `time`: in ms                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `resize()`                  | Compute internal sizes, it has to be used if `dimensions.autoResize` is `false`. |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `scrollTo(target, options)` | Scroll to target.                                                               | `target`: goal to reach<ul><li>`number`: value to scroll in pixels</li><li>`string`: CSS selector or keyword (`top`, `left`, `start`, `bottom`, `right`, `end`)</li><li>`HTMLElement`: DOM element</li><li>`{ x?, y? }`: per-axis values, drives both axes at once (see [Multi-axis scrolling](#multi-axis-scrolling))</li></ul>`options`<ul><li>`offset`(`number, { x?, y? }`): equivalent to [`scroll-padding-top`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-top), a scalar applies to every driven axis</li><li>`lerp`(`number`): animation lerp intensity</li><li>`duration`(`number`): animation duration (in seconds)</li><li>`easing`(`function`): animation easing</li><li>`immediate`(`boolean`): ignore duration, easing and lerp</li><li>`lock`(`boolean`): whether or not to prevent the user from scrolling until the target is reached</li><li>`onStart`(`function`): called when the scroll starts</li><li>`onComplete`(`function`): called when the target is reached</li><li>`userData`(`object`): this object will be forwarded through `scroll` events</li></ul> |



## Events

| Event     | Callback Arguments                                            |
|-----------|---------------------------------------------------------------|
| `scroll`  | Lenis instance                                                |
| `gesture` | `{deltaX, deltaY, event, type}` (replaces v1 `virtual-scroll`) |


<br/>

## Multi-axis scrolling

Lenis can drive both axes simultaneously — 2D canvases, maps, spreadsheet-style layouts:

```js
const lenis = new Lenis({
  orientation: 'both',
})
```

### Per-axis API

In 2D, the per-axis instances `lenis.x` / `lenis.y` are the canonical API — mirroring the browser's own model (`scrollX`/`scrollY`, `scrollLeft`/`scrollTop`):

```js
lenis.x.scroll        // current horizontal scroll value
lenis.y.velocity      // current vertical velocity
lenis.y.progress      // vertical progress, 0..1
lenis.x.maxScroll     // maximum horizontal scroll value
lenis.x.isScrollable  // whether the x axis can currently scroll
```

Each axis exposes `scroll`, `targetScroll`, `animatedScroll`, `velocity`, `lastVelocity`, `direction`, `progress`, `maxScroll` and `isScrollable`.

### Top-level properties are single-axis shorthands

`lenis.scroll`, `lenis.velocity`, `lenis.progress`, etc. read the *active* axis: `x` when `orientation: 'horizontal'`, `y` otherwise — **including in `'both'` mode**. They exist so single-axis code stays simple; in 2D, read `lenis.x` / `lenis.y` directly. `lenis.isScrolling` and `lenis.isScrollable` do aggregate across axes.

### scrollTo

Pass an `{ x, y }` object to target both axes (either can be omitted). Number, keyword and element targets apply to the active axis:

```js
lenis.scrollTo({ x: 500, y: 1000 }, { duration: 1 })
lenis.scrollTo({ x: 500 }) // single axis
```

The `offset` option accepts a scalar (applied to both axes) or `{ x, y }`.

### Gestures

With `orientation: 'both'`, `gestureOrientation` has no effect: `deltaX` drives the x axis, `deltaY` drives the y axis, and each axis independently consumes the gesture or chains natively based on its own scrollability and edges.

### Events

`scroll` fires as usual — read the axes off the instance:

```js
lenis.on('scroll', ({ x, y }) => {
  console.log(x.scroll, y.scroll)
})
```

### Snap

[lenis/snap](https://github.com/darkroomengineering/lenis/tree/main/packages/snap/README.md) is 2D-aware: snap points are `{ x, y }` cells and `align` applies per axis.

<br/>

## Considerations

### Nested scroll

Nested scrollable elements scroll natively out of the box: the `allowNestedScroll` option (default `true`) detects them automatically. However, this checks the DOM tree on every scroll event — if you experience performance problems, disable it and mark the nested elements with `data-lenis-prevent` instead:

```html
<div data-lenis-prevent>scrollable content</div>
```

[See example](https://codepen.io/ClementRoche/pen/PoLdjpw)

| Attribute                       | Description                          |
|---------------------------------|--------------------------------------|
| `data-lenis-prevent`            | Prevent all smooth scroll events     |
| `data-lenis-prevent-wheel`      | Prevent wheel events only            |
| `data-lenis-prevent-touch`      | Prevent touch events only            |
| `data-lenis-prevent-vertical`   | Prevent vertical scroll events only  |
| `data-lenis-prevent-horizontal` | Prevent horizontal scroll events only|



### Scrollability detection

Lenis follows the browser's own rules to decide whether an axis can scroll: the wrapper must be a [scroll container](https://developer.mozilla.org/en-US/docs/Glossary/Scroll_container) (`overflow` set to `scroll` or `auto`) **and** its [content must overflow](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#determine_if_the_content_of_an_element_is_overflowing). When the wrapper is the root element, [overflow propagation](https://drafts.csswg.org/css-overflow/#overflow-propagation) to the viewport is taken into account: `visible` counts as `auto`, and `<body>`'s overflow applies when the root's is `visible`. Gestures on a non-scrollable axis are not intercepted, matching native scroll chaining.

Lenis reacts to live `overflow` changes (e.g. toggling `overflow: hidden` while a modal is open) without polling, via overflow transition events. This requires the recommended CSS, which sets `transition-behavior: allow-discrete` for `overflow` on the wrapper (Chrome 117+, Firefox 129+, Safari 17.4+ — without it, overflow changes are picked up on the next resize). When an axis flips to non-scrollable, its in-flight animation is halted and its state re-synced. You can subscribe via `lenis.scrollingBox.events.on('overflow style changed', callback)`.

Note: the `lenis-stopped` class is no longer applied.

### Reduced motion

By default, Lenis honors the user's [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) setting: when it is set to `reduce`, smoothing is disabled (`lerp` is forced to `1` so the scroll tracks the input device 1:1, ignoring `duration`/`easing`) and programmatic scrolls (`scrollTo`, anchor links) jump instantly to their target. Lenis keeps running so WebGL/DOM synchronization stays intact, and the preference is picked up live without a reload. You can check `lenis.prefersReducedMotion` to adapt your own animations.

You can opt out (not recommended) with:

```js
const lenis = new Lenis({
  respectReducedMotion: false,
})
```

### Anchor links
Anchor links are handled by Lenis out of the box (`anchors` option, default `true`). Set `anchors: false` to opt out, or pass `scrollTo` options to customize the scroll:

```js
new Lenis({
  anchors: {
    offset: 100,
    onComplete: ()=>{
      console.log('scrolled to anchor')
    }
  }
})
```

<br/>

## Limitations

- no support for CSS scroll-snap, you must use ([lenis/snap](https://github.com/darkroomengineering/lenis/tree/main/packages/snap/README.md))
- capped to 60fps on Safari ([source](https://bugs.webkit.org/show_bug.cgi?id=173434)) and 30fps on low power mode
- smooth scroll will stop working over iframe since they don't forward wheel events
- position fixed seems to lag on MacOS Safari pre-M1 ([source](https://github.com/darkroomengineering/lenis/issues/103))
- touch events may behave unexpectedly when `touch.smooth` is enabled on iOS < 16
- nested scroll containers require proper configuration to work correctly

<br/>

## Troubleshooting
- Make sure you use the latest version of [Lenis](https://www.npmjs.com/package/lenis?activeTab=versions)
- Include the recommended CSS
- If using GSAP ScrollTrigger, ensure proper integration (see [GSAP ScrollTrigger setup](#setup) section)
- Test without Lenis to ensure your element/page is scrollable
- If you set `autoRaf: false`, make sure to call `lenis.raf(time)` in your animation loop

<br/>

## Tutorials

- [Infinite Scrolling with Lenis](https://tympanus.net/Development/ScrollAnimationsGrid/) by [Matt Rothenberg](https://mattrothenberg.com/)
- [Building Smooth Scroll in 2025 with Lenis](https://www.edoardolunardi.dev/blog/building-smooth-scroll-in-2025-with-lenis) by [Edoardo Lunardi](https://www.edoardolunardi.dev/)

<br/>

## Plugins

- [r3f-scroll-rig](https://github.com/14islands/r3f-scroll-rig) by [14islands](https://14islands.com/)
- [locomotive-scroll](https://github.com/locomotivemtl/locomotive-scroll) by [Locomotive](https://locomotive.ca/)

<br/>

## License

MIT © [darkroom.engineering](https://github.com/darkroomengineering)
