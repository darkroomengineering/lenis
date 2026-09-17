import { Axis, type AxisHost } from '../../core/src/axis'
import { clamp } from '../../core/src/maths'
import { ScrollingBox } from '../../core/src/scrolling-box'
import type { DimensionsOptions } from '../../core/src/types'
import { Emitter } from '../../utils/emitter'

// How it works (ScrollSmoother-style, see SMOOTH-WRAPPER.md):
// - the window scrolls natively. Body height mirrors the content and nothing
//   is intercepted, so wheel, touch, keyboard, scrollbar, iframes and every
//   platform gesture stay the browser's
// - the wrapper is what the user sees. By default it is <body>, which sync
//   makes a pinned 100dvh box itself (position: sticky; top: 0; overflow:
//   hidden — sticky rather than fixed so the browser's scroll-into-view walk,
//   find-in-page included, can continue past it to the root), while <html>
//   gets the content height and keeps the page scrollbar. No markup needed.
//   The wrapper is written to the scroller's position in the same frame as
//   the scroll event, verbatim. Invariant: wrapper position == scroller position
// - a wrapper scroll Lenis didn't write (focus, anchor, scrollIntoView, scroll
//   anchoring) is adopted, and the window is brought along
// - nested: any overflow: auto element can be the native scroller instead of
//   the window. Its child is the wrapper: sync pins it (sticky, height 100%
//   of the scroller) and appends a spacer that gives the scroller the
//   content's range, the way html's height does for the page. Two elements,
//   one option, no CSS

export type LenisSyncOptions = {
  /**
   * The native scroller that owns the input and the target: `window` for the
   * page, or an `overflow: auto` element for a nested panel.
   * @default window
   */
  scroller?: Window | HTMLElement
  /**
   * The element sync scrolls, what the user sees: the scroller's child. Sync
   * pins it itself (`position: sticky`, `overflow: hidden`, one viewport of
   * the scroller high) and gives the scroller the content's range, through
   * `html`'s height for the page or a spacer it appends for a panel.
   * @default body for the window, the scroller's first element child otherwise
   */
  wrapper?: HTMLElement | Element
  /**
   * Optional element whose size drives the content height through a
   * ResizeObserver. Without it the wrapper's `scrollHeight` is checked once
   * per frame.
   */
  content?: HTMLElement | Element
  /** Run the animation loop internally; pass `false` to drive it with `raf(time)` @default true */
  autoRaf?: boolean
  dimensions?: DimensionsOptions
}

export type LenisSyncScrollToOptions = {
  offset?: number
}

export class LenisSync implements AxisHost {
  readonly options: {
    wrapper: HTMLElement | Element
    scroller: Window | HTMLElement
    content?: HTMLElement | Element
    infinite: false
    autoRaf: boolean
    dimensions?: DimensionsOptions
  }
  readonly scrollingBox: ScrollingBox
  /** The vertical scroll axis (the only one, for now) */
  readonly y: Axis
  private readonly emitter = new Emitter()
  private readonly abortController = new AbortController()
  private rafId = 0
  /** A scroll event moved the wrapper this frame (velocity settles on idle frames) */
  private moved = false
  /** Undoes the inline styles applied to the wrapper (and html for body) */
  private restoreStyles?: () => void
  /** Nested only: the sibling that gives the scroller the content's range */
  private spacer?: HTMLElement
  private lastClientHeight = 0
  /** Last scrollable extent written to html (content-less change detection) */
  private lastScrollHeight = 0

  constructor({
    scroller = window,
    wrapper = scroller === window
      ? document.body
      : ((scroller as HTMLElement).firstElementChild as HTMLElement),
    content,
    autoRaf = true,
    // no content element to observe: read the extent fresh on every access,
    // so `limit` never lags a content change
    dimensions = content ? undefined : { debounce: 0 },
  }: LenisSyncOptions = {}) {
    if (wrapper === document.body) {
      // html gets the content height first, while body is still in flow, so
      // no layout ever sees a 100dvh document and clamps the window to 0.
      // Scroll restoration already ran on the plain page and survives this;
      // the first raf mirrors it (see the watchdog in `raf`).
      document.documentElement.style.height = `${document.body.scrollHeight}px`
      this.styleBody()
    } else {
      if (!wrapper)
        throw new Error('lenis/sync: the scroller has no child to pin')
      this.styleWrapper(wrapper as HTMLElement, scroller as HTMLElement)
    }

    this.options = {
      wrapper,
      scroller,
      content,
      infinite: false,
      autoRaf,
      dimensions,
    }
    this.scrollingBox = new ScrollingBox(wrapper, content, dimensions)
    this.scrollingBox.on('resize', this.onResize)
    this.onResize()

    this.y = new Axis('y', this)

    const { signal } = this.abortController
    scroller.addEventListener('scroll', this.onScrollerScroll, { signal })
    wrapper.addEventListener('scroll', this.onWrapperScroll, { signal })

    if (autoRaf) this.rafId = requestAnimationFrame(this.raf)
  }

