"use client";

import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import {
  Color,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SRGBColorSpace,
  type BufferGeometry,
  type Group,
  type InstancedMesh,
  type Material,
} from "three";
import {
  ASTEROID_BELT,
  ASTEROID_FIELD,
  type AsteroidBeltConfig,
  type AsteroidFieldConfig,
} from "@/data/asteroids";
import { makePlanetTexture } from "@/lib/planetTexture";
import { useIsMobile } from "@/hooks/useIsMobile";

// The belt rotates as one rigid ring; tuned slow so it reads as a slow drift.
const BELT_ORBIT_SPEED = 0.05;

interface RockInstance {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

/** Tiny deterministic PRNG so the rock layout is stable across renders. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rock(
  rand: () => number,
  position: [number, number, number],
  minSize: number,
  maxSize: number,
): RockInstance {
  const s = minSize + rand() * (maxSize - minSize);
  // Non-uniform scale so each rock looks lumpy, not a perfect ball.
  return {
    position,
    rotation: [rand() * Math.PI * 2, rand() * Math.PI * 2, rand() * Math.PI * 2],
    scale: [
      s * (0.7 + rand() * 0.6),
      s * (0.7 + rand() * 0.6),
      s * (0.7 + rand() * 0.6),
    ],
  };
}

function buildBelt(cfg: AsteroidBeltConfig, count: number): RockInstance[] {
  const rand = mulberry32(cfg.seed);
  const span = cfg.outerRadius - cfg.innerRadius;
  return Array.from({ length: count }, () => {
    const angle = rand() * Math.PI * 2;
    const radius = cfg.innerRadius + rand() * span;
    const y = (rand() * 2 - 1) * cfg.thickness;
    return rock(
      rand,
      [Math.cos(angle) * radius, y, Math.sin(angle) * radius],
      cfg.minSize,
      cfg.maxSize,
    );
  });
}

function buildField(cfg: AsteroidFieldConfig): RockInstance[] {
  const rand = mulberry32(cfg.seed);
  const span = cfg.maxRadius - cfg.minRadius;
  return Array.from({ length: cfg.count }, () => {
    const angle = rand() * Math.PI * 2;
    const radius = cfg.minRadius + rand() * span;
    const y = (rand() * 2 - 1) * (cfg.spread / 2);
    return rock(
      rand,
      [Math.cos(angle) * radius, y, Math.sin(angle) * radius],
      cfg.minSize,
      cfg.maxSize,
    );
  });
}

/** Wraps the rock meshes; `animate` rotates them around the Sun (the belt). */
function OrbitGroup({
  animate = false,
  paused = false,
  speed = 1,
  children,
}: {
  animate?: boolean;
  paused?: boolean;
  speed?: number;
  children: ReactNode;
}) {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!animate || paused || !ref.current) return;
    ref.current.rotation.y += delta * speed * BELT_ORBIT_SPEED;
  });
  return <group ref={ref}>{children}</group>;
}

/** One geometry + one material drawn N times, transforms baked once. */
function InstancedRocks({
  geometry,
  material,
  instances,
}: {
  geometry: BufferGeometry;
  material: Material;
  instances: RockInstance[];
}) {
  const meshRef = useRef<InstancedMesh>(null);

  // Bake each rock's transform (re-runs if the instance set, count, or the
  // freshly-loaded geometry changes).
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new Object3D();
    instances.forEach((inst, i) => {
      dummy.position.set(...inst.position);
      dummy.rotation.set(...inst.rotation);
      dummy.scale.set(...inst.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [instances, geometry]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, instances.length]}
      frustumCulled={false}
    />
  );
}

function rockMaterial(map: MeshStandardMaterial["map"], color: string) {
  return new MeshStandardMaterial({
    map,
    // Lift the far-field rocks out of pure black past the Sun's light falloff.
    emissive: new Color(color),
    emissiveIntensity: 0.06,
    roughness: 0.95,
    metalness: 0.05,
  });
}

/** Placeholder: faceted icosahedron + procedural rocky map. */
function ProceduralCloud({
  color,
  instances,
}: {
  color: string;
  instances: RockInstance[];
}) {
  const geometry = useMemo(() => new IcosahedronGeometry(1, 0), []);
  const map = useMemo(() => makePlanetTexture(color, { gas: false }), [color]);
  const material = useMemo(() => rockMaterial(map, color), [map, color]);
  return (
    <InstancedRocks geometry={geometry} material={material} instances={instances} />
  );
}

