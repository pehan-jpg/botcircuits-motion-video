import React from "react";
import { AbsoluteFill } from "remotion";
import { EASE, PRODUCT } from "../theme";
import { sceneById } from "../timeline";
import { PLACEHOLDERS as P } from "../placeholders";
import { PlateBackground } from "../backgrounds/PlateBackground";
import { GuardLayer } from "../components/GuardLayer";
import { FeatureTitle } from "../components/FeatureTitle";
import { camAt, FRAME_CENTRE, nat, type Cam, type CamKey } from "../components/chat/ProductWindow";
import { BrainPage } from "../components/pages/BrainPage";
import { KB_PARKED, menuItemCentre, PBG, PlaybookGraphPage, toolbarCentre, type GraphState, type NodeStatus } from "../components/pages/PlaybookGraph";
import { UI } from "../components/chat/Sidebar";
import { FONT, UIN } from "../theme";
import type { CursorKey } from "../components/Cursor";
import { typeDuration } from "../lib/typewriter";
import type { TextBeatSpec } from "../lib/guards";
import { brainStateAt, S5_END_CAM, S5_KB_END, S5_USE_NATIVE } from "./Scene05Brain";
import { S2_PLATE } from "./Scene02Intro";
import { opening, Pills, ProductStage, ramp, useScene, type Pill } from "./shared/stage";

const S = "S06" as const;
export const S6_TITLE = "Define the process once";
const TITLE_START = 0.15;
/** Menu item for each of the six steps. */
const STEP_ITEMS = ["Ask", "Agent", "Agent", "Agent", "Page", "Review"];
/** Scene 6 beats, seconds from the scene start. */
export const S6 = {
  chipPark: [0.0, 0.55],
  chipLand: [2.5, 3.3],
  clickSettings: 3.7,
  settingsClose: 4.95,
  firstSelect: 5.2,
  firstItem: 5.75,
  firstAdd: 6.3,
  cadence: 1.1,
  kbLand: [8.6, 9.1],
  inspector: 11.9,
  nameType: 12.05,
  reviewer: 13.0,
  msgType: 13.2,
  variable: 15.3,
  inspectorClose: 15.45,
  branches: [15.55, 15.8, 16.05, 15.8, 16.05],
  clickCheck: 16.5,
  clickSave: 17.6,
};
/** Select click, item click and landing time of step i (0 to 5). */
const stepTimes = (i: number) => {
  if (i === 0) return { select: S6.firstSelect, item: S6.firstItem, land: S6.firstAdd + 0.05 };
  const select = S6.firstAdd + 0.55 + (i - 1) * S6.cadence;
  return { select, item: select + 0.58, land: select + 0.63 };
};
/** Plate drift on 03, within the 4 percent limit. */
export const S6_KB_END = 1.15;
const MSG_DONE = S6.msgType + typeDuration(P.graph.reviewMessage.join("\n"), 60, "insp-msg");

/** Playbook graph state at Scene 6 time t. Scene 7 starts from graphStateAt(S6 duration). */
export const graphStateAt = (t: number, F: (s: number) => number, clock: number, shift = 0): GraphState => {
  // Which step's menu is open, and what is highlighted.
  let open = 0;
  let highlight: string | null = null;
  let selectValue = "Agent";
  let selectPressed = 0;
  for (let i = 0; i < 6; i++) {
    const st = stepTimes(i);
    const o = EASE(ramp(t, st.select, st.select + (i === 0 ? 0.25 : 0.15))) * (1 - EASE(ramp(t, st.item, st.item + 0.12)));
    if (o > open) {
      open = o;
      highlight = t >= st.item - (i === 0 ? 0.35 : 0.25) ? STEP_ITEMS[i] : i === 0 ? "Ask" : null;
    }
    if (t >= st.item) selectValue = STEP_ITEMS[i];
    selectPressed = Math.max(selectPressed, Math.max(0, 1 - Math.abs(t - st.select) / 0.15));
  }
  if (t < S6.firstItem) selectValue = "Agent";
  const main: GraphState["nodes"] = [0, 1, 2, 3, 4, 5].map((i) => {
    const land = stepTimes(i).land;
    return { appear: EASE(ramp(t, land, land + 0.35)), connector: i === 0 ? 0 : ramp(t, land + 0.1, land + 0.45), status: "idle" as NodeStatus, pulse: 0 };
  });
  const branch: GraphState["nodes"] = S6.branches.map((a) => ({ appear: EASE(ramp(t, a, a + 0.35)), connector: ramp(t, a + 0.05, a + 0.4), status: "idle" as NodeStatus, pulse: 0 }));
  const inspOpen = EASE(ramp(t, S6.inspector, S6.inspector + 0.3)) * (1 - EASE(ramp(t, S6.inspectorClose, S6.inspectorClose + 0.3)));
  return {
    status: t >= S6.clickSave + 0.05 ? "Active" : "Draft",
    statusPulse: Math.sin(Math.PI * ramp(t, S6.clickSave + 0.05, S6.clickSave + 0.55)),
    kbParked: t >= S6.chipLand[1] ? 1 : 0,
    kbLand: EASE(ramp(t, S6.kbLand[0], S6.kbLand[1])),
    settings: EASE(ramp(t, S6.clickSettings + 0.05, S6.clickSettings + 0.25)) * (1 - EASE(ramp(t, S6.settingsClose, S6.settingsClose + 0.2))),
    selectValue,
    selectPressed,
    addPressed: Math.max(0, 1 - Math.abs(t - S6.firstAdd) / 0.15),
    menu: { open, highlight },
    nodes: [...main, ...branch],
    inspector: inspOpen,
    insp: {
      nameStart: t >= S6.nameType ? F(S6.nameType) + shift : null,
      reviewer: EASE(ramp(t, S6.reviewer, S6.reviewer + 0.3)),
      msgStart: t >= S6.msgType ? F(S6.msgType) + shift : null,
      variable: EASE(ramp(t, S6.variable, S6.variable + 0.2)),
    },
    checkPressed: Math.max(0, 1 - Math.abs(t - S6.clickCheck) / 0.15),
    toast: EASE(ramp(t, S6.clickCheck + 0.05, S6.clickCheck + 0.3)) * (1 - EASE(ramp(t, S6.clickCheck + 1.4, S6.clickCheck + 1.7))),
    savePressed: Math.max(0, 1 - Math.abs(t - S6.clickSave) / 0.15),
    reviewGlow: 0,
    clock,
  };
};

