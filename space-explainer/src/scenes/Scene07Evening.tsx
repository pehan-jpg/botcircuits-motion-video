import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Check, Sun, Timer } from "lucide-react";
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
/** The title starts once the previous frame has sunk away (clean title rule). */
const TITLE_START = 0.45;
/** Scene 7 beats. The run takes about two minutes (shown on an accelerated stopwatch); then the playbook waits for a person. */
export const S7 = { email: 3.3, run: 4.2, stepLen: 0.6, review: 7.2, prepared: 7.25, zoomIn: 3.9, zoomOut: 7.6, waitPill: [7.4, 9.0], dawn: 9.0, nextMorning: [9.1, 10.3], slack: 10.3 };
/** Run time shown on the stopwatch, in seconds (placeholder 2:04). */
const RUN_SECONDS = 124;

/** Night grade: dusk (brightness 0.8) at the start, full night (0.35) by 6s, easing back as morning comes. */
export const gradeAt = (t: number) => 0.31 + 0.69 * EASE(ramp(t, 2.0, 8.6));

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
  { t: S7.zoomIn, c: { x: FRAME_CENTRE.x, y: FRAME_CENTRE.y + 2, z: 1.006 }, lin: true },
  { t: S7.zoomIn + 0.5, c: { ...stepsFocus, z: 1.35 } },
  { t: S7.zoomOut, c: { x: stepsFocus.x - 10, y: stepsFocus.y + 20, z: 1.36 }, lin: true },
  { t: S7.zoomOut + 0.6, c: { ...FRAME_CENTRE, z: 1 } },
  { t: 10.1, c: { x: FRAME_CENTRE.x, y: FRAME_CENTRE.y + 2, z: 1.008 }, lin: true },
  { t: 10.7, c: { ...nat(1500, 160), z: 1.36 } },
  { t: 11, c: { ...nat(1502, 161), z: 1.362 }, lin: true },
];
export const S7_END_CAM: Cam = S7_CAM_KEYS[S7_CAM_KEYS.length - 1].c;

export const S7_PILL_LABEL = "Waiting for a person. Nothing moves until they decide.";
export const S7_PILLS: Pill[] = [
  { label: "Steps, agents, tools and a review", at: -10, until: 0, top: 912 },
  { label: S7_PILL_LABEL, at: S7.waitPill[0], until: S7.waitPill[1] },
];
export const SCENE07_TEXT: TextBeatSpec[] = [
  { id: "title", text: S7_TITLE, readyAt: TITLE_START, leaveAt: TITLE_START + 1.96, fontPx: 88, exception: "Brief: compact title, 0.9s hold" },
  { id: "pill", text: S7_PILL_LABEL, readyAt: S7.waitPill[0] + 0.3, leaveAt: S7.waitPill[1], fontPx: 28, exception: "Brief: the wait pill shows 7.4 to 9.0s" },
  { id: "morning", text: P.evening.nextMorning, readyAt: S7.nextMorning[0] + 0.3, leaveAt: S7.nextMorning[1], fontPx: 28, exception: "Brief: Next morning shows for 1.2s" },
];

/** Stopwatch chip in the playbook header: counts the run, then reads "Prepared in 2 min 4 s". */
export const Stopwatch: React.FC<{ t: number }> = ({ t }) => {
  const appear = EASE(ramp(t, S7.run - 0.3, S7.run));
  if (appear <= 0) return null;
  const sec = Math.round(RUN_SECONDS * ramp(t, S7.run, S7.review));
  const done = t >= S7.prepared;
  const flip = EASE(ramp(t, S7.prepared, S7.prepared + 0.25));
  return (
    <div
      data-guard="uitext"
      data-guard-read="1"
      data-guard-label="Run time"
      style={{ position: "absolute", left: 610, top: 50, height: 36, display: "flex", alignItems: "center", gap: 8, padding: "0 14px", borderRadius: 999, background: done ? UI.greenBg : UI.lilacBg, color: UI.text, fontFamily: FONT.sans, fontSize: 16.5, fontWeight: 600, whiteSpace: "nowrap", opacity: appear, transform: `scale(${done ? 0.96 + 0.04 * flip : 1})` }}
    >
      {done ? <Check size={16} color={UI.greenText} strokeWidth={3} /> : <Timer size={16} color={UI.lilacText} />}
      {done ? P.evening.prepared : `Run time ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`}
    </div>
  );
};

