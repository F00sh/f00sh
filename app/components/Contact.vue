<template>
  <section class="contact-section min-h-screen flex items-center">
    <!-- Optional local overlay for contrast -->
    <div class="absolute inset-0 bg-black/35"></div>

    <div class="relative z-10 w-full px-6 sm:px-10 lg:px-16 py-20">
      <div class="mx-auto max-w-5xl">
        <!-- Header -->
        <div class="text-center mb-14">
          <p class="text-purple-300 tracking-widest uppercase text-xs sm:text-sm mb-3">
            Contact
          </p>

          <h1
            class="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase text-yellow-600"
          >
            Let’s work together
          </h1>

          <p class="mt-6 text-base sm:text-lg text-white max-w-2xl mx-auto font-dm-mono">
            If you have a project in mind or need a reliable designer for ongoing collaboration,
            feel free to reach out through any channel below.
          </p>
        </div>

        <!-- Contact grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Email -->
          <a
            href="mailto:fooshmoola@gmail.com"
            class="card"
          >
            <p class="label">Email</p>
            <p class="value">fooshmoola@gmail.com</p>
          </a>

          <!-- WhatsApp -->
          <a
            href="https://wa.me/385955448400"
            target="_blank"
            rel="noopener"
            class="card"
          >
            <p class="label">WhatsApp</p>
            <p class="value">+385 95 544 8400</p>
          </a>

          <!-- Upwork -->
          <a
            href="https://www.upwork.com/freelancers/~01a6fe8aed25d72941"
            target="_blank"
            rel="noopener"
            class="card"
          >
            <p class="label">Upwork</p>
            <p class="value">View profile</p>
          </a>

          <!-- Instagram -->
          <a
            href="https://www.instagram.com/smarko_cvilipic/"
            target="_blank"
            rel="noopener"
            class="card"
          >
            <p class="label">Instagram</p>
            <p class="value">@smarko_cvilipic</p>
          </a>

          <!-- Behance -->
          <a
            href="https://www.behance.net/FOOSH"
            target="_blank"
            rel="noopener"
            class="card"
          >
            <p class="label">Behance</p>
            <p class="value">FOOSH</p>
          </a>

          <!-- LinkedIn -->
          <a
            href="https://www.linkedin.com/in/marko-vilipi%C4%87-b06a20321/"
            target="_blank"
            rel="noopener"
            class="card"
          >
            <p class="label">LinkedIn</p>
            <p class="value">Marko Vilipić</p>
          </a>
        </div>

        <!-- Footer note -->
        <p class="mt-14 text-center text-white/70 text-sm">
          Based in Croatia · Available for remote collaboration
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact-section {
  position: relative;
  background: transparent;
}

/* Cards */
.card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 110px;

  padding: 1.25rem 1.5rem;
  border-radius: 1.25rem;

  border: 0px solid rgba(255, 255, 255, 0.2);
  background: rgb(0, 47, 255);

  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  background: rgba(0, 0, 0, 0.6);
  border-color: rgba(255, 255, 255, 0.35);
}

/* Typography */
.label {
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
}

.value {
  margin-top: 0.35rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  word-break: break-word;
}
</style>
