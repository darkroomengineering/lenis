import { Axis, type AxisHost } from '../../core/src/axis'
import { clamp } from '../../core/src/maths'
import { ScrollingBox } from '../../core/src/scrolling-box'
import type { DimensionsOptions } from '../../core/src/types'
import { Emitter } from '../../utils/emitter'

// How it works (ScrollSmoother-style, see SMOOTH-WRAPPER.md). Same words as
// core: `wrapper` is the scroll container, `content` is what's inside it.
// - the wrapper scrolls natively (the window by default, or any overflow:
//   auto element). Nothing is intercepted, so wheel, touch, keyboard,
//   scrollbar, iframes and every platform gesture stay the browser's. It owns
//   the input and the target
// - the content is what the user sees: <body> for the window, the single
//   child of an element wrapper. Sync pins it itself (position: sticky; top:
//   0; overflow: hidden, one viewport of the wrapper high — sticky rather
//   than fixed so the browser's scroll-into-view walk, find-in-page included,
//   can continue past it to the root) and gives the wrapper the content's
//   range: <html> gets the content height for the page, a spacer sync appends
//   does it for a panel. No markup, no CSS
// - on every scroll event the content is written to the wrapper's position,
//   in the same frame, verbatim. Invariant: content position == wrapper position
// - a content scroll the browser applied itself (focus, anchor, scrollIntoView,
//   scroll anchoring) is adopted, and the wrapper is brought along
//
// `shadow: true` (research): the same mechanism without touching the site's
// markup or inline styles. Sync attaches a shadow root to the wrapper (body
// for the window) and builds the structure there, the site's children are
// slotted in untouched:
//   host (body / panel)
//     #shadow-root
//       .track       block, content.scrollHeight high: the wrapper's range
//         .content   sticky, one viewport high, overflow hidden: what moves
//           .layout  auto height, takes over the host's layout
//             <slot> the site's children, any number of them
// The layout box mirrors the host's display, alignment and min-height in JS
// and inherits gap and grid tracks through the boxes above it, so a flex or
// grid body keeps laying out its children. It has an auto height, unlike the
// content, so flex children never shrink into the viewport. Whatever sits above the track (body
// padding, margins) scrolls natively and is subtracted as `offset`.

export type LenisSyncOptions = {
  /**
   * The native scroll container, exactly as in Lenis: `window` for the page,
   * or an `overflow: auto` element for a nested panel. It owns the input.
   * @default window
   */
  wrapper?: Window | HTMLElement
  /**
   * The box sync pins inside the wrapper and mirrors to its position. `body`
   * for the window; for an element wrapper, pass its single child. Sync styles
   * it itself and restores the styles on `destroy`.
   * @default document.body (window wrapper only)
   */
  content?: HTMLElement
  /** Run the loop internally; pass `false` to drive it with `raf()` @default true */
  autoRaf?: boolean
  /**
   * Same as Lenis (`mode`, `autoResize`, `debounce`). Defaults to
   * `{ debounce: 0 }` so `limit` is always fresh. `autoResize: false` turns
   * off the per-frame extent check; call `resize()` yourself.
   */
  dimensions?: DimensionsOptions
  /**
   * Research: build the wrapper/content structure in a shadow root attached
   * to the wrapper (body for the window) instead of styling the site's own
   * elements. `content` is ignored. A shadow root can't be removed, so
   * `destroy` leaves a bare `<slot>`, which renders as if there were none.
   * @default false
   */
  shadow?: boolean
}

export type LenisSyncScrollToOptions = {
  offset?: number
}

