import json from '@rollup/plugin-json'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/lenis.cjs.js',
        format: 'cjs',
        strict: true,
        name: 'Lenis',
        sourcemap: true,
        exports: 'auto',
        plugins: [
          terser({
            keep_classnames: true,
          }),
        ],
      },
      {
        file: 'dist/lenis.mjs',
        format: 'esm',
        strict: true,
        name: 'Lenis',
        sourcemap: true,
        plugins: [
          terser({
            keep_classnames: true,
          }),
        ],
      },
      {
        file: 'dist/lenis.umd.js',
        format: 'umd',
        strict: true,
        name: 'Lenis',
        sourcemap: true,
        plugins: [
          terser({
            keep_classnames: true,
          }),
        ],
      },
      {
        file: 'dist/lenis.js',
        format: 'umd',
        strict: true,
        name: 'Lenis',
        sourcemap: false,
      },
      {
        file: 'dist/lenis.min.js',
        format: 'umd',
        strict: true,
        name: 'Lenis',
        sourcemap: false,
        plugins: [
          terser({
            module: true,
            keep_classnames: true,
          }),
        ],
      },
    ],
    plugins: [
      json(),
      typescript({
        tsconfig: './tsconfig.json',
      }),
    ],
  },
]
