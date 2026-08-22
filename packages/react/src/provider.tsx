import Lenis, { type ScrollCallback } from 'lenis'
import {
  createContext,
  type ForwardRefExoticComponent,
  forwardRef,
  type RefAttributes,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { getRegistryStore, ROOT_KEY } from './store'
import type { LenisContextValue, LenisProps, LenisRef } from './types'

export const LenisContext = createContext<LenisContextValue | null>(null)

/**
 * React component to setup a Lenis instance
 */
export const ReactLenis: ForwardRefExoticComponent<
  LenisProps & RefAttributes<LenisRef>
> = forwardRef<LenisRef, LenisProps>(
  (
    {
      children,
      root = false,
      rootContext = root,
      name,
      options = {},
      className = '',
      ...props
    }: LenisProps,
    ref
  ) => {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)

    const [lenis, setLenis] = useState<Lenis | undefined>(undefined)

    // Setup ref
    useImperativeHandle(
      ref,
      () => ({
        wrapper: wrapperRef.current,
        content: contentRef.current,
        lenis,
      }),
      [lenis]
    )

    // Setup lenis instance
    useEffect(() => {
      const lenis = new Lenis({
        ...options,
        ...(wrapperRef.current &&
          contentRef.current && {
            wrapper: wrapperRef.current!,
            content: contentRef.current!,
          }),
        autoRaf: options?.autoRaf,
      })

      setLenis(lenis)

      return () => {
        lenis.destroy()
        setLenis(undefined)
      }
    }, [JSON.stringify({ ...options, wrapper: null, content: null })])

    // Handle callbacks
    const callbacksRefs = useRef<
      {
        callback: ScrollCallback
        priority: number
      }[]
    >([])

    const addCallback: LenisContextValue['addCallback'] = useCallback(
      (callback, priority) => {
        callbacksRefs.current.push({ callback, priority })
        callbacksRefs.current.sort((a, b) => a.priority - b.priority)
      },
      []
    )

    const removeCallback: LenisContextValue['removeCallback'] = useCallback(
      (callback) => {
        callbacksRefs.current = callbacksRefs.current.filter(
          (cb) => cb.callback !== callback
        )
      },
      []
    )

    // Publish to the named registry so useLenis() / useLenis(name) can reach
    // this instance from outside its subtree. `rootContext` -> the global
    // ROOT_KEY entry, `name` -> its own key; both are entries in one registry.
    useEffect(() => {
      if (!lenis) return

      const keys: string[] = []
      if (rootContext) keys.push(ROOT_KEY)
      if (name && name !== ROOT_KEY) keys.push(name)
      if (keys.length === 0) return

      const value = { lenis, addCallback, removeCallback }
      for (const key of keys) {
        getRegistryStore(key).set(value)
      }

      return () => {
        for (const key of keys) {
          getRegistryStore(key).set(null)
        }
      }
    }, [rootContext, name, lenis, addCallback, removeCallback])

    // Setup callback listeners
    useEffect(() => {
      if (!lenis) return

      const onScroll: ScrollCallback = (data) => {
        for (const { callback } of callbacksRefs.current) {
          callback(data)
        }
      }

      lenis.on('scroll', onScroll)

      return () => {
        lenis.off('scroll', onScroll)
      }
    }, [lenis])

    if (!children) return null

    return (
      <LenisContext.Provider
        value={{ lenis: lenis!, addCallback, removeCallback }}
      >
        {root ? (
          children
        ) : (
          <div
            ref={wrapperRef}
            className={`${className} ${lenis?.className ?? ''}`.trim()}
            {...props}
          >
            <div ref={contentRef}>{children}</div>
          </div>
        )}
      </LenisContext.Provider>
    )
  }
)
