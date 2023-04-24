[![LENIS](https://assets.studiofreight.com/lenis/header.png)](https://github.com/studio-freight/lenis)

[![npm version](https://img.shields.io/badge/dynamic/json?color=blue&label=npm&prefix=v&query=version&suffix=%20&url=https%3A%2F%2Fraw.githubusercontent.com%2Fstudio-freight%2Flenis%2Fmain%2Fpackage.json)](https://www.npmjs.com/package/@studio-freight/lenis)

## Introduction

This is our take on smooth scroll, lightweight, hard-working, smooth as butter scroll. See [Demo](https://lenis.studiofreight.com/).

<br>

## Features

- Run scroll in the main thread
- Performant
- Lightweight [(<4Kb gzipped)](https://bundlephobia.com/package/@studio-freight/lenis)
- Keep CSS Sticky and IntersectionObserver
- Accessibility (CMD+F page search, keyboard navigation, keep scroll position on page refresh, etc.)
- External RAF
- SSR proof
- Custom scroll easing and duration

<br>

| Feature                     | [Locomotive-scroll](https://github.com/locomotivemtl/locomotive-scroll) | [GSAP ScrollSmoother](https://greensock.com/scrollsmoother/)                                  | [Lenis](https://github.com/studio-freight/lenis)                            |
|-----------------------------|-------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| Native scrollbar            | ❌                                                                       | ✅                                                                                             | ✅                                                                           |
| Native "scroll" inputs      | ❌                                                                       | ✅                                                                                             | ❌                                                                           |
| Accessibility               | ❌                                                                       | ❌                                                                                             | ✅                                                                           |
| CSS Sticky                  | ❌                                                                       | ❌                                                                                             | ✅                                                                           |
| IntsersectionObserver       | ❌                                                                       | ❌                                                                                             | ✅                                                                           |
| Open source                 | ✅                                                                       | ❌                                                                                             | ✅                                                                           |
| Built-in animation system   | ✅                                                                       | ✅                                                                                             | ❌                                                                           |
| Size (gzip)                 | [12.1KB](https://bundlephobia.com/package/locomotive-scroll)      | [32.11KB](https://bundlejs.com/?q=gsap-trial%2FScrollSmoother%2Cgsap-trial&treeshake=%5B%7BScrollSmoother%7D%5D%2C%5B%7Bgsap%7D%5D&text=%22gsap.registerPlugin%28ScrollSmoother%29%3B%22&config=%7B%22analysis%22%3Aundefined%7D) | [3.6KB](https://bundlephobia.com/package/@studio-freight/lenis) |

<br>

## Installing

using a package manager:

```bash
$ npm i @studio-freight/lenis
```
```js
import Lenis from '@studio-freight/lenis'
```

<br/>

using scripts:

```html
<script src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@1/bundled/lenis.min.js"></script>
```

<br>

## Setup

Basic setup:

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

<br/>


## Instance settings

| Option               | Type                 | Default                                            | Description                                                                                                                                                         |
|----------------------|----------------------|----------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `wrapper`            | `HTMLElement, Window` | `window`                                           | The element that will be used as the scroll container                                                                                                               |
| `content`            | `HTMLElement`        | `document.documentElement`                         | The element that contains the content that will be scrolled, usually `wrapper`'s direct child                                                                       |
| `wheelEventsTarget`  | `HTMLElement, Window` | `wrapper`                       | The element that will listen to `wheel` events |
| `lerp`               | `number`             | `0.1`                                              | Linear interpolation (lerp) intensity (between 0 and 1)                                                                                                             |
| `duration`           | `number`             | `1.2`                                              | The duration of scroll animation (in seconds). Useless if lerp defined                                                                                              |
| `easing`             | `function`           | `(t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))` | The easing function to use for the scroll animation, our default is custom but you can pick one from [Easings.net](https://easings.net/en). Useless if lerp defined |
| `orientation`        | `string`             | `vertical`                                         | The orientation of the scrolling. Can be `vertical` or `horizontal`                                                                                                 |
| `gestureOrientation` | `string`             | `vertical`                                         | The orientation of the gestures. Can be `vertical`, `horizontal` or `both`                                                                                          |
| `smoothWheel`        | `boolean`            | `true`                                             | Whether or not to enable smooth scrolling for mouse wheel events                                                                                                    |
| `smoothTouch`        | `boolean`            | `false`                                            | Whether or not to enable smooth scrolling for touch events. Note: We have disabled it by default because touch devices' native smoothness is impossible to mimic    |
| `wheelMultiplier`    | `number`             | `1`                                                | The multiplier to use for mouse wheel events                                                                                                                        |
| `touchMultiplier`    | `number`             | `2`                                                | The multiplier to use for touch events                                                                                                                              |
| `normalizeWheel`     | `boolean`            | `false`                                             | Normalize wheel inputs across browsers                                                                                                                              |
| `infinite`           | `boolean`            | `false`                                            | Enable infinite scrolling!                                                                                                                                          |

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

## Instance Methods

| Method                      | Description                                                                     | Arguments                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|-----------------------------|---------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `raf(time)`                 | Must be called every frame for internal usage.                                  | `time`: in ms                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `scrollTo(target, options)` | Scroll to target.                                                               | `target`: goal to reach<ul><li>`number`: value to scroll in pixels</li><li>`string`: CSS selector or keyword (`top`, `left`, `start`, `bottom`, `right`, `end`)</li><li>`HTMLElement`: DOM element</li></ul>`options`<ul><li>`offset`(`number`): equivalent to [`scroll-padding-top`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-top)</li><li>`lerp`(`number`): animation lerp intensity</li><li>`duration`(`number`): animation duration (in seconds)</li><li>`easing`(`function`): animation easing</li><li>`immediate`(`boolean`): ignore duration, easing and lerp</li><li>`lock`(`boolean`): whether or not to prevent the user from scrolling until the target is reached</li><li>`force`(`boolean`): reach target even if instance is stopped</li><li>`onComplete`(`function`): called when the target is reached</li></ul> |
| `on(id, function)`          | `id` can be any of the following [instance events](#instance-events) to listen. |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `stop()`                    | Pauses the scroll                                                               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `start()`                   | Resumes the scroll                                                              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `destroy()`                 | Destroys the instance and removes all events.                                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

## Instance Events

| Event    | Callback Arguments |
|----------|--------------------|
| `scroll` | Lenis instance     |

<br/>

## Recommended CSS

```css
html.lenis {
  height: auto;
}

.lenis.lenis-smooth {
  scroll-behavior: auto;
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

#### Make sure `scroll-behavior` is set to `auto` or not set at all

```css
.lenis.lenis-smooth {
  scroll-behavior: auto;
}
```

#### Keep HTML elements default sized, this is necessary for Webflow implementation ([see issue](https://github.com/studio-freight/lenis/issues/10))

```css
html.lenis {
  height: auto;
}
```

#### Use the `data-lenis-prevent` attribute on nested scroll elements. In addition, we advise you to add `overscroll-behavior: contain` on this element

```html
<div data-lenis-prevent>scroll content</div>
```

```css
.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}
```

#### Manually use `lenis.scrollTo('#anchor')` on anchor link click ([see issue](https://github.com/studio-freight/lenis/issues/19))

```html
<a href="#anchor" onclick="lenis.scrollTo('#anchor')">scroll to anchor</a>
```

#### Hide overflow when lenis is stopped
```css
.lenis.lenis-stopped {
  overflow: hidden;
}
```

#### GSAP ScrollTrigger integration
```js
lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time)=>{
  lenis.raf(time * 1000)
})
```

<br>

## Limitations

- no support for CSS scroll-snap
- capped to 60fps on Safari ([source](https://bugs.webkit.org/show_bug.cgi?id=173434))
- smooth scroll will stop working over iframe since they don't forward wheel events
- position fixed seems to lag on MacOS Safari pre-M1 ([source](https://github.com/studio-freight/lenis/issues/103))

<br>

## Tutorials

- [Scroll Animation Ideas for Image Grids](https://tympanus.net/Development/ScrollAnimationsGrid/) by [Codrops](https://tympanus.net/codrops)
- [How to Animate SVG Shapes on Scroll](https://tympanus.net/codrops/2022/06/08/how-to-animate-svg-shapes-on-scroll) by [Codrops](https://tympanus.net/codrops)
- [The BEST smooth scrolling library for your Webflow website! (Lenis)](https://www.youtube.com/watch?v=VtCqTLRRMII) by [Diego Toda de Oliveira](https://www.diegoliv.works/)
- [Easy smooth scroll in @Webflow with Lenis + GSAP ScrollTrigger tutorial](https://www.youtube.com/watch?v=gRKuzQTXq74) by [También Studio](https://www.tambien.studio/)

<br>



## Plugins

- [Loconative-scroll](https://github.com/quentinhocde/loconative-scroll#how-to-switch-from-locomotive-scroll-to-loconative-scroll) by [Quentin Hocde](https://twitter.com/QuentinHocde)
- [react-lenis](https://github.com/studio-freight/react-lenis) by [Studio Freight](https://www.studiofreight.com/)
- [r3f-scroll-rig](https://github.com/14islands/r3f-scroll-rig) by [14islands](https://14islands.com/)
- [Lenis Scroll Snap Plugin](https://github.com/funkhaus/lenis-scroll-snap) by [Funkhaus](https://github.com/funkhaus)

<br>

## Lenis in use

- [Wyre](https://www.sendwyre.com/) by [Studio Freight](https://www.studiofreight.com/)
- [Lunchbox](https://lunchbox.io/) by [Studio Freight](https://www.studiofreight.com/)
- [Easol](https://easol.com/) by [Studio Freight](https://www.studiofreight.com/)
- [Repeat](https://getrepeat.io/) by [Studio Freight](https://www.studiofreight.com/)
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

<br/>

## Authors

This set of hooks is curated and maintained by the Studio Freight Darkroom team:

- Clément Roche ([@clementroche\_](https://twitter.com/clementroche_)) – [Studio Freight](https://studiofreight.com)
- Guido Fier ([@uido15](https://twitter.com/uido15)) – [Studio Freight](https://studiofreight.com)
- Leandro Soengas ([@lsoengas](https://twitter.com/lsoengas)) - [Studio Freight](https://studiofreight.com)
- Franco Arza ([@arzafran](https://twitter.com/arzafran)) - [Studio Freight](https://studiofreight.com)

<br/>

## License

[The MIT License.](https://opensource.org/licenses/MIT)
