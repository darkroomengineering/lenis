import type { Lenis } from './lenis'
import { hasNestedScroll } from './nested-scroll'
import type { VirtualScrollData } from './types'

/**
 * Check if an element between the event target and the Lenis root keeps the
 * gesture for itself
 */
export function isGesturePrevented(
  lenis: Lenis,
  { deltaX, deltaY, event }: VirtualScrollData
) {
  const { prevent, allowNestedScroll } = lenis.options
  const isTouch = event.type.includes('touch')
  const isWheel = event.type.includes('wheel')
  const isHorizontal = Math.abs(deltaX) >= Math.abs(deltaY)

  const path = event.composedPath()

  return path
    .slice(0, path.indexOf(lenis.rootElement)) // remove parents elements
    .some(
      (node) =>
        node instanceof HTMLElement &&
        ((typeof prevent === 'function' && prevent(node)) ||
          node.hasAttribute('data-lenis-prevent') ||
          (!isHorizontal && node.hasAttribute('data-lenis-prevent-vertical')) ||
          (isHorizontal &&
            node.hasAttribute('data-lenis-prevent-horizontal')) ||
          (isTouch && node.hasAttribute('data-lenis-prevent-touch')) ||
          (isWheel && node.hasAttribute('data-lenis-prevent-wheel')) ||
          (allowNestedScroll && hasNestedScroll(node, { deltaX, deltaY })))
    )
}
