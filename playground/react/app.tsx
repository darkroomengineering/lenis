import 'lenis/dist/lenis.css'
import { ReactLenis, useLenis } from 'lenis/react'
import { LoremIpsum } from 'lorem-ipsum'
import { useState } from 'react'

const lorem = new LoremIpsum()

function App() {
  const [pageText] = useState(() => lorem.generateParagraphs(40))
  const [sidebarText] = useState(() => lorem.generateParagraphs(30))

  return (
    <>
      {/* Page scroll (window). `root` => no wrapper divs, globally reachable
          via useLenis() */}
      <ReactLenis root options={{ duration: 1.2 }} />

      {/* A named, scoped scroll container — its own wrapper divs, reachable
          anywhere via useLenis('sidebar') */}
      <ReactLenis name="sidebar" className="sidebar" options={{ duration: 1.2 }}>
        <h2>Sidebar (name="sidebar")</h2>
        {sidebarText}
      </ReactLenis>

      {/* Sibling of both providers — proves cross-subtree access works */}
      <Controls />

      <main className="page">
        <h1>Page (root)</h1>
        {pageText}
      </main>
    </>
  )
}

function Controls() {
  const [page, setPage] = useState(0)
  const [sidebar, setSidebar] = useState(0)

  // root instance (no name): subscribe to the window scroll
  const lenis = useLenis((l) => setPage(l.progress))
  // named instance, from outside its subtree: subscribe to the sidebar scroll
  const sidebarLenis = useLenis('sidebar', (l) => setSidebar(l.progress))

  return (
    <div className="controls">
      <div className="row">
        <span>page</span>
        <progress value={page} max={1} />
        <button type="button" onClick={() => lenis?.scrollTo(0)}>
          top
        </button>
        <button type="button" onClick={() => lenis?.scrollTo(1e9)}>
          bottom
        </button>
      </div>
      <div className="row">
        <span>sidebar</span>
        <progress value={sidebar} max={1} />
        <button type="button" onClick={() => sidebarLenis?.scrollTo(0)}>
          top
        </button>
        <button type="button" onClick={() => sidebarLenis?.scrollTo(1e9)}>
          bottom
        </button>
      </div>
      <div className="row">
        <span>found</span>
        <code>
          root: {lenis ? 'yes' : 'no'} · sidebar:{' '}
          {sidebarLenis ? 'yes' : 'no'}
        </code>
      </div>
    </div>
  )
}

export default App
