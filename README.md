[![LENIS](https://assets.studiofreight.com/lenis/header.png)](https://github.com/studio-freight/lenis)

## Introduction

🚧 Still in WIP, API might change with new releases 🚧

This is our take on smooth scroll, lightweight, hard working, smooth as butter scroll. See [Demo](https://lenis.studiofreight.com/)

<br>

## Features

- Performant
- Lightweight [(~2Kb gzipped)](https://bundle.js.org/?q=@studio-freight/lenis)
- Run scroll in main thread
- Accessibility (CMD+F page search, Tab and arrow navigation, keep scroll position on page refresh, etc.)
- External RAF
- SSR proof

<br>

## Installing

just the usual:

```bash
$ npm i @studio-freight/lenis
```

or replace `npm` with your package manager of choice :)

<br>

## Setup

Basic setup

```js
import Lenis from '@studio-freight/lenis'

const lenis = new Lenis({
  lerp: 0.1,
  smooth: true,
  direction: 'vertical',
})

//get scroll value
lenis.on('scroll', ({ scroll, limit, velocity, direction, progress }) => {
  console.log({ scroll, limit, velocity, direction, progress })
})

function raf() {
  lenis.raf()
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)
```

<br/>

Using custom scroll container
```js
const lenis = new Lenis({
  lerp: 0.1,
  smooth: true,
  direction: 'vertical',
  wrapper: NodeElement, // element that has overflow
  content: NodeElement, // usually wrapper's direct child
})
```

<br/>

## Methods

- `raf()` : must be called every frame for internal function.
- `scrollTo(target, {offset})` : scroll to a target.
  - `target` : can be `Number`, `NodeElement` or `String` (CSS selector).
  - `offset` : (Number) equivalent to [scroll-padding-top](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-top).
- `on(id, callback)` : execute a function on event.
  - `id` : event to listen.
    - `scroll` : return scroll position.
  - `callback({scroll, limit})` : function to execute.
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
html, body{
  width: 100%;
  min-height: 100%;
}
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
