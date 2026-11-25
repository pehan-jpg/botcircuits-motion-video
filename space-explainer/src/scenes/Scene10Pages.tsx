import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EASE, PRODUCT } from "../theme";
import { sceneById } from "../timeline";
import { PLACEHOLDERS as P } from "../placeholders";
import { PlateBackground } from "../backgrounds/PlateBackground";
import { GuardLayer } from "../components/GuardLayer";
import { FeatureTitle } from "../components/FeatureTitle";
import { camAt, FRAME_CENTRE, nat, type Cam, type CamKey } from "../components/chat/ProductWindow";
import { RecordsPage } from "../components/pages/RecordsPage";
import { kpiRect, PAGES, PAGES_CPS, PagesPage, type PagesState } from "../components/pages/PagesPage";
import type { CursorKey } from "../components/Cursor";
import { typeDuration } from "../lib/typewriter";
import type { TextBeatSpec } from "../lib/guards";
import { recordsStateAt, S9_END_CAM, S9_KB_END, S9_PAGES_NAV } from "./Scene09Records";
import { S2_PLATE } from "./Scene02Intro";
import { opening, Pills, ProductStage, ramp, useScene, type Pill } from "./shared/stage";

const S = "S10" as const;
export const S10_TITLE = "Build the views you need";
/** The title starts once the previous frame has sunk away (clean title rule). */
const TITLE_START = 0.45;
const P1_DUR = typeDuration(P.pages.prompt, PAGES_CPS, "pages-prompt-0");
const P2_DUR = typeDuration(P.pages.dashPrompt, PAGES_CPS, "pages-prompt-1");
/** Scene 10 beats: a page from a prompt, then a dashboard from a second prompt, then the KPI tile is clicked. */
export const S10 = {
  focus1: 3.6,
  type1: 3.65,
  build1: 3.65 + P1_DUR + 0.25,
  focus2: 7.2,
  type2: 7.25,
  build2: 7.25 + P2_DUR + 0.2,
  tileClick: 11.4,
};
const B1 = S10.build1;
const B2 = S10.build2;
export const S10_KB_END = 1.0;

export const pagesStateAt = (t: number, F: (s: number) => number, shift = 0): PagesState => {
  const second = t >= S10.type2;
  return {
    prompt: second ? 1 : 0,
    typeStart: F(second ? S10.type2 : S10.type1) + shift,
    typing: t >= S10.type1,
    pressed: Math.max(0, 1 - Math.abs(t - B1) / 0.15, 1 - Math.abs(t - B2) / 0.15),
    build: EASE(ramp(t, B1 + 0.15, B1 + 0.65)),
    rows: ramp(t, B1 + 0.35, B1 + 0.95),
    bars: EASE(ramp(t, B1 + 0.55, B1 + 1.15)),
    claimRow: EASE(ramp(t, B1 + 1.0, B1 + 1.4)),
    dash: EASE(ramp(t, B2 + 0.1, B2 + 0.4)),
    tiles: [0, 1, 2, 3].map((i) => EASE(ramp(t, B2 + 0.2 + i * 0.15, B2 + 0.45 + i * 0.15))),
    line: ramp(t, B2 + 0.5, B2 + 1.1),
    flags: EASE(ramp(t, B2 + 0.6, B2 + 0.9)),
    tilePressed: Math.max(0, 1 - Math.abs(t - S10.tileClick) / 0.2),
  };
};

const promptFocus = nat(1060, 270);
const tableFocus = nat(830, 610);
const dashFocus = nat(1063, 605);
export const S10_CAM_KEYS: CamKey[] = [
  { t: 0, c: S9_END_CAM },
  { t: 1.6, c: { ...FRAME_CENTRE, z: 1 } },
  { t: 3.5, c: { x: FRAME_CENTRE.x, y: FRAME_CENTRE.y + 2, z: 1.006 }, lin: true },
  { t: S10.type1 + 0.3, c: { ...promptFocus, z: 1.4 } },
  { t: B1, c: { x: promptFocus.x + 12, y: promptFocus.y, z: 1.4 }, lin: true },
  { t: B1 + 0.8, c: { ...tableFocus, z: 1.4 } },
  { t: S10.focus2 - 0.2, c: { x: tableFocus.x + 8, y: tableFocus.y + 4, z: 1.4 }, lin: true },
  { t: S10.type2 + 0.4, c: { ...promptFocus, z: 1.4 } },
  { t: B2, c: { x: promptFocus.x + 12, y: promptFocus.y, z: 1.4 }, lin: true },
  { t: B2 + 0.8, c: { ...dashFocus, z: 1.45 } },
  { t: 10.85, c: { x: dashFocus.x + 8, y: dashFocus.y + 4, z: 1.45 }, lin: true },
  { t: 11.25, c: { ...FRAME_CENTRE, z: 1 } },
  { t: 12, c: { x: FRAME_CENTRE.x + 2, y: FRAME_CENTRE.y + 1, z: 1.004 }, lin: true },
];
export const S10_END_CAM: Cam = S10_CAM_KEYS[S10_CAM_KEYS.length - 1].c;

