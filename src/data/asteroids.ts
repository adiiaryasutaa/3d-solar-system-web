// Asteroid configuration for the scene.
//
// Two populations, both decorative (not selectable):
//   • BELT  — a dense ring of rocks orbiting between Mars (18) and Jupiter (25).
//             The whole ring rotates as one (see AsteroidBelt in Asteroids.tsx).
//   • FIELD — a sparse set of rocks parked in the far field. They never move.
//
// Like planets.ts, scene values are illustrative, not astronomical.

export interface AsteroidBeltConfig {
  /** Instance count on desktop (mobile scales this down in the component). */
  count: number;
  /** Inner edge of the ring, just outside Mars (orbitRadius 18). */
  innerRadius: number;
  /** Outer edge of the ring, just inside Jupiter (orbitRadius 25). */
  outerRadius: number;
  /** Max vertical (y) jitter so the ring has thickness. */
  thickness: number;
  /** Per-rock scale range (scene units). */
  minSize: number;
  maxSize: number;
  /** Base rock color (hex). */
  color: string;
  /** Seed for deterministic layout. */
  seed: number;
  /** Real texture map (drop in public/textures/) — overrides procedural. */
  textureUrl?: string;
  /**
   * Blender rock models (drop in public/models/). Each is one instanced variant;
   * instances are split across them. Authored at unit radius. Overrides texture +
   * procedural. e.g. ["/models/rock-a.glb", "/models/rock-b.glb"].
   */
  modelUrls?: string[];
}

export interface AsteroidFieldConfig {
  /** Number of static scattered rocks. */
  count: number;
  /** Nearest a field rock spawns (beyond Neptune, orbitRadius 46). */
  minRadius: number;
  /** Farthest a field rock spawns. */
  maxRadius: number;
  /** Vertical spread — wide, so it reads as scattered debris, not a disk. */
  spread: number;
  minSize: number;
  maxSize: number;
  color: string;
  seed: number;
  textureUrl?: string;
  /** Blender rock models — see AsteroidBeltConfig.modelUrls. */
  modelUrls?: string[];
}

export const ASTEROID_BELT: AsteroidBeltConfig = {
  count: 420,
  innerRadius: 19.5,
  outerRadius: 24,
  thickness: 0.7,
  minSize: 0.04,
  maxSize: 0.22,
  color: "#7d7468",
  seed: 1337,
};

export const ASTEROID_FIELD: AsteroidFieldConfig = {
  count: 30,
  minRadius: 55,
  maxRadius: 95,
  spread: 40,
  minSize: 0.15,
  maxSize: 0.5,
  color: "#6f675c",
  seed: 7,
};
