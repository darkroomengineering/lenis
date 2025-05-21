<script setup>
import { useLenis } from 'lenis/vue'
import { watch, watchEffect } from 'vue'
import gsap from 'gsap'

const lenis = useLenis((lenis) => {
  console.log('page callback', lenis)
})

watch(
  lenis,
  (lenis) => {
    console.log('page', lenis)
  },
  { immediate: true }
)

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
  <nav>
    <NuxtLink to="/">Home</NuxtLink>
    <NuxtLink to="/about">About</NuxtLink>
  </nav>
  <vue-lenis root :options="{ autoRaf: false }" ref="lenisRef" />
  <NuxtPage />
</template>

<style>
* {
  margin: 0;
}
</style>

<style scoped>
#app {
  padding-top: 24px;
}

nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 1rem;
}

.scroller {
  height: 100vh;
  overflow-y: auto;
}
</style>
