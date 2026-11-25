import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { CHAT_CPS, EASE, type OrbPaletteKey } from "../theme";
import { sceneById, sceneFrames } from "../timeline";
import { PLACEHOLDERS as P } from "../placeholders";
import { PlateBackground } from "../backgrounds/PlateBackground";
import { Cursor, type CursorKey } from "../components/Cursor";
import { GuardLayer } from "../components/GuardLayer";
import { FeatureTitle, featureTitleTiming, frameRiseStyle } from "../components/FeatureTitle";
import { ChatScreen } from "../components/chat/ChatScreen";
import { navY } from "../components/chat/Sidebar";
import { camAt, camTransform, FRAME_CENTRE, nat, PRODUCT_RECT, ProductWindow, type Cam, type CamKey } from "../components/chat/ProductWindow";
import { AgentsPage, slotRect, type CardData } from "../components/agents/AgentsPage";
import { CreateAgentPanel, PANEL, createButtonCentre, NEW_AGENT_FIELDS } from "../components/agents/CreateAgentPanel";
import { ControlRoomPage, CR_OFFSET, type ControlRoomState, type FigureRender, type OutputCard } from "../components/office/ControlRoomPage";
import { makeRoute, sampleRoutes, type Route } from "../components/office/motion";
import { AGENT_ORDER, proj, DESKS, FIGURE_H, plateAnchor, STANDING, type AgentKey, type AgentState, type BubbleLine, type OfficeState, type PedestalKey, type Pose } from "../components/office/Office";
import { typeDuration } from "../lib/typewriter";
import type { TextBeatSpec } from "../lib/guards";
import { chatStateAt, S3_ACTION_CHIP, S3_END_CAM, S3_KB_END } from "./Scene03Chat";
import { S2_PLATE } from "./Scene02Intro";
import { Pills, ramp, type Pill } from "./shared/stage";

const S = "S04" as const;
const DUR = sceneById(S).duration;
const S3 = sceneById("S03");
const S3_FRAMES = sceneFrames("S03");
export const S4_TITLE = "Give every agent a job";
const TITLE_START = 0.45;
const TT = featureTitleTiming(S4_TITLE);
/** Plate Ken Burns progress at the end of this scene (Scene 5 continues from here). */
export const S4_KB_END = S3_KB_END + 0.03;

/** Scene 4 beats, seconds from the scene start. 4A is 0 to 10s, 4B is 10 to 34s. */
export const S4 = {
  sinkEnd: 0.45,
  frameRise: TITLE_START + TT.frameRiseStart,
  /** The clicked chip in Scene 3 opens the Agents page: blur through while the frame sinks. */
  agentsPage: 0.05,
  clickTile: 4.35,
  panelOpen: 4.4,
  nameType: 4.85,
  handle: 5.05,
  roleType: 5.15,
  taskType: 5.5,
  clickCreate: 7.85,
  panelClose: 7.9,
  created: { nora: 8.05, theo: 8.6, owen: 9.2 } as Record<Exclude<AgentKey, "iris">, number>,
  // 4B (10 to 40s)
  clickControl: 10.3,
  controlPage: 10.35,
  hero: {
    iris: { appear: 11.0, appearLen: 0.5, wave: 3.0, morph: 1.1 },
    nora: { appear: 15.2, appearLen: 0.4, wave: 1.8, morph: 0.9 },
    theo: { appear: 17.9, appearLen: 0.4, wave: 1.8, morph: 0.9 },
    owen: { appear: 20.6, appearLen: 0.4, wave: 1.8, morph: 0.9 },
  } as Record<AgentKey, { appear: number; appearLen: number; wave: number; morph: number }>,
  claim: 24.1,
  pickup: 24.6,
  walkStart: 25.6,
  handoff: 27.3,
  resultsAt: 34.0,
  done: 34.4,
  mini: 35.0,
  outputs: [36.3, 36.9, 37.5],
  citeClick: 39.3,
};
/** About four wave cycles in Iris's 3.0s wave. */
const WAVE_HZ = 4 / 3;
const heroEnd = (k: AgentKey) => {
  const h = S4.hero[k];
  return h.appear + h.appearLen + h.wave + h.morph;
};
const morphStart = (k: AgentKey) => heroEnd(k) - S4.hero[k].morph;

