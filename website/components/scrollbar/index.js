import { useScroll } from 'hooks/use-scroll'
import { clamp, mapRange } from 'lib/maths'
import { useStore } from 'lib/store'
import { useEffect, useRef, useState } from 'react'
import { useWindowSize } from 'react-use'
import s from './scrollbar.module.scss'

export function Scrollbar({}) {
  const progressBar = useRef()
  const { width: windowWidth, height: windowHeight } = useWindowSize()
  const lenis = useStore(({ lenis }) => lenis)

  useScroll(({ scroll, limit }) => {
    const progress = scroll / limit
    progressBar.current.style.transform = `scaleX(${progress})`
  })

  const [clicked, setClicked] = useState(false)

  useEffect(() => {
    if (!clicked) return

    function onPointerMove(e) {
      e.preventDefault()

      const offset = (windowHeight - innerHeight) / 2
      const y = mapRange(
        0,
        windowHeight,
        e.clientY,
        -offset,
        innerHeight + offset
      )

      const progress = clamp(0, y / innerHeight, 1)
      const newPos = lenis.limit * progress

      lenis.direction === 'vertical'
        ? window.scrollTo(0, newPos)
        : window.scrollTo(newPos, 0)
    }

    function onPointerUp() {
      setClicked(false)
    }

    window.addEventListener('pointermove', onPointerMove, false)
    window.addEventListener('pointerup', onPointerUp, false)

    return () => {
      window.removeEventListener('pointermove', onPointerMove, false)
      window.removeEventListener('pointerup', onPointerUp, false)
    }
  }, [clicked, windowHeight, windowWidth, lenis])

  return (
    <div className={s.scrollbar}>
      <div ref={progressBar} className={s.inner} />
    </div>
  )
}
