export default {
  input: "src/index.js",
  output: {
    format: "cjs",
    file: "lib/index.js",
  },
  external: ["smartcrop"],
}
