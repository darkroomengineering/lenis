// packages/vue/src/provider.ts
import Lenis from "lenis";
import {
  defineComponent,
  getCurrentInstance,
  h,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  watch
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
  setup(props, { slots }) {
    const lenisRef = shallowRef();
    const wrapper = ref();
    const content = ref();
    onMounted(() => {
      lenisRef.value = new Lenis({
        ...props.options,
        ...!props.root ? {
          wrapper: wrapper.value,
          content: content.value
        } : {}
      });
      if (props.autoRaf) {
        let raf2 = function(time) {
          lenisRef.value?.raf(time);
          requestAnimationFrame(raf2);
        };
        var raf = raf2;
        requestAnimationFrame(raf2);
      }
    });
    onBeforeUnmount(() => {
      lenisRef.value?.destroy();
    });
    if (props.root) {
      provide(LenisSymbol, null);
    } else {
      provide(LenisSymbol, lenisRef);
    }
    const app = getCurrentInstance();
    watch([lenisRef, props], ([lenis, props2]) => {
      if (props2.root) {
        if (!app) throw new Error("No app found");
        app.appContext.config.globalProperties.$lenis.value = lenis;
      }
    });
    watch(props, (props2, oldProps) => {
      const rootChanged = oldProps.root !== props2.root;
      const optionsChanged = JSON.stringify(oldProps.options) !== JSON.stringify(props2.options);
      if (rootChanged || optionsChanged) {
        lenisRef.value?.destroy();
        lenisRef.value = new Lenis({
          ...props2.options,
          ...!props2.root ? {
            wrapper: wrapper.value,
            content: content.value
          } : {}
        });
      }
    });
    return () => {
      if (props.root) {
        return slots.default?.();
      } else {
        const combinedClassName = ["lenis", props.props?.class].filter(Boolean).join(" ");
        delete props.props?.class;
        return h("div", { class: combinedClassName, ref: wrapper, ...props }, [
          h("div", { ref: content }, slots.default?.())
        ]);
      }
    };
  }
});
var vueLenisPlugin = (app) => {
  app.component("lenis", VueLenis);
  app.provide(LenisSymbol, null);
  app.config.globalProperties.$lenis = shallowRef();
};

// packages/vue/src/use-lenis.ts
import {
  getCurrentInstance as getCurrentInstance2,
  inject,
  nextTick,
  onBeforeUnmount as onBeforeUnmount2,
  watch as watch2
} from "vue";
function useLenis(callback) {
  const lenisInjection = inject(LenisSymbol);
  const app = getCurrentInstance2();
  const lenis = lenisInjection || app?.appContext.config.globalProperties.$lenis;
  nextTick(() => {
    nextTick(() => {
      if (!lenis.value) {
        throw new Error(
          "No lenis instance found, either mount a root lenis instance or wrap your component in a lenis provider"
        );
      }
    });
  });
  watch2(lenis, (lenis2) => {
    if (callback) {
      lenis2?.on("scroll", callback);
    }
  });
  onBeforeUnmount2(() => {
    if (callback) {
      lenis.value?.off("scroll", callback);
    }
  });
  return lenis;
}
export {
  VueLenis as Lenis,
  VueLenis,
  vueLenisPlugin as default,
  useLenis
};
//# sourceMappingURL=lenis-vue.mjs.map