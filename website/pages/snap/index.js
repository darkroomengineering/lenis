import cn from 'clsx'
import { useEffect, useRef } from 'react'
import Snap from '../../../dist/lenis-snap.mjs'
import Lenis from '../../../dist/lenis.mjs'
import s from './snap.module.scss'

export default function Page() {
  const sectionRefs = useRef([])

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
    })
    window.lenis = lenis

    const snap = new Snap(lenis, {
      type: 'mandatory', // 'mandatory', 'proximity'
      velocityThreshold: 1,
      // duration: 2,
      // easing: (t) => t,
      onSnapStart: (snap) => {
        console.log('onSnapStart', snap)
      },
      onSnapComplete: (snap) => {
        console.log('onSnapComplete', snap)
      },
    })
    window.snap = snap

    const section2 = sectionRefs.current[1]
    const section3 = sectionRefs.current[2]

    // snap.add(500)

    snap.addElement(section2, {
      align: ['start', 'end'], // 'start', 'center', 'end'
    })

    snap.addElement(section3, {
      align: 'center', // 'start', 'center', 'end'
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)
  }, [])

  return (
    <div className={s.page}>
      {Array.from({ length: 4 }).map((_, index) => (
        <section
          key={index}
          className={cn(s.section, s[`section-${index + 1}`])}
          ref={(node) => {
            sectionRefs.current[index] = node
          }}
        >
          <div className={s.inner}></div>
        </section>
      ))}
    </div>
  )
}
