import { expect, test } from 'vite-plus/test'

// autoToggle needs the overflow transition that this stylesheet defines
import '../lenis.css'
import { createLenis, setupPage } from './helpers'

setupPage()

test('with autoToggle, Lenis stops and starts with the overflow of the root', async () => {
  const lenis = createLenis({ autoToggle: true })

  lenis.stop()
  expect(document.documentElement.style.overflow).toBe('clip')
  await expect.poll(() => lenis.isStopped).toBe(true)

  lenis.start()
  await expect.poll(() => lenis.isStopped).toBe(false)
})
