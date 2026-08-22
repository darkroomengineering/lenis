import Lenis from 'lenis'
import { LoremIpsum } from 'lorem-ipsum'

const lorem = new LoremIpsum()

// cross-axis nested scroller (overflow-y inside a horizontal page)
document.querySelector('#work2-content')!.innerHTML =
  lorem.generateParagraphs(30)
// data-lenis-prevent scroller
document.querySelector('#prevent-content')!.innerHTML =
  lorem.generateParagraphs(10)

const lenis = new Lenis({
  orientation: 'horizontal',
  touch: { smooth: true },
})
;(window as unknown as { lenis: Lenis }).lenis = lenis
