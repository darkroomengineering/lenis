# lenis/snap

## Introduction
lenis/snap provides a partial support for CSS scroll snap with [Lenis](https://github.com/darkroomengineering/lenis), see [Demo](https://lenis.darkroom.engineering/snap)

## Installation

```bash
npm i lenis
```

## Usage

### Basic

```jsx
    import Lenis from 'lenis'
    import Snap from 'lenis/snap'

    const lenis = new Lenis()

    function raf(time) {
        lenis.raf(time)
        requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    const snap = new Snap(lenis)

    // add snaps points
    snap.add(500) // snap at 500px
    snap.add(1000) // snap at 1000px
    snap.add(1500) // snap at 1500px

    // or add an element to snap to
    snap.addElement(document.querySelector('.element'), {
      align: ['start', 'end'], // 'start', 'center', 'end'
    })

    snap.addElement(document.querySelector('.element1'), {
      align: 'center', // 'start', 'center', 'end'
    })

    // or add elements at once
    snap.addElements(document.querySelectorAll('.section'), {
      align: ['start', 'end'], // 'start', 'center', 'end'
    })
    
    
```

### Slideshow

```jsx
    const snap = new Snap(lenis, {
      lock: 'true',
      distanceThreshold: '100%',
      debounce: 0,
    })
```

## Options

- `mode`: `'closest' | 'directional'` (default: `'closest'`). How a gesture maps to a snap target.
  - `'closest'`: predict the post-gesture scroll position and snap to the nearest target within `distanceThreshold` (velocity-aware).
  - `'directional'`: gesture *direction* picks the halfspace; the snap closest to the current scroll position whose offset is within `distanceThreshold` wins (gesture *magnitude* is ignored). For viewport-sized cards, raise `distanceThreshold` to `'100%'` or higher so the adjacent snap is reachable. Pair with `lock: true` and `debounce: 0` for the tightest one-card-per-flick feel.
- `distanceThreshold`: `string | number | [x, y]` (default: `'50%'`). Per-axis "max reach" — applied to the *predicted* position in `'closest'` mode, to the *current* position in `'directional'` mode. Percentages resolve against the viewport (per axis). Pass `Infinity` to disable the gate entirely (in `'closest'` mode this is the former `type: 'mandatory'` behavior).
- `debounce`: `number` (default: 500). The debounce time for the snap.
- `onSnapStart`: `function`. Callback when snap starts.
- `onSnapComplete`: `function`. Callback when snap completes.
- `lerp`: `number` Lerp value for snapping. (default: lenis lerp). 
- `easing`: `function`. Easing function for snapping. (default: lenis easing).
- `duration`: `number`. Duration for snapping. (default: lenis duration).


## Methods

- `add(value: number)`: Add a snap point.
- `addElement(element: HTMLElement, options: SnapElementOptions = {})`: Add an element to snap to.
- `addElements(elements: HTMLElement[], options: SnapElementOptions = {})`: Add elements at once.
- `next()`: Go to the next snap point.
- `previous()`: Go to the previous snap point.
- `goTo(index: number)`: Go to a specific snap point.
- `start()`: Start the snap.
- `stop()`: Stop the snap.
- `resize()`: Force recalculate the snap points.