import type { Lenis } from './lenis'

/**
 * Turn a `scrollTo` target into a scroll position in pixels
 *
 * @returns `undefined` when the target is not found
 */
export function resolveScrollTarget(
  lenis: Lenis,
  target: number | string | Element,
  offset: number
) {
  // keywords
  if (
    typeof target === 'string' &&
    ['top', 'left', 'start', '#'].includes(target)
  ) {
    target = 0
  } else if (
    typeof target === 'string' &&
    ['bottom', 'right', 'end'].includes(target)
  ) {
    target = lenis.limit
  } else {
    let node: Element | null = null

    if (typeof target === 'string') {
      // getElementById accepts any valid HTML id (e.g. `#footnote-†`),
      // querySelector would reject it as an invalid CSS selector
      node = target.startsWith('#')
        ? document.getElementById(target.slice(1))
        : document.querySelector(target)

      if (!node) {
        if (target === '#top') {
          target = 0
        } else {
          console.warn('Lenis: Target not found', target)
        }
      }
    } else if (target instanceof Element) {
      // Node element
      node = target
    }

    if (node) {
      if (lenis.options.wrapper !== window) {
        // nested scroll offset correction
        const wrapperRect = lenis.rootElement.getBoundingClientRect()
        offset -= lenis.isHorizontal ? wrapperRect.left : wrapperRect.top
      }

      const rect = node.getBoundingClientRect()

      // Account for scroll-margin CSS property on the target element
      const targetStyle = getComputedStyle(node)
      const scrollMargin = lenis.isHorizontal
        ? Number.parseFloat(targetStyle.scrollMarginLeft)
        : Number.parseFloat(targetStyle.scrollMarginTop)

      // Account for scroll-padding CSS property on the scroll container
      const containerStyle = getComputedStyle(lenis.rootElement)
      const scrollPadding = lenis.isHorizontal
        ? Number.parseFloat(containerStyle.scrollPaddingLeft)
        : Number.parseFloat(containerStyle.scrollPaddingTop)

      target =
        (lenis.isHorizontal ? rect.left : rect.top) +
        lenis.animatedScroll -
        (Number.isNaN(scrollMargin) ? 0 : scrollMargin) -
        (Number.isNaN(scrollPadding) ? 0 : scrollPadding)
    }
  }

  if (typeof target !== 'number') return

  return target + offset
}
