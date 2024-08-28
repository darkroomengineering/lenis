<script setup>
import { nextTick, onMounted } from 'vue'
import { useLenis } from '../dist/lenis-vue'

const lenis = useLenis((lenis) => {
  console.log('child scroll', lenis.scroll)
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
