import { CanvasTexture, Color, RepeatWrapping, SRGBColorSpace } from "three";

// Cache so each (color, type) pair is only painted once.
const cache = new Map<string, CanvasTexture>();

/**
 * Paints a self-contained procedural surface map for a placeholder planet — no
 * external image assets required. Gas giants get horizontal bands; rocky worlds
 * get speckled craters. Replaced automatically when a real `textureUrl` (or a
 * Blender model) is supplied. Browser-only (uses <canvas>); safe because the
 * scene is client-only.
 */
export function makePlanetTexture(
  baseColor: string,
  { gas = false }: { gas?: boolean } = {},
): CanvasTexture {
  const key = `${baseColor}|${gas ? "gas" : "rocky"}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const base = new Color(baseColor);

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  if (gas) {
    const bands = 20;
    for (let i = 0; i < bands; i++) {
      const y = (i / bands) * size;
      const h = size / bands + 1;
      ctx.fillStyle = shade(base, 0.78 + Math.random() * 0.42);
      ctx.fillRect(0, y, size, h);
    }
    ctx.globalAlpha = 0.14;
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = shade(base, 0.82 + Math.random() * 0.34);
      ctx.fillRect(
        Math.random() * size,
        Math.random() * size,
        10 + Math.random() * 70,
        1.5,
      );
    }
    ctx.globalAlpha = 1;
  } else {
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 2800; i++) {
      ctx.fillStyle = shade(base, 0.68 + Math.random() * 0.5);
      ctx.beginPath();
      ctx.arc(
        Math.random() * size,
        Math.random() * size,
        0.5 + Math.random() * 2.6,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  cache.set(key, tex);
  return tex;
}

/**
 * Paints a radial ring strip for Saturn-style rings: concentric striations with
 * varying alpha, a faint inner C-ring, and the dark Cassini + Encke gaps. The
 * texture varies along its width (= radial distance, via the mesh's radial UVs)
 * and is constant along its height. RGB carries band color, A carries opacity.
 */
export function makeRingTexture(baseColor: string): CanvasTexture {
  const key = `ring|${baseColor}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const width = 1024;
  const height = 4;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const base = new Color(baseColor);
  const img = ctx.createImageData(width, height);

  for (let x = 0; x < width; x++) {
    const t = x / (width - 1); // 0 = inner edge, 1 = outer edge

    // Soft fade at both edges so the ring doesn't end on a hard line.
    let alpha = smoothstep(0, 0.05, t) * (1 - smoothstep(0.95, 1, t));
    // Fine concentric striations (layered sines = stable pseudo-noise).
    const stria =
      0.55 +
      0.45 *
        (0.5 +
          0.5 * Math.sin(t * 213) * Math.sin(t * 71 + 1.3) * Math.sin(t * 13 + 0.7));
    alpha *= stria;
    // Cassini division: prominent dark gap ~⅔ out. Encke: thin, near the edge.
    alpha *= 1 - 0.92 * bump(t, 0.58, 0.035);
    alpha *= 1 - 0.8 * bump(t, 0.88, 0.012);
    // Inner C-ring is fainter.
    if (t < 0.25) alpha *= 0.45 + t * 2.2;

    const shadeF = 0.7 + 0.5 * stria;
    const r = Math.min(1, base.r * shadeF) * 255;
    const g = Math.min(1, base.g * shadeF) * 255;
    const b = Math.min(1, base.b * shadeF) * 255;
    const a = Math.max(0, Math.min(1, alpha)) * 255;
    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      img.data[idx] = r;
      img.data[idx + 1] = g;
      img.data[idx + 2] = b;
      img.data[idx + 3] = a;
    }
  }
  ctx.putImageData(img, 0, 0);

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  cache.set(key, tex);
  return tex;
}

/** Smooth 0→1 ramp between two edges. */
function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

/** Smooth bump that peaks at `center`, 0 outside ±`halfWidth`. */
function bump(t: number, center: number, halfWidth: number): number {
  const d = Math.abs(t - center) / halfWidth;
  return d < 1 ? 1 - d * d : 0;
}

function shade(base: Color, factor: number): string {
  const c = base.clone();
  c.r = Math.min(1, c.r * factor);
  c.g = Math.min(1, c.g * factor);
  c.b = Math.min(1, c.b * factor);
  return `#${c.getHexString()}`;
}
