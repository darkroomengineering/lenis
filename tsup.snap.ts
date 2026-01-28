import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entryPoints: { 'lenis-snap': 'packages/snap/index.ts' },
    format: 'esm',
    outDir: 'dist',
    platform: 'browser',
    target: 'es2022',
    dts: true,
    sourcemap: true,
    external: ['lenis'],
    outExtension: () => ({ js: '.mjs', dts: '.d.ts' }),
  },
  {
    entryPoints: { 'lenis-snap': 'packages/snap/browser.ts' },
    format: 'esm',
    outDir: 'dist',
    platform: 'browser',
    target: 'es2022',
    dts: false,
    sourcemap: true,
    external: ['lenis'],
    outExtension: () => ({ js: '.js' }),
  },
  {
    entryPoints: { 'lenis-snap': 'packages/snap/browser.ts' },
    format: 'esm',
    outDir: 'dist',
    platform: 'browser',
    target: 'es2022',
    dts: false,
    sourcemap: true,
    minify: 'terser',
    terserOptions: { mangle: { reserved: ['Lenis'] } },
    external: ['lenis'],
    outExtension: () => ({ js: '.min.js' }),
  },
])
