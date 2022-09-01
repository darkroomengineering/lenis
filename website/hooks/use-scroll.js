import { useStore } from 'lib/store'
import { useEffect } from 'react'

export function useScroll(callback, deps = []) {
  const lenis = useStore(({ lenis }) => lenis)

  useEffect(() => {
    if (!lenis) return
    lenis.on('scroll', callback)
    lenis.notify()

    return () => {
      lenis.off('scroll', callback)
    }
  }, [lenis, callback, [...deps]])
}
