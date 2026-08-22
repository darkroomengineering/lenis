import Lenis, { type LenisOptions, type ScrollCallback } from 'lenis'
import type {
  HTMLAttributes,
  InjectionKey,
  Plugin,
  PropType,
  ShallowRef,
  ToRefs,
} from 'vue'
import {
  computed,
  defineComponent,
  h,
  onWatcherCleanup,
  provide,
  reactive,
  ref,
  shallowRef,
  watch,
} from 'vue'
import { getRegistryStore, ROOT_KEY } from './store'

export const LenisSymbol: InjectionKey<ShallowRef<Lenis | undefined>> =
  Symbol('LenisContext')
export const AddCallbackSymbol: InjectionKey<
  ((callback: ScrollCallback, priority: number) => void) | undefined
> = Symbol('AddCallback')
export const RemoveCallbackSymbol: InjectionKey<
  ((callback: ScrollCallback) => void) | undefined
> = Symbol('RemoveCallback')

export type LenisExposed = {
  wrapper?: HTMLDivElement
  content?: HTMLDivElement
  lenis?: Lenis
}

const VueLenisImpl = defineComponent({
  name: 'VueLenis',
  props: {
    root: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    rootContext: {
      // tri-state: `undefined` falls back to `root` (see effectiveRootContext)
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    name: {
      type: String as PropType<string>,
      default: undefined,
    },
    autoRaf: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
    options: {
      type: Object as PropType<LenisOptions>,
      default: () => ({}),
    },
    props: {
      type: Object as PropType<HTMLAttributes>,
      default: () => ({}),
    },
  },
  setup(props, { slots, expose }) {
    const lenisRef = shallowRef<Lenis>()
    const wrapper = ref<HTMLDivElement>()
    const content = ref<HTMLDivElement>()
    // Setup exposed properties
    expose<ToRefs<LenisExposed>>({
      lenis: lenisRef,
      wrapper,
      content,
    })

    // Sync options
    watch(
      [() => props.options, wrapper, content],
      () => {
        const isClient = typeof window !== 'undefined'

        if (!isClient) return

        if (!(props.root || (wrapper.value && content.value))) return

        lenisRef.value = new Lenis({
          ...props.options,
          ...(!props.root
            ? {
                wrapper: wrapper.value,
                content: content.value,
              }
            : {}),
          autoRaf: props.options?.autoRaf ?? props.autoRaf,
        })

        onWatcherCleanup(() => {
          lenisRef.value?.destroy()
          lenisRef.value = undefined
        })
      },
      { deep: true, immediate: true }
    )

    const callbacks = reactive<
      { callback: ScrollCallback; priority: number }[]
    >([])

    function addCallback(callback: ScrollCallback, priority: number) {
      callbacks.push({ callback, priority })
      callbacks.sort((a, b) => a.priority - b.priority)
    }

    function removeCallback(callback: ScrollCallback) {
      callbacks.splice(
        callbacks.findIndex((cb) => cb.callback === callback),
        1
      )
    }

    const onScroll: ScrollCallback = (data) => {
      for (const { callback } of callbacks) {
        callback(data)
      }
    }

    // `rootContext` un-tangles global registration from window-targeting:
    // it defaults to `root`, but can be set independently on a scoped container.
    const effectiveRootContext = computed(() => props.rootContext ?? props.root)

    // Publish to the keyed registry so useLenis() / useLenis(name) can reach
    // this instance from outside its subtree. `rootContext` -> ROOT_KEY entry,
    // `name` -> its own key; both are entries in one registry.
    watch(
      [lenisRef, effectiveRootContext, () => props.name],
      ([lenis, rootContext, name]) => {
        if (!lenis) return

        lenis.on('scroll', onScroll)
        onWatcherCleanup(() => lenis.off('scroll', onScroll))

        const keys: string[] = []
        if (rootContext) keys.push(ROOT_KEY)
        if (name && name !== ROOT_KEY) keys.push(name)
        if (keys.length === 0) return

        const entry = { lenis, addCallback, removeCallback }
        for (const key of keys) getRegistryStore(key).value = entry

        onWatcherCleanup(() => {
          for (const key of keys) getRegistryStore(key).value = undefined
        })
      },
      { immediate: true }
    )

    // Always provide to the subtree so nested useLenis() resolves via context,
    // regardless of root (window) vs scoped-container mode.
    provide(LenisSymbol, lenisRef)
    provide(AddCallbackSymbol, addCallback)
    provide(RemoveCallbackSymbol, removeCallback)

    return () => {
      if (props.root) {
        return slots.default?.()
      }
      return h('div', { ref: wrapper, ...props?.props }, [
        h('div', { ref: content }, slots.default?.()),
      ])
    }
  },
})

export const VueLenis = VueLenisImpl as typeof VueLenisImpl & {
  new (): LenisExposed
}

export const vueLenisPlugin: Plugin = (app) => {
  app.component('vue-lenis', VueLenis)
  // Setup a global provide to silence top level useLenis injection warning
  app.provide(LenisSymbol, shallowRef(undefined))
  app.provide(AddCallbackSymbol, undefined)
  app.provide(RemoveCallbackSymbol, undefined)
}

// @ts-expect-error
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    'vue-lenis': typeof VueLenis
  }
}
