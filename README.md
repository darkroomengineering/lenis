[![LENIS](https://assets.studiofreight.com/lenis/header.png)](https://github.com/studio-freight/lenis)

## Introduction

🚧 Still in WIP, API might change with new releases 🚧

This is our take on smooth scroll, lightweight, hard working, smooth as butter scroll. See [Demo](https://lenis.studiofreight.com/)

<br>

## Features

- Performant
- Lightweight [(~2Kb gzipped)](https://bundlejs.com/?q=%40studio-freight%2Flenis)
- Run scroll in main thread
- Accessibility (CMD+F page search, Tab and arrow navigation, keep scroll position on page refresh, etc.)
- External RAF
- SSR proof
- Not opinionated
- Tree-shakeable
- Custom scroll easing/duration

<br>

| Feature                     | [Locomotive-scroll](https://github.com/locomotivemtl/locomotive-scroll) | [GSAP ScrollSmoother](https://greensock.com/scrollsmoother/) | [Lenis](https://github.com/studio-freight/lenis)  |
|-----------------------------|-------------------|---------------------|--------|
| Native scrollbar            | ❌               | ✅                   | ✅      |
| Native scroll inputs        | ❌               | ✅                   | ❌      |
| Normalize scroll experience | ✅                 | ❌                   | ✅      |
| Accessibility               | ❌                 | ❌                   | ✅      |
| CSS Sticky                  | ❌                 | ❌                   | ✅      |
| IntsersectionObserver       | ❌                 | ❌                   | ✅      |
| Open source                 | ✅                 | ❌                   | ✅      |
| Built-in animation system   | ✅                 | ✅                   | ❌      |
| Size (gzip)                 | [12.33KB](https://bundlejs.com/?q=locomotive-scroll)           | [26.08KB](https://bundlejs.com/?q=gsap%2FScrollSmoother&treeshake=%5B%7BScrollSmoother%7D%5D)             | [2.13kb](https://bundlejs.com/?q=%40studio-freight%2Flenis) |

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
  easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)), // https://easings.net/en#easeOutExpo
  direction: 'vertical', // vertical, horizontal
  gestureDirection: 'vertical', // vertical, horizontal, both
  smooth: true,
  smoothTouch: false,
  touchMultiplier: 2,
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
  wrapper: NodeElement, // element that has overflow
  content: NodeElement, // usually wrapper's direct child
  duration: 1.2,
  easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  smoothTouch: false,
  touchMultiplier: 2,
})
```

<br/>

## Methods

- `raf(time)` : must be called every frame for internal function.
- `scrollTo(target, {offset, immediate, duration, easing})` : scroll to a target.
  - `target` : can be `Number`, `NodeElement` or `String` (CSS selector).
  - `offset` : `Number` equivalent to [scroll-padding-top](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-top).
- `on(id, callback)` : execute a function on event.
  - `id` : event to listen.
    - `scroll` : return scroll position.
  - `callback(e)` : function to execute.
- `stop()` : pause the scroll
- `start()` : resume the scroll
- `destroy()` : destroy the instance, remove all events.

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

#### Stop wheel event propagation on elements with overflow ([see this issue](https://github.com/studio-freight/lenis/issues/14))

```html
<div onwheel="event.stopPropagation()">scroll content</div>
```

#### Manually use `lenis.scrollTo('#anchor')` on anchor link click ([see this issue](https://github.com/studio-freight/lenis/issues/19))

```html
<a href="#anchor" onclick="lenis.scrollTo('#anchor')">scroll to anchor</a>
```

<br>

## Lenis in use

- [Wyre](https://www.sendwyre.com/) by [Studio Freight](https://www.studiofreight.com/)
- [Scroll Animation Ideas for Image Grids](https://tympanus.net/Development/ScrollAnimationsGrid/) by [Codrops](https://tympanus.net/codrops)
- [Lunchbox](https://lunchbox.io/) by [Studio Freight](https://www.studiofreight.com/)
- [How to Animate SVG Shapes on Scroll](https://tympanus.net/codrops/2022/06/08/how-to-animate-svg-shapes-on-scroll) by [Codrops](https://tympanus.net/codrops)
- [Easol](https://easol.com/) by [Studio Freight](https://www.studiofreight.com/)
- [Repeat](https://getrepeat.io/) by [Studio Freight](https://www.studiofreight.com/)
- [Dragonfly](https://dragonfly.xyz/) by [Studio Freight](https://www.studiofreight.com/)
- [Yuga Labs](https://yuga.com/) by [Antinomy Studio](https://antinomy.studio/)
- [Quentin Hocde's Portfolio](https://quentinhocde.com) by [Quentin Hocde](https://twitter.com/QuentinHocde)
- [Houses Of](https://housesof.world) by [Félix P.](https://flayks.com/) & [Shelby Kay](https://shelbykay.dev/)
- [Shelby Kay's Portfolio](https://shelbykay.dev) by [Shelby Kay](https://shelbykay.dev/)

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
