import React from "react";
import { AbsoluteFill, getInputProps, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CHAT_CPS, EASE, REPLAY_CPS } from "../theme";
import { local, localF, sceneById } from "../timeline";
import { PLACEHOLDERS as P } from "../placeholders";
import { PlateBackground } from "../backgrounds/PlateBackground";
import { Cursor, type CursorKey } from "../components/Cursor";
import { GuardLayer } from "../components/GuardLayer";
import { FeatureTitle, featureTitleTiming, frameRiseStyle } from "../components/FeatureTitle";
import { ChatScreen, THREAD, TURN2, T2_CPS, type ChatState } from "../components/chat/ChatScreen";
import { camAt, camTransform, FRAME_CENTRE, nat, PRODUCT_RECT, ProductWindow, type Cam, type CamKey } from "../components/chat/ProductWindow";
import { typeDuration } from "../lib/typewriter";
import type { TextBeatSpec } from "../lib/guards";
import { IntroGlow, IntroLine } from "./shared/intro";
import { S2_PLATE } from "./Scene02Intro";

const S = "S03" as const;
const ev = (n: Parameters<typeof localF>[0]) => localF(n, S);
const at = (n: Parameters<typeof local>[0]) => local(n, S);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], clamp);

const DUR = sceneById(S).duration;
const S2_DUR = sceneById("S02").duration;
export const S3_TITLE = "Ask, or tell it what to do";
const TT = featureTitleTiming(S3_TITLE);
const PILL_SECONDS = 0.45;
/** Thread scroll when turn 2 is sent, native px. */
const T2_SCROLL = 200;
const PILL_EVENTS = ["pill_reading", "pill_policy", "pill_evidence"] as const;
/** Plate Ken Burns progress at the end of this scene (Scene 4 continues from here). */
export const S3_KB_END = 1.3;

/** [S1] chip centre in pre-camera screen px (measured from the layout with the camera off). */
export const S1_CHIP = { x: 769, y: 363 };

/** The suggested action chip "Create agents for this claim", centre in native px (after the scroll). */
export const S3_ACTION_CHIP_NATIVE = { x: 440, y: TURN2.chipY - T2_SCROLL + 21 };
export const S3_ACTION_CHIP = nat(S3_ACTION_CHIP_NATIVE.x, S3_ACTION_CHIP_NATIVE.y);

/** Reading camera: input, thread, answer and source card; then the bottom input, the action card and the chip. */
export const S3_CAM_KEYS: CamKey[] = [
  { t: 0, c: { ...FRAME_CENTRE, z: 1 } },
  { t: at("s3_focus"), c: { ...FRAME_CENTRE, z: 1 } },
  { t: at("s3_focus") + 0.5, c: { ...nat(1069, 500), z: 1.25 } },
  { t: at("s3_send") + 0.1, c: { ...nat(1075, 505), z: 1.25 }, lin: true },
  { t: at("s3_send") + 0.7, c: { ...nat(1000, 330), z: 1.18 } },
  { t: at("answer"), c: { ...nat(990, 340), z: 1.18 }, lin: true },
  { t: at("answer") + 0.5, c: { ...nat(700, 380), z: 1.25 } },
  { t: at("cite_click") - 0.2, c: { ...nat(725, 385), z: 1.25 }, lin: true },
  { t: at("source_open") + 0.6, c: { ...nat(880, 440), z: 1.25 } },
  { t: at("source_close"), c: { ...nat(890, 446), z: 1.25 }, lin: true },
  { t: at("t2_type") + 0.4, c: { ...nat(1069, 790), z: 1.25 } },
  { t: at("t2_send"), c: { ...nat(1075, 794), z: 1.25 }, lin: true },
  { t: at("t2_card") + 0.3, c: { ...nat(760, 480), z: 1.3 } },
  { t: at("t2_chip"), c: { ...nat(770, 486), z: 1.3 }, lin: true },
  { t: at("t2_click") - 0.3, c: { ...nat(720, 540), z: 1.25 } },
  { t: DUR, c: { ...nat(726, 542), z: 1.25 }, lin: true },
];
export const S3_END_CAM: Cam = S3_CAM_KEYS[S3_CAM_KEYS.length - 1].c;

