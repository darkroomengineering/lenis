import { afterEach, beforeEach, expect, test } from 'vite-plus/test'
import { userEvent } from 'vite-plus/test/browser'

import Lenis from '../index'
import type { LenisOptions } from '../index'

const instances: Lenis[] = []
let content: HTMLElement
let scroller: HTMLElement

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function createLenis(options: LenisOptions = {}) {
  const lenis = new Lenis({ autoRaf: true, ...options })
  instances.push(lenis)
  return lenis
}

// A 200px tall scroller with 2000px of content, at the top of a 5000px page
function createScroller({ horizontal = false } = {}) {
  const element = document.createElement('div')
  element.style.width = '300px'
  element.style.height = '200px'
  element.style.overflow = horizontal ? 'auto hidden' : 'hidden auto'
  const inner = document.createElement('div')
  inner.style.width = horizontal ? '3000px' : '100%'
  inner.style.height = horizontal ? '100%' : '2000px'
  element.append(inner)
  return element
}

beforeEach(() => {
  document.body.style.margin = '0'
  scroller = createScroller()
  content = document.createElement('div')
  content.style.height = '5000px'
  document.body.append(scroller, content)
  window.scrollTo(0, 0)
})

afterEach(() => {
  for (const lenis of instances.splice(0)) lenis.destroy()
  scroller.remove()
  content.remove()
})

test('default: the page takes the wheel over a nested scroller', async () => {
  const lenis = createLenis()

  await userEvent.wheel(scroller, { delta: { y: 300 } })

  expect(lenis.targetScroll).toBe(300)
  expect(Lenis.get(scroller)).toBeUndefined()
})

test('true: a nested scroller scrolls natively and is not adopted', async () => {
  const lenis = createLenis({ allowNestedScroll: true })

  await userEvent.wheel(scroller, { delta: { y: 300 } })
  await wait(300)

  expect(lenis.targetScroll).toBe(0)
  expect(window.scrollY).toBe(0)
  expect(Lenis.get(scroller)).toBeUndefined()
  expect(scroller.classList.contains('lenis')).toBe(false)
})

test("'smooth': the first wheel adopts the scroller and animates it", async () => {
  const lenis = createLenis({ allowNestedScroll: 'smooth' })
  const positions: number[] = []
  scroller.addEventListener('scroll', () => positions.push(scroller.scrollTop))

  await userEvent.wheel(scroller, { delta: { y: 300 } })

  const child = Lenis.get(scroller)
  expect(child).toBeInstanceOf(Lenis)
  expect(child).not.toBe(lenis)
  expect(child?.targetScroll).toBe(300)
  await expect.poll(() => scroller.scrollTop, { timeout: 5000 }).toBe(300)
  // more than one step proves it animated instead of jumping
  expect(positions.filter((p) => p > 0 && p < 300).length).toBeGreaterThan(3)
  expect(scroller.classList.contains('lenis')).toBe(true)
  expect(lenis.targetScroll).toBe(0)
  expect(window.scrollY).toBe(0)
})

test("'smooth': later wheels go to the adopted instance, not a new one", async () => {
  createLenis({ allowNestedScroll: 'smooth' })

  await userEvent.wheel(scroller, { delta: { y: 100 } })
  const child = Lenis.get(scroller)
  await userEvent.wheel(scroller, { delta: { y: 100 } })

  expect(Lenis.get(scroller)).toBe(child)
  expect(child?.targetScroll).toBe(200)
  expect(window.scrollY).toBe(0)
})

test("'smooth': the page takes over once the scroller reaches its end", async () => {
  const lenis = createLenis({ allowNestedScroll: 'smooth' })

  await userEvent.wheel(scroller, { delta: { y: 300 } })
  const child = Lenis.get(scroller)!
  child.scrollTo('bottom', { immediate: true })
  scroller.scrollTop = child.limit
  await wait(100)

  await userEvent.wheel(scroller, { delta: { y: 300 } })

  expect(lenis.targetScroll).toBe(300)
})

test("'smooth': data-lenis-prevent keeps a scroller native", async () => {
  const lenis = createLenis({ allowNestedScroll: 'smooth' })
  scroller.setAttribute('data-lenis-prevent', '')

  await userEvent.wheel(scroller, { delta: { y: 300 } })
  await wait(300)

  expect(Lenis.get(scroller)).toBeUndefined()
  expect(lenis.targetScroll).toBe(0)
})

