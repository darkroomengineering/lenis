const { resolve } = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    rollupOptions: {
      input: {
        docs: resolve(__dirname, 'docs/index.html'),
      },
    },
  },
})
