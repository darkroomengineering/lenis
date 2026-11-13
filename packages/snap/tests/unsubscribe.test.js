import { afterAll, beforeAll, expect, test } from 'bun:test'
import { Snap } from '../src/snap'

const original = {
  window: globalThis.window,
  document: globalThis.document,
  ResizeObserver: globalThis.ResizeObserver,
  getComputedStyle: globalThis.getComputedStyle,
}

const observers = []

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
    disconnected = false
    constructor() {
      observers.push(this)
    }
    observe() {
      /* No event or observer side effects in this unit test. */
    }
    disconnect() {
      this.disconnected = true
    }
  }
  globalThis.getComputedStyle = () => ({ position: 'static' })
})

afterAll(() => {
  Object.assign(globalThis, original)
})

const element = () => ({
  getBoundingClientRect: () => ({ left: 640, top: 20 }),
  offsetWidth: 200,
  offsetHeight: 200,
  offsetParent: null,
  scrollLeft: 0,
  scrollTop: 0,
})

function createSnap() {
  return new Snap({
    on() {
      /* Stub Lenis events. */
    },
    off() {
      /* Stub Lenis events. */
    },
  })
}

test('removing one snap element disconnects both of its resize observers', () => {
  observers.length = 0
  const snap = createSnap()
  const remove = snap.addElement(element())
  const owned = [...observers]
  remove()
  snap.destroy()
  expect(owned.length).toBe(2)
  expect(owned.every((observer) => observer.disconnected)).toBe(true)
})

test('removing a group disconnects each removed element but leaves others active', () => {
  observers.length = 0
  const snap = createSnap()
  snap.addElement(element())
  const retained = [...observers]
  const remove = snap.addElements([element(), element()])
  const removed = observers.slice(2)
  try {
    remove()
    expect(removed.length).toBe(4)
    expect(removed.every((observer) => observer.disconnected)).toBe(true)
    expect(retained.every((observer) => !observer.disconnected)).toBe(true)
  } finally {
    snap.destroy()
  }
})

test('repeated unsubscribe is safe and destroy still cleans retained elements', () => {
  observers.length = 0
  const snap = createSnap()
  const remove = snap.addElement(element())
  snap.addElement(element())
  remove()
  remove()
  snap.destroy()
  expect(observers.every((observer) => observer.disconnected)).toBe(true)
})
