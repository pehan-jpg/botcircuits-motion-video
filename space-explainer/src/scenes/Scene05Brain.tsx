import React from "react";
import { AbsoluteFill } from "remotion";
import { EASE, PRODUCT } from "../theme";
import { sceneById } from "../timeline";
import { PLACEHOLDERS as P } from "../placeholders";
import { PlateBackground } from "../backgrounds/PlateBackground";
import { GuardLayer } from "../components/GuardLayer";
import { FeatureTitle } from "../components/FeatureTitle";
import { camAt, FRAME_CENTRE, nat, type Cam, type CamKey } from "../components/chat/ProductWindow";
import { ControlRoomPage } from "../components/office/ControlRoomPage";
import { BRAIN, BrainPage, tileCentre, TILES, type BrainState, type BrainView } from "../components/pages/BrainPage";
import { SourceChip } from "../components/pages/common";
import type { CursorKey } from "../components/Cursor";
import { CHAT_CPS } from "../theme";
import { typeDuration } from "../lib/typewriter";
import type { TextBeatSpec } from "../lib/guards";
import { controlRoomStateAt, S4_CITE, S4_END_CAM, S4_KB_END } from "./Scene04Agents";
import { S2_PLATE } from "./Scene02Intro";
import { opening, Pills, ProductStage, ramp, useScene, type Pill } from "./shared/stage";

const S = "S05" as const;
export const S5_TITLE = "Ground it in your own sources";
const TITLE_START = 0.15;
/** Scene 5 beats, seconds from the scene start. */
export const S5 = {
  chipPark: [0.0, 0.55],
  chipLand: [2.5, 3.3],
  highlight: 3.3,
  clickConnect: 4.1,
  connect: 4.15,
  clicks: { drive: 4.7, sheets: 5.5, web: 6.3, slack: 8.2, file: 8.9 },
  urlFocus: 6.35,
  urlType: 6.45,
  clickKb: 10.1,
  kb: 10.15,
  clickGraph: 11.1,
  graph: 11.15,
  clickUse: 13.4,
  zoomIn: 4.4,
  zoomOut: 9.7,
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
  { t: S5.zoomIn, c: { x: FRAME_CENTRE.x, y: FRAME_CENTRE.y + 2, z: 1.006 }, lin: true },
  { t: S5.zoomIn + 0.6, c: { ...content, z: 1.4 } },
  { t: S5.zoomOut, c: { x: content.x + 16, y: content.y + 4, z: 1.41 }, lin: true },
  { t: S5.kb + 0.4, c: { ...nat(1077, 560), z: 1.25 } },
  { t: 12.7, c: { ...nat(1090, 566), z: 1.26 }, lin: true },
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
  { label: S5_PILL_LABEL, at: 10.4, until: 999 },
];
export const SCENE05_TEXT: TextBeatSpec[] = [
  { id: "title", text: S5_TITLE, readyAt: TITLE_START, leaveAt: TITLE_START + 1.96, fontPx: 88, exception: "Brief: compact title, 0.9s hold" },
  { id: "sources", text: P.brain.sources.map((x) => `${x.name} ${x.done}`).join(" "), readyAt: SRC_TIMES[5][0] + 0.7, leaveAt: S5.kb, fontPx: 21, ui: true, exception: "Brief: five source types added one after another; each is read as it lands" },
  { id: "kb", text: P.brain.sources.map((x) => x.name).join(" "), readyAt: S5.kb + 0.4, leaveAt: S5.graph, fontPx: 21, ui: true, exception: "Brief: the list, then a short graph view" },
  { id: "pill", text: S5_PILL_LABEL, readyAt: 10.7, leaveAt: 14 + 1, fontPx: 28, carriesOver: true },
];

/** Screen point of a pre-camera point under camera c. */
const toScreen = (c: Cam, p: { x: number; y: number }) => ({ x: FRAME_CENTRE.x + c.z * (p.x - c.x), y: FRAME_CENTRE.y + c.z * (p.y - c.y) });

/**
 * The [S1] chip clicked in Scene 4 is the shared element: it lifts off Theo's
 * card, waits above the title, then lands on the S1 file row in Brain.
 */
const ChipFlight: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const start = toScreen(S4_END_CAM, S4_CITE);
  const park = { x: 1500, y: 250 };
  const chipNative = { x: BRAIN.x + BRAIN.w - 18 - 16, y: BRAIN.fileRow0 + 27 };
  const end = toScreen(cam, nat(chipNative.x, chipNative.y));
  const a = EASE(ramp(t, S5.chipPark[0], S5.chipPark[1]));
  const b = EASE(ramp(t, S5.chipLand[0], S5.chipLand[1]));
  if (b >= 1) return null;
  const x = start.x + (park.x - start.x) * a + (end.x - park.x) * b;
  const y = start.y + (park.y - start.y) * a + (end.y - park.y) * b - Math.sin(Math.PI * b) * 40;
  const baseScale = PRODUCT.scale * S4_END_CAM.z;
  const endScale = PRODUCT.scale * cam.z;
  const scale = (baseScale + (1.7 - baseScale) * a) * (1 - b) + endScale * b;
  return (
    <div data-guard="box" data-guard-label="Shared chip S1" style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${scale})`, filter: `drop-shadow(0 ${8 * a * (1 - b)}px ${14 * a * (1 - b)}px rgba(60,40,140,0.25))` }}>
      <SourceChip id="S1" active={1} />
    </div>
  );
};

export const Scene05Brain: React.FC = () => {
  const { t, F, clock, dur } = useScene(S);
  const o = opening(t, S5_TITLE, TITLE_START, "compact");
  const v = viewAt(t);
  const swap = (at: number) => Math.sin(Math.PI * ramp(t, at, at + 0.3)) * 10;
  const blur = v === "connect" ? swap(S5.connect) : v === "kb" ? swap(S5.kb) : 0;
  const cam = camAt(S5_CAM_KEYS, t, EASE);
  const cursorO = EASE(ramp(t, 3.5, 3.8));
  const prev = controlRoomStateAt(sceneById("S04").duration, clock);
  prev.outputs = prev.outputs.map((c) => ({ ...c, citeHidden: true }));
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
      <ChipFlight t={t} cam={cam} />
      <Pills t={t} pills={S5_PILLS} />
      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};
