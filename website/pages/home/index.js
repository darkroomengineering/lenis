import cn from 'clsx'
import { Button } from 'components/button'
import { Card } from 'components/card'
import { HorizontalSlides } from 'components/horizontal-slides'
import { Parallax } from 'components/parallax'
import gsap from 'gsap'
import { useScroll } from 'hooks/use-scroll'
import { Layout } from 'layouts/default'
import dynamic from 'next/dynamic'
import { useRef, useState } from 'react'
import s from './home.module.scss'

const SFDR = dynamic(() => import('icons/sfdr.svg'), { ssr: false })
const GitHub = dynamic(() => import('icons/github.svg'), { ssr: false })

export default function Home() {
  const [hasScrolled, setHasScrolled] = useState()
  const zoomRef = useRef(null)

  useScroll(({ scroll }) => {
    setHasScrolled(scroll > 10)

    gsap.to(zoomRef.current, {
      scale: scroll / 10000,
      ease: 'none',
      duration: 0,
    })
  })

  return (
    <Layout
      theme="dark"
      seo={{
        title: 'Lenis',
        description:
          'A new smooth scroll library fresh out of the Studio Freight Darkroom',
      }}
    >
      <section className={s.hero}>
        <div className="layout-grid">
          <h1 className={s.title}>Lenis</h1>
          <SFDR className={s.icon} />
          <span className={s.sub}>
            <h2 className={cn('h3', s.subtitle)}>Smooth Scroll</h2>
            <h2 className={cn('p-s', s.tm)}>
              <span>©</span> {new Date().getFullYear()} sTUDIO FREIGHT
            </h2>
          </span>
        </div>

        <div className={cn(s.bottom, 'layout-grid')}>
          <div
            className={cn(
              'hide-on-mobile',
              s['scroll-hint'],
              hasScrolled && s.hide
            )}
          >
            <p className={s.text}>
              scroll <br /> to explore
            </p>
          </div>
          <p className={cn(s.description, 'p-s')}>
            A new smooth scroll library <br /> fresh out of the <br /> Studio
            Freight Darkroom
          </p>
          <Button
            className={s.cta}
            arrow
            icon={<GitHub />}
            href="https://github.com/studio-freight/lenis"
          >
            Check it out on github
          </Button>
        </div>
      </section>
      <section className={s.why}>
        <div className="layout-grid">
          <p className={cn(s.sticky, 'h2')}>
            <a href="#top">Why smooth scroll?</a>
          </p>
          <aside className={s.features}>
            <div className={s.feature}>
              <p className="p">
                We’ve heard all the reasons to not use smooth scroll. It feels
                hacky. It’s inaccessible. It’s not performant. It’s
                over-engineered. And historically, those were all true. But we
                like to imagine things as they could be, then build them. So,
                why should you use smooth scroll?
              </p>
            </div>
            <div className={s.feature}>
              <h4 className={cn(s.title, 'h4')}>
                Create more immersive interfaces
              </h4>
              <p className="p">
                Unlock the creative potential and impact of your web
                experiences. Smoothing the scroll pulls users into the flow of
                the experience that feels so substantial that they forget
                they’re navigating a web page.
              </p>
            </div>
            <div className={s.feature}>
              <h4 className={cn(s.title, 'h4')}>
                Normalize all your user inputs
              </h4>
              <p className="p">
                Give all your users the same (dope) experience whether they’re
                using trackpads, mouse wheels, or otherwise. With smooth scroll,
                you control how silky, heavy, or responsive the experience
                should be — no matter the input. Magic!
              </p>
            </div>
            <div className={s.feature}>
              <h4 className={cn(s.title, 'h4')}>
                Make your animations flawless
              </h4>
              <p className="p">
                Synchronization with native scroll is not reliable. Those jumps
                and delays with scroll-linked animations are caused by
                multi-threading, where modern browsers run animations/effects
                asynchronously with the scroll. Smooth scroll fixes this.
              </p>
            </div>
          </aside>
        </div>
      </section>
      <section className={s.rethink}>
        <div className={cn('layout-grid', s.pre)}>
          <div className={s.highlight}>
            <Parallax speed={-0.5}>
              <p className="h2">Rethinking smooth scroll</p>
            </Parallax>
          </div>
          <div className={s.comparison}>
            <Parallax speed={0.5}>
              <p className="p">
                We have to give props to libraries like{' '}
                <span className="contrast">Locomotive Scroll</span> and{' '}
                <span className="contrast">GSAP SmoothScroller</span>. They’re
                well built and well documented – and we’ve used them a lot. But
                they still have issues that keep them from being bulletproof.
              </p>
            </Parallax>
          </div>
        </div>
        <div className={s.cards}>
          <HorizontalSlides>
            <Card
              className={s.card}
              number="01"
              text="Loss of performance budget due to using CSS transforms"
            />
            <Card
              className={s.card}
              number="02"
              text="Inaccessibility from no page search support and native scrollbar"
            />
            <Card
              className={s.card}
              number="03"
              text="Non-negligible import costs (12.1kb - 24.34kb gzipped)"
            />
            <Card
              className={s.card}
              number="04"
              text="Limited animation systems for complex, scroll-based animations"
            />
            <Card
              className={s.card}
              number="05"
              text="Erasing native APIs like Intersection-Observer, CSS Sticky, etc."
            />
          </HorizontalSlides>
        </div>
      </section>
      <section className={cn(s.solution, 'layout-block')}>
        <h2 className={cn(s.first, 'h1')}>
          so we built <br />
          <span className="contrast">web scrolling</span>
        </h2>
        <h2 className={cn(s.second, 'h1')}>As it should be</h2>

        <div ref={zoomRef} className={s.enter}>
          <h2 className={cn(s.zoom, 'h3')}>
            Enter <br /> Lenis
          </h2>
        </div>
      </section>
      <section className="layout-block">
        <p className="h1">🚧 under construction 🚧</p>
      </section>

      {/* <section className={s.enter}> */}
      {/* <Zoom> */}
      {/* </Zoom> */}
      {/* </section> */}
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
