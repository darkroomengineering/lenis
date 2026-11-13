import { afterEach, beforeEach, expect, test } from 'vite-plus/test'

import Lenis from '../../core/index'
import Snap from '../index'

let lenis: Lenis
let snap: Snap
let content: HTMLElement

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve))

// a ResizeObserver reports in the frame after the change
async function settle() {
  await nextFrame()
  await nextFrame()
}

function addBlock(top: number) {
  const block = document.createElement('div')
  block.style.cssText = `position: absolute; top: ${top}px; width: 200px; height: 200px`
  content.append(block)
  return block
}

// the SnapElement that Snap made for the element added last
const lastSnapElement = () => [...snap.elements.values()].at(-1)!

beforeEach(() => {
  content = document.createElement('div')
  content.style.cssText = 'position: relative; height: 5000px'
  document.body.style.margin = '0'
  document.body.append(content)
  window.scrollTo(0, 0)
  lenis = new Lenis()
  snap = new Snap(lenis)
})

afterEach(() => {
  snap.destroy()
  lenis.destroy()
  content.remove()
})

test('a snap element follows the size of its element until it is removed', async () => {
  const block = addBlock(1000)
  const remove = snap.addElement(block)
  const snapElement = lastSnapElement()

  block.style.height = '300px'
  await expect.poll(() => snapElement.rect.height).toBe(300)

  remove()
  // a second call must not throw
  remove()
  block.style.height = '400px'
  await settle()

  expect(snapElement.rect.height).toBe(300)
})

test('a removed snap element stops following its position, a kept one continues', async () => {
  const removedBlock = addBlock(1000)
  const remove = snap.addElement(removedBlock)
  const removed = lastSnapElement()
  const keptBlock = addBlock(2000)
  snap.addElement(keptBlock)
  const kept = lastSnapElement()

  remove()
  removedBlock.style.top = '1500px'
  keptBlock.style.top = '2500px'
  // positions are read again when the body changes size, after a 500ms debounce
  content.style.height = '6000px'

  await expect.poll(() => kept.rect.top, { timeout: 3000 }).toBe(2500)
  expect(removed.rect.top).toBe(1000)
})

test('removing a group stops each of its elements, a kept one continues', async () => {
  const keptBlock = addBlock(1000)
  snap.addElement(keptBlock)
  const kept = lastSnapElement()
  const groupBlocks = [addBlock(2000), addBlock(3000)]
  const remove = snap.addElements(groupBlocks)
  const group = [...snap.elements.values()].slice(-2)

  remove()
  for (const block of [keptBlock, ...groupBlocks]) block.style.height = '300px'

  await expect.poll(() => kept.rect.height).toBe(300)
  expect(group.map((snapElement) => snapElement.rect.height)).toEqual([
    200, 200,
  ])
})

test('destroy stops the elements that are still registered', async () => {
  const block = addBlock(1000)
  snap.addElement(block)
  const snapElement = lastSnapElement()

  block.style.height = '300px'
  await expect.poll(() => snapElement.rect.height).toBe(300)

  snap.destroy()
  block.style.height = '400px'
  await settle()

  expect(snapElement.rect.height).toBe(300)
})
