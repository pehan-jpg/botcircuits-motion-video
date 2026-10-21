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
  src: "hero_base.mp4",
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

export const THEME = {
  lime: BRAND_LIME,
  text: "#12161B",
  textSecondary: "#5B6470",
  onLime: "#12161B",
  subtleFill: "rgba(18, 22, 27, 0.05)",
  hairline: "rgba(18, 22, 27, 0.10)",
  glass: {
    fill: "rgba(255, 255, 255, 0.78)",
    backdropFilter: "blur(24px) saturate(1.2)",
    border: "1px solid rgba(255, 255, 255, 0.6)",
    radius: 24,
    shadow: "0 20px 60px rgba(20, 30, 40, 0.18)",
  },
  type: {
    title: { size: 22, weight: 600 },
    body: { size: 20, weight: 400 },
    button: { size: 18, weight: 600 },
    label: { size: 13, weight: 500, letterSpacing: "0.08em" },
  },
} as const;

export const MOTION = {
  /** Overdamped (critical damping is ~23.7 for this stiffness), so no overshoot. */
  spring: { damping: 26, stiffness: 140, mass: 1 },
  revealEasing: [0.22, 1, 0.36, 1],
  progressEasing: [0.45, 0, 0.55, 1],
  enter: { frames: 20, translatePx: 24, blurPx: 8, scaleFrom: 0.97 },
  exit: { frames: 14, translatePx: -12, blurPx: 6 },
  float: { amplitudePx: 3, periodFrames: 96 },
  press: { scale: 0.96, downFrames: 3, upFrames: 5 },
  /** Cards stay this far away from every cut. */
  minGapFromCut: 16,
} as const;

export const SCENES = {
  flight: {
    name: "Scene 1 · Flight update",
    x: 1230,
    y: 160,
    width: 500,
    enterFrom: "right",
    enter: 16,
    exit: 120,
    beats: { loading: 42, options: 66, highlight: 72, ripple: 74, rebookAppear: 80, press: 92, confirmed: 99 },
    copy: {
      label: "Flight update",
      time: "now",
      delayed: "Your 6:40 PM flight is delayed by 2 h 10 m.",
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
    x: 96,
    y: 72,
    width: 520,
    enterFrom: "bottom",
    enter: 169,
    exit: 270,
    progressEnd: 258,
    steps: [
      { label: "Checking seat availability", start: 178, end: 202 },
      { label: "Rebooking onto the 9:15 PM flight", start: 202, end: 228 },
      { label: "Issuing a new boarding pass", start: 228, end: 254 },
    ],
    /** Frames before a step's end at which the spinner morphs into a check. */
    morphFrames: 8,
    footerAt: 258,
    copy: {
      title: "Updating your booking",
      footer: "All steps completed automatically",
    },
  },
  boardingPass: {
    name: "Scene 3 · Boarding pass",
    x: 1090,
    y: 150,
    width: 520,
    enterFrom: "bottom",
    enter: 319,
    wipe: { start: 319, end: 343 },
    route: { start: 334, end: 376 },
    details: { start: 346, stagger: 14, end: 396 },
    barcode: { start: 360, end: 396, bars: 56 },
    tagAt: 402,
    exit: 433,
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
  concierge: {
    name: "Scene 4 · Concierge handoff",
    x: 120,
    y: 200,
    width: 520,
    enterFrom: "bottom",
    enter: 480,
    ripple: 490,
    expand: { start: 492, end: 510 },
    chip: { width: 340, height: 60 },
    avatars: { start: 514, agentAt: 514, humanAt: 522, lineStart: 520, lineEnd: 540, pulseEvery: 12, pulseUntil: 548 },
    connecting: { start: 520, end: 556 },
    joinedAt: 556,
    exit: 584,
    copy: {
      chip: "Arrange a private transfer",
      label: "Concierge handoff",
      title: "Arrange a private transfer",
      initials: "CT",
      connecting: "Connecting you to a concierge",
      joined: "Concierge joined. Your transfer is being arranged.",
    },
  },
} as const;
