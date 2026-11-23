import React from "react";
import {
  Img,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BLUR_IN, COLOR, EASE, FONT, HEADLINE_CPS } from "../theme";
import { typeDuration } from "../lib/typewriter";
import { Typewriter } from "./Typewriter";
import LOGO from "./logoParts.json";

/** Plus Jakarta Sans metrics (units per em 1000): cap height 745, descender 222. */
const CAP = 0.745;
const DESC = 0.222;
const LOGO_EM = CAP + DESC;
const UNIT = LOGO_EM / LOGO.height; // em per logo pixel
const LOGO_W_EM = LOGO.width * UNIT;
const BLUR_SECONDS = 0.5;
/** Dots assemble, staggered over 0.9s. */
const ASSEMBLE = { total: 0.9, each: 0.5, maxOffset: 140 };

export type LogoMode = "blur" | "assemble";

/** Seconds from typing start: logo starts, logo complete, caret gone. */
export const lockupTiming = (
  prefix = "",
  seed = "lockup",
  mode: LogoMode = "blur",
) => {
  const typed = typeDuration(`${prefix}Space by`, HEADLINE_CPS, seed);
  const logoTime = mode === "assemble" ? ASSEMBLE.total : BLUR_SECONDS;
  return {
    typed,
    logoIn: typed,
    ready: typed + logoTime,
    caretGone: typed + logoTime + 0.3,
  };
};

type Props = {
  fontSize: number;
  /** Text before "Space by", for example "Introducing ". */
  prefix?: string;
  weight?: number;
  tracking?: string;
  /** Frame at which typing starts. Omit for a static, complete lockup. */
  startFrame?: number;
  seed?: string;
  color?: string;
  logoMode?: LogoMode;
  /** LogoGuard backing: "white" when on a white surface, "sampled" when on a plate (the check script samples it). */
  backing: "white" | "sampled";
};

/** The logo, exactly as supplied. While assembling, each dot is a pixel exact crop of the supplied PNG. */
const LogoSlot: React.FC<{
  t: number;
  mode: LogoMode;
  backing: Props["backing"];
}> = ({ t, mode, backing }) => {
  const done = t >= (mode === "assemble" ? ASSEMBLE.total : BLUR_SECONDS);
  const base: React.CSSProperties = {
    display: "inline-block",
    position: "relative",
    marginLeft: "0.25em",
    width: `${LOGO_W_EM}em`,
    height: `${LOGO_EM}em`,
    verticalAlign: `-${DESC}em`,
  };
  // LogoGuard measures the finished logo only, not dots in flight.
  const guard = done
    ? ({ "data-guard": "logo", "data-guard-backing": backing } as const)
    : {};
  if (done) {
    return (
      <span {...guard} style={base}>
        <Img
          src={staticFile("logo.png")}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </span>
    );
  }
  if (mode === "blur") {
    const p = EASE(Math.max(0, Math.min(1, t / BLUR_SECONDS)));
    return (
      <span
        {...guard}
        style={{
          ...base,
          opacity: p,
          filter: p < 1 ? `blur(${BLUR_IN.blur * (1 - p)}px)` : undefined,
          transform: `translateY(${BLUR_IN.rise * (1 - p)}px)`,
        }}
      >
        <Img
          src={staticFile("logo.png")}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </span>
    );
  }
  const n = LOGO.parts.length;
  const stagger = (ASSEMBLE.total - ASSEMBLE.each) / Math.max(1, n - 1);
  const wordP = EASE(Math.max(0, Math.min(1, (t - 0.2) / BLUR_SECONDS)));
  const wm = LOGO.wordmark;
  return (
    <span {...guard} style={base}>
      {LOGO.parts.map((part, i) => {
        const order = Math.floor(random(`dot-order-${i}`) * 1000) % n;
        const start = ((order + i) % n) * stagger;
        const p = EASE(Math.max(0, Math.min(1, (t - start) / ASSEMBLE.each)));
        const ang = random(`dot-a-${i}`) * Math.PI * 2;
        const dist = ASSEMBLE.maxOffset * (0.45 + 0.55 * random(`dot-d-${i}`));
        return (
          <Img
            key={part.file}
            src={staticFile(part.file)}
            style={{
              position: "absolute",
              left: `${part.x * UNIT}em`,
              top: `${part.y * UNIT}em`,
              width: `${part.w * UNIT}em`,
              height: `${part.h * UNIT}em`,
              opacity: p,
              transform: `translate(${Math.cos(ang) * dist * (1 - p)}px, ${Math.sin(ang) * dist * (1 - p)}px)`,
            }}
          />
        );
      })}
      <Img
        src={staticFile(wm.file)}
        style={{
          position: "absolute",
          left: `${wm.x * UNIT}em`,
          top: 0,
          width: `${wm.w * UNIT}em`,
          height: "100%",
          opacity: wordP,
          filter:
            wordP < 1 ? `blur(${BLUR_IN.blur * (1 - wordP)}px)` : undefined,
          transform: `translateY(${BLUR_IN.rise * (1 - wordP)}px)`,
        }}
      />
    </span>
  );
};

/**
 * "[prefix]Space by" followed by the BotCircuits logo, exactly as supplied.
 * Logo height is cap height plus descender, on the baseline, 0.25em gap.
 * The whole line, logo slot included, is laid out up front so nothing reflows.
 * Never type "BotCircuits" as text: use this lockup.
 */
export const SpaceByLockup: React.FC<Props> = ({
  fontSize,
  prefix = "",
  weight = 600,
  tracking = "-0.03em",
  startFrame,
  seed = "lockup",
  color = COLOR.ink,
  logoMode = "blur",
  backing,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const text = `${prefix}Space by`;
  const timing = lockupTiming(prefix, seed, logoMode);
  const isStatic = startFrame === undefined;
  const t = isStatic ? Infinity : (frame - startFrame) / fps;
  const textStyle: React.CSSProperties = {
    fontFamily: FONT.sans,
    fontWeight: weight,
    fontSize,
    letterSpacing: tracking,
    lineHeight: 1.15,
    color,
  };
  const logo = (
    <LogoSlot
      t={isStatic ? Infinity : t - timing.logoIn}
      mode={logoMode}
      backing={backing}
    />
  );
  const label = `Lockup: ${text}`;
  if (isStatic) {
    return (
      <div
        data-guard="text"
        data-guard-label={label}
        style={{ ...textStyle, whiteSpace: "pre" }}
      >
        {text}
        {logo}
      </div>
    );
  }
  return (
    <div data-guard={t >= 0 ? "text" : undefined} data-guard-label={label}>
      <Typewriter
        lines={[text]}
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
