import { uglify } from "rollup-plugin-uglify"
import pkg from "./package.json"

export default {
  input: "src/index.js",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      exports: "named",
      sourcemap: true,
      strict: false,
    },
  ],
  plugins: [uglify()],
}
