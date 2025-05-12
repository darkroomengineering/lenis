import Lenis from 'lenis'
import { LoremIpsum } from 'lorem-ipsum'

document.querySelector('#work2-content')!.innerHTML =
  new LoremIpsum().generateParagraphs(30)

window.lenis = new Lenis({
  orientation: 'horizontal',
  gestureOrientation: 'both',
  autoRaf: true,
  allowNestedScroll: true,
})

// setInterval(() => {
//   document.querySelector('#work').style.width = `${50 + Math.random() * 30}vw`
// }, 1000)
