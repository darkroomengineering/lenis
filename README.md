[![LENIS](https://assets.studiofreight.com/lenis/header.png)](https://github.com/studio-freight/lenis)

## Introduction

This is our take on smooth scroll

<br>
  
###  Setup

```js
const lenis = new Lenis({
  lerp: 0.1,
  smooth: true,
})

function raf() {
  lenis.raf()
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

```
<br>

### Features

- Keeps scroll position on page refresh
- Accessibility, keeps native features (CMD+F page search, Tab and arrow navigation, etc.)
- External RAF
- Performant
- SSR proof

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
