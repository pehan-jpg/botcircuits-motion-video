/**
 * Hero overlay — every copy string, timing, position, colour and easing value lives here.
 * All timings are in SECONDS; components convert to frames from the composition fps
 * (60 fps by default, 30 fps for the comparison copy), so nothing is hard coded in frames.
 */

/** Placeholder until the exact BotCircuits lime is supplied. */
export const BRAND_LIME = "#B5E61D";

/** The merged base video: 30 fps, 614 frames. Output fps can differ; the video is seeked by time. */
export const SOURCE = { fps: 30, frames: 614 } as const;

export const COMP = {
  id: "HeroOverlay",
  width: 1920,
  height: 1080,
  /** Default output frame rate; the 30 fps comparison copy passes `fps: 30` as an input prop. */
  fps: 60,
  durationSec: SOURCE.frames / SOURCE.fps,
  /**
   * "original" plays public/hero_base.mp4 exactly as delivered; "graded" plays
   * public/hero_base_graded.mp4 (made with ffmpeg, see README). Remotion adds no filters either way.
   */
  baseVideo: "graded" as "original" | "graded",
  sources: { original: "hero_base.mp4", graded: "hero_base_graded.mp4" },
  /** Default for the composition's `showOverlay` input prop; false renders the clean version. */
  showOverlay: true,
  /** Only visible if a transition ever exposes a frame edge; light, never black. */
  backdrop: "#F2F0EC",
} as const;

/** Frames at the given fps for a duration in seconds. */
export const toFrames = (seconds: number, fps: number) => Math.round(seconds * fps);

/**
 * Cuts: the first frame of each new shot, from ffmpeg scene detection on the 30 fps source
 * (frames 153, 303, 463; scene scores 0.93, 0.63, 0.54), expressed in seconds.
 */
export const CUTS = { cut1: 153 / SOURCE.fps, cut2: 303 / SOURCE.fps, cut3: 463 / SOURCE.fps } as const;

export type TransitionType = "blurDip" | "whipPan" | "limeSweep";

export type TransitionConfig = {
  name: string;
  type: TransitionType;
  /** The cut time in seconds; the effect is centred on it (duration / 2 either side). */
  time: number;
  duration: number;
};

export const TRANSITIONS: TransitionConfig[] = [
  { name: "Cut 1 · blur dip + light leak", type: "blurDip", time: CUTS.cut1, duration: 0.8 },
  { name: "Cut 2 · whip pan", type: "whipPan", time: CUTS.cut2, duration: 0.8 },
  { name: "Cut 3 · lime sweep", type: "limeSweep", time: CUTS.cut3, duration: 0.8 },
  // time === durationSec: the last 0.4 s and the first 0.4 s of the loop.
  { name: "Loop · blur dip + light leak", type: "blurDip", time: COMP.durationSec, duration: 0.8 },
];

export const TRANSITION_FX = {
  easing: [0.65, 0, 0.35, 1],
  blurDip: {
    scale: 1.07,
    blurPx: 16,
    flareOpacity: 0.3,
    flareColor: "255, 246, 232",
  },
  whipPan: {
    distancePx: 160,
    /** Horizontal feGaussianBlur stdDeviation at the cut. */
    motionBlur: 40,
  },
  limeSweep: {
    bandWidthPct: 45,
    /** Feathered share of the band on each side. */
    featherPct: 30,
    extraSoftnessPx: 24,
    peakOpacity: 0.92,
    edgeOpacity: 0.55,
    pushIn: 0.04,
  },
} as const;

/** Single right-aligned, bottom-anchored column shared by every scene. */
export const STACK = {
  left: 1400,
  right: 1840,
  width: 440,
  gap: 12,
  queryMaxWidth: 400,
  /** Website navigation bar: no resting card may sit above this line. */
  navSafeY: 110,
  /** Soft mask: fade over the top 56px and bottom 40px of the stack container. */
  maskTopPx: 56,
  maskBottomPx: 40,
} as const;

