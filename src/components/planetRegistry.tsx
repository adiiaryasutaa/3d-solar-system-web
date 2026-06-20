"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Object3D } from "three";

/**
 * Maps a body id -> its live Object3D in the scene. Planets and the Sun register
 * themselves here; CameraRig reads the selected body's world position from it so
 * it can fly the camera to a moving target without prop-drilling refs around.
 */
type Registry = Map<string, Object3D>;

const RegistryContext = createContext<Registry | null>(null);

export function PlanetRegistryProvider({ children }: { children: ReactNode }) {
  const [registry] = useState<Registry>(() => new Map());
  return <RegistryContext.Provider value={registry}>{children}</RegistryContext.Provider>;
}

export function usePlanetRegistry(): Registry {
  const registry = useContext(RegistryContext);
  if (!registry) {
    throw new Error("usePlanetRegistry must be used within a PlanetRegistryProvider");
  }
  return registry;
}
