import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entryPoints: { 'lenis-vue': 'packages/vue/index.ts' },
    format: 'esm',
    outDir: 'dist',
    platform: 'browser',
    target: 'es2022',
    dts: true,
    sourcemap: true,
    external: ['vue', 'lenis'],
    outExtension: () => ({ js: '.mjs', dts: '.d.ts' }),
  },
  {
    entryPoints: { 'lenis-vue-nuxt': 'packages/vue/nuxt/module.ts' },
    format: 'esm',
    outDir: 'dist',
    platform: 'browser',
    target: 'es2022',
    dts: false,
    sourcemap: false,
    external: ['#imports', 'lenis'],
    outExtension: () => ({ js: '.mjs' }),
  },
  {
    entryPoints: { 'nuxt/runtime/lenis': 'packages/vue/nuxt/runtime/lenis.ts' },
    format: 'esm',
    outDir: 'dist',
    platform: 'browser',
    target: 'es2022',
    dts: true,
    sourcemap: false,
    external: ['#imports', '#app', 'lenis'],
    outExtension: () => ({ js: '.mjs', dts: '.d.ts' }),
    tsconfig: './packages/vue/nuxt/tsconfig.json',
  },
])
