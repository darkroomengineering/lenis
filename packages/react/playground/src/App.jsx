import { LoremIpsum } from 'lorem-ipsum'
import { useState } from 'react'
import ReactLenis, { useLenis } from '../../dist/lenis-react.mjs'
import './App.css'

function App() {
  const [lorem] = useState(() => new LoremIpsum().generateParagraphs(200))

  const lenis = useLenis((e, f) => {
    console.log(e, f)
  })
  console.log(lenis)
  return (
    <>
      {/* <ReactLenis root /> */}
      <ReactLenis className="wrapper" root>
        {lorem}
      </ReactLenis>
    </>
  )
}

export default App
