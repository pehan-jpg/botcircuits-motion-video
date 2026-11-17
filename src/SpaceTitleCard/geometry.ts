// Canvas local geometry (px). The canvas is 1240 x 640, centred in the 1920 x 1080 frame.
export type Pt = { x: number; y: number };
export type Poly = Pt[];
export type Rect = { name: string; left: number; top: number; right: number; bottom: number };

export const CANVAS = { w: 1240, h: 640, radius: 28, left: (1920 - 1240) / 2, top: (1080 - 640) / 2 };

export const TILE = 96;
export const TILE_RADIUS = 24;
export const NODE = 96;
export const AGENT = 120;
export const DIAMOND = 56; // diagonal of the branch diamond
export const BUS_Y = 50;

export type LogoKey = "gmail" | "slack" | "salesforce" | "zendesk" | "google-drive" | "google-sheets";
export const logoFile = (k: LogoKey) => `logos/${k}.svg`;

export const EVENTS: { key: "gmail" | "slack" | "clock"; x: number; y: number }[] = [
  { key: "gmail", x: 130, y: 110 },
  { key: "slack", x: 130, y: 240 },
  { key: "clock", x: 130, y: 370 },
];

export const N = {
  start: { x: 340, y: 240 },
  agent: { x: 500, y: 240 },
  branch: { x: 622, y: 240 },
  person: { x: 730, y: 130 },
  done: { x: 840, y: 240 },
};

export const TOOLS: { key: LogoKey; x: number; y: number }[] = [
  { key: "salesforce", x: 1010, y: 140 },
  { key: "zendesk", x: 1140, y: 140 },
  { key: "google-drive", x: 1010, y: 290 },
  { key: "google-sheets", x: 1140, y: 290 },
];

export const TABLE = { x: 240, y: 462, w: 760, h: 150, radius: 18 };
export const TROW = { top: 36, pitch: 34, height: 26, dotX: 28 };
export const NEW_ROW_DOT: Pt = { x: TABLE.x + TROW.dotX, y: TABLE.y + TROW.top + TROW.height / 2 };

/* ---------- paths (lines run between centres; nodes and tiles draw on top) ---------- */
const BUS_X = 240;
export const EVENT_PATHS: Poly[] = EVENTS.map((e) =>
  e.y === N.start.y
    ? [{ x: e.x, y: e.y }, N.start]
    : [{ x: e.x, y: e.y }, { x: BUS_X, y: e.y }, { x: BUS_X, y: N.start.y }, N.start],
);

export const P = {
  startAgent: [N.start, N.agent] as Poly,
  agentBranch: [N.agent, N.branch] as Poly,
  branchPerson: [N.branch, { x: N.branch.x, y: N.person.y }, N.person] as Poly,
  personDone: [N.person, { x: N.done.x, y: N.person.y }, N.done] as Poly,
  auto: [N.branch, N.done] as Poly,
};

export const TOOL_PATHS: Poly[] = [
  [N.agent, { x: N.agent.x, y: BUS_Y }, { x: 1010, y: BUS_Y }, { x: 1010, y: 140 }],
  [N.agent, { x: N.agent.x, y: BUS_Y }, { x: 1140, y: BUS_Y }, { x: 1140, y: 140 }],
  [N.agent, { x: N.agent.x, y: BUS_Y }, { x: 920, y: BUS_Y }, { x: 920, y: 290 }, { x: 1010, y: 290 }],
  [N.agent, { x: N.agent.x, y: BUS_Y }, { x: 1215, y: BUS_Y }, { x: 1215, y: 290 }, { x: 1140, y: 290 }],
];

const bezierPoly = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, n = 40): Poly =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const u = 1 - t;
    return {
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    };
  });

/** A row change starts another process: from the new row's dot up into Start. */
export const ROW_TO_START: Poly = bezierPoly(
  NEW_ROW_DOT,
  { x: NEW_ROW_DOT.x, y: 420 },
  { x: N.start.x, y: 380 },
  N.start,
);

