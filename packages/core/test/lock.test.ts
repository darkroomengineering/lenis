import { afterEach, beforeEach, expect, test } from 'vite-plus/test'

import Lenis from '../index'
import { wheel } from './helpers'

// `scrollTo(target, { lock: true })` prevents every gesture it can. A native
// touch pan that is already under way is the one it can't: its touchmove
// events are not cancelable. The lock yields to it instead of animating against
// the finger (#315)

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
  type: 'touchstart' | 'touchmove' | 'touchend',
  clientY: number,
  { cancelable = true } = {}
) {
  const event = new Event(type, { bubbles: true, cancelable, composed: true })
  const touches = type === 'touchend' ? [] : [{ clientX: 100, clientY }]

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

test('a locked scrollTo yields to a native pan already under way', async () => {
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
  expect(lenis.isLocked).toBe(true)

  nativePan(260, 40)
  expect(lenis.isLocked).toBe(false)

  await wait(100)
  nativePan(240, 60)
  await wait(400)

  // the page stayed under the finger
  expect(window.scrollY).toBe(60)
  expect(lenis.scroll).toBe(60)
  expect(completed).toBe(false)

  touch('touchend', 240)

  // nothing is left locked: the next scrollTo runs
  lenis.scrollTo(1000, { duration: 0.2 })
  await expect.poll(() => window.scrollY).toBe(1000)
})

test('a native touch that starts during a locked scrollTo is prevented', async () => {
  lenis = new Lenis({ autoRaf: true })

  lenis.scrollTo(3000, { lock: true, duration: 0.3 })

  touch('touchstart', 300)
  const move = touch('touchmove', 280)

  expect(move.defaultPrevented).toBe(true)
  expect(lenis.isLocked).toBe(true)

  await expect.poll(() => lenis!.isLocked).toBe(false)
  expect(window.scrollY).toBe(3000)
})

test('a touch release does not end the lock', async () => {
  lenis = new Lenis({ autoRaf: true })

  touch('touchstart', 300)
  touch('touchmove', 295)
  nativePan(280, 20)
  // the finger lifts, then the locked scrollTo starts
  touch('touchend', 280, { cancelable: false })

  lenis.scrollTo(3000, { lock: true, duration: 0.3 })
  touch('touchstart', 300)
  touch('touchend', 300, { cancelable: false })
  expect(lenis.isLocked).toBe(true)

  await expect.poll(() => lenis!.isLocked).toBe(false)
  expect(window.scrollY).toBe(3000)
})

test('with syncTouch, a locked scrollTo swallows the touch', async () => {
  lenis = new Lenis({ autoRaf: true, syncTouch: true })

  lenis.scrollTo(3000, { lock: true, duration: 0.3 })

  touch('touchstart', 300)
  const move = touch('touchmove', 280)

  expect(move.defaultPrevented).toBe(true)
  expect(lenis.isLocked).toBe(true)

  await expect.poll(() => lenis!.isLocked).toBe(false)
  expect(window.scrollY).toBe(3000)
})

// `lock()` / `unlock()`: the same gesture lock, held for as long as the caller
// needs it instead of the length of a scrollTo (#513)

test('lock() blocks gestures until unlock()', async () => {
  lenis = new Lenis({ autoRaf: true })

  lenis.lock()
  expect(lenis.isLocked).toBe(true)
  expect(document.documentElement.classList.contains('lenis-locked')).toBe(true)

  await wheel(content, { y: 300 })
  touch('touchstart', 300)
  const move = touch('touchmove', 280)
  await wait(300)

  expect(move.defaultPrevented).toBe(true)
  expect(window.scrollY).toBe(0)

  lenis.unlock()
  expect(lenis.isLocked).toBe(false)
  expect(document.documentElement.classList.contains('lenis-locked')).toBe(
    false
  )

  await wheel(content, { y: 300 })
  await expect.poll(() => window.scrollY, { timeout: 5000 }).toBe(300)
})

test('lock() holds when there is nothing to scroll to', () => {
  lenis = new Lenis({ autoRaf: true })

  // already at the top: this scrollTo completes at once, so its lock never
  // holds
  lenis.scrollTo(0, { lock: true })
  expect(lenis.isLocked).toBe(false)

  lenis.lock()
  lenis.scrollTo(0, { lock: true })
  expect(lenis.isLocked).toBe(true)
})

test('scrollTo runs while locked, and the lock outlives it', async () => {
  lenis = new Lenis({ autoRaf: true })
  lenis.lock()

  lenis.scrollTo(1000, { duration: 0.2 })
  await expect.poll(() => window.scrollY).toBe(1000)
  expect(lenis.isLocked).toBe(true)

  // also a scrollTo that takes the lock for itself
  lenis.scrollTo(0, { duration: 0.2, lock: true })
  await expect.poll(() => window.scrollY).toBe(0)
  await expect.poll(() => lenis!.isScrolling).toBe(false)
  expect(lenis.isLocked).toBe(true)
})

test('lock() during a locked scrollTo outlives it', async () => {
  lenis = new Lenis({ autoRaf: true })

  lenis.scrollTo(1000, { duration: 0.2, lock: true })
  lenis.lock()
  await expect.poll(() => window.scrollY).toBe(1000)
  await expect.poll(() => lenis!.isScrolling).toBe(false)
  expect(lenis.isLocked).toBe(true)
})

test('reset(), stop() and start() leave lock() alone', () => {
  lenis = new Lenis({ autoRaf: true })
  lenis.lock()

  lenis.reset()
  expect(lenis.isLocked).toBe(true)

  lenis.stop()
  lenis.start()
  expect(lenis.isLocked).toBe(true)
})

test('unlock() also ends the lock of a scrollTo', () => {
  lenis = new Lenis({ autoRaf: true })

  lenis.scrollTo(1000, { duration: 0.2, lock: true })
  lenis.unlock()
  expect(lenis.isLocked).toBe(false)
})

test('a locked scrollTo still ignores other scrollTo calls', async () => {
  lenis = new Lenis({ autoRaf: true })

  lenis.scrollTo(1000, { duration: 0.2, lock: true })
  lenis.scrollTo(2000, { duration: 0.2 })
  await expect.poll(() => lenis!.isLocked).toBe(false)
  expect(window.scrollY).toBe(1000)
})

test('a native pan already under way does not end lock()', () => {
  lenis = new Lenis({ autoRaf: true })

  touch('touchstart', 300)
  touch('touchmove', 295)
  nativePan(280, 20)

  lenis.lock()
  nativePan(260, 40)
  expect(lenis.isLocked).toBe(true)
})
