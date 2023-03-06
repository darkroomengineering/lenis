import gsap from 'gsap'
import { useStore } from 'lib/store'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import s from './page-transition.module.scss'

export const PageTransition = () => {
  const curtainRef = useRef()
  const router = useRouter()
  const [pageLoaded, setPageloaded] = useState(false)
  const [curtainInComplete, setCurtainInComplete] = useState(false)
  const triggerTransition = useStore(
    ({ triggerTransition }) => triggerTransition
  )
  const setTriggerTransition = useStore(
    ({ setTriggerTransition }) => setTriggerTransition
  )
  const timeline = useRef(gsap.timeline())

  useEffect(() => {
    if (!curtainInComplete) return
    const changeRouteComplete = () => {
      setPageloaded(true)
    }

    router.events.on('routeChangeComplete', changeRouteComplete)
    return () => {
      router.events.off('routeChangeComplete', changeRouteComplete)
    }
  }, [curtainInComplete])

  useEffect(() => {
    if (triggerTransition === '') return
    timeline.current.to(curtainRef.current, {
      x: 0,
      duration: 0.7,
      startAt: { x: '-100%' },
      onComplete: () => {
        router.push(triggerTransition)
        setCurtainInComplete(true)
      },
      ease: 'circ.out',
    })
  }, [triggerTransition])

  useEffect(() => {
    if (!pageLoaded) return
    timeline.current.to(curtainRef.current, {
      x: '100%',
      paused: !pageLoaded,
      duration: 0.7,
      startAt: { x: 0 },
      onComplete: () => {
        setTriggerTransition('')
        setCurtainInComplete(false)
        setPageloaded(false)
      },
      ease: 'circ.out',
    })
  }, [pageLoaded])

  return <div className={s.transition} ref={curtainRef} />
}
