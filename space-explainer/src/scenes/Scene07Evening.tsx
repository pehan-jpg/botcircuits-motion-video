import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Clock } from "lucide-react";
import { EASE, FONT, UIN } from "../theme";
import { sceneById } from "../timeline";
import { PLACEHOLDERS as P } from "../placeholders";
import { PlateBackground } from "../backgrounds/PlateBackground";
import { GuardLayer } from "../components/GuardLayer";
import { FeatureTitle } from "../components/FeatureTitle";
import { camAt, FRAME_CENTRE, nat, type Cam, type CamKey } from "../components/chat/ProductWindow";
import { PlaybookPage, STEPS, type PlaybookState, type StepStatus } from "../components/pages/PlaybookPage";
import type { TextBeatSpec } from "../lib/guards";
import { playbookStateAt, S6_END_CAM, S6_KB_END } from "./Scene06Playbook";
import { S2_PLATE } from "./Scene02Intro";
import { opening, Pills, ProductStage, ramp, useScene, type Pill } from "./shared/stage";

const S = "S07" as const;
export const S7_TITLE = "Let it run on its own";
const TITLE_START = 0.15;
const S7 = { email: 3.3, run: 3.8, stepLen: 0.5, review: 5.8, zoomIn: 3.6, zoomOut: 6.3, ribbon: [6.5, 9.0], dawn: 9.0 };

/** Night grade: dusk (brightness 0.8) at the start, full night (0.35) by 6s, easing back as morning comes. */
const gradeAt = (t: number) => 0.31 + 0.69 * EASE(ramp(t, 0, 6.0)) - 0.6 * EASE(ramp(t, 7.8, 9.0));

