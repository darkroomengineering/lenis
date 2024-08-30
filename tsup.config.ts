import { defineConfig, type Format, type Options } from 'tsup'

const OUT_DIR = 'dist'

function makeBuildOptions<F extends Format>(
  fileName: string,
  entryPoint: string,
  format?: F,
  overwrites: Options = {}
): F extends 'esm' ? [Options] : [Options, Options] {
  const options = {
    entryPoints: { [fileName]: entryPoint },
    format,
    outDir: OUT_DIR,
    platform: 'browser',
    dts: true,
    sourcemap: true,
    external: ['react', 'vue', 'lenis', '@darkroom.engineering/tempus'],
    outExtension: ({ format }) =>
      format === 'esm' ? { js: '.mjs', dts: '.d.ts' } : { js: '.js' },
    ...overwrites,
  } satisfies Options

  const minifyOptions = {
    ...options,
    minify: true,
    outExtension: () => ({ js: '.min.js' }),
    ...overwrites,
  } satisfies Options

  return (
    format === 'esm' ? [options] : [options, minifyOptions]
  ) as F extends 'esm' ? [Options] : [Options, Options]
}

// Builds
export const coreESMOptions = makeBuildOptions(
  'lenis',
  'packages/core/src/index.ts',
  'esm'
)
const coreIIFEOptions = makeBuildOptions(
  'lenis',
  'packages/core/src/index.ts',
  'iife'
)
const coreCSSOptions = makeBuildOptions(
  'lenis',
  'packages/core/src/lenis.css',
  undefined,
  { dts: false, sourcemap: false }
)

const snapESMOptions = makeBuildOptions(
  'lenis-snap',
  'packages/snap/src/index.ts',
  'esm'
)
const snapIIFEOptions = makeBuildOptions(
  'lenis-snap',
  'packages/snap/src/index.ts',
  'iife'
)

const reactOptions = makeBuildOptions(
  'lenis-react',
  'packages/react/src/index.tsx',
  'esm'
)
const vueOptions = makeBuildOptions(
  'lenis-vue',
  'packages/vue/src/index.ts',
  'esm'
)

export default defineConfig(() => {
  console.log(`\x1b[31mLNS\x1b[0m\x1b[1m Building all packages\x1b[0m\n`)
  return [
    ...coreESMOptions,
    ...coreIIFEOptions,
    ...coreCSSOptions,
    ...snapESMOptions,
    ...snapIIFEOptions,
    ...reactOptions,
    ...vueOptions,
  ]
})