export const THEME = {
  lime: BRAND_LIME,
  onLime: "#12161B",
  text: "#FFFFFF",
  textSecondary: "rgba(255, 255, 255, 0.68)",
  subtleFill: "rgba(255, 255, 255, 0.10)",
  hairline: "rgba(255, 255, 255, 0.22)",
  skeleton: "rgba(255, 255, 255, 0.14)",
  textShadow: "0 1px 10px rgba(0, 0, 0, 0.25)",
  glass: {
    /** Action cards: dark tinted glass; fill alpha per scene (`tint`), default 0.58. */
    actionRgb: "24, 28, 34",
    actionAlpha: 0.58,
    actionSheen: "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.28)",
    innerHighlight: "inset 0 1px 0 rgba(255, 255, 255, 0.22)",
    /** Query bubbles: dark glass too, no border; fill alpha per scene (`queryTint`), default 0.50. */
    queryRgb: "34, 38, 44",
    queryAlpha: 0.5,
    backdropFilter: "blur(28px) saturate(1.4)",
    radius: 22,
    shadow: "0 18px 50px rgba(0, 0, 0, 0.22)",
  },
  /** Integer sizes only; line height 1.3 for every text style. */
  type: {
    lineHeight: 1.3,
    title: { size: 19, weight: 600 },
    body: { size: 17, weight: 400 },
    query: { size: 17, weight: 500 },
    button: { size: 16, weight: 600 },
    label: { size: 11, weight: 600, letterSpacing: "0.08em", opacity: 0.7 },
  },
  card: { padY: 16, padX: 20 },
  query: { padY: 12, padX: 18, labelGap: 4 },
} as const;

/** One curve for every position change: fast start, long soft settle, no overshoot. */
export const EASE_CURVE = [0.16, 1, 0.3, 1] as const;

export const MOTION = {
  /** New item: rises from (own height + 24px) below while the stack scrolls up by (height + 12px). */
  enter: { duration: 0.4, opacityDuration: 0.2, extraDropPx: 24, textDelay: 2 / 30, textFade: 0.2 },
  /** Exit: the whole stack scrolls up 40px while fading out. No stagger. */
  exit: { duration: 0.4, liftPx: 40 },
  /** Query dims once the card arrives. */
  dim: { to: 0.8, duration: 0.3 },
  /** Cards that grow: height and the new row's fade + 8px rise. */
  grow: { duration: 0.3, rowRisePx: 8 },
  /** Content swaps inside a card: opacity-only crossfade, 8 frames at 30 fps with a 4-frame overlap. */
  crossfade: { duration: 8 / 30, overlap: 4 / 30 },
  /** Cards keep 16 frames (at 30 fps) clear of every cut and the start of the loop. */
  cutClearance: 16 / 30,
} as const;

/** Micro-animation durations in seconds (shortened so every beat fits its scene window). */
export const PRIMITIVES = {
  ringDraw: { strokePx: 1.5, duration: 0.2 },
  press: { duration: 0.2, brighten: 0.08 },
  check: { circleFade: 0.12, drawDuration: 0.23, strokePx: 2.5, color: "#12161B" },
  spinner: { sizePx: 18, strokePx: 2, track: "rgba(255, 255, 255, 0.25)", arcDeg: 90, turnSeconds: 0.667, extend: 0.08, fill: 0.05, draw: 0.12 },
  stepBar: { heightPx: 3 },
  route: { dash: 6, gap: 6, duration: 0.45 },
  /** Per character; `groupStagger` offsets the three detail values. */
  digitRoll: { duration: 0.25, stagger: 0.02, groupStagger: 0.04 },
  segments: { count: 4, heightPx: 6, radius: 3, track: "rgba(255, 255, 255, 0.2)", fill: 0.2, stagger: 0.05 },
  tag: { tickDuration: 0.15, tickStagger: 0.07, limeFade: 0.1 },
  pill: { fade: 0.15, checkDelay: 0.05, check: 0.15 },
  detail: { duration: 0.3, risePx: 8 },
  shield: { draw: 0.35, fill: 0.08, check: 0.17, strokePx: 2.5, fillAlpha: 0.18 },
  orb: { sizePx: 16 },
} as const;

