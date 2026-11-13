/**
 * Hero overlay — every copy string, timing, position, colour and spring value lives here.
 * Frames are absolute composition frames (30 fps).
 */

/** Placeholder until the exact BotCircuits lime is supplied. */
export const BRAND_LIME = "#B5E61D";

export const COMP = {
  id: "HeroOverlay",
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 614,
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

/**
 * First frame of each new shot, confirmed with ffmpeg scene detection
 * (scene scores 0.93, 0.63, 0.54).
 */
export const CUTS = { cut1: 153, cut2: 303, cut3: 463 } as const;

export type TransitionType = "blurDip" | "whipPan" | "limeSweep";

export type TransitionConfig = {
  name: string;
  type: TransitionType;
  /** The cut frame; the effect is centred on it (duration / 2 either side). */
  frame: number;
  duration: number;
};

export const TRANSITIONS: TransitionConfig[] = [
  { name: "Cut 1 · blur dip + light leak", type: "blurDip", frame: CUTS.cut1, duration: 24 },
  { name: "Cut 2 · whip pan", type: "whipPan", frame: CUTS.cut2, duration: 24 },
  { name: "Cut 3 · lime sweep", type: "limeSweep", frame: CUTS.cut3, duration: 24 },
  // frame === durationInFrames: last 12 frames and first 12 frames of the loop.
  { name: "Loop · blur dip + light leak", type: "blurDip", frame: COMP.durationInFrames, duration: 24 },
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
  /** Every query is two balanced lines at 21px; fixed so layout is deterministic. */
  queryHeight: 102,
  /** New elements rise into the bottom slot from this far below it. */
  risePx: 24,
  /** Website navigation bar: nothing may sit above this line. */
  navSafeY: 110,
} as const;

export const THEME = {
  lime: BRAND_LIME,
  onLime: "#12161B",
  text: "#FFFFFF",
  textSecondary: "rgba(255, 255, 255, 0.68)",
  subtleFill: "rgba(255, 255, 255, 0.10)",
  hairline: "rgba(255, 255, 255, 0.22)",
  shimmerBase: "rgba(255, 255, 255, 0.14)",
  shimmerHighlight: "rgba(255, 255, 255, 0.45)",
  /** Subtle legibility lift for white text on glass. */
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.18)",
  glass: {
    /** Action cards: translucent dark tinted glass (alpha set per scene). */
    actionTint: "24, 28, 34",
    actionSheen: "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 100%)",
    /** Customer query bubbles: lighter frosted glass. */
    queryFill: "rgba(255, 255, 255, 0.18)",
    backdropFilter: "blur(28px) saturate(1.4)",
    border: "1px solid rgba(255, 255, 255, 0.28)",
    innerHighlight: "inset 0 1px 0 rgba(255, 255, 255, 0.35)",
    radius: 22,
    shadow: "0 18px 50px rgba(0, 0, 0, 0.22)",
  },
  type: {
    title: { size: 24, weight: 600 },
    body: { size: 21, weight: 400 },
    query: { size: 21, weight: 500 },
    button: { size: 19, weight: 600 },
    label: { size: 13, weight: 600, letterSpacing: "0.08em", opacity: 0.65 },
  },
} as const;

export const MOTION = {
  /** Stack spring: overdamped (critical damping is ~20.8), settles in ~15 frames, no overshoot. */
  spring: { damping: 22, stiffness: 120, mass: 0.9 },
  /** Exit spring (fixed duration). */
  exitSpring: { damping: 26, stiffness: 140, mass: 1 },
  revealEasing: [0.22, 1, 0.36, 1],
  easeInOut: [0.42, 0, 0.58, 1],
  easeOut: [0, 0, 0.58, 1],
  enter: { frames: 20, translatePx: 24, blurPx: 8, scaleFrom: 0.97 },
  exit: { frames: 14, translatePx: -12, blurPx: 6, queryLeadFrames: 3 },
  float: { amplitudePx: 3, periodFrames: 90 },
  query: { wordDelay: 4, wordStagger: 2, wordFrames: 8, wordBlurPx: 4, dimTo: 0.8, dimFrames: 12 },
  /** Cards stay this far away from the three cuts and the start of the loop. */
  minGapFromCut: 16,
} as const;

