import { expect, test } from 'vite-plus/test'
import { userEvent } from 'vite-plus/test/browser'

import { addBlock, createLenis, setupPage, wheel } from './helpers'

setupPage()

const vertical = { deltaY: 100 }
const mostlySideways = { deltaX: 100, deltaY: 10 }

test.each([
  ['data-lenis-prevent', vertical, false],
  ['data-lenis-prevent-wheel', vertical, false],
  ['data-lenis-prevent-vertical', vertical, false],
  ['data-lenis-prevent-vertical', mostlySideways, true],
  ['data-lenis-prevent-horizontal', mostlySideways, false],
  ['data-lenis-prevent-horizontal', vertical, true],
  ['data-lenis-prevent-touch', vertical, true],
])(
  'inside [%s], a wheel of %o is taken by Lenis: %s',
  (attribute, delta, taken) => {
    createLenis()
    const block = addBlock('top: 0; width: 200px; height: 200px')
    block.setAttribute(attribute, '')

    const event = wheel(block, delta)

    expect(event.defaultPrevented).toBe(taken)
  }
)

test('the prevent option keeps Lenis off the elements it matches', () => {
  createLenis({ prevent: (node) => node.id === 'modal' })
  const modal = addBlock('top: 0; width: 200px; height: 200px')
  modal.id = 'modal'
  const other = addBlock('top: 300px; width: 200px; height: 200px')

  expect(wheel(modal, vertical).defaultPrevented).toBe(false)
  expect(wheel(other, vertical).defaultPrevented).toBe(true)
})

// 200px tall with 1000px of content, so it scrolls from 0 to 800
function addScroller(style = '') {
  const scroller = addBlock(
    `top: 0; width: 200px; height: 200px; overflow: auto; ${style}`
  )
  const inner = document.createElement('div')
  inner.style.height = '1000px'
  scroller.append(inner)
  return scroller
}

test('Lenis takes the wheel over a nested scroller by default', () => {
  createLenis()
  const scroller = addScroller()

  expect(wheel(scroller, vertical).defaultPrevented).toBe(true)
})

test('with allowNestedScroll, a nested scroller scrolls and the page does not', async () => {
  createLenis({ allowNestedScroll: true })
  const scroller = addScroller()

  await userEvent.wheel(scroller, { delta: { y: 300 } })

  await expect.poll(() => scroller.scrollTop, { timeout: 5000 }).toBe(300)
  expect(window.scrollY).toBe(0)
})

test('with allowNestedScroll, Lenis takes the wheel at the end of a nested scroller', () => {
  const lenis = createLenis({ allowNestedScroll: true })
  const scroller = addScroller()
  scroller.scrollTop = 800

  expect(wheel(scroller, vertical).defaultPrevented).toBe(true)
  expect(lenis.targetScroll).toBe(100)
})

test('with allowNestedScroll, overscroll-behavior: contain keeps the wheel at the end', () => {
  createLenis({ allowNestedScroll: true })
  const scroller = addScroller('overscroll-behavior: contain')
  scroller.scrollTop = 800

  expect(wheel(scroller, vertical).defaultPrevented).toBe(false)
})