export class LenisSync {
  readonly options: {
    wrapper: Window | HTMLElement
    content: HTMLElement
    autoRaf: boolean
    dimensions: DimensionsOptions
    shadow: boolean
  }
  readonly scrollingBox: ScrollingBox
  /** The vertical scroll axis (the only one, for now) */
  readonly y: Axis
  private readonly emitter = new Emitter()
  private readonly abortController = new AbortController()
  private rafId = 0
  /** A scroll event moved the content this frame (velocity settles on idle frames) */
  private moved = false
  /** Undoes the inline styles applied to the content (and html for body) */
  private restoreStyles?: () => void
  /** Element wrapper only: the sibling that gives the wrapper the content's range */
  private spacer?: HTMLElement
  private lastClientHeight = 0
  /** Last scrollable extent written (change detection, see `raf`) */
  private lastScrollHeight = 0
  /** Shadow mode: the block that gives the wrapper the content's range */
  private track?: HTMLElement
  /** Shadow mode: the track's top in the wrapper's scroll coordinates */
  private offset = 0
  /** Shadow mode: watches html and body for scroll locks */
  private hostObserver?: MutationObserver
  /** Shadow mode: the auto-height box that lays out the slotted children */
  private layout?: HTMLElement
  /** Shadow mode, element wrapper: last wrapper height given to the content */
  private lastWrapperHeight = 0

  constructor({
    wrapper = window,
    content,
    autoRaf = true,
    dimensions,
    shadow = false,
  }: LenisSyncOptions = {}) {
    if (shadow) {
      content = this.styleShadow(
        wrapper === window ? document.body : (wrapper as HTMLElement)
      )
    } else if (wrapper === window) {
      content ??= document.body
      if (content !== document.body) {
        throw new Error('lenis/sync: for the window, content is body')
      }
      // html gets the content height first, while body is still in flow, so
      // no layout ever sees a 100dvh document and clamps the window to 0.
      // Scroll restoration already ran on the plain page and survives this;
      // the first raf mirrors it (see the watchdog in `raf`).
      document.documentElement.style.height = `${document.body.scrollHeight}px`
      this.styleBody()
    } else {
      if (!content || content.parentElement !== wrapper) {
        throw new Error(
          'lenis/sync: pass `content`, the single child of an element wrapper'
        )
      }
      this.styleContent(content, wrapper)
    }

    // merged over the default like core does, so `{ autoResize: false }`
    // keeps `debounce: 0` and `limit` stays fresh
    this.options = {
      wrapper,
      content,
      autoRaf,
      dimensions: { ...dimensions },
      shadow,
    }

    // measures the content box (read mode: nothing to observe inside it)
    this.scrollingBox = new ScrollingBox(
      content,
      undefined,
      this.options.dimensions
    )
    this.scrollingBox.on('resize', this.onResize)
    this.onResize()

    // Axis calls the element it reads and writes `wrapper`, because in core
    // the scroll container is what moves. Here that element is the content.
    const host: AxisHost = {
      options: { wrapper: content, infinite: false },
      scrollingBox: this.scrollingBox,
      scrollTo: (target, options) => this.scrollTo(target, options),
    }
    this.y = new Axis('y', host)

    const { signal } = this.abortController
    wrapper.addEventListener('scroll', this.onWrapperScroll, { signal })
    content.addEventListener('scroll', this.onContentScroll, { signal })
    if (shadow) {
      // media queries can change the host's layout: mirror it again
      addEventListener('resize', this.mirrorLayout, { signal })
      // scroll-lock libraries pin body with `position: fixed; top: -scrollY`
      // and restore the scroll on unlock: the track moves, the window range
      // collapses, so re-read where the track sits and mirror again
      this.hostObserver = new MutationObserver(this.onHostChange)
      for (const element of [document.documentElement, document.body]) {
        this.hostObserver.observe(element, {
          attributes: true,
          attributeFilter: ['style', 'class'],
        })
      }
    }

    if (autoRaf) this.rafId = requestAnimationFrame(this.raf)
  }

  destroy() {
    this.abortController.abort()
    this.hostObserver?.disconnect()
    cancelAnimationFrame(this.rafId)
    this.y.destroy()
    this.scrollingBox.destroy()
    this.emitter.destroy()
    document.documentElement.style.height = ''
    this.restoreStyles?.()
  }

  // ─── events ───

  on(event: 'scroll', callback: (lenis: LenisSync) => void) {
    return this.emitter.on(event, callback as (...args: unknown[]) => void)
  }

  off(event: 'scroll', callback: (lenis: LenisSync) => void) {
    this.emitter.off(event, callback as (...args: unknown[]) => void)
  }

  private emit() {
    this.emitter.emit('scroll', this)
  }

  // ─── loop ───

