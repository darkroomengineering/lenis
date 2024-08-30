import Lenis from 'lenis'
import type {
  HTMLAttributes,
  InjectionKey,
  Plugin,
  PropType,
  ShallowRef,
} from 'vue'
import {
  defineComponent,
  getCurrentInstance,
  h,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  watch,
} from 'vue'
import type { LenisVueProps } from './types'

export const LenisSymbol: InjectionKey<ShallowRef<Lenis | undefined> | null> =
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
    options: {
      type: Object as PropType<ConstructorParameters<typeof Lenis>[0]>,
      default: () => ({}),
    },
    props: {
      type: Object as PropType<HTMLAttributes>,
      default: () => ({}),
    },
  },
  setup(props: LenisVueProps, { slots }) {
    const lenisRef = shallowRef<Lenis>()
    const wrapper = ref<HTMLDivElement>()
    const content = ref<HTMLDivElement>()

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

      if (props.autoRaf) {
        function raf(time: number) {
          lenisRef.value?.raf(time)
          requestAnimationFrame(raf)
        }

        requestAnimationFrame(raf)
      }
    })

    onBeforeUnmount(() => {
      lenisRef.value?.destroy()
    })

    if (props.root) {
      // Provide a null value to not get the empty injection warning
      provide(LenisSymbol, null)
    } else {
      provide(LenisSymbol, lenisRef)
    }

    const app = getCurrentInstance()

    watch([lenisRef, props], ([lenis, props]) => {
      if (props.root) {
        if (!app) throw new Error('No app found')
        app.appContext.config.globalProperties.$lenis.value = lenis
      }
    })

    watch(props, (props, oldProps) => {
      const rootChanged = oldProps.root !== props.root
      const optionsChanged =
        JSON.stringify(oldProps.options) !== JSON.stringify(props.options)

      if (rootChanged || optionsChanged) {
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
    })

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
  app.config.globalProperties.$lenis = shallowRef<Lenis>()
}
