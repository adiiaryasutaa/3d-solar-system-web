# 3D Solar System

An interactive 3D solar-system landing page. The Sun and eight planets orbit and spin in
a full-screen WebGL scene; click any body to fly the camera to it and read its facts. Built
with React Three Fiber, designed so hand-made Blender models drop in later with a one-file
change — every planet is a swappable placeholder until then.

## Features

- **Interactive scene** — Sun + 8 planets, orbital motion + axial spin, visible orbit rings,
  star field.
- **Click to explore** — click a planet (in the scene, the picker dock, or a label) to fly
  the camera to it; a panel slides in with facts.
- **Bloom + glow** post-processing; **Saturn's rings** and axial tilts.
- **Procedural surfaces** — self-contained canvas textures (banded gas giants, speckled
  rocky worlds). No image assets required; real maps can override them.
- **Controls** — planet picker dock, auto-tour, orbit pause + speed slider, label toggle,
  ambient-sound toggle.
- **Accessibility / UX** — `←/→` cycle planets, `Esc` closes, `prefers-reduced-motion`
  pauses motion, responsive bottom-sheet panel on mobile.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS v4
- [React Three Fiber](https://r3f.docs.pmnd.rs/) + [drei](https://github.com/pmndrs/drei) +
  [`@react-three/postprocessing`](https://github.com/pmndrs/postprocessing)
- [zustand](https://github.com/pmndrs/zustand) for UI/scene state
- [Vitest](https://vitest.dev) for tests, [Prettier](https://prettier.io) for formatting

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (defaults to http://localhost:3000).

> The 3D scene is client-only (Three.js needs `window`), loaded via `next/dynamic` with
> `ssr: false`, so there is no server-side WebGL.

## Scripts

| Command                | Purpose                           |
| ---------------------- | --------------------------------- |
| `npm run dev`          | Start the dev server              |
| `npm run build`        | Production build                  |
| `npm start`            | Serve the production build        |
| `npm run lint`         | ESLint                            |
| `npm test`             | Run Vitest unit tests             |
| `npm run format`       | Format the codebase with Prettier |
| `npm run format:check` | Check formatting without writing  |

## Project structure

```
src/
  app/                 # Next.js App Router (layout, page, globals)
  components/          # Scene + UI components
    SolarSystem.tsx    #   <Canvas>: lights, stars, bodies, controls, post-FX
    Sun.tsx
    Planet.tsx         #   orbit + spin + interaction per planet
    PlanetBody.tsx     #   ← SWAP BOUNDARY: the placeholder mesh / future glTF
    PlanetLabel.tsx
    OrbitRing.tsx
    CameraRig.tsx      #   camera fly-to / tracking
    PostFX.tsx         #   bloom
    HeroOverlay.tsx, InfoPanel.tsx, ControlDock.tsx, PlanetPicker.tsx
    AutoTour.tsx, AudioManager.tsx
    planetRegistry.tsx #   body id -> live Object3D (for the camera)
  data/planets.ts      # single source of truth for all bodies + facts
  store/useSolarSystem.ts  # zustand store (selection, motion, UI flags)
  hooks/               # useMediaQuery, useIsMobile, usePrefersReducedMotion, useKeyboardNav
  lib/planetTexture.ts # procedural canvas textures
public/
  models/              # drop Blender .glb files here
  audio/               # drop ambient.mp3 here
```

## Importing Blender models

Every planet renders through `src/components/PlanetBody.tsx` — the only file that knows what
a body looks like. To replace a placeholder sphere with a Blender model:

1. Export the model as glTF/GLB and drop it in `public/models/` (e.g. `earth.glb`).
2. In `PlanetBody.tsx`, load it and render it instead of the sphere:

   ```tsx
   const { scene } = useGLTF(`/models/${id}.glb`);
   return (
     <group ref={ref} {...groupProps}>
       <primitive object={scene} />
     </group>
   );
   ```

Nothing else changes — `Planet`, `CameraRig`, the store, the picker, the tour, and the UI
all interact only with the outer `<group>` and its world transform.

## Adding real textures (before Blender)

Procedural textures are generated at runtime. To use a real map instead, drop an image in
`public/textures/` and set `textureUrl` on that planet in `src/data/planets.ts`
(e.g. `textureUrl: "/textures/earth.jpg"`). It overrides the procedural texture automatically.

## Adding ambient audio

The sound toggle is wired but ships without an audio file. Drop a looping track at
`public/audio/ambient.mp3` (see `public/audio/README.md`). The generated click "blip" works
regardless; if the file is missing, ambient simply stays silent.

## Editing the planets

All bodies, their visual parameters, and their facts live in `src/data/planets.ts`. Add,
remove, or retune a planet there — orbit radius, size, color, speeds, tilt, rings, and the
fact panel content — and the scene + UI update from that single source.
