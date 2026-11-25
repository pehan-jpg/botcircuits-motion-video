import React from "react";
import { AbsoluteFill } from "remotion";
import { EASE } from "../theme";
import { sceneById } from "../timeline";
import { PlateBackground } from "../backgrounds/PlateBackground";
import { GuardLayer } from "../components/GuardLayer";
import { FeatureTitle } from "../components/FeatureTitle";
import { navY } from "../components/chat/Sidebar";
import { camAt, FRAME_CENTRE, nat, type Cam, type CamKey } from "../components/chat/ProductWindow";
import { BrainPage } from "../components/pages/BrainPage";
import { ADD_STEP, MENU_BOX, menuIndex, menuItemY, PlaybookPage, STEP_MENU, STEPS, type PlaybookState, type StepStatus } from "../components/pages/PlaybookPage";
import type { CursorKey } from "../components/Cursor";
import type { TextBeatSpec } from "../lib/guards";
import { brainStateAt, S5_END_CAM, S5_KB_END } from "./Scene05Brain";
import { S2_PLATE } from "./Scene02Intro";
import { opening, Pills, ProductStage, ramp, useScene, type Pill } from "./shared/stage";

const S = "S06" as const;
export const S6_TITLE = "Define the process once";
const TITLE_START = 0.15;
const S6 = { clickPlaybook: 3.3, page: 3.35, addClick: 3.85, firstItem: 4.6, cadence: 1.05, zoomIn: 3.8, zoomOut: 12.1 };
export const itemClickAt = (i: number) => S6.firstItem + i * S6.cadence;
/** Slow drift on plate 03: zoom eases back out within the 4 percent limit. */
export const S6_KB_END = 1.15;

/** Playbook state with every step added and nothing running (Scene 7 starts from this). */
export const builtPlaybook = (clock: number, statuses?: StepStatus[], pulse = 0, reviewGlow = 1): PlaybookState => ({
  steps: STEPS.map((_, i) => ({ appear: 1, connector: 1, status: statuses ? statuses[i] : "idle", pulse })),
  menu: { open: 0, highlight: -1 },
  addPressed: 0,
  reviewGlow,
  clock,
});

export const playbookStateAt = (t: number, clock: number): PlaybookState => {
  const steps = STEPS.map((_, i) => {
    const c = itemClickAt(i);
    return { appear: EASE(ramp(t, c + 0.1, c + 0.5)), connector: EASE(ramp(t, c + 0.35, c + 0.65)), status: "idle" as StepStatus, pulse: 0.5 + 0.5 * Math.sin(t * 4) };
  });
  // The menu opens from + Add step, closes after each pick and reopens for the next one.
  let open = 0;
  let highlight = -1;
  for (let i = 0; i < STEPS.length; i++) {
    const c = itemClickAt(i);
    const openAt = i === 0 ? S6.addClick + 0.05 : itemClickAt(i - 1) + 0.35;
    const o = EASE(ramp(t, openAt, openAt + 0.15)) * (1 - EASE(ramp(t, c + 0.05, c + 0.2)));
    if (o > open) {
      open = o;
      highlight = t >= c - 0.3 ? menuIndex(STEP_MENU[i]) : -1;
    }
  }
  return {
    steps,
    menu: { open, highlight },
    addPressed: Math.max(0, 1 - Math.abs(t - S6.addClick) / 0.15),
    reviewGlow: EASE(ramp(t, itemClickAt(4) + 0.3, itemClickAt(4) + 0.9)),
    clock,
  };
};

const focus = nat(1210, 470);
export const S6_CAM_KEYS: CamKey[] = [
  { t: 0, c: S5_END_CAM },
  { t: 1.6, c: { ...FRAME_CENTRE, z: 1 } },
  { t: S6.zoomIn, c: { ...FRAME_CENTRE, z: 1 } },
  { t: S6.zoomIn + 0.5, c: { ...focus, z: 1.5 } },
  { t: S6.zoomOut, c: { x: focus.x + 10, y: focus.y + 30, z: 1.5 }, lin: true },
  { t: S6.zoomOut + 0.6, c: { ...FRAME_CENTRE, z: 1 } },
  { t: 15, c: { x: FRAME_CENTRE.x, y: FRAME_CENTRE.y + 2, z: 1.008 }, lin: true },
];
export const S6_END_CAM: Cam = S6_CAM_KEYS[S6_CAM_KEYS.length - 1].c;

