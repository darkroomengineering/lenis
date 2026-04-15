import { type LenisRef, ReactLenis, useLenis } from 'lenis/react'
import { LoremIpsum } from 'lorem-ipsum'
import { useRef, useState } from 'react'

function App() {
  const [lorem] = useState(() => new LoremIpsum().generateParagraphs(200))
  const [count, setCount] = useState(0)

  useLenis()

  const lenisRef = useRef<LenisRef>(null)

  return (
    <ReactLenis
      className={`wrapper a-${count}`}
      root="asChild"
      ref={lenisRef}
      options={{ autoToggle: true, syncTouch: true }}
    >
      <div className="debug-panel">
        <button type="button" onClick={() => setCount((c) => c + 1)}>
          Re-render ({count})
        </button>
        <p>
          <strong>DOM className:</strong>
        </p>
        <code id="class-display" />
        <p className="hint">
          Scroll, then click the button. Lenis classes should persist.
        </p>
      </div>
      {lorem}
    </ReactLenis>
  )
}

// Poll DOM className outside React to avoid extra renders
setInterval(() => {
  const wrapper = document.querySelector('.lenis')
  const display = document.getElementById('class-display')
  if (wrapper && display) {
    display.textContent = wrapper.className
  }
}, 100)

export default App
