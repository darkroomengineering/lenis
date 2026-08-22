<script setup>
import { useLenis } from 'lenis/vue'
import { watch } from 'vue'

const lenis = useLenis(
  'child',
  (lenis) => {
    // TODO: This only works after hot reloading so lenis is not defined on mount here
    console.log('child scroll', lenis.options.lerp, lenis.scroll)
  },
  0
)

watch(lenis, (lenis) => {
  console.log('Child Lenis lerp:', lenis.options.lerp)
})
</script>

<template>
  <button type="button" @click="lenis?.scrollTo(100)">scroll</button>
</template>