  raf = (_time?: number) => {
    // ponytail: nothing observes the content, so poll its extent once per
    // frame (a layout read only when dirty). Compared against our own last
    // value: the dimensions cache is refreshed silently by every `limit`
    // read, so it can't be the reference.
    const { content, dimensions, wrapper } = this.options
    // shadow mode, element wrapper: the content is one wrapper high in px
    // (a percentage would resolve against the track), so follow the wrapper
    if (
      this.track &&
      wrapper !== window &&
      dimensions.autoResize !== false &&
      (wrapper as HTMLElement).clientHeight !== this.lastWrapperHeight
    ) {
      this.lastWrapperHeight = (wrapper as HTMLElement).clientHeight
      content.style.height = `${this.lastWrapperHeight}px`
    }
    if (
      dimensions.autoResize !== false &&
      (content.scrollHeight !== this.lastScrollHeight ||
        content.clientHeight !== this.lastClientHeight)
    ) {
      this.resize()
    }

    // restoration can land after boot without a scroll event: catch any
    // silent wrapper change (reading the offset is not a layout read)
    if (this.wrapperPosition !== this.y.rawTargetScroll) this.onWrapperScroll()

    // velocity: scroll events fire before raf, so a frame without one means
    // the wrapper stopped — settle the history slot and say so once
    if (this.moved) {
      this.moved = false
    } else if (this.y.rawLastScroll !== this.y.rawScroll) {
      this.y.rawLastScroll = this.y.rawScroll
      this.emit()
    }

    if (this.options.autoRaf) this.rafId = requestAnimationFrame(this.raf)
  }

  /** Force a dimensions recalculation (also resizes the wrapper's range) */
  resize() {
    this.scrollingBox.resize()
  }

  // ─── scrollTo ───

  /**
   * Jump to a number, `'top'` / `'bottom'`, a CSS selector, an element, or
   * `{ y }`. Wrapper and content move together, at once: sync never animates.
   */
  scrollTo(
    target:
      | number
      | string
      | HTMLElement
      | Element
      | { x?: number; y?: number },
    options: LenisSyncScrollToOptions = {}
  ) {
    const { offset = 0 } = options

    let value: number | undefined
    if (typeof target === 'number') value = target
    else if (target === 'top') value = 0
    else if (target === 'bottom') value = this.limit
    else if (typeof target === 'string')
      value = this.elementTop(document.querySelector(target))
    else if (target instanceof Element) value = this.elementTop(target)
    else value = target.y
    if (value === undefined) return

    value = clamp(0, value + offset, this.limit)
    this.writeWrapper(value)
    this.teleport(value)
    this.emit()
  }

  private elementTop(element: Element | null) {
    // viewport coords relative to the pinned content, plus its scroll offset
    return element
      ? element.getBoundingClientRect().top -
          this.options.content.getBoundingClientRect().top +
          this.y.actualScroll
      : undefined
  }

  // ─── getters ───

  /**
   * The content's position, the value the current frame paints with. Past
   * `[0, limit]` during a rubber-band (iOS, Safari), see `onWrapperScroll`
   */
  get scroll() {
    return this.y.scroll
  }

  /** The wrapper's position; equal to `scroll` once the frame's event has run */
  get targetScroll() {
    return this.y.targetScroll
  }

  get actualScroll() {
    return this.y.actualScroll
  }

  get velocity() {
    return this.y.velocity
  }

  get direction() {
    return this.y.direction
  }

  get progress() {
    return this.y.progress
  }

  get limit() {
    return this.y.maxScroll
  }

  /** The pinned content box */
  get rootElement() {
    return this.options.content
  }

  // ─── internals ───

  private onResize = () => {
    this.lastScrollHeight = this.scrollingBox.scrollHeight!
    this.lastClientHeight = this.scrollingBox.height!
    if (this.track) {
      // the content's full height: it stays pinned for exactly its range,
      // whatever surrounds the track (body padding, margins) scrolls natively
      this.track.style.height = `${this.lastScrollHeight}px`
      this.offset = this.trackTop()
    } else if (this.spacer) {
      // the wrapper's range: the content minus the one viewport that is pinned
      this.spacer.style.height = `${this.lastScrollHeight - this.lastClientHeight}px`
    } else {
      // html carries the content height (and so the page scrollbar): the
      // window's max scroll equals the content's by construction
      document.documentElement.style.height = `${this.lastScrollHeight}px`
    }
  }

