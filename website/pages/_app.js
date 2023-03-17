import { useDebug, useMediaQuery } from '@studio-freight/hamo'
import { raf } from '@studio-freight/tempus'
import { RealViewport } from 'components/real-viewport'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { useScroll } from 'hooks/use-scroll'
import { GTM_ID } from 'lib/analytics'
import { useStore } from 'lib/store'
import dynamic from 'next/dynamic'
import Script from 'next/script'
import { useEffect } from 'react'
import 'styles/global.scss'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
  ScrollTrigger.defaults({ markers: process.env.NODE_ENV === 'development' })

  // merge rafs
  gsap.ticker.lagSmoothing(0)
  gsap.ticker.remove(gsap.updateRoot)
  raf.add((time) => {
    gsap.updateRoot(time / 1000)
  }, 0)
}

const Stats = dynamic(
  () => import('components/stats').then(({ Stats }) => Stats),
  { ssr: false }
)

const GridDebugger = dynamic(
  () =>
    import('components/grid-debugger').then(({ GridDebugger }) => GridDebugger),
  { ssr: false }
)

const Leva = dynamic(() => import('leva').then(({ Leva }) => Leva), {
  ssr: false,
})

function MyApp({ Component, pageProps }) {
  const isMobile = useMediaQuery('(max-width: 800px)')
  const debug = useDebug()
  const lenis = useStore(({ lenis }) => lenis)
  const overflow = useStore(({ overflow }) => overflow)
  const setOverflow = useStore(({ setOverflow }) => setOverflow)

  useScroll(ScrollTrigger.update)

  useEffect(() => {
    if (overflow) {
      lenis?.start()
      document.documentElement.style.removeProperty('overflow')
    } else {
      lenis?.stop()
      document.documentElement.style.setProperty('overflow', 'hidden')
    }
  }, [lenis, overflow])

  useEffect(() => {
    if (isMobile) setOverflow(true)
  }, [isMobile])

  useEffect(() => {
    if (lenis) ScrollTrigger.refresh()
  }, [lenis])

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
  }, [])

  ScrollTrigger.defaults({ markers: process.env.NODE_ENV === 'development' })

  return (
    <>
      <Leva hidden={!debug} />
      {debug && (
        <>
          <GridDebugger />
          <Stats />
        </>
      )}

      {/* Google Tag Manager - Global base code */}
      {process.env.NODE_ENV !== 'development' && (
        <>
          <Script
            async
            strategy="worker"
            src={`https://www.googletagmanager.com/gtag/js?id=${GTM_ID}`}
          />
          <Script
            id="gtm-base"
            strategy="worker"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GTM_ID}');`,
            }}
          />
        </>
      )}

      <RealViewport />
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
