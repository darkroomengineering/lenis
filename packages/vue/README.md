# lenis/vue

## Introduction
lenis/vue provides a `<VueLenis>` component that creates a [Lenis](https://github.com/darkroomengineering/lenis) instance and provides it to its children via context. This allows you to use Lenis in your Vue app without worrying about passing the instance down through props. It also provides a `useLenis` hook that allows you to access the Lenis instance from any component in your app. lenis/vue provides a vueLenisPlugin that you can use to register the component globally. This allows you to use the component in your templates without having to import it, by using the `vue-lenis` template tag.


## Installation

```bash
npm i lenis
```

## Usage

### Basic

```vue
<script setup>
import { VueLenis, useLenis } from 'lenis/react'

const lenis = useLenis(({ scroll }) => {
  // called every scroll
})
</script>

<template>
  <VueLenis root>
    <!-- content -->
  </VueLenis>
</template>
```

### Plugin
```js
import { createApp } from 'vue'
import vueLenisPlugin from 'lenis/vue'

const app = createApp({})

app.use(vueLenisPlugin)
```

```vue
<script setup>
import { useLenis } from 'lenis/react'

const lenis = useLenis(({ scroll }) => {
  // called every scroll
})
</script>

<template>
  <vue-lenis root>
    <!-- content -->
  </vue-lenis>
</template>
```

## Props
- `options`: [Lenis options](https://github.com/darkroomengineering/lenis#instance-settings).
- `root`: Lenis will be instanciate using `<html>` scroll. Default: `false`.
- `autoRaf`: if `false`, `lenis.raf` needs to be called manually. Default: `true`.
- `rafPriority`: [Tempus](https://github.com/studio-freight/tempus#readme) execution priority. Default: `0`.
- `props`: Props to pass to the wrapper div. Default: `{}`.

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
import { VueLenis, useLenis } from 'lenis/react'
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

## Authors

This tool is maintained by the darkroom.engineering team:

- Clément Roche ([@clementroche\_](https://twitter.com/clementroche_)) – [darkroom.engineering](https://darkroom.engineering)
- Guido Fier ([@uido15](https://twitter.com/uido15)) – [darkroom.engineering](https://darkroom.engineering)
- Leandro Soengas ([@lsoengas](https://twitter.com/lsoengas)) - [darkroom.engineering](https://darkroom.engineering)
- Fermin Fernandez ([@Fermin_FerBridd](https://twitter.com/Fermin_FerBridd)) - [darkroom.engineering](https://darkroom.engineering)
- Felix Mayr ([@feledori](https://twitter.com/feledori)) - [darkroom.engineering](https://darkroom.engineering)
- Franco Arza ([@arzafran](https://twitter.com/arzafran)) - [darkroom.engineering](https://darkroom.engineering)

## License

[The MIT License.](https://opensource.org/licenses/MIT)
