import { afterEach, beforeEach, expect, test, vi } from 'vite-plus/test'

import Lenis from '../index'
import { wheel } from './helpers'

// With `autoRaf`, the loop only runs while something animates (#549)

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
  vi.restoreAllMocks()
  lenis?.destroy()
  lenis = undefined
  content.remove()
})

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** How many frames are requested during `ms` */
async function countFrames(ms: number) {
  const spy = vi.spyOn(window, 'requestAnimationFrame')
  await wait(ms)
  const count = spy.mock.calls.length
  spy.mockRestore()
  return count
}

test('no frame is requested while nothing animates', async () => {
  lenis = new Lenis({ autoRaf: true })

  expect(await countFrames(300)).toBe(0)
})

test('the loop runs for an animation and stops after it', async () => {
  lenis = new Lenis({ autoRaf: true })

  await wheel(content, { y: 300 })
  expect(await countFrames(100)).toBeGreaterThan(1)

  await expect.poll(() => lenis?.isScrolling, { timeout: 5000 }).toBe(false)
  expect(window.scrollY).toBe(300)
  // the frame that dispatches `scrollend` has run by then
  await wait(100)
  expect(await countFrames(300)).toBe(0)
})

test('an animation that starts after an idle time does not jump', async () => {
  lenis = new Lenis({ autoRaf: true })

  lenis.scrollTo(100, { immediate: false, duration: 0.1 })
  await expect.poll(() => window.scrollY, { timeout: 5000 }).toBe(100)
  await wait(500)

  const positions: number[] = []
  lenis.on('scroll', ({ scroll }) => positions.push(scroll))
  lenis.scrollTo(1100, { duration: 1, easing: (t) => t })
  await expect
    .poll(() => positions.length, { timeout: 5000 })
    .toBeGreaterThan(0)

  // one frame of a 1000px linear scroll over 1s, not the 500ms spent idle
  expect(positions[0]).toBeGreaterThan(100)
  expect(positions[0]).toBeLessThan(200)
})

test('an adopted scroller starts the loop of the instance that adopted it', async () => {
  // a 200px tall scroller with 2000px of content, at the top of the page
  const scroller = document.createElement('div')
  scroller.style.cssText = 'width: 300px; height: 200px; overflow: hidden auto'
  scroller.innerHTML = '<div style="height: 2000px"></div>'
  content.before(scroller)
  lenis = new Lenis({ autoRaf: true, allowNestedScroll: 'smooth' })

  await wheel(scroller, { y: 300 })
  const child = Lenis.get(scroller)
  await expect.poll(() => child?.isScrolling, { timeout: 5000 }).toBe(false)
  expect(scroller.scrollTop).toBe(300)
  await wait(100)
  expect(await countFrames(300)).toBe(0)

  // from the second gesture on, the adopted instance gets the wheel itself
  const positions: number[] = []
  scroller.addEventListener('scroll', () => positions.push(scroller.scrollTop))
  await wheel(scroller, { y: 300 })

  await expect.poll(() => scroller.scrollTop, { timeout: 5000 }).toBe(600)
  // a first step of one frame, not of the time its clock stood still
  expect(positions[0]).toBeLessThan(400)
  expect(window.scrollY).toBe(0)

  scroller.remove()
})
