// packages/vue/src/index.ts
import Lenis from "lenis";
import {
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch
} from "vue";
var LenisSymbol = Symbol("LenisContext");
function useLenis(callback) {
  const lenisInjection = inject(LenisSymbol);
  if (!lenisInjection) {
    throw new Error("No lenis instance found");
  }
  watch(lenisInjection, (lenis) => {
    if (lenis && callback) {
      lenisInjection.value?.on("scroll", callback);
    }
  });
  onBeforeUnmount(() => {
    if (lenisInjection.value && callback) {
      lenisInjection.value.off("scroll", callback);
    }
  });
  return lenisInjection;
}
var LenisVue = defineComponent({
  name: "LenisVue",
  props: {
    root: {
      type: Boolean,
      default: false
    },
    autoRaf: {
      type: Boolean,
      default: true
    },
    options: {
      type: Object,
      default: () => ({})
    },
    props: {
      type: Object,
      default: () => ({})
    }
  },
  setup({ autoRaf = true, root = false, options = {}, props = {} }, { slots }) {
    const lenis = ref();
    const wrapper = ref();
    const content = ref();
    onMounted(() => {
      lenis.value = new Lenis({
        ...options,
        ...!root ? {
          wrapper: wrapper.value,
          content: content.value
        } : {}
      });
      if (autoRaf) {
        let raf2 = function(time) {
          lenis.value?.raf(time);
          requestAnimationFrame(raf2);
        };
        var raf = raf2;
        requestAnimationFrame(raf2);
      }
    });
    onBeforeUnmount(() => {
      lenis.value?.destroy();
    });
    provide(LenisSymbol, lenis);
    return () => {
      if (root) {
        return slots.default?.();
      } else {
        const { className, ...restProps } = props;
        const combinedClassName = ["lenis", className].filter(Boolean).join(" ");
        return h(
          "div",
          // This cries about the type, but I don't care. it recieves div props
          { class: combinedClassName, ref: wrapper, ...restProps },
          [h("div", { ref: content }, slots.default?.())]
        );
      }
    };
  }
});
var plugin = (app) => {
  app.component("lenis", LenisVue);
};
var src_default = plugin;
export {
  LenisSymbol,
  LenisVue,
  src_default as default,
  useLenis
};
//# sourceMappingURL=lenis-vue.mjs.map