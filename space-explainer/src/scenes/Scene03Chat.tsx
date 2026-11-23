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
import { IntroGlow, IntroLine } from "./shared/intro";
import { ProductWindow } from "../components/chat/ProductWindow";
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
export const S1_CHIP = { x: 1062, y: 430 };

/**
 * Chat screen state at a Scene 3 frame. Scene 4 calls this with Scene 3's last
 * frame (and a negative startShift) so it opens on exactly the same screen.
 */
export const chatStateAt = (
  frame: number,
  fps: number,
  startShift = 0,
): ChatState => {
  const sec = (s: number) => Math.round(s * fps);
  const chromeIn = 1;
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
    markOpacity: heroIn,
    heroIn,
    heroOut,
    chipsIn,
    chipsOut,
    focus,
    typeStart: ev("s3_type") + startShift,
    sent,
    statusOrb,
    bubbleIn,
    pills,
    answerStart: ev("answer") + startShift,
    answerOpacity,
    citeActive,
    cardOpen,
    clock: sceneById(S).start,
  };
  return state;
};

export const Scene03Chat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);

  // ---- Opening: the intro line blurs out over 0.4s while the dark product
  // frame rises from the centre (scale 0.92 to 1, opacity 0 to 1) over 0.8s.
  const rise = EASE(
    ramp(frame, ev("s3_frame_rise"), ev("s3_frame_rise") + sec(0.8)),
  );
  const frameScale = lerp(0.92, 1, rise);

  const state = chatStateAt(frame, fps);
  const click = ev("cite_click");

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
        {/* The product frame rises from the centre */}
        <div
          style={{
            position: "absolute",
            left: FRAME.x,
            top: FRAME.y,
            width: FRAME.w,
            height: FRAME.h,
            opacity: rise,
            transform: `scale(${frameScale})`,
            transformOrigin: "50% 50%",
          }}
        >
          <ProductWindow>
            <ChatScreen s={state} />
          </ProductWindow>
        </div>
        {frame >= click - sec(0.75) ? (
          <Cursor keys={cursorKeys} opacity={cursorO} />
        ) : null}
      </AbsoluteFill>

      {/* The Scene 2 line and its glow blur out */}
      <IntroGlow
        opacity={
          1 -
          EASE(ramp(frame, ev("s3_intro_out"), ev("s3_intro_out") + sec(0.4)))
        }
      />
      <IntroLine outFrame={ev("s3_intro_out")} outSeconds={0.4} />

      <TextBeat text={BEAT} startFrame={ev("s3_textbeat")} seed="s3-beat" />

      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};
