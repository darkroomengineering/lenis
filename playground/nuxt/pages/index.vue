<script setup>
// `useLenis` and `VueLenis` are auto-imported by the lenis/nuxt module.
// Bare useLenis() resolves the root (page) instance from app.vue.
const page = useLenis((lenis) => {
  console.log('page scroll', lenis.scroll)
})

watch(page, (lenis) => console.log('page instance', lenis))
</script>

<template>
  <div class="content">
    Home

    <!-- Inner sits OUTSIDE the sidebar subtree, yet reaches it via its name -->
    <Inner />

    <VueLenis name="sidebar" class="scroller">
      <div class="tall">Scrollable sidebar content</div>
    </VueLenis>
  </div>
</template>

<style scoped>
.content {
  padding-top: 24px;
  min-height: 200vh;
}

.scroller {
  height: 50vh;
  overflow-y: auto;
  border: 1px solid currentColor;
}

.tall {
  min-height: 200vh;
}
</style>
