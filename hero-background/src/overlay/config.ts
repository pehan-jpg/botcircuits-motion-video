/**
 * Hero overlay (v2) — every copy string, timing, position, colour and spring value lives here.
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
  /** Exit spring (fixed 12-frame duration). */
  exitSpring: { damping: 26, stiffness: 140, mass: 1 },
  revealEasing: [0.22, 1, 0.36, 1],
  progressEasing: [0.45, 0, 0.55, 1],
  enter: { frames: 20, translatePx: 24, blurPx: 8, scaleFrom: 0.97 },
  exit: { frames: 14, translatePx: -12, blurPx: 6, queryLeadFrames: 3 },
  float: { amplitudePx: 3, periodFrames: 96 },
  press: { scale: 0.96, downFrames: 3, upFrames: 5 },
  query: { wordDelay: 4, wordStagger: 2, wordFrames: 8, wordBlurPx: 4, dimTo: 0.8, dimFrames: 12 },
  /** Cards stay this far away from the three cuts and the start of the loop. */
  minGapFromCut: 16,
} as const;

export const SCENES = {
  flight: {
    name: "Scene 1 · Flight update",
    /** Bottom edge of the stack. */
    stackBottom: 520,
    /** Action-card glass alpha: raised over the bright sky for legibility. */
    tint: 0.5,
    /** Dark tint under the query frost (0 = pure frost). */
    queryTint: 0.28,
    query: { text: "Is my flight to Singapore still on time?", enter: 16 },
    card: { enter: 36, height: 212 },
    beats: { loading: 54, options: 70, highlight: 74, ripple: 76, rebookAppear: 80, press: 90, confirmed: 96 },
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
  booking: {
    name: "Scene 2 · Booking progress",
    stackBottom: 500,
    tint: 0.3,
    queryTint: 0.08,
    query: { text: "Please book me on the 9:15 PM flight.", enter: 169 },
    /** Card heights per state: it grows upward as each step and the footer arrive. */
    card: { enter: 190, height: 73 },
    progressEnd: 262,
    steps: [
      { label: "Checking seat availability", start: 204, end: 224, grow: 42 },
      { label: "Rebooking onto the 9:15 PM flight", start: 224, end: 244, grow: 38 },
      { label: "Issuing a new boarding pass", start: 244, end: 262, grow: 38 },
    ],
    /** Frames before a step's end at which the spinner morphs into a check. */
    morphFrames: 8,
    footer: { at: 264, grow: 32 },
    exitEnd: 284,
    copy: {
      title: "Updating your booking",
      footer: "All steps completed automatically",
    },
  },
  boardingPass: {
    name: "Scene 3 · Boarding pass",
    stackBottom: 540,
    tint: 0.4,
    queryTint: 0.22,
    query: { text: "Can you send my boarding pass to WhatsApp?", enter: 319 },
    card: { enter: 342, height: 246 },
    wipe: { start: 342, end: 364 },
    route: { start: 356, end: 392 },
    details: { start: 366, stagger: 12, end: 410 },
    barcode: { start: 380, end: 410, bars: 52 },
    tag: { at: 414, height: 50 },
    exitEnd: 447,
    copy: {
      label: "Boarding pass",
      badge: "Rebooked",
      from: { code: "CMB", city: "Colombo" },
      to: { code: "SIN", city: "Singapore" },
      details: [
        { label: "Gate", value: "B7" },
        { label: "Seat", value: "14A" },
        { label: "Boarding", value: "8:35 PM" },
      ],
      tag: "Sent to your WhatsApp",
    },
  },
  aiConcierge: {
    name: "Scene 4 · AI concierge transfer",
    stackBottom: 980,
    tint: 0.4,
    queryTint: 0.32,
    query: { text: "Can you arrange a private transfer on arrival?", enter: 480 },
    card: { enter: 512, height: 165 },
    route: { start: 528, end: 566 },
    steps: [
      { label: "Checking vehicle availability", start: 534, end: 552, grow: 42 },
      { label: "Reserving a sedan for 11:35 PM", start: 552, end: 570, grow: 38 },
    ],
    morphFrames: 8,
    confirmed: { at: 576, grow: 48 },
    detail: { at: 582, grow: 34 },
    /** Ends on 612 as specified, so the exit runs into the loop blur dip (frame 613 stays empty). */
    exitEnd: 612,
    copy: {
      label: "AI concierge",
      title: "Arranging your private transfer",
      from: "Changi T3",
      to: "Marina Bay",
      confirmed: "Transfer confirmed",
      detail: "Pickup at arrivals, 11:35 PM",
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
  const b = SCENES.booking;
  const c = SCENES.aiConcierge;
  const peaks: [string, number, number][] = [
    [SCENES.flight.name, SCENES.flight.stackBottom, q + SCENES.flight.card.height],
    [b.name, b.stackBottom, q + b.card.height + b.steps.reduce((sum, st) => sum + st.grow, 0) + b.footer.grow],
    [SCENES.boardingPass.name, SCENES.boardingPass.stackBottom, q + SCENES.boardingPass.card.height + STACK.gap + SCENES.boardingPass.tag.height],
    [c.name, c.stackBottom, q + c.card.height + c.steps.reduce((sum, st) => sum + st.grow, 0) + c.confirmed.grow + c.detail.grow],
  ];
  for (const [name, bottom, height] of peaks) {
    const top = bottom - height - MOTION.float.amplitudePx;
    if (top < STACK.navSafeY) throw new Error(`${name}: stack top ${top} is above the nav safe line ${STACK.navSafeY}`);
  }
};

