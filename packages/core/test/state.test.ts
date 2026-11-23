import { expect, onTestFinished, test } from 'vite-plus/test'

import {
  content,
  createLenis,
  rootClasses,
  setupPage,
  sleep,
  wheel,
} from './helpers'

setupPage()

test('the root class names follow a smooth scroll', async () => {
  const lenis = createLenis()
  expect(rootClasses()).toEqual(['lenis'])

  lenis.scrollTo(500, { duration: 0.3 })
  expect(rootClasses()).toEqual(['lenis', 'lenis-scrolling', 'lenis-smooth'])

  await expect.poll(() => rootClasses()).toEqual(['lenis'])
  expect(window.scrollY).toBe(500)
})

test('a native scroll marks the page as scrolling, then clears', async () => {
  const lenis = createLenis()

  window.scrollTo(0, 500)

  await expect.poll(() => rootClasses()).toEqual(['lenis', 'lenis-scrolling'])
  expect(lenis.isScrolling).toBe('native')
  await expect.poll(() => rootClasses()).toEqual(['lenis'])
})

test('stop and start toggle the stopped class', () => {
  const lenis = createLenis()

  lenis.stop()
  expect(rootClasses()).toEqual(['lenis', 'lenis-stopped'])

  lenis.start()
  expect(rootClasses()).toEqual(['lenis'])
})

test('destroy removes the class names and gives the wheel back', () => {
  const lenis = createLenis()

  lenis.destroy()

  expect(rootClasses()).toEqual([])
  expect(wheel(content, { deltaY: 300 }).defaultPrevented).toBe(false)
})

test('exactly one scrollend event follows a smooth scroll', async () => {
  const lenis = createLenis()
  const events: Event[] = []
  const onScrollEnd = (event: Event) => events.push(event)
  window.addEventListener('scrollend', onScrollEnd)
  onTestFinished(() => window.removeEventListener('scrollend', onScrollEnd))

  lenis.scrollTo(500, { duration: 0.3 })
  await expect.poll(() => events.length).toBeGreaterThan(0)
  // gives late native scrollend events the time to arrive
  await sleep(300)

  expect(events).toHaveLength(1)
  expect(window.scrollY).toBe(500)
})