/** Timings and sizes of the shared animation primitives (frames at 30 fps). */
export const PRIMITIVES = {
  shimmer: { lineHeight: 14, radius: 8, fill: "rgba(255, 255, 255, 0.14)", highlight: "rgba(255, 255, 255, 0.35)", periodFrames: 24, fadeInFrames: 6 },
  wave: { dotPx: 6, amplitudePx: 4, periodFrames: 18, dotOffsetFrames: 4 },
  textRoll: { distancePx: 14, blurPx: 4, outFrames: 10, inFrames: 12, inDelayFrames: 3 },
  ripple: { sizePx: 56, opacity: 0.35, frames: 16 },
  ringDraw: { strokePx: 1.5, frames: 10 },
  press: { scale: 0.96, frames: 8, brighten: 0.08 },
  check: { circleFrames: 8, drawFrames: 10, strokePx: 2.5, color: "#12161B" },
  spinner: { sizePx: 18, strokePx: 2, track: "rgba(255, 255, 255, 0.25)", arcDeg: 90, turnFrames: 20, extendFrames: 6 },
  /** Frames before a step's end at which its spinner completes into a check. */
  stepCompleteLead: 8,
  stepEnter: { frames: 10, translatePx: 10 },
  stepBar: { heightPx: 3 },
  wipe: { frames: 22 },
  route: { dash: 6, gap: 6, frames: 36, pulseScale: 1.8, pulseOpacity: 0.35, pulseFrames: 14 },
  digitRoll: { frames: 12, staggerFrames: 2 },
  segments: { count: 4, heightPx: 6, radius: 3, track: "rgba(255, 255, 255, 0.2)", fillFrames: 10, staggerFrames: 4 },
  tag: { risePx: 16, tickFrames: 8, tickStaggerFrames: 4, limeFrames: 6 },
  pill: { scaleFrom: 0.9, fadeFrames: 10, checkDelayFrames: 6 },
  detail: { frames: 14, translatePx: 8 },
  shield: { drawFrames: 30, fillFrames: 8, strokePx: 2.5, fillAlpha: 0.18 },
  orb: { sizePx: 20, scalePeak: 1.12, periodFrames: 36, haloScale: 1.8, haloOpacity: 0.35 },
} as const;

/** Query label: "Customer · <industry>", or just "Customer" when switched off. */
export const INDUSTRY_LABEL = { showIndustryLabel: true, base: "Customer", separator: " · " } as const;

export const queryLabel = (industry: string) =>
  INDUSTRY_LABEL.showIndustryLabel ? `${INDUSTRY_LABEL.base}${INDUSTRY_LABEL.separator}${industry}` : INDUSTRY_LABEL.base;