/** The new claim email, top right of the product window; its time stamp lives only inside the card. */
export const EmailCard: React.FC<{ opacity: number; slide?: number }> = ({ opacity, slide = 1 }) => (
  <div
    data-guard="uitext"
    data-guard-label="Email card"
    style={{ position: "absolute", left: 1440, top: 40, width: 410, boxSizing: "border-box", padding: "12px 16px", borderRadius: 12, background: "#FFFFFF", border: `1px solid ${UI.line}`, color: UI.text, boxShadow: "0 16px 40px rgba(20,24,60,0.18)", display: "flex", gap: 12, alignItems: "flex-start", opacity, transform: `translateX(${(1 - slide) * 60}px)`, zIndex: 8 }}
  >
    <Img data-guard="brand" src={staticFile("logos/gmail.svg")} style={{ width: 26, height: 20, objectFit: "contain", marginTop: 3 }} />
    <div style={{ fontFamily: FONT.sans, fontSize: UIN.helper, lineHeight: 1.4 }}>
      <div style={{ fontWeight: 700 }}>
        {P.evening.emailFrom} <span style={{ fontWeight: 400, color: UI.secondary }}>· {P.evening.emailTime}</span>
      </div>
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
        {P.evening.slackFrom} <span style={{ fontWeight: 400, color: UI.secondary }}>· {P.evening.slackTime}</span>
      </div>
      <div style={{ fontSize: 16.5 }}>{P.evening.slack}</div>
    </div>
  </div>
);

/** "Next morning" pill with a small sun glyph (plate crossfades to morning). */
const NextMorning: React.FC<{ t: number }> = ({ t }) => {
  const a = EASE(ramp(t, S7.nextMorning[0], S7.nextMorning[0] + 0.3)) * (1 - EASE(ramp(t, S7.nextMorning[1], S7.nextMorning[1] + 0.3)));
  if (a <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 912, display: "flex", justifyContent: "center" }}>
      <div data-guard="text" data-guard-label="Next morning" style={{ display: "flex", alignItems: "center", gap: 12, height: 60, padding: "0 28px 0 20px", borderRadius: 999, background: "rgba(255,255,255,0.78)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 10px 30px rgba(13,18,36,0.12)", fontFamily: FONT.sans, fontSize: 28, fontWeight: 500, color: "#0D1224", opacity: a, transform: `translateY(${(1 - a) * 12}px)` }}>
        <Sun size={26} color="#C99A2E" />
        {P.evening.nextMorning}
      </div>
    </div>
  );
};

export const Scene07Evening: React.FC = () => {
  const { t, F, clock, dur, start } = useScene(S);
  const o = opening(t, S7_TITLE, TITLE_START, "compact");
  const cam = camAt(S7_CAM_KEYS, t, EASE);
  const grade = gradeAt(t);
  const dawn = EASE(ramp(t, S7.dawn, S7.dawn + 1.0));
  // Cool tone on the window: up with the night, gone by morning so Scene 8 opens on the same white window.
  const coolTone = Math.max(0, Math.min(1, (grade - 0.31) / 0.69)) * (1 - dawn);
  const prevPlate = 1 - EASE(ramp(t, 0.2, 1.7));
  return (
    <AbsoluteFill style={{ width: 1920, height: 1080 }}>
      {/* Plate 04 under the night grade, crossfading to plate 01 at dawn */}
      <PlateBackground plate="04" to="01" crossfadeAt={F(S7.dawn)} crossfadeSeconds={1.0} duration={F(dur)} kbFrom={0} kbTo={1} night={grade} timeOffset={start - 15} {...S2_PLATE} />
      {/* Plate 03 from Scene 6 fades out during the title */}
      {prevPlate > 0 ? (
        <AbsoluteFill data-layer="plate" style={{ opacity: prevPlate }}>
          <PlateBackground plate="03" duration={F(dur)} kbFrom={S6_KB_END} kbTo={S6_KB_END - 0.02} timeOffset={start - 15} {...S2_PLATE} />
        </AbsoluteFill>
      ) : null}
      <FeatureTitle text={S7_TITLE} startFrame={F(TITLE_START)} variant="compact" onDark />
      <ProductStage
        cam={cam}
        frameStyle={o.frameStyle}
        visible={o.visible}
        cursor={{ keys: [{ ...nat(1300, 640), t: 10.2 }, { ...nat(SLACK_NOTE.x + 200, SLACK_NOTE.y + 40), t: 10.9 }], opacity: EASE(ramp(t, 10.2, 10.5)) }}
        overlay={coolTone > 0.001 ? <div style={{ position: "absolute", inset: 0, borderRadius: PRODUCT_RECT.radius, background: "#0F1A33", opacity: 0.18 * coolTone, pointerEvents: "none" }} /> : null}
      >
        <PlaybookGraphPage s={o.showPrev ? graphStateAt(sceneById("S06").duration, F, clock, -F(sceneById("S06").duration)) : s7GraphAt(t, F, clock)} />
        {/* The claim email starts the run; it leaves as the run finishes */}
        {!o.showPrev && t >= S7.email ? <EmailCard opacity={EASE(ramp(t, S7.email, S7.email + 0.35)) * (1 - EASE(ramp(t, S7.review, S7.review + 0.4)))} slide={EASE(ramp(t, S7.email, S7.email + 0.45))} /> : null}
        {!o.showPrev ? <Stopwatch t={t} /> : null}
        {t >= S7.slack ? <SlackNotification opacity={EASE(ramp(t, S7.slack, S7.slack + 0.35))} slide={EASE(ramp(t, S7.slack, S7.slack + 0.45))} /> : null}
      </ProductStage>
      <Pills t={t} pills={S7_PILLS} />
      <NextMorning t={t} />
      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};
