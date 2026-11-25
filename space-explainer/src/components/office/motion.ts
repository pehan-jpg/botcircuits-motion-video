/**
 * Walking on the isometric grid: axis aligned routes in room (world)
 * coordinates, constant speed with an eased start and stop, a continuous step
 * phase and facing chosen per segment with a 0.2s cross fade at every corner.
 * Everything is a pure function of time, so a frame never depends on another.
 */
import { proj } from "./Office";

/** 140 screen px per second at 1x camera, in page px (product scale 1728 / 1875). */
export const WALK_SPEED = 140 / (1728 / 1875);
/** Seconds to reach full speed, and to stop. */
export const WALK_RAMP = 0.3;
/** Page px per full step cycle (two steps). */
export const STRIDE = 46;
/** Facing cross fade at a corner, seconds. */
export const TURN = 0.2;

export type Facing = { facing: "front" | "back"; mirror: boolean };
export const FRONT: Facing = { facing: "front", mirror: false };

type Seg = { from: [number, number]; to: [number, number]; len: number; s0: number; facing: Facing };
export type Route = { t0: number; t1: number; total: number; segs: Seg[] };

const pageDist = (a: [number, number], b: [number, number]) => {
  const p = proj(a[0], a[1]);
  const q = proj(b[0], b[1]);
  return Math.hypot(q.x - p.x, q.y - p.y);
};

/** Facing for a move along a world axis: +x faces front right, -x and +y face front left, -y shows the back. */
export const facingFor = (dx: number, dy: number): Facing => {
  if (Math.abs(dx) >= Math.abs(dy)) return { facing: "front", mirror: dx < 0 };
  return dy > 0 ? { facing: "front", mirror: true } : { facing: "back", mirror: false };
};

/** Duration of a walk of length L with a trapezoid speed profile. */
export const walkDuration = (L: number) => L / WALK_SPEED + WALK_RAMP;

/** Distance covered after t seconds of a walk of length L (continuous speed, eased start and stop). */
const distAt = (t: number, L: number) => {
  const v = WALK_SPEED;
  const a = WALK_RAMP;
  const T = walkDuration(L);
  if (t <= 0) return 0;
  if (t >= T) return L;
  if (t < a) return (v * t * t) / (2 * a);
  if (t > T - a) return L - (v * (T - t) * (T - t)) / (2 * a);
  return (v * a) / 2 + v * (t - a);
};

/** A route through axis aligned waypoints, starting at t0. */
export const makeRoute = (t0: number, pts: [number, number][]): Route => {
  let s = 0;
  const segs: Seg[] = [];
  for (let i = 1; i < pts.length; i++) {
    const len = pageDist(pts[i - 1], pts[i]);
    segs.push({ from: pts[i - 1], to: pts[i], len, s0: s, facing: facingFor(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) });
    s += len;
  }
  return { t0, t1: t0 + walkDuration(s), total: s, segs };
};

/** Time at which a route reaches distance s (inverse of distAt). */
const timeAtDist = (r: Route, s: number) => {
  let lo = r.t0;
  let hi = r.t1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (distAt(mid - r.t0, r.total) < s) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};

export type WalkSample = {
  pos: [number, number];
  /** Step phase in radians, continuous along the route. */
  phase: number;
  /** 0 standing to 1 at full speed: scales the leg and arm swing. */
  stride: number;
  /** One or two facings with weights summing to 1 (a cross fade during a turn). */
  facings: { f: Facing; w: number }[];
  moving: boolean;
};

/**
 * Sample an agent's routes at time t. Before the first route the agent stands
 * at `home` facing front; between routes it keeps its last facing; after the
 * last route it turns back to front.
 */
export const sampleRoutes = (home: [number, number], routes: Route[], t: number): WalkSample => {
  // Timeline of facing changes: (time, facing).
  const changes: { t: number; f: Facing }[] = [{ t: -Infinity, f: FRONT }];
  for (const r of routes) {
    r.segs.forEach((sg, i) => {
      const at = i === 0 ? r.t0 + TURN / 2 : timeAtDist(r, sg.s0);
      changes.push({ t: at, f: sg.facing });
    });
  }
  const last = routes[routes.length - 1];
  if (last) changes.push({ t: last.t1 + TURN / 2, f: FRONT });
  // Facing cross fade centred on each change time.
  let facings: { f: Facing; w: number }[] = [{ f: FRONT, w: 1 }];
  for (let i = 1; i < changes.length; i++) {
    const c = changes[i];
    if (t < c.t - TURN / 2) break;
    const prev = changes[i - 1].f;
    const w = Math.min(1, Math.max(0, (t - (c.t - TURN / 2)) / TURN));
    const same = prev.facing === c.f.facing && prev.mirror === c.f.mirror;
    facings = w >= 1 || same ? [{ f: c.f, w: 1 }] : [{ f: prev, w: 1 - w }, { f: c.f, w }];
  }
  // Position.
  let pos: [number, number] = home;
  let phase = 0;
  let stride = 0;
  let moving = false;
  let travelled = 0;
  for (const r of routes) {
    if (t < r.t0) break;
    const s = distAt(t - r.t0, r.total);
    const seg = r.segs.find((sg) => s <= sg.s0 + sg.len + 1e-6) ?? r.segs[r.segs.length - 1];
    const p = seg.len > 0 ? Math.min(1, Math.max(0, (s - seg.s0) / seg.len)) : 1;
    pos = [seg.from[0] + (seg.to[0] - seg.from[0]) * p, seg.from[1] + (seg.to[1] - seg.from[1]) * p];
    phase = ((travelled + s) / STRIDE) * Math.PI * 2;
    // Speed relative to cruise, from the profile's derivative.
    const dt = 1 / 120;
    const v = (distAt(t - r.t0 + dt, r.total) - distAt(t - r.t0 - dt, r.total)) / (2 * dt);
    stride = Math.min(1, Math.max(0, v / WALK_SPEED));
    moving = t < r.t1;
    travelled += r.total;
    if (t < r.t1) break;
  }
  return { pos, phase, stride, facings, moving };
};
