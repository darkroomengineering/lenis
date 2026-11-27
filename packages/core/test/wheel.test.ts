import { afterEach, beforeEach, expect, test } from 'vite-plus/test'

import Lenis from '../index'
import { wheel } from './helpers'

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

test('Lenis takes the wheel and animates to the target', async () => {
  lenis = new Lenis({ autoRaf: true })
  const positions: number[] = []
  lenis.on('scroll', ({ scroll }) => positions.push(scroll))

  await wheel(content, { y: 300 })

  expect(lenis.targetScroll).toBe(300)
  await expect.poll(() => window.scrollY, { timeout: 5000 }).toBe(300)
  // more than one step proves it animated instead of jumping
  expect(positions.filter((p) => p > 0 && p < 300).length).toBeGreaterThan(3)
  expect(document.documentElement.classList.contains('lenis')).toBe(true)
})

test('a stopped Lenis blocks the wheel', async () => {
  lenis = new Lenis({ autoRaf: true })
  lenis.stop()

  await wheel(content, { y: 300 })
  await new Promise((resolve) => setTimeout(resolve, 300))

  expect(window.scrollY).toBe(0)
})

test('wheel deltas smaller than a pixel add up', async () => {
  lenis = new Lenis({ autoRaf: true })

  // A precision touchpad moved slowly: a quarter of a pixel per frame. Each
  // delta used to complete its animation on its own first frame, and the
  // browser rounded it away before the next one arrived (#215).
  // Dispatched instead of `wheel()`: in WebKit a Playwright wheel smaller
  // than a pixel never reaches the page.
  for (let i = 0; i < 40; i++) {
    content.dispatchEvent(
      new WheelEvent('wheel', { deltaY: 0.25, bubbles: true, cancelable: true })
    )
    await new Promise((resolve) => requestAnimationFrame(resolve))
  }

  await expect.poll(() => window.scrollY, { timeout: 5000 }).toBe(10)
})
