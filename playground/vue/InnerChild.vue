<script setup>
import { useLenis } from 'lenis/vue'
import { LoremIpsum } from 'lorem-ipsum'

useLenis((lenis) => {
  console.log('innerchild scroll', lenis.options.lerp, lenis.scroll)
})

const lorem = new LoremIpsum().generateParagraphs(100)
</script>

<template>
  <p>
    {{ lorem }}
  </p>
</template>
