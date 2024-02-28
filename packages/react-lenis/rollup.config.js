import babel from '@rollup/plugin-babel'
import json from '@rollup/plugin-json'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
// import replace from "@rollup/plugin-replace"
// const preserveDirectives = require("rollup-plugin-preserve-directives").default

const globals = {
  react: 'React',
  '@studio-freight/hamo': 'hamo',
  '@studio-freight/lenis': 'Lenis',
  zustand: 'zustand',
  clsx: 'cn',
}

const input = 'src/index.tsx'
const tsconfig = './tsconfig.json'
const plugins = [
  babel({
    babelHelpers: 'bundled',
    presets: ['@babel/preset-react'],
    exclude: 'node_modules/**',
    extensions: ['.js', '.jsx', 'ts', 'tsx'],
  }),
  terser({}),
  json(),
  typescript({
    tsconfig,
  }),
]

export default [
  {
    input,
    output: {
      file: 'dist/react-lenis.cjs.js',
      format: 'cjs',
      name: 'ReactLenis',
      strict: true,
      sourcemap: true,
      exports: 'auto',
      globals,
    },
    external: Object.keys(globals),
    plugins,
  },
  {
    input,
    output: {
      file: 'dist/react-lenis.umd.js',
      format: 'umd',
      name: 'ReactLenis',
      strict: true,
      sourcemap: true,
      globals,
    },
    external: Object.keys(globals),
    plugins,
  },
  {
    input,
    output: {
      file: 'dist/react-lenis.mjs',
      format: 'esm',
      name: 'ReactLenis',
      strict: true,
      sourcemap: true,
      globals,
    },
    external: Object.keys(globals),
    plugins,
  },
]