/** Query label: "Customer · <industry>", or just "Customer" when switched off. */
export const INDUSTRY_LABEL = { showIndustryLabel: true, base: "Customer", separator: " · " } as const;

export const queryLabel = (industry: string) =>
  INDUSTRY_LABEL.showIndustryLabel ? `${INDUSTRY_LABEL.base}${INDUSTRY_LABEL.separator}${industry}` : INDUSTRY_LABEL.base;

/* ---------- Beat scheduling ---------- */

/** Fixed pause between linked micro steps (spinner → next step, ring → press, …). */
export const LINK_GAP = 0.05;

type Beat<K extends string> = { key: K; duration: number; then: "hold" | "gap" | "none" };

/**
 * Lays beats out one after another inside [start, end]: every "hold" gets the same share of
 * the time left over, "gap" is LINK_GAP, and the last beat ends exactly at `end`.
 */
const schedule = <K extends string>(start: number, end: number, beats: Beat<K>[]) => {
  const fixed = beats.reduce((sum, b) => sum + b.duration + (b.then === "gap" ? LINK_GAP : 0), 0);
  const holds = beats.filter((b) => b.then === "hold").length;
  const hold = (end - start - fixed) / holds;
  const at = {} as Record<K, number>;
  let t = start;
  for (const b of beats) {
    // Start every beat on a 1/30 s boundary: a frame at both 30 and 60 fps, so motions begin cleanly.
    at[b.key] = Math.round(t * SOURCE.fps) / SOURCE.fps;
    t += b.duration + (b.then === "hold" ? hold : b.then === "gap" ? LINK_GAP : 0);
  }
  return { at, hold, start, end };
};

const E = MOTION.enter.duration;
const X = MOTION.exit.duration;
const XF = MOTION.crossfade.duration + MOTION.crossfade.overlap;
const G = MOTION.grow.duration;
const P = PRIMITIVES;
const CHECK = P.check.circleFade + P.check.drawDuration;
const SPIN_DONE = P.spinner.extend + P.spinner.fill + P.spinner.draw;
const PILL = P.pill.fade + P.pill.checkDelay + P.pill.check;
const TICKS = P.tag.tickStagger + P.tag.tickDuration + P.tag.limeFade;
// Longest value is 9 characters ("6 to 8 PM"), third in the group.
const DIGITS = P.digitRoll.duration + 8 * P.digitRoll.stagger + 2 * P.digitRoll.groupStagger;
const SEGMENTS = P.segments.fill + 2 * P.segments.stagger;
const SHIELD = P.shield.draw + P.shield.fill + P.shield.check;

/** Scene windows: from 16 frames after a cut to 16 frames before the next (scene 4 ends on 612/614 as specified). */
const C = MOTION.cutClearance;
const WINDOWS = {
  travel: [C, CUTS.cut1 - C],
  banking: [CUTS.cut1 + C, CUTS.cut2 - C],
  retail: [CUTS.cut2 + C, CUTS.cut3 - C],
  insurance: [CUTS.cut3 + C, 612 / SOURCE.fps],
} as const;

const travelBeats = schedule(WINDOWS.travel[0], WINDOWS.travel[1], [
  { key: "query", duration: E, then: "hold" },
  { key: "card", duration: E, then: "hold" },
  { key: "loading", duration: XF, then: "hold" },
  { key: "options", duration: XF, then: "hold" },
  { key: "ring", duration: P.ringDraw.duration, then: "gap" },
  { key: "press", duration: P.press.duration, then: "gap" },
  { key: "confirmed", duration: XF, then: "none" },
  { key: "check", duration: CHECK, then: "hold" },
  { key: "exit", duration: X, then: "none" },
]);