const PALETTE: Record<AgentKey, OrbPaletteKey> = { iris: "iris", nora: "nora", theo: "theo", owen: "owen" };
const ROLE: Record<AgentKey, string> = { iris: P.agents.frontDesk.role, nora: P.agents.intake.role, theo: P.agents.policy.role, owen: P.agents.evidence.role };
const NAME: Record<AgentKey, string> = { iris: "Iris", nora: "Nora", theo: "Theo", owen: "Owen" };

// ---------- Walking: constant speed routes on the isometric grid (see office/motion.ts) ----------
const HOME: Record<AgentKey, [number, number]> = { iris: DESKS.iris.feet, nora: DESKS.nora.feet, theo: DESKS.theo.feet, owen: DESKS.owen.feet };
const STAND = { gmail: [558, 118] as [number, number], drive: [653, 118] as [number, number], sheets: [548, 284] as [number, number] };
const HANDOFF: [number, number] = [330, 60];
const irisOut = makeRoute(S4.walkStart, [HOME.iris, HANDOFF]);
const irisBack = makeRoute(S4.handoff + 0.3, [HANDOFF, HOME.iris]);
const noraOut = makeRoute(S4.handoff + 0.4, [HOME.nora, [558, 60], STAND.gmail]);
const theoOut = makeRoute(26.6, [HOME.theo, [175, 300], [653, 300], STAND.drive]);
const owenOut = makeRoute(30.0, [HOME.owen, [415, 300], [548, 300], STAND.sheets]);
export const ROUTES: Record<AgentKey, Route[]> = { iris: [irisOut, irisBack], nora: [noraOut], theo: [theoOut], owen: [owenOut] };
/** Arrival time of each agent at its tool. */
const ARRIVE = { nora: noraOut.t1, theo: theoOut.t1, owen: owenOut.t1 };

// ---------- Thought bubbles ----------
type BubbleSpec = { at: number; until: number; lines: { text: string; flag?: boolean }[] };
export const BUBBLES: Partial<Record<AgentKey, BubbleSpec>> = {
  nora: { at: ARRIVE.nora + 0.05, until: ARRIVE.nora + 2.2, lines: P.controlRoom.bubbles.nora.map((text) => ({ text })) },
  theo: { at: ARRIVE.theo + 0.05, until: Math.min(S4.resultsAt - 0.1, ARRIVE.theo + 2.2), lines: P.controlRoom.bubbles.theo.map((text) => ({ text })) },
  owen: { at: ARRIVE.owen + 0.05, until: Math.min(S4.resultsAt - 0.05, ARRIVE.owen + 2.3), lines: P.controlRoom.bubbles.owen.map((text, i) => ({ text, flag: i === 2 })) },
};
const LINE_GAP = 0.3;
const TICK_AFTER = 0.3;
const bubbleAt = (k: AgentKey, t: number) => {
  const b = BUBBLES[k];
  if (!b) return undefined;
  const opacity = EASE(ramp(t, b.at - 0.1, b.at + 0.15)) * (1 - EASE(ramp(t, b.until, b.until + 0.25)));
  if (opacity <= 0) return undefined;
  const lines: BubbleLine[] = b.lines.map((l, i) => {
    const a = b.at + i * LINE_GAP;
    return { text: l.text, flag: l.flag, appear: EASE(ramp(t, a, a + 0.2)), tick: EASE(ramp(t, a + TICK_AFTER, a + TICK_AFTER + 0.15)) };
  });
  return { lines, opacity };
};

const PEDESTAL_OF: Partial<Record<AgentKey, PedestalKey>> = { nora: "gmail", theo: "drive", owen: "sheets" };

/** When each agent starts its task (plate status changes). */
const STARTS: Record<AgentKey, number> = { iris: S4.handoff, nora: noraOut.t0, theo: theoOut.t0, owen: owenOut.t0 };
/** Plate status of an agent at time t. */
const statusAt = (k: AgentKey, t: number) => {
  if (t >= S4.done) return "Done";
  if (k === "iris") return t >= S4.handoff ? "Passed to Nora" : P.controlRoom.irisStatusIdle;
  const i = (["nora", "theo", "owen"] as const).indexOf(k);
  return t >= STARTS[k] ? P.controlRoom.statuses[i] : "Idle";
};

