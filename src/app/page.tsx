"use client";

import dynamic from "next/dynamic";
import { Loader } from "@react-three/drei";
import HeroOverlay from "@/components/HeroOverlay";
import InfoPanel from "@/components/InfoPanel";
import LoadingScreen from "@/components/LoadingScreen";
import ControlDock from "@/components/ControlDock";
import PlanetPicker from "@/components/PlanetPicker";
import AutoTour from "@/components/AutoTour";
import AudioManager from "@/components/AudioManager";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";

// Three.js needs `window`, so the scene is client-only (no SSR).
const SolarSystem = dynamic(() => import("@/components/SolarSystem"), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

export default function Home() {
  useKeyboardNav();

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#05060d] text-white">
      <SolarSystem />

      {/* DOM overlay layer */}
      <HeroOverlay />
      <ControlDock />
      <PlanetPicker />
      <InfoPanel />

      {/* Headless helpers */}
      <AutoTour />
      <AudioManager />

      {/* In-scene asset loading progress (drei reads useProgress internally). */}
      <Loader />
    </main>
  );
}
