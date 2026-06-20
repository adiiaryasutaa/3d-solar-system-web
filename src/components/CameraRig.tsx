"use client";

import { useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useSolarSystem } from "@/store/useSolarSystem";
import { getBodyById } from "@/data/planets";
import { usePlanetRegistry } from "./planetRegistry";

// Overview shot used when nothing is selected.
const DEFAULT_POS = new Vector3(0, 34, 78);
const DEFAULT_TARGET = new Vector3(0, 0, 0);

/**
 * Smoothly flies the camera (and the OrbitControls target) to the selected body,
 * tracking it as it orbits, and returns to the overview when selection clears.
 */
export default function CameraRig({
  controls,
}: {
  controls: RefObject<OrbitControlsImpl | null>;
}) {
  const selectedId = useSolarSystem((s) => s.selectedId);
  const registry = usePlanetRegistry();
  const { camera } = useThree();

  const desiredPos = useRef(new Vector3());
  const desiredTarget = useRef(new Vector3());
  const offsetDir = useRef(new Vector3());

  useFrame((_, delta) => {
    const body = getBodyById(selectedId);
    const obj = selectedId ? registry.get(selectedId) : undefined;

    if (body && obj) {
      obj.getWorldPosition(desiredTarget.current);

      // Pull back from the body, along its outward radial direction, lifted a bit.
      offsetDir.current.copy(desiredTarget.current);
      offsetDir.current.y = 0;
      if (offsetDir.current.lengthSq() < 1e-6) offsetDir.current.set(0, 0, 1);
      offsetDir.current.normalize();

      const distance = body.radius * 4 + 6;
      desiredPos.current
        .copy(desiredTarget.current)
        .addScaledVector(offsetDir.current, distance);
      desiredPos.current.y += body.radius * 1.5 + 2.5;
    } else {
      desiredPos.current.copy(DEFAULT_POS);
      desiredTarget.current.copy(DEFAULT_TARGET);
    }

    // Framerate-independent smoothing.
    const t = 1 - Math.pow(0.0015, delta);
    camera.position.lerp(desiredPos.current, t);

    const c = controls.current;
    if (c) {
      c.target.lerp(desiredTarget.current, t);
      c.update();
    }
  });

  return null;
}
