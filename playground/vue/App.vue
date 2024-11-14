<script setup>
import { useLenis } from 'lenis/vue'
import { LoremIpsum } from 'lorem-ipsum'
import { ref, watch } from 'vue'
import Child from './Child.vue'
import InnerChild from './InnerChild.vue'

const lorem = new LoremIpsum().generateParagraphs(200)

const lerp = ref(0.1)
const autoRaf = ref(true)

const lenis = useLenis(
  (lenis) => {
    console.log('root scroll', lenis.options.lerp, lenis.scroll)
  },
  0,
  'root'
)

const lenisRef = ref()

watch(lenis, (lenis) => {
  console.log('lenis in callback', lenis)
})

watch(lenisRef, (lenisRef) => {
  console.log('lenis in ref', lenisRef.lenis)
})
</script>

<template>
  <vue-lenis ref="lenisRef" root :options="{ lerp, autoRaf }">
    <Child />
    <button @click="lerp += 0.1">more lerp</button>
    <button @click="lerp -= 0.1">less lerp</button>
    <button @click="lenis.scrollTo(200)">scroll to 200</button>
    <button @click="lenisRef.lenis.scrollTo(200)">ref scroll to 200</button>
    <vue-lenis
      :options="{ lerp: 0.2, autoRaf }"
      style="height: 50svh; overflow: scroll"
      class="inner"
    >
      <InnerChild />
    </vue-lenis>
    <p>
      {{ lorem }}
    </p>
  </vue-lenis>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
