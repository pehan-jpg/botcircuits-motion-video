import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CHAT_CPS, EASE } from "../theme";
import { sceneById } from "../timeline";
import { PLACEHOLDERS as P } from "../placeholders";
import { PlateBackground } from "../backgrounds/PlateBackground";
import { GuardLayer } from "../components/GuardLayer";
import { FeatureTitle } from "../components/FeatureTitle";
import { navY } from "../components/chat/Sidebar";
import { camAt, FRAME_CENTRE, nat, type Cam, type CamKey } from "../components/chat/ProductWindow";
import { ControlRoomPage } from "../components/office/ControlRoomPage";
import { ReviewsPage } from "../components/pages/ReviewsPage";
import { RECORDS, RecordsPage, ROWS, type RecordsState } from "../components/pages/RecordsPage";
import { PAGES, PagesPage, type PagesState } from "../components/pages/PagesPage";
import type { CursorKey } from "../components/Cursor";
import { typeDuration } from "../lib/typewriter";
import type { TextBeatSpec } from "../lib/guards";
import { controlRoomStateAt } from "./Scene04Agents";
import { reviewsStateAt, S8_END_CAM, S8_KB_END, S8_PILL_LABEL } from "./Scene08Review";
import { S2_PLATE } from "./Scene02Intro";
import { opening, Pills, ProductStage, ramp, useScene, type Pill } from "./shared/stage";

const S = "S09" as const;
export const S9_TITLE = "Every step on record";
const TITLE_START = 0.15;
const ROW_GAP = 0.35;
const APPROVED = 5;
const APPROVED_HOLD = 1.2;
export const S9 = { clickControl: 3.3, control: 3.35, clickRecords: 4.1, records: 4.15, replay: 5.0, rows0: 5.2, clickPages: 9.0, pages: 9.05, type: 9.55, build: 11.4 };
const PROMPT_DUR = typeDuration(P.pages.prompt, CHAT_CPS, "pages-prompt");
const S9_BUILD_CLICK = Math.max(S9.type + PROMPT_DUR + 0.2, 11.2);
export const S9_KB_END = 1.0;

/** Replay row starts: 0.35s apart, the approved row held 1.2s. */
export const ROW_STARTS = ROWS.map((_, i) => S9.rows0 + i * ROW_GAP + (i > APPROVED ? APPROVED_HOLD - ROW_GAP : 0));
const REPLAY_END = ROW_STARTS[ROWS.length - 1] + ROW_GAP;

export const recordsStateAt = (t: number, F: (s: number) => number, clock: number, shift = 0): RecordsState => ({
  appear: EASE(ramp(t, S9.records + 0.05, S9.records + 0.4)),
  replayPressed: Math.max(0, 1 - Math.abs(t - S9.replay) / 0.15),
  rowType: ROW_STARTS.map((a) => (t >= S9.replay ? F(a) + shift : Infinity)),
  highlight: ROW_STARTS.map((a, i) => {
    const next = i < ROW_STARTS.length - 1 ? ROW_STARTS[i + 1] : REPLAY_END + 0.6;
    return EASE(ramp(t, a, a + 0.15)) * (1 - EASE(ramp(t, next, next + 0.2)));
  }),
  // Replay: the record clears on the click, then each row returns in turn.
  reveal: ROW_STARTS.map((a) => (t < S9.replay ? 1 : EASE(ramp(t, a, a + 0.3)))),
  scrub: t < S9.replay ? 0 : ramp(t, S9.rows0, REPLAY_END),
  clock,
});

export const pagesStateAt = (t: number, F: (s: number) => number, shift = 0): PagesState => ({
  typeStart: F(S9.type) + shift,
  typing: t >= S9.type,
  pressed: Math.max(0, 1 - Math.abs(t - S9_BUILD_CLICK) / 0.15),
  build: EASE(ramp(t, S9.build, S9.build + 0.5)),
  rows: ramp(t, S9.build + 0.2, S9.build + 0.8),
  bars: EASE(ramp(t, S9.build + 0.4, S9.build + 1.0)),
});