  /**
   * The wrapper's position in content coordinates, the target. Shadow mode
   * subtracts what sits above the track: before it, the content scrolls
   * natively and the value goes negative, as during a rubber-band
   */
  private get wrapperPosition() {
    const { wrapper } = this.options
    return (
      (wrapper === window ? scrollY : (wrapper as HTMLElement).scrollTop) -
      this.offset
    )
  }

  private writeWrapper(value: number) {
    this.options.wrapper.scrollTo({
      top: value + this.offset,
      behavior: 'instant',
    })
  }

  /** Shadow mode: the track's top in the wrapper's scroll coordinates */
  private trackTop() {
    const { wrapper } = this.options
    const top = this.track!.getBoundingClientRect().top
    if (wrapper === window) return top + scrollY
    const element = wrapper as HTMLElement
    return (
      top -
      element.getBoundingClientRect().top -
      element.clientTop +
      element.scrollTop
    )
  }

  /**
   * Shadow mode: build track > content > slot in a shadow root on `host`.
   * Nothing on the site's elements is styled. Returns the content
   */
  private styleShadow(host: HTMLElement) {
    // read while the page is still plain, so the track starts as tall as the
    // document and no layout clamps a restored scroll position (see the html
    // height note in the window path)
    const initialHeight = host.scrollHeight

    let root = host.shadowRoot
    if (root && !ownRoots.has(root)) {
      throw new Error('lenis/sync: the wrapper already has a shadow root')
    }
    // throws NotSupportedError for elements that can't host one (ul, td…)
    root ??= host.attachShadow({ mode: 'open' })
    ownRoots.add(root)

    const isWindow = host === document.body
    root.innerHTML = `<style>${shadowCSS}</style><div class="track" part="track"><div class="content" part="content"><div class="layout" part="layout"><slot></slot></div></div></div>`
    this.track = root.querySelector<HTMLElement>('.track')!
    const content = root.querySelector<HTMLElement>('.content')!
    this.track.style.height = `${initialHeight}px`
    if (isWindow) {
      content.style.height = '100dvh'
    } else {
      this.lastWrapperHeight = host.clientHeight
      content.style.height = `${this.lastWrapperHeight}px`
    }
    this.layout = content.firstElementChild as HTMLElement
    this.mirrorLayout()

    this.restoreStyles = () => {
      // can't detach a shadow root: a bare default slot renders the light
      // children exactly as without one
      root.innerHTML = '<slot></slot>'
      this.track = this.layout = undefined
    }
    return content
  }

  /**
   * Shadow mode: the layout box lays out the site's children, so it takes the
   * host's layout. Keywords only (computed values stay responsive-safe, this
   * reruns on resize); gap and grid tracks are inherited in CSS
   */
  private mirrorLayout = () => {
    const { layout, track } = this
    if (!layout || !track) return
    const host = track.getRootNode() as ShadowRoot
    const computed = getComputedStyle(host.host)
    for (const property of mirroredProperties) {
      layout.style.setProperty(property, computed.getPropertyValue(property))
    }
    // min-height (sticky footers): the host's, minus its own padding and
    // border when it is border-box, the layout box has neither
    let minHeight = Number.parseFloat(computed.minHeight) || 0
    if (computed.boxSizing === 'border-box') {
      minHeight -=
        Number.parseFloat(computed.paddingTop) +
        Number.parseFloat(computed.paddingBottom) +
        Number.parseFloat(computed.borderTopWidth) +
        Number.parseFloat(computed.borderBottomWidth)
    }
    layout.style.minHeight = minHeight > 0 ? `${minHeight}px` : ''
  }

