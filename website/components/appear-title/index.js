import { useMediaQuery, useRect } from '@studio-freight/hamo'
import cn from 'clsx'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/dist/SplitText'
import { useEffect, useRef, useState } from 'react'
import { useIntersection, useWindowSize } from 'react-use'
import s from './appear-title.module.scss'

gsap.registerPlugin(SplitText)

export function AppearTitle({ children, visible = true }) {
  const el = useRef()

  const [intersected, setIntersected] = useState(false)
  const intersection = useIntersection(el, {
    threshold: 1,
  })

  useEffect(() => {
    if (intersection?.isIntersecting) {
      setIntersected(true)
    }
  }, [intersection])

  const { width } = useWindowSize()
  const isMobile = useMediaQuery('(max-width: 800px)')

  const [rectRef, rect] = useRect()

  useEffect(() => {
    if (isMobile === false) {
      const splitted = new SplitText(el.current, {
        type: 'lines',
        lineThreshold: 0.3,
        tag: 'span',
        linesClass: s.line,
      })

      splitted.lines.forEach((line, i) => {
        line.style.setProperty('--i', i)
        const html = line.innerHTML
        line.innerHTML = ''
        const content = document.createElement('span')
        content.innerHTML = html
        line.appendChild(content)
      })

      return () => {
        splitted.revert()
      }
    }
  }, [width, rect, isMobile])

  return (
    <span
      ref={(node) => {
        el.current = node
        rectRef(node)
      }}
      className={cn(s.title, intersected && visible && s.visible)}
    >
      {children}
    </span>
  )
}
