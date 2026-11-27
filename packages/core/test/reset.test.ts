import { afterEach, beforeEach, expect, test } from 'vite-plus/test'

import Lenis from '../index'

// `reset()` stops a glide from outside, for what `stopInertiaOnNavigate` does
// not see: back and forward, a navigation from code, a late router scroll (#554)

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

async function glide() {
  lenis!.scrollTo(3000, { duration: 2 })
  await expect.poll(() => window.scrollY).toBeGreaterThan(200)
}

test('reset() lets a router scroll in the same frame hold', async () => {
  lenis = new Lenis({ autoRaf: true })
  await glide()

  lenis.reset()
  window.scrollTo(0, 0)
  await wait(200)

  expect(window.scrollY).toBe(0)
  // Lenis followed the router's scroll, so the next gesture starts from there
  expect(lenis.scroll).toBe(0)
  expect(lenis.targetScroll).toBe(0)
})

test('reset() emits the stopped state', async () => {
  lenis = new Lenis({ autoRaf: true })
  await glide()

  const states: { isScrolling: boolean | string; velocity: number }[] = []
  lenis.on('scroll', ({ isScrolling, velocity }) =>
    states.push({ isScrolling, velocity })
  )
  lenis.reset()

  expect(states).toEqual([{ isScrolling: false, velocity: 0 }])
  expect(lenis.scroll).toBe(window.scrollY)
  expect(lenis.targetScroll).toBe(window.scrollY)
})