const bankingBeats = schedule(WINDOWS.banking[0], WINDOWS.banking[1], [
  { key: "query", duration: E, then: "hold" },
  // The card arrives with its title and the first step already running.
  { key: "card", duration: E, then: "hold" },
  { key: "step1Done", duration: SPIN_DONE, then: "gap" },
  { key: "step2", duration: G, then: "none" },
  { key: "step2Done", duration: SPIN_DONE, then: "gap" },
  { key: "step3", duration: G, then: "none" },
  { key: "step3Done", duration: SPIN_DONE, then: "hold" },
  { key: "footer", duration: G, then: "none" },
  { key: "footerCheck", duration: CHECK, then: "hold" },
  { key: "exit", duration: X, then: "none" },
]);

const retailBeats = schedule(WINDOWS.retail[0], WINDOWS.retail[1], [
  { key: "query", duration: E, then: "hold" },
  { key: "card", duration: E, then: "hold" },
  { key: "badge", duration: PILL, then: "gap" },
  { key: "route", duration: P.route.duration, then: "gap" },
  { key: "details", duration: DIGITS, then: "gap" },
  { key: "segments", duration: SEGMENTS, then: "hold" },
  { key: "tag", duration: E, then: "none" },
  { key: "ticks", duration: TICKS, then: "hold" },
  { key: "exit", duration: X, then: "none" },
]);

const insuranceBeats = schedule(WINDOWS.insurance[0], WINDOWS.insurance[1], [
  { key: "query", duration: E, then: "hold" },
  { key: "card", duration: E, then: "hold" },
  { key: "shield", duration: SHIELD, then: "gap" },
  { key: "step1", duration: G, then: "none" },
  { key: "step1Done", duration: SPIN_DONE, then: "gap" },
  { key: "step2", duration: G, then: "none" },
  { key: "step2Done", duration: SPIN_DONE, then: "gap" },
  // The pill fades in with its row as the card grows, then its check draws.
  { key: "pill", duration: G + P.pill.checkDelay + P.pill.check, then: "gap" },
  { key: "detail", duration: G, then: "hold" },
  { key: "exit", duration: X, then: "none" },
]);

/** Per-scene holds actually achieved (seconds), for reporting. */
export const ACHIEVED_HOLDS = {
  travel: travelBeats.hold,
  banking: bankingBeats.hold,
  retail: retailBeats.hold,
  insurance: insuranceBeats.hold,
};

/* ---------- Layout heights (integer px, so resting positions stay on whole pixels) ---------- */

const LINE = (size: number) => Math.round(size * THEME.type.lineHeight);
const PAD = 2 * THEME.card.padY + 2; // padding + 1px border top and bottom
export const LINES = {
  title: LINE(THEME.type.title.size),
  body: LINE(THEME.type.body.size),
  label: LINE(THEME.type.label.size),
} as const;
const queryHeight = (lines: number) => 2 * THEME.query.padY + LINES.label + THEME.query.labelGap + lines * LINES.body;
export const STEP_ROW = 26;
export const STEP_GAP = 6;

