import { useRect } from '@studio-freight/hamo'
import cn from 'clsx'

import { Button } from 'components/button'
import { Card } from 'components/card'
import { Title } from 'components/intro'
import { Link } from 'components/link'
import { ListItem } from 'components/list-item'
import { projects } from 'content/projects'
import { useScroll } from 'hooks/use-scroll'
import { Layout } from 'layouts/default'
import { button, useControls } from 'leva'
import { clamp, mapRange } from 'lib/maths'
import { useStore } from 'lib/store'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { useIntersection, useWindowSize } from 'react-use'
import s from './home.module.scss'

const SFDR = dynamic(() => import('icons/sfdr.svg'), { ssr: false })
const GitHub = dynamic(() => import('icons/github.svg'), { ssr: false })

const Parallax = dynamic(
  () => import('components/parallax').then((mod) => mod.Parallax),
  { ssr: false }
)

const AppearTitle = dynamic(
  () => import('components/appear-title').then((mod) => mod.AppearTitle),
  { ssr: false }
)

const HorizontalSlides = dynamic(
  () =>
    import('components/horizontal-slides').then((mod) => mod.HorizontalSlides),
  { ssr: false }
)

const FeatureCards = dynamic(
  () => import('components/feature-cards').then((mod) => mod.FeatureCards),
  { ssr: false }
)

const WebGL = dynamic(
  () => import('components/webgl').then(({ WebGL }) => WebGL),
  { ssr: false }
)

const HeroTextIn = ({ children, introOut }) => {
  return (
    <div className={cn(s['hide-text'], introOut && s['show-text'])}>
      {children}
    </div>
  )
}