const timelineFocus = nat(RECORDS.x + 560, 470);
const promptFocus = nat(1060, 270);
const outFocus = nat(1060, 590);
export const S9_CAM_KEYS: CamKey[] = [
  { t: 0, c: S8_END_CAM },
  { t: 1.6, c: { ...FRAME_CENTRE, z: 1 } },
  { t: S9.records + 0.3, c: { x: FRAME_CENTRE.x, y: FRAME_CENTRE.y + 2, z: 1.008 }, lin: true },
  { t: S9.replay + 0.1, c: { ...timelineFocus, z: 1.36 } },
  { t: REPLAY_END, c: { x: timelineFocus.x + 6, y: timelineFocus.y + 40, z: 1.36 }, lin: true },
  { t: S9.pages, c: { ...FRAME_CENTRE, z: 1 } },
  { t: S9.type + 0.1, c: { ...promptFocus, z: 1.3 } },
  { t: S9_BUILD_CLICK, c: { x: promptFocus.x + 14, y: promptFocus.y, z: 1.3 }, lin: true },
  { t: S9.build + 0.7, c: { ...outFocus, z: 1.2 } },
  { t: 13, c: { x: outFocus.x + 8, y: outFocus.y + 2, z: 1.205 }, lin: true },
];
export const S9_END_CAM: Cam = S9_CAM_KEYS[S9_CAM_KEYS.length - 1].c;

const replayC = nat(RECORDS.replay.x + RECORDS.replay.w / 2, RECORDS.replay.y + RECORDS.replay.h / 2);
const buildC = nat(PAGES.button.x + PAGES.button.w / 2, PAGES.button.y + PAGES.button.h / 2);
export const S9_CURSOR: CursorKey[] = [
  { ...nat(1300, 700), t: 2.8 },
  { ...nat(63, navY("control")), t: S9.clickControl - 0.05 },
  { ...nat(63, navY("control")), t: S9.clickControl, click: true },
  { ...nat(RECORDS.recordsTab.x, RECORDS.recordsTab.y), t: S9.clickRecords - 0.05 },
  { ...nat(RECORDS.recordsTab.x, RECORDS.recordsTab.y), t: S9.clickRecords, click: true },
  { ...replayC, t: S9.replay - 0.05 },
  { ...replayC, t: S9.replay, click: true },
  { ...nat(1560, 330), t: 6.0 },
  { ...nat(1500, 560), t: 8.3 },
  { ...nat(63, navY("pages")), t: S9.clickPages - 0.05 },
  { ...nat(63, navY("pages")), t: S9.clickPages, click: true },
  { ...nat(1300, 340), t: 9.9 },
  { ...buildC, t: S9_BUILD_CLICK - 0.05 },
  { ...buildC, t: S9_BUILD_CLICK, click: true },
  { ...nat(1640, 380), t: 12.2 },
];

export const S9_PILL_LABEL = "Reports from the record";
export const S9_PILLS: Pill[] = [
  { label: S8_PILL_LABEL, at: -10, until: 0 },
  { label: S9_PILL_LABEL, at: 11.5, until: 999 },
];
export const SCENE09_TEXT: TextBeatSpec[] = [
  { id: "title", text: S9_TITLE, readyAt: TITLE_START, leaveAt: TITLE_START + 1.87, fontPx: 88, exception: "Brief: compact title, 0.9s hold" },
  { id: "approved", text: ROWS[APPROVED].text, readyAt: ROW_STARTS[APPROVED], leaveAt: ROW_STARTS[APPROVED] + APPROVED_HOLD, fontPx: 21, ui: true, exception: "Brief: approved row held 1.2s" },
  { id: "prompt", text: P.pages.prompt, readyAt: S9.type + PROMPT_DUR, leaveAt: 13, fontPx: 22, ui: true, exception: "Read as it types; brief: Pages beat of 4s" },
  { id: "pill", text: S9_PILL_LABEL, readyAt: 11.8, leaveAt: 13 + 6, fontPx: 28 },
];

