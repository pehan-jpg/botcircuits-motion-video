import React from "react";
import { AbsoluteFill } from "remotion";
import { CHAT_CPS, EASE } from "../theme";
import { sceneById } from "../timeline";
import { PLACEHOLDERS as P } from "../placeholders";
import { PlateBackground } from "../backgrounds/PlateBackground";
import { GuardLayer } from "../components/GuardLayer";
import { FeatureTitle } from "../components/FeatureTitle";
import { BELL } from "../components/chat/Sidebar";
import { camAt, FRAME_CENTRE, nat, type Cam, type CamKey } from "../components/chat/ProductWindow";
import { PlaybookPage } from "../components/pages/PlaybookPage";
import { cardX, REVIEWS, ReviewsPage, type ReviewsState } from "../components/pages/ReviewsPage";
import type { CursorKey } from "../components/Cursor";
import { typeDuration } from "../lib/typewriter";
import type { TextBeatSpec } from "../lib/guards";
import { ClockWidget, EmailCard, s7PlaybookAt, S7_END_CAM, S7_PILL_LABEL } from "./Scene07Evening";
import { S2_PLATE } from "./Scene02Intro";
import { opening, Pills, ProductStage, ramp, useScene, type Pill } from "./shared/stage";

const S = "S08" as const;
export const S8_TITLE = "People approve what matters";
const TITLE_START = 0.15;
export const S8 = { bellClick: 3.7, page: 3.75, itemClick: 4.6, detail: 4.65, findings: [5.1, 5.3, 5.5], zoomFlag: 5.9, noteClick: 8.5, glyph: 8.4, type: 8.8, approve: 11.25, strip: 11.7, steps: [11.9, 12.3, 12.7, 13.6], email: 12.9, slack: 13.9, zoomOut: 14.4 };
export const S8_KB_END = 1.25;

export const reviewsStateAt = (t: number, F: (s: number) => number, clock: number, shift = 0): ReviewsState => ({
  itemAppear: EASE(ramp(t, S8.page + 0.1, S8.page + 0.4)),
  itemPressed: Math.max(0, 1 - Math.abs(t - S8.itemClick) / 0.15),
  detail: EASE(ramp(t, S8.detail, S8.detail + 0.35)),
  findings: S8.findings.map((a) => EASE(ramp(t, a, a + 0.4))),
  glyph: EASE(ramp(t, S8.glyph, S8.glyph + 0.4)),
  noteStart: F(S8.type) + shift,
  noteFocus: t >= S8.noteClick ? 1 : 0,
  approvePressed: Math.max(0, 1 - Math.abs(t - S8.approve) / 0.15),
  approveHalo: Math.sin(Math.PI * ramp(t, S8.approve, S8.approve + 1.0)),
  approved: t >= S8.approve + 0.15 ? 1 : 0,
  strip: EASE(ramp(t, S8.strip, S8.strip + 0.4)),
  stripSteps: S8.steps.map((a) => EASE(ramp(t, a, a + 0.3))),
  email: EASE(ramp(t, S8.email, S8.email + 0.4)),
  slack: EASE(ramp(t, S8.slack, S8.slack + 0.4)),
  clock,
});

const flagFocus = nat(cardX(2) + 190, REVIEWS.findingsY + 120);
const noteFocus = nat(1120, 620);
const stripFocus = nat(1080, 800);
export const S8_CAM_KEYS: CamKey[] = [
  { t: 0, c: S7_END_CAM },
  { t: 1.6, c: { ...FRAME_CENTRE, z: 1 } },
  { t: S8.zoomFlag, c: { x: FRAME_CENTRE.x, y: FRAME_CENTRE.y + 2, z: 1.008 }, lin: true },
  { t: S8.zoomFlag + 0.6, c: { ...flagFocus, z: 1.6 } },
  { t: 8.0, c: { x: flagFocus.x - 12, y: flagFocus.y + 4, z: 1.6 }, lin: true },
  { t: 8.6, c: { ...noteFocus, z: 1.4 } },
  { t: 11.6, c: { x: noteFocus.x + 14, y: noteFocus.y + 4, z: 1.4 }, lin: true },
  { t: 12.2, c: { ...stripFocus, z: 1.4 } },
  { t: S8.zoomOut, c: { x: stripFocus.x + 12, y: stripFocus.y, z: 1.4 }, lin: true },
  { t: S8.zoomOut + 0.6, c: { ...FRAME_CENTRE, z: 1 } },
  { t: 17, c: { x: FRAME_CENTRE.x, y: FRAME_CENTRE.y + 2, z: 1.008 }, lin: true },
];
export const S8_END_CAM: Cam = S8_CAM_KEYS[S8_CAM_KEYS.length - 1].c;

