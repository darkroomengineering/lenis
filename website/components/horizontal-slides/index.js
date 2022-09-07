import { useMediaQuery, useRect } from '@studio-freight/hamo'
import gsap from 'gsap'
import { useScroll } from 'hooks/use-scroll'
import { clamp } from 'lib/maths'
import { useEffect, useRef, useState } from 'react'
import { useWindowSize } from 'react-use'

import s from './horizontal-slides.module.scss'

export const HorizontalSlides = ({ children }) => {
  const elementRef = useRef(null)
  const isMobile = useMediaQuery('(max-width: 800px)')
  const [wrapperRectRef, wrapperRect] = useRect()
  const [elementRectRef, elementRect] = useRect()

  const { height: windowHeight } = useWindowSize()

  const [windowWidth, setWindowWidth] = useState()

  useScroll(({}) => {
    if (!elementRect || !elementRef.current) return
    const headerHeight = 0
    const start =
      wrapperRect.top - (windowHeight + headerHeight - elementRect.height) / 2
    const end = elementRect.width - elementRect.height

    const progress = clamp(0, window.scrollY - start, end) / end
    const x = progress * (elementRect.width - windowWidth)

    const cards = [...elementRef.current.children]

    gsap.to(cards, {
      x: -x,
      stagger: 0.033,
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
      style={elementRect && { height: elementRect.width + 'px' }}
    >
      <div className={s.inner}>
        {isMobile === false ? (
          <div
            ref={(node) => {
              elementRef.current = node
              elementRectRef(node)
            }}
            className={s.overflow}
          >
            {children}
          </div>
        ) : (
          <div className={s.cards}>{children}</div>
        )}
      </div>
    </div>
  )
}
