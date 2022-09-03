import { useRect } from '@studio-freight/hamo'
import gsap from 'gsap'
import { useScroll } from 'hooks/use-scroll'
import { clamp } from 'lib/maths'
import { useEffect, useRef, useState } from 'react'
import { useWindowSize } from 'react-use'

import s from './zoom-on-scroll.module.scss'

export const Zoom = ({ children }) => {
  const elementRef = useRef()
  const [wrapperRectRef, wrapperRect] = useRect()
  const [elementRectRef, elementRect] = useRect()

  const { height: windowHeight } = useWindowSize()

  const [windowWidth, setWindowWidth] = useState()

  useScroll(({}) => {
    if (!elementRect) return
    const start = wrapperRect.top - (windowHeight + elementRect.height) / 2
    const end = elementRect.width - elementRect.height

    const progress = clamp(0, window.scrollY - start, end) / end
    const x = progress * (elementRect.width - windowWidth)

    const cards = [...elementRef.current.children]

    gsap.to(cards, {
      scale: -x / 100,
      ease: 'none',
      duration: 0,
    })
  })

  useEffect(() => {
    const onResize = () => {
      setWindowWidth(
        Math.min(window.innerWidth, document.documentElement.offsetWidth)
      )
    }

    window.addEventListener('resize', onResize, false)
    onResize()

    return () => {
      window.removeEventListener('resize', onResize, false)
    }
  }, [])

  return (
    <div
      className={s.wrapper}
      ref={wrapperRectRef}
      // style={elementRect && { height: elementRect.width + 'px' }}
    >
      <div className={s.inner}>
        <div
          ref={(node) => {
            elementRef.current = node
            elementRectRef(node)
          }}
          className={s.overflow}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
