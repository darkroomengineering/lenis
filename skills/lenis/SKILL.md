---
name: lenis
description: Set up and debug Lenis smooth scroll (vanilla JS, React, Next.js, Vue, Nuxt) from the library's authors, Darkroom Engineering. Covers the recommended CSS, the frame loop, GSAP ScrollTrigger sync, Tempus ordering, WebGL scroll sync, per-frame performance in scroll callbacks, sticky pinning, nested scroll, anchors, snap, and reduced motion. Use when a task mentions Lenis, smooth scroll, `scroll-behavior: smooth`, ScrollTrigger lagging or jittering, scroll-synced WebGL, or a scroll-driven section that stutters.
license: MIT
---

# Lenis

Lenis is a smooth scroll library by Darkroom Engineering. It runs on top of native scroll, so `position: sticky`, anchors, find-in-page, and accessibility keep working. It smooths wheel and trackpad input and exposes one scroll value that animations, GSAP, and WebGL can read every frame.

Source and full option reference: https://github.com/darkroomengineering/lenis

## Why Lenis instead of CSS `scroll-behavior: smooth`

The native property behaves differently across browsers, and you cannot ease it, scrub it, or sync it to timelines. It also only affects programmatic and anchor scrolls, not the wheel. Use Lenis when scroll drives animation or rendering. Plain `scroll-behavior: smooth` is fine for a page that only needs smooth anchor jumps.

## Install

```bash
npm i lenis   # or: bun add lenis / pnpm add lenis / yarn add lenis
```

Use the project's own package manager. One package ships every entry point: `lenis`, `lenis/react`, `lenis/vue`, `lenis/nuxt`, `lenis/snap`.

**Always import the recommended CSS.** Leaving it out is the most common cause of broken behavior. The stylesheet sets `height: auto` on `html` and `body`, clips overflow while Lenis is stopped, contains overscroll on `data-lenis-prevent` elements, disables pointer events on iframes during smooth scroll, and provides the transition that `autoToggle` listens for.

```js
import 'lenis/dist/lenis.css'
```

Without a bundler, load both files from a CDN and pin the version you tested:

```html
<link rel="stylesheet" href="https://unpkg.com/lenis@<version>/dist/lenis.css">
<script src="https://unpkg.com/lenis@<version>/dist/lenis.min.js"></script>
<script>new Lenis({ autoRaf: true })</script>
```

## The frame loop: pick exactly one driver

Lenis only moves when `lenis.raf(time)` runs every frame, with `time` in **milliseconds**. Choose one driver:

| Situation | Driver |
|---|---|
| Nothing else owns the frame loop | `new Lenis({ autoRaf: true })` |
| Your own `requestAnimationFrame` loop | `autoRaf: false`, call `lenis.raf(time)` in it |
| GSAP is on the page | `autoRaf: false`, drive it from `gsap.ticker` (below) |
| Tempus owns the loop | `autoRaf: false`, `Tempus.add(..., { order: -1 })` (below) |

Two drivers at once (for example `autoRaf: true` plus a GSAP ticker call) advance the scroll twice per frame and make it jumpy. `<ReactLenis>` and `<VueLenis>` default to `autoRaf: true`, so pass `options={{ autoRaf: false }}` whenever you drive it yourself.

## Vanilla JS

```js
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

const lenis = new Lenis({ autoRaf: true })

lenis.on('scroll', ({ scroll, velocity, direction, progress }) => {
  // read scroll state here
})
```

A custom loop replaces `autoRaf`:

```js
const lenis = new Lenis()

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)
```

Call `lenis.destroy()` when the page or component that created it goes away.

## React and Next.js (App Router)

`lenis/react` already carries `'use client'`, so a Server Component layout can render `<ReactLenis root />` directly. Put the CSS import in the root layout.

```tsx
// app/layout.tsx
import 'lenis/dist/lenis.css'
import { ReactLenis } from 'lenis/react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReactLenis root />
        {children}
      </body>
    </html>
  )
}
```

- `root` scrolls the `<html>` element and makes the instance reachable from `useLenis` anywhere, even outside the provider tree. Without `root`, `<ReactLenis>` renders a wrapper and content `div` and scrolls that element instead.
- `useLenis(callback?, deps?, priority?)` returns the instance and calls `callback` on every scroll. It is a hook, so the component using it needs `'use client'`.
- Pass options through `options={{ ... }}`. Changing options recreates the instance.

```tsx
'use client'
import { useLenis } from 'lenis/react'

export function BackToTop() {
  const lenis = useLenis()
  return <button type="button" onClick={() => lenis?.scrollTo(0)}>Back to top</button>
}
```

## GSAP ScrollTrigger

ScrollTrigger must update from Lenis's scroll event, and Lenis must advance on GSAP's ticker so both use the same frame.

```js
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis() // autoRaf stays false

lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000) // the GSAP ticker gives seconds, Lenis wants ms
})

gsap.ticker.lagSmoothing(0)
```

`lagSmoothing(0)` stops GSAP from slowing its clock after a long frame. Without it, scrubbed animations drift behind the scroll.

