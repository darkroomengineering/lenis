<script setup>
import { useLenis } from 'lenis/vue'

const lenis = useLenis((lenis) => {
  console.log('lenis in callback', lenis)
})

console.log('lenis in component', lenis)
</script>

<template>
  <div>Inner</div>
</template>
