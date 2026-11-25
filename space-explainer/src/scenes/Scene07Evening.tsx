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
import { PlaybookGraphPage, type GraphState, type NodeStatus } from "../components/pages/PlaybookGraph";
import { PRODUCT_RECT } from "../components/chat/ProductWindow";
import { UI } from "../components/chat/Sidebar";
import type { TextBeatSpec } from "../lib/guards";
import { graphStateAt, S6_END_CAM, S6_KB_END } from "./Scene06Playbook";
import { S2_PLATE } from "./Scene02Intro";
import { opening, Pills, ProductStage, ramp, useScene, type Pill } from "./shared/stage";

const S = "S07" as const;
export const S7_TITLE = "Let it run on its own";
const TITLE_START = 0.15;
export const S7 = { email: 3.3, run: 3.8, stepLen: 0.45, review: 6.05, zoomIn: 3.6, zoomOut: 6.4, ribbon: [6.5, 8.5], dawn: 8.5, slack: 8.6 };

/** Night grade: dusk (brightness 0.8) at the start, full night (0.35) by 6s, easing back as morning comes. */
export const gradeAt = (t: number) => 0.31 + 0.69 * EASE(ramp(t, 0, 6.0)) - 0.6 * EASE(ramp(t, 7.4, 8.6));

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

/** Playbook run: Ask, Nora, Theo, Owen and Page light in order, then it waits at REVIEW. */
export const s7GraphAt = (t: number, F: (s: number) => number, clock: number): GraphState => {
  const base = graphStateAt(sceneById("S06").duration, F, clock, -F(sceneById("S06").duration));
  const nodes = base.nodes.map((nd, i) => {
    let status: NodeStatus = "idle";
    if (i < 5) {
      const a = S7.run + i * S7.stepLen;
      status = t < a ? "idle" : t < a + S7.stepLen ? "running" : "done";
    } else if (i === 5) status = t >= S7.review ? "waiting" : "idle";
    return { ...nd, status, pulse: 0.5 + 0.5 * Math.sin(t * 5) };
  });
  return { ...base, nodes };
};

const stepsFocus = nat(600, 470);
export const S7_CAM_KEYS: CamKey[] = [
  { t: 0, c: S6_END_CAM },
  { t: 1.6, c: { ...FRAME_CENTRE, z: 1 } },
  { t: S7.zoomIn, c: { ...FRAME_CENTRE, z: 1 } },
  { t: S7.zoomIn + 0.5, c: { ...stepsFocus, z: 1.35 } },
  { t: S7.zoomOut, c: { x: stepsFocus.x - 10, y: stepsFocus.y + 20, z: 1.36 }, lin: true },
  { t: S7.zoomOut + 0.6, c: { ...FRAME_CENTRE, z: 1 } },
  { t: 8.7, c: { x: FRAME_CENTRE.x, y: FRAME_CENTRE.y + 2, z: 1.008 }, lin: true },
  { t: 9.4, c: { ...nat(1500, 160), z: 1.36 } },
  { t: 10, c: { ...nat(1504, 162), z: 1.365 }, lin: true },
];
export const S7_END_CAM: Cam = S7_CAM_KEYS[S7_CAM_KEYS.length - 1].c;

export const S7_PILL_LABEL = "Waiting for a person. Nothing moves until they decide.";
export const S7_PILLS: Pill[] = [
  { label: "Steps, agents, tools and a review", at: -10, until: 0, top: 912 },
  { label: S7_PILL_LABEL, at: 6.2, until: 999 },
];
export const SCENE07_TEXT: TextBeatSpec[] = [
  { id: "title", text: S7_TITLE, readyAt: TITLE_START, leaveAt: TITLE_START + 1.96, fontPx: 88, exception: "Brief: compact title, 0.9s hold" },
  { id: "pill", text: S7_PILL_LABEL, readyAt: 6.3, leaveAt: 10, fontPx: 28, carriesOver: true },
];

