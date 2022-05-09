<!-- [![LENIS](https://assets.studiofreight.com/lenis/header.png)](https://github.com/studio-freight/lenis) -->

<!-- <p align="center">

<a aria-label="Vercel logo" href="https://vercel.com">

<img src="https://badgen.net/badge/icon/Next?icon=zeit&label&color=black&labelColor=black">

</a>

<br/>

<a aria-label="NPM version" href="https://www.npmjs.com/package/swr">

<img alt="" src="https://badgen.net/npm/v/swr?color=black&labelColor=black">

</a>

<a aria-label="Package size" href="https://bundlephobia.com/result?p=swr">

<img alt="" src="https://badgen.net/bundlephobia/minzip/swr?color=black&labelColor=black">

</a>

<a aria-label="License" href="https://github.com/vercel/swr/blob/main/LICENSE">

<img alt="" src="https://badgen.net/npm/license/swr?color=black&labelColor=black">

</a>

</p> -->

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
```
