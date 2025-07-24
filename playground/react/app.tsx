import { ReactLenis, useLenis, type LenisRef } from 'lenis/react'
import { LoremIpsum } from 'lorem-ipsum'
import { useEffect, useRef, useState } from 'react'

function App() {
  const [lorem] = useState(() => new LoremIpsum().generateParagraphs(200))

  const lenis = useLenis((lenis) => {
    console.log('lenis in callback', lenis)
  })

  const lenisRef = useRef<LenisRef>(null)

  useEffect(() => {
    console.log('lenis ref', lenisRef.current)
  }, [lenisRef])

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
        root="asChild"
        sfsdfdsf="dssdfs"
        ref={lenisRef}
      >
        {lorem}
      </ReactLenis>
    </>
  )
}

export default App
