import cn from 'clsx'
import { CustomHead } from 'components/custom-head'
import Lenis from 'lenis'
import Snap from 'lenis/snap'
import { useEffect, useRef } from 'react'
import s from './snap.module.scss'

export default function Page() {
  const sectionRefs = useRef([])

  useEffect(() => {
    const lenis = new Lenis({
      // lerp: 0.1,
      prevent: (node) => node.nodeName === 'VERCEL-LIVE-FEEDBACK',
    })
    window.lenis = lenis

    const snap = new Snap(lenis, {
      type: 'mandatory', // 'mandatory', 'proximity'
      velocityThreshold: 1,
      // debounce: 1000,
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

    const section1 = sectionRefs.current[0]
    const section2 = sectionRefs.current[1]
    const section3 = sectionRefs.current[2]
    const section4 = sectionRefs.current[3]

    // snap.add(500)

    snap.addElement(section1, {
      align: ['start', 'end'], // 'start', 'center', 'end'
    })

    snap.addElement(section2, {
      align: 'center', // 'start', 'center', 'end'
    })

    snap.addElement(section3, {
      align: 'center', // 'start', 'center', 'end'
    })

    snap.addElement(section4, {
      align: ['start', 'end'], // 'start', 'center', 'end'
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)
  }, [])

  return (
    <>
      <CustomHead
        {...{
          title: 'Lenis – Get smooth or die trying',
          description:
            'A smooth scroll library fresh out of darkroom.engineering.',
        }}
      />

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
    </>
  )
}
