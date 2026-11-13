// Text measurement on a canvas. A width is cached only once the exact font
// face (family + weight) is actually loaded: document.fonts.check() returns
// true when NO face is registered yet, which used to cache fallback-font
// widths (the cause of v7's overflowing rows).
let ctx: CanvasRenderingContext2D | null = null;
const cache = new Map<string, number>();

const parse = (font: string) => {
  const m = font.match(/^(\d{3})\s+[\d.]+px\s+"?([^",]+)"?/);
  return m ? {weight: m[1], family: m[2]} : null;
};

const faceLoaded = (font: string): boolean => {
  if (typeof document === 'undefined' || !document.fonts) return false;
  const p = parse(font);
  if (!p) return false;
  let ok = false;
  document.fonts.forEach((ff) => {
    if (ff.family.replace(/"/g, '') === p.family && String(ff.weight) === p.weight && ff.status === 'loaded') ok = true;
  });
  return ok;
};

export const measureText = (text: string, font: string, approxCharWidth: number): number => {
  if (typeof document === 'undefined') return text.length * approxCharWidth;
  const key = `${font}|${text}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  if (!ctx) ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return text.length * approxCharWidth;
  ctx.font = font;
  const width = ctx.measureText(text).width;
  if (faceLoaded(font)) cache.set(key, width);
  return width;
};

/** Greedy word wrap with the measured font. Returns the lines (words joined by single spaces). */
export const wrapText = (text: string, font: string, maxWidth: number, approx = 14): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && measureText(next, font, approx) > maxWidth) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
};
