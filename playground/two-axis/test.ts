import Lenis from 'lenis'

const lenis = new Lenis({
  wrapper: document.querySelector('#grid')!,
  orientation: 'both',
  infinite: true,
  touch: {
    smooth: true,
    // ios: {
    //   smooth: true,
    // },
  },
  wheel: {
    smooth: true,
  },
  // onGesture: (data) => {
  //   console.log(data.type, data.deltaX, data.deltaY)
  // },
})

const tweak = document.querySelector<HTMLElement>('#tweak')
if (!tweak) throw new Error('#tweak not found — is the panel markup in the page?')

const toggle = tweak.querySelector<HTMLButtonElement>('#tweak-toggle')!
const reset = tweak.querySelector<HTMLButtonElement>('#tweak-reset')!
const copy = tweak.querySelector<HTMLButtonElement>('#tweak-copy')!
const inputs = tweak.querySelectorAll<HTMLInputElement>('input[data-key]')

type TouchKey = 'lerp' | 'inertia' | 'multiplier'

const initial: Record<TouchKey, number> = {
  lerp: lenis.options.touch!.lerp as number,
  inertia: lenis.options.touch!.inertia as number,
  multiplier: lenis.options.touch!.multiplier as number,
}

const format = (key: TouchKey, value: number) =>
  key === 'lerp' ? value.toFixed(2) : value.toFixed(2)

const sync = (key: TouchKey, value: number) => {
  ;(lenis.options.touch as Record<string, unknown>)[key] = value
  const out = tweak.querySelector<HTMLOutputElement>(`output[data-out="${key}"]`)
  if (out) out.value = format(key, value)
}

const setInput = (key: TouchKey, value: number) => {
  const input = tweak.querySelector<HTMLInputElement>(`input[data-key="${key}"]`)
  if (!input) return
  input.value = String(value)
  sync(key, value)
}

;(['lerp', 'inertia', 'multiplier'] as TouchKey[]).forEach((key) => {
  setInput(key, initial[key])
})

inputs.forEach((input) => {
  input.addEventListener('input', () => {
    const key = input.dataset.key as TouchKey
    sync(key, parseFloat(input.value))
  })
})

toggle.addEventListener('click', () => {
  const open = tweak.dataset.open !== 'false'
  tweak.dataset.open = String(!open)
  toggle.setAttribute('aria-expanded', String(!open))
})

reset.addEventListener('click', () => {
  ;(['lerp', 'inertia', 'multiplier'] as TouchKey[]).forEach((key) => {
    setInput(key, initial[key])
  })
})

copy.addEventListener('click', async () => {
  const snippet = `touch: {\n  smooth: true,\n  lerp: ${format('lerp', (lenis.options.touch as { lerp: number }).lerp)},\n  inertia: ${format('inertia', (lenis.options.touch as { inertia: number }).inertia)},\n  multiplier: ${format('multiplier', (lenis.options.touch as { multiplier: number }).multiplier)},\n}`
  try {
    await navigator.clipboard.writeText(snippet)
    const original = copy.textContent
    copy.textContent = 'copied'
    setTimeout(() => {
      copy.textContent = original
    }, 1200)
  } catch {
    console.log(snippet)
  }
})

lenis.on('scroll', (lenis) => {
  // console.log(lenis.isScrolling, lenis.isTouch, lenis.isWheel)
  console.log({
    scroll: lenis.y.scroll,
    // rounded: Math.round(lenis.x.scroll),
    actuallScroll: lenis.y.actualScroll,
  })
  // console.log({
  //   scroll: lenis.y.scroll,
  //   rounded: Math.round(lenis.y.scroll),
  //   actualScroll: lenis.y.actualScroll,
  // })

  if (lenis.x.scroll !== lenis.x.actualScroll) {
    console.log('x is not actualScroll')
  }
})

window.lenis = lenis

// const wrapper = document.querySelector('#grid')!

// wrapper.addEventListener('wheel', (e) => {
//   // e.preventDefault()
//   console.log('wheel', e.deltaX, e.deltaY)
// })
