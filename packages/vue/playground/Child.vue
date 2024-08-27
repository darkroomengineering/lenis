<script setup>
import { useLenis } from '../dist/lenis-vue'

const lenis = useLenis(() => {
  console.log('scroll')
})
</script>

<template>
  <button type="button" @click="lenis?.scrollTo(100)">scroll</button>
</template>
