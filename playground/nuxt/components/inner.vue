<script setup>
// Reaches the `name="sidebar"` instance even though Inner is rendered outside
// its subtree — named lookups read the registry, not Vue's inject context.
const sidebar = useLenis('sidebar', (lenis) => {
  console.log('inner: sidebar scroll', lenis.scroll)
})

watch(sidebar, (lenis) => console.log('inner: sidebar instance', lenis))
</script>

<template>
  <button type="button" @click="sidebar?.scrollTo(300)">
    scroll sidebar from Inner
  </button>
</template>
