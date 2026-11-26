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

  constructor({
    wrapper = window,
    content,
    autoRaf = true,
    dimensions,
  }: LenisSyncOptions = {}) {
    if (wrapper === window) {
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
    // ponytail: nothing observes the content, so poll its extent once per
    // frame (a layout read only when dirty). Compared against our own last
    // value: the dimensions cache is refreshed silently by every `limit`
    // read, so it can't be the reference.
    const { content, dimensions } = this.options
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
    if (this.spacer) {
      // the wrapper's range: the content minus the one viewport that is pinned
      this.spacer.style.height = `${this.lastScrollHeight - this.lastClientHeight}px`
    } else {
      // html carries the content height (and so the page scrollbar): the
      // window's max scroll equals the content's by construction
      document.documentElement.style.height = `${this.lastScrollHeight}px`
    }
  }

  /** The wrapper's position, the target */
  private get wrapperPosition() {
    const { wrapper } = this.options
    return wrapper === window ? scrollY : (wrapper as HTMLElement).scrollTop
  }

  private writeWrapper(value: number) {
    this.options.wrapper.scrollTo({ top: value, behavior: 'instant' })
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