const st = (i: number) => stepTimes(i);
export const S6_CAM_KEYS: CamKey[] = [
  { t: 0, c: S5_END_CAM },
  { t: 1.6, c: { ...FRAME_CENTRE, z: 1 } },
  { t: 3.4, c: { x: FRAME_CENTRE.x, y: FRAME_CENTRE.y + 2, z: 1.006 }, lin: true },
  { t: 3.95, c: { ...nat(1420, 300), z: 1.3 } },
  { t: 4.95, c: { ...nat(1428, 304), z: 1.3 }, lin: true },
  { t: 5.45, c: { ...nat(600, 380), z: 1.45 } },
  { t: st(1).land, c: { ...nat(610, 410), z: 1.45 }, lin: true },
  { t: st(3).land, c: { ...nat(620, 460), z: 1.45 }, lin: true },
  { t: st(5).land + 0.1, c: { ...nat(630, 520), z: 1.45 }, lin: true },
  { t: S6.inspector + 0.4, c: { ...nat(1560, 520), z: 1.35 } },
  { t: MSG_DONE, c: { ...nat(1566, 526), z: 1.35 }, lin: true },
  { t: S6.branches[2] + 0.2, c: { ...nat(830, 760), z: 1.42 } },
  { t: S6.clickCheck - 0.4, c: { ...nat(836, 764), z: 1.42 }, lin: true },
  { t: S6.clickCheck - 0.05, c: { ...nat(1000, 230), z: 1.35 } },
  { t: S6.clickSave + 0.6, c: { ...nat(1010, 234), z: 1.35 }, lin: true },
  { t: 18.6, c: { ...FRAME_CENTRE, z: 1 } },
  { t: 19, c: { x: FRAME_CENTRE.x + 2, y: FRAME_CENTRE.y + 1, z: 1.004 }, lin: true },
];
export const S6_END_CAM: Cam = S6_CAM_KEYS[S6_CAM_KEYS.length - 1].c;

const n2 = (p: { x: number; y: number }) => nat(p.x, p.y);
const selectC = nat(PBG.select.x + PBG.select.w / 2, PBG.select.y + PBG.select.h / 2);
const addC = nat(PBG.add.x + PBG.add.w / 2, PBG.add.y + PBG.add.h / 2);
export const S6_CURSOR: CursorKey[] = [
  { ...nat(S5_USE_NATIVE.x, S5_USE_NATIVE.y), t: -1 },
  { ...nat(S5_USE_NATIVE.x, S5_USE_NATIVE.y), t: 0.5 },
  { ...nat(1300, 640), t: 3.1 },
  { ...n2(toolbarCentre("settings")), t: S6.clickSettings - 0.05 },
  { ...n2(toolbarCentre("settings")), t: S6.clickSettings, click: true },
  ...[0, 1, 2, 3, 4, 5].flatMap((i) => {
    const s = stepTimes(i);
    const item = n2(menuItemCentre(STEP_ITEMS[i]));
    const keys: CursorKey[] = [
      { ...selectC, t: s.select - 0.05 },
      { ...selectC, t: s.select, click: true },
      { ...item, t: s.item - 0.05 },
      { ...item, t: s.item, click: true },
    ];
    if (i === 0) keys.push({ ...addC, t: S6.firstAdd - 0.05 }, { ...addC, t: S6.firstAdd, click: true });
    return keys;
  }),
  { ...nat(1700, 360), t: S6.inspector + 0.5 },
  { ...nat(1700, 640), t: S6.variable },
  { ...n2(toolbarCentre("check")), t: S6.clickCheck - 0.05 },
  { ...n2(toolbarCentre("check")), t: S6.clickCheck, click: true },
  { ...n2(toolbarCentre("save")), t: S6.clickSave - 0.05 },
  { ...n2(toolbarCentre("save")), t: S6.clickSave, click: true },
  { ...nat(1500, 500), t: 18.8 },
];

