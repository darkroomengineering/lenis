import {
  useFrame,
  useIsTouchDevice,
  useLayoutEffect,
} from '@studio-freight/hamo'
import cn from 'clsx'
import { Cursor } from 'components/cursor'
import { CustomHead } from 'components/custom-head'
import Lenis from '../../../bundled/lenis'
// import { Footer } from 'components/footer'
import { PageTransition } from 'components/page-transition'

import { Header } from 'components/header'
import { Scrollbar } from 'components/scrollbar'
import { useStore } from 'lib/store'
import { useRouter } from 'next/router'
import { useState } from 'react'
import useMeasure from 'react-use-measure'
import s from './layout.module.scss'

export function Layout({
  seo = { title: '', description: '', image: '', keywords: '' },
  children,
  theme = 'light',
  className,
}) {
  const isTouchDevice = useIsTouchDevice()
  const [lenis, setLenis] = useStore((state) => [state.lenis, state.setLenis])
  const router = useRouter()
  const [ref, { height }] = useMeasure({ debounce: 100 })

  useLayoutEffect(() => {
    if (isTouchDevice === undefined) return
    window.scrollTo(0, 0)
    const lenis = new Lenis({ lerp: 0.1, smooth: !isTouchDevice })
    setLenis(lenis)

    return () => {
      lenis.destroy()
      setLenis(null)
    }
  }, [isTouchDevice])

  const [hash, setHash] = useState()

  useLayoutEffect(() => {
    if (lenis && hash) {
      // scroll to on hash change
      const target = document.querySelector(hash)
      lenis.scrollTo(target, { offset: -1.1 * height })
    }
  }, [lenis, hash, height])

  useLayoutEffect(() => {
    // update scroll position on page refresh based on hash
    if (router.asPath.includes('#')) {
      const hash = router.asPath.split('#').pop()
      setHash('#' + hash)
    }
  }, [router])

  useLayoutEffect(() => {
    // catch anchor links clicks
    function onClick(e) {
      e.preventDefault()
      const node = e.currentTarget
      const hash = node.href.split('#').pop()
      setHash('#' + hash)
      setTimeout(() => {
        window.location.hash = hash
      }, 0)
    }

    const internalLinks = [...document.querySelectorAll('[href]')].filter(
      (node) => node.href.includes(router.pathname + '#')
    )

    internalLinks.forEach((node) => {
      node.addEventListener('click', onClick, false)
    })

    return () => {
      internalLinks.forEach((node) => {
        node.removeEventListener('click', onClick, false)
      })
    }
  }, [])

  useFrame(() => {
    lenis?.raf()
  }, [])

  return (
    <>
      <CustomHead {...seo} />
      <div className={cn(`theme-${theme}`, s.layout, className)}>
        <PageTransition />
        {isTouchDevice === false && <Cursor />}
        {isTouchDevice === false && <Scrollbar />}
        <Header ref={ref} />
        <main className={s.main}>{children}</main>
        {/* <Footer /> */}
      </div>
    </>
  )
}
