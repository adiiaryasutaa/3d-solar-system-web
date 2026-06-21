"use client";

import { BackSide, SRGBColorSpace } from "three";
import { useTexture } from "@react-three/drei";

/**
 * Milky Way backdrop: an equirectangular star map (solarsystemscope, CC BY 4.0)
 * painted on the inside of a huge sphere that sits behind everything. Unlit and
 * non-occluding. Uses the lighter 2k map on mobile to spare GPU memory.
 */
export default function MilkyWay({ mobile = false }: { mobile?: boolean }) {
  const url = mobile
    ? "/textures/2k_stars_milky_way.jpg"
    : "/textures/8k_stars_milky_way.jpg";
  const map = useTexture(url, (loaded) => {
    const tex = Array.isArray(loaded) ? loaded[0] : loaded;
    tex.colorSpace = SRGBColorSpace;
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <sphereGeometry args={[1500, 64, 64]} />
      <meshBasicMaterial
        map={map}
        // Multiplies the map down so the galaxy reads as a backdrop, not a glare.
        color="#3a3a3a"
        side={BackSide}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}
