[![LENIS](https://assets.darkroom.engineering/lenis/header.png)](https://github.com/darkroomengineering/lenis)

[![npm](https://img.shields.io/npm/v/%40studio-freight%2Flenis?colorA=000000&colorB=ff98a2
)](https://www.npmjs.com/package/@studio-freight/lenis)
[![downloads](https://img.shields.io/npm/dm/%40studio-freight%2Flenis?colorA=000000&colorB=ff98a2
)](https://www.npmjs.com/package/@studio-freight/lenis)
[![size](https://img.shields.io/bundlephobia/minzip/@studio-freight/lenis?label=size&colorA=000000&colorB=ff98a2)](https://bundlephobia.com/package/@studio-freight/lenis)

## Introduction

This is our take on smooth scroll, lightweight, hard-working, smooth as butter scroll. See [Demo](https://lenis.darkroom.engineering/).

<br>

## Installation

### JavaScript

using a package manager:

```bash
npm i @studio-freight/lenis
```
```js
import Lenis from '@studio-freight/lenis'
```

<br/>

using scripts:

```html
<script src="https://unpkg.com/@studio-freight/lenis@1.0.42/dist/lenis.min.js"></script> 
```


<br>

## Setup

### Basic:

```js
const lenis = new Lenis()

lenis.on('scroll', (e) => {
  console.log(e)
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)
```

### GSAP ScrollTrigger:
```js
const lenis = new Lenis()

lenis.on('scroll', (e) => {
  console.log(e)
})

lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time)=>{
  lenis.raf(time * 1000)
})

gsap.ticker.lagSmoothing(0)
```

### React:
See documentation for [react-lenis](https://github.com/darkroomengineering/lenis/tree/main/packages/react-lenis).




<br/>


## Instance settings

| Option               | Type                  | Default                                            | Description                                                                                                                                                         |
|----------------------|-----------------------|----------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `wrapper`            | `HTMLElement, Window` | `window`                                           | The element that will be used as the scroll container                                                                                                               |
| `content`            | `HTMLElement`         | `document.documentElement`                         | The element that contains the content that will be scrolled, usually `wrapper`'s direct child                                                                       |
| `eventsTarget`       | `HTMLElement, Window` | `wrapper`                                          | The element that will listen to `wheel` and `touch` events                                                                                                          |
| `lerp`               | `number`              | `0.1`                                              | Linear interpolation (lerp) intensity (between 0 and 1)                                                                                                             |
| `duration`           | `number`              | `1.2`                                              | The duration of scroll animation (in seconds). Useless if lerp defined                                                                                              |
| `easing`             | `function`            | `(t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))` | The easing function to use for the scroll animation, our default is custom but you can pick one from [Easings.net](https://easings.net/en). Useless if lerp defined |
| `orientation`        | `string`              | `vertical`                                         | The orientation of the scrolling. Can be `vertical` or `horizontal`                                                                                                 |
| `gestureOrientation` | `string`              | `vertical`                                         | The orientation of the gestures. Can be `vertical`, `horizontal` or `both`                                                                                          |
| `smoothWheel`        | `boolean`             | `true`                                             | Whether or not to enable smooth scrolling for mouse wheel events                                                                                                    |
| `syncTouch`          | `boolean`             | `false`                                            | Mimic touch device scroll while allowing scroll sync (can be unstable on iOS<16)   
| `syncTouchLerp`          | `number`             | `0.075`                                            | Lerp applied during `syncTouch` inertia                                                                                 |
| `touchInertiaMultiplier`          | `number`             | `35`                                            | Manage the the strength of `syncTouch` inertia                                                                                 |
| `wheelMultiplier`    | `number`              | `1`                                                | The multiplier to use for mouse wheel events                                                                                                                        |
| `touchMultiplier`    | `number`              | `1`                                                | The multiplier to use for touch events                                                                                                                              |
| `normalizeWheel`     | `boolean`             | `false`                                            | Normalize wheel inputs across browsers (not reliable atm)                                                                                                                       |
| `infinite`           | `boolean`             | `false`                                            | Enable infinite scrolling! ([See example](https://codepen.io/ClementRoche/pen/OJqBLod))                                                                                                                                         |
| `autoResize`           | `boolean`             | `true`                                            | Resize instance automatically       based on `ResizeObserver`. If `false` you must resize manually using `.resize()`                                                                                                     |

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

| Property                | Type          | Description                                                 |
|-------------------------|---------------|-------------------------------------------------------------|
| `animatedScroll`        | `number`      | Current scroll value                                        |
| `dimensions`            | `object`      | Dimensions instance                                         |
| `direction`             | `number`      | `1`: scrolling up, `-1`: scrolling down                     |
| `emitter`               | `object`      | Emitter instance                                            |
| `options`               | `object`      | Instance options                                            |
| `targetScroll`          | `number`      | Target scroll value                                         |
| `time`                  | `number`      | Time elapsed since instance creation                        |
| `actualScroll`          | `number`      | Current scroll value registered by the browser              |
| `velocity`              | `number`      | Current scroll velocity                                     |
| `isHorizontal` (getter) | `boolean`     | Whether or not the instance is horizontal                   |
| `isScrolling` (getter)  | `boolean`     | Whether or not the scroll is being animated                 |
| `isSmooth` (getter)     | `boolean`     | Whether or not the scroll is animated                       |
| `isStopped` (getter)    | `boolean`     | Whether or not the user should be able to scroll            |
| `limit` (getter)        | `number`      | Maximum scroll value                                        |
| `progress` (getter)     | `number`      | Scroll progress from `0` to `1`                             |
| `rootElement` (getter)  | `HTMLElement` | Element on which Lenis is instanced                         |
| `scroll` (getter)       | `number`      | Current scroll value (handles infinite scroll if activated) |
| `className` (getter)    | `string`      | `rootElement` className                                     |

<br/>

## Instance Methods

| Method                      | Description                                                                     | Arguments                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|-----------------------------|---------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `raf(time)`                 | Must be called every frame for internal usage.                                  | `time`: in ms                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `scrollTo(target, options)` | Scroll to target.                                                               | `target`: goal to reach<ul><li>`number`: value to scroll in pixels</li><li>`string`: CSS selector or keyword (`top`, `left`, `start`, `bottom`, `right`, `end`)</li><li>`HTMLElement`: DOM element</li></ul>`options`<ul><li>`offset`(`number`): equivalent to [`scroll-padding-top`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-top)</li><li>`lerp`(`number`): animation lerp intensity</li><li>`duration`(`number`): animation duration (in seconds)</li><li>`easing`(`function`): animation easing</li><li>`immediate`(`boolean`): ignore duration, easing and lerp</li><li>`lock`(`boolean`): whether or not to prevent the user from scrolling until the target is reached</li><li>`force`(`boolean`): reach target even if instance is stopped</li><li>`onComplete`(`function`): called when the target is reached</li></ul> |
| `on(id, function)`          | `id` can be any of the following [instance events](#instance-events) to listen. |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `stop()`                    | Pauses the scroll                                                               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `start()`                   | Resumes the scroll                                                              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `resize()`                 | Compute internal sizes, it has to be used if `autoResize` option is `false`.                                  |  
| `destroy()`                 | Destroys the instance and removes all events.                                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         

## Instance Events

| Event    | Callback Arguments |
|----------|--------------------|
| `scroll` | Lenis instance     |

<br/>

## Recommended CSS

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

.lenis.lenis-scrolling iframe {
  pointer-events: none;
}
```

<br/>

## Considerations

### Nested scroll
```html
<div data-lenis-prevent>scroll content</div>

<div data-lenis-prevent-wheel>scroll content</div>

<div data-lenis-prevent-touch>scroll content</div>
```

[See modal example](https://codepen.io/ClementRoche/pen/PoLdjpw)

### Anchor links
```html
<a href="#anchor" onclick="lenis.scrollTo('#anchor')">scroll to anchor</a>
```

<br>

## Limitations

- no support for CSS scroll-snap
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

- [Loconative-scroll](https://github.com/quentinhocde/loconative-scroll#how-to-switch-from-locomotive-scroll-to-loconative-scroll) by [Quentin Hocde](https://twitter.com/QuentinHocde)
- [react-lenis](https://github.com/darkroomengineering/lenis/tree/main/packages/react-lenis) by [darkroom.engineering](https://darkroom.engineering/)
- [r3f-scroll-rig](https://github.com/14islands/r3f-scroll-rig) by [14islands](https://14islands.com/)
- [Lenis Scroll Snap Plugin](https://github.com/funkhaus/lenis-scroll-snap) by [Funkhaus](https://github.com/funkhaus)
- [locomotive-scroll](https://github.com/locomotivemtl/locomotive-scroll) by [Locomotive](https://locomotive.ca/)
- [vue-lenis](https://github.com/zeokku/vue-lenis) by [ZEOKKU](https://zeokku.com/)
- [nuxt-lenis](https://www.npmjs.com/package/nuxt-lenis) by [Milkshake Studio](https://milkshake.studio/)

<br>

## Lenis in use

- [Lunchbox](https://lunchbox.io/) by [Studio Freight](https://www.studiofreight.com/)
- [Easol](https://easol.com/) by [Studio Freight](https://www.studiofreight.com/)
- [Dragonfly](https://dragonfly.xyz/) by [Studio Freight](https://www.studiofreight.com/)
- [Yuga Labs](https://yuga.com/) by [Antinomy Studio](https://antinomy.studio/)
- [Quentin Hocde's Portfolio](https://quentinhocde.com) by [Quentin Hocde](https://twitter.com/QuentinHocde)
- [Houses Of](https://housesof.world) by [Félix P.](https://flayks.com/) & [Shelby Kay](https://shelbykay.dev/)
- [Shelby Kay's Portfolio](https://shelbykay.dev) by [Shelby Kay](https://shelbykay.dev/)
- [Heights Agency Portfolio](https://www.heights.agency/) by [Francesco Michelini](https://www.francescomichelini.com/)
- [Goodship](https://goodship.io) by [Studio Freight](https://www.studiofreight.com/)
- [Flayks' Portfolio](https://flayks.com) by [Félix P.](https://flayks.com/) & [Shelby Kay](https://shelbykay.dev/)
- [Matt Rothenberg's portfolio](https://mattrothenberg.com) by [Matt Rothenberg](https://twitter.com/mattrothenberg)
- [Edoardo Lunardi's portfolio](https://www.edoardolunardi.dev/) by [Edoardo Lunardi](https://www.edoardolunardi.dev/)
- [DeSo](https://deso.com) by [Studio Freight](https://www.studiofreight.com/)
- [Francesco Michelini's portfolio](https://www.francescomichelini.com/projects) by [Francesco Michelini](https://www.francescomichelini.com/)

<br/>

## Authors

This set of hooks is curated and maintained by the darkroom.engineering team:

- Clément Roche ([@clementroche\_](https://twitter.com/clementroche_)) – [darkroom.engineering](https://darkroom.engineering)
- Guido Fier ([@uido15](https://twitter.com/uido15)) – [darkroom.engineering](https://darkroom.engineering)
- Leandro Soengas ([@lsoengas](https://twitter.com/lsoengas)) - [darkroom.engineering](https://darkroom.engineering)
- Franco Arza ([@arzafran](https://twitter.com/arzafran)) - [darkroom.engineering](https://darkroom.engineering)

<br/>

## License

[The MIT License.](https://opensource.org/licenses/MIT)
