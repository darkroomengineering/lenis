import {
  addComponent,
  addImports,
  addPlugin,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {
  /**
   * Whether to globally register the VueLenis component
   * @default true
   */
  globalComponent?: boolean
  /**
   * Whether to auto-import the useLenis composable and related composables
   * @default true
   */
  autoImports?: boolean
}

const nuxtModule = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'lenis/nuxt',
    configKey: 'lenis',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    globalComponent: true,
    autoImports: true,
  },
  setup(options, _nuxt) {
    const { resolve } = createResolver(import.meta.url)

    addPlugin({
      src: resolve('./nuxt/runtime/lenis.mjs'),
      name: 'lenis',
    })

    if (options.autoImports !== false) {
      addImports([
        { name: 'useLenis', from: 'lenis/vue' },
        { name: 'useLenisScroll', from: 'lenis/vue' },
        { name: 'useLenisProgress', from: 'lenis/vue' },
        { name: 'useLenisVelocity', from: 'lenis/vue' },
        { name: 'useLenisDirection', from: 'lenis/vue' },
      ])
    }

    if (options.globalComponent !== false) {
      addComponent({
        name: 'VueLenis',
        filePath: 'lenis/vue',
        global: true,
        export: 'VueLenis',
      })
    }
  },
})

export default nuxtModule
export * from 'lenis/vue'
