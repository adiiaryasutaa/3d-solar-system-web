// Single source of truth for the solar system scene.
//
// NOTE: scene values (radius, orbitRadius, speeds) are *illustrative*, not literal
// astronomical scale — real distances would make planets invisible specks. The
// `facts` carry real-world numbers shown in the UI.

export interface PlanetFacts {
  /** Classification, e.g. "Terrestrial planet", "Gas giant". */
  type: string;
  diameter: string;
  distanceFromSun: string;
  dayLength: string;
  yearLength: string;
  moons: string;
  gravity: string;
  temperature: string;
  atmosphere: string;
  summary: string;
  funFact: string;
}

export interface Planet {
  id: string;
  name: string;
  /** Placeholder sphere color (hex). Removed once Blender models land. */
  color: string;
  /** Sphere radius in scene units. */
  radius: number;
  /** Orbit radius (distance from the Sun) in scene units. */
  orbitRadius: number;
  /** Relative angular speed around the Sun. Higher = faster orbit. */
  orbitSpeedFactor: number;
  /** Relative spin speed on its own axis. */
  rotationSpeedFactor: number;
  /** Starting angle (radians) so planets don't all line up at t=0. */
  initialAngle: number;
  /** Gas giants get banded procedural textures; rocky worlds get speckle. */
  gas?: boolean;
  /** Axial tilt (radians) applied to the body + its rings. */
  tilt?: number;
  /** Optional ring system (Saturn). Scales are multiples of the planet radius. */
  ring?: { innerScale: number; outerScale: number; color: string };
  /** Optional real texture map (drop in public/textures/) — overrides procedural. */
  textureUrl?: string;
  facts: PlanetFacts;
}

export interface SunConfig {
  id: string;
  name: string;
  color: string;
  radius: number;
  facts: PlanetFacts;
}

export const SUN: SunConfig = {
  id: "sun",
  name: "Sun",
  color: "#ffcc33",
  radius: 4,
  facts: {
    type: "G-type main-sequence star",
    diameter: "1,391,000 km",
    distanceFromSun: "—",
    dayLength: "~27 Earth days (equator)",
    yearLength: "—",
    moons: "0",
    gravity: "274 m/s²",
    temperature: "5,500 °C surface · 15 million °C core",
    atmosphere: "Hydrogen & helium plasma",
    summary:
      "The star at the heart of the solar system: a vast sphere of hot plasma holding every planet in orbit and providing nearly all of Earth's energy.",
    funFact: "It holds 99.8% of all the mass in the solar system.",
  },
};

