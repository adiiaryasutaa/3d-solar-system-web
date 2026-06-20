"use client";

import type { ReactNode } from "react";
import { useSolarSystem } from "@/store/useSolarSystem";

/** Corner cluster of scene controls: orbit pause, speed, labels, sound, tour. */
export default function ControlDock() {
  const orbitPaused = useSolarSystem((s) => s.orbitPaused);
  const toggleOrbit = useSolarSystem((s) => s.toggleOrbit);
  const speed = useSolarSystem((s) => s.speed);
  const setSpeed = useSolarSystem((s) => s.setSpeed);
  const labelsVisible = useSolarSystem((s) => s.labelsVisible);
  const toggleLabels = useSolarSystem((s) => s.toggleLabels);
  const muted = useSolarSystem((s) => s.muted);
  const toggleMute = useSolarSystem((s) => s.toggleMute);
  const tourActive = useSolarSystem((s) => s.tourActive);
  const setTour = useSolarSystem((s) => s.setTour);

  return (
    <div className="pointer-events-auto fixed top-4 left-4 z-20 flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-xs text-slate-200 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <IconBtn
          active={!orbitPaused}
          onClick={toggleOrbit}
          label={orbitPaused ? "Play orbits" : "Pause orbits"}
        >
          {orbitPaused ? "▶" : "⏸"}
        </IconBtn>
        <IconBtn
          active={tourActive}
          onClick={() => setTour(!tourActive)}
          label="Auto-tour"
        >
          🎬
        </IconBtn>
        <IconBtn active={labelsVisible} onClick={toggleLabels} label="Toggle labels">
          🏷
        </IconBtn>
        <IconBtn active={!muted} onClick={toggleMute} label={muted ? "Unmute" : "Mute"}>
          {muted ? "🔇" : "🔊"}
        </IconBtn>
      </div>

      <label className="flex items-center gap-2">
        <span className="w-10 text-slate-400">Speed</span>
        <input
          type="range"
          min={0}
          max={3}
          step={0.1}
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          aria-label="Orbital speed"
          className="w-24 accent-sky-400"
        />
        <span className="w-8 text-right tabular-nums">{speed.toFixed(1)}×</span>
      </label>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  active,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition ${
        active
          ? "border-sky-400/60 bg-sky-400/15 text-white"
          : "border-white/10 text-slate-300 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}
