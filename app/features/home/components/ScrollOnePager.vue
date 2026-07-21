<template>
  <div ref="root" class="home-root relative isolate text-[#f2f3ef]">
    <div class="space-fallback pointer-events-none fixed inset-0 -z-30" aria-hidden="true" />
    <ClientOnly><HomeLandscape v-if="sceneReady" @telemetry="updateTelemetry" /></ClientOnly>
    <div class="readability-layer pointer-events-none fixed inset-0 -z-10" aria-hidden="true" />

    <nav class="section-rail" aria-label="Home sections">
      <a
        v-for="(section, index) in sectionNav"
        :key="section.id"
        :href="`#${section.id}`"
        class="section-rail__link focus-outline"
        :class="{ 'section-rail__link--active': activeSection === section.id }"
        :aria-current="activeSection === section.id ? 'location' : undefined"
      ><span>0{{ index + 1 }}</span><i aria-hidden="true" /></a>
    </nav>

    <div class="space-hud" aria-hidden="true">
      <div class="space-hud__corner space-hud__corner--left">
        <div class="space-hud__bracket"><i /><i /></div>
        <div class="space-hud__copy">
          <span class="space-hud__label">NAV / GALACTIC POSITION</span>
          <span class="space-hud__value">X {{ formatCoordinate(telemetry.x) }} &nbsp; Y {{ formatCoordinate(telemetry.y) }}</span>
          <span class="space-hud__value">Z {{ formatCoordinate(telemetry.z) }} &nbsp; T {{ formatProgress(telemetry.progress) }}</span>
        </div>
      </div>
      <div class="space-hud__corner space-hud__corner--right">
        <div class="space-hud__copy space-hud__copy--right">
          <span class="space-hud__label">FLIGHT VECTOR / AUTO</span>
          <span class="space-hud__value">HDG {{ formatHeading(telemetry.heading) }}°</span>
          <span class="space-hud__value">SYS 0{{ telemetry.system + 1 }} &nbsp; {{ telemetry.distance.toFixed(1) }} AU</span>
        </div>
        <div class="space-hud__attitude"><i /><b /></div>
      </div>
    </div>

    <main class="relative z-10">
      <section id="home" class="home-panel home-panel--hero" aria-labelledby="home-title" data-home-section>
        <div class="home-panel__inner">
          <p class="eyebrow" data-reveal style="--reveal-delay: 80ms">FOOSH / Independent creative studio</p>
          <h1 id="home-title" class="hero-title" data-reveal="title" style="--reveal-delay: 130ms" aria-label="build worlds. move ideas.">
            <span class="title-line" aria-hidden="true"><span>{{ typedHero[0] }}</span><i v-if="typingLine === 0 && !typingComplete" class="typing-cursor" /></span><br>
            <span class="title-line title-line--accent" aria-hidden="true"><span>{{ typedHero[1] }}</span><i v-if="typingLine === 1" class="typing-cursor" /></span>
          </h1>
          <p class="lead max-w-[39rem]" data-reveal style="--reveal-delay: 260ms">3D, motion, and interactive websites for products, brands, and creative teams.</p>
          <div class="actions" data-reveal style="--reveal-delay: 340ms">
            <NuxtLink to="/work" class="button button--primary focus-outline">View selected work <span aria-hidden="true">↗</span></NuxtLink>
            <a href="mailto:fooshmoola@gmail.com" class="button button--secondary focus-outline">Start a project</a>
          </div>
          <div class="capability-line" aria-label="Core capabilities" data-reveal style="--reveal-delay: 440ms">
            <span v-for="capability in capabilities" :key="capability">{{ capability }}</span>
          </div>
        </div>
      </section>

      <section id="services" class="home-panel" aria-labelledby="services-title" data-home-section>
        <div class="home-panel__inner">
          <div class="section-heading" data-reveal>
            <div><p class="eyebrow">01 / Services</p><h2 id="services-title" class="section-title">What I do.</h2></div>
            <p class="lead">Choose one discipline or combine them into a complete visual system.</p>
          </div>
          <div class="service-grid">
            <NuxtLink v-for="(service, index) in services" :key="service.to" :to="service.to" class="service-item focus-outline" data-reveal :style="{ '--reveal-delay': `${index * 75}ms` }">
              <span class="index">0{{ index + 1 }}</span>
              <h3>{{ service.title }}</h3>
              <p>{{ service.text }}</p>
              <span class="item-link">View service <span aria-hidden="true">↗</span></span>
            </NuxtLink>
          </div>
        </div>
      </section>

      <section id="work" class="home-panel" aria-labelledby="work-title" data-home-section>
        <div class="home-panel__inner">
          <div class="section-heading" data-reveal>
            <div><p class="eyebrow">02 / Selected work</p><h2 id="work-title" class="section-title">Built to interact.</h2></div>
            <div><p class="lead">Experiments where the visual idea, interaction, and performance work as one.</p><NuxtLink to="/work" class="inline-link focus-outline">All projects ↗</NuxtLink></div>
          </div>
          <div class="project-list">
            <NuxtLink v-for="(project, index) in projects" :key="project.to" :to="project.to" class="project-item focus-outline" data-reveal :style="{ '--reveal-delay': `${index * 65}ms` }">
              <span class="index">0{{ index + 1 }}</span>
              <h3>{{ project.title }}</h3>
              <p>{{ project.type }}</p>
              <span aria-hidden="true">↗</span>
            </NuxtLink>
          </div>
        </div>
      </section>

      <section id="about" class="home-panel" aria-labelledby="about-title" data-home-section>
        <div class="home-panel__inner about-grid">
          <div data-reveal>
            <p class="eyebrow">03 / Process</p>
            <h2 id="about-title" class="section-title">From idea<br>to launch.</h2>
            <p class="lead mt-6 max-w-[36rem]">FOOSH is the independent practice of Marko Vilipić, connecting industrial design thinking with 3D craft and frontend development.</p>
            <NuxtLink to="/about" class="inline-link mt-7 focus-outline">About the studio ↗</NuxtLink>
          </div>
          <ol class="process-list">
            <li v-for="(step, index) in process" :key="step.title" data-reveal :style="{ '--reveal-delay': `${index * 80}ms` }">
              <span class="index">0{{ index + 1 }}</span>
              <div><h3>{{ step.title }}</h3><p>{{ step.text }}</p></div>
            </li>
          </ol>
        </div>
      </section>

      <section id="contact" class="home-panel" aria-labelledby="contact-title" data-home-section>
        <div class="home-panel__inner">
          <p class="eyebrow" data-reveal>04 / Contact</p>
          <h2 id="contact-title" class="section-title max-w-[62rem]" data-reveal style="--reveal-delay: 70ms">Have a project<br>in mind?</h2>
          <p class="lead mt-6 max-w-[38rem]">Send the goal, timeline, and what already exists. You’ll get a direct reply with a practical next step.</p>
          <a href="mailto:fooshmoola@gmail.com" class="contact-link focus-outline"><span>fooshmoola@gmail.com</span><span aria-hidden="true">↗</span></a>
          <div class="contact-meta"><span>Croatia</span><span>Working worldwide</span><span>3D / Motion / Web</span></div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue';

