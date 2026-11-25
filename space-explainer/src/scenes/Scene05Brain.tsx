import React from "react";
import { AbsoluteFill } from "remotion";
import { EASE } from "../theme";
import { sceneById } from "../timeline";
import { PLACEHOLDERS as P } from "../placeholders";
import { PlateBackground } from "../backgrounds/PlateBackground";
import { GuardLayer } from "../components/GuardLayer";
import { FeatureTitle, featureTitleTiming } from "../components/FeatureTitle";
import { camAt, FRAME_CENTRE, nat, type Cam, type CamKey } from "../components/chat/ProductWindow";
import { ControlRoomPage } from "../components/office/ControlRoomPage";
import { BRAIN, BrainPage, tileCentre, TILES, type BrainState, type BrainView } from "../components/pages/BrainPage";
import type { CursorKey } from "../components/Cursor";
import { CHAT_CPS } from "../theme";
import { typeDuration } from "../lib/typewriter";
import type { TextBeatSpec } from "../lib/guards";
import { controlRoomStateAt, S4_END_CAM, S4_KB_END } from "./Scene04Agents";
import { S2_PLATE } from "./Scene02Intro";
import { opening, Pills, ProductStage, ramp, useScene, type Pill } from "./shared/stage";

const S = "S05" as const;
export const S5_TITLE = "Ground it in your own sources";
/** The title starts once the previous frame has sunk away (clean title rule). */
const TITLE_START = 0.45;
/** Scene 5 beats, seconds from the scene start. */
/** The Brain page has risen by this time; the S1 tag appears in its file row 0.5s later. */
const RISE_END = TITLE_START + featureTitleTiming(S5_TITLE, "compact").frameRiseEnd;
export const S5 = {
  highlight: RISE_END + 0.5,
  clickConnect: 4.7,
  connect: 4.75,
  clicks: { drive: 5.3, sheets: 6.1, web: 6.9, slack: 8.75, file: 9.45 },
  urlFocus: 6.95,
  urlType: 7.05,
  clickKb: 10.45,
  kb: 10.5,
  clickGraph: 11.4,
  graph: 11.45,
  clickUse: 13.4,
  zoomIn: 5.0,
  zoomOut: 10.1,
};
const URL_DONE = S5.urlType + typeDuration(P.brain.url, CHAT_CPS, "brain-url");
/** Appear and indexing window per source (same order as P.brain.sources). */
const SRC_TIMES: [number, number][] = [
  [S5.clicks.drive + 0.05, 0.55],
  [S5.clicks.sheets + 0.05, 0.55],
  [URL_DONE + 0.1, 0.5],
  [S5.clicks.slack + 0.05, 0.5],
  [S5.clicks.file + 0.05, 0.55],
  [S5.clicks.file + 0.15, 0.55],
];
export const S5_KB_END = S4_KB_END + 0.003;
const plateOffset = (id: "S05") => sceneById(id).start - 15;

const viewAt = (t: number): BrainView => (t < S5.connect + 0.15 ? "files" : t < S5.kb + 0.15 ? "connect" : "kb");

export const brainStateAt = (t: number, F: (s: number) => number, shift = 0): BrainState => ({
  view: viewAt(t),
  s1Highlight: EASE(ramp(t, S5.highlight, S5.highlight + 0.3)),
  tilePressed: TILES.map((tl) => {
    const c = (S5.clicks as Record<string, number>)[tl.kind];
    return c === undefined ? 0 : Math.max(0, 1 - Math.abs(t - c) / 0.15);
  }),
  sources: SRC_TIMES.map(([a, len]) => ({ appear: EASE(ramp(t, a, a + 0.3)), progress: ramp(t, a + 0.1, a + 0.1 + len) })),
  urlFocus: EASE(ramp(t, S5.urlFocus, S5.urlFocus + 0.2)),
  urlTypeStart: F(S5.urlType) + shift,
  inner: t >= S5.graph ? 1 : 0,
  graph: ramp(t, S5.graph + 0.1, S5.graph + 1.5),
  usePressed: Math.max(0, 1 - Math.abs(t - S5.clickUse) / 0.15),
});

const content = nat(1077, 520);
export const S5_CAM_KEYS: CamKey[] = [
  { t: 0, c: S4_END_CAM },
  { t: 1.6, c: { ...FRAME_CENTRE, z: 1 } },
  { t: RISE_END, c: { x: FRAME_CENTRE.x, y: FRAME_CENTRE.y + 2, z: 1.006 }, lin: true },
  { t: RISE_END + 0.45, c: { ...nat(1077, 320), z: 1.36 } },
  { t: S5.zoomIn, c: { ...nat(1082, 322), z: 1.36 }, lin: true },
  { t: S5.zoomIn + 0.6, c: { ...content, z: 1.46 } },
  { t: S5.zoomOut, c: { x: content.x + 16, y: content.y + 4, z: 1.47 }, lin: true },
  { t: S5.kb + 0.4, c: { ...nat(1077, 560), z: 1.33 } },
  { t: 12.7, c: { ...nat(1090, 566), z: 1.34 }, lin: true },
  { t: 13.2, c: { ...FRAME_CENTRE, z: 1 } },
  { t: 14, c: { x: FRAME_CENTRE.x + 2, y: FRAME_CENTRE.y + 2, z: 1.006 }, lin: true },
];
export const S5_END_CAM: Cam = S5_CAM_KEYS[S5_CAM_KEYS.length - 1].c;

