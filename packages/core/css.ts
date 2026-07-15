// ponytail: CSS shipped as a string so consumers (e.g. Framer, which can't load
// a CDN stylesheet at runtime) can inject `<style>{css}</style>` from the root
// import. Keep in sync with lenis.css — same ~15 lines, no build tooling to
// import .css as text.
export const css = `html.lenis,
html.lenis body {
  height: auto;
}

.lenis:not(.lenis-autoToggle).lenis-stopped {
  overflow: clip;
}

.lenis [data-lenis-prevent],
.lenis [data-lenis-prevent-wheel],
.lenis [data-lenis-prevent-touch],
.lenis [data-lenis-prevent-vertical],
.lenis [data-lenis-prevent-horizontal] {
  overscroll-behavior: contain;
}

.lenis.lenis-smooth iframe {
  pointer-events: none;
}

.lenis.lenis-autoToggle {
  transition-property: overflow;
  transition-duration: 1ms;
  transition-behavior: allow-discrete;
}
`
