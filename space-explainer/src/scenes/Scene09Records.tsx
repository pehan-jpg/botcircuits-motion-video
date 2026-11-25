import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CHAT_CPS, EASE, PRODUCT } from "../theme";
import { sceneById } from "../timeline";
import { PLACEHOLDERS as P } from "../placeholders";
import { PlateBackground } from "../backgrounds/PlateBackground";
import { GuardLayer } from "../components/GuardLayer";
import { FeatureTitle } from "../components/FeatureTitle";
import { navY } from "../components/chat/Sidebar";
import { camAt, FRAME_CENTRE, nat, type Cam, type CamKey } from "../components/chat/ProductWindow";
import { ReviewsPage } from "../components/pages/ReviewsPage";
import { RECORDS, RecordsPage, ROWS, type RecordsState } from "../components/pages/RecordsPage";
import { PAGES, PagesPage, type PagesState } from "../components/pages/PagesPage";
import { ConciergeCard, lerpRect, type Rect } from "../components/ConciergeCard";
import type { CursorKey } from "../components/Cursor";
import { typeDuration } from "../lib/typewriter";
import type { TextBeatSpec } from "../lib/guards";
import { reviewsStateAt, S8_END_CAM, S8_KB_END, S8_PILL_LABEL } from "./Scene08Review";
import { S2_PLATE } from "./Scene02Intro";
import { opening, Pills, ProductStage, ramp, useScene, type Pill } from "./shared/stage";

const S = "S09" as const;
export const S9_TITLE = "Every step on record";
const TITLE_START = 0.15;
const APPROVED = 5;
/** Scene 9 beats, seconds from the scene start. Records opens from the toast clicked in Scene 8. */
export const S9 = { records: 0.3, clickPages: 6.8, pages: 6.85, type: 7.35, build: 9.2, claimRow: 10.2, clickClaim: 11.4, record: 11.45, replay: 12.1, rewind: [12.25, 13.45], expand: [13.8, 14.8] };
const PROMPT_DUR = typeDuration(P.pages.prompt, CHAT_CPS, "pages-prompt");
const BUILD_CLICK = S9.type + PROMPT_DUR + 0.2;
export const S9_KB_END = 1.0;

type View = "records" | "pages" | "record";
const viewAt = (t: number): View => (t < S9.pages + 0.15 ? "records" : t < S9.record + 0.15 ? "pages" : "record");

/** Records: complete and still at first; after Replay the scrubber rewinds from the last row to the first. */
export const recordsStateAt = (t: number, clock: number): RecordsState => {
  const rewinding = t >= S9.replay;
  const scrub = rewinding ? 1 - EASE(ramp(t, S9.rewind[0], S9.rewind[1])) : 1;
  const pos = scrub * (ROWS.length - 1);
  return {
    appear: 1,
    replayPressed: Math.max(0, 1 - Math.abs(t - S9.replay) / 0.15),
    rowType: ROWS.map(() => Infinity),
    highlight: ROWS.map((_, i) => (rewinding ? Math.max(0, 1 - Math.abs(pos - i) * 1.2) : 0)),
    reveal: ROWS.map(() => 1),
    scrub,
    clock,
  };
};

export const pagesStateAt = (t: number, F: (s: number) => number, shift = 0): PagesState => ({
  typeStart: F(S9.type) + shift,
  typing: t >= S9.type,
  pressed: Math.max(0, 1 - Math.abs(t - BUILD_CLICK) / 0.15),
  build: EASE(ramp(t, S9.build, S9.build + 0.5)),
  rows: ramp(t, S9.build + 0.2, S9.build + 0.8),
  bars: EASE(ramp(t, S9.build + 0.4, S9.build + 1.0)),
  claimRow: EASE(ramp(t, S9.claimRow, S9.claimRow + 0.35)),
  claimPressed: Math.max(0, 1 - Math.abs(t - S9.clickClaim) / 0.15),
});

