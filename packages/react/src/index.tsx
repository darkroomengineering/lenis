'use client'

import Tempus from '@darkroom.engineering/tempus'
import Lenis, { LenisOptions } from 'lenis'
import {
  ForwardRefExoticComponent,
  PropsWithoutRef,
  ReactNode,
  RefAttributes,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { Store, useStore } from './store'

type LenisEventHandler = (lenis: Lenis) => void
interface LenisContextValue {
  lenis: Lenis
  addCallback: (handler: LenisEventHandler, priority: number) => void
  removeCallback: (handler: LenisEventHandler) => void
}

export const LenisContext = createContext<LenisContextValue | null>(null)

const rootLenisContextStore = new Store({})

function useCurrentLenis() {
  const localContext = useContext(LenisContext)
  const rootContext = useStore(rootLenisContextStore)

  return localContext ?? rootContext
}

export function useLenis(
  callback?: (lenis: Lenis) => void,
  deps: Array<any> = [],
  priority = 0,
): Lenis | undefined {
  const { lenis, addCallback, removeCallback } = useCurrentLenis()

  useEffect(() => {
    if (!callback || !addCallback || !removeCallback || !lenis) return

    addCallback(callback, priority)
    callback(lenis)

    return () => {
      removeCallback(callback)
    }
  }, [lenis, addCallback, removeCallback, priority, ...deps])

  return lenis
}

type ForwardRefComponent<P, T> = ForwardRefExoticComponent<
  PropsWithoutRef<P> & RefAttributes<T>
>

type Props = {
  root?: boolean
  options?: LenisOptions
  autoRaf?: boolean
  rafPriority?: number
  className?: string
  children?: ReactNode
  props?: any
}

type LenisRef = {
  wrapper?: HTMLElement
  content?: HTMLElement
  lenis?: Lenis
}

const ReactLenis: ForwardRefComponent<Props, LenisRef> = forwardRef<
  LenisRef,
  Props
>(
  (
    {
      children,
      root = false,
      options = {},
      autoRaf = true,
      rafPriority = 0,
      className,
      ...props
    }: Props,
    ref,
  ) => {
    const wrapperRef = useRef<HTMLDivElement | null>(null)
    const contentRef = useRef<HTMLDivElement | null>(null)

    const [lenis, setLenis] = useState<Lenis | undefined>(undefined)

    const callbacksRefs = useRef<
      {
        callback: LenisEventHandler
        priority: number
      }[]
    >([])

    const addCallback: LenisContextValue['addCallback'] = useCallback(
      (callback, priority) => {
        callbacksRefs.current.push({ callback, priority })
        callbacksRefs.current.sort((a, b) => a.priority - b.priority)
      },
      [],
    )

    const removeCallback: LenisContextValue['removeCallback'] = useCallback(
      (callback) => {
        callbacksRefs.current = callbacksRefs.current.filter(
          (cb) => cb.callback !== callback,
        )
      },
      [],
    )

    useImperativeHandle(
      ref,
      () => ({
        wrapper: wrapperRef.current!,
        content: contentRef.current!,
        lenis,
      }),
      [lenis],
    )

    useEffect(() => {
      const lenis = new Lenis({
        ...options,
        ...(!root && {
          wrapper: wrapperRef.current!,
          content: contentRef.current!,
        }),
      })

      setLenis(lenis)

      return () => {
        lenis.destroy()
        setLenis(undefined)
      }
    }, [root, JSON.stringify(options)])

    useEffect(() => {
      if (!lenis || !autoRaf) return

      return Tempus.add((time: number) => {
        lenis?.raf(time)
      }, rafPriority)
    }, [lenis, autoRaf, rafPriority])

    useEffect(() => {
      if (root && lenis) {
        rootLenisContextStore.set({ lenis, addCallback, removeCallback })

        return () => rootLenisContextStore.set({})
      }
    }, [root, lenis, addCallback, removeCallback])

    const onScroll = useCallback((...args) => {
      for (let i = 0; i < callbacksRefs.current.length; i++) {
        callbacksRefs.current[i].callback(...args)
      }
    }, [])

    useEffect(() => {
      lenis?.on('scroll', onScroll)

      return () => {
        lenis?.off('scroll', onScroll)
      }
    }, [lenis, onScroll])

    // const onClassNameChange = useCallback(() => {
    //   if (wrapperRef.current) {
    //     wrapperRef.current.className = cn(lenis?.className, className)
    //   }
    // }, [lenis, className])

    // useEffect(() => {
    //   onClassNameChange()

    //   lenis?.on('className change', onClassNameChange)

    //   return () => {
    //     lenis?.off('className change', onClassNameChange)
    //   }
    // }, [lenis, onClassNameChange])

    return (
      <LenisContext.Provider
        value={{ lenis: lenis!, addCallback, removeCallback }}
      >
        {root ? (
          children
        ) : (
          <div ref={wrapperRef} className={className} {...props}>
            <div ref={contentRef}>{children}</div>
          </div>
        )}
      </LenisContext.Provider>
    )
  },
)

export { ReactLenis as Lenis, ReactLenis }
export default ReactLenis