export const MAIN_LOOP: Poly = [
  N.start,
  N.agent,
  N.branch,
  { x: N.branch.x, y: N.person.y },
  N.person,
  { x: N.done.x, y: N.person.y },
  N.done,
];

/* ---------- polyline helpers ---------- */
const segLen = (a: Pt, b: Pt) => Math.hypot(b.x - a.x, b.y - a.y);
export const polyLen = (p: Poly) => p.slice(1).reduce((s, b, i) => s + segLen(p[i], b), 0);
export const pointAt = (p: Poly, t: number): Pt => {
  let d = Math.min(1, Math.max(0, t)) * polyLen(p);
  for (let i = 1; i < p.length; i++) {
    const l = segLen(p[i - 1], p[i]);
    if (d <= l || i === p.length - 1) {
      const k = l === 0 ? 0 : Math.min(1, d / l);
      return { x: p[i - 1].x + (p[i].x - p[i - 1].x) * k, y: p[i - 1].y + (p[i].y - p[i - 1].y) * k };
    }
    d -= l;
  }
  return p[p.length - 1];
};
export const toD = (p: Poly) => p.map((q, i) => `${i ? "L" : "M"} ${q.x} ${q.y}`).join(" ");
export const reversed = (p: Poly): Poly => [...p].reverse();

/* ---------- static layout validation (used by SafeAreaGuard) ---------- */
const box = (name: string, c: Pt, size: number, pad = 0): Rect => ({
  name,
  left: c.x - size / 2 - pad,
  right: c.x + size / 2 + pad,
  top: c.y - size / 2 - pad,
  bottom: c.y + size / 2 + pad,
});

export const solidRects = (pad = 0): Rect[] => [
  ...EVENTS.map((e) => box(`event:${e.key}`, e, TILE, pad)),
  box("node:start", N.start, NODE, pad),
  box("node:agent", N.agent, AGENT, pad),
  box("node:branch", N.branch, DIAMOND, pad),
  box("node:person", N.person, NODE, pad),
  box("node:done", N.done, NODE, pad),
  ...TOOLS.map((t) => box(`tool:${t.key}`, t, TILE, pad)),
  { name: "table", left: TABLE.x - pad, top: TABLE.y - pad, right: TABLE.x + TABLE.w + pad, bottom: TABLE.y + TABLE.h + pad },
];

const inside = (q: Pt, r: Rect) => q.x > r.left && q.x < r.right && q.y > r.top && q.y < r.bottom;
const overlaps = (a: Rect, b: Rect) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

/** Returns layout errors: overlapping solids, lines crossing solids they do not connect, anything off canvas. */
export const validateGeometry = (): string[] => {
  const errors: string[] = [];
  const rects = solidRects(4);
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (r.left < 0 || r.top < 0 || r.right > CANVAS.w || r.bottom > CANVAS.h) errors.push(`${r.name} is cut off at the canvas edge`);
    for (let j = i + 1; j < rects.length; j++) if (overlaps(r, rects[j])) errors.push(`${r.name} overlaps ${rects[j].name}`);
  }
  const lines: { name: string; poly: Poly }[] = [
    ...EVENT_PATHS.map((poly, i) => ({ name: `event line ${i}`, poly })),
    ...Object.entries(P).map(([name, poly]) => ({ name, poly })),
    ...TOOL_PATHS.map((poly, i) => ({ name: `tool line ${i}`, poly })),
  ];
  for (const { name, poly } of lines) {
    const ends = [poly[0], poly[poly.length - 1]];
    const L = polyLen(poly);
    for (let s = 0; s <= L; s += 2) {
      const q = pointAt(poly, s / L);
      for (const r of solidRects(3)) {
        if (!inside(q, r)) continue;
        if (ends.some((e) => inside(e, r))) continue; // the node or tile it connects
        errors.push(`${name} crosses ${r.name}`);
        return errors;
      }
    }
  }
  return errors;
};
