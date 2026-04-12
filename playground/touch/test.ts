import Lenis from 'lenis'
import { LoremIpsum } from 'lorem-ipsum'

// Same content in both columns so they're directly comparable
const lorem = new LoremIpsum({
  sentencesPerParagraph: { min: 4, max: 8 },
  wordsPerSentence: { min: 6, max: 14 },
})

function buildContent() {
  const parts: string[] = []
  for (let i = 0; i < 20; i++) {
    parts.push(`<h2>Section ${i + 1}</h2>`)
    parts.push(`<p>${lorem.generateParagraphs(1)}</p>`)
    if (i % 4 === 3) {
      parts.push(
        `<div class="block">block #${i + 1} — padding / line / numbers 0123456789</div>`
      )
    }
  }
  return parts.join('')
}

const html = buildContent()
document.querySelector('#native-content')!.innerHTML = html
document.querySelector('#lenis-content')!.innerHTML = html

const lenisWrapper = document.querySelector('#lenis-scroll') as HTMLElement
const lenisContent = document.querySelector('#lenis-content') as HTMLElement

let lenis: Lenis | undefined

function createLenis(touchSmooth: boolean) {
  lenis?.destroy()
  lenis = new Lenis({
    wrapper: lenisWrapper,
    content: lenisContent,
    touch: {
      smooth: touchSmooth,
      // inertia: 2,
      // lerp: 0.1,
      // ios: {
      //   inertia: 1.7,
      //   lerp: 0.05,
      // },
    },
  })
  // Expose for quick console poking on the phone (if remote-debugged)
  ;(window as unknown as { lenis: Lenis }).lenis = lenis
}

createLenis(true)

// -------- controls --------
const smoothToggle = document.querySelector('#touch-smooth') as HTMLInputElement
smoothToggle.checked = true
smoothToggle.addEventListener('change', () => {
  createLenis(smoothToggle.checked)
})

// -------- live readouts --------
const nativeScrollEl = document.querySelector('#native-scroll') as HTMLElement
const nativeVal = document.querySelector('#readout-native') as HTMLElement
const lenisVal = document.querySelector('#readout-lenis') as HTMLElement
const velVal = document.querySelector('#readout-velocity') as HTMLElement
const stateVal = document.querySelector('#readout-state') as HTMLElement

function tick() {
  const n = Math.round(nativeScrollEl.scrollTop)
  const l = Math.round(lenis?.scroll ?? 0)
  const v = (lenis?.velocity ?? 0).toFixed(2)
  nativeVal.textContent = String(n)
  lenisVal.textContent = String(l)
  velVal.textContent = v
  stateVal.textContent = lenis?.isScrolling ? String(lenis.isScrolling) : 'idle'
  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)
