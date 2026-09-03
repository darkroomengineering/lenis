import 'lenis/dist/lenis.css'
import { ReactLenis } from 'lenis/react'
import type Snap from 'lenis/snap'
import {
  ReactLenisSnap,
  useLenisSnap,
  useLenisSnapAdd,
} from 'lenis/snap/react'
import { useEffect, useState } from 'react'

// /react-snap — lenis/snap/react: <ReactLenisSnap> + useLenisSnapAdd(options)
// + useLenisSnap({ onStart, onComplete }).
// Page: `<ReactLenis root />` + `<ReactLenisSnap rootContext />`, both
// self-closing siblings — everything resolves through the root registry.
// Sidebar: a scoped Lenis with its own Snap — items resolve it via context.

declare global {
  interface Window {
    snap: Snap
    sidebarSnap: Snap
  }
}

const SECTIONS = [
  { align: 'start' },
  { align: 'center' },
  { align: 'end' },
  { align: 'center', lock: true },
] as const

const ITEMS = Array.from({ length: 8 }, (_, i) => `item ${i}`)

function App() {
  const [mounted, setMounted] = useState(true)

  return (
    <>
      <ReactLenis root options={{ duration: 1 }} />
      <ReactLenisSnap
        rootContext
        name="page"
        mode="closest"
        distanceThreshold={Number.POSITIVE_INFINITY}
      />

      <ReactLenis className="sidebar" options={{ duration: 1 }}>
        <ReactLenisSnap
          name="sidebar"
          mode="closest"
          distanceThreshold={Number.POSITIVE_INFINITY}
        >
          {ITEMS.map((label) => (
            <Item key={label} label={label} />
          ))}
        </ReactLenisSnap>
      </ReactLenis>

      <Hud mounted={mounted} onToggle={() => setMounted(!mounted)} />

      {SECTIONS.map((section, i) =>
        mounted || i !== 1 ? (
          <Section
            key={section.align + ('lock' in section ? '-lock' : '')}
            index={i}
            {...section}
          />
        ) : null
      )}
    </>
  )
}

function Section({
  index,
  align,
  lock,
}: {
  index: number
  align: 'start' | 'center' | 'end'
  lock?: boolean
}) {
  // no provider above: the global root Snap
  const setSnapRef = useLenisSnapAdd({ align, lock })

  return (
    <section ref={setSnapRef} className="section">
      <h2>
        {index} · align '{align}'{lock && ' · lock'}
      </h2>
    </section>
  )
}

function Item({ label }: { label: string }) {
  // inside the sidebar's <ReactLenisSnap>: that one, via context
  const setSnapRef = useLenisSnapAdd({ align: 'start' })

  return (
    <div ref={setSnapRef} className="item">
      {label}
    </div>
  )
}

function Hud({
  mounted,
  onToggle,
}: {
  mounted: boolean
  onToggle: () => void
}) {
  const [last, setLast] = useState('—')
  // global root entry + its events
  const snap = useLenisSnap({
    onComplete: (item) => setLast(`#${item.index} @ ${item.y}`),
  })
  const named = useLenisSnap('page') // the same instance, by name
  const sidebar = useLenisSnap('sidebar') // the scoped one, from outside its tree

  useEffect(() => {
    if (snap) window.snap = snap
    if (sidebar) window.sidebarSnap = sidebar
  }, [snap, sidebar])

  return (
    <aside className="hud">
      <pre>
        page: {snap ? 'yes' : 'no'} · named: {named === snap ? 'same' : 'no'}{' '}
        · elements: {snap?.elements.size ?? 0}
        {'\n'}sidebar: {sidebar ? 'yes' : 'no'} · elements:{' '}
        {sidebar?.elements.size ?? 0}
        {'\n'}last: {last}
      </pre>
      <button type="button" onClick={() => snap?.previous()}>
        ‹ previous
      </button>
      <button type="button" onClick={() => snap?.next()}>
        next ›
      </button>
      <button type="button" onClick={onToggle}>
        {mounted ? 'unmount' : 'mount'} section 1
      </button>
      <button type="button" onClick={() => sidebar?.next()}>
        sidebar next ›
      </button>
    </aside>
  )
}

export default App
