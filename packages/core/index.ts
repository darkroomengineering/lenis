// This file serves as an entry point for the package
export { Lenis as default } from './src/lenis'
export * from './src/types'

// Re-exported from the root so environments that can't resolve subpath exports
// or load a CDN stylesheet at runtime (e.g. Framer) get everything from a single
// `import Lenis, { Snap, css } from 'lenis'`. Tree-shaken away when unused.
export { Snap } from '../snap/src/snap'
export type { SnapItem, SnapOptions } from '../snap/src/types'
export { css } from './css'
