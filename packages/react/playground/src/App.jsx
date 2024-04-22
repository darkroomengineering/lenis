import { LoremIpsum } from 'lorem-ipsum'
import { useState } from 'react'
import ReactLenis from '../../../../dist/lenis-react.mjs'
import './App.css'

function App() {
  const [lorem] = useState(() => new LoremIpsum().generateParagraphs(200))

  return (
    <>
      <ReactLenis root />
      {lorem}
    </>
  )
}

export default App
