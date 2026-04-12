# Lenis v2 Roadmap

## Philosophy shift

Lenis was originally built for developers syncing WebGL and DOM through smooth scrolling. Over time it became the standard smooth scroll library, widely adopted by designers, no-code users, and AI-assisted workflows. Most users just want reliable smooth scrolling out of the box.

**v2 inverts the paradigm: bulletproof by default, opt out for advanced use cases.**

`new Lenis()` should just work — no configuration, no CSS import to remember, no gotchas.

---

## Status legend

- ✅ Shipped on the `v2` branch
- 🚧 Partial / in progress
- ⏳ Planned, not started

---

## Breaking changes

### ✅ Default values flip

Options that were opt-in in v1 are now default-on:

| Option | v1 default | v2 default | Rationale |
|--------|-----------|-----------|-----------|
| `autoRaf` | `false` | `true` | Most users forget to set up the raf loop |
| `autoToggle` | `false` | `true` | Handles overflow changes automatically |
| `anchors` | `false` | `true` | Anchor links should just work |
| `allowNestedScroll` | `false` | `true` | Modals and nested containers should just work |
| `stopInertiaOnNavigate` | `false` | `true` | Prevents scroll bleed on navigation |
| `dimensions.mode` | (was `naiveDimensions: false`) | `'observe'` when `content` is defined, `'read'` otherwise | More reliable for most setups, no manual `naiveDimensions` toggle |

### ✅ Options restructure

Flat options → nested `wheel` and `touch` groups for related config:

```js
// v1
new Lenis({
  smoothWheel: true,
  wheelMultiplier: 1,
  syncTouch: true,
  syncTouchLerp: 0.075,
  touchMultiplier: 1,
  touchInertiaExponent: 1.7,
  lerp: 0.1,
  naiveDimensions: false,
})

// v2
new Lenis({
  wheel: {
    smooth: true,
    lerp: 0.1,
    multiplier: 1,
  },
  touch: {
    smooth: true,
    lerp: 0.1,
    multiplier: 1,
    inertia: 2,
    // optional fine-tuning overrides that only apply on iOS
    ios: {
      lerp: 0.05,
      inertia: 1.7,
    },
  },
  dimensions: {
    mode: 'observe',
  },
})
```

### ✅ Options rename

| v1 | v2 | Reason |
|----|-----|--------|
| `syncTouch` | `touch.smooth` | Mirrors `wheel.smooth`, clearer intent |
| `syncTouchLerp` | `touch.lerp` | Grouped under `touch` |
| `touchMultiplier` | `touch.multiplier` | Grouped under `touch` |
| `touchInertiaExponent` | `touch.inertia` | Grouped under `touch` |
| `smoothWheel` | `wheel.smooth` | Grouped under `wheel` |
| `wheelMultiplier` | `wheel.multiplier` | Grouped under `wheel` |
| `lerp` | `wheel.lerp` | Grouped under `wheel` |
| `virtualScroll`, `prevent` | `onGesture` | Unified into a single transform/cancel callback |
| `naiveDimensions` | `dimensions` | "Naive" was a CS term; the new option is a richer config object with a smart default |
| `autoResize` | `dimensions.autoResize` | Co-located with the dimensions concern it belongs to |

### ⏳ Properties rename

| v1 | v2 | Reason |
|----|-----|--------|
| `isScrolling` | `isWheelScrolling` / `isTouchScrolling` / `isProgrammaticScrolling` | More explicit |

### lenis/react

- [ ] Deprecate `root` option — don't target window, just forward instance. Maybe `children` detection can help
- [ ] Use `useSyncExternalStore` for state management

---

## Internal refactors

### ✅ `GesturesHandler` replaces `VirtualScroll`

The old `virtual-scroll` abstraction was a general-purpose gesture library — Lenis only used a slice of it. It has been replaced by a focused `GesturesHandler` class that does exactly what Lenis needs (wheel + touch → normalized deltas with a `type` discriminator) and nothing more. The old `virtual-scroll.ts` is gone; the new `gestures-handler.ts` is ~160 lines and easier to maintain.

### ✅ `isScrollableElement` extracted to `utils.ts`

