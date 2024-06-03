import json from '@rollup/plugin-json'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import { dts } from 'rollup-plugin-dts'

export default [
  {
    input: './src/index.ts',
    output: [
      {
        file: './dist/lenis-snap.mjs',
        format: 'esm',
        strict: true,
        sourcemap: true,
        name: 'Lenis',
        plugins: [
          terser({
            keep_classnames: true,
            keep_fnames: true,
          }),
        ],
      },
      {
        file: './dist/lenis-snap.min.js',
        format: 'umd',
        strict: true,
        sourcemap: true,
        name: 'Lenis',
        plugins: [
          terser({
            keep_classnames: true,
            keep_fnames: true,
          }),
        ],
      },
      {
        file: './dist/lenis-snap.js',
        format: 'umd',
        strict: true,
        sourcemap: true,
        name: 'Lenis',
      },
    ],
    plugins: [
      json(),
      typescript({
        tsconfig: './tsconfig.json',
      }),
    ],
  },
  {
    input: './dist/index.d.ts',
    output: [{ file: './dist/lenis-snap.d.ts', format: 'esm' }],
    plugins: [dts()],
  },
]
