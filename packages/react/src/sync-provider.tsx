import LenisSync from 'lenis/sync'
import {
  type ForwardRefExoticComponent,
  forwardRef,
  type RefAttributes,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import { LenisContext, useProvideLenis } from './provider'
import type { LenisSyncProps, LenisSyncRef } from './types'

/**
 * React component to setup a LenisSync instance: native scroll, no smoothing,
 * the content moved in the frame JS draws. It publishes to the same context
 * and registry as `<ReactLenis>`, so `useLenis()` resolves to it.
 *
 * @example
 * isTouch ? <ReactLenisSync /> : <ReactLenis root />
 */
export const ReactLenisSync: ForwardRefExoticComponent<
  LenisSyncProps & RefAttributes<LenisSyncRef>
> = forwardRef<LenisSyncRef, LenisSyncProps>(
  ({ children, rootContext = true, name, options = {} }, ref) => {
    const [lenis, setLenis] = useState<LenisSync | undefined>(undefined)

    useImperativeHandle(ref, () => ({ lenis }), [lenis])

    useEffect(() => {
      const lenis = new LenisSync(options)

      setLenis(lenis)

      return () => {
        lenis.destroy()
        setLenis(undefined)
      }
    }, [JSON.stringify({ ...options, wrapper: null, content: null })])

    const { addCallback, removeCallback } = useProvideLenis(
      lenis,
      rootContext,
      name
    )

    if (!children) return null

    return (
      <LenisContext.Provider
        value={{ lenis: lenis!, addCallback, removeCallback }}
      >
        {children}
      </LenisContext.Provider>
    )
  }
)
