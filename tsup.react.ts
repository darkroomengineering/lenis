import { defineConfig } from 'tsup'

export default defineConfig({
  entryPoints: { 'lenis-react': 'packages/react/index.ts' },
  format: 'esm',
  outDir: 'dist',
  platform: 'browser',
  target: 'es2022',
  dts: true,
  sourcemap: true,
  external: ['react', 'lenis'],
  outExtension: () => ({ js: '.mjs', dts: '.d.ts' }),
  banner: { js: '"use client";' },
})
