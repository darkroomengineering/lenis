import { afterEach, beforeEach, expect, test } from 'vite-plus/test'

import Lenis from '../index'

// `scrollTo(target, { lock: true })` holds back the gestures Lenis smooths.
// Native touch (`syncTouch: false`) is not one of them: a pan that has started
// can't be cancelled, so it interrupts the scroll instead of fighting it (#315)

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

function wheel(deltaY: number) {
  const event = new WheelEvent('wheel', {
    deltaY,
    bubbles: true,
    cancelable: true,
    composed: true,
  })
  content.dispatchEvent(event)

  return event
}

test('a native pan interrupts a locked scrollTo and frees the lock', async () => {
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

test('a native touch that starts during a locked scrollTo is let through', async () => {
  lenis = new Lenis({ autoRaf: true })

  lenis.scrollTo(3000, { lock: true, duration: 1 })
  await expect.poll(() => window.scrollY).toBeGreaterThan(100)

  touch('touchstart', 300)
  expect(lenis.isLocked).toBe(true) // a finger that rests does not interrupt

  const move = touch('touchmove', 280)

  expect(move.defaultPrevented).toBe(false)
  expect(lenis.isLocked).toBe(false)

  const interruptedAt = window.scrollY
  await wait(200)
  expect(window.scrollY).toBe(interruptedAt)
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

test('a locked scrollTo swallows the smoothed wheel', async () => {
  lenis = new Lenis({ autoRaf: true })

  lenis.scrollTo(3000, { lock: true, duration: 0.3 })

  const event = wheel(-500)

  expect(event.defaultPrevented).toBe(true)
  expect(lenis.isLocked).toBe(true)

  await expect.poll(() => lenis!.isLocked).toBe(false)
  expect(window.scrollY).toBe(3000)
})

test('with smoothWheel off, the wheel interrupts a locked scrollTo', async () => {
  lenis = new Lenis({ autoRaf: true, smoothWheel: false })

  lenis.scrollTo(3000, { lock: true, duration: 1 })
  await expect.poll(() => window.scrollY).toBeGreaterThan(100)

  const event = wheel(100)

  expect(event.defaultPrevented).toBe(false)
  expect(lenis.isLocked).toBe(false)

  const interruptedAt = window.scrollY
  await wait(200)
  expect(window.scrollY).toBe(interruptedAt)
})
