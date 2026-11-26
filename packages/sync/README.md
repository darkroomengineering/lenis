# lenis/sync

## Introduction

lenis/sync is minimal scroll sync: it puts the scroll in the main thread, verbatim. The browser keeps scrolling the page natively, nothing is intercepted, and every frame the visible content is written to the exact same position by JavaScript. That gives DOM and canvas one shared scroll value, painted in the same frame, with the platform's own touch feel. See [Demo](https://lenis.darkroom.engineering/sync).

It exists for one job: scroll-synced sites (WebGL, scroll-linked DOM) where touch has to stay native. It does not smooth. For smooth scrolling, infinite scroll and gesture control, use [Lenis](https://github.com/darkroomengineering/lenis/blob/main/README.md); the two share the same consumer API and can run on the same markup.

## Installation

```bash
npm i lenis
```

## Usage

### Basic

No markup, no CSS. Same words as Lenis: the `wrapper` is the scroll container, the `content` is what's inside it. For the page the wrapper is the window and the content is `body`; `html` carries the content height and the page scrollbar. Sync applies the styles it needs and restores them on `destroy`.

```js
import LenisSync from 'lenis/sync'

const lenis = new LenisSync() // autoRaf: true by default

lenis.on('scroll', ({ scroll, velocity }) => {
  // same frame as the paint: draw your canvas from `scroll`
})
```

### Nested panel

Any `overflow: auto` element can be the wrapper. Pass its single child as the content; sync pins it and adds the scroll range itself.

```html
<div id="panel">        <!-- overflow: auto; any height -->
  <div>…content…</div>  <!-- a single child -->
</div>
```

```js
const panel = document.querySelector('#panel')
const lenis = new LenisSync({ wrapper: panel, content: panel.firstElementChild })
```

Wheel past the panel's end chains to the page, as it would anywhere.

### With Lenis on desktop

Pick the engine by input. Same HTML, same consumer code:

```js
import Lenis from 'lenis'
import LenisSync from 'lenis/sync'

const lenis = matchMedia('(pointer: coarse)').matches
  ? new LenisSync()
  : new Lenis()
```

## How it works

- The wrapper (the window, or a panel) scrolls natively and owns the input and the target. Nothing calls `preventDefault`.
- The content (`body`, or the panel's child) is pinned inside it: `position: sticky; top: 0; overflow: hidden`, one viewport of the wrapper high. Sticky rather than fixed, so the browser's scroll-into-view walk, find-in-page included, still reaches the root.
- The wrapper gets the content's range: `html` receives the content height for the page, a spacer sync appends does it for a panel.
- On every scroll event the content is written to the wrapper's position, in the same frame. `scroll` events fire before the paint, so a listener reads the value that frame paints with.
- A scroll the browser applies to the content itself (anchors, focus, `scrollIntoView`, scroll anchoring) is adopted and the wrapper is brought along.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `wrapper` | `Window \| HTMLElement` | `window` | The native scroll container, as in Lenis: the window, or an `overflow: auto` element. It owns the input |
| `content` | `HTMLElement` | `body` (window only) | What's inside the wrapper: the box sync pins and mirrors. Required for an element wrapper: its single child |
| `autoRaf` | `boolean` | `true` | Run the loop internally; pass `false` and call `lenis.raf()` yourself |
| `dimensions` | `object` | `{ debounce: 0 }` | Same as Lenis (`mode`, `autoResize`, `debounce`). `debounce: 0` keeps `limit` fresh; `autoResize: false` turns off the per-frame extent check |

There is no `lerp`, no `duration`, no `smooth`. sync never animates.

## Properties

| Property | Description |
| --- | --- |
| `scroll` | The content's position, the value the current frame paints with. Past `[0, limit]` during a rubber-band (iOS, Safari): the content is clamped by the browser but a fixed canvas is not bounced, so draw it from `scroll` to follow |
| `targetScroll` | The wrapper's position, equal to `scroll` once the frame's event has run |
| `actualScroll` | The content's position as the browser reports it |
| `velocity` | Delta since the last scroll event; settles to `0` on the first idle frame |
| `direction` | `1`, `-1` or `0` |
| `progress` | `scroll / limit` |
| `limit` | Maximum scroll |
| `rootElement` | The content |

## Methods

| Method | Description |
| --- | --- |
| `scrollTo(target, { offset })` | Jump to a number, `'top'`, `'bottom'`, a selector, an element or `{ y }`. Wrapper and content move together, at once |
| `raf(time)` | Advance one frame, when `autoRaf` is `false` |
| `resize()` | Recompute dimensions and the wrapper's range |
| `on('scroll', callback)` / `off` | Subscribe to scroll updates; returns an unsubscribe function |
| `destroy()` | Remove listeners, restore every style sync applied |

## Limitations

Most critical first.

1. No infinite scroll: nothing can move past the content height. Use Lenis.
2. Body-level CSS can break the page silently. Sync owns `html` and `body` inline, and three site patterns fight it: a flex or grid body whose children can shrink collapses them into the viewport and nothing scrolls; an iOS scroll-lock library that pins `body` with `position: fixed; top: -scrollY` doubles the offset while locked; a site that uses `body` as its own scroller gets rewired to the window. Libraries that lock `html`, Base UI for one, compose fine.
3. A nested panel needs a single child to pass as `content`.
4. `min-height` or margins on `body` from site CSS shorten the range. Reset them.
5. `100dvh` is required for the page: Safari before 15.4 and Chrome before 108 degrade to a plain page with `scroll` stuck at `0`.
6. No gesture-level control: no multipliers, no inertia curves, and snap has to work from the wrapper's `scrollend`.
7. Vertical only, for now.
8. `scroll` reads `0` between construction and the first frame, which matters only with `autoRaf: false`. `scroll-padding` for anchor offsets belongs on `body`, not `html`. Print needs a stylesheet that resets `body`.

## License

MIT
