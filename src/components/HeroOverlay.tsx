"use client";

import { useSolarSystem } from "@/store/useSolarSystem";

/** Title + tagline floating over the scene. Fades out once a body is selected. */
export default function HeroOverlay() {
  const selectedId = useSolarSystem((s) => s.selectedId);
  const hidden = selectedId !== null;

  return (
    <div
      aria-hidden={hidden}
      className={`pointer-events-none fixed inset-x-0 top-0 z-10 flex flex-col items-center px-6 pt-[12vh] text-center transition-opacity duration-700 ${
        hidden ? "opacity-0" : "opacity-100"
      }`}
    >
      <p className="mb-3 text-xs font-medium tracking-[0.4em] text-sky-300/70 uppercase">
        An interactive journey
      </p>
      <h1 className="bg-gradient-to-b from-white to-sky-200/80 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl">
        The Solar System
      </h1>
      <p className="mt-4 max-w-xl text-sm text-slate-300/80 sm:text-base">
        Eight worlds orbiting a single star. Drag to look around, scroll to zoom.
      </p>
      <p className="mt-10 animate-pulse text-xs tracking-[0.3em] text-slate-400 uppercase">
        ✦ Click a planet to explore ✦
      </p>
    </div>
  );
}
