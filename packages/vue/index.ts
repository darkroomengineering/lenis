// This file serves as an entry point for the package
export {
  vueLenisPlugin as default,
  VueLenis as Lenis,
  VueLenis,
} from './src/provider'
export {
  useLenis,
  useLenisScroll,
  useLenisProgress,
  useLenisVelocity,
  useLenisDirection,
} from './src/use-lenis'

// Re-export types from lenis core for convenience
export type {
  LenisOptions,
  ScrollCallback,
  VirtualScrollCallback,
} from 'lenis'
