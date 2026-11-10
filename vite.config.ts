import { defineConfig } from 'vite-plus'
import { playwright } from 'vite-plus/test/browser-playwright'

const shared = {
  outDir: 'dist',
  target: 'es2022' as const,
  platform: 'browser' as const,
  format: 'esm' as const,
  sourcemap: true,
  outExtensions: () => ({ js: '.mjs', dts: '.d.ts' }),
}

const iife = (globalName: string, minify = false) =>
  ({
    ...shared,
    format: 'iife' as const,
    dts: false,
    clean: false,
    globalName,
    minify,
    outExtensions: undefined,
    outputOptions: {
      entryFileNames: minify ? '[name].min.js' : '[name].js',
    },
  }) as const

export default defineConfig({
  fmt: {
    printWidth: 80,
    singleQuote: true,
    semi: false,
    trailingComma: 'es5',
    sortPackageJson: false,
    sortImports: {},
    ignorePatterns: [
      '**/*.md',
      '**/*.mdx',
      '.github',
      '**/public',
      '**/*.html',
    ],
  },
  lint: {
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: { 'vite-plus/prefer-vite-plus-imports': 'error' },
    options: { typeAware: true, typeCheck: true },
  },
  pack: [
    // Core + Snap ESM
    {
      ...shared,
      entry: {
        lenis: 'packages/core/index.ts',
        'lenis-snap': 'packages/snap/index.ts',
      },
      dts: true,
      clean: true,
      copy: [{ from: 'packages/core/lenis.css', to: 'dist', flatten: true }],
      deps: { neverBundle: ['lenis'] },
    },

    // React ESM
    {
      ...shared,
      entry: { 'lenis-react': 'packages/react/index.ts' },
      dts: { resolver: 'tsc' },
      clean: false,
      banner: '"use client";',
      deps: { neverBundle: ['react', 'lenis'] },
    },

    // Vue ESM
    {
      ...shared,
      entry: { 'lenis-vue': 'packages/vue/index.ts' },
      dts: { resolver: 'tsc' },
      clean: false,
      deps: { neverBundle: ['vue', 'lenis'] },
    },

    // Nuxt ESM
    {
      ...shared,
      entry: {
        'lenis-vue-nuxt': 'packages/vue/nuxt/module.ts',
        'nuxt/runtime/lenis': 'packages/vue/nuxt/runtime/lenis.ts',
      },
      dts: false,
      sourcemap: false,
      clean: false,
      deps: {
        neverBundle: ['lenis', 'lenis/vue', '#imports', '#app', '@nuxt/kit'],
      },
    },

    // Browser IIFE builds
    { entry: { lenis: 'packages/core/browser.ts' }, ...iife('Lenis') },
    { entry: { lenis: 'packages/core/browser.ts' }, ...iife('Lenis', true) },
    { entry: { 'lenis-snap': 'packages/snap/browser.ts' }, ...iife('Snap') },
    {
      entry: { 'lenis-snap': 'packages/snap/browser.ts' },
      ...iife('Snap', true),
    },
  ],
  test: {
    include: ['packages/**/*.test.ts'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [
        { browser: 'chromium' },
        { browser: 'firefox' },
        { browser: 'webkit' },
      ],
    },
  },
})
