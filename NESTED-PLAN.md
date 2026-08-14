# Nested smooth scroll (recursive adoption) — implementation plan

**Everything everywhere all at once** — every input, every axis, every surface.

## Goal & guiding principle

One option makes every scrollable surface the user touches feel like Lenis: when a gesture lands on a nested scrollable element, Lenis creates (and caches) an instance on it and hands the gesture over — including the very first one. Adoption is recursive by construction — a spawned child runs the same pipeline with the same config, so *its* nested scrollers get adopted too.

Launch posture: **opt-in** (`smooth` defaults to `false`). The failure modes are asymmetric — opt-in undiscovered is a docs problem; default-on misbehaving in third-party widgets is a production problem. Revisit the default once the feature has survived the wild; `false → true` is a cheap flip later, the reverse is not.

Guiding principle (same as v2 core): stay native-aligned. Adopted instances are ordinary Lenis instances on ordinary scroll containers — no proxying, no synthetic scroll state. The existing nested-Lenis chaining (`overscroll`, `lenisStopPropagation`) is the composition mechanism.

## Target API

```js
const lenis = new Lenis({
  nested: {
    // true: recursively create a Lenis instance (same config) on any nested
    //   scroller the user interacts with
    // false (default): nested scrollers scroll natively (v1's allowNestedScroll: true)
    smooth: true,
    // choose which elements get adopted; return false to leave one native
    filter: (element) => !element.classList.contains('native'),
  },
})

Lenis.get(element) // → the instance mounted on `element`, adopted or manual (undefined if none)
```

### Decisions

- **`nested` replaces `allowNestedScroll`** — always an object, sibling of `wheel`/`touch`/`drag`/`programmatic`. Migration: `allowNestedScroll: true` → default (`{ smooth: false }` = native nested); `allowNestedScroll: false` (hijack gestures over nested scrollers) is dropped — no equivalent, it fought native behavior. Adoption is **opt-in** at launch (see posture above).
- **The first gesture is smooth too.** At the spawn point the parent detects the scroller, creates + caches the instance, then **forwards the in-flight gesture data into the child's pipeline** (internal handoff — the child runs its normal gesture path against the original event, so preventDefault/`lenisStopPropagation` behave as if the child had caught it). From the next gesture on, the child's own element-level listener fires before the parent's and the existing `lenisStopPropagation` flow keeps the parent out.
- **Lazy spawn only.** No upfront DOM scan; the spawn point is the existing `isScrollableElement` hit in `onGesture`.
- **Children never own a rAF loop.** Adopted instances are created with `autoRaf: false` and advanced by the adopting parent's `raf`. Parent destroyed → subtree destroyed. This is the leak-prevention backbone.
- **Child orientation is detected, not inherited**: derived from the element's scrollable axes (`x` only → `horizontal`, `y` only → `vertical`, both → `both`).
- **Same config**: children inherit the parent's options wholesale — including `nested` (recursion) — except the per-element ones (`wrapper`/`content`/`eventsTarget`), `autoRaf` (forced `false`), `infinite`/`anchors` (root-page concerns), and `orientation`/`gestureOrientation` (detected).

## Steps

### Phase 1 — registry & spawn (the feature) — ✅ DONE

Implementation notes (decisions made while building):

- **Drags never trigger adoption**: a mouse drag can't be handed off mid-gesture (the child's pointer tracking only starts on its own `pointerdown`), and native mouse drag is a no-op on scrollers anyway — the first wheel/touch adopts, and fresh drags after adoption work through the child's own handler.
- **Touch handoff seeds the child's `touchStart`** from the parent's tracking, so the child's next `touchmove` delta is continuous even though it never saw `touchstart`.
- The composedPath walk was restructured from one `.find` into a loop so prevent-attrs and nested-scroll detection stay in path order while exposing *which* node matched (the adoption site). Adopted/manual instances need no special-casing in the walk: mid-range they flag events via `lenisStopPropagation` before the parent runs; at their edges `isScrollableElement` returns false and chaining falls through naturally.

