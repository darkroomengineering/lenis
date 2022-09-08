import { useRect } from '@studio-freight/hamo'
import cn from 'clsx'
import { Card } from 'components/card'
import { useScroll } from 'hooks/use-scroll'
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
  return (
    <div className={cn('layout-block', s.features)}>
      {cards.map((card, index) => (
        <SingleCard key={index} text={card.text} number={index + 1} />
      ))}
    </div>
  )
}

const SingleCard = ({ text, number }) => {
  const [setRef, rect] = useRect()
  const [inView, setInView] = useState()
  const { height: windowHeight } = useWindowSize()

  useScroll(({ scroll }) => {
    setInView(scroll > rect.top - windowHeight / 2)
  })

  return (
    <div ref={(node) => setRef(node)} className={cn(s.card, inView && s.reset)}>
      <Card background="rgba(239, 239, 239, 0.8)" number={number} text={text} />
    </div>
  )
}
