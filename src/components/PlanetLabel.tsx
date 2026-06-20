"use client";

import { Html } from "@react-three/drei";
import { useSolarSystem } from "@/store/useSolarSystem";

/**
 * Floating name tag anchored above a planet. Hidden when labels are toggled off,
 * and hidden for non-focused bodies while a planet is selected (reduces clutter
 * when zoomed in). Clicking it selects that body.
 */
export default function PlanetLabel({
  id,
  name,
  position,
}: {
  id: string;
  name: string;
  position: [number, number, number];
}) {
  const labelsVisible = useSolarSystem((s) => s.labelsVisible);
  const selectedId = useSolarSystem((s) => s.selectedId);
  const select = useSolarSystem((s) => s.select);

  const hidden = !labelsVisible || (selectedId !== null && selectedId !== id);
  if (hidden) return null;

  return (
    <Html
      position={position}
      center
      distanceFactor={42}
      zIndexRange={[10, 0]}
      style={{ pointerEvents: "auto" }}
    >
      <button
        type="button"
        onClick={() => select(id)}
        className="cursor-pointer rounded-full border border-white/15 bg-slate-950/60 px-3 py-1 text-xs font-medium tracking-wide whitespace-nowrap text-slate-100 backdrop-blur-sm transition hover:border-white/40 hover:bg-slate-900/80"
      >
        {name}
      </button>
    </Html>
  );
}