1. **Types**: `NestedOptions { smooth?: boolean; filter?: (element: HTMLElement) => boolean }` in `types.ts`; `nested?: NestedOptions` on `LenisOptions`; remove `allowNestedScroll`.
2. **Options normalization**: `nested: { smooth: true, ...nested }` — same shape as `wheel`/`touch`/`drag`.
3. **Instance registry** (module scope in `lenis.ts`): `WeakMap<Element, Lenis>`. Every constructor registers `rootElement`; `destroy()` unregisters. Expose `static Lenis.get(element)`. Doubles as the double-adoption guard (manual instances included).
4. **Spawn + handoff** in `onGesture`, where the composedPath walk hits `isScrollableElement` and `nested.smooth` is on:
   - eligibility: element not in registry, not a form control (`input`/`textarea`/`select`), not `[contenteditable]`, prevent attrs already handled upstream; `filter(element)` returning `false` leaves it native (cache the verdict in a `WeakSet` so filter runs once per element);
   - create the child with inherited config + detected orientation, register it, track it in the parent's `nestedInstances` set;
   - **hand off the current gesture**: feed the in-flight `GestureData` into the child's gesture path via an internal method, then return — first wheel tick already smooth.
5. **Shared clock**: parent `raf` advances `nestedInstances` (`child.raf(time)`). Works for both `autoRaf` parents and externally-driven ones (GSAP ticker etc.).

### Phase 2 — lifecycle & safety — ✅ DONE (8 pending browser validation)

6. **Disconnect sweep**: from the parent's `raf` (frame-gated) and on `resize`, destroy children whose `rootElement.isConnected` is false; remove from registry + set. Covers unmounting modals and recycled virtual-list nodes.
7. **Destroy cascade**: `parent.destroy()` destroys `nestedInstances` (recursion handles grandchildren).
8. **Interaction edges**: child-edge chaining to parent (`overscroll` on the child), `data-lenis-prevent` inside an adopted child, tap-to-stop/drag on children, `respectReducedMotion` inheritance, handoff correctness for touch (spawn on first `touchmove`, finger-tracking from that point).

### Phase 3 — ecosystem & docs — ✅ DONE

9. ✅ **Playground `/nested-smooth`** (pulled forward as the Phase 2 test bed): modal mount/unmount with live sweep status via `Lenis.get`, tall list, horizontal strip (orientation detection), textarea (built-in skip), `.native` filter demo, scroller-inside-scroller (recursion), per-element adoption readout.
10. ✅ **README**: `nested` option row, "Nested scroll" section rewrite, `Lenis.get` in the Methods table; migration row in V2-ROADMAP breaking changes; `nested` + `Lenis.get` contract entries in `LENIS-API.md`.
11. ✅ **React/Vue**: "Nested smooth scroll" sections in both package READMEs — adoption needs no wiring, `Lenis.get(element)` reaches adopted instances imperatively.

**Minimum path to "it works":** 1 → 2 → 3 → 4 → 5, with 6–7 required before merge (lifecycle is correctness here, not polish).

## Decided constraints

- `smooth: false` is the launch default (see posture in the goal section); the built-in exclusions and `filter` still gate adoption when enabled.
- No MutationObserver — `isConnected` sweeps from the frame loop are enough.
- Adopted instances are real, ordinary `Lenis` instances — anything else (scrollbar plugin, snap, future keyboard) works on them unmodified.

## Open questions

- Touch handoff timing: spawn currently happens on the first `touchmove` (touchstart is a zero-delta gesture that early-returns as click-or-tap). Good enough, or move the nested check ahead of the early-return so `touchstart` spawns the instance before any delta? Decide on device.
- Does the parent need an `'adopt'` event? `filter` selects, `Lenis.get` retrieves — an event is only needed if userland must *react* to adoption (e.g. auto-attach snap). Revisit when the slider package lands.
- Cap on live adopted instances (LRU destroy)? Likely unnecessary with the disconnect sweep — measure on a heavy page first.