const HomeLandscape = defineAsyncComponent(() => import('~/features/home/components/HomeLandscape.client.vue'));
const capabilities = ['3D modeling', 'Animation', 'Three.js', 'Nuxt development'];
const services = [
  { to: '/services/3d-modeling', title: '3D Modeling', text: 'Web-ready products, stylized assets, and visualization systems.' },
  { to: '/services/3d-animation', title: '3D Animation', text: 'Product stories, campaign loops, and purposeful motion.' },
  { to: '/services/interactive-3d-websites', title: 'Interactive 3D', text: 'Realtime browser experiences with clear, responsive interaction.' },
  { to: '/services/web-design', title: 'Web Design', text: 'Focused Nuxt websites with accessible structure and a distinct voice.' },
];
const projects = [
  { to: '/topo', title: 'TOPO', type: 'Procedural WebGL' },
  { to: '/work/echo-sphere', title: 'Echo Sphere', type: 'Audio reactive' },
  { to: '/work/sound-surfer', title: 'Sound Surfer', type: 'Interactive audio' },
  { to: '/work/kinetic-sphere', title: 'Kinetic Sphere', type: '3D interaction' },
];
const process = [
  { title: 'Define', text: 'Clarify the goal, audience, constraints, and one visual idea worth remembering.' },
  { title: 'Build', text: 'Design the system, model the assets, and prototype the interaction together.' },
  { title: 'Refine', text: 'Tune performance, responsive behavior, accessibility, and delivery.' },
];
const sectionNav = [
  { id: 'home' }, { id: 'services' }, { id: 'work' }, { id: 'about' }, { id: 'contact' },
];

