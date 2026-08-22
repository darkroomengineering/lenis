import Lenis from 'lenis'
import { LoremIpsum } from 'lorem-ipsum'

const lorem = new LoremIpsum()

// same-axis nested scroller (overflow-y inside a vertical page)
document.querySelector('#work-content')!.innerHTML =
  lorem.generateParagraphs(30)
// cross-axis nested scroller (overflow-x) — one long unwrapped line
document.querySelector('#work2-content')!.textContent =
  lorem.generateSentences(30)
// data-lenis-prevent scroller
document.querySelector('#prevent-content')!.innerHTML =
  lorem.generateParagraphs(10)

const lenis = new Lenis({
  touch: { smooth: true },
})
;(window as unknown as { lenis: Lenis }).lenis = lenis
