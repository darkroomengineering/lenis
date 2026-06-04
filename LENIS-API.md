# Lenis API — behavioral source of truth

This document defines the **intended contract** for every public property, getter/setter,
and method on the `Lenis` instance, plus every `scrollTo` option. It is the source of
truth: where the code disagrees with a rule here, the **code** is wrong and should be
brought into line. Divergences known at the time of writing are flagged with **⚠ Code
status**.

Conventions:

- **Active axis** = `x` when `orientation: 'horizontal'`, otherwise `y`. All single-axis
  getters/setters on `lenis` delegate to it. In `orientation: 'both'`, read each axis
  directly (`lenis.x.*` / `lenis.y.*`) for per-axis precision.
- **Gesture** = user-initiated wheel/touch input. **Programmatic** = `scrollTo` (or
  anything driven from code).

---

## `scrollTo(target, options)`

Scroll to a target. One call is **one logical operation**: its callbacks, `userData`, and
`lock` apply once for the whole call even when it drives both axes.

```ts
lenis.scrollTo(500)                       // active axis, animated
lenis.scrollTo('#section', { offset: -80 })
lenis.scrollTo('bottom', { immediate: true })
lenis.scrollTo({ x: 200, y: 800 })        // 2D — drives both axes as one operation
```

**Targets**

| Target | Resolves to |
| --- | --- |
| `number` | active axis → `target + offset` |
| `'top'` / `'left'` / `'start'` / `'#'` | active axis → `0 + offset` |
| `'bottom'` / `'right'` / `'end'` | active axis → `limit + offset` |
| CSS selector / `HTMLElement` | element's scroll position (`+ offset`); both axes in `'both'` mode |
| `{ x?, y? }` | the given axes; omitted axis untouched |

**Rule — one call = one `onStart`, one `onComplete`.** Even a 2D `{ x, y }` target fires
each callback exactly once: `onStart` when the first axis starts, `onComplete` when the
last axis settles. Interrupting the operation never fires `onComplete`.

### `scrollTo` options

#### `offset?: number | { x?, y? }` — default `0`

**Rule:** shift the resolved target by `offset` pixels. Applies to **every** target form,
including 2D. A scalar applies to every driven axis; pass `{ x?, y? }` to offset each axis
independently (a missing axis key is `0`). For single-axis targets the active axis's
offset is used.

```ts
lenis.scrollTo('#section', { offset: -100 })             // stop 100px above the section
lenis.scrollTo({ x: 200, y: 800 }, { offset: -50 })      // scalar → x: 150, y: 750
lenis.scrollTo({ x: 200, y: 800 }, { offset: { y: -80 } }) // per-axis → x: 200, y: 720
```

#### `immediate?: boolean` — default `false`

**Rule:** jump to the target instantly, skipping the animation.

- No interpolation; `animatedScroll`/`targetScroll` are set to the target in one step.
- Fires `onStart` then `onComplete` synchronously, then dispatches `scrollend` on the
  next frame.
- Ignores `duration` / `easing` / `lerp`.

```ts
lenis.scrollTo(0, { immediate: true }) // snap to top, no tween
```

#### `lock?: boolean` — default `false`

**Rule:** prevent user gestures for the lifetime of *this* programmatic scroll.

