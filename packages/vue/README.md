# lenis/vue

## Introduction
lenis/vue provides a `<VueLenis>` component that creates a [Lenis](https://github.com/darkroomengineering/lenis) instance and provides it to its children via context. This allows you to use Lenis in your Vue app without worrying about passing the instance down through props. It also provides a `useLenis` hook that allows you to access the Lenis instance from any component in your app. lenis/vue provides a vueLenisPlugin that you can use to register the component globally. This allows you to use the component in your templates without having to import it, by using the `vue-lenis` template tag.


## Installation

```bash
npm i lenis
```

### Vue
```js
// main.js
import { createApp } from 'vue'
import LenisVue from 'lenis/vue'

const app = createApp({})

app.use(LenisVue)
```

### Nuxt

```js
// nuxt.config.js
export default defineNuxtConfig({
  modules: ['lenis/nuxt'],
})
```

## Recommended CSS

Import the Lenis CSS to ensure proper behavior:

```js
import 'lenis/dist/lenis.css'
```

## Usage

```vue
<script setup>
import { VueLenis, useLenis } from 'lenis/vue' // Also available as global imports, no need to import them manually
import { watch } from 'vue'

const lenisOptions = {
  // lenis options (optional)
}

const lenis = useLenis((lenis) => {
  // called every scroll
  console.log(lenis)
})

watch(
  lenis,
  (lenis) => {
    // lenis instance
    console.log(lenis)
  },
  { immediate: true }
)
</script>

<template>
  <VueLenis root :options="lenisOptions" />
  <!-- content -->
</template>
```

## Props
- `options`: [Lenis options](https://github.com/darkroomengineering/lenis#instance-settings).
- `root`: if `true`, Lenis targets the `<html>` page scroll and renders no wrapper divs. Default: `false`.
- `rootContext`: registers the instance in the global registry so `useLenis()` reaches it from anywhere (even outside the provider subtree). Independent of `root` — set it on a scoped container to expose it globally, or unset it on a `root` to keep it local. Default: same as `root`.
- `name`: registers the instance under a name so it can be reached anywhere via `useLenis(name)`. Use it for secondary scrollers (e.g. a sidebar) alongside the page scroll.

## Hooks
Once the Lenis context is set (components mounted inside `<VueLenis>` or `<vue-lenis>`) you can use these handy hooks:

`useLenis` is a hook that returns the Lenis instance (as a `ComputedRef`).

Without a name it targets the nearest provider and falls back to the global root (`<VueLenis root>` / `rootContext`). Pass a name as the first argument to reach a specific instance from anywhere, ignoring context.

Arguments:
- `name` (optional, first): target a named instance instead of the nearest/root one
- `callback`: the function called whenever a scroll event is emitted
- `priority`: manage callback execution order (default `0`)

```vue
<script setup>
import { VueLenis, useLenis } from 'lenis/vue'

const scrollCallback = (lenis) => {
  // called on every scroll — lenis is passed as the argument
}

const lenis = useLenis(scrollCallback, 0)        // nearest provider, or the global root
const sidebar = useLenis('sidebar', scrollCallback) // a named instance, from anywhere
</script>

<template>
  <VueLenis root />
  <VueLenis name="sidebar" class="sidebar"><!-- ... --></VueLenis>
</template>
```





## Examples

### GSAP integration

```vue
<script setup>
import { ref, watchEffect } from 'vue'
import { VueLenis, useLenis } from 'lenis/vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const lenisRef = ref()

watchEffect((onInvalidate) => {
   if (!lenisRef.value?.lenis) return

  //  if using GSAP ScrollTrigger, update ScrollTrigger on scroll
  lenisRef.value.lenis.on('scroll', ScrollTrigger.update)

  // add the Lenis requestAnimationFrame (raf) method to GSAP's ticker
  // this ensures Lenis's smooth scroll animation updates on each GSAP tick
  function update(time) {
    lenisRef.value.lenis.raf(time * 1000)
  }
  gsap.ticker.add(update)

  // disable lag smoothing in GSAP to prevent any delay in scroll animations
  gsap.ticker.lagSmoothing(0)

  // clean up GSAP's ticker from the previous execution of watchEffect, or when the effect is stopped
  onInvalidate(() => {
    gsap.ticker.remove(update)
  })
})

// if using GSAP ScrollTrigger, remember to register the plugin
onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
})
</script>

<template>
  <VueLenis root ref="lenisRef" :options="{ autoRaf: false }" />
  <!-- content -->
</template>
```

### Motion Integration
```vue
<script setup>
import { VueLenis } from 'lenis/vue'
import { cancelFrame, frame } from 'motion-v'
import { onMounted, onUnmounted, ref } from 'vue'

const lenisRef = ref()

function update({ timestamp }) {
  lenisRef.value?.lenis?.raf(timestamp)
}

onMounted(() => {
  frame.update(update, true)
})

onUnmounted(() => {
  cancelFrame(update)
})
</script>

<template>
  <VueLenis ref="lenisRef" root :options="{ autoRaf: false }">
  <!-- content -->
</template>
```

<br/>

## License

MIT © [darkroom.engineering](https://github.com/darkroomengineering)
