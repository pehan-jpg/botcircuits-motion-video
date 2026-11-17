import { Easing } from "remotion";

// Brand and type tokens shared by every BotCircuits motion piece.
export const INK = "#0D1224";
// PLACEHOLDER brand lime. Replace with the official hex when confirmed.
export const BRAND_LIME = "#96C93D";

export const EASE_BEZIER = [0.22, 1, 0.36, 1] as const;
export const EASE = Easing.bezier(...EASE_BEZIER);

export const FPS = 60;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** Seconds to whole frames at the project frame rate. */
export const sec = (n: number) => Math.round(n * FPS);

/** Typing speeds, in characters per second. */
export const HEADLINE_CPS = 20;
export const CHAT_CPS = 32;

/** Layout rules. */
export const SAFE_AREA = 96;
/** Centre 60 percent of the frame: everything must also sit inside this box. */
export const CENTRE_BOX = {
  left: WIDTH * 0.2,
  top: HEIGHT * 0.2,
  right: WIDTH * 0.8,
  bottom: HEIGHT * 0.8,
};
/** Hard cap on any scale overshoot (4 percent). */
export const MAX_OVERSHOOT = 0.04;

/** Expected brand files in /public. Missing files render a labelled placeholder. */
export const LOGO_SYMBOL_FILE = "botcircuits-logo.svg";
export const LOGO_WORDMARK_FILE = "botcircuits-wordmark.svg";
