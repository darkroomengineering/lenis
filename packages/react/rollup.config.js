import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import { dts } from 'rollup-plugin-dts'

export default [
  {
    input: './src/index.tsx',
    output: [
      {
        file: './dist/lenis-react.mjs',
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
      'react',
      'react-dom',
      'react/jsx-runtime',
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
    input: './dist/index.d.ts',
    output: [{ file: './dist/lenis-react.d.ts', format: 'esm' }],
    plugins: [dts()],
  },
]
