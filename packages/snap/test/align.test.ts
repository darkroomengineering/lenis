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

// where the element (left 2000, top 1000, 200 wide, 300 tall) must end up
function snapPosition(orientation: 'vertical' | 'horizontal', align: string) {
  const [start, size, viewport] =
    orientation === 'horizontal'
      ? [2000, 200, window.innerWidth]
      : [1000, 300, window.innerHeight]

  if (align === 'start') return start
  if (align === 'center') return Math.ceil(start + size / 2 - viewport / 2)
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
  'on a %s page, align %s snaps to the matching edge of the element',
  async (orientation, align) => {
    lenis = new Lenis({ autoRaf: true, orientation })
    snap = new Snap(lenis, { duration: 0.1 })
    snap.addElement(element, { align })

    snap.goTo(0)

    const position = () =>
      orientation === 'horizontal' ? window.scrollX : window.scrollY
    await expect.poll(position).toBe(snapPosition(orientation, align))
  }
)
