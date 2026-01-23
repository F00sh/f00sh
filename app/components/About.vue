<template>
  <section
    ref="sectionEl"
    class="about-section relative overflow-hidden flex items-center min-h-screen"
  >
    <!-- Cross-platform "fixed" background (works on mobile too) -->
    <div class="bg-layer" aria-hidden="true"></div>

    <div class="content w-full px-6 sm:px-10 lg:px-16 pb-14">
      <div class="mb-20">
        <img
          src="@/assets/img/glasses.svg"
          alt="glasses"
          class="mx-auto mt-40 md:ml-255 w-90 opacity-70 pointer-events-none select-none"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <!-- Left -->
        <div class="text-center lg:text-left">
          <p class="text-purple-300 tracking-widest uppercase text-xs sm:text-sm mb-3">
            About
          </p>

          <h1
            class="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-tight text-purple-100"
          >
            Product design,
            <span class="text-purple-200">with</span> range.
          </h1>

          <p class="mt-6 text-base sm:text-lg text-purple-100/90 max-w-xl mx-auto lg:mx-0">
            I’m a versatile product designer working across game design, animation, web design, and
            visual storytelling. With a bachelor’s degree in product design and a strong art/design
            foundation, I build work that’s clean, functional, and visually sharp.
          </p>

          <p class="mt-4 text-base sm:text-lg text-purple-100/90 max-w-xl mx-auto lg:mx-0">
            From brand and graphic design to 3D modeling, UI/UX, 2D/3D animation, and game assets +
            mechanics, I like taking ideas from rough concept to polished delivery.
          </p>

          <div class="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
            <span class="chip">Product & Graphic Design</span>
            <span class="chip">UI/UX & Web</span>
            <span class="chip">3D Modeling</span>
            <span class="chip">2D/3D Animation</span>
            <span class="chip">Game Assets & Mechanics</span>
          </div>

          <div class="mt-10 flex flex-wrap items-center gap-4 justify-center lg:justify-start">
            <div class="badge">
              <span class="badge-label">Based in</span>
              <span class="badge-value">Croatia</span>
            </div>

            <div class="badge">
              <span class="badge-label">Open for</span>
              <span class="badge-value">steady collaborations</span>
            </div>
          </div>
        </div>

        <!-- Right -->
        <div class="panel rounded-2xl border border-white/20 bg-black/45 p-6 sm:p-8 shadow-sm mx-auto w-full max-w-xl">
          <h2 class="text-lg sm:text-xl font-bold text-white mb-4">
            Toolkit
          </h2>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div class="tool">Adobe CC</div>
            <div class="tool">Blender</div>
            <div class="tool">Figma</div>
            <div class="tool">HTML &amp; CSS</div>
            <div class="tool">Revit</div>
            <div class="tool">AutoCAD</div>
          </div>

          <div class="mt-8 pt-6 border-t border-white/15">
            <h3 class="text-white font-semibold mb-3">
              What you get
            </h3>
            <ul class="space-y-2 text-white/90">
              <li class="li">Clear concepts and fast iterations</li>
              <li class="li">Strong visuals with practical constraints in mind</li>
              <li class="li">Assets and UI that feel coherent across the whole product</li>
            </ul>

            <p class="mt-6 text-white/85">
              If you have a direction in mind, I’ll help you shape it and ship it—cleanly.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const sectionEl = ref(null)

let rafId = 0

function updateClipVars() {
  rafId = 0
  const el = sectionEl.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  const vh = window.innerHeight || 1

  // For the fixed bg, clip away parts of the viewport that are outside this section.
  const clipTop = Math.max(0, -rect.top)
  const clipBottom = Math.max(0, rect.bottom - vh)

  el.style.setProperty('--clip-top', `${clipTop}px`)
  el.style.setProperty('--clip-bottom', `${clipBottom}px`)
}

function requestUpdate() {
  if (rafId) return
  rafId = window.requestAnimationFrame(updateClipVars)
}

onMounted(() => {
  updateClipVars()
  window.addEventListener('scroll', requestUpdate, { passive: true })
  window.addEventListener('resize', requestUpdate, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', requestUpdate)
  window.removeEventListener('resize', requestUpdate)
  if (rafId) window.cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.about-section {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  background: #000;

  /* defaults for clip variables */
  --clip-top: 0px;
  --clip-bottom: 0px;
}

/* Mobile-safe fixed background:
   - use a fixed-position element
   - clip it to this section via CSS variables updated on scroll */
.bg-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  background-image: url('~/assets/img/nina1.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  z-index: 0;
  pointer-events: none;

  /* Confine visibility to this section */
  clip-path: inset(var(--clip-top) 0px var(--clip-bottom) 0px);
  will-change: clip-path;
}

/* Content on top */
.content {
  position: relative;
  z-index: 1;
}

/* UI atoms */
.chip {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(0, 0, 0, 0.35);
  color: rgba(255, 255, 255, 0.92);
  padding: 0.4rem 0.65rem;
  border-radius: 999px;
  font-size: 0.85rem;
  line-height: 1;
}

.badge {
  display: inline-flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(0, 0, 0, 0.35);
}

.badge-label {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.72);
}

.badge-value {
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
}

.panel {
  backdrop-filter: blur(6px);
}

.tool {
  padding: 0.6rem 0.75rem;
  border-radius: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.45);
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  text-align: center;
  font-size: 0.9rem;
}

.li {
  position: relative;
  padding-left: 1.1rem;
}
.li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.65em;
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.75);
}

/* Your existing mobile alignment preference */
@media (max-width: 768px) {
  .about-section {
    align-items: flex-start;
  }
}
</style>
