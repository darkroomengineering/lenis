# lenis/snap/react

## Introduction
lenis/snap/react binds [lenis/snap](../README.md) to [lenis/react](../../react/README.md): `<ReactLenisSnap>` attaches a `Snap` to a `<ReactLenis>` instance and provides it to its children via context, `useLenisSnapAdd` registers elements to snap to, `useLenisSnap` gives any component the instance and its events. Same `rootContext` / `name` system as `<ReactLenis>`.

## Installation

```bash
npm i lenis
```

## Usage

### Page scroll (`rootContext`)

Next to `<ReactLenis root />`, `<ReactLenisSnap />` picks up the page instance — the two sit side by side, no nesting. `rootContext` makes it the root Snap: `useLenisSnap()` / `useLenisSnapAdd()` resolve to it from anywhere in the app.

```jsx
import { ReactLenis } from 'lenis/react'
import { ReactLenisSnap, useLenisSnap, useLenisSnapAdd } from 'lenis/snap/react'

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
  const setSnapRef = useLenisSnapAdd({ align: 'center' })
  return <section ref={setSnapRef} />
}

function Controls() {
  const [active, setActive] = useState(0)
  const snap = useLenisSnap({ onComplete: ({ index }) => setActive(index) })
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
  const sidebar = useLenisSnap('sidebar')
  return <button onClick={() => sidebar?.next()}>next</button>
}

function Card() {
  const setSnapRef = useLenisSnapAdd('sidebar', { align: 'start' })
  return <div ref={setSnapRef} />
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `...options` | [`SnapOptions`](../README.md#options) | `{}` | `mode`, `lock`, `distanceThreshold`, `debounce`, `lerp`, `duration`, `easing` — forwarded to `new Snap(lenis, options)`. The Snap is recreated when they change. |
| `rootContext` | `boolean` | `false` | Use this instance as the root Snap: `useLenisSnap()` / `useLenisSnapAdd()` resolve to it from anywhere in the app (outside this component's subtree). |
| `name` | `string` | — | Registers the instance under a name so it can be reached anywhere via `useLenisSnap(name)` / `useLenisSnapAdd(name, …)`. |
| `children` | `ReactNode` | — | Descendants resolve this instance via context. |

## `useLenisSnap`

Returns the Snap instance and, optionally, subscribes to its [events](../README.md#events).

```jsx
const snap = useLenisSnap()                            // nearest provider, or the global root
const sidebar = useLenisSnap('sidebar')                // a named instance, from anywhere

useLenisSnap({ onStart, onComplete })                  // snap.on('start') / snap.on('complete')
useLenisSnap('sidebar', { onComplete })
```

| Arg | Type | Description |
|-----|------|-------------|
| `name` _(optional, first)_ | `string` | Target a named instance instead of the context/root. |
| `callbacks` | `{ onStart?, onComplete? }` | Called with the target `{ index, x?, y?, lock? }`. Inline closures are fine — they always fire fresh without re-subscribing. |

Returns `undefined` until the provider has mounted.

### Resolution

- **No name** — uses the nearest `<ReactLenisSnap>` (React context), falling back to the `rootContext` instance.
- **With a name** — targets that named instance directly, ignoring context.

## `useLenisSnapAdd`

Hook form of `snap.add(element, options)`. Returns a **ref callback**: the element it's attached to is registered as a snap target, and removed when it detaches. Same resolution as `useLenisSnap`.

```jsx
const setSnapRef = useLenisSnapAdd({ align: 'center' })
const setSnapRef = useLenisSnapAdd('sidebar', { align: ['start', 'none'], lock: true })

<section ref={setSnapRef} />
```

| Arg | Type | Description |
|-----|------|-------------|
| `name` _(optional, first)_ | `string` | Target a named instance instead of the context/root. |
| `options` | [`SnapElementOptions`](../README.md#methods) | `align` (`'start' \| 'center' \| 'end' \| 'none'` or `[xAlign, yAlign]`), `lock`, `onSnap`, `ignoreSticky`, `ignoreTransform`. |

It's a callback ref rather than a `RefObject` on purpose: React calls it on every attach, swap and detach, so a late mount, a conditional element or a changed `align` re-registers correctly. To also keep your own ref, merge them:

```jsx
const setSnapRef = useLenisSnapAdd({ align: 'center' })
const ref = useRef(null)
<section ref={(el) => { ref.current = el; return setSnapRef(el) }} />
```

## License

MIT © [darkroom.engineering](https://github.com/darkroomengineering)