const root = ref<HTMLElement | null>(null);
const activeSection = ref('home');
const sceneReady = ref(false);
const telemetry = ref({ x: 0, y: 0, z: 20, heading: 0, progress: 0, system: 0, distance: 0 });
const heroCopy = ['build worlds.', 'move ideas.'];
const typedHero = ref([...heroCopy]);
const typingLine = ref(0);
const typingComplete = ref(true);
let observer: IntersectionObserver | null = null;
let revealObserver: IntersectionObserver | null = null;
let idleId: number | null = null;
let fallbackTimer = 0;
let typingTimer = 0;

const updateTelemetry = (payload: typeof telemetry.value) => { telemetry.value = payload; };
const formatCoordinate = (value: number) => `${value >= 0 ? '+' : '−'}${Math.abs(value).toFixed(2).padStart(6, '0')}`;
const formatHeading = (value: number) => Math.round(value).toString().padStart(3, '0');
const formatProgress = (value: number) => Math.round(value * 999).toString().padStart(3, '0');

const startTyping = (reduced: boolean) => {
  if (reduced) {
    typedHero.value = [...heroCopy];
    typingComplete.value = true;
    return;
  }
  typedHero.value = ['', ''];
  typingComplete.value = false;
  typingLine.value = 0;
  let line = 0;
  let character = 0;
  const typeNext = () => {
    if (character < heroCopy[line].length) {
      character += 1;
      typedHero.value[line] = heroCopy[line].slice(0, character);
      const current = heroCopy[line][character - 1];
      typingTimer = window.setTimeout(typeNext, current === '.' ? 210 : current === ' ' ? 85 : 48);
      return;
    }
    if (line === 0) {
      line = 1;
      character = 0;
      typingLine.value = 1;
      typingTimer = window.setTimeout(typeNext, 240);
      return;
    }
    typingComplete.value = true;
  };
  typingTimer = window.setTimeout(typeNext, 220);
};

const syncActiveHash = () => {
  const id = window.location.hash.slice(1);
  if (sectionNav.some((section) => section.id === id)) activeSection.value = id;
};

onMounted(() => {
  const hints = navigator as Navigator & { connection?: { saveData?: boolean } };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  startTyping(reducedMotion);
  if (!hints.connection?.saveData) {
    const revealScene = () => { sceneReady.value = true; };
    if ('requestIdleCallback' in window) {
      idleId = (window as Window & { requestIdleCallback: (callback: () => void, options?: { timeout: number }) => number })
        .requestIdleCallback(revealScene, { timeout: 750 });
    } else fallbackTimer = window.setTimeout(revealScene, 120);
  }

  if (!root.value) return;
  syncActiveHash();
  window.addEventListener('hashchange', syncActiveHash);
  observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible?.target.id) activeSection.value = visible.target.id;
  }, { rootMargin: '-30% 0px -48%', threshold: [0, 0.25, 0.5] });
  root.value.querySelectorAll<HTMLElement>('[data-home-section]').forEach((section) => observer?.observe(section));

  if (!reducedMotion) {
    root.value.classList.add('motion-ready');
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle('is-visible', entry.isIntersecting));
    }, { rootMargin: '0px 0px -10%', threshold: 0.12 });
    root.value.querySelectorAll<HTMLElement>('[data-reveal]').forEach((element) => revealObserver?.observe(element));
  }
});