const approveC = nat(REVIEWS.approve.x + REVIEWS.approve.w / 2, REVIEWS.approve.y + REVIEWS.approve.h / 2);
export const S8_CURSOR: CursorKey[] = [
  { ...nat(1300, 700), t: 3.0 },
  { ...nat(BELL.x - 2, BELL.y + 2), t: S8.bellClick - 0.05 },
  { ...nat(BELL.x - 2, BELL.y + 2), t: S8.bellClick, click: true },
  { ...nat(900, REVIEWS.item.y + 42), t: S8.itemClick - 0.05 },
  { ...nat(900, REVIEWS.item.y + 42), t: S8.itemClick, click: true },
  { ...nat(1400, REVIEWS.note.y + 36), t: S8.noteClick - 0.05 },
  { ...nat(1400, REVIEWS.note.y + 36), t: S8.noteClick, click: true },
  { ...approveC, t: S8.approve - 0.05 },
  { ...approveC, t: S8.approve, click: true },
  { ...nat(1700, 860), t: 12.6 },
];

export const S8_PILL_LABEL = "Approved by Emily Carter";
export const S8_PILLS: Pill[] = [
  { label: S7_PILL_LABEL, at: -10, until: 0, top: 846 },
  { label: S8_PILL_LABEL, at: 14.5, until: 999 },
];
export const SCENE08_TEXT: TextBeatSpec[] = [
  { id: "title", text: S8_TITLE, readyAt: TITLE_START, leaveAt: TITLE_START + 1.87, fontPx: 88, exception: "Brief: compact title, 0.9s hold" },
  { id: "flag", text: "Invoice date does not match the date of loss", readyAt: S8.zoomFlag + 0.6, leaveAt: 11.6, fontPx: 24, ui: true },
  { id: "note", text: P.review.note, readyAt: S8.type + typeDuration(P.review.note, CHAT_CPS, "review-note"), leaveAt: 11.6, fontPx: 22, ui: true, exception: "Brief: approve follows the note" },
  { id: "pill", text: S8_PILL_LABEL, readyAt: 14.8, leaveAt: 17, fontPx: 28 },
];

export const Scene08Review: React.FC = () => {
  const { t, F, clock, dur, start } = useScene(S);
  const o = opening(t, S8_TITLE, TITLE_START, "compact");
  const toReviews = EASE(ramp(t, S8.page, S8.page + 0.3));
  const blur = Math.sin(Math.PI * toReviews) * 10;
  const cam = camAt(S8_CAM_KEYS, t, EASE);
  const cursorO = EASE(ramp(t, 3.0, 3.3)) * (1 - EASE(ramp(t, 12.3, 12.7)));
  const pb = { ...s7PlaybookAt(sceneById("S07").duration, clock), bellPulse: o.showPrev ? 0 : Math.max(0, Math.sin(Math.PI * ramp(t, 2.9, 3.4))) };
  return (
    <AbsoluteFill style={{ width: 1920, height: 1080 }}>
      <PlateBackground plate="01" to="02" crossfadeAt={0} crossfadeSeconds={1.5} duration={F(dur)} kbFrom={1} kbTo={S8_KB_END} timeOffset={start - 15} {...S2_PLATE} />
      <FeatureTitle text={S8_TITLE} startFrame={F(TITLE_START)} variant="compact" />
      <ProductStage cam={cam} frameStyle={o.frameStyle} visible={o.visible} cursor={{ keys: S8_CURSOR, opacity: o.showPrev ? 0 : cursorO }}>
        {toReviews < 1 ? (
          <div style={{ position: "absolute", inset: 0, opacity: 1 - toReviews, filter: blur > 0.05 ? `blur(${blur}px)` : undefined }}>
            <PlaybookPage s={pb} />
            {/* Carried over from Scene 7, then faded out. */}
            <EmailCard opacity={1 - EASE(ramp(t, 0, 0.4))} />
          </div>
        ) : null}
        {toReviews > 0 ? (
          <div style={{ position: "absolute", inset: 0, opacity: toReviews, filter: blur > 0.05 ? `blur(${blur}px)` : undefined }}>
            <ReviewsPage s={reviewsStateAt(t, F, clock)} />
          </div>
        ) : null}
      </ProductStage>
      <ClockWidget label={P.evening.clockEnd} opacity={1 - EASE(ramp(t, 0, 0.4))} night={0} />
      <Pills t={t} pills={S8_PILLS} />
      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};
