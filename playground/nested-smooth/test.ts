import Lenis from 'lenis'
import { LoremIpsum } from 'lorem-ipsum'

const lorem = new LoremIpsum()

const lenis = new Lenis({
  touch: { smooth: true },
  nested: {
    smooth: true,
    // leave .native scrollers native
    filter: (element) => !element.classList.contains('native'),
  },
})
;(window as unknown as { lenis: Lenis }).lenis = lenis

for (const element of document.querySelectorAll('.fill')) {
  element.innerHTML = lorem.generateParagraphs(10)
}
document.querySelector('#strip-content')!.textContent =
  lorem.generateSentences(20)
;(document.querySelector('#nested-textarea') as HTMLTextAreaElement).value =
  lorem.generateParagraphs(10)

// modal mount/unmount — the sweep/leak check
const toggle = document.querySelector('#toggle-modal') as HTMLButtonElement
let modal: HTMLElement | null = null
let lastModal: HTMLElement | null = null

toggle.addEventListener('click', () => {
  if (modal) {
    modal.remove()
    modal = null
    return
  }
  modal = document.createElement('div')
  modal.id = 'modal'
  modal.innerHTML = `<div>${lorem.generateParagraphs(10)}</div>`
  document.body.appendChild(modal)
  lastModal = modal
})

// live adoption status via Lenis.get
const status = document.querySelector('#status') as HTMLElement

function label(element: Element | null) {
  if (!element) return '—'
  return Lenis.get(element) ? 'adopted' : 'native'
}

function modalLabel() {
  if (modal) return label(modal)
  if (!lastModal) return '—'
  return Lenis.get(lastModal) ? 'unmounted — waiting for sweep…' : 'swept ✓'
}

function raf() {
  status.textContent = [
    `#list (vertical)      ${label(document.querySelector('#list'))}`,
    `#strip (horizontal)   ${label(document.querySelector('#strip'))}`,
    `#outer-list           ${label(document.querySelector('#outer-list'))}`,
    `#inner-list (recurse) ${label(document.querySelector('#inner-list'))}`,
    `.native (filter)      ${label(document.querySelector('.native'))}`,
    `textarea (built-in)   ${label(document.querySelector('#nested-textarea'))}`,
    `modal                 ${modalLabel()}`,
  ].join('\n')
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)
