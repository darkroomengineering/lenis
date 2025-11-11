[![LENIS](https://assets.darkroom.engineering/lenis/banner.gif)](https://github.com/darkroomengineering/lenis)

[![npm](https://img.shields.io/npm/v/lenis?colorA=E30613&colorB=000000
)](https://www.npmjs.com/package/lenis)
[![downloads](https://img.shields.io/npm/dm/lenis?colorA=E30613&colorB=000000
)](https://www.npmjs.com/package/lenis)
[![size](https://img.shields.io/bundlephobia/minzip/lenis?label=size&colorA=E30613&colorB=000000)](https://bundlephobia.com/package/lenis)

## Introduction

Lenis ("smooth" in latin) is a lightweight, robust, and performant smooth scroll library. It's designed by [@darkroom.engineering](https://twitter.com/darkroomdevs) to be simple to use and easy to integrate into your projects. It's built with performance in mind and is optimized for modern browsers. It's perfect for creating smooth scrolling experiences on your website such as WebGL scroll syncing, parallax effects, and much more, see [ Demo](https://lenis.darkroom.engineering/) and [Showcase](#lenis-in-use).

Read our [Manifesto](https://github.com/darkroomengineering/lenis/blob/main/MANIFESTO.md) to learn more about the inspiration behind Lenis.

<br/>

- [Sponsors](#sponsors)
- [Packages](#packages)
- [Installation](#installation)
- [Setup](#setup)
- [Settings](#settings)
- [Properties](#properties)
- [Methods](#methods)
- [Events](#events)
- [Considerations](#considerations)
- [Limitations](#limitations)
- [Troubleshooting](#troubleshooting)
- [Tutorials](#tutorials)
- [Plugins](#plugins)
- [Lenis in Use](#lenis-in-use)
- [License](#license)

<br/>

## Sponsors

If you’ve used Lenis and it made your site feel just a little more alive, consider [sponsoring](https://github.com/sponsors/darkroomengineering).

Your support helps us smooth out the internet one library at a time—and lets us keep building tools that care about the details most folks overlook.

<!-- sponsors -->
<a href="https://syntax.fm"><img src="https://github.com/syntaxfm.png" width="60px" alt="User avatar: Syntax" /></a>
<a href="https://github.com/glauber-sampaio"><img src="https://github.com/glauber-sampaio.png" width="60px" alt="User avatar: Glauber" /></a>
<a href="https://itsoffbrand.com"><img src="https://github.com/itsoffbrand.png" width="60px" alt="User avatar: OFF+BRAND." /></a>
<a href="https://bizar.ro"><img src="https://github.com/bizarro.png" width="60px" alt="User avatar: Luis Bizarro" /></a>
<a href="https://github.com/OHO-Design"><img src="https://github.com/OHO-Design.png" width="60px" alt="User avatar: OHO Design" /></a>
<a href="https://github.com/ae-com"><img src="https://github.com/ae-com.png" width="60px" alt="User avatar: Æ" /></a>
<a href="https://ironvelvet.studio"><img src="https://github.com/ironvelvet.png" width="60px" alt="User avatar: Iron Velvet" /></a>
<a href="https://federic.ooo/"><img src="https://github.com/vallafederico.png" width="60px" alt="User avatar: Federico Valla" /></a>
<a href="https://www.non-linear.studio"><img src="https://github.com/mariosmaselli.png" width="60px" alt="User avatar: Mario Sanchez Maselli" /></a>
<a href="https://github.com/thearkis"><img src="https://github.com/thearkis.png" width="60px" alt="User avatar: ΛRK®" /></a>
<a href="https://github.com/smsunarto"><img src="https://github.com/smsunarto.png" width="60px" alt="User avatar: Scott" /></a>
<a href="https://www.cachet.studio"><img src="https://github.com/cachet-studio.png" width="60px" alt="User avatar: cachet.studio" /></a>
<!-- sponsors -->

<br />
<br />
<a href="https://vercel.com/oss">
  <img alt="Vercel OSS Program" src="https://vercel.com/oss/program-badge.svg" />
</a>

<br />

## Packages

- [lenis](https://github.com/darkroomengineering/lenis/blob/main/README.md)
- [lenis/react](https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md)
- [lenis/vue](https://github.com/darkroomengineering/lenis/tree/main/packages/vue/README.md)
- [lenis/framer](https://lenis.framer.website/)
- [lenis/snap](https://github.com/darkroomengineering/lenis/tree/main/packages/snap/README.md)


<br>

## Installation

Using a package manager:

```bash
npm i lenis
```
```js
import Lenis from 'lenis'
```

<br/>

Using scripts:

```html
<script src="https://unpkg.com/lenis@1.3.15/dist/lenis.min.js"></script> 
```


<br>

## Setup

### Basic:

```js
// Initialize Lenis
const lenis = new Lenis({
  autoRaf: true,
});

// Listen for the scroll event and log the event data
lenis.on('scroll', (e) => {
  console.log(e);
});
```

### Custom raf loop:

```js
// Initialize Lenis
const lenis = new Lenis();

// Use requestAnimationFrame to continuously update the scroll
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);
```

### Recommended CSS:

import stylesheet
```js
import 'lenis/dist/lenis.css'
```

or link the CSS file:

```html
<link rel="stylesheet" href="https://unpkg.com/lenis@1.3.15/dist/lenis.css">
```

or add it manually:

[See lenis.css stylesheet](./packages/core/lenis.css)

### GSAP ScrollTrigger:
```js
// Initialize a new Lenis instance for smooth scrolling
const lenis = new Lenis();

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
[See documentation for lenis/react](https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md).




<br/>


## Settings

| Option                 | Type                       | Default                                            | Description                                                                                                                                                                                                                                                                          |
|------------------------|----------------------------|----------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `wrapper`              | `HTMLElement, Window`      | `window`                                           | The element that will be used as the scroll container.                                                                                                                                                                                                                               |
| `content`              | `HTMLElement`              | `document.documentElement`                         | The element that contains the content that will be scrolled, usually `wrapper`'s direct child.                                                                                                                                                                                       |
| `eventsTarget`         | `HTMLElement, Window`      | `wrapper`                                          | The element that will listen to `wheel` and `touch` events.                                                                                                                                                                                                                          |
| `smoothWheel`          | `boolean`                  | `true`                                             | Smooth the scroll initiated by `wheel` events.                                                                                                                                                                                                                                       |
| `lerp`                 | `number`                   | `0.1`                                              | Linear interpolation (lerp) intensity (between 0 and 1).                                                                                                                                                                                                                             |
| `duration`             | `number`                   | `1.2`                                              | The duration of scroll animation (in seconds). Useless if lerp defined.                                                                                                                                                                                                              |
| `easing`               | `function`                 | `(t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))` | The easing function to use for the scroll animation, our default is custom but you can pick one from [Easings.net](https://easings.net/en). Useless if lerp defined.                                                                                                                 |
| `orientation`          | `string`                   | `vertical`                                         | The orientation of the scrolling. Can be `vertical` or `horizontal`.                                                                                                                                                                                                                 |
| `gestureOrientation`   | `string`                   | `vertical`                                         | The orientation of the gestures. Can be `vertical`, `horizontal` or `both`.                                                                                                                                                                                                          |
| `syncTouch`            | `boolean`                  | `false`                                            | Mimic touch device scroll while allowing scroll sync (can be unstable on iOS<16).                                                                                                                                                                                                    |
| `syncTouchLerp`        | `number`                   | `0.075`                                            | Lerp applied during `syncTouch` inertia.                                                                                                                                                                                                                                             |
| `touchInertiaExponent` | `number`                   | `1.7`                                              | Manage the strength of syncTouch inertia.                                                                                                                                                                                                                                            |
| `wheelMultiplier`      | `number`                   | `1`                                                | The multiplier to use for mouse wheel events.                                                                                                                                                                                                                                        |
| `touchMultiplier`      | `number`                   | `1`                                                | The multiplier to use for touch events.                                                                                                                                                                                                                                              |
| `infinite`             | `boolean`                  | `false`                                            | Enable infinite scrolling! `syncTouch: true` is required on touch devices ([See example](https://codepen.io/ClementRoche/pen/OJqBLod)).                                                                                                                                              |
| `autoResize`           | `boolean`                  | `true`                                             | Resize instance automatically       based on `ResizeObserver`. If `false` you must resize manually using `.resize()`.                                                                                                                                                                |
| `prevent`              | `function`                 | `undefined`                                        | Manually prevent scroll to be smoothed based on elements traversed by events. If `true` is returned, it will prevent the scroll to be smoothed. Example: `(node) =>  node.classList.contains('cookie-modal')`.                                                                       |
| `virtualScroll`        | `function`                 | `undefined`                                        | Manually modify the events before they get consumed. If `false` is returned, the scroll will not be smoothed. Examples: `(e) => { e.deltaY /= 2 }` (to slow down vertical scroll) or `({ event }) => !event.shiftKey` (to prevent scroll to be smoothed if shift key is pressed).    |
| `overscroll`           | `boolean`                  | `true`                                             | Similar to CSS overscroll-behavior (https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior).                                                                                                                                                                           |
| `autoRaf`              | `boolean`                  | `false`                                            | Wether or not to automatically run `requestAnimationFrame` loop.                                                                                                                                                                                                                     |
| `anchors`              | `boolean, ScrollToOptions` | `false`                                            | Scroll to anchor links when clicked. If `true` is passed, it will enable anchor links with default options. If `ScrollToOptions` is passed, it will enable anchor links with the given options.                                                                                      |
| `autoToggle`           | `boolean`                  | `false`                                            | Automatically start or stop the lenis instance based on the wrapper's overflow property, ⚠️ this requires Lenis recommended CSS. Safari > 17.3, Chrome > 116 and Firefox > 128 ([https://caniuse.com/?search=transition-behavior](https://caniuse.com/?search=transition-behavior)). |
| `allowNestedScroll`    | `boolean`                  | `false`                                            | Allow nested scrolls. If `true` is passed, it will allow nested scrolls. If `false` is passed, it will not allow nested scrolls. ⚠️ To be used with caution since this can lead to performance issues, prefer using `prevent` or `data-lenis-prevent` instead.                       |
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

## Properties

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

## Methods

| Method                      | Description                                                                     | Arguments                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
|-----------------------------|---------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `raf(time)`                 | Must be called every frame for internal usage.                                  | `time`: in ms                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `scrollTo(target, options)` | Scroll to target.                                                               | `target`: goal to reach<ul><li>`number`: value to scroll in pixels</li><li>`string`: CSS selector or keyword (`top`, `left`, `start`, `bottom`, `right`, `end`)</li><li>`HTMLElement`: DOM element</li></ul>`options`<ul><li>`offset`(`number`): equivalent to [`scroll-padding-top`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-top)</li><li>`lerp`(`number`): animation lerp intensity</li><li>`duration`(`number`): animation duration (in seconds)</li><li>`easing`(`function`): animation easing</li><li>`immediate`(`boolean`): ignore duration, easing and lerp</li><li>`lock`(`boolean`): whether or not to prevent the user from scrolling until the target is reached</li><li>`force`(`boolean`): reach target even if instance is stopped</li><li>`onComplete`(`function`): called when the target is reached</li><li>`userData`(`object`): this object will be forwarded through `scroll` events</li></ul> |
| `on(id, function)`          | `id` can be any of the following [instance events](#instance-events) to listen. |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `stop()`                    | Pauses the scroll                                                               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `start()`                   | Resumes the scroll                                                              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `resize()`                  | Compute internal sizes, it has to be used if `autoResize` option is `false`.    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `destroy()`                 | Destroys the instance and removes all events.                                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |



## Events

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

[See example](https://codepen.io/ClementRoche/pen/emONGYN)

#### Using HTML

```html
<div data-lenis-prevent>scrollable content</div>
```

[See example](https://codepen.io/ClementRoche/pen/PoLdjpw)

prevent wheel events only

```html
<div data-lenis-prevent-wheel>scrollable content</div>
```

prevent touch events only

```html
<div data-lenis-prevent-touch>scrollable content</div>
```



### Anchor links
By default, Lenis will prevent anchor links, click while scrolling, to fix that you must set `anchors: true`.

```js
new Lenis({
  anchors: true
})
```

You can also use `scrollTo` options.
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

<br>

## Limitations

- no support for CSS scroll-snap, you must use ([lenis/snap](https://github.com/darkroomengineering/lenis/tree/main/packages/snap/README.md))
- capped to 60fps on Safari ([source](https://bugs.webkit.org/show_bug.cgi?id=173434)) and 30fps on low power mode
- smooth scroll will stop working over iframe since they don't forward wheel events
- position fixed seems to lag on MacOS Safari pre-M1 ([source](https://github.com/darkroomengineering/lenis/issues/103))
- touch events may behave unexpectedly when `syncTouch` is enabled on iOS < 16
- nested scroll containers require proper configuration to work correctly

<br>

## Troubleshooting
- Make sure you use the latest version of [Lenis](https://www.npmjs.com/package/lenis?activeTab=versions)
- Include recommended CSS.
- Remove GSAP ScrollTrigger.
- Remove Lenis and be sure that your element/page is scrollable anyway.
- Be sure to use `autoRaf: true` or to manually call `lenis.raf(time)`.

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

## License

MIT © [darkroom.engineering](https://github.com/darkroomengineering)
