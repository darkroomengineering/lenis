import { useMediaQuery, useRect } from '@studio-freight/hamo'
import cn from 'clsx'
import gsap from 'gsap'
import { useScroll } from 'hooks/use-scroll'
import { clamp, mapRange } from 'lib/maths'
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

  useScroll(({ scroll }) => {
    if (!elementRect || !elementRef.current) return

    const start = wrapperRect.top - windowHeight
    const end = wrapperRect.top + wrapperRect.height - windowHeight

    let progress = mapRange(start, end, scroll, 0, 1)
    progress = clamp(0, progress, 1)

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
      style={
        elementRect && isMobile === false
          ? { height: elementRect.width + 'px' }
          : {}
      }
    >
      <div className={s.inner}>
        {/* {isMobile === false ? ( */}
        <div
          ref={(node) => {
            elementRef.current = node
            elementRectRef(node)
          }}
          className={cn(s.overflow, 'hide-on-mobile')}
        >
          {children}
        </div>
        {/* ) : ( */}
        <div className={cn(s.cards, 'hide-on-desktop')}>{children}</div>
        {/* )} */}
      </div>
    </div>
  )
}
