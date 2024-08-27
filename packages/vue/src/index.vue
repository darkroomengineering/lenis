<script setup lang="ts">
import Tempus from '@darkroom.engineering/tempus'
import Lenis from 'lenis'
import { onBeforeUnmount, onMounted, provide, ref, shallowRef } from 'vue'

const { root, instance, options } = defineProps({
  root: {
    type: Boolean,
    default: () => false,
  },
  instance: { type: String },
  options: {
    type: Object,
    default: () => {},
  },
})

const lenis = shallowRef<Lenis>()
const wrapper = ref<HTMLDivElement>()
const content = ref<HTMLDivElement>()
const removeRaf = ref<(() => void) | undefined>()

// Provide instance for useLenis composable
const instanceKey = `lenis${instance ? `-${instance}` : ''}`
provide(instanceKey, lenis)

// Initialize with Tempus
function initLenis() {
  if (lenis.value) return

  lenis.value = new Lenis({
    ...options,
    ...(!root
      ? {
          wrapper: wrapper.value,
          content: content.value,
          eventsTarget: wrapper.value,
        }
      : {}),
  })

  removeRaf.value = Tempus.add((time: number) => {
    lenis.value!.raf(time)
  })
}

onMounted(() => {
  if (!lenis.value && !root) {
    initLenis()
  }
})

// Kill lenis before unmount
onBeforeUnmount(() => {
  lenis.value?.destroy()
  removeRaf.value?.()
})
</script>

<template>
  <div v-if="!root" class="lenis" ref="wrapper">
    <div ref="content">
      <slot />
    </div>
  </div>
  <slot v-else />
</template>
