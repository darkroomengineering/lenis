import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'

export default [
  {
    input: './src/index.tsx',
    output: [
      {
        file: '../../dist/lenis-react.mjs',
        format: 'esm',
        strict: true,
        sourcemap: true,
        plugins: [
          terser({
            keep_classnames: true,
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
      'clsx',
      'zustand',
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
      }),
      nodeResolve({ extensions: ['.js', '.jsx', '.ts', '.tsx'] }),
    ],
  },
  // {
  //   input: './dist/types/index.d.ts',
  //   output: [{ file: '../../dist/lenis-react.d.ts', format: 'esm' }],
  //   plugins: [dts()],
  // },
]
