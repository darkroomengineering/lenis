import { useRect } from '@studio-freight/hamo'
import cn from 'clsx'
import { Card } from 'components/card'
import { useScroll } from 'hooks/use-scroll'
import { clamp, mapRange } from 'lib/maths'
import { useState } from 'react'
import { useWindowSize } from 'react-use'

import s from './feature-cards.module.scss'

const cards = [
  {
    text: 'No polyfills needed',
  },
  {
    text: (
      <>
        Lightweight <br /> (under 3kb)
      </>
    ),
  },
  { text: 'Made for 2022+' },
  { text: 'Bring your own animation library' },
  {
    text: (
      <>
        Built on top of solid ground <br />
        <span className="p-s">(Virtual Scroll)</span>
      </>
    ),
  },
  { text: 'Use any element as scroller' },
  { text: 'Enjoy horizontal + vertical support' },
  { text: 'Feel free to use “position: sticky” again' },
  { text: 'Run scroll in the main thread' },
]

export const FeatureCards = () => {
  const [setRef, rect] = useRect()
  const { height: windowHeight } = useWindowSize()

  const [current, setCurrent] = useState()

  useScroll(
    ({ scroll }) => {
      const start = rect.top - windowHeight / 2
      const end = rect.top + rect.height - windowHeight

      const progress = clamp(-1, mapRange(start, end, scroll, 0, 1), 1)
      const step = Math.floor(progress * 8)
      console.log(step)
      setCurrent(step)
    },
    [rect]
  )

  return (
    <div ref={setRef} className={s.features}>
      <div className={cn('layout-block-inner', s.sticky)}>
        <div>
          {cards.map((card, index) => (
            <SingleCard
              key={index}
              text={card.text}
              number={index + 1}
              current={index <= current}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const SingleCard = ({ text, number, current }) => {
  // const { setRef, inView } = useIsVisible({
  //   threshold: 1,
  //   // rootMargin: '50px',
  //   once: true,
  // })

  // const [setRef, rect] = useRect()
  // const [inView, setInView] = useState()
  // const { height: windowHeight } = useWindowSize()
  // const el = useRef()

  // useScroll(
  //   ({ scroll }) => {
  //     const start = rect.top - windowHeight
  //     const end = start + windowHeight / 2 + rect.height / 2

  //     const progress = clamp(0, mapRange(start, end, scroll, 0, 1), 1)
  //     el.current.style.setProperty('--progress', progress)

  //     // const progress = start
  //     // setInView(scroll > rect.top - windowHeight / 2)
  //   },
  //   [rect]
  // )

  return (
    <div className={cn(s.card, current && s.reset)}>
      <Card background="rgba(239, 239, 239, 0.8)" number={number} text={text} />
    </div>
  )
}
