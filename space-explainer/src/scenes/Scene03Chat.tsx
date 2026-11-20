import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CHAT_CPS, EASE, PRODUCT_FRAME, REPLAY_CPS } from "../theme";
import { local, localF, sceneById } from "../timeline";
import { PLACEHOLDERS as P } from "../placeholders";
import { PlateBackground } from "../backgrounds/PlateBackground";
import { AgentOrb, orbOuterRadius } from "../components/AgentOrb";
import { TextBeat, textBeatTiming } from "../components/TextBeat";
import { Cursor } from "../components/Cursor";
import { GuardLayer } from "../components/GuardLayer";
import {
  ChatScreen,
  CHAT_NATIVE,
  type ChatState,
} from "../components/chat/ChatScreen";
import { typeDuration } from "../lib/typewriter";
import type { TextBeatSpec } from "../lib/guards";
import { CARD_BG, INTRO, IntroText } from "./shared/intro";
import { S2_PLATE } from "./Scene02Intro";

const S = "S03" as const;
const ev = (n: Parameters<typeof localF>[0]) => localF(n, S);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], clamp);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const DUR = sceneById(S).end - sceneById(S).start;
const S2_DUR = sceneById("S02").end - sceneById("S02").start;

/** Product frame: about 1500px wide, centred, top at 210, with the screenshot's aspect. */
const SCALE = 0.8;
export const FRAME = {
  x: 210,
  y: 210,
  w: CHAT_NATIVE.w * SCALE,
  h: CHAT_NATIVE.h * SCALE,
  radius: PRODUCT_FRAME.radius,
};
const toScreen = (nx: number, ny: number) => ({
  x: FRAME.x + nx * SCALE,
  y: FRAME.y + ny * SCALE,
});
/** Hero product mark centre, in screen pixels. */
const MARK = { ...toScreen(1069, 290), size: 56 * SCALE };

const BEAT = "Ask in plain language";
const PILL_SECONDS = 0.6;
const PILL_EVENTS = ["pill_reading", "pill_policy", "pill_evidence"] as const;

export const SCENE03_TEXT: TextBeatSpec[] = (() => {
  const b = textBeatTiming(BEAT, "s3-beat");
  const promptEnd =
    local("s3_type", S) +
    typeDuration(P.chatPromptLines.join("\n"), CHAT_CPS, "s3-prompt");
  const answerEnd =
    local("answer", S) +
    typeDuration(P.answerLines.join("\n"), REPLAY_CPS, "s3-answer");
  return [
    {
      id: "beat",
      text: BEAT,
      readyAt: local("s3_textbeat", S) + b.typed,
      leaveAt: local("s3_textbeat", S) + b.outAt,
      fontPx: 56,
    },
    {
      id: "prompt",
      text: P.chatPrompt,
      readyAt: promptEnd,
      leaveAt: DUR,
      fontPx: 28,
    },
    ...P.statusPills.map((label, i) => ({
      id: `pill${i + 1}`,
      text: label,
      readyAt: local(PILL_EVENTS[i], S) + 0.15,
      leaveAt: local(PILL_EVENTS[i], S) + PILL_SECONDS,
      fontPx: 28,
      exception: "Brief: three status pills, 0.6s each, replacing one another",
    })),
    {
      id: "answer",
      text: P.answerLines.join(" "),
      readyAt: answerEnd,
      leaveAt: DUR,
      fontPx: 28,
      carriesOver: true,
    },
    {
      id: "source",
      text: `${P.sourceCardTitle} ${P.policyText.join(" ")}`,
      readyAt: local("source_open", S) + 0.5,
      leaveAt: DUR,
      fontPx: 28,
      carriesOver: true,
    },
  ];
})();

/** Screen position of the [S1] chip, measured from a guard report of this layout. */
const S1_CHIP = { x: 1062, y: 430 };

