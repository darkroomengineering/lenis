import { defineConfig } from 'tsup'
import { coreESMOptions } from './tsup.config'

export default defineConfig(() => {
  console.log(`\x1b[31mLNS\x1b[0m\x1b[1m Building core package\x1b[0m\n`)
  return { ...coreESMOptions[0], clean: true }
})
