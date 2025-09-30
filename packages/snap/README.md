# lenis/snap

## Introduction
lenis/snap provides a partial support for CSS scroll snap with [Lenis](https://github.com/darkroomengineering/lenis), see [Demo](https://lenis.darkroom.engineering/snap)

## Installation

```bash
npm i lenis
```

## Usage

```jsx
    import Lenis from 'lenis'
    import Snap from 'lenis/snap'

    const lenis = new Lenis({})

    function raf(time) {
        lenis.raf(time)
        requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    const snap = new Snap(lenis, {})

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

## Options

- `type`: `mandatory` (default) or `proximity` see [scroll-snap-type](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-type) or `slide`.
- `distanceThreshold`: `string | number` (default: '100%'). The distance threshold from the snap point to the scroll position. Ignored when `type` is `slide`. 
- `debounce`: `number` (default: 500). The debounce time for the snap. Ignored when `type` is `slide`.
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