const itemPos = (i: number) => nat(MENU_BOX.x + 52, menuItemY(menuIndex(STEP_MENU[i])));
export const S6_CURSOR: CursorKey[] = [
  { ...nat(1300, 700), t: 2.8 },
  { ...nat(63, navY("playbook")), t: S6.clickPlaybook - 0.05 },
  { ...nat(63, navY("playbook")), t: S6.clickPlaybook, click: true },
  { ...nat(ADD_STEP.x + 48, ADD_STEP.y + 13), t: S6.addClick - 0.05 },
  { ...nat(ADD_STEP.x + 48, ADD_STEP.y + 13), t: S6.addClick, click: true },
  ...STEPS.flatMap((_, i) => [
    { ...itemPos(i), t: itemClickAt(i) - 0.05 },
    { ...itemPos(i), t: itemClickAt(i), click: true },
  ]),
  { ...nat(1500, 820), t: S6.zoomOut + 0.4 },
];

export const S6_PILLS: Pill[] = [
  { label: "Answers point back to your files", at: -10, until: -1 },
  { label: "Steps, agents, tools and a review", at: 11.8, until: 999 },
];
export const SCENE06_TEXT: TextBeatSpec[] = [
  { id: "title", text: S6_TITLE, readyAt: TITLE_START, leaveAt: TITLE_START + 1.87, fontPx: 88, exception: "Brief: compact title, 0.9s hold" },
  { id: "pill", text: S6_PILLS[1].label, readyAt: 12.1, leaveAt: 15, fontPx: 28 },
  { id: "steps", text: STEPS.map((s) => s.title).join(" "), readyAt: itemClickAt(6) + 0.5, leaveAt: 15, fontPx: 22, ui: true, exception: "Brief: seven steps added one at a time, each read as it lands (1.05s apart); all stay on screen to the scene end" },
];

export const Scene06Playbook: React.FC = () => {
  const { t, F, clock, dur } = useScene(S);
  const o = opening(t, S6_TITLE, TITLE_START, "compact");
  const toPb = EASE(ramp(t, S6.page, S6.page + 0.3));
  const blur = Math.sin(Math.PI * toPb) * 10;
  const cam = camAt(S6_CAM_KEYS, t, EASE);
  const cursorO = EASE(ramp(t, 2.8, 3.1)) * (1 - EASE(ramp(t, S6.zoomOut, S6.zoomOut + 0.4)));
  return (
    <AbsoluteFill style={{ width: 1920, height: 1080 }}>
      <PlateBackground plate="03" duration={F(dur)} kbFrom={S5_KB_END} kbTo={S6_KB_END} timeOffset={sceneById(S).start - 15} {...S2_PLATE} />
      <FeatureTitle text={S6_TITLE} startFrame={F(TITLE_START)} variant="compact" />
      <ProductStage cam={cam} frameStyle={o.frameStyle} visible={o.visible} cursor={{ keys: S6_CURSOR, opacity: o.showPrev ? 0 : cursorO }}>
        {toPb < 1 ? (
          <div style={{ position: "absolute", inset: 0, opacity: 1 - toPb, filter: blur > 0.05 ? `blur(${blur}px)` : undefined }}>
            <BrainPage s={brainStateAt(sceneById("S05").duration, F)} />
          </div>
        ) : null}
        {toPb > 0 ? (
          <div style={{ position: "absolute", inset: 0, opacity: toPb, filter: blur > 0.05 ? `blur(${blur}px)` : undefined }}>
            <PlaybookPage s={playbookStateAt(t, clock)} />
          </div>
        ) : null}
      </ProductStage>
      <Pills t={t} pills={S6_PILLS} />
      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};
