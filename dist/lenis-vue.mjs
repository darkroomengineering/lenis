import m from "lenis";
import { defineComponent as p, ref as a, onMounted as s, onBeforeUnmount as c, provide as v, h as l, inject as w } from "vue";
const d = Symbol("LenisContext");
function B(n = () => {
}) {
  var t;
  const e = w(d);
  if (!e)
    throw new Error("No global nor local lenis provider was found");
  return (t = e.value) == null || t.on("scroll", n), c(() => {
    var r;
    return (r = e.value) == null ? void 0 : r.off("scroll", n);
  }), e;
}
const y = p({
  name: "LenisVue",
  props: {
    root: {
      type: Boolean,
      default: !1
    },
    autoRaf: {
      type: Boolean,
      default: !0
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(n, { slots: e }) {
    const t = a(null), r = a(), i = a();
    return s(() => {
      if (t.value = new m({
        ...n.options,
        ...n.root ? {} : {
          wrapper: r.value,
          content: i.value
        }
      }), n.autoRaf) {
        let o = function(u) {
          var f;
          (f = t.value) == null || f.raf(u), requestAnimationFrame(o);
        };
        requestAnimationFrame(o);
      }
    }), c(() => {
      var o;
      (o = t.value) == null || o.destroy();
    }), v(d, t), () => {
      var o, u;
      return n.root ? (o = e.default) == null ? void 0 : o.call(e) : l("div", { class: "lenis", ref: r }, [
        l("div", { ref: i }, (u = e.default) == null ? void 0 : u.call(e))
      ]);
    };
  }
}), g = (n) => {
  n.component("lenis", y);
};
export {
  d as LenisSymbol,
  y as LenisVue,
  g as default,
  B as useLenis
};
//# sourceMappingURL=lenis-vue.mjs.map
