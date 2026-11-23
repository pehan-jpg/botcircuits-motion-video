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
import { CreateAgentPanel, PANEL, createButtonCentre, swatchCentre, NEW_AGENT_FIELDS } from "../components/agents/CreateAgentPanel";
import { ControlRoomPage, CR_OFFSET, type ControlRoomState, type Hero, type OutputCard } from "../components/office/ControlRoomPage";
import { AGENT_ORDER, proj, DESKS, STANDING, type AgentKey, type AgentState, type BubbleLine, type OfficeState, type PedestalKey, type Pose } from "../components/office/Office";
import { typeDuration } from "../lib/typewriter";
import type { TextBeatSpec } from "../lib/guards";
import { chatStateAt, S1_CHIP, S3_END_CAM, S3_KB_END } from "./Scene03Chat";
import { S2_PLATE } from "./Scene02Intro";
import { Pills, ramp, type Pill } from "./shared/stage";

const S = "S04" as const;
const DUR = sceneById(S).duration;
const S3 = sceneById("S03");
const S3_FRAMES = sceneFrames("S03");
export const S4_TITLE = "Give every agent a job";
const TITLE_START = 0.15;
const TT = featureTitleTiming(S4_TITLE);
/** Plate Ken Burns progress at the end of this scene (Scene 5 continues from here). */
export const S4_KB_END = S3_KB_END + 0.03;

/** Scene 4 beats, seconds from the scene start. 4A is 0 to 10s, 4B is 10 to 34s. */
export const S4 = {
  sinkEnd: 0.6,
  frameRise: TITLE_START + TT.frameRiseStart,
  clickAgents: 3.75,
  agentsPage: 3.8,
  clickTile: 4.35,
  panelOpen: 4.4,
  nameType: 4.85,
  handle: 5.05,
  roleType: 5.15,
  clickSwatch: 5.45,
  taskType: 5.5,
  clickCreate: 7.85,
  panelClose: 7.9,
  created: { nora: 8.05, theo: 8.6, owen: 9.2 } as Record<Exclude<AgentKey, "iris">, number>,
  // 4B
  clickControl: 10.6,
  controlPage: 10.65,
  hero: {
    iris: { appear: 11.3, appearLen: 0.4, wave: 1.6, morph: 0.9 },
    nora: { appear: 14.2, appearLen: 0.25, wave: 0.45, morph: 0.4 },
    theo: { appear: 15.3, appearLen: 0.25, wave: 0.45, morph: 0.4 },
    owen: { appear: 16.4, appearLen: 0.25, wave: 0.45, morph: 0.4 },
  } as Record<AgentKey, { appear: number; appearLen: number; wave: number; morph: number }>,
  dimIn: 11.15,
  claim: 17.5,
  pickup: 17.9,
  walkStart: 19.0,
  resultsAt: 27.0,
  done: 27.4,
  mini: 28.0,
  outputs: [29.3, 29.9, 30.5],
};
const heroEnd = (k: AgentKey) => {
  const h = S4.hero[k];
  return h.appear + h.appearLen + h.wave + h.morph;
};

const PALETTE: Record<AgentKey, OrbPaletteKey> = { iris: "iris", nora: "nora", theo: "theo", owen: "owen" };
const ROLE: Record<AgentKey, string> = { iris: P.agents.frontDesk.role, nora: P.agents.intake.role, theo: P.agents.policy.role, owen: P.agents.evidence.role };
const NAME: Record<AgentKey, string> = { iris: "Iris", nora: "Nora", theo: "Theo", owen: "Owen" };

