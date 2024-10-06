"use client";

// packages/react/src/provider.tsx
import Tempus from "@darkroom.engineering/tempus";
import Lenis from "lenis";
import {
  createContext,
  forwardRef,
  useCallback,
  useEffect as useEffect2,
  useImperativeHandle,
  useRef,
  useState as useState2
} from "react";

// packages/react/src/store.ts
import { useEffect, useState } from "react";
var Store = class {
  constructor(state) {
    this.state = state;
  }
  listeners = [];
  set(state) {
    this.state = state;
    for (let listener of this.listeners) {
      listener(this.state);
    }
  }
  subscribe(listener) {
    this.listeners = [...this.listeners, listener];
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
  get() {
    return this.state;
  }
};
function useStore(store) {
  const [state, setState] = useState(store.get());
  useEffect(() => {
    return store.subscribe((state2) => setState(state2));
  }, [store]);
  return state;
}

// packages/react/src/provider.tsx
import { jsx } from "react/jsx-runtime";
var LenisContext = createContext(null);
var rootLenisContextStore = new Store(null);
var ReactLenis = forwardRef(
  ({
    children,
    root = false,
    options = {},
    autoRaf = true,
    rafPriority = 0,
    className,
    props
  }, ref) => {
    const wrapperRef = useRef(null);
    const contentRef = useRef(null);
    const [lenis, setLenis] = useState2(void 0);
    useImperativeHandle(
      ref,
      () => ({
        wrapper: wrapperRef.current,
        content: contentRef.current,
        lenis
      }),
      [lenis]
    );
    useEffect2(() => {
      const lenis2 = new Lenis({
        ...options,
        ...!root && {
          wrapper: wrapperRef.current,
          content: contentRef.current
        }
      });
      setLenis(lenis2);
      return () => {
        lenis2.destroy();
        setLenis(void 0);
      };
    }, [root, JSON.stringify(options)]);
    useEffect2(() => {
      if (!lenis || !autoRaf) return;
      return Tempus.add((time) => lenis.raf(time), rafPriority);
    }, [lenis, autoRaf, rafPriority]);
    const callbacksRefs = useRef([]);
    const addCallback = useCallback(
      (callback, priority) => {
        callbacksRefs.current.push({ callback, priority });
        callbacksRefs.current.sort((a, b) => a.priority - b.priority);
      },
      []
    );
    const removeCallback = useCallback(
      (callback) => {
        callbacksRefs.current = callbacksRefs.current.filter(
          (cb) => cb.callback !== callback
        );
      },
      []
    );
    useEffect2(() => {
      if (root && lenis) {
        rootLenisContextStore.set({ lenis, addCallback, removeCallback });
        return () => rootLenisContextStore.set(null);
      }
    }, [root, lenis, addCallback, removeCallback]);
    useEffect2(() => {
      if (!lenis) return;
      const onScroll = (data) => {
        for (let i = 0; i < callbacksRefs.current.length; i++) {
          callbacksRefs.current[i]?.callback(data);
        }
      };
      lenis.on("scroll", onScroll);
      return () => {
        lenis.off("scroll", onScroll);
      };
    }, [lenis]);
    return /* @__PURE__ */ jsx(
      LenisContext.Provider,
      {
        value: { lenis, addCallback, removeCallback },
        children: root ? children : /* @__PURE__ */ jsx("div", { ref: wrapperRef, className, ...props, children: /* @__PURE__ */ jsx("div", { ref: contentRef, children }) })
      }
    );
  }
);

// packages/react/src/use-lenis.ts
import { useContext, useEffect as useEffect3 } from "react";
var fallbackContext = {};
function useLenis(callback, deps = [], priority = 0) {
  const localContext = useContext(LenisContext);
  const rootContext = useStore(rootLenisContextStore);
  const currentContext = localContext ?? rootContext ?? fallbackContext;
  const { lenis, addCallback, removeCallback } = currentContext;
  useEffect3(() => {
    if (!callback || !addCallback || !removeCallback || !lenis) return;
    addCallback(callback, priority);
    callback(lenis);
    return () => {
      removeCallback(callback);
    };
  }, [lenis, addCallback, removeCallback, priority, ...deps]);
  return lenis;
}
export {
  ReactLenis as Lenis,
  ReactLenis,
  ReactLenis as default,
  useLenis
};
//# sourceMappingURL=lenis-react.mjs.map