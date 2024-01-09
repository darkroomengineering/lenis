<!-- [![Bibliotheca](https://assets.studiofreight.com/bibliotheca/header.png)](https://github.com/studio-freight/bibliotheca) -->

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

![NPM Version](https://img.shields.io/npm/v/%40studio-freight%2Freact-lenis?colorA=000000&colorB=ff98a2)
![NPM Downloads](https://img.shields.io/npm/dm/%40studio-freight%2Freact-lenis?colorA=000000&colorB=ff98a2)


## Introduction
react-lenis provides a `<ReactLenis>` component that creates a [Lenis](https://github.com/studio-freight/lenis) instance and provides it to its children via context. This allows you to use Lenis in your React app without worrying about passing the instance down through props. It also provides a `useLenis` hook that allows you to access the Lenis instance from any component in your app.


<br/>

## Installation

For npm users:
```
npm i @studio-freight/react-lenis
```

For yarn users:
```
yarn add @studio-freight/react-lenis
```


## Usage

```js
import { ReactLenis, useLenis } from '@studio-freight/react-lenis'

function Layout() {
  const lenis = useLenis(({ scroll }) => {
    // called every scroll
  })

  return (
    <ReactLenis root>
      { /* content */ }
    </ReactLenis>
  )
}
```
<br/>

## Props
- `options`: [Lenis options](https://github.com/studio-freight/lenis#instance-settings).
- `root`: Lenis will be instanciate using `<html>` scroll. Default: `false`.
- `autoRaf`: if `false`, `lenis.raf` needs to be called manually. Default: `true`.
- `rAFpriority`: [Tempus](https://github.com/studio-freight/tempus#readme) execution priority. Default: `0`.

<br/>

## Hooks
Once the Lenis context is set (components mounted inside `<ReactLenis>`) you can use these handy hooks:

`useLenis` is a hook that returns the Lenis instance

The hook takes three argument:
- `callback`: The function to be called whenever a scroll event is emitted
- `deps`: Trigger callback on change
- `priority`: Manage callback execution order

## Examples

GSAP integration

```js
function Component() {
  const lenisRef = useRef()
  
  useEffect(() => {
    function update(time) {
      lenisRef.current.lenis?.raf(time * 1000)
    }
  
    gsap.ticker.add(update)
  
    return () => {
      gsap.ticker.remove(update)
    }
  })
  
  return (
    <ReactLenis ref={lenisRef} autoRaf={false}>
      { /* content */ }
    </ReactLenis>
  )
}
```


<br/>

## @studio-freight/react-lenis in use

- [@studio-freight/compono](https://github.com/studio-freight/compono) Our Next.js/React component library.
- [@studio-freight/satus](https://github.com/studio-freight/satus) Our starter kit.

<br/>

## Authors

This tool is maintained by the Studio Freight Darkroom team:

- Clement Roche ([@clementroche\_](https://twitter.com/clementroche_)) – [Studio Freight](https://studiofreight.com)
- Guido Fier ([@uido15](https://twitter.com/uido15)) – [Studio Freight](https://studiofreight.com)
- Leandro Soengas ([@lsoengas](https://twitter.com/lsoengas)) - [Studio Freight](https://studiofreight.com)
- Franco Arza ([@arzafran](https://twitter.com/arzafran)) - [Studio Freight](https://studiofreight.com)

<br/>

## License

[The MIT License.](https://opensource.org/licenses/MIT)
