import { afterEach, beforeEach, expect, test } from 'vite-plus/test'
import { userEvent } from 'vite-plus/test/browser'

import Lenis from '../index'

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

test('without Lenis, the wheel is a real event and scrolls natively', async () => {
  let event: WheelEvent | undefined
  window.addEventListener('wheel', (e) => (event = e), { once: true })

  await userEvent.wheel(content, { delta: { y: 300 } })

  expect(event?.isTrusted).toBe(true)
  expect(event?.deltaY).toBe(300)
  // Firefox applies the native scroll late; an unsettled scroll corrupts the next test
  await expect.poll(() => window.scrollY).toBe(300)
})

test('Lenis takes the wheel and animates to the target', async () => {
  lenis = new Lenis({ autoRaf: true })
  const positions: number[] = []
  lenis.on('scroll', ({ scroll }) => positions.push(scroll))

  await userEvent.wheel(content, { delta: { y: 300 } })

  expect(lenis.targetScroll).toBe(300)
  await expect.poll(() => window.scrollY, { timeout: 5000 }).toBe(300)
  // more than one step proves it animated instead of jumping
  expect(positions.filter((p) => p > 0 && p < 300).length).toBeGreaterThan(3)
  expect(document.documentElement.classList.contains('lenis')).toBe(true)
})

test('a stopped Lenis blocks the wheel', async () => {
  lenis = new Lenis({ autoRaf: true })
  lenis.stop()

  await userEvent.wheel(content, { delta: { y: 300 } })
  await new Promise((resolve) => setTimeout(resolve, 300))

  expect(window.scrollY).toBe(0)
})
