<script setup>
import Inner from '../components/inner.vue'
</script>

<template>
  <!-- <vue-lenis root /> -->
  <!-- <vue-lenis class="scroller"> -->
  <div class="content">About <Inner /></div>
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
