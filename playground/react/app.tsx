import { ReactLenis, useLenis } from 'lenis/react'
import { LoremIpsum } from 'lorem-ipsum'
import { useRef, useState } from 'react'

function App() {
  const [lorem] = useState(() => new LoremIpsum().generateParagraphs(200))

  const lenis = useLenis((lenis) => {
    // console.log('lenis in callback', lenis)
  })

  const lenisRef = useRef()

  // useEffect(() => {
  //   console.log('lenis ref', lenisRef.current)

  //   function raf(time: number) {
  //     lenisRef.current?.lenis?.raf(time)
  //   }

  //   const rafId = requestAnimationFrame(raf)

  //   return () => cancelAnimationFrame(rafId)
  // }, [lenis])

  return (
    <>
      {/* <ReactLenis root /> */}
      <ReactLenis
        className="wrapper"
        // root
        ref={lenisRef}
        style={{ height: '100vh', overflowY: 'auto' }}
      >
        {lorem}
      </ReactLenis>
    </>
  )
}

export default App
