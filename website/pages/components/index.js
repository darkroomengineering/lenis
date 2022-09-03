import cn from 'clsx'
import { Button } from 'components/button'
import { Card } from 'components/card'
import { ListItem } from 'components/list-item'
import { Layout } from 'layouts/default'
import dynamic from 'next/dynamic'

import s from './components.module.scss'

const GitHub = dynamic(() => import('icons/github.svg'), { ssr: false })

export default function Components() {
  return (
    <Layout
      theme="dark"
      seo={{
        title: 'Lenis',
        description:
          'A new smooth scroll library fresh out of the Studio Freight Darkroom',
      }}
    >
      <section className="layout-block">🚧</section>
      <section className={cn('layout-block', s.list)}>
        <h1 className="h2">List Component</h1>
        <ListItem
          title="How to Animate SVG Shapes on Scroll"
          source="Codrops"
          href=""
        />
        <ListItem
          title="Scroll Animation Ideas for Image Grids"
          source="Codrops"
          href=""
        />
        <ListItem
          title="How to Animate SVG Shapes on Scroll"
          source="Codrops"
          href=""
        />
      </section>
      <section className={cn('layout-block', s.buttons)}>
        <h1 className="h2">button Component</h1>
        <Button arrow>No icon</Button>
        <Button>No icon No Arrow</Button>
        <Button arrow icon={<GitHub />}>
          check it out on github
        </Button>
      </section>
      <section className={cn('layout-block', s.cards)}>
        <h1 className="h2">card Component</h1>
        <div className={s['cards-group']}>
          <Card
            className={s.card}
            number="04"
            text="Loss of performance budget due to using CSS transforms"
          />
          <Card
            inverted
            className={s.card}
            number="09"
            text="Run scroll in the main thread"
          />
        </div>
      </section>
    </Layout>
  )
}

export async function getStaticProps() {
  return {
    props: {
      id: 'components',
    }, // will be passed to the page component as props
  }
}