The private `hasNestedScroll` method that detected whether a composed-path element could handle the gesture itself was extracted as a pure function in `utils.ts`, decoupled from the `Lenis` class and reusable from other packages.

### ✅ `Dimensions` owns its own config

`Dimensions` now accepts a `DimensionsOptions` bag (`{ mode, autoResize, debounce }`) and applies its own defaults, including the smart `mode = content ? 'observe' : 'read'` default. `lenis.ts` just forwards the user's config without pre-baking values.

---

## New features

### ✅ `onGesture` callback

Replaces `virtualScroll` + `prevent`. Single transform/cancel callback called once per gesture, before Lenis consumes the deltas:

```ts
new Lenis({
  onGesture: (data, lenis) => {
    // return false to cancel the gesture
    if (someCondition) return false
    // return modified data to change what Lenis sees
    return { ...data, deltaY: data.deltaY * 2 }
    // or return nothing (void) to observe without modifying — treated as pass-through
  },
})
```

The `GestureData` payload includes `deltaX`, `deltaY`, the original `event`, and a `type: 'wheel' | 'touch'` discriminator so callers don't need to sniff `event.type`.

### ✅ iOS-specific touch tuning

iOS devices have subtly different touch physics than Android. `touch.ios` provides a fine-tuning escape hatch for `lerp`, `inertia`, `duration`, and `easing` on iOS only:

```ts
new Lenis({
  touch: {
    smooth: true,
    inertia: 2,            // applies everywhere
    ios: { inertia: 1.7 }, // iOS-only override on top
  },
})
```

iOS detection handles the iPadOS 13+ desktop-UA case via `navigator.maxTouchPoints`.

### 🚧 Multi-axis scrolling

Initial multi-axis support landed in commit `f3c203e`. Allows simultaneous horizontal and vertical scrolling for use cases like 2D canvas navigation, maps, spreadsheets, and layouts that scroll in both directions. Examples and polish still pending.

### ⏳ Auto CSS injection

Inject critical styles at runtime so users never have to import `lenis.css` manually. This is the most common setup mistake.

### ⏳ Pull to refresh & UI collapse

Support native pull-to-refresh and browser UI collapse when `touch.smooth` is enabled.

### ⏳ Development warnings

Warn in development mode when `infinite` is used on `html`/`body` (causes flicker on iOS).

### Examples

- ✅ `playground/touch` — native vs Lenis side-by-side for debugging `touch.smooth` on real devices
- ⏳ Nested scroll
- ⏳ Horizontal scroll
- ⏳ Multi-axis scroll
- ⏳ Framework integrations
- ⏳ Common patterns (modals, drawers, etc.)

---

## Housekeeping

- [ ] Check if GSAP ScrollTrigger integration is still necessary
- [ ] Deprecate `lenis/snap` `type` option (legacy)

---

## Open design questions

### Top-level `duration` and `easing`

With per-axis `wheel.duration`, `wheel.easing`, `touch.duration`, `touch.easing`, the top-level `LenisOptions.duration` / `LenisOptions.easing` now only serve as defaults for programmatic `lenis.scrollTo()` calls. Should they:

- **Stay** — they act as the "programmatic default" layer (current behavior)
- **Move** — rename to make their scope explicit, e.g. `scrollTo: { duration, easing }`
- **Remove** — programmatic `scrollTo` falls back to `wheel.duration` / `wheel.easing`

---

## Documentation restructure

Invert the docs to match the new philosophy:

**v1 structure:** "Here's the minimal setup → here's how to enable things"

**v2 structure:** "It works out of the box → here's how to customize/disable things"

- Lead with zero-config usage
- Group advanced options in a dedicated section
- Reduce the Settings table to only what power users need to tweak

---

## Migration guide

TBD — will provide a v1 → v2 migration guide covering:
- Changed default values
- Renamed/restructured options (`smoothWheel` → `wheel.smooth`, etc.)
- `virtualScroll` / `prevent` → `onGesture`
- `naiveDimensions` → `dimensions` object with `mode` / `autoResize` / `debounce`
- `autoResize` moved into `dimensions`
- Renamed properties (`isScrolling` → split properties, if shipped)
- React package changes