export const S3_CURSOR: CursorKey[] = [
  { ...nat(1350, 760), t: at("cite_click") - 0.8 },
  { ...S1_CHIP, t: at("cite_click") - 0.05 },
  { ...S1_CHIP, t: at("cite_click"), click: true },
  { ...nat(1250, 640), t: at("t2_chip") - 0.2 },
  { ...S3_ACTION_CHIP, t: at("t2_click") - 0.05 },
  { ...S3_ACTION_CHIP, t: at("t2_click"), click: true },
];

export const SCENE03_TEXT: TextBeatSpec[] = (() => {
  const promptEnd = at("s3_type") + typeDuration(P.chatPromptLines.join("\n"), CHAT_CPS, "s3-prompt");
  const answerEnd = at("answer") + typeDuration(P.answerLines.join("\n"), REPLAY_CPS, "s3-answer");
  return [
    { id: "title", text: S3_TITLE, readyAt: at("s3_title"), leaveAt: at("s3_title") + TT.exitStart, fontPx: 88 },
    { id: "prompt", text: P.chatPrompt, readyAt: promptEnd, leaveAt: DUR, fontPx: 20, ui: true },
    ...P.statusPills.map((label, i) => ({
      id: `pill${i + 1}`,
      text: label,
      readyAt: at(PILL_EVENTS[i]) + 0.15,
      leaveAt: at(PILL_EVENTS[i]) + PILL_SECONDS,
      fontPx: 20,
      ui: true,
      exception: "Brief: three status pills, 0.6s each, replacing one another",
    })),
    { id: "answer", text: P.answerLines.join(" "), readyAt: answerEnd, leaveAt: at("t2_send") + 0.6, fontPx: 20, ui: true, exception: "Brief: turn 1 about 8s; the answer stays in the thread until turn 2 scrolls it up" },
    { id: "source", text: `${P.sourceCardTitle} ${P.policyText.join(" ")}`, readyAt: at("source_open") + 0.5, leaveAt: at("source_close"), fontPx: 20, ui: true, exception: "Brief: turn 1 compressed to about 8s, ending with the source card closing" },
    { id: "prompt2", text: P.chat2.prompt, readyAt: at("t2_type") + typeDuration(P.chat2.promptLines.join("\n"), T2_CPS, "s3-prompt2"), leaveAt: DUR, fontPx: 21, ui: true, exception: "Read as it types; brief: turn 2 about 5.2s" },
    { id: "action", text: `${P.chat2.cardTitle} ${P.chat2.rows.map((r) => `${r.kind}: ${r.text}`).join(" ")}`, readyAt: at("t2_row2") + 0.3, leaveAt: DUR + 0.6, fontPx: 21, ui: true, exception: "Brief: final 2.0s goes to the chip and its click" },
  ];
})();

/**
 * Chat screen state at a Scene 3 frame. Scene 4 calls this with Scene 3's last
 * frame (and a negative startShift) so it opens on exactly the same screen.
 */