const promptC = nat(PAGES.prompt.x + 300, PAGES.prompt.y + PAGES.prompt.h / 2);
const buildC = nat(PAGES.button.x + PAGES.button.w / 2, PAGES.button.y + PAGES.button.h / 2);
const tile = kpiRect(1);
export const S10_TILE_NATIVE = tile;
const tileC = nat(tile.x + tile.w / 2, tile.y + tile.h / 2);
export const S10_CURSOR: CursorKey[] = [
  { ...nat(S9_PAGES_NAV.x, S9_PAGES_NAV.y), t: -1 },
  { ...nat(S9_PAGES_NAV.x, S9_PAGES_NAV.y), t: 0.5 },
  { ...promptC, t: S10.focus1 - 0.05 },
  { ...promptC, t: S10.focus1, click: true },
  { ...buildC, t: B1 - 0.05 },
  { ...buildC, t: B1, click: true },
  { ...promptC, t: S10.focus2 - 0.05 },
  { ...promptC, t: S10.focus2, click: true },
  { ...buildC, t: B2 - 0.05 },
  { ...buildC, t: B2, click: true },
  { ...nat(1500, 760), t: 10.4 },
  { ...tileC, t: S10.tileClick - 0.05 },
  { ...tileC, t: S10.tileClick, click: true },
];

export const S10_PILL_LABEL = "Pages and dashboards on live data";
export const S10_PILLS: Pill[] = [{ label: S10_PILL_LABEL, at: B2 + 1.0, until: 11.3 }];
export const SCENE10_TEXT: TextBeatSpec[] = [
  { id: "title", text: S10_TITLE, readyAt: TITLE_START, leaveAt: TITLE_START + 1.96, fontPx: 88, exception: "Brief: compact title, 0.9s hold" },
  { id: "prompt1", text: P.pages.prompt, readyAt: S10.type1 + P1_DUR, leaveAt: S10.type2, fontPx: 22, ui: true, exception: "Read as it types" },
  { id: "table", text: `${P.pages.title} Status Count Approved by`, readyAt: B1 + 1.0, leaveAt: B2, fontPx: 21, ui: true, exception: "Brief: page build, then the dashboard, in 12s" },
  { id: "prompt2", text: P.pages.dashPrompt, readyAt: S10.type2 + P2_DUR, leaveAt: B2 + 0.6, fontPx: 22, ui: true, exception: "Read as it types" },
  { id: "kpis", text: P.pages.kpis.map((k) => `${k.label} ${k.value}`).join(" "), readyAt: B2 + 0.9, leaveAt: 12, fontPx: 21, ui: true, exception: "Brief: tiles in one by one, then the tile is clicked" },
  { id: "pill", text: S10_PILL_LABEL, readyAt: B2 + 1.3, leaveAt: 11.3, fontPx: 28, exception: "Brief: the pill gives way before the tile opens" },
];

/** Scene 10 as a pure function of t; `frozen` renders its last frame for Scene 11's opening. */
const Scene10Body: React.FC<{ t: number; F: (s: number) => number; clock: number; shift?: number; frozen?: boolean }> = ({ t, F, clock, shift = 0, frozen = false }) => {
  const o = opening(t, S10_TITLE, TITLE_START, "compact");
  const cam = camAt(S10_CAM_KEYS, t, EASE);
  const cursorO = o.showPrev ? 1 - o.sink : EASE(ramp(t, 3.2, 3.5));
  const def = sceneById(S);
  return (
    <>
      <PlateBackground plate="03" duration={F(def.duration)} kbFrom={S9_KB_END} kbTo={S10_KB_END} timeOffset={def.start - 15} {...S2_PLATE} />
      <FeatureTitle text={S10_TITLE} startFrame={F(TITLE_START) + shift} variant="compact" />
      <ProductStage cam={cam} frameStyle={o.frameStyle} visible={o.visible} cursor={{ keys: S10_CURSOR, opacity: cursorO }}>
        {o.showPrev ? (
          <div data-guard-bg="Scene 9 records, read in Scene 9" style={{ position: "absolute", inset: 0 }}>
            <RecordsPage s={recordsStateAt(sceneById("S09").duration, clock)} />
          </div>
        ) : (
          <PagesPage s={pagesStateAt(t, F, shift)} />
        )}
      </ProductStage>
      {frozen ? null : <Pills t={t} pills={S10_PILLS} />}
      {frozen ? null : <GuardLayer scene={S} />}
    </>
  );
};

export const Scene10Pages: React.FC = () => {
  const { t, F, clock } = useScene(S);
  return (
    <AbsoluteFill style={{ width: 1920, height: 1080 }}>
      <Scene10Body t={t} F={F} clock={clock} />
    </AbsoluteFill>
  );
};

/** The frozen last frame of Scene 10, under Scene 11's opening. */
export const Scene10EndFrame: React.FC<{ F: (s: number) => number; clock: number }> = ({ F, clock }) => {
  const frame = useCurrentFrame();
  const d = sceneById(S).duration;
  return <Scene10Body t={d} F={F} clock={clock} shift={frame - F(d)} frozen />;
};

/** The clicked tile at the end of Scene 10, in screen px (Scene 11 grows it to the full frame). */
export const S10_TILE_SCREEN = (() => {
  const c = S10_END_CAM;
  const k = PRODUCT.scale * c.z;
  const p = nat(tile.x, tile.y);
  return { x: FRAME_CENTRE.x + c.z * (p.x - c.x), y: FRAME_CENTRE.y + c.z * (p.y - c.y), w: tile.w * k, h: tile.h * k };
})();
