# lenis/snap/react

## Introduction
lenis/snap/react binds [lenis/snap](../README.md) to [lenis/react](../../react/README.md): `<ReactLenisSnap>` attaches a `Snap` to a `<ReactLenis>` instance and provides it to its children via context, `useSnapAdd` registers elements to snap to, `useSnap` gives any component the instance and its events. Same `rootContext` / `name` system as `<ReactLenis>`.

## Installation

```bash
npm i lenis
```

## Usage

### Page scroll (`rootContext`)

Next to `<ReactLenis root />`, `<ReactLenisSnap />` picks up the page instance — the two sit side by side, no nesting. `rootContext` makes it the root Snap: `useSnap()` / `useSnapAdd()` resolve to it from anywhere in the app.

```jsx
import { ReactLenis } from 'lenis/react'
import { ReactLenisSnap, useSnap, useSnapAdd } from 'lenis/snap/react'

function App() {
  return (
    <>
      <ReactLenis root />
      <ReactLenisSnap rootContext mode="directional" lock distanceThreshold="100%" />
      <Slide />
      <Slide />
      <Controls />
    </>
  )
}

function Slide() {
  // registered while attached, removed on detach
  const setSnapRef = useSnapAdd({ align: 'center' })
  return <section ref={setSnapRef} />
}

function Controls() {
  const [active, setActive] = useState(0)
  const snap = useSnap({ onComplete: ({ index }) => setActive(index) })
  return <button onClick={() => snap?.next()}>next ({active})</button>
}
```

### Scoped container

Inside a scoped `<ReactLenis>`, `<ReactLenisSnap>` snaps that container and is available to its descendants via context.

```jsx
<ReactLenis className="h-screen overflow-auto">
  <ReactLenisSnap mode="closest">
    <Slide />
    <Slide />
  </ReactLenisSnap>
</ReactLenis>
```

### Named instances

Give an instance a `name` to reach it from anywhere — outside its subtree.

```jsx
<ReactLenis name="sidebar" className="sidebar">
  <ReactLenisSnap name="sidebar">
    {/* sidebar content */}
  </ReactLenisSnap>
</ReactLenis>

// anywhere in the app
function Next() {
  const sidebar = useSnap('sidebar')
  return <button onClick={() => sidebar?.next()}>next</button>
}

function Card() {
  const setSnapRef = useSnapAdd('sidebar', { align: 'start' })
  return <div ref={setSnapRef} />
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `...options` | [`SnapOptions`](../README.md#options) | `{}` | `mode`, `lock`, `distanceThreshold`, `debounce`, `lerp`, `duration`, `easing` — forwarded to `new Snap(lenis, options)`. The Snap is recreated when they change. |
| `rootContext` | `boolean` | `false` | Use this instance as the root Snap: `useSnap()` / `useSnapAdd()` resolve to it from anywhere in the app (outside this component's subtree). |
| `name` | `string` | — | Registers the instance under a name so it can be reached anywhere via `useSnap(name)` / `useSnapAdd(name, …)`. |
| `children` | `ReactNode` | — | Descendants resolve this instance via context. |

## `useSnap`

Returns the Snap instance and, optionally, subscribes to its [events](../README.md#events).

```jsx
const snap = useSnap()                            // nearest provider, or the global root
const sidebar = useSnap('sidebar')                // a named instance, from anywhere

useSnap({ onStart, onComplete })                  // snap.on('start') / snap.on('complete')
useSnap('sidebar', { onComplete })
```

| Arg | Type | Description |
|-----|------|-------------|
| `name` _(optional, first)_ | `string` | Target a named instance instead of the context/root. |
| `callbacks` | `{ onStart?, onComplete? }` | Called with the target `{ index, x?, y?, lock? }`. Inline closures are fine — they always fire fresh without re-subscribing. |

Returns `undefined` until the provider has mounted.

### Resolution

- **No name** — uses the nearest `<ReactLenisSnap>` (React context), falling back to the `rootContext` instance.
- **With a name** — targets that named instance directly, ignoring context.

## `useSnapAdd`

Hook form of `snap.add(element, options)`. Returns a **ref callback**: the element it's attached to is registered as a snap target, and removed when it detaches. Same resolution as `useSnap`.

```jsx
const setSnapRef = useSnapAdd({ align: 'center' })
const setSnapRef = useSnapAdd('sidebar', { align: { x: 'start' }, lock: true })

<section ref={setSnapRef} />
```

| Arg | Type | Description |
|-----|------|-------------|
| `name` _(optional, first)_ | `string` | Target a named instance instead of the context/root. |
| `options` | [`SnapElementOptions`](../README.md#methods) | `align` (`'start' \| 'center' \| 'end' \| 'none'`, a list — one snap point per entry — or `{ x, y }` per axis), `lock`, `onSnap`, `lerp` / `duration` / `easing` (per-target animation overrides), `ignoreSticky`, `ignoreTransform`. |

It's a callback ref rather than a `RefObject` on purpose: React calls it on every attach, swap and detach, so a late mount, a conditional element or a changed `align` re-registers correctly. To also keep your own ref, merge them:

```jsx
const setSnapRef = useSnapAdd({ align: 'center' })
const ref = useRef(null)
<section ref={(el) => { ref.current = el; return setSnapRef(el) }} />
```

## License

MIT © [darkroom.engineering](https://github.com/darkroomengineering)
