import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      fileName: 'lenis-vue',
      formats: ['es'],
    },
    sourcemap: true,
    minify: true,
    rollupOptions: {
      external: ['vue', 'lenis'],
      output: {
        strict: true,
        globals: {
          vue: 'Vue',
        },
        dir: 'dist',
      },
    },
  },
  plugins: [
    vue(),
    dts({
      rollupTypes: true,
      entryRoot: 'src',
      outDir: 'dist',
      exclude: ['playground'],
    }),
  ],
})