onBeforeUnmount(() => {
  observer?.disconnect();
  revealObserver?.disconnect();
  window.removeEventListener('hashchange', syncActiveHash);
  if (idleId !== null && 'cancelIdleCallback' in window) {
    (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
  }
  if (fallbackTimer) window.clearTimeout(fallbackTimer);
  if (typingTimer) window.clearTimeout(typingTimer);
});
</script>

<style scoped>
.home-root {
  --accent: #c8ff63;
  --line: rgba(225, 232, 229, 0.18);
  --muted: #a4aaa8;
  background: transparent;
  scroll-padding-top: 4rem;
}

.space-fallback {
  background:
    radial-gradient(ellipse at 75% 20%, rgba(29, 108, 111, 0.24), transparent 42%),
    radial-gradient(ellipse at 25% 78%, rgba(114, 45, 76, 0.16), transparent 40%),
    #05070a;
}

.readability-layer {
  background:
    linear-gradient(180deg, rgba(5, 7, 10, 0.62) 0%, transparent 17%, transparent 78%, rgba(5, 7, 10, 0.7) 100%),
    linear-gradient(90deg, rgba(5, 7, 10, 0.94) 0%, rgba(5, 7, 10, 0.68) 45%, rgba(5, 7, 10, 0.08) 100%);
}

.motion-ready [data-reveal] {
  opacity: 0;
  filter: blur(7px);
  transform: translate3d(0, 2rem, 0);
  transition:
    opacity 900ms cubic-bezier(0.16, 1, 0.3, 1),
    filter 900ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 1050ms cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--reveal-delay, 0ms);
  will-change: opacity, filter, transform;
}

.motion-ready [data-reveal].is-visible {
  opacity: 1;
  filter: blur(0);
  transform: translate3d(0, 0, 0);
}

.motion-ready [data-reveal="title"] { opacity: 1; filter: none; transform: none; }
.title-line { display: inline-block; min-height: 0.98em; color: inherit; vertical-align: bottom; }
.title-line--accent { color: var(--accent); }
.title-line > span { display: inline-block; color: inherit; }
.typing-cursor { display: inline-block; width: 0.075em; height: 0.72em; margin-left: 0.1em; background: currentColor; animation: typing-blink 820ms steps(1, end) infinite; }
@keyframes typing-blink { 50% { opacity: 0; } }

.home-panel {
  position: relative;
  display: grid;
  min-height: 100svh;
  align-items: center;
  border-bottom: 1px solid var(--line);
  padding: clamp(6rem, 11vh, 8.5rem) clamp(1rem, 4vw, 3.5rem);
  content-visibility: auto;
  contain-intrinsic-size: 100svh;
  scroll-margin-top: 4rem;
}

.home-panel__inner { width: min(100%, 82rem); margin-inline: auto; }
.eyebrow { color: var(--accent); font-family: "Lexend Variable", Lexend, sans-serif; font-size: 0.61rem; font-variant-caps: all-small-caps; font-weight: 500; letter-spacing: 0.24em; text-transform: none; }

.hero-title,
.section-title {
  margin-top: 1.1rem;
  font-family: "Lexend Variable", Lexend, sans-serif;
  font-weight: 400;
  letter-spacing: 0.055em;
  line-height: 0.96;
}

.hero-title { max-width: 54rem; font-family: "Righteous", "Lexend Variable", sans-serif; font-size: clamp(2.35rem, 5.2vw, 4.55rem); font-weight: 400; letter-spacing: 0.075em; text-transform: lowercase; }
.section-title { font-size: clamp(2.15rem, 4.3vw, 3.9rem); text-transform: lowercase; }
.lead { color: #c5c9c7; font-family: "Poiret One", "Lexend Variable", sans-serif; font-size: clamp(0.98rem, 1.25vw, 1.14rem); font-weight: 400; letter-spacing: 0.075em; line-height: 1.72; }
.hero-title + .lead { margin-top: 2rem; }
.actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 2rem; }

