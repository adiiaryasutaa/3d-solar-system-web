"use client";

import { useEffect, useRef, type RefObject } from "react";
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
  const motion = useRef(new Vector3());

  // Tracking state so the follow doesn't fight the user's zoom/orbit.
  const prevSelected = useRef<string | null>(null);
  const prevTarget = useRef(new Vector3());
  const flying = useRef(false); // true = animating to the framing shot

  // The moment the user touches the controls, drop the fly-to so their rotate /
  // zoom takes effect immediately (tracking then keeps the body framed).
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const onStart = () => {
      flying.current = false;
    };
    c.addEventListener("start", onStart);
    return () => c.removeEventListener("start", onStart);
  }, [controls]);

  useFrame((_, delta) => {
    const body = getBodyById(selectedId);
    const obj = selectedId ? registry.get(selectedId) : undefined;
    const c = controls.current;
    const t = 1 - Math.pow(0.0015, delta); // framerate-independent smoothing

    // A new selection (or deselection) re-arms the fly-to animation.
    if (selectedId !== prevSelected.current) {
      prevSelected.current = selectedId;
      flying.current = true;
    }

    if (body && obj) {
      obj.getWorldPosition(desiredTarget.current);

      if (flying.current) {
        // Fly-to: ease the camera to a framing shot pulled back from the body.
        offsetDir.current.copy(desiredTarget.current);
        offsetDir.current.y = 0;
        if (offsetDir.current.lengthSq() < 1e-6) offsetDir.current.set(0, 0, 1);
        offsetDir.current.normalize();

        const distance = body.radius * 4 + 6;
        desiredPos.current
          .copy(desiredTarget.current)
          .addScaledVector(offsetDir.current, distance);
        desiredPos.current.y += body.radius * 1.5 + 2.5;

        camera.position.lerp(desiredPos.current, t);
        if (c) c.target.lerp(desiredTarget.current, t);

        // Once framed, hand control back to the user (zoom/orbit work freely).
        if (camera.position.distanceTo(desiredPos.current) < 1) flying.current = false;
      } else {
        // Tracking: move the camera by the body's orbital motion only, so it
        // stays framed while the user's own zoom/orbit distance is preserved.
        motion.current.copy(desiredTarget.current).sub(prevTarget.current);
        camera.position.add(motion.current);
        if (c) c.target.copy(desiredTarget.current);
      }

      prevTarget.current.copy(desiredTarget.current);
    } else if (flying.current) {
      // Overview: ease back to the default shot once (on deselect), then leave
      // the camera free. Interacting cancels it early via the "start" handler.
      desiredPos.current.copy(DEFAULT_POS);
      desiredTarget.current.copy(DEFAULT_TARGET);
      camera.position.lerp(desiredPos.current, t);
      if (c) c.target.lerp(desiredTarget.current, t);
      if (camera.position.distanceTo(desiredPos.current) < 1) flying.current = false;
    }

    if (c) c.update();
  });

  return null;
}
