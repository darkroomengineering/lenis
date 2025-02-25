// packages/svelte/src/SvelteLenis.svelte
import "svelte/internal/disclose-version";
import * as $3 from "svelte/internal/client";

// packages/svelte/src/provider/LenisByContext.svelte
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import Lenis from "lenis";

// packages/svelte/src/instances/context.ts
import { getContext, hasContext, setContext } from "svelte";

// packages/svelte/src/callbacks/callbacks.svelte.ts
var CallbackManager = class {
  callbacks = $state([]);
  constructor() {
  }
  add(callback) {
    this.callbacks.push(callback);
    this.callbacks.sort((a, b) => a.priority - b.priority);
  }
  remove(callback) {
    this.callbacks = this.callbacks.filter((cb) => cb !== callback);
  }
  forEach(byItem) {
    this.callbacks.forEach(byItem);
  }
};
var callbacks_svelte_default = CallbackManager;

// packages/svelte/src/instances/root.svelte.ts
var root = $state({ value: void 0 });

// packages/svelte/src/instances/context.ts
var LENIS_CONTEXT = Symbol("__LENIS_CONTEXT__");
var Root = {
  instance: () => root.value,
  callbackManager: new callbacks_svelte_default()
};
var LenisContext = {
  get() {
    if (hasContext(LENIS_CONTEXT)) {
      return getContext(LENIS_CONTEXT);
    } else {
      return Root;
    }
  },
  set(lenis) {
    return setContext(LENIS_CONTEXT, {
      instance: lenis,
      callbackManager: new callbacks_svelte_default()
    });
  }
};

// packages/svelte/src/provider/LenisByContext.svelte
var root2 = $.template(`<div><div><!></div></div>`);
function LenisByContext($$anchor, $$props) {
  $.push($$props, true);
  let props = $.rest_props($$props, ["$$slots", "$$events", "$$legacy"]);
  let wrapper;
  let content;
  let lenis = $.state(void 0);
  $.user_effect(() => {
    const instance = new Lenis({ ...$$props.options, wrapper, content });
    $.set(lenis, $.proxy(instance));
    return () => instance.destroy();
  });
  LenisContext.set(() => $.get(lenis));
  var div = root2();
  let attributes;
  var div_1 = $.child(div);
  var node = $.child(div_1);
  $.snippet(node, () => $$props.children);
  $.reset(div_1);
  $.bind_this(div_1, ($$value) => content = $$value, () => content);
  $.reset(div);
  $.bind_this(div, ($$value) => wrapper = $$value, () => wrapper);
  $.template_effect(() => attributes = $.set_attributes(div, attributes, { class: $$props.class, ...props }));
  $.append($$anchor, div);
  $.pop();
}

// packages/svelte/src/provider/LenisByRoot.svelte
import "svelte/internal/disclose-version";
import * as $2 from "svelte/internal/client";
import Lenis2 from "lenis";
function LenisByRoot($$anchor, $$props) {
  $2.push($$props, true);
  let props = $2.rest_props($$props, ["$$slots", "$$events", "$$legacy"]);
  $2.effect_root(() => {
    const instance = new Lenis2($$props.options);
    root.value = instance;
    console.log(root.value);
    return () => instance.destroy();
  });
  LenisContext.set(() => root.value);
  var fragment = $2.comment();
  var node = $2.first_child(fragment);
  $2.snippet(node, () => $$props.children);
  $2.append($$anchor, fragment);
  $2.pop();
}

// packages/svelte/src/SvelteLenis.svelte
function SvelteLenis($$anchor, $$props) {
  $3.push($$props, true);
  let props = $3.rest_props($$props, ["$$slots", "$$events", "$$legacy"]);
  var fragment = $3.comment();
  var node = $3.first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      LenisByRoot($$anchor2, $3.spread_props(() => props));
    };
    var alternate = ($$anchor2) => {
      LenisByContext($$anchor2, $3.spread_props(() => props));
    };
    $3.if(node, ($$render) => {
      if ($$props.root) $$render(consequent);
      else $$render(alternate, false);
    });
  }
  $3.append($$anchor, fragment);
  $3.pop();
}

// packages/svelte/src/use-lenis.svelte.ts
import { untrack } from "svelte";
var useLenis = (onScroll, priority = 0) => {
  const context = LenisContext.get();
  $effect(() => {
    const callback = { action: onScroll, priority };
    untrack(() => {
      context.callbackManager.add(callback);
    });
    return () => {
      context.callbackManager.remove(callback);
    };
  });
  $effect(() => {
    const lenis = context.instance();
    if (!lenis) return;
    const onScroll2 = (lenis2) => {
      context.callbackManager.forEach(
        (item) => item.action(lenis2)
      );
    };
    lenis.on("scroll", onScroll2);
    return () => lenis.off("scroll", onScroll2);
  });
  return {
    get current() {
      return context.instance();
    }
  };
};
export {
  SvelteLenis,
  useLenis
};
//# sourceMappingURL=lenis-svelte.mjs.map