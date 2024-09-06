import Tempus from '@darkroom.engineering/tempus'
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
  onBeforeUnmount,
  onMounted,
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
    rafPriority: {
      type: Number as PropType<number>,
      default: 0,
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
  setup(props, { slots }) {
    const lenisRef = shallowRef<Lenis>()
    const tempusCleanupRef = shallowRef<() => void>()
    const wrapper = ref<HTMLDivElement>()
    const content = ref<HTMLDivElement>()

    // Setup the lenis instance when the component is mounted
    onMounted(() => {
      lenisRef.value = new Lenis({
        ...props.options,
        ...(!props.root
          ? {
              wrapper: wrapper.value,
              content: content.value,
            }
          : {}),
      })
    })

    // Destroy the lenis instance when the component is unmounted
    onBeforeUnmount(() => {
      lenisRef.value?.destroy()
      lenisRef.value = undefined
    })

    // Sync options
    watch(
      () => props.options,
      (options, oldOptions) => {
        const optionsChanged =
          JSON.stringify(oldOptions) !== JSON.stringify(options)

        // If any of the options changed, destroy the lenis instance and create a new one
        if (optionsChanged) {
          lenisRef.value?.destroy()
          lenisRef.value = new Lenis({
            ...props.options,
            ...(!props.root
              ? {
                  wrapper: wrapper.value,
                  content: content.value,
                }
              : {}),
          })
        }
      },
      { deep: true }
    )

    // Sync autoRaf
    watch(
      [lenisRef, () => props.autoRaf, () => props.rafPriority],
      ([lenis, autoRaf, rafPriority]) => {
        if (!lenis || !autoRaf) {
          // If lenis is not defined or autoRaf is false, stop the raf if there is one
          return tempusCleanupRef.value?.()
        }

        // If either lenis, autoRaf or rafPriority changed, stop the raf if there is one and start a new one
        tempusCleanupRef.value?.()
        if (autoRaf) {
          tempusCleanupRef.value = Tempus.add(
            (time: number) => lenis?.raf(time),
            rafPriority
          )
        }
      }
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

    watch(lenisRef, (lenis) => {
      lenis?.on('scroll', onScroll)

      if (props.root) {
        globalLenis.value = lenis
        globalAddCallback.value = addCallback
        globalRemoveCallback.value = removeCallback
      }
    })

    if (!props.root) {
      provide(LenisSymbol, lenisRef)
      provide(AddCallbackSymbol, addCallback)
      provide(RemoveCallbackSymbol, removeCallback)
    }

    return () => {
      if (props.root) {
        return slots.default?.()
      } else {
        const combinedClassName = ['lenis', props.props?.class]
          .filter(Boolean)
          .join(' ')
        delete props.props?.class

        return h('div', { class: combinedClassName, ref: wrapper, ...props }, [
          h('div', { ref: content }, slots.default?.()),
        ])
      }
    }
  },
})

export const vueLenisPlugin: Plugin = (app) => {
  app.component('lenis-vue', VueLenis)
  // Setup a global provide to silence top level useLenis injection warning
  app.provide(LenisSymbol, shallowRef(undefined))
  app.provide(AddCallbackSymbol, undefined as any)
  app.provide(RemoveCallbackSymbol, undefined as any)
}

// @ts-ignore
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    'lenis-vue': typeof VueLenis
  }
}
