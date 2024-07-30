import { LoremIpsum } from 'lorem-ipsum'
import { useState } from 'react'
import ReactLenis, { useLenis } from '../../dist/lenis-react'
import './App.css'

function App() {
  const [lorem] = useState(() => new LoremIpsum().generateParagraphs(200))

  const lenis = useLenis((lenis) => {
    console.log('lenis in callback', lenis)
  })

  console.log('lenis in render', lenis)

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
