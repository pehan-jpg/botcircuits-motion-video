/**
 * Hero background — every timing, framing and grade value lives here.
 * Edit this file to retune the piece; components only read from it.
 */

export const VIDEO = {
  id: "HeroBackground",
  width: 1920,
  height: 1080,
  fps: 30,
  // 4 scenes x 135 frames - 3 transitions x 20 frames = 480 frames (16 s)
  durationInFrames: 480,
} as const;

export const TIMING = {
  sceneFrames: 135,
  transitionFrames: 20,
  // Final frames that fade in the source frames just before Scene A's start,
  // so frame 480 continues seamlessly into frame 0.
  loopFadeFrames: 15,
  pushIn: { from: 1.0, to: 1.06 },
} as const;

/** CSS filter values applied to a single clip before the shared grade. */
export type ClipCorrection = {
  brightness: number;
  contrast: number;
  saturate: number;
  sepia: number;
  hueRotateDeg: number;
};

export type ClipConfig = {
  name: string;
  src: string;
  /** Source time (seconds) at which the scene starts. Seeking is time based. */
  startSec: number;
  objectPosition: string;
  /** Flip horizontally, e.g. to move a subject out of the lower-right safe zone. */
  mirror: boolean;
  /** Anchor of the slow push-in, keeps the subject steady while scaling. */
  pushOrigin: string;
  correction: ClipCorrection;
};

export const CLIPS = {
  airport: {
    name: "A · Airport",
    src: "airport.mp4",
    startSec: 2.0,
    objectPosition: "50% 50%",
    mirror: false,
    pushOrigin: "45% 45%",
    correction: {
      brightness: 0.54,
      contrast: 1.0,
      saturate: 0.8,
      sepia: 0.45,
      hueRotateDeg: -10,
    },
  },
  sofa: {
    name: "B · Sofa",
    src: "sofa.mp4",
    startSec: 1.0,
    // 2560x1080 ultrawide cropped to 16:9; 35% keeps her in the left third.
    objectPosition: "35% 50%",
    mirror: false,
    pushOrigin: "30% 40%",
    correction: {
      brightness: 0.72,
      contrast: 1.04,
      saturate: 0.85,
      sepia: 0.2,
      hueRotateDeg: 0,
    },
  },
  hands: {
    name: "C · Hands",
    src: "hands.mp4",
    startSec: 1.0,
    objectPosition: "50% 50%",
    mirror: false,
    pushOrigin: "40% 55%",
    correction: {
      brightness: 0.95,
      contrast: 0.96,
      saturate: 0.72,
      sepia: 0.12,
      hueRotateDeg: 0,
    },
  },
  headset: {
    name: "D · Headset",
    src: "headset.mp4",
    // 1.0–3.0 s contains a fast handheld reframe; 3.0 s onward is steadier.
    startSec: 3.0,
    objectPosition: "50% 50%",
    // Mirrored so the dark monitor sits in the lower-right safe zone, not her shirt.
    mirror: true,
    pushOrigin: "38% 30%",
    correction: {
      brightness: 0.85,
      contrast: 1.0,
      saturate: 0.85,
      sepia: 0.42,
      hueRotateDeg: -6,
    },
  },
} satisfies Record<string, ClipConfig>;

export const GRADE = {
  /** Warm amber tint over everything. */
  tint: { color: "#ff9a3c", opacity: 0.12, blend: "soft-light" },
  /** Radial vignette, edges darkened toward deep brown rather than black. */
  vignette: { color: "28, 16, 8", edgeOpacity: 0.45, innerRadiusPct: 45 },
  /** Lifts pure blacks to deep brown (lighten blend). */
  shadowFloor: { color: "#1e140c", opacity: 0.85 },
  /** Animated SVG fractal noise. */
  grain: { opacity: 0.04, baseFrequency: 0.85, octaves: 2 },
  /** Calm, darker lower-right area reserved for chat bubbles later. */
  safeZone: { widthPct: 35, heightPct: 40, color: "20, 12, 6", opacity: 0.4 },
} as const;

export const FLARE = {
  /** Blurred amber radial gradient during each dissolve, screen blend. */
  color: "255, 170, 80",
  peakOpacity: 0.25,
  blurPx: 60,
  // Centre of the light leak, as % of frame.
  x: 30,
  y: 35,
  sizePct: 90,
} as const;

export const cssFilter = (c: ClipCorrection) =>
  `brightness(${c.brightness}) contrast(${c.contrast}) saturate(${c.saturate}) sepia(${c.sepia}) hue-rotate(${c.hueRotateDeg}deg)`;
