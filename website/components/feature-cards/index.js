import { useRect } from '@studio-freight/hamo'
import cn from 'clsx'
import { Card } from 'components/card'
import { useScroll } from 'hooks/use-scroll'
import { clamp, mapRange } from 'lib/maths'
import { useRef, useState } from 'react'
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
  const element = useRef()
  const [setRef, rect] = useRect()
  const { height: windowHeight } = useWindowSize()

  const [current, setCurrent] = useState()

  useScroll(
    ({ scroll }) => {
      const start = rect.top - windowHeight / 2
      const end = rect.top + rect.height - windowHeight

      const progress = clamp(0, mapRange(start, end, scroll, 0, 1), 1) * 9
      const cards = [...element.current.children]
      cards.forEach((node, i) => {
        node.style.setProperty('--progress', clamp(i, progress, i + 1) - i)
      })

      // element.current.style.setProperty('--progress', progress * 8)
      const step = Math.floor(progress)
      setCurrent(step)
    },
    [rect]
  )

  return (
    <div
      ref={(node) => {
        setRef(node)
      }}
      className={s.features}
    >
      <div className={cn('layout-block-inner', s.sticky)}>
        <aside className={s.title}>
          <p className="h3">
            Lenis brings
            <br />
            <span className="grey">the heat</span>
          </p>
        </aside>
        <div ref={element}>
          {cards.map((card, index) => (
            <SingleCard
              key={index}
              index={index}
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

const SingleCard = ({ text, number, index }) => {
  return (
    <div className={cn(s.card)} style={{ '--i': index }}>
      <Card background="rgba(239, 239, 239, 0.8)" number={number} text={text} />
    </div>
  )
}
