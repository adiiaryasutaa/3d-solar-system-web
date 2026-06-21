import { create } from "zustand";

interface SolarSystemState {
  /** id of the focused body, or null for the overview shot. */
  selectedId: string | null;
  /** Manual orbit pause (separate from prefers-reduced-motion). */
  orbitPaused: boolean;
  /** Orbital speed multiplier (1 = default). */
  speed: number;
  /** Auto-tour cycling through planets. */
  tourActive: boolean;
  /** Whether floating planet labels are shown. */
  labelsVisible: boolean;
  /** Whether the orbit path rings are shown. */
  orbitsVisible: boolean;
  /** Audio muted (opt-in: starts muted). */
  muted: boolean;

  /** Focus a body. Any manual selection stops the tour; the tour passes fromTour. */
  select: (id: string, fromTour?: boolean) => void;
  clear: () => void;
  toggle: (id: string) => void;
  toggleOrbit: () => void;
  setSpeed: (n: number) => void;
  setTour: (active: boolean) => void;
  toggleLabels: () => void;
  toggleOrbits: () => void;
  toggleMute: () => void;
}

/**
 * Shared state between the 3D layer (CameraRig, Planet, Sun) and the DOM layer
 * (InfoPanel, ControlDock, PlanetPicker, AutoTour, AudioManager). Keeping it in a
 * tiny store decouples the two so neither needs to know about the other.
 */
export const useSolarSystem = create<SolarSystemState>((set) => ({
  selectedId: null,
  orbitPaused: false,
  speed: 1,
  tourActive: false,
  labelsVisible: true,
  orbitsVisible: true,
  muted: true,

  select: (id, fromTour = false) =>
    set((s) => ({ selectedId: id, tourActive: fromTour ? s.tourActive : false })),
  clear: () => set({ selectedId: null, tourActive: false }),
  toggle: (id) =>
    set((s) => ({
      selectedId: s.selectedId === id ? null : id,
      tourActive: false,
    })),
  toggleOrbit: () => set((s) => ({ orbitPaused: !s.orbitPaused })),
  setSpeed: (n) => set({ speed: n }),
  setTour: (active) =>
    set((s) => ({
      tourActive: active,
      // Starting a tour with nothing selected kicks off at the first body.
      selectedId: active && s.selectedId === null ? "mercury" : s.selectedId,
    })),
  toggleLabels: () => set((s) => ({ labelsVisible: !s.labelsVisible })),
  toggleOrbits: () => set((s) => ({ orbitsVisible: !s.orbitsVisible })),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
}));