export const Scene03Chat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);

  // ---- Opening, 0 to 1.2s: the white title card grows into the dark product frame.
  const geo = EASE(ramp(frame, sec(0.1), sec(1.1)));
  const tone = EASE(ramp(frame, sec(0.35), sec(1.0)));
  const card = INTRO.card;
  const fx = lerp(card.x, FRAME.x, geo);
  const fy = lerp(card.y, FRAME.y, geo);
  const fw = lerp(card.w, FRAME.w, geo);
  const fh = lerp(card.h, FRAME.h, geo);
  const fr = lerp(card.radius, FRAME.radius, geo);
  const ch = Math.round(lerp(255, 33, tone));
  const frameBg =
    tone === 0 ? CARD_BG : `rgba(${ch},${ch},${ch},${lerp(0.92, 1, tone)})`;
  const shadow = `0 ${lerp(30, 40, geo)}px ${lerp(80, 120, geo)}px rgba(13,18,36,${lerp(0.14, 0.28, geo)}), 0 ${lerp(8, 12, geo)}px ${lerp(24, 32, geo)}px rgba(13,18,36,${lerp(0.08, 0.18, geo)})`;
  const borderA = lerp(0.95, 0.08, tone);

  // The lead orb shrinks into the product mark in the hero.
  const lead = INTRO.leadOrb;
  const orbMove = EASE(ramp(frame, sec(0.15), sec(1.0)));
  const orbToMark = EASE(ramp(frame, sec(0.8), sec(1.15)));
  const leadR = orbOuterRadius(lead.size, true);
  const orbScale = lerp(1, (MARK.size * 0.9) / (lead.size * 1.3), orbMove);
  const ox = lerp(lead.x, MARK.x, orbMove);
  const oy = lerp(lead.y, MARK.y, orbMove);

  // ---- Chat screen state.
  const chromeIn = EASE(ramp(frame, sec(0.6), sec(1.2)));
  const heroIn = EASE(ramp(frame, ev("s3_hero"), ev("s3_hero") + sec(0.8)));
  const chipsIn = EASE(ramp(frame, ev("s3_chips"), ev("s3_chips") + sec(0.6)));
  const focus = EASE(ramp(frame, ev("s3_focus"), ev("s3_focus") + sec(0.35)));
  const send = ev("s3_send");
  const sent = EASE(ramp(frame, send + sec(0.1), send + sec(0.6)));
  const statusOrb = EASE(ramp(frame, send, send + sec(0.3)));
  const heroOut = EASE(ramp(frame, send, send + sec(0.4)));
  const chipsOut = EASE(ramp(frame, send, send + sec(0.35)));
  const bubbleIn = EASE(ramp(frame, send + sec(0.15), send + sec(0.55)));
  const pills = P.statusPills.map((label, i) => {
    const a = ev(PILL_EVENTS[i]);
    const b = a + sec(PILL_SECONDS);
    const inP = EASE(ramp(frame, a, a + sec(0.15)));
    const isLast = i === P.statusPills.length - 1;
    const outEnd = isLast ? ev("answer") + sec(0.2) : b + sec(0.12);
    const outP = EASE(ramp(frame, outEnd - sec(0.15), outEnd));
    return {
      label,
      opacity: inP * (1 - outP),
      blur: 10 * (1 - inP) + 10 * outP,
      y: (1 - inP) * 10,
    };
  });
  const answerOpacity = frame >= ev("answer") ? 1 : 0;
  const click = ev("cite_click");
  const citeActive = EASE(ramp(frame, click, click + sec(0.2)));
  const cardOpen = EASE(
    ramp(frame, ev("source_open"), ev("source_open") + sec(0.5)),
  );

  const state: ChatState = {
    chromeIn,
    markOpacity: orbToMark,
    heroIn,
    heroOut,
    chipsIn,
    chipsOut,
    focus,
    typeStart: ev("s3_type"),
    sent,
    statusOrb,
    bubbleIn,
    pills,
    answerStart: ev("answer"),
    answerOpacity,
    citeActive,
    cardOpen,
  };

  // Clip the screen to the morphing frame, in native units.
  const clip = `inset(${(fy - FRAME.y) / SCALE}px ${(FRAME.x + FRAME.w - (fx + fw)) / SCALE}px ${(FRAME.y + FRAME.h - (fy + fh)) / SCALE}px ${(fx - FRAME.x) / SCALE}px round ${fr / SCALE}px)`;

  const cursorKeys = [
    { x: 1500, y: 860, t: local("cite_click", S) - 0.75 },
    { x: S1_CHIP.x, y: S1_CHIP.y, t: local("cite_click", S) - 0.05 },
    { x: S1_CHIP.x, y: S1_CHIP.y, t: local("cite_click", S), click: true },
  ];
  // Slow camera push on the product frame once it has formed (3.5 percent, under the 6 percent cap).
  const push = 1 + 0.035 * ramp(frame, sec(1.2), sec(DUR));
  const camOrigin = `${FRAME.x + FRAME.w / 2}px ${FRAME.y + FRAME.h / 2}px`;
  const cursorO = EASE(ramp(frame, click - sec(0.75), click - sec(0.5)));

  return (
    <AbsoluteFill style={{ width: 1920, height: 1080 }}>
      {/* Plate 01 continues from Scene 2, then crossfades to plate 02 over 1.5s */}
      <PlateBackground
        plate="01"
        to="02"
        crossfadeAt={0}
        crossfadeSeconds={1.5}
        duration={sec(DUR)}
        kbFrom={1}
        kbTo={1.3}
        timeOffset={S2_DUR}
        {...S2_PLATE}
      />

      <AbsoluteFill
        style={{ transform: `scale(${push})`, transformOrigin: camOrigin }}
      >
        {/* The card that becomes the product frame */}
        <div
          data-guard="box"
          style={{
            position: "absolute",
            left: fx,
            top: fy,
            width: fw,
            height: fh,
            borderRadius: fr,
            background: frameBg,
            backdropFilter: "blur(24px)",
            border: `1px solid rgba(255,255,255,${borderA})`,
            boxShadow: shadow,
            boxSizing: "border-box",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: FRAME.x,
            top: FRAME.y,
            width: CHAT_NATIVE.w,
            height: CHAT_NATIVE.h,
            transform: `scale(${SCALE})`,
            transformOrigin: "0 0",
            clipPath: clip,
          }}
        >
          <ChatScreen s={state} />
        </div>
        {frame >= click - sec(0.75) ? (
          <Cursor keys={cursorKeys} opacity={cursorO} />
        ) : null}
      </AbsoluteFill>

      {/* Scene 2 title group, blurring out */}
      <IntroText outFrame={ev("s3_intro_out")} outSeconds={0.5} />

      {/* The lead orb shrinks into the product mark */}
      {orbToMark < 1 ? (
        <div
          style={{
            position: "absolute",
            left: ox - leadR,
            top: oy - leadR,
            width: leadR * 2,
            height: leadR * 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${orbScale})`,
            opacity: 1 - orbToMark,
          }}
        >
          <AgentOrb
            size={lead.size}
            leadRing={1}
            timeOffset={sceneById(S).start}
            style={{ position: "absolute" }}
          />
        </div>
      ) : null}

      <TextBeat text={BEAT} startFrame={ev("s3_textbeat")} seed="s3-beat" />

      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};