/** Faceted icosahedron + a real texture map (no Blender mesh yet). */
function TexturedCloud({
  url,
  color,
  instances,
}: {
  url: string;
  color: string;
  instances: RockInstance[];
}) {
  const geometry = useMemo(() => new IcosahedronGeometry(1, 0), []);
  const map = useTexture(url, (loaded) => {
    const tex = Array.isArray(loaded) ? loaded[0] : loaded;
    tex.colorSpace = SRGBColorSpace;
  });
  const material = useMemo(() => rockMaterial(map, color), [map, color]);
  return (
    <InstancedRocks geometry={geometry} material={material} instances={instances} />
  );
}

/** One Blender rock model, instanced. Pulls geometry + material out of the glb. */
function VariantCloud({ url, instances }: { url: string; instances: RockInstance[] }) {
  const { scene } = useGLTF(url);
  const { geometry, material } = useMemo(() => {
    let geo: BufferGeometry | undefined;
    let mat: Material | undefined;
    scene.traverse((o) => {
      if (o instanceof Mesh && !geo) {
        geo = o.geometry;
        mat = Array.isArray(o.material) ? o.material[0] : o.material;
      }
    });
    return { geometry: geo, material: mat };
  }, [scene]);

  if (!geometry || !material) return null;
  return (
    <InstancedRocks geometry={geometry} material={material} instances={instances} />
  );
}

/**
 * ── SWAP BOUNDARY ──────────────────────────────────────────────────────────
 * Render priority: Blender models (`modelUrls`) → texture map (`textureUrl`) →
 * procedural rock. Drop glb(s) in public/models/ and set `modelUrls` on the
 * config in data/asteroids.ts; instances split across the variants, one
 * InstancedMesh each. Belt orbit + static field logic is unchanged.
 */
function RockCloud({
  color,
  textureUrl,
  modelUrls,
  instances,
  animate,
  paused,
  speed,
}: {
  color: string;
  textureUrl?: string;
  modelUrls?: string[];
  instances: RockInstance[];
  animate?: boolean;
  paused?: boolean;
  speed?: number;
}) {
  // Split instances across the model variants (round-robin by index).
  const groups = useMemo(() => {
    if (!modelUrls?.length) return null;
    const g: RockInstance[][] = modelUrls.map(() => []);
    instances.forEach((inst, i) => g[i % modelUrls.length].push(inst));
    return g;
  }, [modelUrls, instances]);

  return (
    <OrbitGroup animate={animate} paused={paused} speed={speed}>
      {modelUrls?.length && groups ? (
        modelUrls.map((url, i) => (
          <VariantCloud key={url} url={url} instances={groups[i]} />
        ))
      ) : textureUrl ? (
        <TexturedCloud url={textureUrl} color={color} instances={instances} />
      ) : (
        <ProceduralCloud color={color} instances={instances} />
      )}
    </OrbitGroup>
  );
}

/** Decorative asteroids: an orbiting belt + a static far-field scatter. */
export default function Asteroids({
  paused,
  speed,
}: {
  paused: boolean;
  speed: number;
}) {
  const isMobile = useIsMobile();

  const beltCount = isMobile
    ? Math.round(ASTEROID_BELT.count / 3)
    : ASTEROID_BELT.count;
  const beltInstances = useMemo(
    () => buildBelt(ASTEROID_BELT, beltCount),
    [beltCount],
  );
  const fieldInstances = useMemo(() => buildField(ASTEROID_FIELD), []);

  return (
    <>
      {/* Moving: the whole ring rotates around the Sun (gated by pause/speed). */}
      <RockCloud
        color={ASTEROID_BELT.color}
        textureUrl={ASTEROID_BELT.textureUrl}
        modelUrls={ASTEROID_BELT.modelUrls}
        instances={beltInstances}
        animate
        paused={paused}
        speed={speed}
      />
      {/* Static: parked in the far field, never moves. */}
      <RockCloud
        color={ASTEROID_FIELD.color}
        textureUrl={ASTEROID_FIELD.textureUrl}
        modelUrls={ASTEROID_FIELD.modelUrls}
        instances={fieldInstances}
      />
    </>
  );
}
