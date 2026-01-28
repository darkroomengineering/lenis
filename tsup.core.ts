import { defineConfig } from 'tsup'

// Core package builds - ESM, browser bundle, and CSS
export default defineConfig(({ watch }) => {
  console.log(`\x1b[31mLNS\x1b[0m\x1b[1m Building core package\x1b[0m\n`)

  const baseOptions = {
    format: 'esm' as const,
    outDir: 'dist',
    platform: 'browser' as const,
    target: 'es2022' as const,
    external: ['react', 'vue', 'lenis'],
    clean: !watch, // Don't clean in watch mode
  }

  return [
    // ESM build (main)
    {
      ...baseOptions,
      entryPoints: { lenis: 'packages/core/index.ts' },
      dts: true,
      sourcemap: true,
      outExtension: () => ({ js: '.mjs', dts: '.d.ts' }),
    },
    // Browser bundle
    {
      ...baseOptions,
      entryPoints: { lenis: 'packages/core/browser.ts' },
      dts: false,
      sourcemap: true,
      outExtension: () => ({ js: '.js' }),
    },
    // Browser bundle minified
    {
      ...baseOptions,
      entryPoints: { lenis: 'packages/core/browser.ts' },
      dts: false,
      sourcemap: true,
      minify: 'terser',
      terserOptions: { mangle: { reserved: ['Lenis'] } },
      outExtension: () => ({ js: '.min.js' }),
    },
    // CSS
    {
      ...baseOptions,
      entryPoints: { lenis: 'packages/core/lenis.css' },
      dts: false,
      sourcemap: false,
      minify: true,
    },
  ]
})
