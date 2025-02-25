// This file serves as an entry point for the package
import { Lenis } from './src/lenis'
globalThis.Lenis = Lenis
globalThis.Lenis.prototype = Lenis.prototype