export default function Home() {
  const [hasScrolled, setHasScrolled] = useState()
  const zoomRef = useRef(null)
  const [zoomWrapperRectRef, zoomWrapperRect] = useRect()
  const { height: windowHeight } = useWindowSize()
  const introOut = useStore(({ introOut }) => introOut)

  const [theme, setTheme] = useState('dark')
  const lenis = useStore(({ lenis }) => lenis)

  useControls(
    'lenis',
    () => ({
      stop: button(() => {
        lenis.stop()
      }),
      start: button(() => {
        lenis.start()
      }),
    }),
    [lenis]
  )

  useControls(
    'scrollTo',
    () => ({
      immediate: button(() => {
        lenis.scrollTo(30000, { immediate: true })
      }),
      smoothDuration: button(() => {
        lenis.scrollTo(30000, { lock: true, duration: 10 })
      }),
      smooth: button(() => {
        lenis.scrollTo(30000)
      }),
      forceScrollTo: button(() => {
        lenis.scrollTo(30000, { force: true })
      }),
    }),
    [lenis]
  )

  useScroll(({ scroll }) => {
    setHasScrolled(scroll > 10)
    if (!zoomWrapperRect.top) return

    const start = zoomWrapperRect.top + windowHeight * 0.5
    const end = zoomWrapperRect.top + zoomWrapperRect.height - windowHeight

    const progress = clamp(0, mapRange(start, end, scroll, 0, 1), 1)
    const center = 0.6
    const progress1 = clamp(0, mapRange(0, center, progress, 0, 1), 1)
    const progress2 = clamp(0, mapRange(center - 0.055, 1, progress, 0, 1), 1)
    setTheme(progress2 === 1 ? 'light' : 'dark')

    zoomRef.current.style.setProperty('--progress1', progress1)
    zoomRef.current.style.setProperty('--progress2', progress2)

    if (progress === 1) {
      zoomRef.current.style.setProperty('background-color', 'currentColor')
    } else {
      zoomRef.current.style.removeProperty('background-color')
    }
  })

  const [whyRectRef, whyRect] = useRect()
  const [cardsRectRef, cardsRect] = useRect()
  const [whiteRectRef, whiteRect] = useRect()
  const [featuresRectRef, featuresRect] = useRect()
  const [inuseRectRef, inuseRect] = useRect()

  const addThreshold = useStore(({ addThreshold }) => addThreshold)

  useEffect(() => {
    addThreshold({ id: 'top', value: 0 })
  }, [])

  useEffect(() => {
    const top = whyRect.top - windowHeight / 2
    addThreshold({ id: 'why-start', value: top })
    addThreshold({
      id: 'why-end',
      value: top + whyRect.height,
    })
  }, [whyRect])

  useEffect(() => {
    const top = cardsRect.top - windowHeight / 2
    addThreshold({ id: 'cards-start', value: top })
    addThreshold({ id: 'cards-end', value: top + cardsRect.height })
    addThreshold({
      id: 'red-end',
      value: top + cardsRect.height + windowHeight,
    })
  }, [cardsRect])

  useEffect(() => {
    const top = whiteRect.top - windowHeight
    addThreshold({ id: 'light-start', value: top })
  }, [whiteRect])

  useEffect(() => {
    const top = featuresRect.top
    addThreshold({ id: 'features', value: top })
  }, [featuresRect])

  useEffect(() => {
    const top = inuseRect.top
    addThreshold({ id: 'in-use', value: top })
  }, [inuseRect])

  useEffect(() => {
    const top = lenis?.limit
    addThreshold({ id: 'end', value: top })
  }, [lenis?.limit])

  useScroll((e) => {
    // console.log(
    //   window.scrollY,
    //   e.scroll,
    //   e.targetScroll,
    //   e.animatedScroll,
    //   e.velocity
    // )
    console.log(e.scroll, e.progress)
  })

  const inUseRef = useRef()

  const [visible, setIsVisible] = useState(false)
  const intersection = useIntersection(inUseRef, {
    threshold: 0.2,
  })
  useEffect(() => {
    if (intersection?.isIntersecting) {
      setIsVisible(true)
    }
  }, [intersection])

  return (
    <Layout
      theme={theme}
      seo={{
        title: 'Lenis – Get smooth or die trying',
        description:
          'A new smooth scroll library fresh out of the Studio Freight Darkroom',
      }}
      className={s.home}
    >
      <div className={s.canvas}>
        <WebGL />
      </div>

      <section className={s.hero}>
        <div className="layout-grid-inner">
          <Title className={s.title} />
          <SFDR className={cn(s.icon, introOut && s.show)} />
          <span className={cn(s.sub)}>
            <HeroTextIn introOut={introOut}>
              <h2 className={cn('h3', s.subtitle)}>Smooth Scroll</h2>
            </HeroTextIn>
            <HeroTextIn introOut={introOut}>
              <h2 className={cn('p-xs', s.tm)}>
                <span>©</span> {new Date().getFullYear()} Studio Freight
              </h2>
            </HeroTextIn>
          </span>
        </div>

        <div className={cn(s.bottom, 'layout-grid')}>
          <div
            className={cn(
              'hide-on-mobile',
              s['scroll-hint'],
              hasScrolled && s.hide,
              introOut && s.show
            )}
          >
            <div className={s.text}>
              <HeroTextIn introOut={introOut}>
                <p>scroll</p>
              </HeroTextIn>
              <HeroTextIn introOut={introOut}>
                <p> to explore</p>
              </HeroTextIn>
            </div>
          </div>
          <h1 className={cn(s.description, 'p-s')}>
            <HeroTextIn introOut={introOut}>
              <p className="p-s"> A new smooth scroll library</p>
            </HeroTextIn>
            <HeroTextIn introOut={introOut}>
              <p className="p-s">fresh out of the</p>
            </HeroTextIn>
            <HeroTextIn introOut={introOut}>
              <p className="p-s">Studio Freight Darkroom</p>
            </HeroTextIn>
          </h1>
          <Button
            className={cn(s.cta, introOut && s.in)}
            arrow
            icon={<GitHub />}
            href="https://github.com/studio-freight/lenis"
          >
            Check it out on github
          </Button>
        </div>
      </section>
      <section className={s.why} data-lenis-scroll-snap-align="start">
        <div className="layout-grid">
          <h2 className={cn(s.sticky, 'h2')}>
            <AppearTitle>Why smooth scroll?</AppearTitle>
          </h2>
          <aside className={s.features} ref={whyRectRef}>
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
              <h3 className={cn(s.title, 'h4')}>
                Create more immersive interfaces
              </h3>
              <p className="p">
                Unlock the creative potential and impact of your web
                experiences. Smoothing the scroll pulls users into the flow of
                the experience that feels so substantial that they forget
                they’re navigating a web page.
              </p>
            </div>
            <div className={s.feature}>
              <h3 className={cn(s.title, 'h4')}>
                Normalize all your user inputs
              </h3>
              <p className="p">
                Give all your users the same (dope) experience whether they’re
                using trackpads, mouse wheels, or otherwise. With smooth scroll,
                you control how silky, heavy, or responsive the experience
                should be — no matter the input. Magic!
              </p>
            </div>
            <div className={s.feature}>
              <h3 className={cn(s.title, 'h4')}>
                Make your animations flawless
              </h3>
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
          <div className={s.highlight} data-lenis-scroll-snap-align="start">
            <Parallax speed={-0.5}>
              <p className="h2">
                <AppearTitle>Rethinking smooth scroll</AppearTitle>
              </p>
            </Parallax>
          </div>
          <div className={s.comparison}>
            <Parallax speed={0.5}>
              <p className="p">
                We have to give props to libraries like{' '}
                <Link
                  className="contrast semi-bold"
                  href="https://github.com/locomotivemtl/locomotive-scroll"
                >
                  Locomotive Scroll
                </Link>{' '}
                and{' '}
                <Link
                  className="contrast semi-bold"
                  href="https://greensock.com/docs/v3/Plugins/ScrollSmoother"
                >
                  GSAP ScrollSmoother
                </Link>
                . They’re well built and well documented – and we’ve used them a
                lot. But they still have issues that keep them from being
                bulletproof.
              </p>
            </Parallax>
          </div>
        </div>
        <div className={s.cards} ref={cardsRectRef}>
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
      <section
        ref={(node) => {
          zoomWrapperRectRef(node)
          zoomRef.current = node
        }}
        className={s.solution}
      >
        <div className={s.inner}>
          <div className={s.zoom}>
            <h2 className={cn(s.first, 'h1 vh')}>
              so we built <br />
              <span className="contrast">web scrolling</span>
            </h2>
            <h2 className={cn(s.enter, 'h3 vh')}>
              Enter <br /> Lenis
            </h2>
            <h2 className={cn(s.second, 'h1 vh')}>As it should be</h2>
          </div>
        </div>
      </section>
      <section className={cn('theme-light', s.featuring)} ref={whiteRectRef}>
        <div className={s.inner}>
          <div className={cn('layout-block', s.intro)}>
            <p className="p-l">
              Lenis is an{' '}
              <Link
                className="contrast semi-bold"
                href="https://github.com/studio-freight/lenis"
              >
                open-source library
              </Link>{' '}
              built to standardize scroll experiences and sauce up websites with
              butter-smooth navigation, all while using the platform and keeping
              it accessible.
            </p>
          </div>
        </div>
        <section ref={featuresRectRef}>
          <FeatureCards />
        </section>
      </section>
      <section
        ref={(node) => {
          inuseRectRef(node)
          inUseRef.current = node
        }}
        className={cn('theme-light', s['in-use'], visible && s.visible)}
      >
        <div className="layout-grid">
          <aside className={s.title}>
            <p className="h3">
              <AppearTitle>
                Lenis
                <br />
                <span className="grey">in use</span>
              </AppearTitle>
            </p>
          </aside>
          <ul className={s.list}>
            {projects.map(({ title, source, href }, i) => (
              <li key={i}>
                <ListItem
                  title={title}
                  source={source}
                  href={href}
                  index={i}
                  visible={visible}
                />
              </li>
            ))}
          </ul>
        </div>
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
