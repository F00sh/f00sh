<template>
  <div id="app-root" class="font-manrope tracking-wide leading-normal text-neutral-50 antialiased">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
html,
body,
#__nuxt,
#app-root {
  min-height: 100%;
}

html {
  background: #050706;
  color-scheme: dark;
}

#app-root {
  position: relative;
  background:
    radial-gradient(circle at 20% 12%, rgba(163, 230, 53, 0.07), transparent 34%),
    radial-gradient(circle at 85% 85%, rgba(56, 189, 248, 0.06), transparent 31%),
    #050706;
}
</style>
