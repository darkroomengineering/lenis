import json from "@rollup/plugin-json"
import terser from "@rollup/plugin-terser"

export default [
  {
    input: "src/index.js",
    output: [
      {
        file: "dist/lenis.cjs.js",
        format: "cjs",
        strict: true,
        name: "Lenis",
        sourcemap: true,
        exports: "auto",
      },
      {
        file: "dist/lenis.esm.js",
        format: "esm",
        strict: true,
        name: "Lenis",
        sourcemap: true,
      },
      {
        file: "dist/lenis.umd.js",
        format: "umd",
        strict: true,
        name: "Lenis",
        sourcemap: true,
      },
      {
        file: "dist/lenis.min.js",
        format: "umd",
        strict: true,
        name: "Lenis",
        sourcemap: false,
        plugins: [
          terser({
            module: true,
          }),
        ],
      },
    ],
    plugins: [terser({
      keep_classnames: true,
    }), json()],
  },
]
