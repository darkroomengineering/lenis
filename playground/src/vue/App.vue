<script setup>
import { useLenis } from 'lenis/vue'
import { LoremIpsum } from 'lorem-ipsum'
import { ref } from 'vue'
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

console.log(lenis)

// watch(lenis, (lenis) => {
//   console.log('lenis in callback', lenis)
// })
</script>
<template>
  <lenis root :options="{ lerp }" :autoRaf="autoRaf">
    <Child />
    <button @click="lerp += 0.1">more lerp</button>
    <button @click="lerp -= 0.1">less lerp</button>
    <button @click="autoRaf = !autoRaf">toggle autoRaf</button>
    <lenis
      :options="{ lerp: 0.2 }"
      style="height: 50svh; overflow: scroll"
      class="inner"
    >
      <InnerChild />
    </lenis>
    <p>
      {{ lorem }}
    </p>
  </lenis>
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