const timelineFocus = nat(RECORDS.x + 560, 470);
const promptFocus = nat(1060, 270);
const outFocus = nat(1060, 590);
export const S9_CAM_KEYS: CamKey[] = [
  { t: 0, c: S8_END_CAM },
  { t: 1.6, c: { ...FRAME_CENTRE, z: 1 } },
  { t: 3.3, c: { x: FRAME_CENTRE.x, y: FRAME_CENTRE.y + 2, z: 1.006 }, lin: true },
  { t: 3.9, c: { ...timelineFocus, z: 1.35 } },
  { t: 6.4, c: { x: timelineFocus.x + 6, y: timelineFocus.y + 30, z: 1.35 }, lin: true },
  { t: S9.pages + 0.2, c: { ...FRAME_CENTRE, z: 1 } },
  { t: S9.type + 0.2, c: { ...promptFocus, z: 1.3 } },
  { t: BUILD_CLICK, c: { x: promptFocus.x + 14, y: promptFocus.y, z: 1.3 }, lin: true },
  { t: S9.build + 0.7, c: { ...outFocus, z: 1.2 } },
  { t: S9.clickClaim - 0.3, c: { x: outFocus.x + 8, y: outFocus.y + 2, z: 1.205 }, lin: true },
  { t: S9.record + 0.5, c: { ...FRAME_CENTRE, z: 1 } },
  { t: 16, c: { x: FRAME_CENTRE.x, y: FRAME_CENTRE.y + 2, z: 1.006 }, lin: true },
];
export const S9_END_CAM: Cam = S9_CAM_KEYS[S9_CAM_KEYS.length - 1].c;

/** Claim row in the Pages table (native px), measured from the rendered page. */
export const S9_CLAIM_ROW_NATIVE = { x: 744, y: 663 };
const replayC = nat(RECORDS.replay.x + RECORDS.replay.w / 2, RECORDS.replay.y + RECORDS.replay.h / 2);
const buildC = nat(PAGES.button.x + PAGES.button.w / 2, PAGES.button.y + PAGES.button.h / 2);
const claimC = nat(S9_CLAIM_ROW_NATIVE.x, S9_CLAIM_ROW_NATIVE.y);
export const S9_CURSOR: CursorKey[] = [
  { ...nat(1500, 420), t: -1 },
  { ...nat(1560, 520), t: 5.6 },
  { ...nat(63, navY("pages")), t: S9.clickPages - 0.05 },
  { ...nat(63, navY("pages")), t: S9.clickPages, click: true },
  { ...nat(1300, 340), t: 7.6 },
  { ...buildC, t: BUILD_CLICK - 0.05 },
  { ...buildC, t: BUILD_CLICK, click: true },
  { ...claimC, t: S9.clickClaim - 0.05 },
  { ...claimC, t: S9.clickClaim, click: true },
  { ...replayC, t: S9.replay - 0.05 },
  { ...replayC, t: S9.replay, click: true },
  { ...nat(1650, 700), t: 13.6 },
];

export const S9_PILL_LABEL = "Reports from the record";
export const S9_PILLS: Pill[] = [
  { label: S8_PILL_LABEL, at: -10, until: 0 },
  { label: S9_PILL_LABEL, at: 9.5, until: 13.4 },
];
export const SCENE09_TEXT: TextBeatSpec[] = [
  { id: "title", text: S9_TITLE, readyAt: TITLE_START, leaveAt: TITLE_START + 1.87, fontPx: 88, exception: "Brief: compact title, 0.9s hold" },
  { id: "records", text: ROWS.map((r) => r.text).join(" "), readyAt: 3.9, leaveAt: S9.pages, fontPx: 21, ui: true, exception: "Brief: Records first, then Pages, in 16s" },
  { id: "approved", text: ROWS[APPROVED].text, readyAt: 3.9, leaveAt: S9.pages, fontPx: 21, ui: true },
  { id: "prompt", text: P.pages.prompt, readyAt: S9.type + PROMPT_DUR, leaveAt: S9.record, fontPx: 22, ui: true, exception: "Read as it types" },
  { id: "pill", text: S9_PILL_LABEL, readyAt: 9.8, leaveAt: 13.4, fontPx: 28 },
];