/**
 * Scene 9 body as a pure function of t. `shift` moves Typewriter start frames
 * so Scene 10 can show the frozen end frame.
 */
export const Scene09Body: React.FC<{ t: number; F: (s: number) => number; clock: number; shift?: number; frozen?: boolean }> = ({ t, F, clock, shift = 0, frozen = false }) => {
  const o = opening(t, S9_TITLE, TITLE_START, "compact");
  const toControl = EASE(ramp(t, S9.control, S9.control + 0.3));
  const toRecords = EASE(ramp(t, S9.records, S9.records + 0.3));
  const toPages = EASE(ramp(t, S9.pages, S9.pages + 0.3));
  const blurOf = (p: number) => Math.sin(Math.PI * p) * 10;
  const cam = camAt(S9_CAM_KEYS, t, EASE);
  const cursorO = EASE(ramp(t, 2.8, 3.1)) * (1 - EASE(ramp(t, 12.2, 12.6)));
  const layer = (show: number, blur: number, node: React.ReactNode, key: string) =>
    show > 0 ? (
      <div key={key} style={{ position: "absolute", inset: 0, opacity: show, filter: blur > 0.05 ? `blur(${blur}px)` : undefined }}>
        {node}
      </div>
    ) : null;
  const dS8 = sceneById("S08").duration;
  return (
    <>
      {frozen ? (
        <PlateBackground plate="03" duration={F(1)} kbFrom={S9_KB_END} kbTo={S9_KB_END} timeOffset={sceneById("S10").start - 15} {...S2_PLATE} />
      ) : (
        <PlateBackground plate="02" to="03" crossfadeAt={F(0.2)} crossfadeSeconds={1.5} duration={F(sceneById(S).duration)} kbFrom={S8_KB_END} kbTo={S9_KB_END} timeOffset={sceneById(S).start - 15} {...S2_PLATE} />
      )}
      <FeatureTitle text={S9_TITLE} startFrame={F(TITLE_START) + shift} variant="compact" />
      <ProductStage cam={cam} frameStyle={o.frameStyle} visible={o.visible} cursor={{ keys: S9_CURSOR, opacity: o.showPrev ? 0 : cursorO }}>
        {layer(1 - toControl, blurOf(toControl), <ReviewsPage s={reviewsStateAt(dS8, F, clock, shift - F(dS8))} />, "rev")}
        {layer(toControl * (1 - toRecords), blurOf(toControl) + blurOf(toRecords), <ControlRoomPage s={controlRoomStateAt(sceneById("S04").duration, clock)} />, "cr")}
        {layer(toRecords * (1 - toPages), blurOf(toRecords) + blurOf(toPages), <RecordsPage s={recordsStateAt(t, F, clock, shift)} />, "rec")}
        {layer(toPages, blurOf(toPages), <PagesPage s={pagesStateAt(t, F, shift)} />, "pages")}
      </ProductStage>
      {frozen ? null : <Pills t={t} pills={S9_PILLS} />}
      {frozen ? null : <GuardLayer scene={S} />}
    </>
  );
};

export const Scene09Records: React.FC = () => {
  const { t, F, clock } = useScene(S);
  return (
    <AbsoluteFill style={{ width: 1920, height: 1080 }}>
      <Scene09Body t={t} F={F} clock={clock} />
    </AbsoluteFill>
  );
};

/** The frozen last frame of Scene 9, for Scene 10's opening. */
export const Scene09EndFrame: React.FC<{ F: (s: number) => number; clock: number }> = ({ F, clock }) => {
  const frame = useCurrentFrame();
  const d = sceneById(S).duration;
  return <Scene09Body t={d} F={F} clock={clock} shift={frame - F(d)} frozen />;
};
