<script setup>
import { useLenis } from 'lenis/vue'
import { LoremIpsum } from 'lorem-ipsum'
import { watch } from 'vue'

const lenis = useLenis((lenis) => {
  console.log('innerchild scroll', lenis.options.lerp, lenis.scroll)
})

watch(lenis, (lenis) => {
  console.log('Inner Lenis lerp:', lenis.options.lerp)
})

const lorem = new LoremIpsum().generateParagraphs(100)
</script>

<template>
  <p>
    {{ lorem }}
  </p>
</template>
