import { expect, test } from 'vite-plus/test'

import { createLenis, setupPage } from './helpers'

setupPage()

test('an option set to undefined keeps its default', () => {
  const lenis = createLenis({ lerp: undefined, wrapper: undefined })

  expect(lenis.options.lerp).toBe(0.1)
  expect(lenis.options.wrapper).toBe(window)
})

test('the html element as wrapper falls back to window', () => {
  const lenis = createLenis({ wrapper: document.documentElement })

  expect(lenis.options.wrapper).toBe(window)
  expect(lenis.options.eventsTarget).toBe(document.documentElement)
})

test('duration and easing each bring a default for the other', () => {
  const linear = (t: number) => t

  expect(createLenis({ duration: 2 }).options.easing).toBeTypeOf('function')
  expect(createLenis({ easing: linear }).options.duration).toBe(1)
})

test('naiveDimensions reads the limit from the root element', () => {
  const lenis = createLenis({ __experimental__naiveDimensions: true })

  expect(lenis.options.naiveDimensions).toBe(true)
  expect(lenis.limit).toBe(5000 - window.innerHeight)
})