.button {
  display: inline-flex;
  min-height: 3rem;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  border: 1px solid var(--line);
  border-radius: 0;
  padding: 0.85rem 1.15rem;
  font-size: 0.7rem;
  font-family: "Lexend Variable", Lexend, sans-serif;
  font-variant-caps: all-small-caps;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: none;
  transition: background-color 360ms cubic-bezier(0.16, 1, 0.3, 1), color 360ms cubic-bezier(0.16, 1, 0.3, 1), border-color 360ms cubic-bezier(0.16, 1, 0.3, 1), transform 420ms cubic-bezier(0.16, 1, 0.3, 1);
}

.button--primary { border-color: var(--accent); background: var(--accent); color: #0a0d0b; }
.button--secondary { background: rgba(5, 7, 10, 0.58); color: #f2f3ef; }
.button:hover { border-color: #f2f3ef; background: #f2f3ef; color: #080a0c; }
.button:active { transform: scale(0.975); }

.capability-line { display: flex; flex-wrap: wrap; gap: 0; margin-top: clamp(3rem, 8vh, 6rem); border-top: 1px solid var(--line); }
.capability-line span { border-right: 1px solid var(--line); padding: 0.7rem 1rem 0.7rem 0; margin-right: 1rem; color: #8f9693; font-family: "Lexend Variable", Lexend, sans-serif; font-size: 0.58rem; font-variant-caps: all-small-caps; font-weight: 500; letter-spacing: 0.2em; text-transform: none; }

.section-heading { display: grid; gap: 2rem; }
.section-heading > .lead,
.section-heading > div:last-child { align-self: end; }
.service-grid { display: grid; margin-top: clamp(2.8rem, 7vh, 5rem); border-top: 1px solid var(--line); border-left: 1px solid var(--line); }
.service-item { display: flex; min-height: 15rem; flex-direction: column; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); background: rgba(5, 7, 10, 0.48); padding: 1.2rem; transition: background-color 420ms cubic-bezier(0.16, 1, 0.3, 1), transform 520ms cubic-bezier(0.16, 1, 0.3, 1); }
.service-item:hover { background: rgba(200, 255, 99, 0.08); }
.index { color: #747b78; font-family: "Lexend Variable", Lexend, sans-serif; font-size: 0.66rem; font-variant-caps: all-small-caps; font-weight: 600; letter-spacing: 0.18em; }
.service-item h3 { margin-top: 2.3rem; font-size: 1.12rem; font-weight: 400; letter-spacing: 0.07em; text-transform: lowercase; }
.service-item p { margin-top: 0.75rem; color: var(--muted); font-size: 0.9rem; letter-spacing: 0.06em; line-height: 1.68; }
.item-link { display: flex; justify-content: space-between; margin-top: auto; border-top: 1px solid var(--line); padding-top: 0.8rem; color: var(--accent); font-size: 0.58rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; }

.inline-link { display: inline-block; margin-top: 1rem; color: var(--accent); font-size: 0.64rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; }
.project-list { margin-top: clamp(2.8rem, 7vh, 5rem); border-top: 1px solid var(--line); }
.project-item { display: grid; min-height: 5.5rem; grid-template-columns: 3.5rem minmax(0, 1fr) minmax(9rem, 0.45fr) 1rem; align-items: center; gap: 1rem; border-bottom: 1px solid var(--line); transition: color 420ms cubic-bezier(0.16, 1, 0.3, 1), padding 520ms cubic-bezier(0.16, 1, 0.3, 1); }
.project-item:hover { padding-inline: 0.75rem; color: var(--accent); }
.project-item h3 { font-size: clamp(1rem, 1.5vw, 1.35rem); font-weight: 400; letter-spacing: 0.07em; text-transform: lowercase; }
.project-item p { color: var(--muted); font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; }

.about-grid { display: grid; gap: clamp(3rem, 8vw, 8rem); }
.process-list { border-top: 1px solid var(--line); }
.process-list li { display: grid; grid-template-columns: 2.5rem 1fr; gap: 1rem; border-bottom: 1px solid var(--line); padding: 1.35rem 0; }
.process-list h3 { font-size: 0.98rem; font-weight: 500; }
.process-list p { margin-top: 0.45rem; color: var(--muted); font-size: 0.88rem; line-height: 1.6; }

.contact-link { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: clamp(2.5rem, 6vh, 5rem); border-block: 1px solid var(--line); padding: clamp(1.1rem, 2.4vw, 1.6rem) 0; color: var(--accent); font-size: clamp(1rem, 2.4vw, 2.25rem); font-weight: 400; letter-spacing: -0.03em; }
.contact-link:hover { color: #fff; }
.contact-meta { display: flex; flex-wrap: wrap; gap: 1.5rem; margin-top: 1rem; color: #747b78; font-size: 0.64rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }

.section-rail { position: fixed; right: 1rem; top: 50%; z-index: 30; display: none; flex-direction: column; transform: translateY(-50%); }
.section-rail__link { display: grid; width: 2.4rem; height: 2.25rem; grid-template-columns: 1.3rem 0.4rem; align-items: center; color: #59605d; font-size: 0.56rem; }
.section-rail__link i { width: 0.35rem; height: 0.35rem; border: 1px solid currentColor; }
.section-rail__link--active { color: var(--accent); }
.section-rail__link--active i { background: currentColor; }

.space-hud { pointer-events: none; position: fixed; inset: 0; z-index: 24; color: rgba(215, 228, 222, 0.54); font-family: "Lexend Variable", Lexend, sans-serif; font-variant-caps: all-small-caps; font-variant-numeric: tabular-nums; }
.space-hud__corner { position: absolute; bottom: max(0.8rem, env(safe-area-inset-bottom)); display: flex; align-items: flex-end; gap: 0.65rem; }
.space-hud__corner--left { left: max(0.8rem, env(safe-area-inset-left)); }
.space-hud__corner--right { right: max(0.8rem, env(safe-area-inset-right)); }
.space-hud__copy { display: grid; gap: 0.14rem; min-width: 11.5rem; }
.space-hud__copy--right { min-width: 9.5rem; text-align: right; }
.space-hud__label { color: rgba(200, 255, 99, 0.64); font-size: 0.46rem; letter-spacing: 0.16em; line-height: 1.4; }
.space-hud__value { font-size: 0.48rem; font-weight: 400; letter-spacing: 0.1em; line-height: 1.45; }
.space-hud__bracket { position: relative; width: 1.8rem; height: 1.8rem; border-bottom: 1px solid rgba(200, 255, 99, 0.38); border-left: 1px solid rgba(200, 255, 99, 0.38); }
.space-hud__bracket::before { position: absolute; left: 50%; bottom: 0; width: 1px; height: 0.45rem; content: ""; background: rgba(215, 228, 222, 0.38); }
.space-hud__bracket::after { position: absolute; left: 0; bottom: 50%; width: 0.45rem; height: 1px; content: ""; background: rgba(215, 228, 222, 0.38); }
.space-hud__bracket i:first-child { position: absolute; left: 0.45rem; bottom: 0.45rem; width: 0.35rem; height: 1px; background: currentColor; transform: rotate(45deg); }
.space-hud__bracket i:last-child { position: absolute; left: 0.7rem; bottom: 0.45rem; width: 0.35rem; height: 1px; background: currentColor; transform: rotate(-45deg); }
.space-hud__attitude { position: relative; width: 5.5rem; height: 1.8rem; border-bottom: 1px solid rgba(200, 255, 99, 0.35); }
.space-hud__attitude::before { position: absolute; left: 0; right: 0; bottom: 0.52rem; height: 1px; content: ""; background: linear-gradient(90deg, transparent, rgba(215, 228, 222, 0.5) 14%, rgba(215, 228, 222, 0.5) 86%, transparent); }
.space-hud__attitude::after { position: absolute; left: 50%; bottom: 0.27rem; width: 0.5rem; height: 0.5rem; content: ""; border-right: 1px solid rgba(200, 255, 99, 0.64); border-bottom: 1px solid rgba(200, 255, 99, 0.64); transform: translateX(-50%) rotate(45deg); }
.space-hud__attitude i { position: absolute; left: 18%; bottom: 0.35rem; width: 1px; height: 0.35rem; background: currentColor; box-shadow: 1.75rem 0 currentColor, 3.5rem 0 currentColor; }
.space-hud__attitude b { position: absolute; left: 50%; bottom: 0.51rem; width: 2rem; height: 1px; background: var(--accent); transform: translateX(-50%); opacity: 0.6; }

@media (min-width: 720px) {
  .section-heading { grid-template-columns: minmax(0, 1.15fr) minmax(18rem, 0.55fr); gap: 5rem; }
  .service-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .about-grid { grid-template-columns: minmax(0, 1fr) minmax(20rem, 0.8fr); align-items: end; }
  .section-rail { display: flex; }
}

@media (min-width: 1100px) { .service-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

@media (max-width: 640px) {
  .readability-layer { background: linear-gradient(180deg, rgba(5, 7, 10, 0.38), rgba(5, 7, 10, 0.68)); }
  .home-panel { min-height: auto; padding-block: 6rem; }
  .home-panel--hero { min-height: calc(100svh - 3.5rem); }
  .hero-title { font-size: clamp(2.6rem, 12vw, 3.7rem); }
  .section-title { font-size: clamp(2.25rem, 10vw, 3.2rem); }
  .service-item { min-height: 14rem; }
  .project-item { min-height: 6.5rem; grid-template-columns: 2.4rem 1fr 1rem; }
  .project-item p { grid-column: 2; }
  .project-item > span:last-child { grid-column: 3; grid-row: 1 / 3; }
  .contact-link { overflow-wrap: anywhere; }
  .space-hud__copy { min-width: 8.4rem; }
  .space-hud__corner { gap: 0.4rem; }
  .space-hud__label { font-size: 0.41rem; }
  .space-hud__value { font-size: 0.42rem; letter-spacing: 0.06em; }
  .space-hud__bracket { width: 1.3rem; height: 1.3rem; }
  .space-hud__attitude { width: 3.5rem; }
  .space-hud__attitude i { box-shadow: 1.1rem 0 currentColor, 2.2rem 0 currentColor; }
}

@media (orientation: landscape) and (max-height: 560px) and (max-width: 960px) {
  .home-panel { min-height: 100svh; padding: 3.7rem max(1rem, env(safe-area-inset-right)) 1.8rem max(1rem, env(safe-area-inset-left)); }
  .home-panel--hero { min-height: 100svh; }
  .home-panel__inner { width: min(92%, 68rem); }
  .hero-title { margin-top: 0.55rem; font-size: clamp(2rem, 7.4vw, 3.15rem); }
  .section-title { margin-top: 0.55rem; font-size: clamp(1.9rem, 6.8vw, 2.9rem); }
  .hero-title + .lead, .lead.mt-6 { margin-top: 0.8rem; }
  .lead { max-width: 32rem; font-size: 0.78rem; line-height: 1.45; }
  .actions { margin-top: 1rem; }
  .button { min-height: 2.35rem; padding: 0.55rem 0.85rem; font-size: 0.58rem; }
  .capability-line { margin-top: 1.35rem; }
  .capability-line span { padding-block: 0.45rem; font-size: 0.5rem; }
  .section-rail { display: none; }
  .space-hud__corner { bottom: max(0.4rem, env(safe-area-inset-bottom)); }
  .space-hud__label { display: none; }
  .space-hud__value { font-size: 0.39rem; }
  .space-hud__bracket, .space-hud__attitude { height: 1rem; }
}

@media (prefers-reduced-motion: reduce) {
  .button, .service-item, .project-item { transition: none; }
}
</style>
