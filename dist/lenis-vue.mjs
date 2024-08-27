import { defineComponent as f, shallowRef as m, ref as i, provide as y, onMounted as k, onBeforeUnmount as w, openBlock as _, createElementBlock as B, createElementVNode as $, renderSlot as c } from "vue";
import h from "@darkroom.engineering/tempus";
import g from "lenis";
const E = f({
  name: "lenis"
}), L = /* @__PURE__ */ f({
  ...E,
  props: {
    root: {
      type: Boolean,
      default: () => !1
    },
    instance: { type: String },
    options: {
      type: Object,
      default: () => {
      }
    }
  },
  setup(e) {
    const { root: o, instance: a, options: p } = e, t = m(), s = i(), u = i(), r = i(), d = `lenis${a ? `-${a}` : ""}`;
    y(d, t);
    function v() {
      t.value || (t.value = new g({
        ...p,
        ...o ? {} : {
          wrapper: s.value,
          content: u.value,
          eventsTarget: s.value
        }
      }), r.value = h.add((n) => {
        t.value.raf(n);
      }));
    }
    return k(() => {
      !t.value && o && v();
    }), w(() => {
      var n, l;
      (n = t.value) == null || n.destroy(), (l = r.value) == null || l.call(r);
    }), (n, l) => e.root ? c(n.$slots, "default", { key: 1 }) : (_(), B("div", {
      key: 0,
      class: "lenis",
      ref_key: "wrapper",
      ref: s
    }, [
      $("div", {
        ref_key: "content",
        ref: u
      }, [
        c(n.$slots, "default")
      ], 512)
    ], 512));
  }
}), S = (e) => (e.install = (o) => {
  const a = e.name;
  o.component(a, e);
}, e), x = S(L);
export {
  x as default
};
//# sourceMappingURL=lenis-vue.mjs.map
