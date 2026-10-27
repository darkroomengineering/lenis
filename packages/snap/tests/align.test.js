import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { Snap } from '../src/snap'

const original = {
  window: globalThis.window,
  document: globalThis.document,
  ResizeObserver: globalThis.ResizeObserver,
  getComputedStyle: globalThis.getComputedStyle,
}

beforeAll(() => {
  globalThis.window = {
    innerWidth: 800,
    innerHeight: 600,
    scrollX: 0,
    scrollY: 0,
    addEventListener() {
      /* No event or observer side effects in this unit test. */
    },
    removeEventListener() {
      /* No event or observer side effects in this unit test. */
    },
  }
  globalThis.document = { body: {} }
  globalThis.ResizeObserver = class {
    observe() {
      /* No event or observer side effects in this unit test. */
    }
    disconnect() {
      /* No event or observer side effects in this unit test. */
    }
  }
  globalThis.getComputedStyle = () => ({ position: 'static' })
})

afterAll(() => {
  Object.assign(globalThis, original)
})

describe('element snap alignment', () => {
  for (const isHorizontal of [false, true]) {
    for (const [align, horizontal, vertical] of [
      ['start', 640, 20],
      ['center', 340, -180],
      ['end', 40, -380],
    ]) {
      test(`${isHorizontal ? 'horizontal' : 'vertical'} ${align}`, () => {
        let target
        const lenis = {
          isHorizontal,
          on() {
            /* No event or observer side effects in this unit test. */
          },
          off() {
            /* No event or observer side effects in this unit test. */
          },
          scrollTo(value) {
            target = value
          },
        }
        const snap = new Snap(lenis)
        snap.addElement(
          {
            getBoundingClientRect: () => ({ left: 640, top: 20 }),
            offsetWidth: 200,
            offsetHeight: 200,
            offsetParent: null,
            scrollLeft: 0,
            scrollTop: 0,
          },
          { align }
        )
        try {
          snap.goTo(0)
          expect(target).toBe(isHorizontal ? horizontal : vertical)
        } finally {
          snap.destroy()
        }
      })
    }
  }
})
