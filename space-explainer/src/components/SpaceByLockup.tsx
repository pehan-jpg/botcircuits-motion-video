import React from "react";
import {
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BLUR_IN, COLOR, EASE, FONT, HEADLINE_CPS } from "../theme";
import { typeDuration } from "../lib/typewriter";
import { Typewriter } from "./Typewriter";

/** Plus Jakarta Sans metrics (units per em 1000): cap height 745, descender 222. */
const CAP = 0.745;
const DESC = 0.222;
const LOGO_ASPECT = 1898 / 390;
const LOGO_IN_SECONDS = 0.5;
const TEXT = "Space by";

/** Seconds from typing start until the lockup is complete (logo fully in). */
export const lockupTiming = (seed = "lockup") => {
  const typed = typeDuration(TEXT, HEADLINE_CPS, seed);
  return {
    typed,
    logoIn: typed,
    ready: typed + LOGO_IN_SECONDS,
    caretGone: typed + LOGO_IN_SECONDS + 0.3,
  };
};

type Props = {
  fontSize: number;
  /** Frame at which "Space by" starts typing. Omit for a static, complete lockup. */
  startFrame?: number;
  seed?: string;
  color?: string;
  /** True when the lockup sits on a white surface (LogoGuard). */
  onWhite: boolean;
  /** Extra opacity and blur applied to the logo, for exits. */
  logoStyle?: React.CSSProperties;
};

/**
 * "Space by" followed by the BotCircuits logo, exactly as supplied.
 * The logo is sized to cap height plus descender and sits on the baseline
 * with a 0.25em gap. Never type "BotCircuits" as text: use this lockup.
 */
export const SpaceByLockup: React.FC<Props> = ({
  fontSize,
  startFrame,
  seed = "lockup",
  color = COLOR.ink,
  onWhite,
  logoStyle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timing = lockupTiming(seed);
  const isStatic = startFrame === undefined;
  const t = isStatic ? Infinity : (frame - startFrame) / fps;
  const p = isStatic
    ? 1
    : EASE(
        interpolate(
          t,
          [timing.logoIn, timing.logoIn + LOGO_IN_SECONDS],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        ),
      );

  const logo = (
    <span
      data-guard="logo"
      data-guard-backing={onWhite ? "white" : undefined}
      style={{
        display: "inline-block",
        marginLeft: "0.25em",
        height: `${CAP + DESC}em`,
        verticalAlign: `-${DESC}em`,
        opacity: p,
        filter: p < 1 ? `blur(${BLUR_IN.blur * (1 - p)}px)` : undefined,
        transform: `translateY(${BLUR_IN.rise * (1 - p)}px)`,
        ...logoStyle,
      }}
    >
      <Img
        src={staticFile("logo.png")}
        style={{
          height: "100%",
          width: `${(CAP + DESC) * LOGO_ASPECT}em`,
          display: "block",
        }}
      />
    </span>
  );

  const textStyle: React.CSSProperties = {
    fontFamily: FONT.sans,
    fontWeight: 600,
    fontSize,
    letterSpacing: "-0.03em",
    lineHeight: 1.15,
    color,
  };

  if (isStatic) {
    return (
      <div
        data-guard="text"
        data-guard-label="Lockup: Space by"
        style={{ ...textStyle, whiteSpace: "pre" }}
      >
        {TEXT}
        {logo}
      </div>
    );
  }
  return (
    <div data-guard="text" data-guard-label="Lockup: Space by">
      <Typewriter
        lines={[TEXT]}
        cps={HEADLINE_CPS}
        startFrame={startFrame}
        seed={seed}
        caretColor={color}
        caretFadeAt={timing.ready}
        after={logo}
        style={textStyle}
      />
    </div>
  );
};
