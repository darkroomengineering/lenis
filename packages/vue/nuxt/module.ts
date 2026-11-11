import {
  addComponent,
  addImports,
  addPlugin,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'

// Module options TypeScript interface definition
export type ModuleOptions = Record<string, never>

const nuxtModule = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'lenis/nuxt',
    configKey: 'lenis',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(_options, _nuxt) {
    // oxlint-disable-next-line typescript/unbound-method -- Nuxt's resolve does not use `this`
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
