import { afterEach, beforeEach, describe, expect, it } from 'bun:test'

// Minimal browser stand-ins so Lenis can run under `bun test` without a DOM.
// requestAnimationFrame is driven by hand so the test can count the frames
// Lenis schedules.

type FrameCallback = (time: number) => void

let frames: Map<number, FrameCallback>
let nextFrameId: number
let now: number
let scheduled: number

class FakeWindow extends EventTarget {}

class FakeClassList extends Set<string> {
  remove(name: string) {
    this.delete(name)
  }
}

class FakeElement extends EventTarget {
  scrollTop = 0
  scrollLeft = 0
  clientWidth = 1000
  clientHeight = 1000
  scrollWidth = 1000
  scrollHeight = 5000
  classList = new FakeClassList()

  scrollTo({ top, left }: { top?: number; left?: number }) {
    if (top !== undefined) this.scrollTop = top
    if (left !== undefined) this.scrollLeft = left
  }
}

function runFrames(count: number) {
  for (let i = 0; i < count; i++) {
    now += 1000 / 60
    const pending = [...frames.values()]
    frames.clear()
    for (const callback of pending) callback(now)
  }
}

const globals = globalThis as Record<string, unknown>
const original: Record<string, unknown> = {}
const stubbed = [
  'window',
  'Window',
  'Element',
  'document',
  'navigator',
  'requestAnimationFrame',
  'cancelAnimationFrame',
]

beforeEach(() => {
  frames = new Map()
  nextFrameId = 1
  now = 0
  scheduled = 0

  for (const key of stubbed) original[key] = globals[key]

  const fakeWindow = Object.assign(new FakeWindow(), {
    innerWidth: 1000,
    innerHeight: 1000,
    matchMedia: () => ({ matches: false }),
  })

  globals.Window = FakeWindow
  globals.Element = FakeElement
  globals.window = fakeWindow
  globals.document = { documentElement: new FakeElement() }
  globals.navigator = { userAgent: 'bun' }
  globals.requestAnimationFrame = (callback: FrameCallback) => {
    scheduled++
    const id = nextFrameId++
    frames.set(id, callback)
    return id
  }
  globals.cancelAnimationFrame = (id: number) => {
    frames.delete(id)
  }
})

afterEach(() => {
  for (const key of stubbed) globals[key] = original[key]
})

async function createLenis() {
  const { Lenis } = await import('./lenis')
  const wrapper = new FakeElement()
  const content = new FakeElement()
  const lenis = new Lenis({
    wrapper: wrapper as unknown as HTMLElement,
    content: content as unknown as HTMLElement,
    autoRaf: true,
    autoResize: false,
  })
  return { lenis, wrapper }
}

describe('autoRaf', () => {
  it('stops requesting frames while nothing animates', async () => {
    const { lenis } = await createLenis()

    runFrames(2)
    const scheduledBeforeIdle = scheduled
    runFrames(60)

    expect(scheduled - scheduledBeforeIdle).toBe(0)
    expect(frames.size).toBe(0)

    lenis.destroy()
  })

  it('restarts the loop for an animation and stops when it completes', async () => {
    const { lenis, wrapper } = await createLenis()

    // ten idle seconds must not make the next animation jump to its end
    runFrames(600)

    lenis.scrollTo(500, { duration: 1 })
    expect(frames.size).toBe(1)

    runFrames(1)
    expect(wrapper.scrollTop).toBeGreaterThan(0)
    expect(wrapper.scrollTop).toBeLessThan(500)

    runFrames(120)
    expect(wrapper.scrollTop).toBe(500)
    expect(lenis.isScrolling).toBe(false)

    const scheduledAfterAnimation = scheduled
    runFrames(60)
    expect(scheduled - scheduledAfterAnimation).toBe(0)
    expect(frames.size).toBe(0)

    lenis.destroy()
  })

  it('stops after a lerp animation settles', async () => {
    const { lenis, wrapper } = await createLenis()

    runFrames(600)
    lenis.scrollTo(300)
    runFrames(1)
    expect(wrapper.scrollTop).toBeGreaterThan(0)

    runFrames(300)
    expect(wrapper.scrollTop).toBe(300)
    expect(frames.size).toBe(0)

    lenis.destroy()
  })

  it('keeps one loop when scrollTo is called again mid animation', async () => {
    const { lenis, wrapper } = await createLenis()

    lenis.scrollTo(500, { duration: 1 })
    runFrames(10)
    lenis.scrollTo(800, { duration: 1 })
    expect(frames.size).toBe(1)

    runFrames(120)
    expect(wrapper.scrollTop).toBe(800)
    expect(frames.size).toBe(0)

    lenis.destroy()
  })
})