/** Clock widget overlay (screen space). */
export const ClockWidget: React.FC<{ label: string; opacity: number; night: number }> = ({ label, opacity, night }) => (
  <div style={{ position: "absolute", right: 96, top: 96, opacity, display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", borderRadius: 16, background: `rgba(${Math.round(15 + 220 * (1 - night))},${Math.round(22 + 215 * (1 - night))},${Math.round(45 + 200 * (1 - night))},0.86)`, backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.25)", boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}>
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

/** The new claim email from BotCircuits Concierge, top right of the product window. */
export const EmailCard: React.FC<{ opacity: number; slide?: number }> = ({ opacity, slide = 1 }) => (
  <div
    data-guard="uitext"
    data-guard-label="Email card"
    style={{ position: "absolute", left: 1440, top: 40, width: 410, boxSizing: "border-box", padding: "12px 16px", borderRadius: 12, background: "#FFFFFF", border: `1px solid ${UI.line}`, color: UI.text, boxShadow: "0 16px 40px rgba(20,24,60,0.18)", display: "flex", gap: 12, alignItems: "flex-start", opacity, transform: `translateX(${(1 - slide) * 60}px)`, zIndex: 8 }}
  >
    <Img data-guard="brand" src={staticFile("logos/gmail.svg")} style={{ width: 26, height: 20, objectFit: "contain", marginTop: 3 }} />
    <div style={{ fontFamily: FONT.sans, fontSize: UIN.helper, lineHeight: 1.4 }}>
      <div style={{ fontWeight: 700 }}>{P.evening.emailFrom}</div>
      {P.evening.email}
    </div>
  </div>
);

/** Slack style notification: the rule set up in Scene 3 fires. Scene 8 opens on it and clicks it. */
export const SLACK_NOTE = { x: 1440, y: 40, w: 410, h: 76 };
export const SlackNotification: React.FC<{ opacity: number; slide?: number; pressed?: number }> = ({ opacity, slide = 1, pressed = 0 }) => (
  <div
    data-guard="uitext"
    data-guard-read="1"
    data-guard-label="Slack notification"
    style={{ position: "absolute", left: SLACK_NOTE.x, top: SLACK_NOTE.y, width: SLACK_NOTE.w, height: SLACK_NOTE.h, boxSizing: "border-box", padding: "12px 16px", borderRadius: 12, background: pressed > 0.3 ? "#F4F2FF" : "#FFFFFF", border: `1px solid ${UI.line}`, color: UI.text, boxShadow: "0 16px 40px rgba(20,24,60,0.18)", display: "flex", gap: 12, alignItems: "center", opacity, transform: `translateX(${(1 - slide) * 60}px) scale(${1 - 0.03 * pressed})`, zIndex: 9 }}
  >
    <Img data-guard="brand" src={staticFile("logos/slack.svg")} style={{ width: 28, height: 28, objectFit: "contain" }} />
    <div style={{ fontFamily: FONT.sans, fontSize: UIN.helper, lineHeight: 1.35 }}>
      <div style={{ fontWeight: 700 }}>
        {P.evening.slackFrom} <span style={{ fontWeight: 400, color: UI.secondary }}>· 9:05 AM</span>
      </div>
      <div style={{ fontSize: 16.5 }}>{P.evening.slack}</div>
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
        cursor={{ keys: [{ ...nat(1300, 640), t: 9.0 }, { ...nat(SLACK_NOTE.x + 200, SLACK_NOTE.y + 40), t: 9.8 }], opacity: EASE(ramp(t, 9.0, 9.3)) }}
        overlay={<div style={{ position: "absolute", inset: 0, borderRadius: PRODUCT_RECT.radius, background: "#0F1A33", opacity: 0.18 * Math.max(0, Math.min(1, (grade - 0.31) / 0.69)), pointerEvents: "none" }} />}
      >
        <PlaybookGraphPage s={o.showPrev ? graphStateAt(sceneById("S06").duration, F, clock, -F(sceneById("S06").duration)) : s7GraphAt(t, F, clock)} />
        {/* Email from BotCircuits Concierge starts the run; it leaves as the night passes */}
        {!o.showPrev && t >= S7.email ? <EmailCard opacity={EASE(ramp(t, S7.email, S7.email + 0.35)) * (1 - EASE(ramp(t, S7.ribbon[0], S7.ribbon[0] + 0.4)))} slide={EASE(ramp(t, S7.email, S7.email + 0.45))} /> : null}
        {t >= S7.slack ? <SlackNotification opacity={EASE(ramp(t, S7.slack, S7.slack + 0.35))} slide={EASE(ramp(t, S7.slack, S7.slack + 0.45))} /> : null}
      </ProductStage>
      <ClockWidget label={clockAt(t)} opacity={EASE(ramp(t, 0.3, 0.7))} night={Math.min(1, grade * 1.5) * (1 - dawn)} />
      <TimeRibbon p={ribbonP} opacity={EASE(ramp(t, S7.ribbon[0] - 0.3, S7.ribbon[0])) * (1 - EASE(ramp(t, S7.ribbon[1] + 0.2, S7.ribbon[1] + 0.7)))} />
      <Pills t={t} pills={S7_PILLS} top={846} />
      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};