const toScreen = (c: Cam, p: { x: number; y: number }) => ({ x: FRAME_CENTRE.x + c.z * (p.x - c.x), y: FRAME_CENTRE.y + c.z * (p.y - c.y) });
/** Where the Concierge chat ends in this scene (screen px); Scene 10 continues from here. */
export const S9_CARD_END: Rect = { x: 480, y: 240, w: 960, h: 560 };
/** First Records row, as a screen rect at time t. */
const firstRowRect = (cam: Cam): Rect => {
  const a = toScreen(cam, nat(RECORDS.x + 14, RECORDS.rowY0));
  const k = PRODUCT.scale * cam.z;
  return { x: a.x, y: a.y, w: (RECORDS.w - 28) * k, h: 44 * k };
};
/** Concierge chat growing out of the first Records row (screen space). */
export const conciergeFromRecord = (t: number, cam: Cam) => {
  const p = EASE(ramp(t, S9.expand[0], S9.expand[1]));
  return { r: lerpRect(firstRowRect(cam), S9_CARD_END, p), opacity: Math.min(1, ramp(t, S9.expand[0], S9.expand[0] + 0.15)), content: EASE(ramp(t, S9.expand[0] + 0.5, S9.expand[1] + 0.1)) };
};

/** Scene 9 body as a pure function of t. `shift` moves Typewriter start frames; Scene 10 shows the frozen end frame. */
export const Scene09Body: React.FC<{ t: number; F: (s: number) => number; clock: number; shift?: number; frozen?: boolean }> = ({ t, F, clock, shift = 0, frozen = false }) => {
  const o = opening(t, S9_TITLE, TITLE_START, "compact");
  const v = viewAt(t);
  const blurOf = (at: number) => Math.sin(Math.PI * ramp(t, at, at + 0.3)) * 10;
  const blur = v === "pages" ? blurOf(S9.pages) : v === "record" ? blurOf(S9.record) : 0;
  const cam = camAt(S9_CAM_KEYS, t, EASE);
  const cursorO = EASE(ramp(t, 5.4, 5.7)) * (1 - EASE(ramp(t, 13.6, 14.0)));
  const dS8 = sceneById("S08").duration;
  const c = conciergeFromRecord(t, cam);
  return (
    <>
      {frozen ? (
        <PlateBackground plate="03" duration={F(1)} kbFrom={S9_KB_END} kbTo={S9_KB_END} timeOffset={sceneById("S10").start - 15} {...S2_PLATE} />
      ) : (
        <PlateBackground plate="02" to="03" crossfadeAt={F(0.2)} crossfadeSeconds={1.5} duration={F(sceneById(S).duration)} kbFrom={S8_KB_END} kbTo={S9_KB_END} timeOffset={sceneById(S).start - 15} {...S2_PLATE} />
      )}
      <FeatureTitle text={S9_TITLE} startFrame={F(TITLE_START) + shift} variant="compact" />
      <ProductStage cam={cam} frameStyle={o.frameStyle} visible={o.visible} cursor={{ keys: S9_CURSOR, opacity: o.showPrev || frozen ? 0 : cursorO }}>
        {o.showPrev ? (
          <ReviewsPage s={reviewsStateAt(dS8, F, clock, shift - F(dS8))} />
        ) : (
          <div style={{ position: "absolute", inset: 0, filter: blur > 0.05 ? `blur(${blur}px)` : undefined }}>
            {v === "pages" ? <PagesPage s={pagesStateAt(t, F, shift)} /> : <RecordsPage s={recordsStateAt(t, clock)} />}
          </div>
        )}
      </ProductStage>
      {!frozen && c.opacity > 0 ? <ConciergeCard r={c.r} opacity={c.opacity} content={c.content} replyStart={null} chip={0} clock={clock} /> : null}
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

/** The frozen last frame of Scene 9 (without the Concierge card), for Scene 10's opening. */
export const Scene09EndFrame: React.FC<{ F: (s: number) => number; clock: number }> = ({ F, clock }) => {
  const frame = useCurrentFrame();
  const d = sceneById(S).duration;
  return <Scene09Body t={d} F={F} clock={clock} shift={frame - F(d)} frozen />;
};
