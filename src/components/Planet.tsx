"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import type { Group } from "three";
import type { Planet as PlanetType } from "@/data/planets";
import { useSolarSystem } from "@/store/useSolarSystem";
import { usePlanetRegistry } from "./planetRegistry";
import PlanetBody from "./PlanetBody";
import OrbitRing from "./OrbitRing";
import PlanetLabel from "./PlanetLabel";

// Base rates; per-planet factors and the global speed multiplier scale these.
const ORBIT_BASE_SPEED = 0.12;
const SPIN_BASE_SPEED = 0.3;

export default function Planet({
  planet,
  paused,
  speed,
}: {
  planet: PlanetType;
  paused: boolean;
  speed: number;
}) {
  const pivotRef = useRef<Group>(null); // rotates around the Sun (orbit)
  const bodyRef = useRef<Group>(null); // the planet itself (spins on its axis)
  const [hovered, setHovered] = useState(false);

  const toggle = useSolarSystem((s) => s.toggle);
  const registry = usePlanetRegistry();

  // Register the body so CameraRig can read its live world position.
  useEffect(() => {
    const body = bodyRef.current;
    if (body) registry.set(planet.id, body);
    return () => {
      registry.delete(planet.id);
    };
  }, [planet.id, registry]);

  useFrame((_, delta) => {
    if (paused) return;
    const d = delta * speed;
    if (pivotRef.current) {
      pivotRef.current.rotation.y += d * ORBIT_BASE_SPEED * planet.orbitSpeedFactor;
    }
    if (bodyRef.current) {
      bodyRef.current.rotation.y += d * SPIN_BASE_SPEED * planet.rotationSpeedFactor;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    toggle(planet.id);
  };

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handleOut = () => {
    setHovered(false);
    document.body.style.cursor = "auto";
  };

  return (
    <>
      <OrbitRing radius={planet.orbitRadius} highlighted={hovered} />
      <group ref={pivotRef} rotation-y={planet.initialAngle}>
        {/* Fixed axial-tilt frame at the orbit position; the body spins inside it. */}
        <group position={[planet.orbitRadius, 0, 0]} rotation-z={planet.tilt ?? 0}>
          <PlanetBody
            ref={bodyRef}
            radius={planet.radius}
            color={planet.color}
            gas={planet.gas}
            ring={planet.ring}
            textureUrl={planet.textureUrl}
            emissive={hovered}
            onClick={handleClick}
            onPointerOver={handleOver}
            onPointerOut={handleOut}
          />
        </group>
        <PlanetLabel
          id={planet.id}
          name={planet.name}
          position={[planet.orbitRadius, planet.radius + 1.4, 0]}
        />
      </group>
    </>
  );
}
