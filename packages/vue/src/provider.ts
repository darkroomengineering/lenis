import Lenis from 'lenis'
import type { HTMLAttributes, InjectionKey, Plugin, PropType, Ref } from 'vue'
import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
} from 'vue'
import type { LenisVueProps } from './types'

export const LenisSymbol: InjectionKey<Ref<Lenis | undefined>> =
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
  setup(
    { autoRaf = true, root = false, options = {}, props = {} }: LenisVueProps,
    { slots }
  ) {
    const lenis = ref<Lenis>()
    const wrapper = ref<HTMLDivElement>()
    const content = ref<HTMLDivElement>()

    onMounted(() => {
      lenis.value = new Lenis({
        ...options,
        ...(!root
          ? {
              wrapper: wrapper.value,
              content: content.value,
            }
          : {}),
      })

      if (autoRaf) {
        function raf(time: number) {
          lenis.value?.raf(time)
          requestAnimationFrame(raf)
        }

        requestAnimationFrame(raf)
      }
    })

    onBeforeUnmount(() => {
      lenis.value?.destroy()
    })

    provide(LenisSymbol, lenis)

    return () => {
      if (root) {
        return slots.default?.()
      } else {
        const combinedClassName = ['lenis', props.class]
          .filter(Boolean)
          .join(' ')
        delete props.class

        return h('div', { class: combinedClassName, ref: wrapper, ...props }, [
          h('div', { ref: content }, slots.default?.()),
        ])
      }
    }
  },
})

export const vueLenisPlugin: Plugin = (app) => {
  app.component('lenis', VueLenis)
}
