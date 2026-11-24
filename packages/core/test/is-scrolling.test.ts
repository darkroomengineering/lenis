import { afterEach, beforeEach, expect, test } from 'vite-plus/test'

import Lenis from '../index'

// `isScrolling` must always come back to `false`, or `lenis-scrolling` stays on
// <html> and code waiting for the scroll to end waits forever (#550, #575)

const root = document.documentElement

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

function wheel(deltaY: number) {
  content.dispatchEvent(
    new WheelEvent('wheel', { deltaY, bubbles: true, cancelable: true })
  )
}

// Desktop Firefox and WebKit have no Touch constructor, so this builds a plain
// event with the touch lists Lenis reads
function touch(type: string, y: number) {
  const point = { identifier: 1, target: content, clientX: 100, clientY: y }
  const event = new Event(type, {
    bubbles: true,
    cancelable: true,
    composed: true,
  })
  const touches = type === 'touchend' ? [] : [point]
  Object.defineProperties(event, {
    touches: { value: touches },
    targetTouches: { value: touches },
    changedTouches: { value: [point] },
  })
  content.dispatchEvent(event)
}

test('a lerp scrollTo to a target on a .5 boundary completes', async () => {
  lenis = new Lenis({ autoRaf: true })
  let completed = false

  // approached from below, the damped value stops at 100.4999…
  lenis.scrollTo(100.5, { onComplete: () => (completed = true) })

  await expect.poll(() => completed, { timeout: 3000 }).toBe(true)
  expect(lenis.isScrolling).toBe(false)
  expect(root.classList.contains('lenis-scrolling')).toBe(false)
})

test('a lerp scrollTo to a fractional target still completes', async () => {
  lenis = new Lenis({ autoRaf: true })
  let completed = false

  lenis.scrollTo(100.4, { onComplete: () => (completed = true) })

  await expect.poll(() => completed, { timeout: 3000 }).toBe(true)
  expect(lenis.isScrolling).toBe(false)
})

test('a non-smoothed wheel that does not scroll the page ends', async () => {
  lenis = new Lenis({ autoRaf: true, smoothWheel: false })

  // already at the top, so the page does not move
  wheel(-100)
  expect(lenis.isScrolling).toBe('native')

  await expect.poll(() => lenis!.isScrolling, { timeout: 1000 }).toBe(false)
  expect(root.classList.contains('lenis-scrolling')).toBe(false)
})

test('a non-smoothed touch that does not scroll the page ends', async () => {
  // syncTouch is off by default, so touch scroll stays native
  lenis = new Lenis({ autoRaf: true })

  // pulling down at the top: the page does not move
  touch('touchstart', 100)
  touch('touchmove', 200)
  expect(lenis.isScrolling).toBe('native')
  touch('touchend', 200)

  await expect.poll(() => lenis!.isScrolling, { timeout: 1000 }).toBe(false)
  expect(root.classList.contains('lenis-scrolling')).toBe(false)
})

test('a native scroll event that does not move Lenis ends', async () => {
  lenis = new Lenis({ autoRaf: true })

  // a router scrolls the page and syncs Lenis before the scroll event fires,
  // so the event comes with no velocity
  window.scrollTo(0, 300)
  lenis.resize()

  await expect.poll(() => lenis!.isScrolling).toBe('native')
  await expect.poll(() => lenis!.isScrolling, { timeout: 1000 }).toBe(false)
  expect(root.classList.contains('lenis-scrolling')).toBe(false)
})

test('a non-smoothed gesture does not end a smooth scroll started after it', async () => {
  lenis = new Lenis({ autoRaf: true, smoothWheel: false })
  const states: (string | boolean)[] = []
  lenis.on('scroll', () => states.push(lenis!.isScrolling))

  // Lenis clears the settle timer on any native scroll event. Hide them, as
  // when the animation moves less than a pixel per frame, so the timer runs
  const hide = (event: Event) => event.stopImmediatePropagation()
  window.addEventListener('scroll', hide, { capture: true })

  wheel(-100)
  // outlasts the 400ms settle timer
  lenis.scrollTo(1000, { duration: 1 })
  await wait(600)

  window.removeEventListener('scroll', hide, { capture: true })

  expect(lenis.isScrolling).toBe('smooth')
  expect(states).not.toContain(false)
})
