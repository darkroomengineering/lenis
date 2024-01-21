import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
// import replace from "@rollup/plugin-replace"
import excludeDependenciesFromBundle from 'rollup-plugin-exclude-dependencies-from-bundle'
// const preserveDirectives = require("rollup-plugin-preserve-directives").default

const globals = {
  react: 'React',
  '@studio-freight/hamo': 'hamo',
  '@studio-freight/lenis': 'Lenis',
  zustand: 'zustand',
  clsx: 'cn',
}

export default [
  {
    input: 'src/index.tsx',
    output: [
      {
        file: 'dist/react-lenis.cjs.js',
        format: 'cjs',
        name: 'ReactLenis',
        strict: true,
        sourcemap: true,
        exports: 'auto',
        globals,
      },
      {
        file: 'dist/react-lenis.mjs',
        format: 'esm',
        name: 'ReactLenis',
        strict: true,
        sourcemap: true,
        globals,
      },
      {
        file: 'dist/react-lenis.umd.js',
        format: 'umd',
        name: 'ReactLenis',
        strict: true,
        sourcemap: true,
        globals,
        // exports: "named",
        // esModule: false,
        // preserveModules: true,
      },
    ],
    plugins: [
      excludeDependenciesFromBundle(),
      // preserveDirectives(),
      resolve(),
      babel({
        babelHelpers: 'bundled',
        presets: ['@babel/preset-react'],
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', 'ts', 'tsx'],
      }),
      commonjs(),
      // replace({
      //   preventAssignment: false,
      //   "process.env.NODE_ENV": '"development"',
      // }),
      terser({
        keep_classnames: true,
        // compress: {
        //   directives: false,
        // },
      }),
      json(),
      typescript({
        tsconfig: './tsconfig.json',
      }),
    ],
  },
]
