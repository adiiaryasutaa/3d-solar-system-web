"use client";

import { DoubleSide } from "three";

/** Thin flat ring on the XZ plane marking a planet's orbital path. */
export default function OrbitRing({
  radius,
  highlighted = false,
}: {
  radius: number;
  highlighted?: boolean;
}) {
  return (
    <mesh rotation-x={-Math.PI / 2}>
      <ringGeometry args={[radius - 0.04, radius + 0.04, 160]} />
      <meshBasicMaterial
        color={highlighted ? "#ffffff" : "#42588a"}
        transparent
        opacity={highlighted ? 0.85 : 0.3}
        side={DoubleSide}
      />
    </mesh>
  );
}
