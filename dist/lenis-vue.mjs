// packages/vue/src/provider.ts
import Tempus from "@darkroom.engineering/tempus";
import Lenis from "lenis";
import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  ref,
  shallowRef as shallowRef2,
  watch
} from "vue";

// packages/vue/src/store.ts
import { shallowRef } from "vue";
var globalLenis = shallowRef();
var globalAddCallback = shallowRef();
var globalRemoveCallback = shallowRef();

// packages/vue/src/provider.ts
var LenisSymbol = Symbol("LenisContext");
var AddCallbackSymbol = Symbol("AddCallback");
var RemoveCallbackSymbol = Symbol("RemoveCallback");
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
  setup(props, { slots, expose }) {
    const lenisRef = shallowRef2();
    const tempusCleanupRef = shallowRef2();
    const wrapper = ref();
    const content = ref();
    expose({
      lenis: lenisRef,
      wrapper,
      content
    });
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
      lenisRef.value = void 0;
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
    watch(lenisRef, (lenis) => {
      lenis?.on("scroll", onScroll);
      if (props.root) {
        globalLenis.value = lenis;
        globalAddCallback.value = addCallback;
        globalRemoveCallback.value = removeCallback;
      }
    });
    if (!props.root) {
      provide(LenisSymbol, lenisRef);
      provide(AddCallbackSymbol, addCallback);
      provide(RemoveCallbackSymbol, removeCallback);
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
  app.component("vue-lenis", VueLenis);
  app.provide(LenisSymbol, shallowRef2(void 0));
  app.provide(AddCallbackSymbol, void 0);
  app.provide(RemoveCallbackSymbol, void 0);
};

// packages/vue/src/use-lenis.ts
import { computed, inject, nextTick, onBeforeUnmount as onBeforeUnmount2, watch as watch2 } from "vue";
function useLenis(callback, priority = 0) {
  const lenisInjection = inject(LenisSymbol);
  const addCallbackInjection = inject(AddCallbackSymbol);
  const removeCallbackInjection = inject(RemoveCallbackSymbol);
  const addCallback = computed(
    () => addCallbackInjection ? addCallbackInjection : globalAddCallback.value
  );
  const removeCallback = computed(
    () => removeCallbackInjection ? removeCallbackInjection : globalRemoveCallback.value
  );
  const lenis = computed(
    () => lenisInjection?.value ? lenisInjection.value : globalLenis.value
  );
  nextTick(() => {
    nextTick(() => {
      if (!lenis.value) {
        throw new Error(
          "No lenis instance found, either mount a root lenis instance or wrap your component in a lenis provider"
        );
      }
    });
  });
  watch2(
    [lenis, addCallback, removeCallback],
    ([lenis2, addCallback2, removeCallback2]) => {
      if (!lenis2 || !addCallback2 || !removeCallback2 || !callback) return;
      addCallback2?.(callback, priority);
      callback?.(lenis2);
    }
  );
  onBeforeUnmount2(() => {
    if (!removeCallback.value || !callback) return;
    removeCallback.value?.(callback);
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