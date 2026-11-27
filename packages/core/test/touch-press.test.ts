import { afterEach, beforeEach, expect, test } from 'vite-plus/test'

import Lenis from '../index'

// A smooth touch scroll prevents the native pan, so the browser never fires
// the `pointercancel` that ends a press. Taps built on pointer events (Motion's
// `onTap`, which Framer uses for links on iOS) then fired at the end of a
// swipe (#500). Lenis fires the `pointercancel` itself.

let lenis: Lenis | undefined
let content: HTMLElement
let cancels: PointerEvent[]

const onCancel = (event: PointerEvent) => cancels.push(event)

beforeEach(() => {
  content = document.createElement('div')
  content.style.height = '5000px'
  document.body.style.margin = '0'
  document.body.append(content)
  window.scrollTo(0, 0)

  cancels = []
  window.addEventListener('pointercancel', onCancel)
})

afterEach(() => {
  window.removeEventListener('pointercancel', onCancel)
  lenis?.destroy()
  lenis = undefined
  content.remove()
})

// Desktop Firefox and WebKit have no Touch constructor, so this builds a plain
// event with the touch lists Lenis reads
function touch(type: string, y: number) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  const point = { clientX: 100, clientY: y }
  const touches = type === 'touchend' ? [] : [point]
  Object.defineProperties(event, {
    touches: { value: touches },
    targetTouches: { value: touches },
    changedTouches: { value: [point] },
  })
  content.dispatchEvent(event)
}

function swipe(...ys: number[]) {
  touch('touchstart', ys[0]!)
  for (const y of ys.slice(1)) touch('touchmove', y)
  touch('touchend', ys.at(-1)!)
}

test('a smooth touch scroll cancels the press, once per touch', () => {
  lenis = new Lenis({ syncTouch: true })

  swipe(300, 280, 240, 200)

  expect(cancels).toHaveLength(1)
  expect(cancels[0]!.target).toBe(content)
  expect(cancels[0]!.isPrimary).toBe(true)

  swipe(300, 240)

  expect(cancels).toHaveLength(2)
})

test('a finger that barely moves keeps its press', () => {
  lenis = new Lenis({ syncTouch: true })

  swipe(300, 296)

  expect(cancels).toHaveLength(0)
})

test('a native touch scroll is left to the browser', () => {
  lenis = new Lenis()

  swipe(300, 240)

  expect(cancels).toHaveLength(0)
})
