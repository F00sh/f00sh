<template>
  <main class="relative z-10 min-h-screen bg-[var(--foosh-bg)] pb-16 pt-14 text-[var(--foosh-text)] sm:pb-20 sm:pt-16">
    <HeroScene />
    <SiteHeader />
    <ProjectDetailView :project="project" />
    <SiteFooter />
  </main>
</template>

<script setup lang="ts">
import HeroScene from "~/components/three/HeroScene.client.vue";
import SiteFooter from "~/components/layout/SiteFooter.vue";
import SiteHeader from "~/components/layout/SiteHeader.vue";
import ProjectDetailView from "~/features/portfolio/components/ProjectDetailView.vue";
import { portfolioProjectById } from "~/features/portfolio/data/portfolioProjects";

const route = useRoute();
const projectId = String(route.params.id || "");
const project = portfolioProjectById[projectId];

if (!project) {
  throw createError({
    statusCode: 404,
    statusMessage: "Project not found",
  });
}

useHead({
  title: `f00sh — ${project.title}`,
  meta: [
    {
      name: "description",
      content: project.description,
    },
  ],
});
</script>
