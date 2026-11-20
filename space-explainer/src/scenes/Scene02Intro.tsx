import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BLUR_IN, COLOR, EASE, EASE_SETTLE } from "../theme";
import { local, localF, sceneById } from "../timeline";
import { PLACEHOLDERS as P } from "../placeholders";
import { PlateBackground } from "../backgrounds/PlateBackground";
import { AgentOrb, orbOuterRadius } from "../components/AgentOrb";
import { GuardLayer } from "../components/GuardLayer";
import { lockupTiming } from "../components/SpaceByLockup";
import type { TextBeatSpec } from "../lib/guards";
import { CARD_BG, CARD_SHADOW, INTRO, IntroText } from "./shared/intro";

const S = "S02" as const;
const ev = (n: Parameters<typeof localF>[0]) => localF(n, S);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], clamp);

const DUR = sceneById(S).end - sceneById(S).start;
/** Ken Burns on plate 01 for this scene. Scene 3 continues from kbTo. */
export const S2_PLATE = {
  zoom: 0.03,
  panX: -10,
  panY: -8,
  overlay: 0.6,
  dots: 8,
} as const;

/**
 * Text timing. The group stays on screen through the boundary and blurs out
 * in Scene 3 at `s3_intro_out`, so that is when it leaves.
 */
const LEAVE = local("s3_intro_out", "S03") + DUR;
const lock = lockupTiming("s2-title");
export const SCENE02_TEXT: TextBeatSpec[] = [
  {
    id: "introducing",
    text: "Introducing",
    readyAt: local("introducing", S) + BLUR_IN.seconds,
    leaveAt: LEAVE,
    fontPx: 28,
  },
  {
    id: "title",
    text: `${P.productBy} [logo]`,
    readyAt: local("title_typed", S) + lock.ready,
    leaveAt: LEAVE,
    fontPx: INTRO.titleSize,
  },
  {
    id: "tagline",
    text: P.tagline,
    readyAt: local("tagline", S) + BLUR_IN.seconds,
    leaveAt: LEAVE,
    fontPx: INTRO.taglineSize,
  },
];
/** Everything has settled by this time (seconds into the scene); the rest is hold. */
export const SCENE02_SETTLED = Math.max(
  ...SCENE02_TEXT.map((b) => b.readyAt),
  local("title_typed", S) + lock.caretGone,
);

export const Scene02Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);

  // Colour returns: flat grey dissolves into the dawn plate over 1s.
  const dissolve = EASE(
    ramp(frame, ev("colour_returns"), ev("colour_returns") + sec(1)),
  );

  // The orb from Scene 1 becomes the lead Space orb and eases up above the title.
  const form = ev("space_orb_forms");
  const ring = EASE_SETTLE(ramp(frame, form + sec(0.1), form + sec(0.9)));
  const rise = EASE(ramp(frame, form + sec(0.05), form + sec(0.85)));
  const from = INTRO.handoffOrb;
  const to = INTRO.leadOrb;
  const x = from.x + (to.x - from.x) * rise;
  const y = from.y + (to.y - from.y) * rise;
  const size = from.size + (to.size - from.size) * rise;
  const r = orbOuterRadius(size, true);

  // The card waits at its final place and fades in once the orb has settled.
  const cardIn = EASE(ramp(frame, ev("card_in"), ev("card_in") + sec(0.5)));

  return (
    <AbsoluteFill style={{ width: 1920, height: 1080 }}>
      <PlateBackground plate="01" duration={sec(DUR)} {...S2_PLATE} />
      <AbsoluteFill
        style={{ background: COLOR.problemGrey, opacity: 1 - dissolve }}
      />

      <div
        data-guard="box"
        style={{
          position: "absolute",
          left: x - r,
          top: y - r,
          width: r * 2,
          height: r * 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AgentOrb
          size={size}
          leadRing={ring}
          timeOffset={sceneById(S).start}
          style={{ position: "absolute" }}
        />
      </div>

      <div
        data-glass
        style={{
          position: "absolute",
          left: INTRO.card.x,
          top: INTRO.card.y,
          width: INTRO.card.w,
          height: INTRO.card.h,
          borderRadius: INTRO.card.radius,
          background: CARD_BG,
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.95)",
          boxShadow: CARD_SHADOW,
          opacity: cardIn,
        }}
      />

      <IntroText
        introIn={ev("introducing")}
        titleStart={ev("title_typed")}
        taglineIn={ev("tagline")}
      />

      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};
