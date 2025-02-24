<script setup>
import Inner from '../components/inner.vue'
import { useLenis } from 'lenis/nuxt'

const lenis = useLenis((lenis) => {
  console.log('page callback', lenis)
})

watch(lenis, (lenis) => {
  console.log('page', lenis)
})
</script>

<template>
  <!-- <vue-lenis class="scroller"> -->
  <div class="content">Home <Inner /></div>
  <!-- </vue-lenis> -->
</template>

<style scoped>
.content {
  /* min-height: 200vh; */
  padding-top: 24px;
  min-height: 200vh;
}

.scroller {
  height: 100vh;
  overflow-y: auto;
}
</style>
