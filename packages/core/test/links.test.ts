import { afterEach, expect, test } from 'vite-plus/test'

import {
  addBlock,
  content,
  createLenis,
  recordScroll,
  setupPage,
  sleep,
} from './helpers'

setupPage()

afterEach(() => {
  history.replaceState(null, '', location.pathname + location.search)
})

function addLink(href: string) {
  const link = document.createElement('a')
  link.href = href
  link.textContent = 'link'
  link.style.cssText = 'position: fixed; top: 0; left: 0'
  content.append(link)
  return link
}

test('with anchors, a click on a hash link animates to the element', async () => {
  const lenis = createLenis({ anchors: true })
  const positions = recordScroll(lenis)
  // not a valid CSS selector, and the browser percent-encodes it in the hash
  addBlock('top: 2000px; height: 100px').id = '1†'

  addLink('#1†').click()

  // the browser jumps to the element first, so wait for the end of the animation
  await expect.poll(() => positions.at(-1), { timeout: 5000 }).toBe(2000)
  expect(window.scrollY).toBe(2000)
  expect(positions.filter((p) => p > 0 && p < 2000).length).toBeGreaterThan(3)
})

test('with stopInertiaOnNavigate, a click on a link to another page stops the scroll', async () => {
  const lenis = createLenis({ stopInertiaOnNavigate: true })
  const link = addLink('/another-page')
  // keeps the test page from navigating away
  link.addEventListener('click', (event) => event.preventDefault())

  lenis.scrollTo(4000, { duration: 10, easing: (t) => t })
  await expect.poll(() => window.scrollY).toBeGreaterThan(100)
  link.click()
  const position = window.scrollY
  await sleep(200)

  expect(window.scrollY).toBe(position)
})
