import { defineConfig, type Format, type Options } from 'tsup'

function makeBuildOptions(
  fileName: string,
  entryPoint: string,
  format: Format[]
) {
  const options = {
    entryPoints: { [fileName]: entryPoint },
    format,
    outDir: 'dist-new',
    dts: true,
    sourcemap: true,
    external: ['react', 'vue', 'lenis', '@darkroom.engineering/tempus'],
    outExtension: ({ format }) =>
      format === 'esm' ? { js: '.mjs', dts: '.d.ts' } : { js: '.js' },
    // Don't know why this doesn't have to be the same as outDir but it works anyway
    publicDir: 'dist',
  } satisfies Options

  const minifyOptions = {
    ...options,
    minify: true,
    outExtension: ({ format }) =>
      format === 'esm' ? { js: '.min.mjs' } : { js: '.min.js' },
  } satisfies Options

  return [options, minifyOptions] as const
}

// Builds
const coreOptions = makeBuildOptions('lenis', 'packages/core/src/index.ts', [
  'esm',
  'iife',
])
const snapOptions = makeBuildOptions(
  'lenis-snap',
  'packages/snap/src/index.ts',
  ['esm', 'iife']
)
const reactOptions = makeBuildOptions(
  'lenis-react',
  'packages/react/src/index.tsx',
  ['esm']
)
const vueOptions = makeBuildOptions('lenis-vue', 'packages/vue/src/index.ts', [
  'esm',
])

export default defineConfig([
  ...coreOptions,
  ...snapOptions,
  ...reactOptions,
  ...vueOptions,
])
