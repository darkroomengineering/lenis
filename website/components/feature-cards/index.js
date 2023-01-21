import { useRect } from '@studio-freight/hamo'
import cn from 'clsx'

import { Card } from 'components/card'
import { useScroll } from 'hooks/use-scroll'
import { clamp, mapRange } from 'lib/maths'
import dynamic from 'next/dynamic'
import { useRef, useState } from 'react'
import { useWindowSize } from 'react-use'

const AppearTitle = dynamic(
  () => import('components/appear-title').then((mod) => mod.AppearTitle),
  { ssr: false }
)

import s from './feature-cards.module.scss'

const cards = [
  { text: 'Run scroll in the main thread' },

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
    text: <>CONTROL THE SCROLL EASING DURATION</>,
  },
  { text: 'Use any element as scroller' },
  { text: 'Enjoy horizontal + vertical support' },
  { text: 'Feel free to use “position: sticky” again' },
  {
    text: 'touch support',
  },
]

export const FeatureCards = () => {
  const element = useRef()
  const [setRef, rect] = useRect()
  const { height: windowHeight } = useWindowSize()

  const [current, setCurrent] = useState()

  useScroll(
    ({ scroll }) => {
      const start = rect.top - windowHeight * 2
      const end = rect.top + rect.height - windowHeight

      const progress = clamp(0, mapRange(start, end, scroll, 0, 1), 1)

      element.current.style.setProperty(
        '--progress',
        clamp(0, mapRange(rect.top, end, scroll, 0, 1), 1)
      )
      const step = Math.floor(progress * 10)
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
            <AppearTitle>
              Lenis brings
              <br />
              <span className="grey">the heat</span>
            </AppearTitle>
          </p>
        </aside>
        <div ref={element}>
          {cards.map((card, index) => (
            <SingleCard
              key={index}
              index={index}
              text={card.text}
              number={index + 1}
              current={index <= current - 1}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const SingleCard = ({ text, number, index, current }) => {
  return (
    <div className={cn(s.card, current && s.current)} style={{ '--i': index }}>
      <Card background="rgba(239, 239, 239, 0.8)" number={number} text={text} />
    </div>
  )
}
