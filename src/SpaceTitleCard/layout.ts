// Stage local layout (px). The stage is 1480 x 780, centred in the 1920 x 1080 frame.
export type Pt = { x: number; y: number };
export type Poly = Pt[];
export type Box = { x: number; y: number; w: number; h: number };

export const STAGE = { w: 1480, h: 780, radius: 36, left: (1920 - 1480) / 2, top: (1080 - 780) / 2 };
export const CARD_RADIUS = 24;
export const PAD = 22;

// Left column x 80 to 520
export const REQUEST: Box = { x: 80, y: 130, w: 440, h: 150 };
export const BRAIN: Box = { x: 80, y: 320, w: 440, h: 330 };
// Middle column x 560 to 980
export const TEAM_LABEL: Box = { x: 590, y: 119, w: 360, h: 26 };
export const LEAD: Box = { x: 590, y: 155, w: 360, h: 96 };
export const INVOICE: Box = { x: 570, y: 291, w: 400, h: 170 };
export const POLICY: Box = { x: 570, y: 491, w: 400, h: 170 };
// Right column x 1020 to 1400
export const TABLE: Box = { x: 1020, y: 67, w: 380, h: 320 };
export const DELIVERY: Box = { x: 1020, y: 397, w: 380, h: 56 };
export const REVIEW: Box = { x: 1020, y: 463, w: 380, h: 250 };

export const TABLE_COLS = { vendor: PAD, amount: 158, status: 240 };
export const COL_W = { vendor: 130, amount: 76, status: 118 };
export const TABLE_ROW = { top: 104, pitch: 58, h: 46 };
export const rowCentreY = (k: number) => TABLE.y + TABLE_ROW.top + k * TABLE_ROW.pitch + TABLE_ROW.h / 2;

// Review card inner layout
export const REVIEW_LINE: Box = { x: REVIEW.x + PAD, y: REVIEW.y + 74, w: REVIEW.w - 2 * PAD, h: 46 };
export const APPROVE_BTN: Box = { x: REVIEW.x + PAD, y: REVIEW.y + 164, w: 160, h: 58 };
export const REJECT_BTN: Box = { x: REVIEW.x + PAD + 176, y: REVIEW.y + 164, w: 160, h: 58 };

/* ---------- connecting lines (they only touch the cards they connect) ---------- */
export const LINES: Record<"req" | "inv" | "pol" | "brain", Poly> = {
  req: [{ x: REQUEST.x + REQUEST.w, y: 203 }, { x: LEAD.x, y: 203 }],
  inv: [{ x: 770, y: LEAD.y + LEAD.h }, { x: 770, y: INVOICE.y }],
  pol: [
    { x: LEAD.x + LEAD.w, y: 203 },
    { x: 995, y: 203 },
    { x: 995, y: POLICY.y + 85 },
    { x: POLICY.x + POLICY.w, y: POLICY.y + 85 },
  ],
  brain: [{ x: POLICY.x, y: POLICY.y + 110 }, { x: BRAIN.x + BRAIN.w, y: POLICY.y + 110 }],
};

/** Data pulses fly through the gutter from an agent into a table row (no drawn line). */
export const dataPath = (from: "inv" | "pol", row: number): Poly => {
  const a = from === "inv" ? { x: INVOICE.x + INVOICE.w, y: INVOICE.y + 130 } : { x: POLICY.x + POLICY.w, y: POLICY.y + 130 };
  const b = { x: TABLE.x + 10, y: rowCentreY(row) };
  return bezier(a, { x: a.x + 40, y: a.y }, { x: b.x - 40, y: b.y }, b);
};

export const bezier = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, n = 36): Poly =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const u = 1 - t;
    return {
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    };
  });

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

/* ---------- static layout validation ---------- */
const named: [string, Box][] = [
  ["Request", REQUEST], ["Company Brain", BRAIN], ["Agent team label", TEAM_LABEL], ["Space pill", LEAD],
  ["Invoice Agent", INVOICE], ["Policy Agent", POLICY], ["Table", TABLE], ["Delivery chip", DELIVERY], ["Review", REVIEW],
];
const inside = (q: Pt, b: Box, pad: number) => q.x > b.x - pad && q.x < b.x + b.w + pad && q.y > b.y - pad && q.y < b.y + b.h + pad;

export const validateLayout = (): string[] => {
  const errors: string[] = [];
  for (let i = 0; i < named.length; i++) {
    const [n, b] = named[i];
    if (b.x < 0 || b.y < 0 || b.x + b.w > STAGE.w || b.y + b.h > STAGE.h) errors.push(`${n} leaves the stage`);
    for (let j = i + 1; j < named.length; j++) {
      const [m, c] = named[j];
      if (b.x < c.x + c.w && c.x < b.x + b.w && b.y < c.y + c.h && c.y < b.y + b.h) errors.push(`${n} overlaps ${m}`);
    }
  }
  for (const [name, poly] of Object.entries(LINES)) {
    const L = polyLen(poly);
    const ends = [poly[0], poly[poly.length - 1]];
    for (let s = 1; s < L; s += 2) {
      const q = pointAt(poly, s / L);
      for (const [n, b] of named) {
        if (!inside(q, b, -1)) continue;
        if (ends.some((e) => inside(e, b, 1))) continue;
        errors.push(`line ${name} crosses ${n}`);
        return errors;
      }
    }
  }
  return errors;
};
