import { useRect } from '@studio-freight/hamo'
import { useScroll } from 'hooks/use-scroll'
import { truncate } from 'lib/maths'
import { useRef } from 'react'
import { useWindowSize } from 'react-use'
import s from './marquee-scroll.module.scss'

export function MarqueeScroll({ children, className, repeat = 2 }) {
  const el = useRef()

  const [setRef, rect] = useRect()
  const { height: windowHeight } = useWindowSize()

  useScroll(
    ({ scroll }) => {
      if (!rect.top) return
      const scrollY = scroll

      const progress = -truncate((scrollY * 0.1) % 100, 3)

      const top = rect.top - scrollY

      const inView = top + rect.height > 0 && top < windowHeight

      if (inView) {
        el.current.style.setProperty('--marquee-progress', progress + '%')
      }
    },
    [rect, windowHeight]
  )

  return (
    <div
      ref={(node) => {
        el.current = node
        setRef(node)
      }}
      className={className}
    >
      <div className={s.marquee}>
        {new Array(repeat).fill(children).map((_, i) => (
          <div key={i} className={s.inner}>
            {children}
          </div>
        ))}
      </div>
    </div>
  )
}
