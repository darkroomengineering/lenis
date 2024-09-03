import Tempus from '@darkroom.engineering/tempus'
import Lenis, { type ScrollCallback } from 'lenis'
import type { HTMLAttributes, InjectionKey, Plugin, PropType } from 'vue'
import {
  defineComponent,
  getCurrentInstance,
  h,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  ref,
  shallowRef,
  watch,
} from 'vue'
import type { LenisContextValue } from './types'

export const LenisSymbol: InjectionKey<LenisContextValue | null> =
  Symbol('LenisContext')

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
    const lenisRef = shallowRef<Lenis | null>(null)
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
      lenisRef.value = null
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

    // Sync global lenis instance
    const app = getCurrentInstance()

    watch(lenisRef, (lenis) => {
      lenis?.on('scroll', onScroll)

      if (props.root) {
        if (!app) throw new Error('No app found')
        app.appContext.config.globalProperties.$lenisContext.lenis.value = lenis
      }
    })

    if (props.root) {
      // Provide a null value to not get the empty injection warning
      provide(LenisSymbol, null)
      if (!app) throw new Error('No app found')

      app.appContext.config.globalProperties.$lenisContext.addCallback.value =
        addCallback
      app.appContext.config.globalProperties.$lenisContext.removeCallback.value =
        removeCallback
    } else {
      provide(LenisSymbol, {
        lenis: lenisRef,
        addCallback: shallowRef(addCallback),
        removeCallback: shallowRef(removeCallback),
      })
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
  app.component('lenis', VueLenis)
  // Setup a global provide to silence top level useLenis injection warning
  app.provide(LenisSymbol, null)
  app.config.globalProperties.$lenisContext = {
    lenis: shallowRef(null),
    addCallback: shallowRef(null),
    removeCallback: shallowRef(null),
  }
}
