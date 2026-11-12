// Uncached until the web font is confirmed loaded, so the first render (which
// can happen before fonts resolve) never poisons the cache with fallback metrics.
let ctx: CanvasRenderingContext2D | null = null;
const cache = new Map<string, number>();

export const measureText = (text: string, font: string, approxCharWidth: number): number => {
  if (typeof document === 'undefined') return text.length * approxCharWidth;
  const key = `${font}|${text}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  if (!ctx) ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return text.length * approxCharWidth;
  ctx.font = font;
  const width = ctx.measureText(text).width;
  if (document.fonts?.check(font)) cache.set(key, width);
  return width;
};
