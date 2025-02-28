import { defineConfig, type Options } from 'tsup'

const OUT_DIR = 'dist'

function makeBuildOptions(
  fileName: string,
  entryPoint: string,
  format?: 'esm' | 'browser',
  overwrites: Options = {}
): Options[] {
  const options = {
    entryPoints: { [fileName]: entryPoint },
    format: 'esm',
    outDir: OUT_DIR,
    platform: 'browser',
    target: 'es2022',
    cjsInterop: false,
    dts: true,
    sourcemap: true,
    external: ['react', 'vue', 'lenis'],
    outExtension: () =>
      format === 'esm' ? { js: '.mjs', dts: '.d.ts' } : { js: '.js' },
    ...overwrites,
  } satisfies Options

  const minifyOptions = {
    ...options,
    minify: 'terser',
    terserOptions: {
      mangle: {
        reserved: ['Lenis'],
      },
    },
    outExtension: () => ({ js: '.min.js' }),
    ...overwrites,
  } satisfies Options

  return format === 'esm' ? [options] : [options, minifyOptions]
}

// Builds
export const coreESMOptions = makeBuildOptions(
  'lenis',
  'packages/core/index.ts',
  'esm'
)
const coreBrowserOptions = makeBuildOptions(
  'lenis',
  'packages/core/browser.ts',
  'browser',
  { dts: false }
)
const coreCSSOptions = makeBuildOptions(
  'lenis',
  'packages/core/lenis.css',
  undefined,
  { dts: false, sourcemap: false, minify: true }
)

const snapESMOptions = makeBuildOptions(
  'lenis-snap',
  'packages/snap/index.ts',
  'esm'
)
const snapBrowserOptions = makeBuildOptions(
  'lenis-snap',
  'packages/snap/browser.ts',
  'browser',
  { dts: false }
)

const reactOptions = makeBuildOptions(
  'lenis-react',
  'packages/react/index.ts',
  'esm',
  { banner: { js: '"use client";' } }
)
const vueOptions = makeBuildOptions('lenis-vue', 'packages/vue/index.ts', 'esm')
const nuxtOptions = makeBuildOptions(
  'lenis-vue-nuxt',
  'packages/vue/nuxt/module.ts',
  'esm',
  { external: ['#imports', 'lenis'], dts: false, sourcemap: false }
)

const nuxtOptionsRuntime = makeBuildOptions(
  'nuxt/runtime/lenis',
  'packages/vue/nuxt/runtime/lenis.ts',
  'esm',
  { external: ['#imports', 'lenis'], dts: false, sourcemap: false }
)

export default defineConfig(() => {
  console.log(`\x1b[31mLNS\x1b[0m\x1b[1m Building all packages\x1b[0m\n`)
  return [
    ...coreESMOptions,
    ...coreBrowserOptions,
    ...coreCSSOptions,
    ...snapESMOptions,
    ...snapBrowserOptions,
    ...reactOptions,
    ...vueOptions,
    ...nuxtOptions,
    ...nuxtOptionsRuntime,
  ]
})