// ---------- Walking (world coordinates, isometric grid directions only) ----------
type Seg = { t0: number; t1: number; to: [number, number] };
const HOME: Record<AgentKey, [number, number]> = { iris: DESKS.iris.feet, nora: DESKS.nora.feet, theo: DESKS.theo.feet, owen: DESKS.owen.feet };
/** Build axis-aligned segments through waypoints, splitting a time window by distance. */
const route = (t0: number, t1: number, pts: [number, number][]): Seg[] => {
  const d = pts.slice(1).map((p, i) => Math.abs(p[0] - pts[i][0]) + Math.abs(p[1] - pts[i][1]));
  const total = d.reduce((a, b) => a + b, 0);
  let t = t0;
  return pts.slice(1).map((p, i) => {
    const dt = ((t1 - t0) * d[i]) / total;
    const seg = { t0: t, t1: t + dt, to: p };
    t += dt;
    return seg;
  });
};
const STAND = { gmail: [558, 118] as [number, number], drive: [653, 118] as [number, number], sheets: [548, 284] as [number, number] };
export const WALKS: Record<AgentKey, Seg[]> = {
  iris: [...route(19.0, 19.45, [HOME.iris, [330, 60]]), ...route(19.7, 20.2, [[330, 60], HOME.iris])],
  nora: [...route(20.2, 20.9, [HOME.nora, [558, 60], STAND.gmail]), ...route(21.7, 22.4, [STAND.gmail, [558, 60], HOME.nora])],
  theo: [...route(22.4, 23.4, [HOME.theo, [175, 300], [653, 300], STAND.drive]), ...route(23.9, 24.9, [STAND.drive, [653, 300], [175, 300], HOME.theo])],
  owen: [...route(24.6, 25.1, [HOME.owen, [415, 300], [548, 300], STAND.sheets]), ...route(26.1, 26.6, [STAND.sheets, [548, 300], [415, 300], HOME.owen])],
};
const walkAt = (k: AgentKey, t: number): { pos: [number, number]; walking: number | null; facing: Pose["facing"]; mirror: boolean } => {
  let from = HOME[k];
  for (const sg of WALKS[k]) {
    if (t < sg.t0) break;
    if (t <= sg.t1) {
      const p = (t - sg.t0) / Math.max(0.001, sg.t1 - sg.t0);
      const dx = sg.to[0] - from[0];
      const dy = sg.to[1] - from[1];
      const pos: [number, number] = [from[0] + dx * p, from[1] + dy * p];
      // Facing: +x right (front), -x left (mirrored front), +y toward camera (mirrored front), -y away (back).
      const facing = dy < 0 && Math.abs(dy) > Math.abs(dx) ? "back" : "front";
      const mirror = dx < 0 || (dy > 0 && Math.abs(dy) > Math.abs(dx));
      return { pos, walking: (t - sg.t0) * 2.2 * Math.PI * 2, facing, mirror };
    }
    from = sg.to;
  }
  return { pos: from, walking: null, facing: "front", mirror: false };
};