const OUTPUTS = P.controlRoom.outputs;

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
/** Product scale: screen px per page px. */
const PX = 1728 / 1875;

/** Is any agent in its hero (appear, wave or morph) at time t? */
const heroActive = (t: number) => AGENT_ORDER.some((k) => t >= S4.hero[k].appear && t < heroEnd(k));
/** Room dim: up as Iris appears, down during Owen's morph. */
const dimAt = (t: number) => EASE(ramp(t, S4.hero.iris.appear - 0.1, S4.hero.iris.appear + 0.3)) * (1 - EASE(ramp(t, morphStart("owen"), heroEnd("owen"))));

/**
 * The one path function for an agent: feet point (page px), scale and opacity
 * at time t. Hero: rises in the centre, waves, then the same element morphs to
 * its desk. After that: the walking routes.
 */
export const figurePath = (k: AgentKey, t: number) => {
  const h = S4.hero[k];
  const big = k === "iris";
  const S = (big ? 620 : 360) / (FIGURE_H * PX);
  const start = { x: big ? 560 : 610, y: (big ? 395 : 400) + (FIGURE_H * S) / 2 };
  const walk = sampleRoutes(HOME[k], ROUTES[k], t);
  const room = proj(walk.pos[0], walk.pos[1]);
  const appear = EASE(ramp(t, h.appear, h.appear + h.appearLen));
  const m = EASE(ramp(t, morphStart(k), heroEnd(k)));
  const inHero = t < heroEnd(k);
  const x = inHero ? lerp(start.x, room.x, m) : room.x;
  const y = inHero ? lerp(start.y + (1 - appear) * 40, room.y, m) : room.y;
  const scale = inHero ? Math.pow(S, 1 - m) : 1;
  return { x, y, scale, opacity: t < h.appear ? 0 : appear, inHero, m, S, start, big, walk, appear };
};

