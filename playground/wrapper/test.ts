import Lenis from 'lenis'
import { LoremIpsum } from 'lorem-ipsum'

const lorem = new LoremIpsum()

for (const p of document.querySelectorAll('section p')) {
  p.textContent = lorem.generateParagraphs(2)
}

const wrapper = document.querySelector('#scroller') as HTMLElement

const lenis = new Lenis({
  wrapper,
  content: wrapper.firstElementChild as HTMLElement,
  touch: { smooth: true },
})
;(window as unknown as { lenis: Lenis }).lenis = lenis