test("'smooth': a prevented ancestor keeps a scroller native", async () => {
  const lenis = createLenis({ allowNestedScroll: 'smooth' })
  const wrapper = document.createElement('div')
  wrapper.setAttribute('data-lenis-prevent', '')
  scroller.replaceWith(wrapper)
  wrapper.append(scroller)

  await userEvent.wheel(scroller, { delta: { y: 300 } })

  expect(Lenis.get(scroller)).toBeUndefined()
  expect(lenis.targetScroll).toBe(0)
  wrapper.remove()
})

test("'smooth': the prevent option keeps a scroller native", async () => {
  createLenis({
    allowNestedScroll: 'smooth',
    prevent: (node) => node === scroller,
  })

  await userEvent.wheel(scroller, { delta: { y: 300 } })

  expect(Lenis.get(scroller)).toBeUndefined()
})

test("'smooth': a manual instance on the scroller is not adopted again", async () => {
  createLenis({ allowNestedScroll: 'smooth' })
  const manual = createLenis({
    wrapper: scroller,
    content: scroller.firstElementChild!,
  })

  await userEvent.wheel(scroller, { delta: { y: 300 } })

  expect(Lenis.get(scroller)).toBe(manual)
  expect(manual.targetScroll).toBe(300)
})

test("'smooth': adopted instances are destroyed with their adopter", async () => {
  const lenis = createLenis({ allowNestedScroll: 'smooth' })

  await userEvent.wheel(scroller, { delta: { y: 300 } })
  expect(Lenis.get(scroller)).toBeDefined()

  lenis.destroy()

  expect(Lenis.get(scroller)).toBeUndefined()
  expect(scroller.classList.contains('lenis')).toBe(false)
})

test("'smooth': an adopted instance is destroyed once its element leaves the DOM", async () => {
  const lenis = createLenis({ allowNestedScroll: 'smooth' })

  await userEvent.wheel(scroller, { delta: { y: 300 } })
  const child = Lenis.get(scroller)
  expect(child).toBeDefined()

  scroller.remove()
  lenis.resize()

  expect(Lenis.get(scroller)).toBeUndefined()
})

test("'smooth': a horizontal scroller is adopted horizontally and leaves vertical wheels to the page", async () => {
  scroller.remove()
  scroller = createScroller({ horizontal: true })
  document.body.prepend(scroller)
  const lenis = createLenis({ allowNestedScroll: 'smooth' })

  await userEvent.wheel(scroller, { delta: { x: 300, y: 1 } })

  const child = Lenis.get(scroller)
  expect(child?.isHorizontal).toBe(true)
  expect(child?.targetScroll).toBe(300)
  expect(window.lenis?.horizontal).toBeFalsy()

  await userEvent.wheel(scroller, { delta: { y: 300 } })

  expect(lenis.targetScroll).toBe(300)
  expect(child?.targetScroll).toBe(300)
})

test("'smooth': wheels outside nested scrollers still drive the page", async () => {
  const lenis = createLenis({ allowNestedScroll: 'smooth' })

  // a visible spot right under the scroller, so the pointer needs no scrolling
  const target = document.createElement('div')
  target.style.height = '100px'
  content.prepend(target)

  await userEvent.wheel(target, { delta: { y: 300 } })

  expect(lenis.targetScroll).toBe(300)
  expect(Lenis.get(scroller)).toBeUndefined()
})

function touch(target: Element, type: string, y: number) {
  const point = new Touch({
    identifier: 1,
    target,
    clientX: 100,
    clientY: y,
  })
  target.dispatchEvent(
    new TouchEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      touches: type === 'touchend' ? [] : [point],
      targetTouches: type === 'touchend' ? [] : [point],
      changedTouches: [point],
    })
  )
}

test.runIf(typeof Touch === 'function')(
  "'smooth' with syncTouch: a touch adopts the scroller and the gesture carries on in it",
  () => {
    const lenis = createLenis({ allowNestedScroll: 'smooth', syncTouch: true })
    const inner = scroller.firstElementChild!

    touch(inner, 'touchstart', 150)
    touch(inner, 'touchmove', 140) // adopts, hands over 10px
    touch(inner, 'touchmove', 120) // goes to the child's own listener

    const child = Lenis.get(scroller)
    expect(child).toBeDefined()
    expect(child?.targetScroll).toBe(30)
    expect(lenis.targetScroll).toBe(0)
  }
)

test("'smooth' without syncTouch: touch is left native and nothing is adopted", () => {
  createLenis({ allowNestedScroll: 'smooth' })
  const inner = scroller.firstElementChild!

  touch(inner, 'touchstart', 150)
  touch(inner, 'touchmove', 140)

  expect(Lenis.get(scroller)).toBeUndefined()
})
