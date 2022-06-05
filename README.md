[![LENIS](https://assets.studiofreight.com/lenis/header.png)](https://github.com/studio-freight/lenis)

## Introduction
🚧 Still in WIP, API might change with new releases 🚧

This is our take on smooth scroll, lightweight, hard working, smooth as butter scroll. See [Demo](https://lenis.studiofreight.com/)



<br>

### Installing

just the usual:

```bash
$ npm i @studio-freight/lenis
```

or replace `npm` with your package manager of choice :)

<br>

### Setup

```js
import Lenis from '@studio-freight/lenis'

const lenis = new Lenis({
  lerp: 0.1,
  smooth: true,
})

//get scroll value
lenis.on('scroll', ({ scroll }) => {
  console.log({ scroll })
})

function raf() {
  lenis.raf()
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)
```

<br>

### Features

- Performant
- Lightweight [(~2Kb gzipped)](https://bundle.js.org/?q=@studio-freight/lenis) 
- Run scroll in main thread
- Accessibility (CMD+F page search, Tab and arrow navigation, keep scroll position on page refresh, etc.)
- External RAF
- SSR proof

<br/>

## Lenis in use
- [Wyre](https://www.sendwyre.com/) by [Studio Freight](https://www.studiofreight.com/)
- [Scroll Animation Ideas for Image Grids](https://tympanus.net/Development/ScrollAnimationsGrid/) by [Codrops](https://tympanus.net/codrops)

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