/** Clock time along the ribbon, in minutes after midnight (may pass 24h). */
const START_MIN = 18 * 60 + 42;
const END_MIN = 24 * 60 + 9 * 60 + 5;
const fmt = (m: number) => {
  const mm = Math.round(m) % (24 * 60);
  const h = Math.floor(mm / 60);
  const min = mm % 60;
  return `${((h + 11) % 12) + 1}:${String(min).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
export const clockAt = (t: number) => fmt(START_MIN + (END_MIN - START_MIN) * EASE(ramp(t, S7.ribbon[0], S7.ribbon[1])));

/** Playbook run state: steps 1 to 4 run in sequence, then it waits at REVIEW. */
export const s7PlaybookAt = (t: number, clock: number): PlaybookState => {
  const base = playbookStateAt(sceneById("S06").duration, clock);
  const statuses: StepStatus[] = STEPS.map((_, i) => {
    if (i < 4) {
      const a = S7.run + i * S7.stepLen;
      return t < a ? "idle" : t < a + S7.stepLen ? "running" : "done";
    }
    if (i === 4) return t >= S7.review ? "waiting" : "idle";
    return "idle";
  });
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  return {
    ...base,
    steps: base.steps.map((st, i) => ({ ...st, status: statuses[i], pulse: i === 4 ? pulse : 0.5 + 0.5 * Math.sin(t * 8) })),
    runPressed: Math.max(0, 1 - Math.abs(t - (S7.run - 0.15)) / 0.15),
    bellBadge: t >= S7.review ? 1 : 0,
    bellPulse: Math.sin(Math.PI * ramp(t, S7.review, S7.review + 0.6)),
  };
};

const stepsFocus = nat(1390, 470);
export const S7_CAM_KEYS: CamKey[] = [
  { t: 0, c: S6_END_CAM },
  { t: 1.6, c: { ...FRAME_CENTRE, z: 1 } },
  { t: S7.zoomIn, c: { ...FRAME_CENTRE, z: 1 } },
  { t: S7.zoomIn + 0.5, c: { ...stepsFocus, z: 1.35 } },
  { t: S7.zoomOut, c: { x: stepsFocus.x - 10, y: stepsFocus.y + 20, z: 1.36 }, lin: true },
  { t: S7.zoomOut + 0.6, c: { ...FRAME_CENTRE, z: 1 } },
  { t: 10, c: { x: FRAME_CENTRE.x, y: FRAME_CENTRE.y + 2, z: 1.008 }, lin: true },
];
export const S7_END_CAM: Cam = S7_CAM_KEYS[S7_CAM_KEYS.length - 1].c;

export const S7_PILL_LABEL = "Waiting for a person. Nothing moves until they decide.";
export const S7_PILLS: Pill[] = [
  { label: "Steps, agents, tools and a review", at: -10, until: 0, top: 912 },
  { label: S7_PILL_LABEL, at: 6.0, until: 999 },
];
export const SCENE07_TEXT: TextBeatSpec[] = [
  { id: "title", text: S7_TITLE, readyAt: TITLE_START, leaveAt: TITLE_START + 1.96, fontPx: 88, exception: "Brief: compact title, 0.9s hold" },
  { id: "pill", text: S7_PILL_LABEL, readyAt: 6.3, leaveAt: 10, fontPx: 28, carriesOver: true },
];

/** Clock widget overlay (screen space). */
export const ClockWidget: React.FC<{ label: string; opacity: number; night: number }> = ({ label, opacity, night }) => (
  <div style={{ position: "absolute", right: 96, top: 96, opacity, display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", borderRadius: 16, background: `rgba(${Math.round(15 + 220 * (1 - night))},${Math.round(22 + 215 * (1 - night))},${Math.round(45 + 200 * (1 - night))},0.72)`, backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.25)", boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}>
    <Clock size={24} color={night > 0.5 ? "#F5F7FF" : "#0D1224"} />
    <span data-guard="text" data-guard-label="Clock" style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 30, color: night > 0.5 ? "#F5F7FF" : "#0D1224" }}>
      {label}
    </span>
  </div>
);

/** Time ribbon: sweeps from evening to morning across the bottom. */
const TimeRibbon: React.FC<{ p: number; opacity: number }> = ({ p, opacity }) => (
  <div style={{ position: "absolute", left: 360, width: 1200, top: 940, height: 36, opacity }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 16, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.25)" }} />
    <div style={{ position: "absolute", left: 0, width: `${p * 100}%`, top: 16, height: 4, borderRadius: 2, background: "linear-gradient(90deg, #7C64FF, #FFD9A8)" }} />
    {Array.from({ length: 15 }).map((_, i) => (
      <div key={i} style={{ position: "absolute", left: `${(i / 14) * 100}%`, top: 10, width: 2, height: 16, background: "rgba(255,255,255,0.35)" }} />
    ))}
    <div style={{ position: "absolute", left: `calc(${p * 100}% - 9px)`, top: 9, width: 18, height: 18, borderRadius: 9, background: "#FFFFFF", boxShadow: "0 0 12px rgba(255,255,255,0.8)" }} />
  </div>
);

/** The new claim email, top right of the product window. Scene 8 carries it over and fades it out. */
export const EmailCard: React.FC<{ opacity: number; slide?: number }> = ({ opacity, slide = 1 }) => (
  <div
    data-guard="uitext"
    data-guard-label="Email card"
    style={{ position: "absolute", left: 1450, top: 58, width: 400, boxSizing: "border-box", padding: "12px 16px", borderRadius: 12, background: "#f6f6f6", color: "#1d1d1d", boxShadow: "0 16px 40px rgba(0,0,0,0.45)", display: "flex", gap: 12, alignItems: "flex-start", opacity, transform: `translateX(${(1 - slide) * 60}px)` }}
  >
    <Img data-guard="brand" src={staticFile("logos/gmail.svg")} style={{ width: 26, height: 20, objectFit: "contain", marginTop: 3 }} />
    <div style={{ fontFamily: FONT.sans, fontSize: UIN.helper, lineHeight: 1.4 }}>
      <div style={{ fontWeight: 700 }}>Claims inbox</div>
      {P.evening.email}
    </div>
  </div>
);

export const Scene07Evening: React.FC = () => {
  const { t, F, clock, dur, start } = useScene(S);
  const o = opening(t, S7_TITLE, TITLE_START, "compact");
  const cam = camAt(S7_CAM_KEYS, t, EASE);
  const grade = gradeAt(t);
  const ribbonP = EASE(ramp(t, S7.ribbon[0], S7.ribbon[1]));
  const dawn = EASE(ramp(t, S7.dawn, S7.dawn + 1.0));
  const prevPlate = 1 - EASE(ramp(t, 0.2, 1.7));
  return (
    <AbsoluteFill style={{ width: 1920, height: 1080 }}>
      {/* Plate 04 under the night grade, crossfading to plate 01 at dawn */}
      <PlateBackground plate="04" to="01" crossfadeAt={F(S7.dawn)} crossfadeSeconds={1.0} duration={F(dur)} kbFrom={0} kbTo={1} night={grade} timeOffset={start - 15} {...S2_PLATE} />
      {/* Plate 03 from Scene 6 fades out during the title */}
      {prevPlate > 0 ? (
        <AbsoluteFill style={{ opacity: prevPlate }}>
          <PlateBackground plate="03" duration={F(dur)} kbFrom={S6_KB_END} kbTo={S6_KB_END - 0.02} timeOffset={start - 15} {...S2_PLATE} />
        </AbsoluteFill>
      ) : null}
      <FeatureTitle text={S7_TITLE} startFrame={F(TITLE_START)} variant="compact" onDark />
      <ProductStage
        cam={cam}
        frameStyle={o.frameStyle}
        visible={o.visible}
        overlay={null}
      >
        <PlaybookPage s={o.showPrev ? playbookStateAt(sceneById("S06").duration, clock) : s7PlaybookAt(t, clock)} />
        {/* Gmail style email card */}
        {!o.showPrev && t >= S7.email ? <EmailCard opacity={EASE(ramp(t, S7.email, S7.email + 0.35))} slide={EASE(ramp(t, S7.email, S7.email + 0.45))} /> : null}
      </ProductStage>
      <ClockWidget label={clockAt(t)} opacity={EASE(ramp(t, 2.6, 3.0))} night={Math.min(1, grade * 1.5) * (1 - dawn)} />
      <TimeRibbon p={ribbonP} opacity={EASE(ramp(t, S7.ribbon[0] - 0.3, S7.ribbon[0])) * (1 - EASE(ramp(t, S7.ribbon[1] + 0.2, S7.ribbon[1] + 0.7)))} />
      <Pills t={t} pills={S7_PILLS} top={846} />
      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};