- Sets `isLocked = true` when the operation starts, `isLocked = false` when it completes.
- All-or-nothing and instance-wide (see [`isLocked`](#islocked--getset-boolean)); a
  partial `scrollTo({ x }, { lock: true })` still locks the whole instance.
- Programmatic scrolls still run while locked — `lock` only gates **gestures**.

```ts
lenis.scrollTo(1000, { lock: true }) // user can't wheel-interrupt this scroll
```

#### `programmatic?: boolean` — default `true`

**Rule:** internal flag for whether the scroll came from code (`true`) or from a user
gesture (`false`). Consumers should not normally set it.

- `true` (default for `scrollTo`): drives `targetScroll` to follow the animation, uses
  the programmatic `duration`/`easing`/`lerp` defaults.
- `false`: used internally by the gesture handler so wheel/touch feed the animation
  without overriding the user's intent.

#### `duration?: number` (seconds) / `easing?: (t) => number` / `lerp?: number`

**Rule:** choose the interpolation for the animated (non-`immediate`) path.

- Provide **`duration`** (optionally with `easing`) for time-based easing. Default easing:
  `(t) => Math.min(1, 1.001 - 2 ** (-10 * t))`.
- Provide **`lerp`** (0–1) for framerate-independent damping instead.
- If neither is given, the instance defaults apply (`options.duration` / `options.easing`,
  else `wheel.lerp`).

```ts
lenis.scrollTo(500, { duration: 1.2, easing: (t) => t })
lenis.scrollTo(500, { lerp: 0.1 })
```

#### `onStart?: (lenis) => void` / `onComplete?: (lenis) => void`

**Rule:** lifecycle callbacks for the operation, fired **once** each (see the one-call rule
above). `immediate` scrolls fire both synchronously; `onComplete` never fires if the
operation is interrupted.

#### `userData?: UserData` — default `{}`

See [`userData`](#userdata--getset-userdata). Tags the operation so scroll listeners can
tell what triggered it.

```ts
lenis.scrollTo('#section', { userData: { source: 'nav-click' } })
lenis.on('scroll', () => console.log(lenis.userData.source))
```

---

## State & control

### `userData` — get/set `UserData`

**Rule:** carries external context about *what triggered the current programmatic scroll*,
forwarded through scroll callbacks. Set on `scrollTo`, cleared on completion, and
overwritten by the next `scrollTo`.

- Set once per `scrollTo` (shared across both axes in 2D); stays readable until the whole
  operation completes.
- Cleared back to `{}` on completion, and replaced wholesale by the next `scrollTo`.
- It describes *trigger context* (e.g. `{ source: 'nav' }`), not scroll state.
- A gesture that interrupts a programmatic scroll may leave the previous tag in place
  until the next `scrollTo` — acceptable, since the next call replaces it.

### `isLocked` — get/set `boolean` — default `false`

**Rule:** when `true`, user gestures (wheel/touch) cannot scroll. Programmatic `scrollTo`
still runs. Instance-wide and all-or-nothing — both axes are locked together or neither is.

- Set it directly, or via [`lock()`](#lock--unlock) / [`unlock()`](#lock--unlock), or for
  the lifetime of a `scrollTo({ lock: true })`.
- Toggling it maintains the `lenis-locked` class on the root element.

```ts
lenis.isLocked = true        // suppress gestures; scrollTo still works
lenis.scrollTo(1000)         // runs
lenis.isLocked = false
```

### `lock()` / `unlock()`

**Rule:** imperative shortcuts for `isLocked = true` / `isLocked = false`.

### `isScrolling` — get `boolean | 'native' | 'smooth'`

**Rule:** current scroll state.

- `'smooth'` — a Lenis animation is driving at least one axis.
- `'native'` — consuming a non-smooth native scroll.
- `false` — idle. In 2D, becomes `false` only once **no** axis is animating.

### `isScrollable` — get `boolean`

**Rule:** whether the user can scroll, derived from the wrapper's CSS `overflow`. `true`
when at least one live axis is scrollable (not `hidden` / `clip`). Drives the
`lenis-stopped` class (applied when `false`). Cached per-axis on
`lenis.x.isScrollable` / `lenis.y.isScrollable`, refreshed at construction and on
`overflow` `transitionend`.

---

## Scroll values (active-axis delegates)

In `orientation: 'both'`, these alias the **vertical** axis; read `lenis.x.*` / `lenis.y.*`
for the other axis.

### `scroll` — get `number`
**Rule:** the current animated scroll value of the active axis (full-float; wrapped to
`limit` when `infinite`).

### `targetScroll` — get/set `number`
**Rule:** the value the active axis is animating toward. Setting it is low-level; prefer
`scrollTo`.

### `animatedScroll` — get/set `number`
**Rule:** the interpolated scroll value of the active axis (what `scroll` reads pre-wrap).

### `actualScroll` — get `number`
**Rule:** the scroll value the **browser** currently reports for the active axis
(`scrollY`/`scrollTop` or `scrollX`/`scrollLeft`).

### `velocity` — get/set `number`
**Rule:** current scroll velocity (delta since last frame) on the active axis. Per-axis:
`lenis.x.velocity` / `lenis.y.velocity`.

### `lastVelocity` — get/set `number`
**Rule:** the velocity from the previous frame on the active axis.

### `direction` — get/set `1 | -1 | 0`
**Rule:** scroll direction of the active axis — `1` forward, `-1` backward, `0` idle.

### `progress` — get `number`
**Rule:** scroll progress `0..1` of the active axis relative to its `limit` (`1` when
`limit` is `0`).

### `limit` — get `number`
**Rule:** the maximum scroll value for the active axis.

---

## Axes & geometry

### `x` / `y` — readonly `Axis`
**Rule:** the per-axis scroll engines. In 2D each owns its own
`scroll`/`targetScroll`/`velocity`/`direction`/`limit`/`isScrollable` and its own
animation. Always available; only the active one is used in single-axis modes.

### `rootElement` — get `HTMLElement`
**Rule:** the element Lenis is mounted on — the `wrapper`, or `document.documentElement`
when the wrapper is `window`. Carries the `lenis-*` state classes.

### `className` — get `string`
**Rule:** the space-separated class list reflecting state, applied to `rootElement`:
`lenis`, plus `lenis-smooth`, `lenis-scrolling`, `lenis-stopped`, `lenis-locked` as the
matching state holds.

### `isHorizontal` — get `boolean`
**Rule:** `true` when `orientation === 'horizontal'` (i.e. the active axis is `x`).

### `dimensions` — readonly `Dimensions`
**Rule:** live wrapper/content size and per-axis scroll `limit`, kept in sync by a
`ResizeObserver`. Read `dimensions.width` / `dimensions.height` / `dimensions.limit`.

### `options` — the resolved instance options
**Rule:** the merged, defaulted `LenisOptions` the instance is running with.

---

## Input/runtime state

### `isTouch` — `boolean | undefined`
**Rule:** whether the **last** gesture was touch. `undefined` until the first gesture.

### `isWheel` — `boolean | undefined`
**Rule:** whether the **last** gesture was a wheel. `undefined` until the first gesture.

### `time` — `number`
**Rule:** timestamp (ms) of the most recent `raf` tick.

---

## Methods

### `on(event, callback)` / `off(event, callback)`
**Rule:** subscribe / unsubscribe to `'scroll'` (`(lenis) => void`) or `'gesture'`
(`(data) => void`). `on` returns an unsubscribe function.

### `raf(time)`
**Rule:** advance the animation by the clock `time` (ms). Called automatically when
`autoRaf: true`; otherwise drive it yourself from a `requestAnimationFrame`/Tempus loop.

### `resize()`
**Rule:** force a re-measure of wrapper/content dimensions (normally automatic via the
`ResizeObserver`).

### `destroy()`
**Rule:** tear down — remove listeners, stop the raf loop, disconnect observers. The
instance is unusable afterward.