In React, drive the provider from the ticker and sync ScrollTrigger in a client component:

```tsx
'use client'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { type LenisRef, ReactLenis, useLenis } from 'lenis/react'
import { useEffect, useRef } from 'react'

gsap.registerPlugin(ScrollTrigger)

function ScrollTriggerSync() {
  useLenis(ScrollTrigger.update)
  return null
}

export function SmoothScroll() {
  const lenisRef = useRef<LenisRef>(null)

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000)
    }
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)
    return () => gsap.ticker.remove(update)
  }, [])

  return (
    <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
      <ScrollTriggerSync />
    </ReactLenis>
  )
}
```

`ScrollTriggerSync` sits inside the provider so `useLenis` finds the instance. Render `<SmoothScroll />` once, in the root layout.

## Tempus: run Lenis first

When Tempus (https://github.com/darkroomengineering/tempus) owns the frame loop, **run Lenis first, at order -1.** Tempus runs callbacks in ascending `order` within one `requestAnimationFrame`. Lenis moves the document in its callback, so anything that reads `lenis.scroll` to draw (WebGL, GSAP, parallax) must use a higher order. If it runs first, it paints the previous frame's position and WebGL visibly lags the DOM by one frame, a gap equal to the scroll velocity.

```tsx
'use client'
import { type LenisRef, ReactLenis } from 'lenis/react'
import { useRef } from 'react'
import { useTempus } from 'tempus/react'

export function SmoothScroll() {
  const lenisRef = useRef<LenisRef>(null)

  useTempus(
    ({ time }) => {
      lenisRef.current?.lenis?.raf(time)
    },
    { order: -1 }
  )

  return <ReactLenis root options={{ autoRaf: false }} ref={lenisRef} />
}
```

With GSAP as well, hand GSAP's clock to Tempus after Lenis, and keep the ScrollTrigger sync from the previous section:

```tsx
useEffect(() => {
  gsap.ticker.lagSmoothing(0)
  gsap.ticker.remove(gsap.updateRoot) // Tempus advances GSAP instead
  return () => gsap.ticker.add(gsap.updateRoot)
}, [])

useTempus(({ time }) => gsap.updateRoot(time / 1000), { order: 10 })
```

Give every Tempus callback an explicit `order`, and keep the full list in one comment next to the Lenis setup so the next person sees it:

```ts
// Tempus order: Lenis -1, WebGL render 1, scroll followers 2, GSAP 10
```

A pinned section hides a wrong order, because nothing moves relative to the canvas while it is pinned. Test on a free-scrolling section with a fast wheel flick.

## WebGL scroll sync

Read `lenis.scroll` (or `animatedScroll`) inside the render callback that runs after Lenis, not from a `scroll` event listener that sets state.

- **Place WebGL objects from a DOM box.** Size and position a plain element with CSS, measure its rect on resize, and place the object from that rect and `lenis.scroll`. Do not recompute size from section widths or design constants inside the frame loop.
- **Use the same rounding everywhere.** Two scroll-derived values that must cancel out, such as a sticky offset and a WebGL element's position, must use the same rounding and be written on the same event. If one floors `lenis.scroll` and the other rounds it, they disagree by 1px whenever the fraction is 0.5 or more, and pinned WebGL shakes at the end of every smooth scroll. Derive both from `Math.round(lenis.scroll)`, and re-apply on every Lenis `scroll` event rather than only when a progress value changes. To check: `lenis.scrollTo(N, { immediate: true })`, then `N + 0.5`, and compare screenshots. The element must not move.

## Work inside scroll callbacks

`useLenis` callbacks, `lenis.on('scroll')` handlers, and Tempus or GSAP ticker callbacks run every frame. Code that is fine on a fast laptop can stutter on slower machines and 4K displays.

- **No layout reads.** No `getBoundingClientRect`, `offsetHeight`, `clientWidth` or `scrollTop` inside the callback. A read after a style write forces a synchronous layout. Measure on resize (a `ResizeObserver`), cache the result, and derive positions from the cached rect plus the scroll. If a read cannot be avoided, do all reads before any writes in that frame.
- **Animate `transform` and `opacity`.** A CSS custom property written every frame restyles every descendant that uses it. If you need one, round it to the precision the CSS uses, skip the write when the value has not changed, and set it on the smallest element that needs it. Never feed a per-frame value into `top`, `height`, `padding` or `font-size`.
- **Skip hidden work.** Opacity 0 and off-screen elements still cost style writes. Write only while an element is visible, plus one final write to hide it.
- **Pin with `position: sticky`, not JavaScript.** Lenis keeps native scroll, so sticky works and moves in the same frame as the page. A `translateY` that follows the scroll 1:1 can trail by a frame; delete it and let the document move the element. Use `position: sticky; top: 0; height: 100svh`, set how long it holds with the parent's height, and use `overflow: clip` instead of `overflow: hidden` on ancestors, because `hidden` stops sticky from pinning.

## Common problems

| Symptom | Fix |
|---|---|
| Nothing scrolls smoothly | Make sure exactly one driver calls `raf` (or `autoRaf: true`), and that the page scrolls natively without Lenis. |
| Modal, dropdown, or code block will not scroll | `allowNestedScroll: true` (simplest, walks the DOM on each event), or mark the element with `data-lenis-prevent` (cheaper). Variants: `data-lenis-prevent-wheel`, `-touch`, `-vertical`, `-horizontal`. The `prevent: (node) => boolean` option handles elements you cannot mark up. |
| Anchor links jump or do nothing | `anchors: true`. For an 80px fixed header, set `scroll-padding-top: 80px` on `html` (Lenis honors it and `scroll-margin-top`) or pass `anchors: { offset: -80 }`. `offset` is added to the target position, so it must be negative to stop above it. |
| Scroll locks when `overflow: hidden` is set on `<html>` for a modal | `autoToggle: true` with the recommended CSS, or call `lenis.stop()` and `lenis.start()` yourself. |
| Inertia carries over after client-side navigation | `stopInertiaOnNavigate: true`, and `lenis.scrollTo(0, { immediate: true })` on route change if the router does not reset scroll. |
| ScrollTrigger positions are wrong or lag | Follow the GSAP section exactly: `lenis.on('scroll', ScrollTrigger.update)`, ticker `raf(time * 1000)`, `lagSmoothing(0)`, and no second driver. |
| WebGL lags one frame behind the DOM | The renderer runs before Lenis. Put Lenis at Tempus order `-1` and the renderer after it. |
| Pinned WebGL element shakes by 1px when scrolling stops | Two scroll values use different rounding. Derive both from `Math.round(lenis.scroll)` and write them on the same event. |
| Scroll-linked section stutters, with long "Recalculate style" tasks in DevTools | Layout reads or custom property writes in a scroll callback. See "Work inside scroll callbacks". |
| Sticky element does not pin | An ancestor has `overflow: hidden` or `auto`. Use `overflow: clip`. |
| Smooth scroll stops over an iframe | Iframes do not forward wheel events. The recommended CSS disables pointer events on iframes while Lenis is scrolling. |
| CSS `scroll-snap` does not work | Lenis does not support CSS scroll snap. Use `lenis/snap` (`new Snap(lenis)`, then `snap.add(px)` or `snap.addElements(nodes, { align: 'start' })`). |
| Scroll feels less smooth on Safari | Safari caps `requestAnimationFrame` at 60fps, or 30fps in Low Power Mode. That is a browser limit. |

## Options you will reach for

- `lerp` (default `0.1`): smoothing strength from 0 to 1. Lower values feel smoother and slower. Applies only when `duration` is not set.
- `duration` (seconds) and `easing`: time-based animation. Setting either one switches Lenis to it and `lerp` is ignored; a missing half gets a default (`duration: 1` or the built-in easing).
- `wheelMultiplier`, `touchMultiplier`: input speed.
- `orientation` (`'vertical'` or `'horizontal'`) and `gestureOrientation` (`'vertical'`, `'horizontal'`, `'both'`).
- `syncTouch`: smooth touch input as well. Off by default because native touch scrolling already feels right, and it can be unstable on iOS before 16.
- `infinite`: loop the scroll. Needs `syncTouch: true` on touch devices.
- `wrapper` and `content`: scroll an element instead of the window.
- `respectReducedMotion` (default `true`): when the user prefers reduced motion, Lenis stops smoothing and makes `scrollTo` instant, but keeps running so scroll sync still works. Leave it on. Check `lenis.prefersReducedMotion` to tone down your own animations.

`lenis.scrollTo(target, options)` accepts a number, a selector, an element, or `'top'`/`'bottom'`/`'start'`/`'end'`, with `offset`, `duration`, `easing`, `lerp`, `immediate`, `lock`, `force`, and `onComplete`.

## Vue and Nuxt

```js
// main.js
import { createApp } from 'vue'
import LenisVue from 'lenis/vue'
createApp(App).use(LenisVue)

// nuxt.config.ts
export default defineNuxtConfig({ modules: ['lenis/nuxt'] })
```

```vue
<script setup>
import { VueLenis, useLenis } from 'lenis/vue'
useLenis((lenis) => {
  // called on every scroll
})
</script>

<template>
  <VueLenis root />
</template>
```

For GSAP in Vue, pass `:options="{ autoRaf: false }"` and a template ref, then run the same ticker code inside a `watchEffect` that calls `gsap.ticker.remove` on invalidation.

## Before you finish

1. `lenis/dist/lenis.css` is imported once.
2. Exactly one driver calls `lenis.raf`, with milliseconds.
3. GSAP setups have `ScrollTrigger.update` on scroll and `lagSmoothing(0)`.
4. Tempus setups run Lenis at order `-1`, before every consumer of the scroll value, and every callback has an explicit order.
5. Scroll callbacks contain no layout reads, and per-frame writes go to `transform` or `opacity`.
6. Nested scroll areas and modals still scroll.
7. `respectReducedMotion` is left at its default.