export const S6_PILL_LABEL = "Steps, agents, tools and a review";
export const S6_PILLS: Pill[] = [
  { label: "Answers point back to your sources", at: -10, until: 0 },
  { label: S6_PILL_LABEL, at: 16.2, until: 999 },
];
export const SCENE06_TEXT: TextBeatSpec[] = [
  { id: "title", text: S6_TITLE, readyAt: TITLE_START, leaveAt: TITLE_START + 1.87, fontPx: 88, exception: "Brief: compact title, 0.9s hold" },
  { id: "pill", text: S6_PILL_LABEL, readyAt: 16.5, leaveAt: 19 + 1, fontPx: 28, carriesOver: true },
  { id: "trigger", text: `Trigger ${P.graph.trigger}`, readyAt: S6.clickSettings + 0.25, leaveAt: S6.settingsClose, fontPx: 20, ui: true, exception: "Brief: Settings shows the trigger for 1.0s" },
  { id: "steps", text: P.graph.nodes.slice(0, 6).map((x) => x.text).join(" "), readyAt: stepTimes(5).land + 0.4, leaveAt: 19, fontPx: 21, ui: true, exception: "Brief: six steps added one at a time, each read as it lands" },
  { id: "message", text: P.graph.reviewMessage.join(" "), readyAt: MSG_DONE, leaveAt: S6.inspectorClose, fontPx: 21, ui: true, exception: "Read as it types; brief fits the inspector, branches, Check and Save in 19s" },
];

const toScreen = (c: Cam, p: { x: number; y: number }) => ({ x: FRAME_CENTRE.x + c.z * (p.x - c.x), y: FRAME_CENTRE.y + c.z * (p.y - c.y) });

/** The Claims knowledge chip leaves "Use in playbook", waits above the title and lands in the playbook header. */
const KbFlight: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const start = toScreen(S5_END_CAM, nat(S5_USE_NATIVE.x, S5_USE_NATIVE.y));
  const park = { x: 1500, y: 250 };
  const end = toScreen(cam, nat(KB_PARKED.x, KB_PARKED.y));
  const a = EASE(ramp(t, S6.chipPark[0], S6.chipPark[1]));
  const b = EASE(ramp(t, S6.chipLand[0], S6.chipLand[1]));
  if (b >= 1) return null;
  const x = start.x + (park.x - start.x) * a + (end.x - park.x) * b;
  const y = start.y + (park.y - start.y) * a + (end.y - park.y) * b - Math.sin(Math.PI * b) * 40;
  const scale = (PRODUCT.scale + (1.6 - PRODUCT.scale) * a) * (1 - b) + PRODUCT.scale * cam.z * b;
  return (
    <div data-guard="box" data-guard-label="Shared chip Claims knowledge" style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${scale})`, opacity: Math.min(1, t / 0.15), padding: "2px 10px", borderRadius: 8, background: UI.lilacBg, color: UI.lilacText, fontFamily: FONT.sans, fontSize: UIN.helper, fontWeight: 600, whiteSpace: "nowrap", boxShadow: `0 ${8 * a * (1 - b)}px ${16 * a * (1 - b)}px rgba(60,40,140,0.25)` }}>
      Claims knowledge
    </div>
  );
};

export const Scene06Playbook: React.FC = () => {
  const { t, F, clock, dur } = useScene(S);
  const o = opening(t, S6_TITLE, TITLE_START, "compact");
  const cam = camAt(S6_CAM_KEYS, t, EASE);
  const cursorO = EASE(ramp(t, 3.1, 3.4)) * (1 - EASE(ramp(t, 18.6, 19)));
  return (
    <AbsoluteFill style={{ width: 1920, height: 1080 }}>
      <PlateBackground plate="03" duration={F(dur)} kbFrom={S5_KB_END} kbTo={S6_KB_END} timeOffset={sceneById(S).start - 15} {...S2_PLATE} />
      <FeatureTitle text={S6_TITLE} startFrame={F(TITLE_START)} variant="compact" />
      <ProductStage cam={cam} frameStyle={o.frameStyle} visible={o.visible} cursor={{ keys: S6_CURSOR, opacity: o.showPrev ? 1 - o.sink : cursorO }}>
        {o.showPrev ? <BrainPage s={brainStateAt(sceneById("S05").duration, F, -F(sceneById("S05").duration))} /> : <PlaybookGraphPage s={graphStateAt(t, F, clock)} />}
      </ProductStage>
      <KbFlight t={t} cam={cam} />
      <Pills t={t} pills={S6_PILLS} />
      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};


