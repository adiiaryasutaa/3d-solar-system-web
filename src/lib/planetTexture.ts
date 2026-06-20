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

function shade(base: Color, factor: number): string {
  const c = base.clone();
  c.r = Math.min(1, c.r * factor);
  c.g = Math.min(1, c.g * factor);
  c.b = Math.min(1, c.b * factor);
  return `#${c.getHexString()}`;
}