// ---------- Thought bubbles ----------
type BubbleSpec = { at: number; until: number; lines: { text: string; flag?: boolean }[] };
export const BUBBLES: Partial<Record<AgentKey, BubbleSpec>> = {
  nora: { at: 20.9, until: 22.65, lines: P.controlRoom.bubbles.nora.map((text) => ({ text })) },
  theo: { at: 23.4, until: 25.15, lines: P.controlRoom.bubbles.theo.map((text) => ({ text })) },
  owen: { at: 25.1, until: 26.8, lines: P.controlRoom.bubbles.owen.map((text, i) => ({ text, flag: i === 2 })) },
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

/** Plate status of an agent at time t. */
const statusAt = (k: AgentKey, t: number) => {
  if (t >= S4.done) return "Done";
  if (k === "iris") return t >= 19.6 ? "Passed to Nora" : P.controlRoom.irisStatusIdle;
  const starts = { nora: 20.2, theo: 22.4, owen: 24.6 } as const;
  const i = (["nora", "theo", "owen"] as const).indexOf(k);
  return t >= starts[k] ? P.controlRoom.statuses[i] : "Idle";
};

const OUTPUTS = P.controlRoom.outputs;

/** Control Room state for 4B at scene time t. Scene 5 uses this with t = DUR to open on the same frame. */
export const controlRoomStateAt = (t: number, clock: number): ControlRoomState => {
  const agents = Object.fromEntries(
    AGENT_ORDER.map((k) => {
      const w = walkAt(k, t);
      const visible = t >= heroEnd(k);
      const carry = (k === "iris" && t >= S4.pickup + 0.3 && t < 19.6) || (k === "nora" && t >= 19.6 && t < 22.4);
      const pose: Pose = { ...STANDING, facing: w.facing, mirror: w.mirror, walk: w.walking, carry };
      const statusChange = k === "iris" ? 19.6 : ({ nora: 20.2, theo: 22.4, owen: 24.6 } as Record<string, number>)[k];
      const pulse = Math.max(Math.sin(Math.PI * ramp(t, statusChange, statusChange + 0.6)), Math.sin(Math.PI * ramp(t, S4.done, S4.done + 0.6)));
      const st: AgentState = {
        pos: w.pos,
        visible,
        pose,
        plate: { role: ROLE[k], status: statusAt(k, t), pulse, opacity: 1 },
        plateVisible: visible,
        bubble: bubbleAt(k, t),
      };
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
  // Hero for whichever agent is being introduced.
  let hero: Hero | undefined;
  for (const k of AGENT_ORDER) {
    const h = S4.hero[k];
    if (t >= h.appear && t < heroEnd(k)) {
      const waveStart = h.appear + h.appearLen;
      hero = {
        k,
        name: NAME[k],
        palette: PALETTE[k],
        pose: { ...STANDING, wave: t - waveStart, waveLen: h.wave },
        plate: { role: ROLE[k], status: statusAt(k, t), pulse: 0, opacity: 1 },
        heroPx: k === "iris" ? 620 : 360,
        plateScale: k === "iris" ? 2.6 : 1.8,
        appear: EASE(ramp(t, h.appear, h.appear + h.appearLen)),
        morph: EASE(ramp(t, waveStart + h.wave, heroEnd(k))),
      };
    }
  }
  const irisMorphStart = S4.hero.iris.appear + S4.hero.iris.appearLen + S4.hero.iris.wave;
  const dim = EASE(ramp(t, S4.dimIn, S4.dimIn + 0.3)) * (1 - EASE(ramp(t, irisMorphStart, heroEnd("iris"))));
  const outputs: OutputCard[] = OUTPUTS.map((o, i) => ({
    agent: NAME[o.agent as AgentKey],
    role: ROLE[o.agent as AgentKey],
    palette: PALETTE[o.agent as AgentKey],
    text: o.text,
    flag: o.flag,
    appear: EASE(ramp(t, S4.outputs[i], S4.outputs[i] + 0.5)),
  }));
  return {
    office,
    dim,
    hero,
    agents: AGENT_ORDER.filter((k) => t >= S4.hero[k].appear).length,
    activeTasks: t >= S4.pickup ? 1 : 0,
    irisMessage: EASE(ramp(t, S4.pickup + 0.4, S4.pickup + 0.8)),
    mini: EASE(ramp(t, S4.mini, S4.mini + 1.3)),
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
  { t: S4.panelOpen, c: { ...FRAME_CENTRE, z: 1 } },
  { t: S4.panelOpen + 0.5, c: { ...panelCentre, z: 1.3 } },
  { t: S4.panelClose, c: { x: panelCentre.x + 6, y: panelCentre.y + 4, z: 1.31 }, lin: true },
  { t: S4.panelClose + 0.6, c: { ...gridCentre, z: 1.35 } },
  { t: 10.0, c: { x: gridCentre.x + 14, y: gridCentre.y + 6, z: 1.36 }, lin: true },
  { t: 10.45, c: { ...FRAME_CENTRE, z: 1 } },
  { t: 18.8, c: { x: FRAME_CENTRE.x + 6, y: FRAME_CENTRE.y + 2, z: 1.012 }, lin: true },
  { t: 27.3, c: { ...FRAME_CENTRE, z: 1 } },
  { t: S4.outputs[0], c: { ...FRAME_CENTRE, z: 1 } },
  { t: 31.3, c: { x: FRAME_CENTRE.x, y: FRAME_CENTRE.y + 3, z: 1.012 }, lin: true },
];
const FOLLOW = { in0: 18.8, in1: 19.35, out0: 26.75, out1: 27.3, z: 1.5 };
const activeAt = (t: number): AgentKey => (t < 20.2 ? "iris" : t < 22.4 ? "nora" : t < 24.6 ? "theo" : "owen");
/** Camera follows the active agent: a short moving average keeps the move eased. */
const followFocus = (t: number) => {
  let x = 0;
  let y = 0;
  const n = 8;
  for (let i = 0; i < n; i++) {
    const tt = t - i * 0.06;
    const k = activeAt(tt);
    const p = proj(...walkAt(k, tt).pos);
    const q = cr(p.x, p.y - 70);
    x += q.x;
    y += q.y;
  }
  return { x: x / n, y: y / n };
};
export const s4CamAt = (t: number): Cam => {
  const base = camAt(S4_CAM_KEYS, t, EASE);
  const w = EASE(ramp(t, FOLLOW.in0, FOLLOW.in1)) * (1 - EASE(ramp(t, FOLLOW.out0, FOLLOW.out1)));
  if (w <= 0) return base;
  const f = followFocus(t);
  return { x: base.x + (f.x - base.x) * w, y: base.y + (f.y - base.y) * w, z: base.z + (FOLLOW.z - base.z) * w };
};
export const S4_END_CAM = s4CamAt(DUR);

const slotCentre = (i: number) => {
  const r = slotRect(i);
  return nat(r.x + r.w / 2, r.y + r.h / 2);
};
export const S4_CURSOR: CursorKey[] = [
  { ...nat(1350, 700), t: 2.9 },
  { ...nat(63, navY("agents")), t: S4.clickAgents - 0.05 },
  { ...nat(63, navY("agents")), t: S4.clickAgents, click: true },
  { ...slotCentre(1), t: S4.clickTile - 0.05 },
  { ...slotCentre(1), t: S4.clickTile, click: true },
  { ...nat(swatchCentre(1).x, swatchCentre(1).y), t: S4.clickSwatch - 0.05 },
  { ...nat(swatchCentre(1).x, swatchCentre(1).y), t: S4.clickSwatch, click: true },
  { ...nat(createButtonCentre().x, createButtonCentre().y), t: S4.clickCreate - 0.05 },
  { ...nat(createButtonCentre().x, createButtonCentre().y), t: S4.clickCreate, click: true },
  { ...nat(createButtonCentre().x, createButtonCentre().y - 60), t: 10.0 },
  { ...nat(85, navY("control")), t: S4.clickControl - 0.05 },
  { ...nat(85, navY("control")), t: S4.clickControl, click: true },
  { ...nat(160, 600), t: S4.clickControl + 1.0 },
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
  { label: P.controlRoom.pills[0], at: 10.3, until: 13.6 },
  { label: P.controlRoom.pills[1], at: S4.claim, until: 20.0, spin: true },
  { label: P.controlRoom.pills[2], at: 20.0, until: 27.0, spin: true },
  { label: P.controlRoom.pills[3], at: 31.3, until: 999 },
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

  const showChatOpenCard = t < S4.sinkEnd + 0.01;
  const chat = chatStateAt(S3_FRAMES, fps, -S3_FRAMES);
  chat.clock = S3.start + S3.duration;
  if (!showChatOpenCard) {
    chat.cardOpen = 0;
    chat.citeActive = 0;
  }
  const toAgents = EASE(ramp(t, S4.agentsPage, S4.agentsPage + 0.3));
  const toControl = EASE(ramp(t, S4.controlPage, S4.controlPage + 0.6));
  const blurThrough = (p: number) => Math.sin(Math.PI * p) * 10;

  const panelOpen = EASE(ramp(t, S4.panelOpen, S4.panelOpen + 0.3)) * (1 - EASE(ramp(t, S4.panelClose, S4.panelClose + 0.25)));
  const created = (k: Exclude<AgentKey, "iris">) => EASE(ramp(t, S4.created[k], S4.created[k] + 0.4));
  const team = ["nora", "theo", "owen"] as const;
  const doneCount = team.filter((k) => t >= S4.created[k]).length;
  const lastCreated = doneCount > 0 ? S4.created[team[doneCount - 1]] : -1;

  const cam = s4CamAt(t);
  const cursorO = EASE(ramp(t, 2.9, 3.2)) * (1 - EASE(ramp(t, S4.clickControl + 0.5, S4.clickControl + 1.0)));

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
                      swatch: t >= S4.clickSwatch ? 1 : -1,
                      createPressed: Math.max(0, 1 - Math.abs(t - S4.clickCreate) / 0.15),
                      clock,
                    }}
                  />
                </div>
              ) : null}
              {toControl > 0 ? (
                <div style={{ position: "absolute", inset: 0, opacity: toControl, filter: toControl < 1 ? `blur(${blurThrough(toControl)}px)` : undefined }}>
                  <ControlRoomPage s={controlRoomStateAt(t, clock)} />
                </div>
              ) : null}
            </ProductWindow>
          </div>
          {1 - sink > 0 ? <Cursor keys={[{ ...S1_CHIP, t: -1 }]} opacity={1 - sink} /> : null}
          {cursorO > 0 ? <Cursor keys={S4_CURSOR} opacity={cursorO} /> : null}
        </AbsoluteFill>
      ) : null}
      <Pills t={t} pills={S4_PILLS} />
      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};
