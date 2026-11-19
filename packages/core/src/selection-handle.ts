const HANDLE_RADIUS = 40 // px — handles are large, finger-sized touch targets

/**
 * iOS renders text-selection handles at the start and end points of the
 * selection. A touch starting within a handle-sized radius of either point is
 * the user grabbing a handle, not scrolling.
 */
export function isTouchOnSelectionHandle(event: TouchEvent) {
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed || selection.rangeCount === 0)
    return false

  const touch = event.targetTouches[0] ?? event.changedTouches[0]
  if (!touch) return false

  const rects = selection.getRangeAt(0).getClientRects()
  if (rects.length === 0) return false

  const first = rects[0]!
  const last = rects[rects.length - 1]!

  const nearStart =
    Math.hypot(touch.clientX - first.left, touch.clientY - first.top) <=
    HANDLE_RADIUS
  const nearEnd =
    Math.hypot(touch.clientX - last.right, touch.clientY - last.bottom) <=
    HANDLE_RADIUS

  return nearStart || nearEnd
}
