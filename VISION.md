# Lenis Vision

Lenis is the scroll layer for the web: native scrolling, made smooth, everywhere — wheel, touchpad, touch, drag, programmatic. It exists so the most ambitious scroll interfaces on the web can be built without sacrificing what native scrolling gets right.

This document is a decision filter, not marketing. Every feature request, PR, and API design gets judged against it. If a proposal fails a principle below, it doesn't ship in core — no matter how cool.

## Principles

### 1. Override as few native APIs as possible

The browser owns scroll geometry, scrollability, and overflow semantics — Lenis mirrors them (see [V2-ROADMAP.md](./V2-ROADMAP.md) for the full policy: *mirror the platform where it's the authority, exceed it where it's the ceiling*). Every Lenis property should have a citable platform definition. When in doubt, do what the browser would do.

**Test:** can you link the MDN page this behavior mirrors? If the platform later ships the feature natively, does Lenis interop with it or fight it?

### 2. Never degrade accessibility

Native scrollbar stays. Keyboard scrolling stays. Screen readers see a normal page. `prefers-reduced-motion` is respected. Lenis is the smooth scroll an agency can ship to a bank.

**Test:** does the feature still pass with Lenis conceptually removed? A page using Lenis must remain fully usable if Lenis never boots.

### 3. Cover every way people scroll

Wheel, touchpad, touch, keyboard, drag, anchors, programmatic — one consistent scroll model across all of them. A feature that only works for one input method is half a feature.

**Test:** what happens on a trackpad? On iOS? When called from code? If the answers differ in surprising ways, it's not done.

### 4. Bulletproof by default, opt out for advanced cases

`new Lenis()` just works — no raf setup, no CSS import, no gotchas. Defaults serve the 90% who install Lenis for smooth scrolling; options serve the 10% doing WebGL sync and exotic layouts. Complexity is opt-in, never opt-out.

**Test:** does the zero-config path get better or more fragile?

### 5. Ease creative effects — don't become them

Lenis makes snap, infinite, horizontal, multi-axis, and drag *possible and pleasant*. It is not an animation engine, not a component kit, not a framework. Core exposes the scroll model; effects are built on top of it — in `lenis/snap`-style companion packages, in patterns, in userland.

**Test:** is this the scroll layer, or something built on the scroll layer? The second belongs outside core.

## Library vs. brand

The library stays small and boring — that's why it became the standard. The ambition lives in the brand: patterns, showcase, reference demos, named techniques. Growth happens around core, not inside it.
