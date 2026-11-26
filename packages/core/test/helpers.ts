import { userEvent } from 'vite-plus/test/browser'

type WheelDelta = { x: number; y?: number } | { x?: number; y: number }

/**
 * Wheel over an element and wait until the page has handled the event.
 *
 * `userEvent.wheel` resolves once Playwright has sent the wheel, which can be
 * before the browser dispatches it to the page. An assertion made right after
 * it could then run before Lenis saw the event.
 */
export async function wheel(element: Element, delta: WheelDelta) {
  const handled = new Promise<void>((resolve) => {
    window.addEventListener(
      'wheel',
      // a task, so every listener of this event has run by the time it resolves
      () => setTimeout(resolve),
      { once: true, capture: true, passive: true }
    )
  })

  await userEvent.wheel(element, { delta })
  await handled
}
