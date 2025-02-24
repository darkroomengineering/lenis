<script setup>
import { useLenis } from 'lenis/vue'

const lenis = useLenis((lenis) => {
  console.log('component callback', lenis)
})

watch(lenis, (lenis) => {
  console.log('component lenis', lenis)
})
</script>

<template>
  <div>Inner</div>
</template>
