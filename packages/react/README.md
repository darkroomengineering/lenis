# lenis/react

## Introduction
lenis/react provides a `<ReactLenis>` component that creates a [Lenis](https://github.com/darkroomengineering/lenis) instance and provides it to its children via context. This allows you to use Lenis in your React app without worrying about passing the instance down through props. It also provides a `useLenis` hook that allows you to access the Lenis instance from any component in your app.


## Installation

```bash
npm i lenis
```

## Recommended CSS

Import the Lenis CSS to ensure proper behavior:

```js
import 'lenis/dist/lenis.css'
```

## Usage

### Page scroll (`root`)

Use `root` to make Lenis drive the window/page scroll. No wrapper elements are
rendered, and the instance is globally accessible via `useLenis()`.

```jsx
import { ReactLenis, useLenis } from 'lenis/react'

function App() {
  const lenis = useLenis((lenis) => {
    // called every scroll
    console.log(lenis)
  })

  return (
    <>
      <ReactLenis root />
      { /* content */ }
    </>
  )
}
```

### Scoped container

Without `root`, `<ReactLenis>` renders its own `wrapper`/`content` divs and
scrolls *that* element instead of the page. The instance is available to
descendants via `useLenis()`.

```jsx
<ReactLenis className="h-screen overflow-auto">
  {/* scrolls inside this box */}
</ReactLenis>
```

### Named instances

Give an instance a `name` to reach it from anywhere — outside its subtree,
alongside the page scroll — with `useLenis(name)`.

```jsx
function Layout() {
  return (
    <>
      <ReactLenis root />                 {/* the page */}
      <ReactLenis name="sidebar" className="sidebar">
        {/* sidebar content */}
      </ReactLenis>
    </>
  )
}

// anywhere in the app
function ScrollSidebarToTop() {
  const sidebar = useLenis('sidebar')
  return <button onClick={() => sidebar?.scrollTo(0)}>Top</button>
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | [`LenisOptions`](https://github.com/darkroomengineering/lenis#instance-settings) | `{}` | Options forwarded to the Lenis instance. |
| `root` | `boolean` | `false` | When `true`, Lenis drives the window/page scroll and renders no wrapper elements. When `false`, it scrolls the wrapper/content divs it renders for you. |
| `rootContext` | `boolean` | same as `root` | Registers the instance in the global registry so `useLenis()` can reach it from anywhere (even outside the provider tree). Independent of `root` — set it on a scoped container to expose it globally, or unset it on a `root` to keep it local. |
| `name` | `string` | — | Registers the instance under a name so it can be reached anywhere via `useLenis(name)`. Use it for secondary scrollers (e.g. a sidebar) alongside the page scroll. |
| `className` | `string` | `''` | Class applied to the rendered `wrapper` div (ignored when `root`). |
| `ref` | `Ref<LenisRef>` | — | Exposes `{ wrapper, content, lenis }`. `wrapper`/`content` are `null` when `root`. |

> Any other props (`onClick`, `style`, …) are spread onto the rendered `wrapper` div.

## `useLenis`

Returns the Lenis instance and, optionally, subscribes a callback to its scroll.

```jsx
const lenis = useLenis()              // nearest provider, or the global root
const sidebar = useLenis('sidebar')   // a named instance, from anywhere

useLenis((lenis) => {
  // called every scroll
})
```

### Resolution

- **No name** — uses the nearest `<ReactLenis>` (React context), falling back to
  the global `root` / `rootContext` instance.
- **With a name** — targets that named instance directly, ignoring context.

### Arguments

| Arg | Type | Description |
|-----|------|-------------|
| `name` _(optional, first)_ | `string` | Target a named instance instead of the context/root. |
| `callback` | `(lenis) => void` | Called on every scroll event. Omit to just read the instance. |
| `priority` _(optional)_ | `number` | Order this callback runs in relative to other scroll callbacks (lower runs first). Default `0`. |
| `deps` | `unknown[]` | Re-subscribe the callback when one of these changes (like `useEffect`). |

```jsx
useLenis(cb)
useLenis(cb, [dep])
useLenis(cb, 1, [dep])                // with priority
useLenis('sidebar', cb)
useLenis('sidebar', cb, [dep])
useLenis('sidebar', cb, 1, [dep])     // with priority
```



## Examples

### Custom requestAnimationFrame loop:

```jsx
import { ReactLenis } from 'lenis/react'
import { useEffect, useRef } from 'react'

function App() {
  const lenisRef = useRef()
  
  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time)
    }
  
    const rafId = requestAnimationFrame(update)
  
    return () => cancelAnimationFrame(rafId)
  }, [])
  
  return (
    <ReactLenis root options={{ autoRaf: false }} ref={lenisRef} />
  )
}
```


### GSAP integration

```jsx
import gsap from 'gsap'
import { ReactLenis } from 'lenis/react'
import { useEffect, useRef } from 'react'

function App() {
  const lenisRef = useRef()
  
  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000)
    }
  
    gsap.ticker.add(update)
  
    return () => gsap.ticker.remove(update)
  }, [])
  
  return (
    <ReactLenis root options={{ autoRaf: false }} ref={lenisRef} />
  )
}
```

### Framer Motion integration:
```jsx
import { ReactLenis } from 'lenis/react';
import type { LenisRef } from 'lenis/react';
import { cancelFrame, frame } from 'framer-motion';
import { useEffect, useRef } from 'react';

function App() {
  const lenisRef = useRef<LenisRef>(null)

  useEffect(() => {
    function update(data: { timestamp: number }) {
      const time = data.timestamp
      lenisRef.current?.lenis?.raf(time)
    }

    frame.update(update, true)

    return () => cancelFrame(update)
  }, [])


  return (
    <ReactLenis root options={{ autoRaf: false }} ref={lenisRef} />
  )
}
```

## lenis/react in use

- [@darkroom.engineering/satus](https://github.com/darkroomengineering/satus) Our starter kit.

<br/>

## License

MIT © [darkroom.engineering](https://github.com/darkroomengineering)
