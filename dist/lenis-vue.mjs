// packages/vue/src/provider.ts
import Lenis from "lenis";
import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  provide,
  ref
} from "vue";
var LenisSymbol = Symbol("LenisContext");
var VueLenis = defineComponent({
  name: "VueLenis",
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
        const combinedClassName = ["lenis", props.class].filter(Boolean).join(" ");
        delete props.class;
        return h("div", { class: combinedClassName, ref: wrapper, ...props }, [
          h("div", { ref: content }, slots.default?.())
        ]);
      }
    };
  }
});
var vueLenisPlugin = (app) => {
  app.component("lenis", VueLenis);
};

// packages/vue/src/use-lenis.ts
import { inject, onBeforeUnmount as onBeforeUnmount2, watch } from "vue";
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
  onBeforeUnmount2(() => {
    if (lenisInjection.value && callback) {
      lenisInjection.value.off("scroll", callback);
    }
  });
  return lenisInjection;
}
export {
  VueLenis as Lenis,
  VueLenis,
  vueLenisPlugin as default,
  useLenis
};
//# sourceMappingURL=lenis-vue.mjs.map