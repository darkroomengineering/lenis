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
import { Store } from './store'
import type { LenisContextValue, LenisProps, LenisRef } from './types'

export const LenisContext = createContext<LenisContextValue | null>(null)

/**
 * The root store for the lenis context
 *
 * This store serves as a fallback for the context if it is not available
 * and allows us to use the global lenis instance above a provider
 */
export const rootLenisContextStore = new Store<LenisContextValue | null>(null)

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
      options = {},
      autoRaf = true,
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
        autoRaf: options?.autoRaf ?? autoRaf, // this is to avoid breaking the autoRaf prop if it's still used (require breaking change)
      })

      setLenis(lenis)

      return () => {
        lenis.destroy()
        setLenis(undefined)
      }
    }, [root, JSON.stringify({ ...options, wrapper: null, content: null })])

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

    // This makes sure to set the global context if the root is true
    useEffect(() => {
      if (root && lenis) {
        rootLenisContextStore.set({ lenis, addCallback, removeCallback })

        return () => rootLenisContextStore.set(null)
      }
    }, [root, lenis, addCallback, removeCallback])

    // Setup callback listeners
    useEffect(() => {
      if (!lenis) return

      const onScroll: ScrollCallback = (data) => {
        for (let i = 0; i < callbacksRefs.current.length; i++) {
          callbacksRefs.current[i]?.callback(data)
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
        {root && root !== 'asChild' ? (
          children
        ) : (
          <div ref={wrapperRef} {...props}>
            <div ref={contentRef}>{children}</div>
          </div>
        )}
      </LenisContext.Provider>
    )
  }
)
