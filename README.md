[![LENIS](https://assets.darkroom.engineering/lenis/header.png)](https://github.com/darkroomengineering/lenis)

[![npm](https://img.shields.io/npm/v/lenis?colorA=000000&colorB=ff98a2
)](https://www.npmjs.com/package/lenis)
[![downloads](https://img.shields.io/npm/dm/lenis?colorA=000000&colorB=ff98a2
)](https://www.npmjs.com/package/lenis)
[![size](https://img.shields.io/bundlephobia/minzip/lenis?label=size&colorA=000000&colorB=ff98a2)](https://bundlephobia.com/package/lenis)

## Introduction

Lenis is a lightweight, robust, and performant smooth scroll library. It's designed by [@darkroom.engineering](https://twitter.com/darkroomdevs) to be simple to use and easy to integrate into your projects. It's built with performance in mind and is optimized for modern browsers. It's perfect for creating smooth scrolling experiences on your website such as webgl scroll synching, parallax effects and much more. See [ Demo](https://lenis.darkroom.engineering/) and [Showcase](#lenis-in-use).

<br/>

## Sponsorship

If you like Lenis, please consider [sponsoring us](https://github.com/sponsors/darkroomengineering). Your support helps us maintain the project and continue to improve it.

<br>

## Packages

- [lenis](https://github.com/darkroomengineering/lenis/blob/main/README.md)
- [lenis/react](https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md)
- [lenis/snap](https://github.com/darkroomengineering/lenis/tree/main/packages/snap/README.md)


<br>

## Installation

### JavaScript

using a package manager:

```bash
npm i lenis
```
```js
import Lenis from 'lenis'
```

<br/>

using scripts:

```html
<script src="https://unpkg.com/lenis@1.1.14/dist/lenis.min.js"></script> 
```


<br>

## Setup

### Basic:

```js
// Initialize Lenis
const lenis = new Lenis();

// Listen for the scroll event and log the event data
lenis.on('scroll', (e) => {
  console.log(e);
});

// Use requestAnimationFrame to continuously update the scroll
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

```

#### Recommended CSS:

```css
html.lenis, html.lenis body {
  height: auto;
}

.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}

.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}

.lenis.lenis-stopped {
  overflow: hidden;
}

.lenis.lenis-smooth iframe {
  pointer-events: none;
}
```

or link the CSS file:

```html
<link rel="stylesheet" href="https://unpkg.com/lenis@1.1.14/dist/lenis.css">
```

or import it:

```js
import 'lenis/dist/lenis.css'
```

### GSAP ScrollTrigger:
```js
// Initialize a new Lenis instance for smooth scrolling
const lenis = new Lenis();

// Listen for the 'scroll' event and log the event data to the console
lenis.on('scroll', (e) => {
  console.log(e);
});

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

### React:
See documentation for [lenis/react](https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md).




<br/>


## Instance settings

| Option                   | Type                  | Default                                            | Description                                                                                                                                                                                                                                                                      |
|--------------------------|-----------------------|----------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `wrapper`                | `HTMLElement, Window` | `window`                                           | The element that will be used as the scroll container                                                                                                                                                                                                                            |
| `content`                | `HTMLElement`         | `document.documentElement`                         | The element that contains the content that will be scrolled, usually `wrapper`'s direct child                                                                                                                                                                                    |
| `eventsTarget`           | `HTMLElement, Window` | `wrapper`                                          | The element that will listen to `wheel` and `touch` events                                                                                                                                                                                                                       |
| `smoothWheel`            | `boolean`             | `true`                                             | Smooth the scroll initiated by `wheel` events                                                                                                                                                                                                                                    |
| `lerp`                   | `number`              | `0.1`                                              | Linear interpolation (lerp) intensity (between 0 and 1)                                                                                                                                                                                                                          |
| `duration`               | `number`              | `1.2`                                              | The duration of scroll animation (in seconds). Useless if lerp defined                                                                                                                                                                                                           |
| `easing`                 | `function`            | `(t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))` | The easing function to use for the scroll animation, our default is custom but you can pick one from [Easings.net](https://easings.net/en). Useless if lerp defined                                                                                                              |
| `orientation`            | `string`              | `vertical`                                         | The orientation of the scrolling. Can be `vertical` or `horizontal`                                                                                                                                                                                                              |
| `gestureOrientation`     | `string`              | `vertical`                                         | The orientation of the gestures. Can be `vertical`, `horizontal` or `both`                                                                                                                                                                                                       |
| `syncTouch`              | `boolean`             | `false`                                            | Mimic touch device scroll while allowing scroll sync (can be unstable on iOS<16)                                                                                                                                                                                                 |
| `syncTouchLerp`          | `number`              | `0.075`                                            | Lerp applied during `syncTouch` inertia                                                                                                                                                                                                                                          |
| `touchInertiaMultiplier` | `number`              | `35`                                               | Manage the strength of syncTouch inertia                                                                                                                                                                                                                                         |
| `wheelMultiplier`        | `number`              | `1`                                                | The multiplier to use for mouse wheel events                                                                                                                                                                                                                                     |
| `touchMultiplier`        | `number`              | `1`                                                | The multiplier to use for touch events                                                                                                                                                                                                                                           |
| `infinite`               | `boolean`             | `false`                                            | Enable infinite scrolling! `syncTouch: true` is required on touch devices. ([See example](https://codepen.io/ClementRoche/pen/OJqBLod))                                                                                                                                          |
| `autoResize`             | `boolean`             | `true`                                             | Resize instance automatically       based on `ResizeObserver`. If `false` you must resize manually using `.resize()`                                                                                                                                                             |
| `prevent`                | `function`            | `undefined`                                        | Manually prevent scroll to be smoothed based on elements traversed by events. If `true` is returned, it will prevent the scroll to be smoothed. Example: `(node) =>  node.classList.contains('cookie-modal')`                                                                    |
| `virtualScroll`          | `function`            | `undefined`                                        | Manually modify the events before they get consumed. If `false` is returned, the scroll will not be smoothed. Examples: `(e) => { e.deltaY /= 2 }` (to slow down vertical scroll) or `({ event }) => !event.shiftKey` (to prevent scroll to be smoothed if shift key is pressed) |

<br/>

<!-- `target`: goal to reach
- `number`: value to scroll in pixels
- `string`: CSS selector or keyword (`top`, `left`, `start`, `bottom`, `right`, `end`)
- `HTMLElement`: DOM element

<br/>

`options`:
- `offset`(`number`): equivalent to [`scroll-padding-top`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-top)
- `lerp`(`number`): animation lerp intensity
- `duration`(`number`): animation duration (in seconds)
- `easing`(`function`): animation easing
- `immediate`(`boolean`): ignore duration, easing and lerp
- `lock`(`boolean`): whether or not to prevent user from scrolling until target reached
- `onComplete`(`function`): called when target is reached -->

## Instance Props

| Property                | Type              | Description                                                                |
|-------------------------|-------------------|----------------------------------------------------------------------------|
| `animatedScroll`        | `number`          | Current scroll value                                                       |
| `dimensions`            | `object`          | Dimensions instance                                                        |
| `direction`             | `number`          | `1`: scrolling up, `-1`: scrolling down                                    |
| `emitter`               | `object`          | Emitter instance                                                           |
| `options`               | `object`          | Instance options                                                           |
| `targetScroll`          | `number`          | Target scroll value                                                        |
| `time`                  | `number`          | Time elapsed since instance creation                                       |
| `actualScroll`          | `number`          | Current scroll value registered by the browser                             |
| `lastVelocity`          | `number`          | last scroll velocity                                                       |
| `velocity`              | `number`          | Current scroll velocity                                                    |
| `isHorizontal` (getter) | `boolean`         | Whether or not the instance is horizontal                                  |
| `isScrolling` (getter)  | `boolean, string` | Whether or not the scroll is being animated, `smooth`, `native` or `false` |
| `isStopped` (getter)    | `boolean`         | Whether or not the user should be able to scroll                           |
| `limit` (getter)        | `number`          | Maximum scroll value                                                       |
| `progress` (getter)     | `number`          | Scroll progress from `0` to `1`                                            |
| `rootElement` (getter)  | `HTMLElement`     | Element on which Lenis is instanced                                        |
| `scroll` (getter)       | `number`          | Current scroll value (handles infinite scroll if activated)                |
| `className` (getter)    | `string`          | `rootElement` className                                                    |

<br/>

## Instance Methods

| Method                      | Description                                                                     | Arguments                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
|-----------------------------|---------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `raf(time)`                 | Must be called every frame for internal usage.                                  | `time`: in ms                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `scrollTo(target, options)` | Scroll to target.                                                               | `target`: goal to reach<ul><li>`number`: value to scroll in pixels</li><li>`string`: CSS selector or keyword (`top`, `left`, `start`, `bottom`, `target`): goal to reach<ul><li>`number`: value to scroll in pixels</li><li>`string`: CSS selector or keyword (`top`, `left`, `start`, `bottom`, `right`, `end`)</li><li>`HTMLElement`: DOM element</li></ul>`options`<ul><li>`offset`(`number`): equivalent to [`scroll-padding-top`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-top)</li><li>`lerp`(`number`): animation lerp intensity</li><li>`duration`(`number`): animation duration (in seconds)</li><li>`easing`(`function`): animation easing</li><li>`immediate`(`boolean`): ignore duration, easing and lerp</li><li>`lock`(`boolean`): whether or not to prevent the user from scrolling until the target is reached</li><li>`force`(`boolean`): reach target even if instance is stopped</li><li>`onComplete`(`function`): called when the target is reached</li><li>`userData`(`object`): this object will be forwarded through `scroll` events</li></ul> |
| `on(id, function)`          | `id` can be any of the following [instance events](#instance-events) to listen. |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `stop()`                    | Pauses the scroll                                                               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `start()`                   | Resumes the scroll                                                              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `resize()`                  | Compute internal sizes, it has to be used if `autoResize` option is `false`.    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `destroy()`                 | Destroys the instance and removes all events.                                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |



## Instance Events

| Event            | Callback Arguments        |
|------------------|---------------------------|
| `scroll`         | Lenis instance            |
| `virtual-scroll` | `{deltaX, deltaY, event}` |


<br/>

## Considerations

### Nested scroll

#### Using Javascript

```html
<div id="modal">scrollable content</div>
```

```js
const lenis = new Lenis({
  prevent: (node) => node.id === 'modal',
})
```

#### Using HTML

```html
<div data-lenis-prevent>scrollable content</div>
```

prevent wheel events only

```html
<div data-lenis-prevent-wheel>scrollable content</div>
```

prevent touch events only
```html
<div data-lenis-prevent-touch>scrollable content</div>
```

[See modal example](https://codepen.io/ClementRoche/pen/PoLdjpw)

### Anchor links
```html
<a href="#anchor" onclick="lenis.scrollTo('#anchor')">scroll to anchor</a>
```

<br>

## Limitations

- no support for CSS scroll-snap ([lenis/snap](https://github.com/darkroomengineering/lenis/tree/main/packages/snap/README.md))
- capped to 60fps on Safari ([source](https://bugs.webkit.org/show_bug.cgi?id=173434)) and 30fps on low power mode
- smooth scroll will stop working over iframe since they don't forward wheel events
- position fixed seems to lag on MacOS Safari pre-M1 ([source](https://github.com/darkroomengineering/lenis/issues/103))

<br>

## Tutorials

- [Scroll Animation Ideas for Image Grids](https://tympanus.net/Development/ScrollAnimationsGrid/) by [Codrops](https://tympanus.net/codrops)
- [How to Animate SVG Shapes on Scroll](https://tympanus.net/codrops/2022/06/08/how-to-animate-svg-shapes-on-scroll) by [Codrops](https://tympanus.net/codrops)
- [The BEST smooth scrolling library for your Webflow website! (Lenis)](https://www.youtube.com/watch?v=VtCqTLRRMII) by [Diego Toda de Oliveira](https://www.diegoliv.works/)
- [Easy smooth scroll in @Webflow with Lenis + GSAP ScrollTrigger tutorial](https://www.youtube.com/watch?v=gRKuzQTXq74) by [También Studio](https://www.tambien.studio/)

<br>

## Plugins

- [r3f-scroll-rig](https://github.com/14islands/r3f-scroll-rig) by [14islands](https://14islands.com/)
- [locomotive-scroll](https://github.com/locomotivemtl/locomotive-scroll) by [Locomotive](https://locomotive.ca/)

<br>

## Lenis in use

- [DeSo](https://deso.com) by [Studio Freight](https://www.studiofreight.com/)
- [Sculpting Harmony](https://gehry.getty.edu/) by [Resn](https://resn.co.nz/)
- [Superpower](https://superpower.com/)
- [Daylight Computer](https://daylightcomputer.com/) by [Basement Studio](https://basement.studio/)
- [Lifeworld by Olafur Eliasson](https://lifeworld.wetransfer.com/) by Nicolas Garnier, Simon Riisnæs Dagfinrud, Lumír Španihel, Everton Guilherme, Diana Alcausin, Cristiana Sousa


<br/>

## Authors

This set of hooks is curated and maintained by the darkroom.engineering team:

- Clément Roche ([@clementroche\_](https://twitter.com/clementroche_)) – [darkroom.engineering](https://darkroom.engineering)
- Guido Fier ([@uido15](https://twitter.com/uido15)) – [darkroom.engineering](https://darkroom.engineering)
- Leandro Soengas ([@lsoengas](https://twitter.com/lsoengas)) - [darkroom.engineering](https://darkroom.engineering)
- Fermin Fernandez ([@Fermin_FerBridd](https://twitter.com/Fermin_FerBridd)) - [darkroom.engineering](https://darkroom.engineering)
- Felix Mayr ([@feledori](https://twitter.com/feledori)) - [darkroom.engineering](https://darkroom.engineering)
- Franco Arza ([@arzafran](https://twitter.com/arzafran)) - [darkroom.engineering](https://darkroom.engineering)

<br/>

## License

[The MIT License.](https://opensource.org/licenses/MIT)
