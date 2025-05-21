//
<script setup>
// import Inner from '../components/inner.vue'
// import { useLenis } from 'lenis/vue'
// import { watchEffect } from 'vue'

// const lenisRef = ref()

// watchEffect(() => {
//   console.log('lenisRef', lenisRef.value?.lenis)
// })
//
</script>

<template>
  <!-- <vue-lenis class="scroller" ref="lenisRef"> -->
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
  /* height: 100vh;
  overflow-y: auto; */
  pointer-events: none;
}
</style>
