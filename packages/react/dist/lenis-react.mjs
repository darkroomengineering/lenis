import { useFrame } from '@studio-freight/hamo';
import cn from 'clsx';
import Lenis from 'core/src/index.ts';
import React, { createContext, forwardRef, useRef, useState, useCallback, useImperativeHandle, useEffect, useContext } from 'react';
import { create } from 'zustand';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const LenisContext = createContext(null);
const useRoot = create(() => ({}));
function useCurrentLenis() {
    const local = useContext(LenisContext);
    const root = useRoot();
    return local !== null && local !== void 0 ? local : root;
}
function useLenis(callback, deps = [], priority = 0) {
    const { lenis, addCallback, removeCallback } = useCurrentLenis();
    useEffect(() => {
        if (!callback || !addCallback || !removeCallback || !lenis)
            return;
        addCallback(callback, priority);
        callback(lenis);
        return () => {
            removeCallback(callback);
        };
    }, [lenis, addCallback, removeCallback, priority, ...deps]);
    return lenis;
}
forwardRef((_a, ref) => {
    var { children, root = false, options = {}, autoRaf = true, rafPriority = 0, className } = _a, props = __rest(_a, ["children", "root", "options", "autoRaf", "rafPriority", "className"]);
    const wrapperRef = useRef(null);
    const contentRef = useRef(null);
    const [lenis, setLenis] = useState(undefined);
    const callbacksRefs = useRef([]);
    const addCallback = useCallback((callback, priority) => {
        callbacksRefs.current.push({ callback, priority });
        callbacksRefs.current.sort((a, b) => a.priority - b.priority);
    }, []);
    const removeCallback = useCallback((callback) => {
        callbacksRefs.current = callbacksRefs.current.filter((cb) => cb.callback !== callback);
    }, []);
    useImperativeHandle(ref, () => ({
        wrapper: wrapperRef.current,
        content: contentRef.current,
        lenis,
    }), [lenis]);
    useEffect(() => {
        const lenis = new Lenis(Object.assign(Object.assign({}, options), (!root && {
            wrapper: wrapperRef.current,
            content: contentRef.current,
        })));
        setLenis(lenis);
        return () => {
            lenis.destroy();
            setLenis(undefined);
        };
    }, [root, JSON.stringify(options)]);
    useFrame((time) => {
        if (autoRaf) {
            lenis === null || lenis === void 0 ? void 0 : lenis.raf(time);
        }
    }, rafPriority);
    useEffect(() => {
        if (root && lenis) {
            useRoot.setState({ lenis, addCallback, removeCallback });
        }
    }, [root, lenis, addCallback, removeCallback]);
    const onScroll = useCallback((lenisInstance) => {
        for (let i = 0; i < callbacksRefs.current.length; i++) {
            callbacksRefs.current[i].callback(lenisInstance);
        }
    }, []);
    useEffect(() => {
        lenis === null || lenis === void 0 ? void 0 : lenis.on('scroll', onScroll);
        return () => {
            lenis === null || lenis === void 0 ? void 0 : lenis.off('scroll', onScroll);
        };
    }, [lenis, onScroll]);
    const onClassNameChange = useCallback(() => {
        if (wrapperRef.current) {
            wrapperRef.current.className = cn(lenis === null || lenis === void 0 ? void 0 : lenis.className, className);
        }
    }, [lenis, className]);
    useEffect(() => {
        onClassNameChange();
        lenis === null || lenis === void 0 ? void 0 : lenis.on('className change', onClassNameChange);
        return () => {
            lenis === null || lenis === void 0 ? void 0 : lenis.off('className change', onClassNameChange);
        };
    }, [lenis, onClassNameChange]);
    return (React.createElement(LenisContext.Provider, { value: { lenis: lenis, addCallback, removeCallback } }, root ? (children) : (React.createElement("div", Object.assign({ ref: wrapperRef, className: cn(lenis === null || lenis === void 0 ? void 0 : lenis.className, className) }, props),
        React.createElement("div", { ref: contentRef }, children)))));
});
eexport;
xport;
ReactLenisexport;

export { LenisContext, useLenis };
//# sourceMappingURL=lenis-react.mjs.map
