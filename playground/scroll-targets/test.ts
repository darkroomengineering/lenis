import Lenis from 'lenis'

const wrapper = document.querySelector<HTMLElement>('#wrapper')!
const content = document.querySelector<HTMLElement>('#content')!
const results = document.querySelector<HTMLElement>('#results')!
const summary = document.querySelector<HTMLElement>('#summary')!
const rect = document.querySelector<SVGRectElement>('#svg-rect')!
const cases = [
  {
    name: 'SVG root',
    target: document.querySelector<SVGSVGElement>('#svg-target')!,
    x: 100,
    y: 200,
  },
  { name: 'SVG rect', target: rect, x: 600, y: 800 },
  {
    name: 'SVG circle',
    target: document.querySelector<SVGCircleElement>('#svg-circle')!,
    x: 880,
    y: 1180,
  },
  {
    name: 'SVG group',
    target: document.querySelector<SVGGElement>('#svg-group')!,
    x: 600,
    y: 800,
  },
  { name: 'SVG selector', target: '#svg-rect', x: 600, y: 800 },
  {
    name: 'HTML element',
    target: document.querySelector<HTMLElement>('#html-target')!,
    x: 450,
    y: 650,
  },
]
let passed = 0
let total = 0

function check(name: string, x: number, y: number) {
  total++
  const success =
    Math.abs(wrapper.scrollLeft - x) < 1 && Math.abs(wrapper.scrollTop - y) < 1
  if (success) passed++
  results.textContent += `${success ? 'PASS' : 'FAIL'} ${name}: (${wrapper.scrollLeft}, ${wrapper.scrollTop}), expected (${x}, ${y})\n`
}

for (const orientation of ['vertical', 'horizontal', 'both'] as const) {
  const lenis = new Lenis({ wrapper, content, orientation, autoRaf: false })
  try {
    for (const test of cases) {
      await lenis.scrollTo({ x: 0, y: 0 }, { immediate: true })
      await lenis.scrollTo(test.target, { immediate: true })
      check(
        `${orientation}: ${test.name}`,
        orientation === 'vertical' ? 0 : test.x,
        orientation === 'horizontal' ? 0 : test.y
      )
    }

    await lenis.scrollTo({ x: 120, y: 240 }, { immediate: true })
    check(`${orientation}: coordinate object`, 120, 240)

    await lenis.scrollTo({ x: 0, y: 0 }, { immediate: true })
    await lenis.scrollTo(rect, { immediate: true, offset: { x: 10, y: 20 } })
    check(
      `${orientation}: SVG with offsets`,
      orientation === 'vertical' ? 0 : 610,
      orientation === 'horizontal' ? 0 : 820
    )
  } finally {
    lenis.destroy()
  }
}

summary.textContent = `${passed}/${total} checks passed`
