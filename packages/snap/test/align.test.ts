import { afterEach, beforeEach, expect, test } from 'vite-plus/test'

import Lenis from '../../core/index'
import Snap from '../index'

let lenis: Lenis
let snap: Snap
let content: HTMLElement
let element: HTMLElement

beforeEach(() => {
  content = document.createElement('div')
  content.style.cssText = 'position: relative; width: 5000px; height: 5000px'
  // left and top differ, so a mix-up of the axes gives a wrong position
  element = document.createElement('div')
  element.style.cssText =
    'position: absolute; left: 2000px; top: 1000px; width: 200px; height: 300px'
  content.append(element)
  document.body.style.margin = '0'
  document.body.append(content)
  window.scrollTo(0, 0)
})

afterEach(() => {
  snap.destroy()
  lenis.destroy()
  content.remove()
})

// how far the element is from the place in the viewport that `align` asks for
function distanceFromAlign(
  orientation: 'vertical' | 'horizontal',
  align: 'start' | 'center' | 'end'
) {
  const rect = element.getBoundingClientRect()
  const [start, size, viewport] =
    orientation === 'horizontal'
      ? [rect.left, rect.width, window.innerWidth]
      : [rect.top, rect.height, window.innerHeight]

  if (align === 'start') return start
  if (align === 'center') return start + size / 2 - viewport / 2
  return start + size - viewport
}

test.each([
  ['vertical', 'start'],
  ['vertical', 'center'],
  ['vertical', 'end'],
  ['horizontal', 'start'],
  ['horizontal', 'center'],
  ['horizontal', 'end'],
] as const)(
  'on a %s page, align %s lines the element up with the viewport',
  async (orientation, align) => {
    let completed = false
    lenis = new Lenis({ autoRaf: true, orientation })
    snap = new Snap(lenis, {
      duration: 0.1,
      onSnapComplete: () => {
        completed = true
      },
    })
    snap.addElement(element, { align })

    snap.goTo(0)
    await expect.poll(() => completed).toBe(true)

    // Snap rounds the position up to a full pixel
    expect(Math.abs(distanceFromAlign(orientation, align))).toBeLessThan(1)
  }
)
