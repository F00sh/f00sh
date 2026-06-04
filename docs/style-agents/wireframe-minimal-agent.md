# Wireframe Minimal Agent

Purpose: Generate new interactive 3D scenes that match the established FOOSH/Kinetic Sphere look and feel.

## Core Direction
- Aesthetic: minimalist, wireframe-forward, procedural, atmospheric.
- Mood: dark, spacious, kinetic, slightly surreal.
- Visual density: low-to-medium; avoid clutter and noisy UI overlays.
- Interaction first: motion and response are more important than decoration.

## Visual Rules
- Use mostly black/near-black backgrounds with subtle fog.
- Prefer wireframe geometry, line meshes, and sparse point clouds.
- Limit palette to monochrome base plus one muted accent at most.
- Keep fills flat and simple; no glossy PBR look unless explicitly asked.
- Geometry should feel low-poly and intentional, not random chaos.

## Environment Rules
- Worlds are procedural and effectively neverending.
- Terrain should mix mild and rough zones with readable silhouettes.
- Add sparse atmospheric elements: stars, moon outlines, simple cloud forms.
- Preserve depth using fog and scale layering, not heavy textures.

## Motion Rules
- Camera always tracks the primary object and keeps clear framing.
- Movement uses spring smoothing; no abrupt teleporting camera shifts.
- Impact moments (kick/hit) can add short punch effects (headbutt/lunge, brief blur).
- Keep post FX restrained and gameplay-readable.

## Interaction Rules
- Input must feel immediate and physically legible.
- Forces should be strong but clamped to avoid runaway instability.
- Every impact event should consistently trigger its VFX response.
- Physics feel bouncy/elastic, with visible momentum carry.

## Implementation Defaults (Three.js + GSAP)
- Geometry style: `WireframeGeometry`, `LineSegments`, occasional opaque flat faces.
- Lighting: minimal ambient/directional; prioritize shape readability.
- Terrain: layered noise (fbm/ridged/domain warp), chunk streaming around player.
- Camera: sphere-centered follow, yaw from pointer X, spring lag, look-at target.
- FX: subtle fisheye, conditional motion blur only on impact states.
- VFX: short-lived dust burst particles emitted on each kick.

## Do / Don’t
- Do keep composition clean, bold, and legible in motion.
- Do prefer stronger forms over extra colors.
- Do tune for desktop and mobile interaction stability.
- Don’t add busy HUD/UI unless requested.
- Don’t overuse bloom/glow/chromatic aberration.
- Don’t break wireframe-first identity with realistic materials.

## Reusable Prompt Snippet
Use this when generating a new scene:

"Create a Three.js + GSAP interactive scene in a wireframe minimalistic style. Keep the world procedural and neverending, with low-poly forms, sparse atmospheric elements, and strong motion readability. Use spring-follow camera behavior, punchy but controlled impact feedback, and restrained post-processing. Prioritize monochrome aesthetics, clean silhouettes, and physically legible interaction."
