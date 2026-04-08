# Lenis v2 Roadmap

## Philosophy shift

Lenis was originally built for developers syncing WebGL and DOM through smooth scrolling. Over time it became the standard smooth scroll library, widely adopted by designers, no-code users, and AI-assisted workflows. Most users just want reliable smooth scrolling out of the box.

**v2 inverts the paradigm: bulletproof by default, opt out for advanced use cases.**

`new Lenis()` should just work — no configuration, no CSS import to remember, no gotchas.

---

## Breaking changes

### Default values flip

Options that are currently opt-in become the default behavior:

| Option | v1 default | v2 default | Rationale |
|--------|-----------|-----------|-----------|
| `autoRaf` | `false` | `true` | Most users forget to set up the raf loop |
| `autoToggle` | `false` | `true` | Handles overflow changes automatically |
| `anchors` | `false` | `true` | Anchor links should just work |
| `allowNestedScroll` | `false` | `true` | Modals and nested containers should just work |
| `stopInertiaOnNavigate` | `false` | `true` | Prevents scroll bleed on navigation |
| `naiveDimensions` | `false` | `true` | More reliable for most setups |

### Options restructure

Flat options → nested objects for related config:

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
    lerp: 0.075,
    multiplier: 1,
    inertia: 1.7,
  },
})
```

### Options rename

| v1 | v2 | Reason |
|----|-----|--------|
| `syncTouch` | `touch.smooth` | Mirrors `wheel.smooth`, clearer intent |
| `syncTouchLerp` | `touch.lerp` | Grouped under `touch` |
| `touchMultiplier` | `touch.multiplier` | Grouped under `touch` |
| `touchInertiaExponent` | `touch.inertia` | Grouped under `touch` |
| `smoothWheel` | `wheel.smooth` | Grouped under `wheel` |
| `wheelMultiplier` | `wheel.multiplier` | Grouped under `wheel` |
| `lerp` | `wheel.lerp` | Grouped under `wheel` |
| `virtualScroll`, `prevent` | `onGesture` or TBD | Current names are misleading, should return the modified values |
| `naiveDimensions` | `dimensions`: `read` (default if `content` is undefined), `observe` (default if `content` is defined) | "Naive" is a CS term, not user-friendly, this makes `content` optional (less issues) |

### Properties rename

| v1 | v2 | Reason |
|----|-----|--------|
| `isScrolling` | `isWheelScrolling` / `isTouchScrolling` / `isProgrammaticScrolling` | More explicit |

### lenis/react

- [ ] Deprecate `root` option — don't target window, just forward instance. Maybe `children` detection can help
- [ ] Use `useSyncExternalStore` for state management

---

## New features

### Auto CSS injection
Inject critical styles at runtime so users never have to import `lenis.css` manually. This is the most common setup mistake.

### Pull to refresh & UI collapse
Support native pull-to-refresh and browser UI collapse when `touch.smooth` is enabled.

### Warnings
Warns on development mode when `infinite` is called on `html`/`body`. This will causes flicker because of iOS.

### Examples
- Nested scroll
- Horizontal scroll
- Framework integrations
- Common patterns (modals, drawers, etc.)

---

## Housekeeping

- [ ] Check if GSAP ScrollTrigger integration is still necessary
- [ ] Deprecate `lenis/snap` `type` option (legacy)

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
- Renamed/restructured options
- Renamed properties
- React package changes