export const PLANETS: Planet[] = [
  {
    id: "mercury",
    name: "Mercury",
    color: "#9c9183",
    radius: 0.5,
    orbitRadius: 8,
    orbitSpeedFactor: 1.6,
    rotationSpeedFactor: 0.4,
    initialAngle: 0.2,
    facts: {
      type: "Terrestrial planet",
      diameter: "4,879 km",
      distanceFromSun: "57.9 million km",
      dayLength: "1,408 hours",
      yearLength: "88 Earth days",
      moons: "0",
      gravity: "3.7 m/s²",
      temperature: "-173 °C to 427 °C",
      atmosphere: "Negligible (trace sodium, oxygen)",
      summary:
        "The smallest planet and closest to the Sun. A cratered, airless world with extreme temperature swings between day and night.",
      funFact: "A day on Mercury (sunrise to sunrise) lasts longer than its entire year.",
    },
  },
  {
    id: "venus",
    name: "Venus",
    color: "#e0b873",
    radius: 0.9,
    orbitRadius: 11,
    orbitSpeedFactor: 1.2,
    rotationSpeedFactor: 0.35,
    initialAngle: 1.1,
    facts: {
      type: "Terrestrial planet",
      diameter: "12,104 km",
      distanceFromSun: "108.2 million km",
      dayLength: "5,832 hours",
      yearLength: "225 Earth days",
      moons: "0",
      gravity: "8.87 m/s²",
      temperature: "~465 °C (hottest planet)",
      atmosphere: "Carbon dioxide, clouds of sulfuric acid",
      summary:
        "Earth's scorching twin, wrapped in a thick toxic atmosphere that traps heat, making it the hottest planet in the solar system.",
      funFact: "It spins backwards, so the Sun rises in the west and sets in the east.",
    },
  },
  {
    id: "earth",
    name: "Earth",
    color: "#4f8fcf",
    radius: 1,
    orbitRadius: 14.5,
    orbitSpeedFactor: 1,
    rotationSpeedFactor: 1,
    initialAngle: 2.4,
    tilt: 0.41,
    facts: {
      type: "Terrestrial planet",
      diameter: "12,742 km",
      distanceFromSun: "149.6 million km",
      dayLength: "24 hours",
      yearLength: "365.25 days",
      moons: "1",
      gravity: "9.8 m/s²",
      temperature: "-88 °C to 58 °C (avg 15 °C)",
      atmosphere: "Nitrogen (78%), oxygen (21%)",
      summary:
        "Our home: the only known world with liquid water on its surface and life. A pale blue dot in the vastness of space.",
      funFact: "The only planet not named after a Greek or Roman god.",
    },
  },
  {
    id: "mars",
    name: "Mars",
    color: "#c1440e",
    radius: 0.7,
    orbitRadius: 18,
    orbitSpeedFactor: 0.8,
    rotationSpeedFactor: 0.95,
    initialAngle: 3.6,
    facts: {
      type: "Terrestrial planet",
      diameter: "6,779 km",
      distanceFromSun: "227.9 million km",
      dayLength: "25 hours",
      yearLength: "687 Earth days",
      moons: "2",
      gravity: "3.71 m/s²",
      temperature: "-153 °C to 20 °C",
      atmosphere: "Thin carbon dioxide",
      summary:
        "The Red Planet, named for its rusty iron-oxide surface. Home to the largest volcano and deepest canyon in the solar system.",
      funFact:
        "Olympus Mons, its tallest volcano, is roughly three times the height of Everest.",
    },
  },
  {
    id: "jupiter",
    name: "Jupiter",
    color: "#d8a47f",
    radius: 2.6,
    orbitRadius: 25,
    orbitSpeedFactor: 0.43,
    rotationSpeedFactor: 2.2,
    initialAngle: 0.8,
    gas: true,
    tilt: 0.05,
    facts: {
      type: "Gas giant",
      diameter: "139,820 km",
      distanceFromSun: "778.5 million km",
      dayLength: "10 hours",
      yearLength: "12 Earth years",
      moons: "95+",
      gravity: "24.79 m/s²",
      temperature: "~-145 °C (cloud tops)",
      atmosphere: "Hydrogen & helium",
      summary:
        "The giant of the solar system — a massive gas planet famous for its Great Red Spot, a storm larger than Earth.",
      funFact:
        "The Great Red Spot is a storm wider than Earth that has raged for centuries.",
    },
  },
  {
    id: "saturn",
    name: "Saturn",
    color: "#e3d9a6",
    radius: 2.2,
    orbitRadius: 33,
    orbitSpeedFactor: 0.32,
    rotationSpeedFactor: 2,
    initialAngle: 2.0,
    gas: true,
    tilt: 0.47,
    ring: { innerScale: 1.4, outerScale: 2.3, color: "#cbb98f" },
    facts: {
      type: "Gas giant",
      diameter: "116,460 km",
      distanceFromSun: "1.43 billion km",
      dayLength: "10.7 hours",
      yearLength: "29 Earth years",
      moons: "146+",
      gravity: "10.44 m/s²",
      temperature: "~-178 °C",
      atmosphere: "Hydrogen & helium",
      summary:
        "The jewel of the solar system, encircled by a spectacular system of icy rings. A gas giant light enough to float on water.",
      funFact:
        "Saturn is so light that it would float in water — if you could find a big enough ocean.",
    },
  },
  {
    id: "uranus",
    name: "Uranus",
    color: "#a6d9d9",
    radius: 1.6,
    orbitRadius: 40,
    orbitSpeedFactor: 0.23,
    rotationSpeedFactor: 1.4,
    initialAngle: 4.1,
    gas: true,
    tilt: 1.71,
    facts: {
      type: "Ice giant",
      diameter: "50,724 km",
      distanceFromSun: "2.87 billion km",
      dayLength: "17 hours",
      yearLength: "84 Earth years",
      moons: "28",
      gravity: "8.69 m/s²",
      temperature: "~-224 °C (coldest atmosphere)",
      atmosphere: "Hydrogen, helium & methane",
      summary:
        "An ice giant tipped on its side, rolling around the Sun on its axis. Its methane-rich atmosphere gives it a pale cyan hue.",
      funFact:
        "It rotates on its side, likely knocked over by a giant ancient collision.",
    },
  },
  {
    id: "neptune",
    name: "Neptune",
    color: "#3b5bd9",
    radius: 1.5,
    orbitRadius: 46,
    orbitSpeedFactor: 0.18,
    rotationSpeedFactor: 1.5,
    initialAngle: 5.5,
    gas: true,
    tilt: 0.49,
    facts: {
      type: "Ice giant",
      diameter: "49,244 km",
      distanceFromSun: "4.5 billion km",
      dayLength: "16 hours",
      yearLength: "165 Earth years",
      moons: "16",
      gravity: "11.15 m/s²",
      temperature: "~-214 °C",
      atmosphere: "Hydrogen, helium & methane",
      summary:
        "The most distant planet: a deep-blue, windswept ice giant with the fastest winds in the solar system.",
      funFact: "Its winds scream at up to 2,100 km/h — the fastest in the solar system.",
    },
  },
];

/** A clickable body (Sun or planet) reduced to what the UI + camera need. */
export interface SelectableBody {
  id: string;
  name: string;
  color: string;
  radius: number;
  facts: PlanetFacts;
}

/** Unified lookup over the Sun and all planets, used by CameraRig and InfoPanel. */
export function getBodyById(id: string | null): SelectableBody | undefined {
  if (!id) return undefined;
  if (id === SUN.id) return SUN;
  return PLANETS.find((p) => p.id === id);
}