const n = (p: { x: number; y: number }) => nat(p.x, p.y);
/** "Use in playbook" button centre (native px). */
export const S5_USE_NATIVE = { x: BRAIN.useBtn.x + BRAIN.useBtn.w / 2, y: BRAIN.useBtn.y + BRAIN.useBtn.h / 2 };
export const S5_CURSOR: CursorKey[] = [
  { ...nat(1300, 700), t: 3.5 },
  { ...nat(BRAIN.tabX.connect, BRAIN.tabsY + 10), t: S5.clickConnect - 0.05 },
  { ...nat(BRAIN.tabX.connect, BRAIN.tabsY + 10), t: S5.clickConnect, click: true },
  ...(["drive", "sheets", "web", "slack", "file"] as const).flatMap((k) => [
    { ...n(tileCentre(k)), t: S5.clicks[k] - 0.05 },
    { ...n(tileCentre(k)), t: S5.clicks[k], click: true },
  ]),
  { ...nat(BRAIN.tabX.kb, BRAIN.tabsY + 10), t: S5.clickKb - 0.05 },
  { ...nat(BRAIN.tabX.kb, BRAIN.tabsY + 10), t: S5.clickKb, click: true },
  { ...nat(BRAIN.innerTabs.graphX + 22, BRAIN.innerTabs.y + 10), t: S5.clickGraph - 0.05 },
  { ...nat(BRAIN.innerTabs.graphX + 22, BRAIN.innerTabs.y + 10), t: S5.clickGraph, click: true },
  { ...nat(S5_USE_NATIVE.x, S5_USE_NATIVE.y), t: S5.clickUse - 0.05 },
  { ...nat(S5_USE_NATIVE.x, S5_USE_NATIVE.y), t: S5.clickUse, click: true },
];

export const S5_PILL_LABEL = "Answers point back to your sources";
export const S5_PILLS: Pill[] = [
  // Carried over from Scene 4's last frame, then faded out.
  { label: P.controlRoom.pills[3], at: -10, until: 0 },
  { label: S5_PILL_LABEL, at: 10.8, until: 999 },
];
export const SCENE05_TEXT: TextBeatSpec[] = [
  { id: "title", text: S5_TITLE, readyAt: TITLE_START, leaveAt: TITLE_START + 1.96, fontPx: 88, exception: "Brief: compact title, 0.9s hold" },
  { id: "sources", text: P.brain.sources.map((x) => `${x.name} ${x.done}`).join(" "), readyAt: SRC_TIMES[5][0] + 0.7, leaveAt: S5.kb, fontPx: 21, ui: true, exception: "Brief: five source types added one after another; each is read as it lands" },
  { id: "kb", text: P.brain.sources.map((x) => x.name).join(" "), readyAt: S5.kb + 0.4, leaveAt: S5.graph, fontPx: 21, ui: true, exception: "Brief: the list, then a short graph view" },
  { id: "pill", text: S5_PILL_LABEL, readyAt: 11.1, leaveAt: 14 + 1, fontPx: 28, carriesOver: true },
];

export const Scene05Brain: React.FC = () => {
  const { t, F, clock, dur } = useScene(S);
  const o = opening(t, S5_TITLE, TITLE_START, "compact");
  const v = viewAt(t);
  const swap = (at: number) => Math.sin(Math.PI * ramp(t, at, at + 0.3)) * 10;
  const blur = v === "connect" ? swap(S5.connect) : v === "kb" ? swap(S5.kb) : 0;
  const cam = camAt(S5_CAM_KEYS, t, EASE);
  const cursorO = EASE(ramp(t, 3.5, 3.8));
  // The clicked [S1] chip stays in its page and dissolves with it as the frame sinks.
  const prev = controlRoomStateAt(sceneById("S04").duration, clock);
  return (
    <AbsoluteFill style={{ width: 1920, height: 1080 }}>
      <PlateBackground plate="02" to="03" crossfadeAt={F(0.2)} crossfadeSeconds={1.5} duration={F(dur)} kbFrom={S4_KB_END} kbTo={S5_KB_END} timeOffset={plateOffset(S)} {...S2_PLATE} />
      <FeatureTitle text={S5_TITLE} startFrame={F(TITLE_START)} variant="compact" />
      <ProductStage cam={cam} frameStyle={o.frameStyle} visible={o.visible} cursor={{ keys: S5_CURSOR, opacity: o.showPrev ? 0 : cursorO }}>
        {o.showPrev ? (
          <ControlRoomPage s={prev} />
        ) : (
          <div style={{ position: "absolute", inset: 0, filter: blur > 0.05 ? `blur(${blur}px)` : undefined }}>
            <BrainPage s={brainStateAt(t, F)} />
          </div>
        )}
      </ProductStage>
      <Pills t={t} pills={S5_PILLS} />
      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};
