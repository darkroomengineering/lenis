import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    outDir: 'dist',
    minify: false,
    rollupOptions: {
      external: ['vue'],
      //input: ["index.ts"],
      output: {
        globals: {
          vue: 'Vue',
        },
        dir: 'dist',
      },
    },
    lib: {
      entry: './src/index.ts',
      name: 'lenis/vue',
      fileName: 'lenis-vue',
      formats: ['es', 'umd', 'cjs'],
    },
  },
  plugins: [
    vue(),
    dts({ rollupTypes: true, entryRoot: 'src', outDir: 'dist' }),
  ],
})
