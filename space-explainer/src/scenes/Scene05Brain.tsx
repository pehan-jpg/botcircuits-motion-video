import React from "react";
import { AbsoluteFill } from "remotion";
import { EASE } from "../theme";
import { sceneById } from "../timeline";
import { PLACEHOLDERS as P } from "../placeholders";
import { PlateBackground } from "../backgrounds/PlateBackground";
import { GuardLayer } from "../components/GuardLayer";
import { FeatureTitle } from "../components/FeatureTitle";
import { navY } from "../components/chat/Sidebar";
import { camAt, FRAME_CENTRE, nat, type Cam, type CamKey } from "../components/chat/ProductWindow";
import { ControlRoomPage } from "../components/office/ControlRoomPage";
import { BrainPage, type BrainState } from "../components/pages/BrainPage";
import type { CursorKey } from "../components/Cursor";
import type { TextBeatSpec } from "../lib/guards";
import { controlRoomStateAt, S4_END_CAM, S4_KB_END } from "./Scene04Agents";
import { S2_PLATE } from "./Scene02Intro";
import { opening, Pills, ProductStage, ramp, useScene, type Pill } from "./shared/stage";

const S = "S05" as const;
export const S5_TITLE = "Ground it in your files";
const TITLE_START = 0.15;
const S5 = { clickBrain: 3.3, page: 3.35, files: [4.1, 5.0], indexLen: 0.8, drive: 6.0, cite: 6.4, zoomIn: 3.9, zoomOut: 9.2 };
export const S5_KB_END = S4_KB_END + 0.003;
const plateOffset = (id: "S05") => sceneById(id).start - 15;

export const brainStateAt = (t: number): BrainState => {
  const files = S5.files.map((a) => ({ appear: EASE(ramp(t, a, a + 0.35)), progress: ramp(t, a + 0.1, a + S5.indexLen), ready: t >= a + S5.indexLen }));
  const passages = Math.round(ramp(t, S5.files[0] + 0.1, S5.files[0] + S5.indexLen) * P.brain.passages[0] + ramp(t, S5.files[1] + 0.1, S5.files[1] + S5.indexLen) * (P.brain.passages[1] - P.brain.passages[0]));
  return { files, passages, drive: EASE(ramp(t, S5.drive, S5.drive + 0.4)), cite: EASE(ramp(t, S5.cite, S5.cite + 0.4)), emptyFade: EASE(ramp(t, S5.files[0] - 0.3, S5.files[0])) };
};

const listFocus = nat(1077, 565);
export const S5_CAM_KEYS: CamKey[] = [
  { t: 0, c: S4_END_CAM },
  { t: 1.6, c: { ...FRAME_CENTRE, z: 1 } },
  { t: S5.zoomIn, c: { ...FRAME_CENTRE, z: 1 } },
  { t: S5.zoomIn + 0.5, c: { ...listFocus, z: 1.4 } },
  { t: S5.zoomOut, c: { x: listFocus.x + 18, y: listFocus.y + 4, z: 1.41 }, lin: true },
  { t: S5.zoomOut + 0.7, c: { ...FRAME_CENTRE, z: 1 } },
  { t: 11, c: { x: FRAME_CENTRE.x, y: FRAME_CENTRE.y + 2, z: 1.008 }, lin: true },
];
export const S5_END_CAM: Cam = S5_CAM_KEYS[S5_CAM_KEYS.length - 1].c;

export const S5_CURSOR: CursorKey[] = [
  { ...nat(1300, 700), t: 2.8 },
  { ...nat(63, navY("brain")), t: S5.clickBrain - 0.05 },
  { ...nat(63, navY("brain")), t: S5.clickBrain, click: true },
  { ...nat(1350, 330), t: 4.4 },
];

export const S5_PILLS: Pill[] = [
  // Carried over from Scene 4's last frame, then faded out.
  { label: P.controlRoom.pills[3], at: -10, until: 0 },
  { label: "Answers point back to your files", at: 6.6, until: 10.6 },
];
export const SCENE05_TEXT: TextBeatSpec[] = [
  { id: "title", text: S5_TITLE, readyAt: TITLE_START, leaveAt: TITLE_START + 1.87, fontPx: 88, exception: "Brief: compact title, 0.9s hold" },
  { id: "pill", text: S5_PILLS[1].label, readyAt: 6.9, leaveAt: 10.6, fontPx: 28 },
  { id: "files", text: P.brain.files.join(" "), readyAt: S5.files[1] + S5.indexLen, leaveAt: S5.zoomOut, fontPx: 21, ui: true },
];

export const Scene05Brain: React.FC = () => {
  const { t, F, clock, dur } = useScene(S);
  const o = opening(t, S5_TITLE, TITLE_START, "compact");
  const toBrain = EASE(ramp(t, S5.page, S5.page + 0.3));
  const blur = Math.sin(Math.PI * toBrain) * 10;
  const cam = camAt(S5_CAM_KEYS, t, EASE);
  const cursorO = EASE(ramp(t, 2.8, 3.1)) * (1 - EASE(ramp(t, 4.0, 4.4)));
  return (
    <AbsoluteFill style={{ width: 1920, height: 1080 }}>
      <PlateBackground plate="02" to="03" crossfadeAt={F(0.2)} crossfadeSeconds={1.5} duration={F(dur)} kbFrom={S4_KB_END} kbTo={S5_KB_END} timeOffset={plateOffset(S)} {...S2_PLATE} />
      <FeatureTitle text={S5_TITLE} startFrame={F(TITLE_START)} variant="compact" />
      <ProductStage cam={cam} frameStyle={o.frameStyle} visible={o.visible} cursor={{ keys: S5_CURSOR, opacity: o.showPrev ? 0 : cursorO }}>
        {toBrain < 1 ? (
          <div style={{ position: "absolute", inset: 0, opacity: 1 - toBrain, filter: blur > 0.05 ? `blur(${blur}px)` : undefined }}>
            <ControlRoomPage s={controlRoomStateAt(sceneById("S04").duration, clock)} />
          </div>
        ) : null}
        {toBrain > 0 ? (
          <div style={{ position: "absolute", inset: 0, opacity: toBrain, filter: blur > 0.05 ? `blur(${blur}px)` : undefined }}>
            <BrainPage s={brainStateAt(t)} />
          </div>
        ) : null}
      </ProductStage>
      <Pills t={t} pills={S5_PILLS} />
      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};
