'use client'

import { useFrame } from '@studio-freight/hamo'
import Lenis, { LenisOptions } from '@studio-freight/lenis'
import cn from 'clsx'
import React, {
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
import { create } from 'zustand'

export const LenisContext = createContext() as Lenis | null

const useRoot = create(() => ({}))

function useCurrentLenis() {
  const local = useContext(LenisContext)
  const root = useRoot()

  return local ?? root
}

export function useLenis(
  callback: (lenis: Lenis) => void,
  deps: Array<any> = [],
  priority = 0
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
    ref
  ) => {
    const wrapperRef = useRef()
    const contentRef = useRef()

    const [lenis, setLenis] = useState()

    const callbacksRefs = useRef([])

    const addCallback = useCallback((callback, priority) => {
      callbacksRefs.current.push({ callback, priority })
      callbacksRefs.current.sort((a, b) => a.priority - b.priority)
    }, [])

    const removeCallback = useCallback((callback) => {
      callbacksRefs.current = callbacksRefs.current.filter(
        (cb) => cb.callback !== callback
      )
    }, [])

    useImperativeHandle(
      ref,
      () => ({
        wrapper: wrapperRef.current,
        content: contentRef.current,
        lenis,
      }),
      [lenis]
    )

    useEffect(() => {
      const lenis = new Lenis({
        ...options,
        ...(!root && {
          wrapper: wrapperRef.current,
          content: contentRef.current,
        }),
      })

      setLenis(lenis)

      return () => {
        lenis.destroy()
        setLenis(undefined)
      }
    }, [root, JSON.stringify(options)])

    useFrame((time) => {
      if (autoRaf) {
        lenis?.raf(time)
      }
    }, rafPriority)

    useEffect(() => {
      if (root && lenis) {
        useRoot.setState({ lenis, addCallback, removeCallback })
      }
    }, [root, lenis, addCallback, removeCallback])

    const onScroll = useCallback((e) => {
      for (let i = 0; i < callbacksRefs.current.length; i++) {
        callbacksRefs.current[i].callback(e)
      }
    }, [])

    useEffect(() => {
      lenis?.on('scroll', onScroll)

      return () => {
        lenis?.off('scroll', onScroll)
      }
    }, [lenis, onScroll])

    const onClassNameChange = useCallback(() => {
      if (wrapperRef.current) {
        wrapperRef.current.className = cn(lenis?.className, className)
      }
    }, [lenis, className])

    useEffect(() => {
      onClassNameChange()

      lenis?.on('className change', onClassNameChange)

      return () => {
        lenis?.off('className change', onClassNameChange)
      }
    }, [lenis, onClassNameChange])

    return (
      <LenisContext.Provider value={{ lenis, addCallback, removeCallback }}>
        {root ? (
          children
        ) : (
          <div
            ref={wrapperRef}
            className={cn(lenis?.className, className)}
            {...props}
          >
            <div ref={contentRef}>{children}</div>
          </div>
        )}
      </LenisContext.Provider>
    )
  }
)

export { ReactLenis as Lenis, ReactLenis }
export default ReactLenis