  /** body as the content: a pinned viewport-high box, html owns the page scroll */
  private styleBody() {
    const html = document.documentElement.style
    const body = document.body.style
    const previous = {
      htmlOverflow: html.overflow,
      position: body.position,
      top: body.top,
      height: body.height,
      overflow: body.overflow,
    }
    // html must own a non-visible overflow, otherwise body's `hidden` would
    // propagate to the viewport and kill the page scroll
    html.overflow = 'auto'
    // sticky, not fixed: a fixed box ends the browser's scroll-into-view walk
    // (find-in-page, focus) before it reaches the root; a sticky one lets the
    // window scroll, and the mirror turns that into the body revealing it
    body.position = 'sticky'
    body.top = '0'
    body.height = '100dvh'
    body.overflow = 'hidden'
    this.restoreStyles = () => {
      html.overflow = previous.htmlOverflow
      body.position = previous.position
      body.top = previous.top
      body.height = previous.height
      body.overflow = previous.overflow
    }
  }

  /** An element wrapper: pin its content, add the range with a spacer */
  private styleContent(content: HTMLElement, wrapper: HTMLElement) {
    const style = content.style
    const previous = {
      position: style.position,
      top: style.top,
      height: style.height,
      overflow: style.overflow,
    }
    style.position = 'sticky'
    style.top = '0'
    style.height = '100%' // one viewport of the wrapper, whatever its size
    style.overflow = 'hidden'
    this.spacer = document.createElement('div')
    wrapper.append(this.spacer)
    this.restoreStyles = () => {
      Object.assign(style, previous)
      this.spacer?.remove()
    }
  }

  private onWrapperScroll = () => {
    // not clamped: the offset goes past the range during a rubber-band
    // (iOS, Safari) and `scroll` carries it, as core's native path does. The
    // content write clamps itself; a fixed canvas is not bounced by the
    // browser, so it needs the excess to follow the content
    const target = this.wrapperPosition
    if (target === this.y.rawTargetScroll) return // echo of our own wrapper write

    // verbatim: mirror the wrapper in this same frame. Rotate the history
    // slot first so velocity and direction derive, as core's native path does
    this.y.rawLastScroll = this.y.rawScroll
    this.y.rawScroll = this.y.rawTargetScroll = target
    this.y.setScroll(target)
    this.moved = true
    this.emit()
  }

  /** Shadow mode: html or body attributes changed (scroll lock, theme…) */
  private onHostChange = () => {
    this.mirrorLayout()
    const offset = this.trackTop()
    if (offset === this.offset) return
    this.offset = offset
    this.onWrapperScroll()
  }

  private onContentScroll = () => {
    const actual = this.y.actualScroll
    // our own write, clamped by the browser during a rubber-band
    if (Math.abs(actual - clamp(0, this.y.rawScroll, this.limit)) < 1) return

    // the browser moved the content itself (focus, anchor, scrollIntoView,
    // scroll anchoring): adopt it and bring the wrapper along
    this.teleport(actual)
    this.writeWrapper(actual)
    this.emit()
  }

  /** Jump the axis to `value` with zero velocity and write it to the content */
  private teleport(value: number) {
    this.y.rawScroll = this.y.rawTargetScroll = this.y.rawLastScroll = value
    this.y.setScroll(value)
  }
}

/** Shadow roots sync created, safe to reuse after a `destroy` */
const ownRoots = new WeakSet<ShadowRoot>()

/** Host layout keywords the layout box copies (see `mirrorLayout`) */
const mirroredProperties = [
  'display',
  'flex-direction',
  'flex-wrap',
  'align-items',
  'align-content',
  'justify-content',
  'justify-items',
]

const shadowCSS = `
.track {
  display: block;
  position: relative;
  box-sizing: content-box;
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 0;
  /* a single item of whatever layout the host has */
  flex: none;
  align-self: stretch;
  justify-self: stretch;
  grid-column: 1 / -1;
  /* no effect on a block box, passed through to the content */
  gap: inherit;
  grid-template: inherit;
  grid-auto-flow: inherit;
  grid-auto-rows: inherit;
  grid-auto-columns: inherit;
}
.content {
  display: block;
  position: sticky;
  top: 0;
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;
  gap: inherit;
  grid-template: inherit;
  grid-auto-flow: inherit;
  grid-auto-rows: inherit;
  grid-auto-columns: inherit;
}
.layout {
  gap: inherit;
  grid-template: inherit;
  grid-auto-flow: inherit;
  grid-auto-rows: inherit;
  grid-auto-columns: inherit;
}
`
