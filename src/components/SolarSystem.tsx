"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, OrbitControls, Stars } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { PLANETS } from "@/data/planets";
import { useSolarSystem } from "@/store/useSolarSystem";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { PlanetRegistryProvider } from "./planetRegistry";
import MilkyWay from "./MilkyWay";
import Sun from "./Sun";
import Planet from "./Planet";
import Asteroids from "./Asteroids";
import CameraRig from "./CameraRig";
import PostFX from "./PostFX";

/** The full-viewport 3D layer: the solar system scene. Client-only. */
export default function SolarSystem() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const clear = useSolarSystem((s) => s.clear);
  const orbitPaused = useSolarSystem((s) => s.orbitPaused);
  const speed = useSolarSystem((s) => s.speed);
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();

  const paused = reducedMotion || orbitPaused;

  return (
    <Canvas
      camera={{ position: [0, 34, 78], fov: 50, near: 0.1, far: 4000 }}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      onPointerMissed={() => clear()}
      style={{ position: "fixed", inset: 0 }}
    >
      <color attach="background" args={["#05060d"]} />
      <ambientLight intensity={0.12} />

      <Suspense fallback={null}>
        <PlanetRegistryProvider>
          <MilkyWay mobile={isMobile} />
          <Stars
            radius={300}
            depth={80}
            count={isMobile ? 2500 : 6000}
            factor={5}
            saturation={0}
            fade
            speed={paused ? 0 : 0.4}
          />
          <Sun paused={paused} speed={speed} />
          {PLANETS.map((planet) => (
            <Planet key={planet.id} planet={planet} paused={paused} speed={speed} />
          ))}
          <Asteroids paused={paused} speed={speed} />
          <CameraRig controls={controlsRef} />
        </PlanetRegistryProvider>
      </Suspense>

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={6}
        maxDistance={160}
        regress
      />

      {/* Bloom is GPU-heavy; skip it on phones. */}
      {!isMobile && <PostFX />}
      {/* Drop resolution during interaction, restore when idle. */}
      <AdaptiveDpr pixelated />
    </Canvas>
  );
}
