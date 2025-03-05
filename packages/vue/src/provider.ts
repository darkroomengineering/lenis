// import Tempus from '@darkroom.engineering/tempus'
import Lenis, { type ScrollCallback } from 'lenis'
import type {
  HTMLAttributes,
  InjectionKey,
  Plugin,
  PropType,
  ShallowRef,
} from 'vue'
import {
  defineComponent,
  h,
  onWatcherCleanup,
  provide,
  reactive,
  ref,
  shallowRef,
  watch,
} from 'vue'
import { globalAddCallback, globalLenis, globalRemoveCallback } from './store'

export const LenisSymbol: InjectionKey<ShallowRef<Lenis | undefined>> =
  Symbol('LenisContext')
export const AddCallbackSymbol: InjectionKey<
  (callback: any, priority: number) => void
> = Symbol('AddCallback')
export const RemoveCallbackSymbol: InjectionKey<(callback: any) => void> =
  Symbol('RemoveCallback')

export const VueLenis = defineComponent({
  name: 'VueLenis',
  props: {
    root: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    autoRaf: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
    options: {
      type: Object as PropType<ConstructorParameters<typeof Lenis>[0]>,
      default: () => ({}),
    },
    props: {
      type: Object as PropType<HTMLAttributes>,
      default: () => ({}),
    },
  },
  setup(props, { slots, expose }) {
    const lenisRef = shallowRef<Lenis>()
    // const tempusCleanupRef = shallowRef<() => void>()
    const wrapper = ref<HTMLDivElement>()
    const content = ref<HTMLDivElement>()
    // Setup exposed properties
    expose({
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

        if (!props.root && (!wrapper.value || !content.value)) return

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
      for (let i = 0; i < callbacks.length; i++) {
        callbacks[i]?.callback(data)
      }
    }

    watch(
      [lenisRef, () => props.root],
      ([lenis, root]) => {
        lenis?.on('scroll', onScroll)

        if (root) {
          globalLenis.value = lenis
          globalAddCallback.value = addCallback
          globalRemoveCallback.value = removeCallback

          onWatcherCleanup(() => {
            globalLenis.value = undefined
            globalAddCallback.value = undefined
            globalRemoveCallback.value = undefined
          })
        }
      },
      { immediate: true }
    )

    if (!props.root) {
      provide(LenisSymbol, lenisRef)
      provide(AddCallbackSymbol, addCallback)
      provide(RemoveCallbackSymbol, removeCallback)
    }

    return () => {
      if (props.root) {
        return slots.default?.()
      } else {
        return h('div', { ref: wrapper, ...props?.props }, [
          h('div', { ref: content }, slots.default?.()),
        ])
      }
    }
  },
})

export const vueLenisPlugin: Plugin = (app) => {
  app.component('vue-lenis', VueLenis)
  // Setup a global provide to silence top level useLenis injection warning
  app.provide(LenisSymbol, shallowRef(undefined))
  app.provide(AddCallbackSymbol, undefined as any)
  app.provide(RemoveCallbackSymbol, undefined as any)
}

// @ts-ignore
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    'vue-lenis': typeof VueLenis
  }
}