export const SCENES = {
  travel: {
    name: "Scene 1 · Travel",
    industry: "Travel",
    /** Bottom edge of the stack. */
    stackBottom: 520,
    /** Action-card glass alpha: raised over the bright sky for legibility. */
    tint: 0.5,
    /** Dark tint under the query frost (0 = pure frost). */
    queryTint: 0.28,
    /** Query at 16, not 12: the loop transition runs to frame 11 and cards keep 16 frames clear. */
    query: { text: "Is my flight to Singapore still on time?", enter: 16 },
    card: { enter: 34, height: 212 },
    beats: { loading: 50, options: 68, ripple: 76, ring: 86, press: 90, confirmed: 96 },
    /** Last frame of the action card's exit; the query leads it by 3 frames. */
    exitEnd: 134,
    copy: {
      label: "Flight update",
      time: "now",
      delayed: "Your 6:40\u00A0PM flight is delayed by 2\u00A0h\u00A010\u00A0m.",
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
    tint: 0.3,
    queryTint: 0.08,
    query: { text: "I lost my card. Can you block it and send a new one?", enter: 169 },
    /** Card heights per state: it grows upward as each step and the footer arrive. */
    card: { enter: 190, height: 72 },
    steps: [
      { label: "Verifying your identity", start: 204, end: 224, grow: 42 },
      { label: "Blocking the card ending 4821", start: 224, end: 244, grow: 38 },
      { label: "Ordering a replacement card", start: 244, end: 262, grow: 38 },
    ],
    footer: { at: 264, grow: 40 },
    exitEnd: 284,
    copy: {
      title: "Securing your account",
      footer: "Replacement arrives in 3 working days",
    },
  },
  retail: {
    name: "Scene 3 · Retail",
    industry: "Retail",
    stackBottom: 540,
    tint: 0.4,
    queryTint: 0.22,
    query: { text: "Can you deliver my order this evening instead?", enter: 319 },
    card: { enter: 342, height: 246 },
    wipe: { start: 342 },
    badgeAt: 352,
    route: { start: 356 },
    details: { start: 366, stagger: 6 },
    /** Segmented bar: fills the first `filled` of the four stages. */
    stages: { start: 392, filled: 3 },
    tag: { at: 414, height: 50 },
    /** 447, not 448: the card must be gone 16 frames before the cut at 463. */
    exitEnd: 447,
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
    tint: 0.4,
    queryTint: 0.32,
    query: { text: "I had a minor accident. Can you start a claim?", enter: 480 },
    card: { enter: 512, height: 167 },
    /** Outline 528–558, tinted fill 558–566, then the check. */
    shield: { start: 528 },
    steps: [
      { label: "Checking your policy cover", start: 534, end: 552, grow: 42 },
      { label: "Logging the incident details", start: 552, end: 570, grow: 38 },
    ],
    confirmed: { at: 576, grow: 48 },
    detail: { at: 582, grow: 34 },
    /** Ends on 612 as specified, so the exit runs into the loop blur dip (frame 613 stays empty). */
    exitEnd: 612,
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

/** Start frame of an action card's exit; the query bubble exits `queryLeadFrames` earlier. */
export const exitTiming = (exitEnd: number) => {
  const card = exitEnd - MOTION.exit.frames;
  return { card, query: card - MOTION.exit.queryLeadFrames };
};

/** Throws if a scene breaks the cut gap, the nav safe line, or leaves a card on the loop frames. */
export const validateTimeline = () => {
  const cuts = [0, ...Object.values(CUTS)];
  for (const s of Object.values(SCENES)) {
    const first = s.query.enter;
    const last = s.exitEnd;
    for (const c of cuts) {
      const tooCloseBefore = last > c - MOTION.minGapFromCut && last < c;
      const tooCloseAfter = first >= c && first < c + MOTION.minGapFromCut;
      if (tooCloseBefore || tooCloseAfter) {
        throw new Error(`${s.name}: frames ${first}–${last} are within ${MOTION.minGapFromCut} frames of cut ${c}`);
      }
    }
    if (last > COMP.durationInFrames - 2) throw new Error(`${s.name}: the last frame must stay empty`);
  }
  // Tallest state of each stack must stay below the nav bar, float included.
  const q = STACK.queryHeight + STACK.gap;
  const sum = (xs: readonly { grow: number }[]) => xs.reduce((total, x) => total + x.grow, 0);
  const { travel, banking, retail, insurance } = SCENES;
  const peaks: [string, number, number][] = [
    [travel.name, travel.stackBottom, q + travel.card.height],
    [banking.name, banking.stackBottom, q + banking.card.height + sum(banking.steps) + banking.footer.grow],
    [retail.name, retail.stackBottom, q + retail.card.height + STACK.gap + retail.tag.height],
    [insurance.name, insurance.stackBottom, q + insurance.card.height + sum(insurance.steps) + insurance.confirmed.grow + insurance.detail.grow],
  ];
  for (const [name, bottom, height] of peaks) {
    const top = bottom - height - MOTION.float.amplitudePx;
    if (top < STACK.navSafeY) throw new Error(`${name}: stack top ${top} is above the nav safe line ${STACK.navSafeY}`);
  }
};

