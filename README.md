[![LENIS](https://assets.studiofreight.com/lenis/header.png)](https://github.com/studio-freight/lenis)

[![npm version](https://img.shields.io/badge/dynamic/json?color=blue&label=npm&prefix=v&query=version&suffix=%20&url=https%3A%2F%2Fraw.githubusercontent.com%2Fstudio-freight%2Flenis%2Fmain%2Fpackage.json)](https://www.npmjs.com/package/@studio-freight/lenis)

## Introduction

🚧 Still in WIP, API might change with new releases 🚧

This is our take on smooth scroll, lightweight, hard working, smooth as butter scroll. See [Demo](https://lenis.studiofreight.com/)

<br>

## Features

- Performant
- Lightweight [(~2Kb gzipped)](https://bundlejs.com/?q=%40studio-freight%2Flenis)
- Run scroll in main thread
- Accessibility (CMD+F page search, keyboard navigation, keep scroll position on page refresh, etc.)
- External RAF
- SSR proof
- Not opinionated
- Tree-shakeable
- Custom scroll easing/duration

<br>

| Feature                     | [Locomotive-scroll](https://github.com/locomotivemtl/locomotive-scroll) | [GSAP ScrollSmoother](https://greensock.com/scrollsmoother/)                                  | [Lenis](https://github.com/studio-freight/lenis)            |
| --------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Native scrollbar            | ❌                                                                      | ✅                                                                                            | ✅                                                          |
| Native scroll inputs        | ❌                                                                      | ✅                                                                                            | ❌                                                          |
| Normalize scroll experience | ✅                                                                      | ❌                                                                                            | ✅                                                          |
| Accessibility               | ❌                                                                      | ❌                                                                                            | ✅                                                          |
| CSS Sticky                  | ❌                                                                      | ❌                                                                                            | ✅                                                          |
| IntsersectionObserver       | ❌                                                                      | ❌                                                                                            | ✅                                                          |
| Open source                 | ✅                                                                      | ❌                                                                                            | ✅                                                          |
| Built-in animation system   | ✅                                                                      | ✅                                                                                            | ❌                                                          |
| Size (gzip)                 | [12.33KB](https://bundlejs.com/?q=locomotive-scroll)                    | [26.08KB](https://bundlejs.com/?q=gsap%2FScrollSmoother&treeshake=%5B%7BScrollSmoother%7D%5D) | [2.13kb](https://bundlejs.com/?q=%40studio-freight%2Flenis) |

<br>

## Installing

using package manager:

```bash
$ npm i @studio-freight/lenis
```

<br/>

using scripts:

```html
<script src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@latest/bundled/lenis.js"></script>
```

<br>

## Setup

Basic setup

```js
import Lenis from '@studio-freight/lenis'

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
  direction: 'vertical', // vertical, horizontal
  gestureDirection: 'vertical', // vertical, horizontal, both
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
})

//get scroll value
lenis.on('scroll', ({ scroll, limit, velocity, direction, progress }) => {
  console.log({ scroll, limit, velocity, direction, progress })
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)
```

<br/>

Using custom scroll container

```js
const lenis = new Lenis({
  wrapper: NodeElement, // element which has overflow
  content: NodeElement, // usually wrapper's direct child
})
```

<br/>

## Instance settings

| Option             | Type          | Default                                            | Description                                                                                                                                                     |
| ------------------ | ------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `wrapper`          | `NodeElement` | `window`                                           | Default element which has overflow                                                                                                                              |
| `content`          | `NodeElement` | `document`                                         | `wrapper`'s direct child                                                                                                                                        |
| `duration`         | `number`      | `1.2`                                              | Specifies the duration of the animation                                                                                                                         |
| `easing`           | `function`    | `(t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))` | Specifies the rate of change of a specific value, our default is custom but you can pick one from [Easings.net](https://easings.net/en)                         |
| `direction`        | `string`      | `vertical`                                         | `vertical` or `horizontal` scrolling.                                                                                                                           |
| `gestureDirection` | `string`      | `vertical`                                         | `vertical`, `horizontal` or `both`.                                                                                                                             |
| `smooth`           | `boolean`     | `true`                                             | Enable or disable 'smoothness'                                                                                                                                  |
| `mouseMultiplier`  | `number`      | `1`                                                | This value is passed directly to [Virtual Scroll](https://github.com/ayamflow/virtual-scroll)                                                                   |
| `smoothTouch`      | `boolean`     | `false`                                            | Enable or disable 'smoothness' while scrolling using touch. Note: We have disabled it by default because touch devices native smoothness is impossible to mimic |
| `touchMultiplier`  | `number`      | `string`                                           | This value is passed directly to [Virtual Scroll](https://github.com/ayamflow/virtual-scroll)                                                                   |
| `infinite`         | `boolean`     | `false`                                            | Enable infinite scrolling!                                                                                                                                      |

<br/>

## Instance Methods

| Method                                                   | Description                                                   | Arguments                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `raf(time)`                                              | Must be called every frame for internal usage.                |                                                                                                                                                                                                                                                                                                                                   |
| `scrollTo(target,{offset, duration, easing, immediate})` | Scroll to a target.                                           | `target`: can be `Number`, `NodeElement` or `String` (CSS selector).<br> `offset` : `Number` equivalent to [scroll-padding-top](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-top).<br>`duration` : `Number` scroll duration in seconds.<br>`easing` : `Function`.<br>`immediate` : ignore duration and easing. |
| `on(id,callback({scroll,limit,velocity,direction}))`     | `id` can be any of the following [instance events](#instance-events) to listen. |                                                                                                                                                                                                                                                                                                                                   |
| `stop()`                                                 | To pause the scroll                                           |                                                                                                                                                                                                                                                                                                                                   |
| `start()`                                                | To resume the scroll                                          |                                                                                                                                                                                                                                                                                                                                   |
| `destroy()`                                              | To destroy the instance and remove all events.                |                                                                                                                                                                                                                                                                                                                                   |

## Instance Events

| Event    | Callback Arguments                                                                                                                                   |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scroll` | `scroll`: returns scroll position. <br>`limit`: returns scroll limit. <br>`velocity`: returns scroll velocity. <br>`direction`: returns `1` or `-1`. |

<br/>

## Considerations

### Things to consider if you want to add Lenis to your codebase will be listed here.

#### Make sure `scroll-behavior` is set to initial or not set at all (thanks [@thagxt](https://github.com/thagxt))

```css
html {
  scroll-behavior: initial;
}
```

#### Keep html and body elements default sized ([see this issue](https://github.com/studio-freight/lenis/issues/10))

```css
html,
body {
  width: 100%;
  min-height: 100%;
}
```

#### Use `data-lenis-prevent` attribute on nested scroll elements. In addition, we advice you to add `overscroll-behavior: contain` on this element.

```html
<div data-lenis-prevent>scroll content</div>
```

#### Manually use `lenis.scrollTo('#anchor')` on anchor link click ([see this issue](https://github.com/studio-freight/lenis/issues/19))

```html
<a href="#anchor" onclick="lenis.scrollTo('#anchor')">scroll to anchor</a>
```

<br>

## Limitations

- no support of CSS scroll-snap
- erase browser previous and next trackpad gestures
- can only run 60fps maximum on Safari ([source](https://bugs.webkit.org/show_bug.cgi?id=173434))

<br>

## Tutorials

- [Scroll Animation Ideas for Image Grids](https://tympanus.net/Development/ScrollAnimationsGrid/) by [Codrops](https://tympanus.net/codrops)
- [How to Animate SVG Shapes on Scroll](https://tympanus.net/codrops/2022/06/08/how-to-animate-svg-shapes-on-scroll) by [Codrops](https://tympanus.net/codrops)
- [The BEST smooth scrolling library for your Webflow website! (Lenis)](https://www.youtube.com/watch?v=VtCqTLRRMII) by [Diego Toda de Oliveira](https://www.diegoliv.works/)
- [Easy smooth scroll in @Webflow with Lenis + GSAP ScrollTrigger tutorial](https://www.youtube.com/watch?v=gRKuzQTXq74) by [También Studio](https://www.tambien.studio/)

<br>

## Plugins

- [Loconative-scroll](https://github.com/quentinhocde/loconative-scroll#how-to-switch-from-locomotive-scroll-to-loconative-scroll) by [Quentin Hocde](https://twitter.com/QuentinHocde)

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

<br/>

## Authors

This set of hooks is curated and maintained by the Studio Freight Darkroom team:

- Clement Roche ([@clementroche\_](https://twitter.com/clementroche_)) – [Studio Freight](https://studiofreight.com)
- Guido Fier ([@uido15](https://twitter.com/uido15)) – [Studio Freight](https://studiofreight.com)
- Leandro Soengas ([@lsoengas](https://twitter.com/lsoengas)) - [Studio Freight](https://studiofreight.com)
- Franco Arza ([@arzafran](https://twitter.com/arzafran)) - [Studio Freight](https://studiofreight.com)

<br/>

## License

[The MIT License.](https://opensource.org/licenses/MIT)