export const chatStateAt = (frame: number, fps: number, startShift = 0): ChatState => {
  const sec = (s: number) => Math.round(s * fps);
  const heroIn = EASE(ramp(frame, ev("s3_hero"), ev("s3_hero") + sec(0.8)));
  const send = ev("s3_send");
  const pills = P.statusPills.map((label, i) => {
    const a = ev(PILL_EVENTS[i]);
    const b = a + sec(PILL_SECONDS);
    const inP = EASE(ramp(frame, a, a + sec(0.15)));
    const isLast = i === P.statusPills.length - 1;
    const outEnd = isLast ? ev("answer") + sec(0.2) : b + sec(0.12);
    const outP = EASE(ramp(frame, outEnd - sec(0.15), outEnd));
    return { label, opacity: inP * (1 - outP), blur: 10 * (1 - inP) + 10 * outP, y: (1 - inP) * 10 };
  });
  return {
    chromeIn: 1,
    markOpacity: heroIn,
    heroIn,
    heroOut: EASE(ramp(frame, send, send + sec(0.4))),
    chipsIn: EASE(ramp(frame, ev("s3_chips"), ev("s3_chips") + sec(0.6))),
    chipsOut: EASE(ramp(frame, send, send + sec(0.35))),
    focus: EASE(ramp(frame, ev("s3_focus"), ev("s3_focus") + sec(0.35))),
    typeStart: ev("s3_type") + startShift,
    sent: EASE(ramp(frame, send + sec(0.1), send + sec(0.6))),
    statusOrb: EASE(ramp(frame, send, send + sec(0.3))),
    bubbleIn: EASE(ramp(frame, send + sec(0.15), send + sec(0.55))),
    pills,
    answerStart: ev("answer") + startShift,
    answerOpacity: frame >= ev("answer") ? 1 : 0,
    citeActive: EASE(ramp(frame, ev("cite_click"), ev("cite_click") + sec(0.2))) * (1 - EASE(ramp(frame, ev("source_close"), ev("source_close") + sec(0.3)))),
    cardOpen: EASE(ramp(frame, ev("source_open"), ev("source_open") + sec(0.5))) * (1 - EASE(ramp(frame, ev("source_close"), ev("source_close") + sec(0.4)))),
    scroll: T2_SCROLL * EASE(ramp(frame, ev("t2_send"), ev("t2_send") + sec(0.6))),
    t2Focus: EASE(ramp(frame, ev("t2_focus"), ev("t2_focus") + sec(0.3))),
    t2TypeStart: ev("t2_type") + startShift,
    t2Sent: EASE(ramp(frame, ev("t2_send"), ev("t2_send") + sec(0.3))),
    t2Bubble: EASE(ramp(frame, ev("t2_send") + sec(0.05), ev("t2_send") + sec(0.45))),
    t2Pill: EASE(ramp(frame, ev("t2_pill"), ev("t2_pill") + sec(0.15))) * (1 - EASE(ramp(frame, ev("t2_card") - sec(0.1), ev("t2_card") + sec(0.1)))),
    t2Card: EASE(ramp(frame, ev("t2_card"), ev("t2_card") + sec(0.4))),
    t2Rows: [EASE(ramp(frame, ev("t2_row1"), ev("t2_row1") + sec(0.25))), EASE(ramp(frame, ev("t2_row2"), ev("t2_row2") + sec(0.25)))],
    t2Chip: EASE(ramp(frame, ev("t2_chip"), ev("t2_chip") + sec(0.35))),
    t2ChipPressed: Math.max(0, 1 - Math.abs(frame - ev("t2_click")) / sec(0.15)),
    clock: sceneById(S).start,
  };
};

export const Scene03Chat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);
  const t = frame / fps;
  const noCamera = Boolean((getInputProps() as { noCamera?: boolean }).noCamera);

  const titleStart = ev("s3_title");
  const rise = EASE(ramp(frame, titleStart + sec(TT.frameRiseStart), titleStart + sec(TT.frameRiseEnd)));
  const state = chatStateAt(frame, fps);
  const cam = noCamera ? { ...FRAME_CENTRE, z: 1 } : camAt(S3_CAM_KEYS, t, EASE);
  const click = ev("cite_click");
  const cursorO = EASE(ramp(frame, click - sec(0.8), click - sec(0.55))) * (1 - EASE(ramp(frame, ev("source_close") - sec(0.2), ev("source_close") + sec(0.2)))) + EASE(ramp(frame, ev("t2_chip") - sec(0.4), ev("t2_chip") - sec(0.1)));

  return (
    <AbsoluteFill style={{ width: 1920, height: 1080 }}>
      {/* Plate 01 continues from Scene 2, then crossfades to plate 02 over 1.5s */}
      <PlateBackground plate="01" to="02" crossfadeAt={0} crossfadeSeconds={1.5} duration={sec(DUR)} kbFrom={1} kbTo={S3_KB_END} timeOffset={S2_DUR} {...S2_PLATE} />

      {/* The Scene 2 line and its glow blur out over 0.4s */}
      <IntroGlow opacity={1 - EASE(ramp(frame, ev("s3_intro_out"), ev("s3_intro_out") + sec(0.4)))} />
      <IntroLine outFrame={ev("s3_intro_out")} outSeconds={0.4} />

      <FeatureTitle text={S3_TITLE} startFrame={titleStart} />

      {rise > 0 ? (
        <AbsoluteFill style={{ transform: camTransform(cam), transformOrigin: "0 0" }}>
          <div style={{ position: "absolute", left: PRODUCT_RECT.x, top: PRODUCT_RECT.y, width: PRODUCT_RECT.w, height: PRODUCT_RECT.h, ...frameRiseStyle(rise) }}>
            <ProductWindow>
              <ChatScreen s={state} />
            </ProductWindow>
          </div>
          {frame >= click - sec(0.8) ? <Cursor keys={S3_CURSOR} opacity={cursorO} /> : null}
        </AbsoluteFill>
      ) : null}

      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};

void THREAD;
