<template>
  <nav>
    <NuxtLink to="/">Home</NuxtLink>
    <NuxtLink to="/about">About</NuxtLink>
  </nav>
  <vue-lenis class="scroller">
    <NuxtPage />
  </vue-lenis>
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
