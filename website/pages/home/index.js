import { Button } from 'components/button'
import { Card } from 'components/card'
import { ListItem } from 'components/list-item'
import { Layout } from 'layouts/default'
import dynamic from 'next/dynamic'

const GitHub = dynamic(() => import('icons/github.svg'), { ssr: false })

export default function Home() {
  return (
    <Layout theme="light">
      <section className="layout-block">🚧</section>
      <section className="layout-block">
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
      <section className="layout-block">
        <Button arrow>No icon</Button>
        <Button>No icon No Arrow</Button>
        <Button arrow icon={<GitHub />}>
          check it out on github
        </Button>
      </section>
      <section className="layout-block">
        <Card
          number="04"
          text="Loss of performance budget due to using CSS transforms"
        />
        <Card number="09" text="Run scroll in the main thread" />
      </section>
      <section className="layout-block">
        <p className="h1">
          h1 Lorem ipsum, dolor sit amet consectetur adipisicing elit. Corporis
          reprehenderit aspernatur cumque praesentium distinctio rerum
          laboriosam, eveniet perspiciatis voluptates? Adipisci nulla magnam,
          rerum nemo iure tempora minima vitae quo officiis!
        </p>
        <p className="h2">
          h2 Lorem ipsum, dolor sit amet consectetur adipisicing elit. Corporis
          reprehenderit aspernatur cumque praesentium distinctio rerum
          laboriosam, eveniet perspiciatis voluptates? Adipisci nulla magnam,
          rerum nemo iure tempora minima vitae quo officiis!
        </p>
        <p className="h3">
          h3 Lorem ipsum, dolor sit amet consectetur adipisicing elit. Corporis
          reprehenderit aspernatur cumque praesentium distinctio rerum
          laboriosam, eveniet perspiciatis voluptates? Adipisci nulla magnam,
          rerum nemo iure tempora minima vitae quo officiis!
        </p>
        <p className="h4">
          h4 Lorem ipsum, dolor sit amet consectetur adipisicing elit. Corporis
          reprehenderit aspernatur cumque praesentium distinctio rerum
          laboriosam, eveniet perspiciatis voluptates? Adipisci nulla magnam,
          rerum nemo iure tempora minima vitae quo officiis!
        </p>
        <p className="p-l">
          p-l Lorem ipsum, dolor sit amet consectetur adipisicing elit. Corporis
          reprehenderit aspernatur cumque praesentium distinctio rerum
          laboriosam, eveniet perspiciatis voluptates? Adipisci nulla magnam,
          rerum nemo iure tempora minima vitae quo officiis!
        </p>
        <p className="p">
          p Lorem ipsum, dolor sit amet consectetur adipisicing elit. Corporis
          reprehenderit aspernatur cumque praesentium distinctio rerum
          laboriosam, eveniet perspiciatis voluptates? Adipisci nulla magnam,
          rerum nemo iure tempora minima vitae quo officiis!
        </p>
        <p className="p-s">
          p-s Lorem ipsum, dolor sit amet consectetur adipisicing elit. Corporis
          reprehenderit aspernatur cumque praesentium distinctio rerum
          laboriosam, eveniet perspiciatis voluptates? Adipisci nulla magnam,
          rerum nemo iure tempora minima vitae quo officiis!
        </p>
      </section>
    </Layout>
  )
}

export async function getStaticProps() {
  return {
    props: {
      id: 'home',
    }, // will be passed to the page component as props
  }
}
