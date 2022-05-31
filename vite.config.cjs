const { resolve } = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  root: resolve(__dirname, 'src-docs/'),
  build: {
    outDir: '../docs',
  },
})
