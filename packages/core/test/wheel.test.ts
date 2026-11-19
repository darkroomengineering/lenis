import { expect, test } from 'vite-plus/test'
import { userEvent } from 'vite-plus/test/browser'

import {
  content,
  createLenis,
  recordScroll,
  setupPage,
  sleep,
  wheel,
} from './helpers'

setupPage()

test('Lenis takes the wheel and animates to the target', async () => {
  const lenis = createLenis()
  const positions = recordScroll(lenis)

  await userEvent.wheel(content, { delta: { y: 300 } })

  expect(lenis.targetScroll).toBe(300)
  await expect.poll(() => window.scrollY, { timeout: 5000 }).toBe(300)
  // more than one step proves it animated instead of jumping
  expect(positions.filter((p) => p > 0 && p < 300).length).toBeGreaterThan(3)
})

test('a stopped Lenis blocks the wheel', async () => {
  const lenis = createLenis()
  lenis.stop()

  await userEvent.wheel(content, { delta: { y: 300 } })
  await sleep(300)

  expect(window.scrollY).toBe(0)
})

test('Lenis leaves ctrl + wheel to the browser zoom', () => {
  const lenis = createLenis()

  const event = wheel(content, { deltaY: 300, ctrlKey: true })

  expect(event.defaultPrevented).toBe(false)
  expect(lenis.targetScroll).toBe(0)
})

test('Lenis leaves a sideways wheel to the browser on a vertical page', () => {
  const lenis = createLenis()

  const event = wheel(content, { deltaX: 300 })

  expect(event.defaultPrevented).toBe(false)
  expect(lenis.targetScroll).toBe(0)
})

test('with smoothWheel off, the wheel stays native', () => {
  const lenis = createLenis({ smoothWheel: false })

  const event = wheel(content, { deltaY: 300 })

  expect(event.defaultPrevented).toBe(false)
  expect(lenis.targetScroll).toBe(0)
})

test('line deltas become pixels, times wheelMultiplier', () => {
  const lenis = createLenis({ wheelMultiplier: 2 })

  wheel(content, { deltaY: 3, deltaMode: WheelEvent.DOM_DELTA_LINE })

  expect(lenis.targetScroll).toBe(100)
})

test('the virtualScroll option can reject a wheel event', () => {
  const lenis = createLenis({ virtualScroll: ({ deltaY }) => deltaY > 0 })

  const up = wheel(content, { deltaY: -300 })
  expect(up.defaultPrevented).toBe(false)

  const down = wheel(content, { deltaY: 300 })
  expect(down.defaultPrevented).toBe(true)
  expect(lenis.targetScroll).toBe(300)
})

test('on a horizontal page, both wheel axes scroll sideways', async () => {
  content.style.width = '5000px'
  const lenis = createLenis({ orientation: 'horizontal' })

  wheel(content, { deltaY: 300 })
  expect(lenis.targetScroll).toBe(300)
  wheel(content, { deltaX: 200 })
  expect(lenis.targetScroll).toBe(500)

  await expect.poll(() => window.scrollX, { timeout: 5000 }).toBe(500)
  expect(window.scrollY).toBe(0)
})

test('with infinite, a wheel up at the top wraps to the end', async () => {
  createLenis({ infinite: true })

  wheel(content, { deltaY: -100 })

  await expect
    .poll(() => window.scrollY, { timeout: 5000 })
    .toBe(5000 - window.innerHeight - 100)
})

test('after a native scroll, the wheel continues from the new position', async () => {
  const lenis = createLenis()

  window.scrollTo(0, 500)
  await expect.poll(() => lenis.targetScroll).toBe(500)
  wheel(content, { deltaY: 300 })

  expect(lenis.targetScroll).toBe(800)
})

test('a wheel during scrollTo replaces its target', async () => {
  const lenis = createLenis()

  lenis.scrollTo(4000, { duration: 10, easing: (t) => t })
  await expect.poll(() => window.scrollY).toBeGreaterThan(100)
  const position = lenis.targetScroll
  wheel(content, { deltaY: 300 })

  expect(position).toBeGreaterThan(100)
  // browsers round a fractional scroll position in different ways
  await expect
    .poll(() => Math.abs(window.scrollY - (position + 300)), { timeout: 5000 })
    .toBeLessThanOrEqual(1)
})
