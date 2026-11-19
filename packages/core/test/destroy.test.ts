import { afterEach, beforeEach, expect, test } from 'vite-plus/test'

// autoToggle needs the overflow transition that this stylesheet defines
import '../lenis.css'
import Lenis from '../index'

const root = document.documentElement

let content: HTMLElement
const instances: Lenis[] = []

function createLenis() {
  const lenis = new Lenis({ autoToggle: true, autoRaf: true })
  instances.push(lenis)
  return lenis
}

const transitionEnd = () =>
  new Promise((resolve) =>
    root.addEventListener('transitionend', resolve, { once: true })
  )

beforeEach(() => {
  content = document.createElement('div')
  content.style.height = '5000px'
  document.body.style.margin = '0'
  document.body.append(content)
  window.scrollTo(0, 0)
})

afterEach(() => {
  for (const lenis of instances.splice(0)) lenis.destroy()
  root.style.removeProperty('overflow')
  root.style.removeProperty('overflow-x')
  content.remove()
})

test('a destroyed instance ignores overflow changes once a new one takes over', async () => {
  const old = createLenis()
  old.destroy()
  const lenis = createLenis()

  root.style.setProperty('overflow', 'hidden')
  await expect.poll(() => lenis.isStopped).toBe(true)
  expect(old.isStopped).toBe(false)

  root.style.removeProperty('overflow')
  await expect.poll(() => lenis.isStopped).toBe(false)
  expect(old.isStopped).toBe(false)
})

test('a destroyed instance does not rewrite the classes of the live one', async () => {
  // The first instance is destroyed while stopped, so its state says stopped.
  const old = createLenis()
  old.stop()
  await expect.poll(() => old.isStopped).toBe(true)
  old.destroy()
  root.style.removeProperty('overflow')

  const lenis = createLenis()
  lenis.scrollTo(2000, { duration: 5, easing: (t) => t })
  await expect.poll(() => lenis.isSmooth).toBe(true)

  // The root is still scrollable on y, so the live instance has nothing to do.
  const ended = transitionEnd()
  root.style.setProperty('overflow-x', 'hidden')
  await ended

  expect(lenis.isSmooth).toBe(true)
  expect(root.classList.contains('lenis-smooth')).toBe(true)
})
