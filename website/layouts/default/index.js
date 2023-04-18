import { useFrame } from '@studio-freight/hamo'
import cn from 'clsx'
import { CustomHead } from 'components/custom-head'
import { Footer } from 'components/footer'
import { Intro } from 'components/intro'
import { Scrollbar } from 'components/scrollbar'
import { useStore } from 'lib/store'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Lenis from '../../../bundled/lenis.js'
import s from './layout.module.scss'

const Cursor = dynamic(
  () => import('components/cursor').then((mod) => mod.Cursor),
  { ssr: false }
)

const PageTransition = dynamic(
  () => import('components/page-transition').then((mod) => mod.PageTransition),
  { ssr: false }
)

export function Layout({
  seo = { title: '', description: '', image: '', keywords: '' },
  children,
  theme = 'light',
  className,
}) {
  const [lenis, setLenis] = useStore((state) => [state.lenis, state.setLenis])
  const router = useRouter()

  useEffect(() => {
    window.scrollTo(0, 0)
    const lenis = new Lenis({
      // smoothTouch: true,
      syncTouch: true,
    })
    window.lenis = lenis
    setLenis(lenis)

    // new ScrollSnap(lenis, { type: 'proximity' })

    return () => {
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  const [hash, setHash] = useState()

  useEffect(() => {
    if (lenis && hash) {
      // scroll to on hash change
      const target = document.querySelector(hash)
      lenis.scrollTo(target, { offset: 0 })
    }
  }, [lenis, hash])

  useEffect(() => {
    // update scroll position on page refresh based on hash
    if (router.asPath.includes('#')) {
      const hash = router.asPath.split('#').pop()
      setHash('#' + hash)
    }
  }, [router])

  useEffect(() => {
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

  useFrame((time) => {
    lenis?.raf(time)
  }, [])

  return (
    <>
      <CustomHead {...seo} />
      <div className={cn(`theme-${theme}`, s.layout, className)}>
        <PageTransition />
        <Intro />
        <Cursor />
        <Scrollbar />
        <main className={s.main}>{children}</main>
        <Footer />
      </div>
    </>
  )
}
