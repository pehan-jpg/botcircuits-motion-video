import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { EASE } from "../theme";
import { local, localF, sceneById } from "../timeline";
import { PlateBackground } from "../backgrounds/PlateBackground";
import { ProblemBackdrop } from "../backgrounds/ProblemBackdrop";
import { SpaceOrb, spaceOrbOuterRadius } from "../components/SpaceOrb";
import { GuardLayer } from "../components/GuardLayer";
import { lockupTiming } from "../components/SpaceByLockup";
import type { TextBeatSpec } from "../lib/guards";
import { INTRO, IntroGlow, IntroLine } from "./shared/intro";

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

const lock = lockupTiming(INTRO.line.prefix, "s2-line", "assemble");
/** The line stays through the boundary and blurs out in Scene 3 at s3_intro_out. */
const LEAVE = DUR + local("s3_intro_out", "S03");
export const SCENE02_TEXT: TextBeatSpec[] = [
  {
    id: "line",
    text: `${INTRO.line.prefix}Space by [logo]`,
    readyAt: local("intro_typed", S) + lock.ready,
    leaveAt: LEAVE,
    fontPx: INTRO.line.size,
  },
];
/** Everything has settled by this time (seconds into the scene); the rest is hold. */
export const SCENE02_SETTLED = local("intro_typed", S) + lock.caretGone;

export const Scene02Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);

  // The Scene 1 backdrop dissolves into plate 01 over 1s.
  const dissolve = EASE(
    ramp(frame, ev("colour_returns"), ev("colour_returns") + sec(1)),
  );
  // The orb dissolves: scale 1 to 0.7, opacity to 0, with a soft bloom of light.
  const o = ev("orb_dissolve");
  const orbP = EASE(ramp(frame, o, o + sec(1)));
  const bloom = ramp(frame, o, o + sec(1));
  const bloomO = Math.sin(Math.PI * bloom) * 0.75;
  const orb = INTRO.handoffOrb;
  const orbR = spaceOrbOuterRadius(orb.size, true);
  const glowIn = EASE(ramp(frame, o + sec(0.4), o + sec(1.2)));

  return (
    <AbsoluteFill style={{ width: 1920, height: 1080 }}>
      <PlateBackground plate="01" duration={sec(DUR)} {...S2_PLATE} />
      <AbsoluteFill style={{ opacity: 1 - dissolve }}>
        <ProblemBackdrop timeOffset={sceneById(S).start} />
      </AbsoluteFill>

      <IntroGlow opacity={glowIn} />

      {/* Bloom of light as the orb dissolves */}
      {bloomO > 0.001 ? (
        <div
          style={{
            position: "absolute",
            left: orb.x - 420,
            top: orb.y - 420,
            width: 840,
            height: 840,
            borderRadius: "50%",
            background:
              "radial-gradient(closest-side, rgba(255,255,255,0.95), rgba(236,232,255,0.5) 40%, rgba(255,255,255,0) 100%)",
            transform: `scale(${0.5 + 0.9 * bloom})`,
            opacity: bloomO,
          }}
        />
      ) : null}
      {orbP < 1 ? (
        <div
          style={{
            position: "absolute",
            left: orb.x - orbR,
            top: orb.y - orbR,
            width: orbR * 2,
            height: orbR * 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 1 - orbP,
            transform: `scale(${1 - 0.3 * orbP})`,
            filter: orbP > 0.02 ? `blur(${orbP * 6}px)` : undefined,
          }}
        >
          <SpaceOrb
            size={orb.size}
            ticks
            pulse
            timeOffset={sceneById(S).start}
          />
        </div>
      ) : null}

      <IntroLine startFrame={ev("intro_typed")} />

      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};
