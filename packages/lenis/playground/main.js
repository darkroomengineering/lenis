import Lenis from '../dist/lenis.esm.js'
import { setupCounter } from './counter.js'
// import './jank.js'
import javascriptLogo from './javascript.svg'
import './style.css'
import viteLogo from '/vite.svg'

const lenis = new Lenis({
  smoothWheel: true,
  syncTouch: true,
})

window.lenis = lenis

function update(deltaTime) {
  lenis.raf(deltaTime)
  requestAnimationFrame(update)

  // console.log(window.scrollY, Math.floor(lenis.scroll))
  // if (window.scrollY !== Math.floor(lenis.scroll)) {
  //   console.log('unsynced', window.scrollY, lenis.scroll)
  // }

  // console.log(window.scrollY, lenis.scroll)
}

requestAnimationFrame((deltaTime) => {
  update(deltaTime)
})

document.querySelector('#app').innerHTML = `
<div>
<div>
<a href="https://vitejs.dev" target="_blank">
  <img src="${viteLogo}" class="logo" alt="Vite logo" />
</a>
<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
  <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
</a>
<h1>Hello Vite!</h1>
<div class="card">
  <button id="counter" type="button"></button>
</div>
<p class="read-the-docs">
  Click on the Vite logo to learn more
</p>
</div>
<div>
<a href="https://vitejs.dev" target="_blank">
  <img src="${viteLogo}" class="logo" alt="Vite logo" />
</a>
<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
  <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
</a>
<h1>Hello Vite!</h1>
<div class="card">
  <button id="counter" type="button"></button>
</div>
<p class="read-the-docs">
  Click on the Vite logo to learn more
</p>
</div>
<div>
<a href="https://vitejs.dev" target="_blank">
  <img src="${viteLogo}" class="logo" alt="Vite logo" />
</a>
<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
  <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
</a>
<h1>Hello Vite!</h1>
<div class="card">
  <button id="counter" type="button"></button>
</div>
<p class="read-the-docs">
  Click on the Vite logo to learn more
</p>
</div>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
  </div>
`

setupCounter(document.querySelector('#counter'))
