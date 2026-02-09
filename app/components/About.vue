<template>
  <section class="about-section relative min-h-screen min-w-full flex items-center">
    <!-- Black background (scoped to About only) -->
    <div class="absolute inset-0 md:bg-black"></div>

    <div class="relative z-10 w-full px-6 sm:px-10 lg:px-16 py-20">
      <div class="mx-auto max-w-4xl grid grid-cols-1 gap-10 items-stretch">
        <!-- Left: About -->
        <div
          class="text-center lg:text-left bg-blue-600 p-6 sm:p-8 shadow-sm
                 w-full h-full flex flex-col"
        >
          <h1
            class="text-white font-dm-mono tracking-widest uppercase text-xs sm:text-sm mb-3"
          >
            About
          </h1>

          <h2
            class="font-archivo-black text-4xl sm:text-5xl lg:text-5xl
                   tracking-wide uppercase text-purple-100"
          >
            Product design,
            <span class="text-purple-200">with</span> range.
          </h2>

          <p class="font-dm-mono mt-6 text-base sm:text-lg text-white">
            Iâ€™m a versatile product designer working across game design, animation, web design, and
            visual storytelling. With a bachelorâ€™s degree in product design and a strong art and
            design foundation, I create work that is clean, functional, and visually sharp.
          </p>

          <p class="mt-4 text-base sm:text-lg text-white">
            From brand and graphic design to 3D modeling, UI/UX, 2D/3D animation, and game assets and
            mechanics, I enjoy taking ideas from early concept to polished delivery.
          </p>

          <div class="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
            <span class="chip">Product & Graphic Design</span>
            <span class="chip">UI/UX & Web</span>
            <span class="chip">3D Modeling</span>
            <span class="chip">2D/3D Animation</span>
            <span class="chip">Game Assets & Mechanics</span>
          </div>

          <div class="flex-1"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-section {
  background: transparent;
}

/* UI atoms */
.chip {
  display: inline-flex;
  align-items: center;
  color: rgba(255, 255, 255, 1);
  padding: 0.4rem 0.65rem;
  font-size: 0.85rem;
  line-height: 1;
}
</style>
