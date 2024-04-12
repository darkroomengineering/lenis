import typescript from '@rollup/plugin-typescript'

// import replace from "@rollup/plugin-replace"
// const preserveDirectives = require("rollup-plugin-preserve-directives").default

const globals = {
  react: 'React',
  '@studio-freight/hamo': 'hamo',
  zustand: 'zustand',
  clsx: 'cn',
}

const input = './src/index.tsx'
const tsconfig = './tsconfig.json'
const plugins = [
  // babel({
  //   babelHelpers: 'bundled',
  //   presets: ['@babel/preset-react'],
  //   exclude: 'node_modules/**',
  //   extensions: ['.js', '.jsx', 'ts', 'tsx'],
  // }),
  // terser({}),
  // json(),

  typescript({
    tsconfig,
  }),
  // nodeResolve(),
]

export default [
  // {
  //   input,
  //   output: {
  //     file: 'dist/lenis-react.cjs.js',
  //     format: 'cjs',
  //     name: 'ReactLenis',
  //     strict: true,
  //     sourcemap: true,
  //     exports: 'auto',
  //     globals,
  //   },
  //   external: Object.keys(globals),
  //   plugins,
  // },
  // {
  //   input,
  //   output: {
  //     file: 'dist/lenis-react.umd.js',
  //     format: 'umd',
  //     name: 'ReactLenis',
  //     strict: true,
  //     sourcemap: true,
  //     globals,
  //   },
  //   external: Object.keys(globals),
  //   plugins,
  // },
  {
    input,
    output: {
      file: 'dist/lenis-react.mjs',
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