/** Control Room state for 4B at scene time t. Scene 5 uses this with t = DUR to open on the same frame. */
export const controlRoomStateAt = (t: number, clock: number, camZoom = 1): ControlRoomState => {
  const dim = dimAt(t);
  const anyHero = heroActive(t);
  const figures: FigureRender[] = AGENT_ORDER.map((k, i) => {
    const h = S4.hero[k];
    const f = figurePath(k, t);
    const waveStart = h.appear + h.appearLen;
    const carry = (k === "iris" && t >= S4.pickup + 0.3 && t < S4.handoff) || (k === "nora" && t >= S4.handoff);
    const pose: Pose = {
      ...STANDING,
      wave: f.inHero ? t - waveStart : -1,
      waveLen: h.wave,
      waveHz: WAVE_HZ,
      walk: f.walk.stride > 0.001 ? f.walk.phase : null,
      stride: f.walk.stride,
      carry,
      breathe: Math.sin((t + clock) * 1.6 + i),
    };
    // Own dim: placed agents dim with the room; a hero is never dimmed and blends in over the end of its morph.
    const placed = f.inHero ? EASE(ramp(t, morphStart(k) + 0.6 * h.morph, heroEnd(k))) : 1;
    const ownDim = dim * placed;
    // Plate: follows the same path parameter from beside the hero to its desk anchor.
    const an = plateAnchor(k);
    const plateScaleHero = f.big ? 2.6 : 1.8;
    const pStart = { x: f.start.x + (f.big ? 340 : 240), y: f.start.y - FIGURE_H * f.S * (f.big ? 0.62 : 0.6) };
    const plateX = f.inHero ? lerp(pStart.x, an.x, f.m) : an.x;
    const plateY = f.inHero ? lerp(pStart.y + (1 - f.appear) * 40, an.y, f.m) : an.y;
    const plateScale = f.inHero ? Math.pow(plateScaleHero, 1 - f.m) : 1;
    // While any hero is on screen, every other plate and speech element is hidden.
    const isHeroNow = t >= h.appear && t < heroEnd(k);
    const hideOthers = anyHero && !isHeroNow ? 1 : 0;
    const plateOpacity = f.opacity * (1 - hideOthers);
    const statusChange = STARTS[k];
    const pulse = Math.max(Math.sin(Math.PI * ramp(t, statusChange, statusChange + 0.6)), Math.sin(Math.PI * ramp(t, S4.done, S4.done + 0.6)));
    return {
      k,
      name: NAME[k],
      palette: PALETTE[k],
      x: f.x,
      y: f.y,
      scale: f.scale,
      opacity: f.opacity,
      zIndex: isHeroNow ? 1000 + i : Math.round(f.y),
      dim: ownDim,
      facings: f.walk.facings,
      pose,
      plate: { x: plateX, y: plateY, scale: plateScale, opacity: plateOpacity, state: { role: ROLE[k], status: statusAt(k, t), pulse, opacity: 1 }, read: !isHeroNow },
      bubble: anyHero ? undefined : bubbleAt(k, t),
      morphing: isHeroNow,
    };
  });
  // The office keeps agent positions for the claim tag and the result cards.
  const agents = Object.fromEntries(
    AGENT_ORDER.map((k) => {
      const w = sampleRoutes(HOME[k], ROUTES[k], t);
      const st: AgentState = { pos: w.pos, visible: t >= heroEnd(k), pose: STANDING, plate: { role: ROLE[k], status: statusAt(k, t), pulse: 0, opacity: 0 }, plateVisible: false };
      return [k, st];
    }),
  ) as Record<AgentKey, AgentState>;
  const pedestalPulse: Partial<Record<PedestalKey, number>> = {};
  (Object.keys(PEDESTAL_OF) as AgentKey[]).forEach((k) => {
    const b = BUBBLES[k]!;
    pedestalPulse[PEDESTAL_OF[k]!] = ramp(t, b.at - 0.1, b.at + 0.9);
  });
  const office: OfficeState = {
    agents,
    names: NAME,
    palettes: PALETTE,
    pedestalPulse,
    claim: EASE(ramp(t, S4.claim, S4.claim + 0.4)),
    pickup: EASE(ramp(t, S4.pickup, S4.pickup + 0.4)),
    results: ramp(t, S4.resultsAt, S4.resultsAt + 0.8),
    clock,
  };
  const outputs: OutputCard[] = OUTPUTS.map((o, i) => ({
    agent: NAME[o.agent as AgentKey],
    role: ROLE[o.agent as AgentKey],
    palette: PALETTE[o.agent as AgentKey],
    text: o.text,
    flag: o.flag,
    cites: o.agent === "theo" ? ["S1", "S2"] : undefined,
    citeActive: o.agent === "theo" ? EASE(ramp(t, S4.citeClick, S4.citeClick + 0.25)) : 0,
    appear: EASE(ramp(t, S4.outputs[i], S4.outputs[i] + 0.5)),
  }));
  return {
    office,
    dim,
    figures,
    camZoom,
    agents: AGENT_ORDER.filter((k) => t >= S4.hero[k].appear).length,
    activeTasks: t >= S4.pickup ? 1 : 0,
    irisMessage: anyHero ? 0 : EASE(ramp(t, S4.pickup + 0.4, S4.pickup + 0.8)),
    mini: SMOOTH(ramp(t, S4.mini, S4.mini + 1.3)),
    outputs,
    clock,
  };
};

// ---------- Camera ----------
const cr = (x: number, y: number) => nat(x + CR_OFFSET.x, y + CR_OFFSET.y);
const panelCentre = nat(PANEL.x + PANEL.w / 2, PANEL.y + PANEL.h / 2);
const gridCentre = nat(1071, 400);

