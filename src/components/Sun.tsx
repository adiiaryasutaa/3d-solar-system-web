"use client";

import { useEffect, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import { SUN } from "@/data/planets";
import { useSolarSystem } from "@/store/useSolarSystem";
import { usePlanetRegistry } from "./planetRegistry";

export default function Sun({ paused, speed = 1 }: { paused: boolean; speed?: number }) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const toggle = useSolarSystem((s) => s.toggle);
  const registry = usePlanetRegistry();

  useEffect(() => {
    const group = groupRef.current;
    if (group) registry.set(SUN.id, group);
    return () => {
      registry.delete(SUN.id);
    };
  }, [registry]);

  useFrame((_, delta) => {
    if (!paused && meshRef.current) meshRef.current.rotation.y += delta * speed * 0.05;
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    toggle(SUN.id);
  };

  return (
    <group ref={groupRef}>
      {/* Sunlight that lights the planets. */}
      <pointLight intensity={3} distance={0} decay={0} color="#fff4d6" />
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[SUN.radius, 64, 64]} />
        {/* Basic (unlit) material so the Sun always glows at full color. */}
        <meshBasicMaterial color={SUN.color} toneMapped={false} />
      </mesh>
    </group>
  );
}
