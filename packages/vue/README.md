# lenis/react

## Introduction
lenis/react provides a `<ReactLenis>` component that creates a [Lenis](https://github.com/darkroomengineering/lenis) instance and provides it to its children via context. This allows you to use Lenis in your React app without worrying about passing the instance down through props. It also provides a `useLenis` hook that allows you to access the Lenis instance from any component in your app.


## Installation

```bash
npm i lenis
```

## Usage

### Basic

```jsx
import { ReactLenis, useLenis } from 'lenis/react'

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

### RSC
```jsx
// libs/lenis.js

'use client'

export * from 'lenis/react'
```

```jsx
import { ReactLenis, useLenis } from 'libs/lenis'
```

## Props
- `options`: [Lenis options](https://github.com/darkroomengineering/lenis#instance-settings).
- `root`: Lenis will be instanciate using `<html>` scroll. Default: `false`.
- `autoRaf`: if `false`, `lenis.raf` needs to be called manually. Default: `true`.
- `rafPriority`: [Tempus](https://github.com/studio-freight/tempus#readme) execution priority. Default: `0`.
- `className`: Class name for the wrapper div. Default: `''`.



## Hooks
Once the Lenis context is set (components mounted inside `<ReactLenis>`) you can use these handy hooks:

`useLenis` is a hook that returns the Lenis instance

The hook takes three argument:
- `callback`: The function to be called whenever a scroll event is emitted
- `deps`: Trigger callback on change
- `priority`: Manage callback execution order

## Examples

GSAP integration

```jsx
function Component() {
  const lenisRef = useRef()
  
  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000)
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



## lenis/react in use

- [@darkroom.engineering/satus](https://github.com/darkroomengineering/satus) Our starter kit.

<br/>

## Authors

This tool is maintained by the darkroom.engineering team:

- Clément Roche ([@clementroche\_](https://twitter.com/clementroche_)) – [darkroom.engineering](https://www.darkroom.engineering/)
- Guido Fier ([@uido15](https://twitter.com/uido15)) – [darkroom.engineering](https://www.darkroom.engineering/)
- Leandro Soengas ([@lsoengas](https://twitter.com/lsoengas)) - [darkroom.engineering](https://www.darkroom.engineering/)
- Franco Arza ([@arzafran](https://twitter.com/arzafran)) - [darkroom.engineering](https://www.darkroom.engineering/)

<br/>

## License

[The MIT License.](https://opensource.org/licenses/MIT)
