import { afterEach, beforeEach } from 'vite-plus/test'

import Lenis from '../index'
import type { LenisOptions } from '../index'

const instances: Lenis[] = []

export let content: HTMLElement

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve))

/** Gives each test a 5000px tall page at scroll 0, and destroys its Lenis instances after. */
export function setupPage() {
  beforeEach(async () => {
    content = document.createElement('div')
    content.style.cssText = 'position: relative; height: 5000px'
    document.body.style.margin = '0'
    document.body.append(content)
    window.scrollTo(0, 0)
    // lets the scroll event of the reset fire before the test creates Lenis
    await nextFrame()
    await nextFrame()
  })

  afterEach(() => {
    for (const lenis of instances.splice(0)) lenis.destroy()
    content.remove()
  })
}

export function createLenis(options: LenisOptions = {}) {
  const lenis = new Lenis({ autoRaf: true, ...options })
  instances.push(lenis)
  return lenis
}

/** Adds an absolutely positioned block to the page. */
export function addBlock(style: string, parent: HTMLElement = content) {
  const block = document.createElement('div')
  block.style.cssText = `position: absolute; ${style}`
  parent.append(block)
  return block
}

/** Dispatches a wheel event. `defaultPrevented` on the result tells if Lenis took it. */
export function wheel(target: Element, init: WheelEventInit) {
  const event = new WheelEvent('wheel', {
    bubbles: true,
    cancelable: true,
    ...init,
  })
  target.dispatchEvent(event)
  return event
}

export function recordScroll(lenis: Lenis) {
  const positions: number[] = []
  lenis.on('scroll', ({ scroll }) => positions.push(scroll))
  return positions
}

export const rootClasses = () =>
  Array.from(document.documentElement.classList).sort()
