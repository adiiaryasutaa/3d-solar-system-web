"use client";

import { PLANETS, SUN } from "@/data/planets";
import { useSolarSystem } from "@/store/useSolarSystem";

const BODIES = [SUN, ...PLANETS];

/** Bottom dock to jump the camera straight to any body. */
export default function PlanetPicker() {
  const selectedId = useSolarSystem((s) => s.selectedId);
  const select = useSolarSystem((s) => s.select);

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-4">
      <div className="pointer-events-auto flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60 p-1.5 backdrop-blur-md">
        {BODIES.map((body) => {
          const active = selectedId === body.id;
          return (
            <button
              key={body.id}
              type="button"
              onClick={() => select(body.id)}
              aria-pressed={active}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition ${
                active ? "bg-white/15 text-white" : "text-slate-300 hover:bg-white/10"
              }`}
            >
              <span
                aria-hidden
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: body.color,
                  boxShadow: `0 0 8px ${body.color}`,
                }}
              />
              <span>{body.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
