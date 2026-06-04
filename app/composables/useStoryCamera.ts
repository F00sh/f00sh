import * as THREE from 'three';
import type { StorySectionData, StoryVector } from '~/data/rumpelstiltskin';

export interface StoryWorld {
  curve: THREE.CatmullRomCurve3;
  anchors: THREE.Vector3[];
}

export interface StoryCameraState {
  position: THREE.Vector3;
  target: THREE.Vector3;
  segmentIndex: number;
  segmentProgress: number;
}

const clampProgress = (progress: number) => THREE.MathUtils.clamp(progress, 0, 1);

export const tupleToVector3 = (value: StoryVector) => new THREE.Vector3(value[0], value[1], value[2]);

export const createStoryWorld = (sections: StorySectionData[]): StoryWorld => {
  const points = sections.map((_, index) => {
    const bend = Math.sin(index * 0.72) * 9.5;
    const lift = Math.cos(index * 0.48) * 1.2;
    return new THREE.Vector3(bend, lift, -index * 18);
  });

  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.35);
  const anchors = sections.map((_, index) => {
    const ratio = sections.length > 1 ? index / (sections.length - 1) : 0;
    return curve.getPointAt(ratio);
  });

  return { curve, anchors };
};

export const getSectionCameraPose = (
  section: StorySectionData,
  anchor: THREE.Vector3,
) => ({
  position: anchor.clone().add(tupleToVector3(section.cameraPosition)),
  target: anchor.clone().add(tupleToVector3(section.cameraTarget)),
});

export const sampleStoryCamera = (
  sections: StorySectionData[],
  world: StoryWorld,
  progress: number,
): StoryCameraState => {
  if (sections.length === 0) {
    return {
      position: new THREE.Vector3(0, 4, 12),
      target: new THREE.Vector3(),
      segmentIndex: 0,
      segmentProgress: 0,
    };
  }

  if (sections.length === 1) {
    const pose = getSectionCameraPose(sections[0], world.anchors[0] ?? new THREE.Vector3());
    return { ...pose, segmentIndex: 0, segmentProgress: 0 };
  }

  const scaled = clampProgress(progress) * (sections.length - 1);
  const segmentIndex = Math.min(sections.length - 2, Math.floor(scaled));
  const rawProgress = scaled - segmentIndex;
  const easedProgress = THREE.MathUtils.smoothstep(rawProgress, 0, 1);

  const fromSection = sections[segmentIndex]!;
  const toSection = sections[segmentIndex + 1]!;
  const fromAnchor = world.anchors[segmentIndex]!;
  const toAnchor = world.anchors[segmentIndex + 1]!;
  const fromPose = getSectionCameraPose(fromSection, fromAnchor);
  const toPose = getSectionCameraPose(toSection, toAnchor);

  return {
    position: fromPose.position.lerp(toPose.position, easedProgress),
    target: fromPose.target.lerp(toPose.target, easedProgress),
    segmentIndex,
    segmentProgress: easedProgress,
  };
};
