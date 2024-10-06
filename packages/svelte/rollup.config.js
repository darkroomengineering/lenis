import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import { dts } from 'rollup-plugin-dts'

export default [
  {
    input: './src/index.ts',
    output: [
      {
        file: './dist/lenis-svelte.mjs',
        format: 'esm',
        strict: true,
        sourcemap: true,
        plugins: [
          terser({
            keep_classnames: true,
            keep_fnames: true,
          }),
        ],
      },
    ],
    external: [
      'svelte',
      'svelte/store',
      'lenis',
      '@darkroom.engineering/tempus',
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
      }),
      nodeResolve({ extensions: ['.js', '.jsx', '.ts', '.tsx'] }),
    ],
  },
  {
    input: './dist/types/index.d.ts',
    output: [{ file: './dist/lenis-svelte.d.ts', format: 'esm' }],
    plugins: [dts()],
  },
]
