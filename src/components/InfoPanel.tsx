"use client";

import { useEffect, useState } from "react";
import { useSolarSystem } from "@/store/useSolarSystem";
import { getBodyById, type SelectableBody } from "@/data/planets";

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/5 py-3">
      <dt className="text-xs tracking-wider text-slate-400 uppercase">{label}</dt>
      <dd className="text-right text-sm font-medium text-slate-100">{value}</dd>
    </div>
  );
}

/** Slide-in panel showing facts about the selected body. */
export default function InfoPanel() {
  const selectedId = useSolarSystem((s) => s.selectedId);
  const clear = useSolarSystem((s) => s.clear);

  const body = getBodyById(selectedId);
  const open = body !== undefined;

  // Keep the last body around so content stays visible during the slide-out.
  // Adjusting state during render (not in an effect) is the documented pattern
  // for deriving from changing props; `body` has a stable identity per id.
  const [shown, setShown] = useState<SelectableBody | undefined>(undefined);
  if (body && body !== shown) setShown(body);

  // Esc closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") clear();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, clear]);

  return (
    <aside
      aria-hidden={!open}
      aria-label={shown ? `${shown.name} information` : undefined}
      className={`fixed inset-x-0 bottom-0 z-30 flex max-h-[78vh] w-full transform flex-col overflow-y-auto rounded-t-3xl border-t border-white/10 bg-slate-950/85 px-6 pt-5 pb-8 shadow-2xl backdrop-blur-xl transition-transform duration-500 ease-out md:inset-y-0 md:right-0 md:bottom-auto md:left-auto md:h-full md:max-h-none md:w-full md:max-w-md md:rounded-none md:border-t-0 md:border-l md:px-8 md:py-10 ${open ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full md:translate-y-0"}`}
    >
      {/* Drag-handle grip (mobile only). */}
      <div
        aria-hidden
        className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/20 md:hidden"
      />
      {shown && (
        <>
          <button
            type="button"
            onClick={clear}
            aria-label="Close panel"
            className="absolute top-6 right-6 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <span aria-hidden className="text-lg leading-none">
              ×
            </span>
          </button>

          <div className="mb-6 flex items-center gap-4">
            <span
              className="h-10 w-10 shrink-0 rounded-full"
              style={{
                backgroundColor: shown.color,
                boxShadow: `0 0 24px ${shown.color}`,
              }}
            />
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                {shown.name}
              </h2>
              <p className="mt-1 text-xs tracking-wider text-sky-300/80 uppercase">
                {shown.facts.type}
              </p>
            </div>
          </div>

          <p className="mb-8 text-sm leading-relaxed text-slate-300">
            {shown.facts.summary}
          </p>

          <dl>
            <FactRow label="Diameter" value={shown.facts.diameter} />
            <FactRow label="Distance from Sun" value={shown.facts.distanceFromSun} />
            <FactRow label="Day length" value={shown.facts.dayLength} />
            <FactRow label="Year length" value={shown.facts.yearLength} />
            <FactRow label="Gravity" value={shown.facts.gravity} />
            <FactRow label="Temperature" value={shown.facts.temperature} />
            <FactRow label="Atmosphere" value={shown.facts.atmosphere} />
            <FactRow label="Moons" value={shown.facts.moons} />
          </dl>

          <div className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-400/5 p-4">
            <p className="mb-1 text-xs font-semibold tracking-wider text-sky-300/80 uppercase">
              Did you know?
            </p>
            <p className="text-sm leading-relaxed text-slate-200">
              {shown.facts.funFact}
            </p>
          </div>
        </>
      )}
    </aside>
  );
}
