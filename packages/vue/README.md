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
// plugins/lenis.js
import LenisVue from 'lenis/vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(LenisVue)
})
```

## Usage

```vue
<script setup>
import { VueLenis, useLenis } from 'lenis/vue'
import { watch } from 'vue'

const lenis = useLenis(({ scroll }) => {
  // called every scroll
})

watch(lenis, (lenis) => {
  // lenis instance
})
</script>

<template>
  <VueLenis root>
    <!-- content -->
  </VueLenis>
</template>
```



## Props
- `options`: [Lenis options](https://github.com/darkroomengineering/lenis#instance-settings).
- `root`: Lenis will be instanciate using `<html>` scroll. Default: `false`.

## Hooks
Once the Lenis context is set (components mounted inside `<VueLenis>` or `<vue-lenis>`) you can use these handy hooks:

`useLenis` is a hook that returns the Lenis instance

The hook takes three argument:
- `callback`: The function to be called whenever a scroll event is emitted
- `priority`: Manage callback execution order

## Examples

GSAP integration

```vue
<script setup>
import { ref, watchEffect } from 'vue'
import { VueLenis, useLenis } from 'lenis/vue'
import gsap from 'gsap'

const lenisRef = ref()

watchEffect((onInvalidate) => {
  function update(time) {
    lenisRef.value?.lenis?.raf(time * 1000)
  }
  gsap.ticker.add(update)

  onInvalidate(() => {
    gsap.ticker.remove(update)
  })
})
</script>

<template>
  <VueLenis ref="lenisRef" :autoRaf="false">
    <!-- content -->
  </VueLenis>
</template>
```

<br/>

## License

MIT © [darkroom.engineering](https://github.com/darkroomengineering)
