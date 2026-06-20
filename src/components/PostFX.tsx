"use client";

import { Bloom, EffectComposer } from "@react-three/postprocessing";

/**
 * Post-processing stack. Bloom makes the unlit Sun and hovered planets glow.
 * Mounted inside <Canvas>.
 */
export default function PostFX() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.9}
        luminanceThreshold={0.25}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
    </EffectComposer>
  );
}
