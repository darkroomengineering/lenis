export function isScrollableElement(
  node: HTMLElement,
  { deltaX, deltaY }: { deltaX: number; deltaY: number }
): boolean {
  const time = Date.now()

  // @ts-expect-error - _lenis is a custom cache property
  if (!node._lenis) node._lenis = {}
  // @ts-expect-error
  const cache = node._lenis

  let hasOverflowX: boolean | undefined
  let hasOverflowY: boolean | undefined
  let isScrollableX: boolean | undefined
  let isScrollableY: boolean | undefined
  let hasOverscrollBehaviorX: boolean | undefined
  let hasOverscrollBehaviorY: boolean | undefined
  let scrollWidth: number
  let scrollHeight: number
  let clientWidth: number
  let clientHeight: number

  if (time - (cache.time ?? 0) > 2000) {
    cache.time = Date.now()

    const computedStyle = window.getComputedStyle(node)
    cache.computedStyle = computedStyle

    hasOverflowX = ['auto', 'overlay', 'scroll'].includes(
      computedStyle.overflowX
    )
    hasOverflowY = ['auto', 'overlay', 'scroll'].includes(
      computedStyle.overflowY
    )

    hasOverscrollBehaviorX = ['auto'].includes(
      computedStyle.overscrollBehaviorX
    )
    hasOverscrollBehaviorY = ['auto'].includes(
      computedStyle.overscrollBehaviorY
    )

    cache.hasOverflowX = hasOverflowX
    cache.hasOverflowY = hasOverflowY

    if (!(hasOverflowX || hasOverflowY)) return false // if no overflow, it's not scrollable no matter what, early return saves some computations

    scrollWidth = node.scrollWidth
    scrollHeight = node.scrollHeight

    clientWidth = node.clientWidth
    clientHeight = node.clientHeight

    isScrollableX = scrollWidth > clientWidth
    isScrollableY = scrollHeight > clientHeight

    cache.isScrollableX = isScrollableX
    cache.isScrollableY = isScrollableY
    cache.scrollWidth = scrollWidth
    cache.scrollHeight = scrollHeight
    cache.clientWidth = clientWidth
    cache.clientHeight = clientHeight
    cache.hasOverscrollBehaviorX = hasOverscrollBehaviorX
    cache.hasOverscrollBehaviorY = hasOverscrollBehaviorY
  } else {
    isScrollableX = cache.isScrollableX
    isScrollableY = cache.isScrollableY
    hasOverflowX = cache.hasOverflowX
    hasOverflowY = cache.hasOverflowY
    scrollWidth = cache.scrollWidth
    scrollHeight = cache.scrollHeight
    clientWidth = cache.clientWidth
    clientHeight = cache.clientHeight
    hasOverscrollBehaviorX = cache.hasOverscrollBehaviorX
    hasOverscrollBehaviorY = cache.hasOverscrollBehaviorY
  }

  if (!((hasOverflowX && isScrollableX) || (hasOverflowY && isScrollableY))) {
    return false
  }

  const orientation =
    Math.abs(deltaX) >= Math.abs(deltaY) ? 'horizontal' : 'vertical'

  let scroll: number | undefined
  let maxScroll: number | undefined
  let delta: number | undefined
  let hasOverflow: boolean | undefined
  let isScrollable: boolean | undefined
  let hasOverscrollBehavior: boolean | undefined

  if (orientation === 'horizontal') {
    scroll = Math.round(node.scrollLeft)
    maxScroll = scrollWidth - clientWidth
    delta = deltaX

    hasOverflow = hasOverflowX
    isScrollable = isScrollableX
    hasOverscrollBehavior = hasOverscrollBehaviorX
  } else if (orientation === 'vertical') {
    scroll = Math.round(node.scrollTop)
    maxScroll = scrollHeight - clientHeight
    delta = deltaY

    hasOverflow = hasOverflowY
    isScrollable = isScrollableY
    hasOverscrollBehavior = hasOverscrollBehaviorY
  } else {
    return false
  }

  if (!hasOverscrollBehavior && (scroll >= maxScroll || scroll <= 0)) {
    return true
  }

  const willScroll = delta > 0 ? scroll < maxScroll : scroll > 0

  return Boolean(willScroll && hasOverflow && isScrollable)
}
