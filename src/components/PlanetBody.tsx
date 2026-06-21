"use client";

import { forwardRef, useMemo } from "react";
import {
  Box3,
  DoubleSide,
  Group,
  RingGeometry,
  SRGBColorSpace,
  Vector3,
} from "three";
import { useGLTF, useTexture } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { makePlanetTexture, makeRingTexture } from "@/lib/planetTexture";
import type { Planet } from "@/data/planets";

type RingConfig = NonNullable<Planet["ring"]>;

type PlanetBodyProps = ThreeElements["group"] & {
  radius: number;
  color: string;
  gas?: boolean;
  ring?: RingConfig;
  /** Real texture map (overrides the procedural one). */
  textureUrl?: string;
  /** Blender model (overrides procedural + textureUrl). */
  modelUrl?: string;
  /** Separate Blender ring model (e.g. Saturn), rendered alongside the body. */
  ringModelUrl?: string;
  /** Brighten while hovered. */
  emissive?: boolean;
};

/**
 * ── SWAP BOUNDARY ──────────────────────────────────────────────────────────
 * This is the ONLY file that knows what a planet looks like. Render priority:
 * Blender model (`modelUrl`) → real texture (`textureUrl`) → procedural sphere.
 * Drop a glb in public/models/ and set `modelUrl` on the planet in data; nothing
 * else in the app (Planet, CameraRig, store, UI, picker, tour, audio) changes —
 * they only interact with the outer <group> and its transform.
 */
const PlanetBody = forwardRef<Group, PlanetBodyProps>(function PlanetBody(
  {
    radius,
    color,
    gas = false,
    ring,
    textureUrl,
    modelUrl,
    ringModelUrl,
    emissive = false,
    ...groupProps
  },
  ref,
) {
  return (
    <group ref={ref} {...groupProps}>
      {modelUrl ? (
        <GltfModel url={modelUrl} radius={radius} />
      ) : textureUrl ? (
        <TexturedSphere
          url={textureUrl}
          radius={radius}
          color={color}
          emissive={emissive}
        />
      ) : (
        <ProceduralSphere radius={radius} color={color} gas={gas} emissive={emissive} />
      )}
      {/* Ring: a dedicated glb model wins over the procedural placeholder ring. */}
      {ringModelUrl ? (
        <GltfModel url={ringModelUrl} radius={radius} />
      ) : (
        ring && <Ring radius={radius} ring={ring} />
      )}
    </group>
  );
});

export default PlanetBody;

/**
 * A Blender glTF model fitted to the body's size. Recenters on its bounding-box
 * center (so baked-in export offset doesn't push the body off its orbit) and
 * normalizes by its bounding box (so the body is `radius` regardless of the
 * model's authored scale). Recenter on the inner clone, scale on an outer
 * wrapper, so the offset is removed *before* scaling.
 */
function GltfModel({ url, radius }: { url: string; radius: number }) {
  const { scene } = useGLTF(url);
  const object = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);
    const box = new Box3().setFromObject(clone);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    clone.position.sub(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const wrapper = new Group();
    wrapper.add(clone);
    wrapper.scale.setScalar((radius * 2) / maxDim);
    return wrapper;
  }, [scene, radius]);
  return <primitive object={object} />;
}

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
  // Color maps must be sRGB or they look washed out; set it as the texture loads.
  const map = useTexture(url, (loaded) => {
    const tex = Array.isArray(loaded) ? loaded[0] : loaded;
    tex.colorSpace = SRGBColorSpace;
  });
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

/**
 * Saturn-style ring: a flat annulus with a generated band texture. The default
 * RingGeometry UVs aren't radial, so we rewrite them — u = normalized radial
 * distance — letting the band strip map cleanly from inner to outer edge.
 */
function Ring({ radius, ring }: { radius: number; ring: RingConfig }) {
  const inner = radius * ring.innerScale;
  const outer = radius * ring.outerScale;

  const geometry = useMemo(() => {
    const geo = new RingGeometry(inner, outer, 160, 1);
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    const v = new Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      uv.setXY(i, (v.length() - inner) / (outer - inner), 0.5);
    }
    uv.needsUpdate = true;
    return geo;
  }, [inner, outer]);

  const map = useMemo(() => makeRingTexture(ring.color), [ring.color]);

  return (
    <mesh rotation-x={-Math.PI / 2} geometry={geometry}>
      <meshStandardMaterial
        map={map}
        transparent
        side={DoubleSide}
        depthWrite={false}
        roughness={0.9}
        metalness={0}
        emissive={ring.color}
        emissiveIntensity={0.08}
      />
    </mesh>
  );
}
