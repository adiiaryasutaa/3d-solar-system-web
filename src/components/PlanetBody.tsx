"use client";

import { forwardRef, useMemo } from "react";
import { DoubleSide, type Group } from "three";
import { useTexture } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { makePlanetTexture } from "@/lib/planetTexture";
import type { Planet } from "@/data/planets";

type RingConfig = NonNullable<Planet["ring"]>;

type PlanetBodyProps = ThreeElements["group"] & {
  radius: number;
  color: string;
  gas?: boolean;
  ring?: RingConfig;
  /** Real texture map (overrides the procedural one). */
  textureUrl?: string;
  /** Brighten while hovered. */
  emissive?: boolean;
};

/**
 * ── SWAP BOUNDARY ──────────────────────────────────────────────────────────
 * This is the ONLY file that knows what a planet looks like. Today it renders a
 * procedurally-textured placeholder sphere (+ optional ring). To use a Blender
 * model later, replace the inner sphere with the loaded glTF, e.g.:
 *
 *   const { scene } = useGLTF(`/models/${id}.glb`);
 *   return <group ref={ref} {...groupProps}><primitive object={scene} /></group>;
 *
 * Nothing else in the app (Planet, CameraRig, store, UI, picker, tour, audio)
 * needs to change — they only interact with the outer <group> and its transform.
 */
const PlanetBody = forwardRef<Group, PlanetBodyProps>(function PlanetBody(
  { radius, color, gas = false, ring, textureUrl, emissive = false, ...groupProps },
  ref,
) {
  return (
    <group ref={ref} {...groupProps}>
      {textureUrl ? (
        <TexturedSphere
          url={textureUrl}
          radius={radius}
          color={color}
          emissive={emissive}
        />
      ) : (
        <ProceduralSphere radius={radius} color={color} gas={gas} emissive={emissive} />
      )}
      {ring && <Ring radius={radius} ring={ring} />}
    </group>
  );
});

export default PlanetBody;

function ProceduralSphere({
  radius,
  color,
  gas,
  emissive,
}: {
  radius: number;
  color: string;
  gas: boolean;
  emissive: boolean;
}) {
  const map = useMemo(() => makePlanetTexture(color, { gas }), [color, gas]);
  return (
    <mesh>
      <sphereGeometry args={[radius, 48, 48]} />
      <meshStandardMaterial
        map={map}
        color="#ffffff"
        emissive={color}
        emissiveIntensity={emissive ? 0.6 : 0.04}
        roughness={0.85}
        metalness={0.1}
      />
    </mesh>
  );
}

function TexturedSphere({
  url,
  radius,
  color,
  emissive,
}: {
  url: string;
  radius: number;
  color: string;
  emissive: boolean;
}) {
  const map = useTexture(url);
  return (
    <mesh>
      <sphereGeometry args={[radius, 48, 48]} />
      <meshStandardMaterial
        map={map}
        emissive={color}
        emissiveIntensity={emissive ? 0.5 : 0}
        roughness={0.85}
        metalness={0.1}
      />
    </mesh>
  );
}

function Ring({ radius, ring }: { radius: number; ring: RingConfig }) {
  return (
    <mesh rotation-x={-Math.PI / 2}>
      <ringGeometry args={[radius * ring.innerScale, radius * ring.outerScale, 96]} />
      <meshBasicMaterial
        color={ring.color}
        transparent
        opacity={0.55}
        side={DoubleSide}
      />
    </mesh>
  );
}
