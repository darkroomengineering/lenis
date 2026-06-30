# Multi-axis scrolling — implementation plan

> Companion to [`V2-ROADMAP.md`](./V2-ROADMAP.md) → "Multi-axis scrolling". This file is the working plan; the roadmap just links here.

## Goal & guiding principle

Allow simultaneous horizontal + vertical scrolling (2D canvas, maps, spreadsheets, layouts that scroll both ways) **without complexifying the API for the 99% who only scroll one axis**.

- 2D is **opt-in** via a single option value: `new Lenis({ orientation: 'both' })`.
- When `orientation: 'both'`, `gestureOrientation` has no effect — the `y` axis reacts to vertical gestures, the `x` axis to horizontal gestures.
- Single-axis behaviour and API stay **100% unchanged**. Multi-axis is purely additive: you *gain* `lenis.x` / `lenis.y`.
- **All config is global, never per-axis.** `wheel`, `touch`, `lerp`, `duration`, `easing`, `dimensions`, `infinite`, `overscroll` — configured once on `Lenis`, shared by both axes. The `Axis` class does **not** take its own options bag and there is no per-axis override mechanism. (If one is ever genuinely needed it'd be a future `touch.ios`-style escape hatch, not part of this work.)

## Target API

```ts
// DEFAULT — single axis, unchanged. Base users never see any of this.
const lenis = new Lenis()
lenis.on('scroll', (lenis) => { lenis.scroll; lenis.progress; lenis.velocity; lenis.direction })
lenis.scrollTo(500)
lenis.scrollTo('#section', { offset: -100 })

// OPT-IN 2D — one new option value.
const lenis = new Lenis({ orientation: 'both' })

lenis.x // Axis  — reacts to horizontal gestures
lenis.y // Axis  — reacts to vertical gestures
// each Axis mirrors the single-axis scroll surface:
lenis.x.scroll        // number
lenis.x.targetScroll
lenis.x.animatedScroll
lenis.x.progress      // 0..1
lenis.x.velocity
lenis.x.direction     // 1 | -1 | 0
lenis.x.limit
lenis.x.isScrollable
lenis.x.scrollTo(200, { duration: 1 })

// scroll event — callback still receives `lenis`; destructure if you like
lenis.on('scroll', ({ x, y }) => {            // x, y are Axis instances
  el.style.transform = `translate(${-x.scroll}px, ${-y.scroll}px)`
})

// scrollTo in 2D
lenis.scrollTo({ x: 200, y: 800 }, { duration: 1.2 }) // both axes, animated together
lenis.scrollTo('#section')                             // resolves element rect → both axes
lenis.scrollTo({ y: 800 })                             // only y moves
lenis.x.scrollTo(200)                                  // single axis, numbers only

// raf — unchanged (autoRaf: true by default)
```

### Decisions

- **Event shape:** unchanged. `on('scroll', cb)` still passes the `Lenis` instance; `({ x, y }) => {}` works because `x`/`y` are properties on it. No event redesign, no breaking change.
- **Top-level scalars in `'both'` mode** → **alias the vertical axis** (`lenis.scroll === lenis.y.scroll`, `lenis.scrollTo(500) === lenis.y.scrollTo(500)`, …). Purely additive — a v1 component dropped into a 2D page keeps working. The "real" 2D API is `lenis.x` / `lenis.y` / `lenis.scrollTo({ x, y })`.
- **`Axis` ownership:** per-axis *state + motion* only — `animatedScroll`, `targetScroll`, `velocity`, `lastVelocity`, `direction`, getters `scroll` / `progress` / `limit` / `isScrollable`, methods `scrollTo(number, opts)` / `advance(dt)` / `reset()`, its own `Animate`. **No DOM writes** (Lenis flushes once per frame), **no event listeners**, **no options bag**, **no classnames**.
- **`Lenis` ownership (the controller):** event wiring, `onGesture` / `onClick`, `Dimensions`, `isScrolling` / `isTouch` / `isWheel` / `isLocked`, classnames, `raf`, `emit`, the options bag. Holds `readonly x: Axis` and `readonly y: Axis` — both always exist; the inactive one is just inert (`isScrollable === false`).

### `Lenis.raf` per frame (2D)

```ts
this.x.advance(dt)
this.y.advance(dt)
this.options.wrapper.scrollTo({ left: this.x.scroll, top: this.y.scroll, behavior: 'instant' })
```

(Single axis: same, just one axis is inert.)

## Steps

Ordered so each is a discrete, independently-shippable unit. `→` marks dependencies.

### Phase 0 — foundation (no public API change) — ✅ DONE

1. ✅ **Clean-sheet `Axis` class** (`packages/core/src/axis.ts`) — pure per-axis state (`animatedScroll`, `targetScroll`, `velocity`, `lastVelocity`, `direction`) + own `Animate`; getters `scroll` / `progress` / `limit` / `actualScroll` / `cssOverflow`; methods `setScroll` / `reset` / `advance` / `destroy`. Reads everything it needs lazily off the `Lenis` ref (`options`, `dimensions`, `rootElement`) — no options bag of its own, no listeners, no class names, no DOM-write fan-out beyond its own coordinate. Old scaffold (`console.log`, getter-only `isStopped`/`isLocked` stubs, dangling `start`/`stop`/`emit`) deleted.
   - ⏭️ `Axis.scrollTo(target: number, opts)` **not** extracted yet — the `scrollTo` state machine still lives on `Lenis` and operates on the active axis. Moving it into `Axis` needs host callbacks (`emit`, set `isScrolling`, `userData`, `preventNextNativeScrollEvent`, `dispatchScrollendEvent`, the `Lenis` ref for `onStart`/`onComplete`); deferred to **Phase 1 step 7** where per-axis `scrollTo` dispatch actually needs it.
2. ✅ **`Lenis` delegates to one active `Axis`** — holds `readonly x: Axis` / `readonly y: Axis`, `private get activeAxis()` = `isHorizontal ? x : y`. `scroll` / `progress` / `limit` / `actualScroll` getters and `targetScroll` / `animatedScroll` / `velocity` / `lastVelocity` / `direction` get+set pairs all delegate to `activeAxis` (so `scrollTo` / `onGesture` / `onNativeScroll` bodies were untouched). `raf` advances both axes; `destroy` destroys both; `checkOverflow` reads `activeAxis.cssOverflow`. **Zero public API change.** Verified: typecheck clean, biome clean, builds.
3. ✅ **Consolidate DOM writes** — `Axis.advance(dt)` now returns whether the animation was running that frame; `Lenis.raf` flushes via `private flushScroll()` once after advancing both, with a single `wrapper.scrollTo({ left?, top?, behavior: 'instant' })` call that only writes the live axis(es) per `orientation`. `scrollAxisTo`'s `onUpdate` no longer writes DOM. The `immediate` branch still writes synchronously via `axis.setScroll` (it runs outside `raf`).
4. ✅ **Per-axis native-scroll handling** — `onNativeScroll` now updates **both** axes from their respective `actualScroll` (`wrapper.scrollX` for `x`, `wrapper.scrollY` for `y`), with per-axis `velocity`/`lastVelocity`/`direction`. The velocity-reset timeout fires if *any* axis moved.

> Not yet verified in a real browser — needs a manual pass against `playground/core` (vertical) and `playground/www/pages/horizontal.astro` (horizontal) since there are no automated tests.

### Phase 1 — `orientation: 'both'` (the feature) — steps 5–7 ✅

5. ✅ **Accept `orientation: 'both'`** — added to `Orientation` in `types.ts`. `gestureOrientation` default fixed to `orientation === 'vertical' ? 'vertical' : 'both'` (so `'both'` orientation defaults to `gestureOrientation: 'both'` and has no effect for routing). `lenis.x` / `lenis.y` already public from Phase 0. Top-level scalars (`lenis.scroll`, `scrollTo(number)`, …) alias the vertical axis (because `isHorizontal` returns `false` for `'both'`, so `activeAxis = y`) — fully back-compatible.
6. ✅ **2D gesture routing** — `onGesture` branches after the `isSmooth` check: in `orientation: 'both'`, `deltaX` drives `x` via `scrollAxisTo(x, x.targetScroll + dx)` and `deltaY` drives `y` similarly. Per-axis touch-end inertia (`Math.sign(d) * |axis.velocity| ** inertia`). `data-lenis-prevent-horizontal` / `-vertical` still applies per the dominant gesture direction (existing logic). Overscroll edge-detection simplified to always-stopPropagation in 2D for now (Phase 9 refinement).
7. ✅ **`scrollTo({ x?, y? })` overload** + **`Axis.scrollTo(number, opts)`** — extracted the animation state machine into `Lenis.scrollAxisTo(axis, target, opts)` (`@internal` — operates on the given axis; Lenis-level state stays on `this`). Public `Lenis.scrollTo` is now overloaded: `(target: number | string | HTMLElement, opts?)` resolves on the active axis; `(target: { x?, y? }, opts?)` dispatches to each axis. `Axis.scrollTo(target: number, opts?)` is a thin wrapper around `scrollAxisTo(this, …)` — so `lenis.x.scrollTo(200)` works. Completion logic only clears `isScrolling = false` when **no axis is animating** (`isAnyAxisAnimating` guard) so finishing one axis doesn't kill another's animation. `Lenis.reset()` now resets both axes.
8. ✅ **`scrollTo(element | selector)` in 2D** — extracted `private resolveElementTarget(node, axis, offset)`. In `orientation: 'both'`, `lenis.scrollTo('#section')` (or an `HTMLElement`) resolves the element rect to a target *per axis* (scroll-margin / scroll-padding / wrapper-rect correction each computed on the right side) and dispatches to both axes simultaneously. Covers anchor-link navigation in 2D. Keywords (`'top'`, `'left'`, `'start'`, `'#'`, `'bottom'`, `'right'`, `'end'`) stay single-axis on the active (vertical) axis — for 2D keyword behaviour, pass `{ x: 0, y: 0 }`.

### Phase 2 — edges & polish — ✅ DONE

9. ✅ **Nested scroll in 2D** — `isScrollableElement` already checks both `deltaX`/`deltaY`; the per-element `data-lenis-prevent-*` check still uses the gesture's dominant direction (existing rule: "defer the whole gesture if a composed-path element handles the dominant direction" — kept). The 2D `onGesture` branch now uses **per-axis edge-aware** `stopPropagation` instead of always-stopPropagation: stops only when overscroll is off / `infinite` / nested wrapper *and* either axis is mid-scroll or pushing into a boundary. Plus per-axis `cssOverflow` gating on dispatch — `overflow-x: hidden` blocks x gestures but not programmatic `lenis.x.scrollTo`.
10. ✅ **Classnames** — `checkOverflow` now aggregates: `Lenis.isScrollable = liveAxes.some(a => a.cssOverflow)` (introduced `private get liveAxes()` keyed off `orientation`). So `lenis-stopped` is applied only when *no* live axis can scroll. `lenis-scrolling` / `lenis-smooth` already worked correctly (shared `isScrolling`). `window.lenis.horizontal` stays for `'horizontal'`-only — no new global for `'both'`.
11. ✅ **Events / direction-velocity semantics** — no event-shape change. JSDoc updated on `Lenis.scroll` / `targetScroll` / `animatedScroll` / `velocity` / `lastVelocity` / `direction` / `actualScroll` / `progress` / `limit` to clarify they alias the active axis and point readers at `lenis.x.*` / `lenis.y.*` for per-axis values. `isScrolling` docs note it stays truthy until *no* axis is animating.

### Phase 3 — ecosystem & docs

12. **React / Vue wrappers** — per-axis state needs no wrapper change (the scroll callback already receives the `Lenis` instance, so consumers read `lenis.x` / `lenis.y` directly). Wrapper parity work: ✅ React (`root`/`rootContext` split, named instances via `useLenis(name)`). ✅ Vue + Nuxt — mirrored the keyed registry: `<VueLenis>` gains `rootContext` (defaults to `root`) and `name`; `useLenis(name?, callback?, priority?)` reads any instance from anywhere. Nuxt inherits it all by re-exporting `lenis/vue`.
13. **`playground/two-axis` polish** — wire it as the real test bed / example.
14. **Docs + migration note** — `orientation: 'both'`, `lenis.x` / `lenis.y`, `scrollTo({ x, y })`, "`gestureOrientation` has no effect when `'both'`".

**Minimum path to "it works":** 1 → 2 → 4 → 5 → 6 → 7 (with 3 folded into 2; 8–14 as follow-ups).

## Decided constraints

- **`infinite` is global** — one boolean, applies to whichever axes are live (not per-axis).
- **`overscroll` is global** — same.
- **`wheel` / `touch` config is global** — no per-axis lerp/duration/easing/multiplier/etc.

## Open questions

- **Keep `orientation` long-term, or go fully CSS-driven** — an axis is "live" iff its `overflow-{x|y}` ∉ {hidden,clip} ∧ content overflows that way (mirrors how `isScrollable` already works). Could stay `orientation: 'both'` for v2 and revisit. Note the migration cost for horizontal-scroll sites if `orientation` is ever removed (`orientation: 'horizontal'` → CSS + `lenis.x`).
