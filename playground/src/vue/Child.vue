<script setup>
import { useLenis } from 'lenis/vue'
import { nextTick, onMounted } from 'vue'

const lenis = useLenis((lenis) => {
  // TODO: This only works after hot reloading so lenis is not defined on mount here
  console.log('child scroll', lenis.options.lerp, lenis.scroll)
})

onMounted(() => {
  nextTick(() => {
    console.log('Lenis lerp:', lenis.value?.options.lerp)
  })
})
</script>

<template>
  <button type="button" @click="lenis?.scrollTo(100)">scroll</button>
</template>
