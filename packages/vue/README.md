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

## Usage

```vue
<script setup>
import { VueLenis, useLenis } from 'lenis/vue'
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
- `root`: if `true`, Lenis will be instanciate using `<html>` scroll, then you can use the `useLenis` hook to access the Lenis instance from anywhere in your app. Default: `false`.

## Hooks
Once the Lenis context is set (components mounted inside `<VueLenis>` or `<vue-lenis>`) you can use these handy hooks:

`useLenis` is a hook that returns the Lenis instance

The hook takes two arguments:
- `callback`: The function to be called whenever a scroll event is emitted
- `priority`: Manage callback execution order

```vue
<script setup>
import { VueLenis, useLenis } from 'lenis/vue'
import { watch } from 'vue'

const scrollCallback = (lenis) => {
  // called on every scroll
  // useLenis provides the lenis instance as an argument
}

const lenis = useLenis(scrollCallback, 0) // where 0 is the default callback priority
</script>

<template>
  <VueLenis root />
  <!-- content -->
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
  gsap.registerPlugin(ScrollTrigger))
})
</script>

<template>
  <VueLenis root ref="lenisRef" :options="{ autoRaf: false }" />
  <!-- content -->
</template>
```


<br/>

## License

MIT © [darkroom.engineering](https://github.com/darkroomengineering)