export const S4_CAM_KEYS: CamKey[] = [
  { t: 0, c: S3_END_CAM },
  { t: S4.sinkEnd, c: { x: S3_END_CAM.x + 5.8, y: S3_END_CAM.y + 1.8, z: S3_END_CAM.z }, lin: true },
  { t: 1.6, c: { ...FRAME_CENTRE, z: 1 } },
  { t: S4.panelOpen, c: { x: FRAME_CENTRE.x + 4, y: FRAME_CENTRE.y + 2, z: 1.008 }, lin: true },
  { t: S4.panelOpen + 0.5, c: { ...panelCentre, z: 1.3 } },
  { t: S4.panelClose, c: { x: panelCentre.x + 6, y: panelCentre.y + 4, z: 1.31 }, lin: true },
  { t: S4.panelClose + 0.6, c: { ...gridCentre, z: 1.35 } },
  { t: 10.0, c: { x: gridCentre.x + 14, y: gridCentre.y + 6, z: 1.36 }, lin: true },
  { t: 10.45, c: { ...FRAME_CENTRE, z: 1 } },
  { t: 24.8, c: { x: FRAME_CENTRE.x + 8, y: FRAME_CENTRE.y + 3, z: 1.016 }, lin: true },
  { t: 35.0, c: { x: FRAME_CENTRE.x + 8, y: FRAME_CENTRE.y + 3, z: 1.016 } },
  { t: S4.outputs[0], c: { x: FRAME_CENTRE.x, y: FRAME_CENTRE.y + 1, z: 1.004 }, lin: true },
  { t: DUR, c: { x: FRAME_CENTRE.x, y: FRAME_CENTRE.y + 4, z: 1.01 }, lin: true },
];
const FOLLOW = { in0: 24.8, in1: 26.2, out0: 33.6, out1: 35.0, z: 1.5 };
/** Symmetric ease (zero speed at both ends) for camera blends, so the camera never jumps. */
const SMOOTH = (x: number) => x * x * (3 - 2 * x);
/** Whom the camera follows, and when the focus hands over (blended over 1.2s, zero speed at both ends). */
const FOCUS_ORDER: AgentKey[] = ["iris", "nora", "theo", "owen"];
const FOCUS_SWITCH = [S4.handoff + 0.2, ARRIVE.nora + 1.0, ARRIVE.theo];
const followFocus = (t: number) => {
  let x = 0;
  let y = 0;
  let wsum = 0;
  FOCUS_ORDER.forEach((k, i) => {
    const on = i === 0 ? 1 : SMOOTH(ramp(t, FOCUS_SWITCH[i - 1] - 0.6, FOCUS_SWITCH[i - 1] + 0.6));
    const off = i === FOCUS_ORDER.length - 1 ? 0 : SMOOTH(ramp(t, FOCUS_SWITCH[i] - 0.6, FOCUS_SWITCH[i] + 0.6));
    const w = on * (1 - off);
    if (w <= 0) return;
    const f = figurePath(k, t);
    const q = cr(f.x, f.y - 70);
    x += q.x * w;
    y += q.y * w;
    wsum += w;
  });
  return { x: x / wsum, y: y / wsum };
};
export const s4CamAt = (t: number): Cam => {
  const base = camAt(S4_CAM_KEYS, t, EASE);
  const w = SMOOTH(ramp(t, FOLLOW.in0, FOLLOW.in1)) * (1 - SMOOTH(ramp(t, FOLLOW.out0, FOLLOW.out1)));
  if (w <= 0) return base;
  const f = followFocus(t);
  // A slow creep while following, so the frame never holds still.
  const creep = ramp(t, FOLLOW.in0, FOLLOW.out1);
  return { x: base.x + (f.x + 14 * creep - base.x) * w, y: base.y + (f.y + 4 * creep - base.y) * w, z: base.z + (FOLLOW.z + 0.035 * creep - base.z) * w };
};
export const S4_END_CAM = s4CamAt(DUR);

/** The [S1] chip in Theo's result card (native px), measured from the rendered page. */
export const S4_CITE_NATIVE = { x: 1291, y: 396 };
export const S4_CITE = nat(S4_CITE_NATIVE.x, S4_CITE_NATIVE.y);
const slotCentre = (i: number) => {
  const r = slotRect(i);
  return nat(r.x + r.w / 2, r.y + r.h / 2);
};
export const S4_CURSOR: CursorKey[] = [
  { ...nat(1350, 700), t: 3.4 },
  { ...slotCentre(1), t: S4.clickTile - 0.05 },
  { ...slotCentre(1), t: S4.clickTile, click: true },
  { ...nat(createButtonCentre().x, createButtonCentre().y), t: S4.clickCreate - 0.05 },
  { ...nat(createButtonCentre().x, createButtonCentre().y), t: S4.clickCreate, click: true },
  { ...nat(createButtonCentre().x, createButtonCentre().y - 60), t: 10.0 },
  { ...nat(85, navY("control")), t: S4.clickControl - 0.05 },
  { ...nat(85, navY("control")), t: S4.clickControl, click: true },
  { ...nat(160, 600), t: S4.clickControl + 1.0 },
  { ...nat(1500, 760), t: S4.citeClick - 1.2 },
  { ...S4_CITE, t: S4.citeClick - 0.05 },
  { ...S4_CITE, t: S4.citeClick, click: true },
];

