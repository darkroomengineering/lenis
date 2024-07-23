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

    snap.add(500) // snap at 500px
    snap.add(1000) // snap at 1000px
    snap.add(1500) // snap at 1500px
```

## Options

- `type`: `mandatory` (default) or `proximity`. See [scroll-snap-type](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-type)
- `velocityThreshold`: `number` (default: 1). Below this scroll velocity, it will snap.
- `onSnapStart`: `function`. Callback when snap starts.
- `onSnapComplete`: `function`. Callback when snap completes.
- `lerp`: `number` (default: 0.1). Lerp value for snapping.
- `easing`: `function`. Easing function for snapping.
- `duration`: `number`. Duration for snapping.