export const SCENES = {
  travel: {
    name: "Scene 1 · Travel",
    industry: "Travel",
    stackBottom: 520,
    /** Action-card fill alpha (raised in 0.05 steps until text contrast passes). */
    tint: 0.85,
    queryTint: 0.80,
    /** Fits on one line at 17px. */
    query: { text: "Is my flight to Singapore still on time?", lines: 1 },
    queryHeight: queryHeight(1),
    beats: travelBeats.at,
    /** Header 22 + gap 10 + body area 96. */
    card: { height: PAD + 22 + 10 + 96 },
    copy: {
      label: "Flight update",
      time: "now",
      delayed: "Your 6:40 PM flight is delayed by 2 h 10 m.",
      finding: "Finding your best option",
      option1: "9:15 PM tonight, seat 14A",
      option2: "7:05 AM tomorrow",
      rebook: "Rebook",
      confirmed: "Rebooked for 9:15 PM",
      confirmedDetail: "Seat 14A",
    },
  },
  banking: {
    name: "Scene 2 · Banking",
    industry: "Banking",
    stackBottom: 500,
    tint: 0.55,
    queryTint: 0.50,
    query: { text: "I lost my card. Can you block it and send a new one?", lines: 2 },
    queryHeight: queryHeight(2),
    beats: bankingBeats.at,
    /** Title + first step; each later step and the footer grow the card upward. */
    card: { height: PAD + LINES.title + 10 + STEP_ROW, stepGrow: STEP_GAP + STEP_ROW, footerGrow: 10 + LINES.body },
    steps: ["Verifying your identity", "Blocking the card ending 4821", "Ordering a replacement card"],
    copy: {
      title: "Securing your account",
      footer: "Replacement arrives in 3 working days",
    },
  },
  retail: {
    name: "Scene 3 · Retail",
    industry: "Retail",
    stackBottom: 540,
    tint: 0.60,
    queryTint: 0.55,
    query: { text: "Can you deliver my order this evening instead?", lines: 2 },
    queryHeight: queryHeight(2),
    beats: retailBeats.at,
    /** Header 24, route 44, divider block 21, details 42, segments 26 (with gaps). */
    card: { height: PAD + 24 + 10 + 44 + 10 + 1 + 10 + 42 + 12 + 26 },
    tag: { height: 40 },
    /** Segmented bar fills the first `filled` of the four stages. */
    stagesFilled: 3,
    copy: {
      label: "Order 20931",
      badge: "Out for delivery",
      from: "Store",
      to: "Home",
      details: [
        { label: "Items", value: "3" },
        { label: "Day", value: "Today" },
        { label: "Window", value: "6 to 8 PM" },
      ],
      stages: ["Packed", "Shipped", "Out for delivery", "Delivered"],
      tag: "Delivery moved to this evening",
    },
  },
  insurance: {
    name: "Scene 4 · Insurance",
    industry: "Insurance",
    stackBottom: 980,
    tint: 0.82,
    queryTint: 0.55,
    query: { text: "I had a minor accident. Can you start a claim?", lines: 2 },
    queryHeight: queryHeight(2),
    beats: insuranceBeats.at,
    /** Header 20, title, shield row 44; steps, pill and detail grow the card upward. */
    card: {
      height: PAD + 20 + 6 + LINES.title + 10 + 44,
      step1Grow: 10 + STEP_ROW,
      step2Grow: STEP_GAP + STEP_ROW,
      pillGrow: 10 + 28,
      detailGrow: 6 + LINES.body,
    },
    steps: ["Checking your policy cover", "Logging the incident details"],
    copy: {
      label: "AI concierge",
      title: "Opening your claim",
      policyLabel: "Motor policy",
      policy: "Comprehensive cover",
      confirmed: "Claim opened",
      detail: "Claim reference CL 48213",
    },
  },
} as const;

/** Throws if the beats break the cut clearance, overlap, or a stack reaches above the nav line. */
export const validateTimeline = () => {
  for (const [key, h] of Object.entries(ACHIEVED_HOLDS)) {
    if (h < 0.1) throw new Error(`${key}: beats do not fit the scene window (hold ${h.toFixed(3)} s)`);
  }
  const q = STACK.gap;
  const { travel, banking, retail, insurance } = SCENES;
  const peaks: [string, number, number][] = [
    [travel.name, travel.stackBottom, travel.queryHeight + q + travel.card.height],
    [banking.name, banking.stackBottom, banking.queryHeight + q + banking.card.height + 2 * banking.card.stepGrow + banking.card.footerGrow],
    [retail.name, retail.stackBottom, retail.queryHeight + q + retail.card.height + q + retail.tag.height],
    [
      insurance.name,
      insurance.stackBottom,
      insurance.queryHeight + q + insurance.card.height + insurance.card.step1Grow + insurance.card.step2Grow + insurance.card.pillGrow + insurance.card.detailGrow,
    ],
  ];
  for (const [name, bottom, height] of peaks) {
    if (bottom - height < STACK.navSafeY) throw new Error(`${name}: stack top ${bottom - height} is above the nav safe line`);
  }
};

/** Height the stack container needs (tallest stack plus the mask margins). */
export const STACK_CONTAINER_HEIGHT = 520;
