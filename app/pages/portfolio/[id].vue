<template>
  <main class="relative z-10 min-h-screen bg-[var(--foosh-bg)] pb-16 pt-14 text-[var(--foosh-text)] sm:pb-20 sm:pt-16">
    <HeroScene />
    <ProjectDetailView :project="project" />
  </main>
</template>

<script setup lang="ts">
import HeroScene from "~/components/three/HeroScene.client.vue";
import ProjectDetailView from "~/components/portfolio/ProjectDetailView.vue";
import { portfolioProjectById } from "~/data/portfolioProjects";

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
