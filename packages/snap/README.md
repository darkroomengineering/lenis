# lenis/snap

## Introduction
lenis/snap brings CSS-scroll-snap-like behavior to [Lenis](https://github.com/darkroomengineering/lenis): `scroll-snap-align` semantics (`start`/`center`/`end`/`none`), CSS `scroll-margin` and `scroll-padding` support, plus JS-only extras (raw points, per-target callbacks and locks, `goTo`/`next`/`previous`). See [Demo](https://lenis.darkroom.engineering/snap)

## Installation

```bash
npm i lenis
```

## Usage

### Basic

```jsx
    import Lenis from 'lenis'
    import Snap from 'lenis/snap'

    const lenis = new Lenis() // autoRaf: true by default

    const snap = new Snap(lenis)

    // add snaps points
    snap.add(500) // snap at 500px
    snap.add(1000) // snap at 1000px
    snap.add(1500) // snap at 1500px

    // or add an element to snap to
    snap.add(document.querySelector('.element'), {
      align: 'center', // 'start', 'center', 'end', 'none'
    })

    snap.add(document.querySelector('.element1'), {
      align: ['start', 'end'], // one snap point per entry: top edge and bottom edge
    })

    // or add elements at once
    snap.add(document.querySelectorAll('.section'), {
      align: 'start',
    })

    // per axis (orientation: 'both')
    snap.add(document.querySelectorAll('.cell'), {
      align: { x: 'start', y: 'center' },
    })
    
    
```

### Slideshow

One snap per flick, viewport-sized cards:

```jsx
    const snap = new Snap(lenis, {
      mode: 'directional', // one snap per flick (direction picks the next card)
      lock: true,          // grab: snap the instant a card is picked, hold until it lands
      distanceThreshold: '100%', // reach the adjacent (viewport-sized) card
    })
```

### CSS interop

Element snap positions honor the CSS `scroll-margin` of each added element (outsets its snap area, read live) and the wrapper's CSS `scroll-padding` (insets the viewport, re-read on `resize()`) — same semantics as native scroll snap. For strictness, CSS `mandatory` ⇒ `distanceThreshold: Infinity`, `proximity` ⇒ the default `'50%'`.

### React

See [lenis/snap/react](./react/README.md): `<ReactLenisSnap {...options} />` attaches a Snap to the nearest `<ReactLenis>` (the page's when placed next to `<ReactLenis root />` — no nesting; `rootContext` makes it the root Snap for the hooks anywhere), `useSnapAdd({ align })` returns a ref callback that registers the element while it's attached, `useSnap({ onComplete })` subscribes to its events.

## Options

- `mode`: `'closest' | 'directional'` (default: `'directional'`). How a gesture maps to a snap target. Both modes measure from the scroll's natural resting position (`targetScroll` — where the in-flight inertia will land, wrapped in infinite mode).
  - `'closest'`: snap to the nearest target within `distanceThreshold` of the resting position.
  - `'directional'`: gesture *direction* picks the halfspace; the snap closest to the resting position whose offset is within `distanceThreshold` wins. For viewport-sized cards, raise `distanceThreshold` to `'100%'` or higher so the adjacent snap is reachable. Pair with `lock: true` for the tightest one-card-per-flick feel.
- `lock`: `boolean` (default: unset). Locked targets grab, like CSS `scroll-snap-stop: always`: the moment one is picked in the gesture's direction of travel, the snap fires immediately — no `debounce` wait — and holds the scroll until it lands (gestures can't interrupt it). `true` makes every target grab; when set (true or false) it overrides any per-element `lock`; leave unset to let each element decide.
- `distanceThreshold`: `string | number | { x?, y? }` (default: `'50%'`). Per-axis "max reach" from the scroll's natural resting position (both modes). Percentages resolve against the viewport (per axis). Pass `Infinity` to disable the gate entirely (always snap to the nearest target).
- `debounce`: `number` (default: 500). Delay after the last gesture before snapping. Touch and mouse-drag gestures only ever trigger a snap on release — never while the finger/pointer is held.
- `lerp`: `number` Lerp value for snapping. (default: lenis lerp). 
- `easing`: `function`. Easing function for snapping. (default: lenis easing).
- `duration`: `number`. Duration for snapping. (default: lenis duration).

`lerp`, `easing` and `duration` can also be set per target via `add(..., options)` — the target's value wins.


## Events

```js
const off = snap.on('start', ({ index }) => {}) // the scroll starts moving toward a target
snap.on('complete', ({ index, x, y }) => {}) // it landed
off() // or snap.off('complete', callback)
```

Callbacks receive the target: `{ index, x?, y?, lock? }`.

## Methods

- `add(point: number | { x?: number, y?: number }, options?)`: Add a snap point. A number anchors the active axis (`{ y }`, or `{ x }` when the parent Lenis is horizontal); an object sets each axis explicitly. Takes the same per-target options as elements: `onSnap`, `lock`, `lerp`, `duration`, `easing`.
- `add(element: HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>, options?: SnapElementOptions)`: Add one or more elements to snap to. `options.align` controls where the element lands: `'start' | 'center' | 'end' | 'none'` on the active axis (vertical unless Lenis is horizontal; both axes when `orientation: 'both'`). A list adds one snap point per entry on the same element (`['start', 'end']` snaps to both edges). `{ x, y }` aligns each axis on its own (`{ x: 'start', y: 'center' }`; an omitted axis is `'none'`). In `orientation: 'both'` a value or list applies to both axes and the x and y lists combine, every x with every y (`['start', 'end']` equals `{ x: ['start', 'end'], y: ['start', 'end'] }`, the four corners). `'none'` skips that axis (like CSS `scroll-snap-align: none`). `options.lock` makes this element grab — snap fires the instant it's picked in the gesture's direction, no debounce wait, and holds the scroll until it lands (overridden by the instance-level `lock`). `options.onSnap` is a per-element callback fired when the scroll lands on its snap point. `options.lerp`, `options.duration` and `options.easing` override the instance-level animation for this element's targets.
- `next()`: Go to the next snap point.
- `previous()`: Go to the previous snap point.
- `goTo(index: number)`: Go to a specific snap point.
- `start()`: Start the snap.
- `stop()`: Stop the snap.
- `resize()`: Force recalculate the snap points.
- `on(event, callback)`: Subscribe to `'start'` / `'complete'` (see [Events](#events)). Returns an unsubscribe function.
- `off(event, callback)`: Unsubscribe.

### `align` scenarios

Snap points one element contributes, per Lenis `orientation`. `start` / `end` align the element's edge with the snapport's (honoring CSS `scroll-margin` / `scroll-padding`).

| `align` | `'vertical'` (default) | `'horizontal'` | `'both'` |
|---|---|---|---|
| `'start'` (default) | top | left | top-left |
| `'center'` | center | center | center |
| `['start', 'end']` | top, bottom | left, right | 4 corners |
| `['start', 'center', 'end']` | top, center, bottom | left, center, right | 9 (3 × 3) |
| `{ x: 'start', y: 'end' }` | bottom | left | bottom-left |
| `{ x: 'start' }` | none (y omitted ⇒ `'none'`) | left | left, y untouched |
| `{ x: ['start', 'end'], y: 'center' }` | center | left, right | left-center, right-center |
| `'none'` | none | none | none |

