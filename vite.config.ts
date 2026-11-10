import { defineConfig } from 'vite-plus'
import tsdownConfig from './tsdown.config.js'

export default defineConfig({
  fmt: {},
  lint: {
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: { 'vite-plus/prefer-vite-plus-imports': 'error' },
    options: { typeAware: true, typeCheck: true },
  },
  pack: tsdownConfig,
})
