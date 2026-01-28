import Lenis, { type ScrollCallback } from 'lenis'
import {
  createContext,
  forwardRef,
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
export const ReactLenis = forwardRef<LenisRef, LenisProps>(
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
    // Extract primitive values for stable useEffect dependencies.
    // Note: If new options are added to LenisOptions, they should be added here.
    // Using JSON.stringify caused infinite re-renders with object/function values.
    const {
      smoothWheel,
      syncTouch,
      syncTouchLerp,
      touchInertiaExponent,
      duration,
      lerp,
      infinite,
      orientation,
      gestureOrientation,
      touchMultiplier,
      wheelMultiplier,
      autoResize,
      overscroll,
      autoRaf: optionsAutoRaf,
      anchors,
      autoToggle,
      allowNestedScroll,
      naiveDimensions,
      stopInertiaOnNavigate,
      pauseWhenHidden,
      ignoreReducedMotion,
    } = options

    // Deprecation warning for autoRaf prop
    if (autoRaf !== undefined && autoRaf !== true) {
      console.warn('[Lenis] autoRaf prop is deprecated, use options.autoRaf instead')
    }

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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      root,
      smoothWheel,
      syncTouch,
      syncTouchLerp,
      touchInertiaExponent,
      duration,
      lerp,
      infinite,
      orientation,
      gestureOrientation,
      touchMultiplier,
      wheelMultiplier,
      autoResize,
      overscroll,
      optionsAutoRaf,
      autoRaf,
      anchors,
      autoToggle,
      allowNestedScroll,
      naiveDimensions,
      stopInertiaOnNavigate,
      pauseWhenHidden,
      ignoreReducedMotion,
    ])

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
