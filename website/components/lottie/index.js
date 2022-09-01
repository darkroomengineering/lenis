import { useDocumentReadyState, useLayoutEffect } from '@studio-freight/hamo'
import { useIsVisible } from 'hooks/use-is-visible'
import { useEffect, useRef, useState } from 'react'

export function Lottie({
  animation,
  speed = 1,
  loop = true,
  autoplay = true,
  className,
}) {
  const lottieRef = useRef(null)
  const animator = useRef(null)
  const [lottie, setLottie] = useState()

  const { setRef, inView } = useIsVisible({
    threshold: 0,
  })
  const readyState = useDocumentReadyState()

  useEffect(() => {
    if (readyState === 'complete') {
      import('lottie-web/build/player/lottie_canvas.min').then((Lottie) =>
        setLottie(Lottie.default)
      )
    }
  }, [readyState])

  useEffect(() => {
    if (!lottie) return

    animator.current = lottie?.loadAnimation({
      container: lottieRef.current,
      animationData: animation,
      // renderer: 'svg', // "canvas", "html"
      renderer: 'canvas',
      loop,
      autoplay,
    })

    animator.current?.setSpeed(speed)

    return () => animator.current?.destroy()
  }, [lottie])

  useLayoutEffect(() => {
    if (animator.current && inView) {
      animator.current?.play()
    } else {
      animator.current?.pause()
    }
  }, [animator.current, inView])

  return (
    <div
      aria-hidden="true"
      className={className}
      ref={(node) => {
        lottieRef.current = node
        setRef(node)
      }}
    />
  )
}
