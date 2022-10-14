import { useMediaQuery, useRect } from '@studio-freight/hamo'
import cn from 'clsx'
import { SplitText } from 'gsap/dist/SplitText'
import { useRef } from 'react'
import { useDebounce, useIntersection, useWindowSize } from 'react-use'
import s from './appear-title.module.scss'

export function AppearTitle({ children, visible = true }) {
  const el = useRef()

  const intersection = useIntersection(el, {
    threshold: 1,
  })

  const { width } = useWindowSize()
  const isMobile = useMediaQuery('(max-width: 800px)')

  const [rectRef, rect] = useRect()

  useDebounce(
    () => {
      if (isMobile === false) {
        const splitted = new SplitText(el.current, {
          type: 'lines',
          lineThreshold: 0.3,
          tag: 'span',
          linesClass: s.line,
        })

        splitted.lines.forEach((line, i) => {
          line.style.setProperty('--i', i)
          const text = line.textContent
          line.textContent = ''
          const content = document.createElement('span')
          content.textContent = text
          line.appendChild(content)
        })

        return () => {
          splitted.revert()
        }
      }
    },
    500,
    [width, rect, isMobile]
  )

  return (
    <span
      ref={(node) => {
        el.current = node
        rectRef(node)
      }}
      className={cn(
        s.title,
        intersection?.isIntersecting && visible && s.visible
      )}
    >
      {children}
    </span>
  )
}
