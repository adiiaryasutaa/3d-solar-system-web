"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { Satellite as SatelliteType } from "@/data/planets";
import PlanetBody from "./PlanetBody";

// Match the planet base rates so moons read as part of the same system.
const ORBIT_BASE_SPEED = 0.12;
const SPIN_BASE_SPEED = 0.3;

/** A moon orbiting its parent planet's center. Rendered inside the planet's frame. */
export default function Satellite({
  satellite,
  paused,
  speed,
}: {
  satellite: SatelliteType;
  paused: boolean;
  speed: number;
}) {
  const pivotRef = useRef<Group>(null); // orbits the parent planet
  const bodyRef = useRef<Group>(null); // spins on its own axis

  useFrame((_, delta) => {
    if (paused) return;
    const d = delta * speed;
    if (pivotRef.current) {
      pivotRef.current.rotation.y += d * ORBIT_BASE_SPEED * satellite.orbitSpeedFactor;
    }
    if (bodyRef.current) {
      bodyRef.current.rotation.y += d * SPIN_BASE_SPEED;
    }
  });

  return (
    <group ref={pivotRef} rotation-y={satellite.initialAngle}>
      <group position={[satellite.orbitRadius, 0, 0]}>
        <PlanetBody
          ref={bodyRef}
          radius={satellite.radius}
          color={satellite.color}
          modelUrl={satellite.modelUrl}
        />
      </group>
    </group>
  );
}
