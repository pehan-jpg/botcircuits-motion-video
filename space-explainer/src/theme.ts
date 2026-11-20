import { Easing } from "remotion";
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fonts are vendored in /public/fonts (Fontsource, OFL) so renders never depend on the network.
const JAKARTA = "Plus Jakarta Sans";
const MONO = "JetBrains Mono";
if (typeof window !== "undefined") {
  for (const w of ["400", "500", "600", "700", "800"]) {
    loadFont({
      family: JAKARTA,
      url: staticFile(`fonts/plus-jakarta-sans-latin-${w}-normal.woff2`),
      weight: w,
    });
  }
  for (const w of ["400", "500", "600"]) {
    loadFont({
      family: MONO,
      url: staticFile(`fonts/jetbrains-mono-latin-${w}-normal.woff2`),
      weight: w,
    });
  }
}

export const VIDEO = { width: 1920, height: 1080, fps: 60 } as const;

export const FONT = {
  sans: `'${JAKARTA}', sans-serif`,
  mono: `'${MONO}', monospace`,
} as const;

export const COLOR = {
  ink: "#0D1224",
  inkMuted: "rgba(13, 18, 36, 0.6)",
  // Scene backgrounds
  problemGrey: "#EEF0F3",
  neutralPale: "#F4F6F8",
  white: "#FFFFFF",
  // Agent orb
  orbLight: "#8CC8FF",
  orbMid: "#3B6FE0",
  orbDeep: "#1B2A6B",
  // Human decision. Amber is reserved for the moment a person decides.
  amber: "#F2A43A",
  amberHalo: "#FFE2B3",
  // Night grade tint
  nightTint: "#0F1A33",
  // Product frame
  appBg: "#11172B",
  appPanel: "#182038",
  appLine: "rgba(255,255,255,0.08)",
} as const;

/** Frosted glass, used behind every pill or card that sits on a plate. */
export const GLASS = {
  background: "rgba(255,255,255,0.6)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.9)",
} as const;

/** EASE = cubic-bezier(0.22, 1, 0.36, 1). No overshoot. */
export const EASE = Easing.bezier(0.22, 1, 0.36, 1);
/** Settle with a small overshoot, capped at 4 percent. */
export const MAX_OVERSHOOT = 0.04;
export const EASE_SETTLE = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  // EASE to 1 + overshoot by 70 percent, then ease back to 1.
  if (c < 0.7) return EASE(c / 0.7) * (1 + MAX_OVERSHOOT);
  const k = (c - 0.7) / 0.3;
  return 1 + MAX_OVERSHOOT * (1 - Easing.inOut(Easing.cubic)(k));
};

export const TYPE = {
  charFadeMs: 70,
  jitter: 0.1,
  commaPauseMs: 140,
  stopPauseMs: 260,
  caretWidth: 2,
  caretOpacity: 0.7,
  caretHz: 1.1,
  caretFadeAfterMs: 300,
} as const;

export const HEADLINE_CPS = 20;
export const CHAT_CPS = 32;
export const REPLAY_CPS = 70;

/** Text blur in: from 24px blur with a 20px rise over 0.7s. */
export const BLUR_IN = { blur: 24, rise: 20, seconds: 0.7 } as const;

export const SAFE = 96;
export const MIN_TEXT_PX = 28;
export const MIN_CONTRAST = 4.5;
export const MAX_IDLE_SECONDS = 0.4;
export const MIN_LOGO_PX = 28;

export const TEXT_BEAT = {
  size: 56,
  holdSeconds: 2.5,
  outSeconds: 0.5,
} as const;

/** Reading time a line needs once fully on screen. */
export const readHoldSeconds = (text: string) =>
  1.2 + 0.25 * text.trim().split(/\s+/).filter(Boolean).length;

export const PRODUCT_FRAME = {
  width: 1500,
  radius: 24,
  shadow: "0 40px 120px rgba(13,18,36,0.28), 0 12px 32px rgba(13,18,36,0.18)",
  maxCameraScale: 1.06,
} as const;

export const ORB = {
  satellitePeriodSeconds: 6,
  satelliteSize: 10,
  haloWidth: 2,
  haloOpacity: 0.6,
  leadScale: 1.3,
  maxHueShift: 25,
} as const;

export const HUMAN = { size: 64 } as const;
