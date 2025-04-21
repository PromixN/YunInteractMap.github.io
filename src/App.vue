<script setup lang="ts">
import UiView from './views/UiView.vue'
import MapView from './views/MapView.vue'
</script>

<template>
  <main class="container">
    <ui-view />
    <MapView />
  </main>
</template>

<style lang="scss" scoped>
.container {
  position: relative;
  width: 100vw;
  height: 100vh;
}
</style>
