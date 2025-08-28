import Lenis from 'lenis'
import { LoremIpsum } from 'lorem-ipsum'

document.querySelector('#work2-content')!.innerHTML =
  new LoremIpsum().generateParagraphs(30)

window.lenis = new Lenis({
  orientation: 'horizontal',
  // gestureOrientation: 'vertical',
  autoRaf: true,
  allowNestedScroll: true,
  // virtualScroll: (data) => {
  //   data.deltaX = 0
  //   // data.deltaY =  0.00001
  //   if (data.deltaY === 0 && data.deltaX === 0) {
  //     data.deltaY = 0.00001
  //   }
  //   console.log(data)
  //   return true
  // },
})

// setInterval(() => {
//   document.querySelector('#work').style.width = `${50 + Math.random() * 30}vw`
// }, 1000)
