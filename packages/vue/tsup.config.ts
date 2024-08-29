import { defineConfig } from 'tsup'

export default defineConfig({
  entryPoints: { 'lenis-vue': './src/index.ts' },
  outDir: 'dist',
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['vue', 'lenis'],
})
