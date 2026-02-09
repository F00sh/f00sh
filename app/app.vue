<template>
  <div id="app-root" class="font-atkinson-hyperlegible text-white tracking-wide leading-normal">
    <!-- Global fixed background -->
    <div class="global-bg" aria-hidden="true"></div>

    <!-- Page content -->
    <NuxtPage />
  </div>
</template>

<script setup>
import ninaBg from '~/assets/img/nina1.png'
</script>

<style>
html,
body,
#__nuxt,
#app-root {
  height: 100%;
}

#app-root {
  position: relative;
}

/* Fixed background */
.global-bg {
  position: fixed;
  inset: 0;
  z-index: -1;

  background-image: url('~/assets/img/nina1.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  /* optional micro polish */
  transform: translateZ(0);
  will-change: transform;
}
</style>
