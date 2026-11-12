import { expect, test } from 'vite-plus/test'

import {
  addBlock,
  content,
  createLenis,
  recordScroll,
  setupPage,
  wheel,
} from './helpers'

setupPage()

const limit = () => 5000 - window.innerHeight

test('keywords go to the end and to the start', () => {
  const lenis = createLenis()

  lenis.scrollTo('bottom', { immediate: true })
  expect(window.scrollY).toBe(limit())

  lenis.scrollTo('top', { immediate: true })
  expect(window.scrollY).toBe(0)
})

test('a target past the end never reports a position past the limit', async () => {
  const lenis = createLenis()
  const positions = recordScroll(lenis)
  let completed = false

  lenis.scrollTo(99_999, {
    duration: 0.2,
    onComplete: () => {
      completed = true
    },
  })
  await expect.poll(() => completed).toBe(true)

  expect(Math.max(...positions)).toBe(limit())
  expect(window.scrollY).toBe(limit())
})

test('a selector target lands on the top edge of the element', () => {
  const lenis = createLenis()
  addBlock('top: 1000px; height: 100px').id = 'target'
  // a non-zero start proves the element position is not read as absolute
  lenis.scrollTo(300, { immediate: true })

  lenis.scrollTo('#target', { immediate: true })

  expect(window.scrollY).toBe(1000)
})

test('an element target respects offset, scroll-margin and scroll-padding', () => {
  const lenis = createLenis()
  const target = addBlock('top: 1000px; height: 100px; scroll-margin-top: 20px')
  document.documentElement.style.scrollPaddingTop = '10px'

  lenis.scrollTo(target, { immediate: true, offset: -30 })
  document.documentElement.style.removeProperty('scroll-padding-top')

  expect(window.scrollY).toBe(1000 - 20 - 10 - 30)
})

test('in a horizontal wrapper, an element target lands on its left edge', () => {
  const wrapper = addBlock(
    'left: 50px; top: 30px; width: 300px; height: 200px; overflow: auto'
  )
  const inner = document.createElement('div')
  inner.style.cssText = 'position: relative; width: 3000px; height: 100px'
  wrapper.append(inner)
  const target = addBlock('left: 1000px; width: 100px; height: 100px', inner)
  const lenis = createLenis({
    wrapper,
    content: inner,
    orientation: 'horizontal',
  })

  lenis.scrollTo(target, { immediate: true })

  expect(wrapper.scrollLeft).toBe(1000)
})

test('scrollTo calls onStart, emits scroll with userData, then calls onComplete', async () => {
  const lenis = createLenis()
  const log: string[] = []
  lenis.on('scroll', ({ userData }) => {
    if (userData.id === 'intro' && log.at(-1) !== 'scroll') log.push('scroll')
  })

  lenis.scrollTo(500, {
    duration: 0.2,
    userData: { id: 'intro' },
    onStart: () => log.push('start'),
    onComplete: () => log.push('complete'),
  })
  await expect.poll(() => log.at(-1)).toBe('complete')

  expect(log).toEqual(['start', 'scroll', 'complete'])
  expect(lenis.userData).toEqual({})
})

test('a locked scrollTo ignores the wheel until it completes', async () => {
  const lenis = createLenis()

  lenis.scrollTo(1000, { lock: true, duration: 0.5 })
  await expect.poll(() => window.scrollY).toBeGreaterThan(50)
  expect(lenis.isLocked).toBe(true)
  const during = wheel(content, { deltaY: -300 })

  await expect.poll(() => lenis.isLocked, { timeout: 5000 }).toBe(false)
  // a locked Lenis also keeps the event from the browser
  expect(during.defaultPrevented).toBe(true)
  expect(window.scrollY).toBe(1000)
})

test('a stopped Lenis ignores scrollTo unless it is forced', () => {
  const lenis = createLenis()
  lenis.stop()

  lenis.scrollTo(500, { immediate: true })
  expect(window.scrollY).toBe(0)

  lenis.scrollTo(500, { immediate: true, force: true })
  expect(window.scrollY).toBe(500)
})
