type Axis = {
  /** `overflow` lets the element scroll and its content is larger than its box */
  canScroll: boolean
  /** `overscroll-behavior` is `auto`, so the scroll chains to the parent at the edges */
  chains: boolean
  maxScroll: number
}

type Measure = { time: number; x: Axis; y: Axis }

// getComputedStyle and the size reads force a layout, so keep them for 2s
const CACHE_DURATION = 2000
const cache = new WeakMap<HTMLElement, Measure>()

const SCROLLABLE_OVERFLOW = ['auto', 'overlay', 'scroll']

function measure(node: HTMLElement): Measure {
  const style = getComputedStyle(node)
  const hasOverflowX = SCROLLABLE_OVERFLOW.includes(style.overflowX)
  const hasOverflowY = SCROLLABLE_OVERFLOW.includes(style.overflowY)
  // without overflow the element cannot scroll, skip the size reads
  const hasOverflow = hasOverflowX || hasOverflowY
  const maxScrollX = hasOverflow ? node.scrollWidth - node.clientWidth : 0
  const maxScrollY = hasOverflow ? node.scrollHeight - node.clientHeight : 0

  return {
    time: Date.now(),
    x: {
      canScroll: hasOverflowX && maxScrollX > 0,
      chains: style.overscrollBehaviorX === 'auto',
      maxScroll: maxScrollX,
    },
    y: {
      canScroll: hasOverflowY && maxScrollY > 0,
      chains: style.overscrollBehaviorY === 'auto',
      maxScroll: maxScrollY,
    },
  }
}

/**
 * Check if an element keeps a wheel or touch gesture for its own scroll
 */
export function hasNestedScroll(
  node: HTMLElement,
  { deltaX, deltaY }: { deltaX: number; deltaY: number }
) {
  let data = cache.get(node)

  if (!data || Date.now() - data.time > CACHE_DURATION) {
    data = measure(node)
    cache.set(node, data)
  }

  if (!(data.x.canScroll || data.y.canScroll)) return false

  const isHorizontal = Math.abs(deltaX) >= Math.abs(deltaY)
  const { canScroll, chains, maxScroll } = isHorizontal ? data.x : data.y
  const scroll = Math.round(isHorizontal ? node.scrollLeft : node.scrollTop)
  const delta = isHorizontal ? deltaX : deltaY

  if (!chains && (scroll >= maxScroll || scroll <= 0)) {
    return true
  }

  const willScroll = delta > 0 ? scroll < maxScroll : scroll > 0

  return willScroll && canScroll
}