const TEAM_CARD = (k: Exclude<AgentKey, "iris">): CardData => {
  const a = P.agentsPage.team.find((x) => x.name === NAME[k])!;
  return { name: a.name, handle: a.handle, role: a.role, palette: PALETTE[k], line: P.agentAccessLine, badges: [{ label: "Idle", tone: "grey" }] };
};
const IRIS_CARD: CardData = {
  name: P.agentsPage.iris.name,
  handle: P.agentsPage.iris.handle,
  role: P.agentsPage.iris.role,
  palette: "iris",
  badges: [
    { label: P.agentsPage.iris.state, tone: "grey" },
    { label: P.agentsPage.iris.badge, tone: "olive" },
  ],
};

export const S4_PILLS: Pill[] = [
  { label: P.controlRoom.pills[0], at: 10.5, until: heroEnd("owen") },
  { label: P.controlRoom.pills[1], at: S4.claim, until: S4.walkStart + 1.0, spin: true },
  { label: P.controlRoom.pills[2], at: S4.walkStart + 1.0, until: S4.resultsAt, spin: true },
  { label: P.controlRoom.pills[3], at: 37.8, until: 999 },
];

export const SCENE04_TEXT: TextBeatSpec[] = [
  { id: "title", text: S4_TITLE, readyAt: TITLE_START, leaveAt: TITLE_START + TT.exitStart, fontPx: 88 },
  {
    id: "panel",
    text: `${NEW_AGENT_FIELDS.name} ${NEW_AGENT_FIELDS.role} ${NEW_AGENT_FIELDS.taskLines.join(" ")}`,
    readyAt: S4.taskType + typeDuration(NEW_AGENT_FIELDS.taskLines.join("\n"), CHAT_CPS, "panel-task"),
    leaveAt: S4.panelClose,
    fontPx: 20,
    ui: true,
    exception: "Brief: the panel is filled and created between 4.0s and 8.0s",
  },
  ...S4_PILLS.map((p) => ({ id: `pill-${p.label}`, text: p.label, readyAt: p.at + 0.3, leaveAt: Math.min(p.until, DUR), fontPx: 28, carriesOver: p.until > DUR })),
  // Each thought bubble line holds at least 0.9s (a word count rule would ask for more; the brief sets 0.9s).
  ...(Object.keys(BUBBLES) as AgentKey[]).flatMap((k) =>
    BUBBLES[k]!.lines.map((l, i) => ({
      id: `bubble-${k}-${i + 1}`,
      text: l.text,
      readyAt: BUBBLES[k]!.at + i * LINE_GAP + 0.2,
      leaveAt: BUBBLES[k]!.until,
      fontPx: 22,
      ui: true,
      exception: "Brief: each bubble line holds at least 0.9s",
    })),
  ),
  ...OUTPUTS.map((o, i) => ({ id: `output-${i + 1}`, text: `${o.text} ${o.flag ?? ""}`, readyAt: S4.outputs[i] + 0.5, leaveAt: DUR, fontPx: 21, ui: true, carriesOver: true })),
];
/** Bubble line hold times, for the check: every line must stay at least 0.9s. */
export const BUBBLE_HOLDS = (Object.keys(BUBBLES) as AgentKey[]).flatMap((k) =>
  BUBBLES[k]!.lines.map((l, i) => ({ agent: k, text: l.text, hold: BUBBLES[k]!.until - (BUBBLES[k]!.at + i * LINE_GAP + 0.2) })),
);

