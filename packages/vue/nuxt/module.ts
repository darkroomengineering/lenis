import {
  addComponent,
  addImports,
  addPlugin,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {}

const nuxtModule = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'lenis/nuxt',
    configKey: 'lenis',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(_options, _nuxt) {
    const { resolve } = createResolver(import.meta.url)

    addPlugin({
      src: resolve('./nuxt/runtime/lenis.mjs'),
      name: 'lenis',
    })

    addImports({ name: 'useLenis', from: 'lenis/vue' })
    addComponent({
      name: 'VueLenis',
      filePath: 'lenis/vue',
      global: true,
      export: 'VueLenis',
    })
  },
})

export default nuxtModule
export * from 'lenis/vue'
