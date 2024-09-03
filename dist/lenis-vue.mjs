// packages/vue/src/provider.ts
import Tempus from "@darkroom.engineering/tempus";
import Lenis from "lenis";
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
    rafPriority: {
      type: Number,
      default: 0
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
    const lenisRef = shallowRef(null);
    const tempusCleanupRef = shallowRef();
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
    });
    onBeforeUnmount(() => {
      lenisRef.value?.destroy();
      lenisRef.value = null;
    });
    watch(
      () => props.options,
      (options, oldOptions) => {
        const optionsChanged = JSON.stringify(oldOptions) !== JSON.stringify(options);
        if (optionsChanged) {
          lenisRef.value?.destroy();
          lenisRef.value = new Lenis({
            ...props.options,
            ...!props.root ? {
              wrapper: wrapper.value,
              content: content.value
            } : {}
          });
        }
      },
      { deep: true }
    );
    watch(
      [lenisRef, () => props.autoRaf, () => props.rafPriority],
      ([lenis, autoRaf, rafPriority]) => {
        if (!lenis || !autoRaf) {
          return tempusCleanupRef.value?.();
        }
        tempusCleanupRef.value?.();
        if (autoRaf) {
          tempusCleanupRef.value = Tempus.add(
            (time) => lenis?.raf(time),
            rafPriority
          );
        }
      }
    );
    const callbacks = reactive([]);
    function addCallback(callback, priority) {
      callbacks.push({ callback, priority });
      callbacks.sort((a, b) => a.priority - b.priority);
    }
    function removeCallback(callback) {
      callbacks.splice(
        callbacks.findIndex((cb) => cb.callback === callback),
        1
      );
    }
    const onScroll = (data) => {
      for (let i = 0; i < callbacks.length; i++) {
        callbacks[i]?.callback(data);
      }
    };
    const app = getCurrentInstance();
    watch(lenisRef, (lenis) => {
      lenis?.on("scroll", onScroll);
      if (props.root) {
        if (!app) throw new Error("No app found");
        app.appContext.config.globalProperties.$lenisContext.lenis.value = lenis;
      }
    });
    if (props.root) {
      provide(LenisSymbol, null);
      if (!app) throw new Error("No app found");
      app.appContext.config.globalProperties.$lenisContext.addCallback.value = addCallback;
      app.appContext.config.globalProperties.$lenisContext.removeCallback.value = removeCallback;
    } else {
      provide(LenisSymbol, {
        lenis: lenisRef,
        addCallback: shallowRef(addCallback),
        removeCallback: shallowRef(removeCallback)
      });
    }
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
  app.config.globalProperties.$lenisContext = {
    lenis: shallowRef(null),
    addCallback: shallowRef(null),
    removeCallback: shallowRef(null)
  };
};

// packages/vue/src/use-lenis.ts
import {
  getCurrentInstance as getCurrentInstance2,
  inject,
  nextTick,
  onBeforeUnmount as onBeforeUnmount2,
  watch as watch2
} from "vue";
function useLenis(callback, priority = 0, log = "useLenis") {
  const lenisInjection = inject(LenisSymbol);
  const app = getCurrentInstance2();
  const context = lenisInjection || app?.appContext.config.globalProperties.$lenisContext;
  nextTick(() => {
    nextTick(() => {
      if (!context.lenis.value) {
        throw new Error(
          "No lenis instance found, either mount a root lenis instance or wrap your component in a lenis provider"
        );
      }
    });
  });
  watch2(
    [context.lenis, context.addCallback, context.removeCallback],
    ([lenis, addCallback, removeCallback]) => {
      console.log(lenis, addCallback, removeCallback, callback, log);
      if (!lenis || !addCallback || !removeCallback || !callback) return;
      removeCallback?.(callback);
      addCallback?.(callback, priority);
      callback?.(lenis);
    },
    { deep: true }
  );
  onBeforeUnmount2(() => {
    if (!context.removeCallback || !callback) return;
    context.removeCallback.value?.(callback);
  });
  return context.lenis;
}
export {
  VueLenis as Lenis,
  VueLenis,
  vueLenisPlugin as default,
  useLenis
};
//# sourceMappingURL=lenis-vue.mjs.map