  destroy() {
    this.abortController.abort()
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
    // ponytail: without a content element there is nothing to observe, so
    // poll the scrollable extent once per frame (a layout read only when
    // dirty). Compared against our own last value: the dimensions cache is
    // refreshed silently by every `limit` read, so it can't be the reference.
    if (
      !this.options.content &&
      (this.options.wrapper.scrollHeight !== this.lastScrollHeight ||
        this.options.wrapper.clientHeight !== this.lastClientHeight)
    ) {
      this.resize()
    }

    // restoration can land after boot without a scroll event: catch any
    // silent scroller change (reading the offset is not a layout read)
    if (this.scrollerPosition !== this.y.rawTargetScroll)
      this.onScrollerScroll()

    // velocity: scroll events fire before raf, so a frame without one means
    // the scroller stopped — settle the history slot and say so once
    if (this.moved) {
      this.moved = false
    } else if (this.y.rawLastScroll !== this.y.rawScroll) {
      this.y.rawLastScroll = this.y.rawScroll
      this.emit()
    }

    if (this.options.autoRaf) this.rafId = requestAnimationFrame(this.raf)
  }

  /** Force a dimensions recalculation (also resizes the body) */
  resize() {
    this.scrollingBox.resize()
  }

  // ─── scrollTo ───

  /**
   * Jump to a number, `'top'` / `'bottom'`, a CSS selector, an element, or
   * `{ y }`. Scroller and wrapper move together, at once: sync never animates.
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
    this.writeScroller(value)
    this.teleport(value)
    this.emit()
  }

  private elementTop(element: Element | null) {
    // viewport coords relative to the pinned wrapper, plus its scroll offset
    return element
      ? element.getBoundingClientRect().top -
          this.options.wrapper.getBoundingClientRect().top +
          this.y.actualScroll
      : undefined
  }

  // ─── getters ───

  /** Smoothed scroll value (the wrapper's position) */
  get scroll() {
    return this.y.scroll
  }

  /** Where the scroll is heading (the window's position) */
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

  get rootElement() {
    return this.options.wrapper as HTMLElement
  }

  // ─── internals ───

  private onResize = () => {
    // html carries the content height (and so the page scrollbar): the
    // window's max scroll equals the wrapper's by construction
    this.lastScrollHeight = this.scrollingBox.scrollHeight!
    this.lastClientHeight = this.scrollingBox.height!
    if (this.spacer) {
      // the scroller's range: the content minus the one viewport that is pinned
      this.spacer.style.height = `${this.lastScrollHeight - this.lastClientHeight}px`
    } else {
      document.documentElement.style.height = `${this.lastScrollHeight}px`
    }
  }

  /** A nested panel: pin the wrapper inside its scroller, add the range with a spacer */
  private styleWrapper(wrapper: HTMLElement, scroller: HTMLElement) {
    const style = wrapper.style
    const previous = {
      position: style.position,
      top: style.top,
      height: style.height,
      overflow: style.overflow,
    }
    style.position = 'sticky'
    style.top = '0'
    style.height = '100%' // one viewport of the scroller, whatever its size
    style.overflow = 'hidden'
    this.spacer = document.createElement('div')
    scroller.append(this.spacer)
    this.restoreStyles = () => {
      Object.assign(style, previous)
      this.spacer?.remove()
    }
  }

  /** The native scroller's position, the target */
  private get scrollerPosition() {
    const { scroller } = this.options
    return scroller === window ? scrollY : (scroller as HTMLElement).scrollTop
  }

  private writeScroller(value: number) {
    this.options.scroller.scrollTo({ top: value, behavior: 'instant' })
  }

  /** body as the wrapper: a pinned viewport-high box, html owns the page scroll */
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

  private onScrollerScroll = () => {
    // the offset goes negative during iOS rubber-band
    const target = clamp(0, this.scrollerPosition, this.limit)
    if (target === this.y.rawTargetScroll) return // echo of our own scroller write

    // verbatim: mirror the scroller in this same frame. Rotate the history
    // slot first so velocity and direction derive, as core's native path does
    this.y.rawLastScroll = this.y.rawScroll
    this.y.rawScroll = this.y.rawTargetScroll = target
    this.y.setScroll(target)
    this.moved = true
    this.emit()
  }

  private onWrapperScroll = () => {
    const actual = this.y.actualScroll
    if (Math.abs(actual - this.y.rawScroll) < 1) return // our own write

    // the browser moved the wrapper itself (focus, anchor, scrollIntoView,
    // scroll anchoring): adopt it and bring the window along
    this.teleport(actual)
    this.writeScroller(actual)
    this.emit()
  }

  /** Jump the axis to `value` with zero velocity and write it to the wrapper */
  private teleport(value: number) {
    this.y.rawScroll = this.y.rawTargetScroll = this.y.rawLastScroll = value
    this.y.setScroll(value)
  }
}
