import { ROOT_KEY, useLenis } from 'lenis/react'
import type {
  OnSnapCallback,
  SnapElementOptions,
  SnapOptions,
} from 'lenis/snap'
import Snap from 'lenis/snap'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

export type SnapContextValue = { snap?: Snap }

export const SnapContext = createContext<SnapContextValue | null>(null)

// Registry of named Snap instances — the global root is the entry under
// ROOT_KEY, same mechanism as lenis/react's Lenis registry. One listener set
// for every key: snapshots are the instances themselves, so a publish under
// another key re-renders nobody.
const registry = new Map<string, Snap>()
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function publish(key: string, snap?: Snap) {
  if (snap) registry.set(key, snap)
  else registry.delete(key)
  for (const listener of listeners) listener()
}

function useRegistry(key: string) {
  return useSyncExternalStore(
    subscribe,
    () => registry.get(key),
    () => undefined
  )
}

export type ReactLenisSnapProps = SnapOptions & {
  /**
   * Use this instance as the root Snap: `useSnap()` / `useSnapAdd()`
   * resolve to it from anywhere in the app, outside this component's subtree.
   * @default false
   */
  rootContext?: boolean
  /**
   * Register this instance under a name so it can be reached from anywhere via
   * `useSnap(name)`, independent of the provider subtree.
   */
  name?: string
  children?: ReactNode
}

/**
 * React component to setup a Snap on the Lenis instance `useLenis()` resolves
 * to here — the nearest `<ReactLenis>`, else the page's `<ReactLenis root>`.
 * A Snap targets nothing by itself, so there is no `root` prop: place it next
 * to `<ReactLenis root />` and it follows the page.
 *
 * @example
 * <ReactLenis root />
 * <ReactLenisSnap rootContext mode="directional" lock />
 * <Slide /> // useSnapAdd({ align: 'center' }), anywhere
 */
export function ReactLenisSnap({
  children,
  rootContext = false,
  name,
  ...options
}: ReactLenisSnapProps) {
  const lenis = useLenis()

  const [snap, setSnap] = useState<Snap>()

  useEffect(() => {
    if (!lenis) return

    const snap = new Snap(lenis, options)
    setSnap(snap)

    return () => {
      snap.destroy()
      setSnap(undefined)
    }
  }, [lenis, JSON.stringify(options)])

  // Publish to the registry so useSnap() / useSnap(name) can reach
  // this instance from outside its subtree. `rootContext` -> ROOT_KEY, `name`
  // -> its own key; both are entries in one registry.
  useEffect(() => {
    if (!snap) return

    const keys: string[] = []
    if (rootContext) keys.push(ROOT_KEY)
    if (name && name !== ROOT_KEY) keys.push(name)
    for (const key of keys) publish(key, snap)

    return () => {
      for (const key of keys) publish(key)
    }
  }, [snap, rootContext, name])

  const value = useMemo(() => ({ snap }), [snap])

  return <SnapContext.Provider value={value}>{children}</SnapContext.Provider>
}

// Same resolution as `useLenis`: a name hits that registry entry directly;
// otherwise the nearest provider, falling back to the global root entry.
function useSnapInstance(name?: string) {
  const local = useContext(SnapContext)
  const fromRegistry = useRegistry(name ?? ROOT_KEY)
  return !name && local ? local.snap : fromRegistry
}

export type SnapCallbacks = {
  /** `snap.on('start')` — the scroll starts moving toward a target. */
  onStart?: OnSnapCallback
  /** `snap.on('complete')` — the scroll landed on a target. */
  onComplete?: OnSnapCallback
}

/**
 * Hook to access a Snap instance and, optionally, subscribe to its events.
 *
 * Without a name it targets the nearest `<ReactLenisSnap>` (React context) and
 * falls back to the root Snap (`<ReactLenisSnap rootContext>`).
 * Pass a name to reach a specific instance from anywhere in the app
 * (`<ReactLenisSnap name="sidebar">` → `useSnap('sidebar')`), ignoring
 * context.
 *
 * @example <caption>Accessor</caption>
 *          const snap = useSnap()
 *          const sidebar = useSnap('sidebar')
 *
 * @example <caption>Events</caption>
 *          useSnap({ onComplete: ({ index }) => setActive(index) })
 *          useSnap('sidebar', { onStart, onComplete })
 */
export function useSnap(callbacks?: SnapCallbacks): Snap | undefined
export function useSnap(
  name: string,
  callbacks?: SnapCallbacks
): Snap | undefined
export function useSnap(
  a?: string | SnapCallbacks,
  b?: SnapCallbacks
): Snap | undefined {
  const named = typeof a === 'string'
  const snap = useSnapInstance(named ? a : undefined)
  const callbacks = (named ? b : a) ?? {}

  // Read through a ref: inline closures never re-subscribe, yet always fire
  // fresh.
  const latest = useRef(callbacks)
  useEffect(() => {
    latest.current = callbacks
  })

  useEffect(() => {
    if (!snap) return

    const offStart = snap.on('start', (item) => latest.current.onStart?.(item))
    const offComplete = snap.on('complete', (item) =>
      latest.current.onComplete?.(item)
    )

    return () => {
      offStart()
      offComplete()
    }
  }, [snap])

  return snap
}

/** Ref callback returned by `useSnapAdd` — pass it as `ref`. */
export type SnapRef = (element: HTMLElement | null) => (() => void) | undefined

/**
 * Hook form of `snap.add(element, options)`: returns a ref callback that
 * registers the element it's attached to as a snap target, and removes it on
 * detach. Resolves the instance like `useSnap` (nearest provider, root
 * Snap, or by name).
 *
 * A callback ref rather than a `RefObject`: React calls it on every attach,
 * swap and detach, so a late mount or a conditional element re-registers
 * correctly — a `RefObject` gives no such signal.
 *
 * @example
 * const setSnapRef = useSnapAdd({ align: 'center' })
 * return <section ref={setSnapRef} />
 *
 * @example
 * const setSnapRef = useSnapAdd('sidebar', { align: 'start', lock: true })
 */
export function useSnapAdd(options?: SnapElementOptions): SnapRef
export function useSnapAdd(
  name: string,
  options?: SnapElementOptions
): SnapRef
export function useSnapAdd(
  a?: string | SnapElementOptions,
  b?: SnapElementOptions
): SnapRef {
  const named = typeof a === 'string'
  const snap = useSnapInstance(named ? a : undefined)
  const options = (named ? b : a) ?? {}

  // `onSnap` is read through a ref so an inline closure fires fresh without
  // re-registering (functions are dropped from the JSON key below).
  const latest = useRef(options)
  useEffect(() => {
    latest.current = options
  })
  const remove = useRef<(() => void) | undefined>(undefined)

  // Memoized on the instance and the option values: a new identity makes React
  // detach and re-attach, which is exactly when the element must re-register
  // (provider mounted, `align` changed). The other options are closed over
  // rather than read from the ref — on re-attach the ref isn't updated yet.
  return useCallback(
    (element: HTMLElement | null) => {
      remove.current?.()
      remove.current = undefined
      if (!(snap && element)) return

      remove.current = snap.add(element, {
        ...options,
        onSnap: (item) => latest.current.onSnap?.(item),
      })
      // React 19 runs this on detach instead of calling back with null; the
      // remover is safe to call twice.
      return remove.current
    },
    [snap, JSON.stringify(options)]
  )
}