export const Scene04Agents: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const F = (s: number) => Math.round(s * fps);
  const clock = sceneById(S).start;

  const sink = EASE(ramp(t, 0, S4.sinkEnd));
  const rise = EASE(ramp(t, S4.frameRise, S4.frameRise + 0.9));
  const frameStyle: React.CSSProperties =
    t < S4.sinkEnd + 0.01 ? { opacity: 1 - sink, transform: `translateY(${40 * sink}px) scale(${1 - 0.06 * sink})`, transformOrigin: "50% 50%" } : frameRiseStyle(rise);

  const chat = chatStateAt(S3_FRAMES, fps, -S3_FRAMES);
  chat.clock = S3.start + S3.duration;
  const toAgents = EASE(ramp(t, S4.agentsPage, S4.agentsPage + 0.4));
  const toControl = EASE(ramp(t, S4.controlPage, S4.controlPage + 0.6));
  const blurThrough = (p: number) => Math.sin(Math.PI * p) * 10;

  const panelOpen = EASE(ramp(t, S4.panelOpen, S4.panelOpen + 0.3)) * (1 - EASE(ramp(t, S4.panelClose, S4.panelClose + 0.25)));
  const created = (k: Exclude<AgentKey, "iris">) => EASE(ramp(t, S4.created[k], S4.created[k] + 0.4));
  const team = ["nora", "theo", "owen"] as const;
  const doneCount = team.filter((k) => t >= S4.created[k]).length;
  const lastCreated = doneCount > 0 ? S4.created[team[doneCount - 1]] : -1;

  const cam = s4CamAt(t);
  const cursorO = EASE(ramp(t, 3.4, 3.7)) * (1 - EASE(ramp(t, S4.clickControl + 0.5, S4.clickControl + 1.0))) + EASE(ramp(t, S4.citeClick - 1.5, S4.citeClick - 1.2));

  return (
    <AbsoluteFill style={{ width: 1920, height: 1080 }}>
      <PlateBackground plate="02" duration={F(DUR)} kbFrom={S3_KB_END} kbTo={S4_KB_END} timeOffset={sceneById("S02").duration + S3.duration} {...S2_PLATE} />
      <FeatureTitle text={S4_TITLE} startFrame={F(TITLE_START)} />
      {sink < 1 || rise > 0 ? (
        <AbsoluteFill style={{ transform: camTransform(cam), transformOrigin: "0 0" }}>
          <div style={{ position: "absolute", left: PRODUCT_RECT.x, top: PRODUCT_RECT.y, width: PRODUCT_RECT.w, height: PRODUCT_RECT.h, ...frameStyle }}>
            <ProductWindow>
              {toAgents < 1 ? (
                <div style={{ position: "absolute", inset: 0, opacity: 1 - toAgents, filter: toAgents > 0 ? `blur(${blurThrough(toAgents)}px)` : undefined }}>
                  <ChatScreen s={chat} />
                </div>
              ) : null}
              {toAgents > 0 && toControl < 1 ? (
                <div style={{ position: "absolute", inset: 0, opacity: toAgents * (1 - toControl), filter: toAgents < 1 || toControl > 0 ? `blur(${blurThrough(toAgents < 1 ? toAgents : toControl)}px)` : undefined }}>
                  <AgentsPage
                    s={{
                      cards: [{ d: IRIS_CARD, slot: 0, appear: 1 }, ...team.map((k, i) => ({ d: TEAM_CARD(k), slot: i + 1, appear: created(k) }))],
                      tileSlot: 1 + doneCount,
                      tileOpacity: lastCreated < 0 ? 1 : EASE(ramp(t, lastCreated + 0.15, lastCreated + 0.45)),
                      tilePressed: Math.max(0, 1 - Math.abs(t - S4.clickTile) / 0.15),
                      clock,
                    }}
                  />
                  <CreateAgentPanel
                    s={{
                      open: panelOpen,
                      nameStart: F(S4.nameType),
                      roleStart: F(S4.roleType),
                      taskStart: F(S4.taskType),
                      handle: EASE(ramp(t, S4.handle, S4.handle + 0.3)),
                      createPressed: Math.max(0, 1 - Math.abs(t - S4.clickCreate) / 0.15),
                      clock,
                    }}
                  />
                </div>
              ) : null}
              {toControl > 0 ? (
                <div style={{ position: "absolute", inset: 0, opacity: toControl, filter: toControl < 1 ? `blur(${blurThrough(toControl)}px)` : undefined }}>
                  <ControlRoomPage s={controlRoomStateAt(t, clock, cam.z)} />
                </div>
              ) : null}
            </ProductWindow>
          </div>
          {1 - sink > 0 ? <Cursor keys={[{ ...S3_ACTION_CHIP, t: -1 }]} opacity={1 - sink} /> : null}
          {cursorO > 0 ? <Cursor keys={S4_CURSOR} opacity={cursorO} /> : null}
        </AbsoluteFill>
      ) : null}
      <Pills t={t} pills={S4_PILLS} />
      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};
