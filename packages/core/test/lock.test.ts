import { afterEach, beforeEach, expect, test } from 'vite-plus/test'

import Lenis from '../index'

// A native touch pan that has already started can't be cancelled: its
// touchmove events are not cancelable. A locked `scrollTo` waits for the finger
// to lift instead of animating against it (#315)

let lenis: Lenis | undefined
let content: HTMLElement

beforeEach(() => {
  content = document.createElement('div')
  content.style.height = '5000px'
  document.body.style.margin = '0'
  document.body.append(content)
  window.scrollTo(0, 0)
})

afterEach(() => {
  lenis?.destroy()
  lenis = undefined
  content.remove()
})

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Not `new TouchEvent()`: desktop Firefox and WebKit don't expose it
function touch(
  type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel',
  clientY: number,
  { cancelable = true } = {}
) {
  const event = new Event(type, { bubbles: true, cancelable, composed: true })
  const touches =
    type === 'touchend' || type === 'touchcancel'
      ? []
      : [{ clientX: 100, clientY }]

  Object.defineProperties(event, {
    touches: { value: touches },
    targetTouches: { value: touches },
    changedTouches: { value: [{ clientX: 100, clientY }] },
  })
  content.dispatchEvent(event)

  return event
}

// What the browser does while a finger pans the page: touchmove events that
// can't be cancelled, and the page under the finger
function nativePan(clientY: number, scroll: number) {
  touch('touchmove', clientY, { cancelable: false })
  window.scrollTo(0, scroll)
}

test('a locked scrollTo waits for a native pan to end', async () => {
  lenis = new Lenis({ autoRaf: true })

  touch('touchstart', 300)
  touch('touchmove', 295)
  nativePan(280, 20)

  let completed = false
  lenis.scrollTo(3000, {
    lock: true,
    duration: 0.3,
    onComplete: () => {
      completed = true
    },
  })

  nativePan(260, 40)
  await wait(100)
  nativePan(240, 60)
  await wait(100)

  // the page stayed under the finger, and Lenis followed it
  expect(window.scrollY).toBe(60)
  expect(lenis.scroll).toBe(60)
  expect(lenis.isLocked).toBe(true)
  expect(completed).toBe(false)

  touch('touchend', 240)

  await expect.poll(() => completed).toBe(true)
  expect(window.scrollY).toBe(3000)
  expect(lenis.isLocked).toBe(false)
})

test('a locked scrollTo holds when the pan shows up after it started', async () => {
  lenis = new Lenis({ autoRaf: true })

  lenis.scrollTo(3000, { lock: true, duration: 1 })
  await expect.poll(() => window.scrollY).toBeGreaterThan(100)

  nativePan(280, 50)
  await wait(100)
  nativePan(260, 70)
  await wait(100)

  expect(window.scrollY).toBe(70)
  expect(lenis.isLocked).toBe(true)

  touch('touchend', 260)

  await expect.poll(() => lenis!.isLocked, { timeout: 3000 }).toBe(false)
  expect(window.scrollY).toBe(3000)
})

test('a touch that starts during a lock is prevented, without holding', async () => {
  lenis = new Lenis({ autoRaf: true })

  lenis.scrollTo(3000, { lock: true, duration: 0.3 })

  touch('touchstart', 300)
  const move = touch('touchmove', 280)

  expect(move.defaultPrevented).toBe(true)
  // no touchend: the scroll does not wait for this finger
  await expect.poll(() => lenis!.isLocked).toBe(false)
  expect(window.scrollY).toBe(3000)
})

test('reset() during the hold frees the next scrollTo', async () => {
  lenis = new Lenis({ autoRaf: true })

  touch('touchstart', 300)
  touch('touchmove', 295)
  nativePan(280, 20)
  lenis.scrollTo(3000, { lock: true, duration: 0.3 })
  nativePan(260, 40)

  lenis.reset()
  expect(lenis.isLocked).toBe(false)

  lenis.scrollTo(1000, { duration: 0.2 })
  await expect.poll(() => window.scrollY).toBe(1000)
})

test('the hold ends on touchcancel too', async () => {
  lenis = new Lenis({ autoRaf: true })

  touch('touchstart', 300)
  touch('touchmove', 295)
  nativePan(280, 20)
  lenis.scrollTo(3000, { lock: true, duration: 0.3 })
  nativePan(260, 40)
  await wait(100)
  expect(lenis.isLocked).toBe(true)

  // the system took the touch over (a notification, an edge swipe)
  touch('touchcancel', 260)

  await expect.poll(() => lenis!.isLocked).toBe(false)
  expect(window.scrollY).toBe(3000)
})

test('a pan whose end was missed does not hold the next locked scrollTo', async () => {
  lenis = new Lenis({ autoRaf: true })

  touch('touchstart', 300)
  touch('touchmove', 295)
  nativePan(280, 20)
  // no touchend: the element under the finger left the DOM

  touch('touchstart', 300)
  lenis.scrollTo(3000, { lock: true, duration: 0.3 })

  await expect.poll(() => lenis!.isLocked).toBe(false)
  expect(window.scrollY).toBe(3000)
})
