import Lenis, { LenisOptions, ScrollCallback } from 'lenis'
import type { InjectionKey, Plugin } from 'vue'
import {
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  PropType,
  provide,
  ref,
  Ref,
  watch,
} from 'vue'

export const LenisSymbol: InjectionKey<Ref<Lenis | undefined>> =
  Symbol('LenisContext')

export function useLenis(callback?: ScrollCallback) {
  const lenisInjection = inject(LenisSymbol)

  if (!lenisInjection) {
    throw new Error('No lenis instance found')
  }

  watch(lenisInjection, (lenis) => {
    if (lenis && callback) {
      lenisInjection.value?.on('scroll', callback)
    }
  })

  onBeforeUnmount(() => {
    if (lenisInjection.value && callback) {
      lenisInjection.value.off('scroll', callback)
    }
  })

  return lenisInjection
}

type DivProps = Omit<JSX.IntrinsicElements['div'], 'ref'>

export interface LenisVueProps {
  /**
   * Setup a global instance of Lenis
   * @default false
   */
  root?: boolean
  /**
   * Lenis options
   */
  options?: LenisOptions
  /**
   * Auto-setup requestAnimationFrame
   * @default true
   */
  autoRaf?: boolean
  /**
   * Additional props for the wrapper div
   *
   * When `root` is `false`, this will be applied to the wrapper div
   */
  props?: DivProps
}

export const LenisVue = defineComponent({
  name: 'LenisVue',
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
      type: Object as PropType<DivProps>,
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
        const { className, ...restProps } = props
        const combinedClassName = ['lenis', className].filter(Boolean).join(' ')

        return h(
          'div',
          // This cries about the type, but I don't care. it recieves div props
          { class: combinedClassName, ref: wrapper, ...(restProps as any) },
          [h('div', { ref: content }, slots.default?.())]
        )
      }
    }
  },
})

declare module 'vue' {
  export interface GlobalComponents {
    lenis: typeof LenisVue
  }
}

const plugin: Plugin = (app) => {
  app.component('lenis', LenisVue)
}

export default plugin
