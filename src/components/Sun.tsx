"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  Box3,
  Group,
  Mesh,
  MeshBasicMaterial,
  Vector3,
  type MeshStandardMaterial,
} from "three";
import { SUN } from "@/data/planets";
import { useSolarSystem } from "@/store/useSolarSystem";
import { usePlanetRegistry } from "./planetRegistry";

export default function Sun({ paused, speed = 1 }: { paused: boolean; speed?: number }) {
  const groupRef = useRef<Group>(null);
  const spinRef = useRef<Group>(null);
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
    if (!paused && spinRef.current) spinRef.current.rotation.y += delta * speed * 0.05;
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    toggle(SUN.id);
  };

  return (
    <group ref={groupRef}>
      {/* Sunlight that lights the planets. */}
      <pointLight intensity={3} distance={0} decay={0} color="#fff4d6" />
      <group
        ref={spinRef}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        {SUN.modelUrl ? <SunModel /> : <FallbackSun />}
      </group>
    </group>
  );
}

/**
 * The Sun glb, but every material swapped for an unlit basic one (with the model's
 * own map if it has one) so the star always glows at full brightness and feeds the
 * bloom pass — it must not be shaded by its own light. Recentered + scaled to radius.
 */
function SunModel() {
  const { scene } = useGLTF(SUN.modelUrl!);
  const object = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);
    const box = new Box3().setFromObject(clone);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    clone.position.sub(center);
    clone.traverse((o) => {
      if (o instanceof Mesh) {
        const prev = Array.isArray(o.material) ? o.material[0] : o.material;
        const prevMap = (prev as MeshStandardMaterial | undefined)?.map ?? null;
        o.material = new MeshBasicMaterial({
          map: prevMap,
          color: prevMap ? "#ffffff" : SUN.color,
          toneMapped: false,
        });
      }
    });
    // Normalize to unit size (max extent → diameter) then scale to SUN.radius,
    // so the Sun is the right size regardless of the model's authored scale.
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const wrapper = new Group();
    wrapper.add(clone);
    wrapper.scale.setScalar((SUN.radius * 2) / maxDim);
    return wrapper;
  }, [scene]);
  return <primitive object={object} />;
}

/** Procedural fallback when no Sun model is supplied. */
function FallbackSun() {
  return (
    <mesh>
      <sphereGeometry args={[SUN.radius, 64, 64]} />
      {/* Basic (unlit) material so the Sun always glows at full color. */}
      <meshBasicMaterial color={SUN.color} toneMapped={false} />
    </mesh>
  );
}
