import React from "react";
import { AbsoluteFill } from "remotion";
import { EASE } from "../theme";
import { sceneById } from "../timeline";
import { PlateBackground } from "../backgrounds/PlateBackground";
import { GuardLayer } from "../components/GuardLayer";
import { FeatureTitle } from "../components/FeatureTitle";
import { navY } from "../components/chat/Sidebar";
import { camAt, FRAME_CENTRE, nat, type Cam, type CamKey } from "../components/chat/ProductWindow";
import { ReviewsPage } from "../components/pages/ReviewsPage";
import { RECORDS, RecordsPage, ROWS, type RecordsState } from "../components/pages/RecordsPage";
import type { CursorKey } from "../components/Cursor";
import type { TextBeatSpec } from "../lib/guards";
import { ApprovedToast, reviewsStateAt, S8, S8_END_CAM, S8_KB_END, S8_PILL_LABEL, TOAST_CLICK } from "./Scene08Review";
import { S2_PLATE } from "./Scene02Intro";
import { opening, Pills, ProductStage, ramp, useScene, type Pill } from "./shared/stage";

const S = "S09" as const;
export const S9_TITLE = "Every step on record";
/** The title starts once the previous frame has sunk away (clean title rule). */
const TITLE_START = 0.45;
const ROW_GAP = 0.35;
const APPROVED = 5;
const APPROVED_HOLD = 1.2;
/** Scene 9 beats: Records opens from the toast clicked in Scene 8; Replay; then the cursor clicks Pages. */
export const S9 = { replay: 4.0, rows0: 4.2, clickPages: 8.5 };
export const S9_KB_END = 1.0;

/** Replay row starts: 0.35s apart, the approved row held 1.2s. */
export const ROW_STARTS = ROWS.map((_, i) => S9.rows0 + i * ROW_GAP + (i > APPROVED ? APPROVED_HOLD - ROW_GAP : 0));
const REPLAY_END = ROW_STARTS[ROWS.length - 1] + ROW_GAP;

/** Records at Scene 9 time t: Replay highlights the rows in turn with a scrubber. Scene 10 opens on recordsStateAt(9). */
export const recordsStateAt = (t: number, clock: number): RecordsState => ({
  appear: 1,
  replayPressed: Math.max(0, 1 - Math.abs(t - S9.replay) / 0.15),
  rowType: ROWS.map(() => Infinity),
  highlight: ROW_STARTS.map((a, i) => {
    if (t < S9.replay) return 0;
    const next = i < ROW_STARTS.length - 1 ? ROW_STARTS[i + 1] : REPLAY_END + 0.4;
    return EASE(ramp(t, a, a + 0.15)) * (1 - EASE(ramp(t, next, next + 0.2)));
  }),
  reveal: ROWS.map(() => 1),
  scrub: t < S9.replay ? 1 : ramp(t, S9.rows0, REPLAY_END),
  clock,
});

const timelineFocus = nat(RECORDS.x + 560, 470);
export const S9_CAM_KEYS: CamKey[] = [
  { t: 0, c: S8_END_CAM },
  { t: 1.6, c: { ...FRAME_CENTRE, z: 1 } },
  { t: 3.5, c: { x: FRAME_CENTRE.x, y: FRAME_CENTRE.y + 2, z: 1.006 }, lin: true },
  { t: 4.1, c: { ...timelineFocus, z: 1.35 } },
  { t: REPLAY_END, c: { x: timelineFocus.x + 6, y: timelineFocus.y + 30, z: 1.35 }, lin: true },
  { t: 8.4, c: { ...FRAME_CENTRE, z: 1 } },
  { t: 9, c: { x: FRAME_CENTRE.x + 2, y: FRAME_CENTRE.y + 1, z: 1.004 }, lin: true },
];
export const S9_END_CAM: Cam = S9_CAM_KEYS[S9_CAM_KEYS.length - 1].c;

const replayC = nat(RECORDS.replay.x + RECORDS.replay.w / 2, RECORDS.replay.y + RECORDS.replay.h / 2);
/** The Pages item in the sidebar (native px); Scene 10 opens from this click. */
export const S9_PAGES_NAV = { x: 63, y: navY("pages") };
export const S9_CURSOR: CursorKey[] = [
  { ...TOAST_CLICK(), t: -1 },
  { ...TOAST_CLICK(), t: 0.6 },
  { ...nat(1560, 520), t: 3.4 },
  { ...replayC, t: S9.replay - 0.05 },
  { ...replayC, t: S9.replay, click: true },
  { ...nat(1560, 600), t: 5.4 },
  { ...nat(S9_PAGES_NAV.x, S9_PAGES_NAV.y), t: S9.clickPages - 0.05 },
  { ...nat(S9_PAGES_NAV.x, S9_PAGES_NAV.y), t: S9.clickPages, click: true },
];

export const S9_PILLS: Pill[] = [{ label: S8_PILL_LABEL, at: -10, until: 0 }];
export const SCENE09_TEXT: TextBeatSpec[] = [
  { id: "title", text: S9_TITLE, readyAt: TITLE_START, leaveAt: TITLE_START + 1.87, fontPx: 88, exception: "Brief: compact title, 0.9s hold" },
  { id: "records", text: ROWS.map((r) => r.text).join(" "), readyAt: 4.1, leaveAt: 9, fontPx: 21, ui: true, exception: "Brief: Records in 9s; rows read during the replay" },
  { id: "approved", text: ROWS[APPROVED].text, readyAt: ROW_STARTS[APPROVED], leaveAt: ROW_STARTS[APPROVED] + APPROVED_HOLD, fontPx: 21, ui: true, exception: "Brief: approved row held 1.2s" },
];

export const Scene09Records: React.FC = () => {
  const { t, F, clock, dur, start } = useScene(S);
  const o = opening(t, S9_TITLE, TITLE_START, "compact");
  const cam = camAt(S9_CAM_KEYS, t, EASE);
  const cursorO = o.showPrev ? 1 - o.sink : EASE(ramp(t, 3.2, 3.5));
  const dS8 = sceneById("S08").duration;
  return (
    <AbsoluteFill style={{ width: 1920, height: 1080 }}>
      <PlateBackground plate="02" to="03" crossfadeAt={F(0.2)} crossfadeSeconds={1.5} duration={F(dur)} kbFrom={S8_KB_END} kbTo={S9_KB_END} timeOffset={start - 15} {...S2_PLATE} />
      <FeatureTitle text={S9_TITLE} startFrame={F(TITLE_START)} variant="compact" />
      <ProductStage cam={cam} frameStyle={o.frameStyle} visible={o.visible} cursor={{ keys: S9_CURSOR, opacity: cursorO }}>
        {o.showPrev ? (
          <>
            <ReviewsPage s={reviewsStateAt(dS8, F, clock, -F(dS8))} />
            <ApprovedToast opacity={1} pressed={Math.max(0, 1 - Math.abs(dS8 + t - S8.toastClick) / 0.15)} />
          </>
        ) : (
          <RecordsPage s={recordsStateAt(t, clock)} />
        )}
      </ProductStage>
      <Pills t={t} pills={S9_PILLS} />
      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};
