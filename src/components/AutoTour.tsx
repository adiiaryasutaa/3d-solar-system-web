"use client";

import { useEffect } from "react";
import { PLANETS } from "@/data/planets";
import { useSolarSystem } from "@/store/useSolarSystem";

const STEP_MS = 7000;

/**
 * When the tour is active, advances the selection through the planets on a timer.
 * Selections are flagged `fromTour` so they don't stop the tour; any manual
 * selection (click / picker / keyboard) flips `tourActive` off, which tears the
 * interval down here. Renders nothing.
 */
export default function AutoTour() {
  const tourActive = useSolarSystem((s) => s.tourActive);

  useEffect(() => {
    if (!tourActive) return;
    const ids = PLANETS.map((p) => p.id);

    const timer = setInterval(() => {
      const { selectedId, select } = useSolarSystem.getState();
      const cur = selectedId ? ids.indexOf(selectedId) : -1;
      const next = (cur + 1 + ids.length) % ids.length;
      select(ids[next], true);
    }, STEP_MS);

    return () => clearInterval(timer);
  }, [tourActive]);

  return null;
}
