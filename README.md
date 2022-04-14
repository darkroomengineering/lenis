
[![LENIS](https://assets.studiofreight.com/lenis/header.png)](https://github.com/studio-freight/lenis)

  

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
```html
<html>
	<body>
		<div id="scroll-wrapper">
			<div id="scroll-content">
				<section data-scroll-section>
				</section>
				<section data-scroll-section>
				</section>
			<div>
		<div>
	</body>
</html>
```

```js
const lenis = new Lenis({
	wrapper: document.querySelector('#scroll-wrapper'),
	content: document.querySelector('#scroll-content'),
	lerp: 0.1,
	smooth: true,
	customScrollbar: true,
})
```

<br>

### Features

- Uses native scroll
- CMD/CTRL + F (page search)
- Tab navigation
- Scroll sections
- GSAP ScrollTrigger compatible
- Custom scrollbar
- External RAF
- Debug mode