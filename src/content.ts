// All copy, names, amounts and timings for the PaymentsUseCase video.
// Every time is in seconds and is converted with Math.round(seconds * fps).
// All names and amounts are placeholders.

export const VIDEO = {
  fps: 60,
  durationSeconds: 26.8,
  width: 1080,
  height: 1920,
};

// Scene boundaries (seconds).
export const SCENES = {
  intro: { start: 0, end: 3.4 },
  reads: { start: 3.4, end: 8.4 },
  approve: { start: 8.4, end: 12.2 },
  pay: { start: 12.2, end: 16.4 },
  more: { start: 16.4, end: 22.45 },
  toLogo: { start: 22.45, end: 23.8 },
  logo: { start: 23.8, end: 26.8 },
};

// Opening explainer. The headline resolves from blur, character by character.
export const INTRO = {
  headline: ["B2B payments,", "made easier."],
  headlineAt: 0.2,
  charStagger: 0.012,
  charDuration: 0.5,
  tintDuration: 0.3,
  subline: "From invoice to payment, in one conversation.",
  sublineAt: 1.55,
};

// T1: the headline shrinks into a pill, the pill grows into a glass phone,
// and the glass resolves into the chat.
export const MORPH_IN = {
  start: 3.0,
  pillAt: 3.4,
  phoneAt: 3.95,
  resolveDuration: 0.2, // 12 frames at 60 fps
  chatFadeInAt: 3.7,
};

// Soft atmosphere: the only times colour appears behind the white frame.
export const ATMOSPHERE = [
  { at: 3.25, peak: 3.75, end: 4.28, cx: 540, cy: 820 },
  { at: 14.85, peak: 15.35, end: 15.85, cx: 540, cy: 760 },
];

// Caption segments. `highlight.at` wipes the underline in; `until` removes it.
export type CaptionSegment = {
  text: string;
  highlight?: { at: number; until?: number };
};

export type Caption = {
  id: string;
  typeAt: number; // typing starts
  cps: number; // characters per second
  fadeAt: number; // fade out starts (lasts CAPTION_FADE)
  lines: CaptionSegment[][];
};

export const CAPTION_FADE = 0.2;

export const CAPTIONS: Caption[] = [
  {
    id: "reads",
    typeAt: 4.6,
    cps: 32,
    fadeAt: 8.2,
    lines: [
      [{ text: "Send the invoice." }],
      [
        { text: "The agent " },
        { text: "reads it", highlight: { at: 5.8 } },
        { text: "." },
      ],
    ],
  },
  {
    id: "approve",
    typeAt: 8.45,
    cps: 32,
    fadeAt: 12.05,
    lines: [
      [{ text: "It checks the details." }],
      [{ text: "You approve.", highlight: { at: 9.6 } }],
    ],
  },
  {
    id: "pay",
    typeAt: 12.3,
    cps: 32,
    fadeAt: 16.25,
    lines: [
      [{ text: "The payment is made." }],
      [{ text: "You get proof.", highlight: { at: 13.45 } }],
    ],
  },
  {
    id: "more",
    typeAt: 16.5,
    cps: 40,
    fadeAt: 22.4,
    lines: [
      [
        { text: "Check status.", highlight: { at: 16.85, until: 17.95 } },
        { text: " " },
        { text: "Pay in bulk.", highlight: { at: 18.0, until: 19.45 } },
      ],
      [{ text: "Catch duplicates.", highlight: { at: 19.5, until: 20.95 } }],
      [{ text: "Schedule payments.", highlight: { at: 21.0 } }],
    ],
  },
];

// Phone header and input bar.
export const CHAT_HEADER = {
  name: "Payments Agent",
  status: "online",
  avatarLetter: "B",
  placeholder: "Message",
};

// Scenes 2 to 4: one continuous conversation.
export const MAIN_CHAT = {
  invoice: {
    attachFlashAt: 4.22,
    at: 4.35,
    fileName: "INV 2041.pdf",
    fileMeta: "218 KB",
    fileType: "PDF",
    time: "10:42",
    deliveredAt: 4.8,
    readAt: 5.05,
  },
  typingAt: 5.2,
  reply: {
    at: 5.7,
    cps: 70,
    text: "I read the invoice. Here is what I found:",
    time: "10:42",
  },
  dataCard: {
    at: 6.25,
    // Everything outside the card blurs slightly while the camera is in.
    focus: { in: 6.0, out: 8.35, blur: 6 },
    rows: [
      { label: "Supplier", value: "Northwind Supplies Ltd", at: 6.45 },
      { label: "Invoice", value: "INV 2041", at: 6.7 },
      { label: "Amount", value: "amount", at: 6.95 },
      { label: "Due date", value: "05 Nov 2026", at: 8.0 },
      { label: "Pay to", value: "Account ending 4821", at: 8.2 },
    ],
  },
  amount: {
    currency: "USD",
    value: 12450,
    countAt: 6.95,
    countDuration: 0.6,
    pillAt: 7.55,
  },
  checks: {
    at: 8.7,
    title: "Checks complete for INV 2041.",
    items: [
      { label: "Supplier verified", at: 9.05 },
      { label: "No duplicate found", at: 9.55 },
      { label: "Amount matches PO 7710", at: 10.05 },
    ],
    question: {
      at: 10.45,
      cps: 80,
      text: "Pay USD 12,450.00 to Northwind Supplies Ltd?",
    },
    buttonsAt: 10.95,
    approveLabel: "Approve",
    rejectLabel: "Reject",
    pointer: { in: 11.05, arrive: 11.6, out: 12.0 },
    tapAt: 11.7,
    time: "10:43",
  },
  approveReply: { at: 11.9, text: "Approve", time: "10:43", readAt: 12.05 },
  // T3: the Approve button shrinks into a lime circle that lands on step 1.
  approveToStep: { at: 12.3, duration: 0.6 },
  payment: {
    at: 12.2,
    title: "Payment status",
    chipBefore: "Sent",
    chipAfter: "Paid",
    steps: ["Initiated", "Sent to provider", "Paid"],
    stepAt: [12.9, 14.0, 14.55],
    nodes: ["Your account", "Payment provider", "Supplier"],
    nodesAt: 13.0,
    nodeStagger: 0.12,
    linesAt: 13.15,
    lineDuration: 0.4,
    orb: {
      leaveAt: 13.55,
      providerAt: 14.0,
      leaveProviderAt: 14.1,
      supplierAt: 14.55,
    },
    chipFlipAt: 14.65,
    confirmAt: 15.0,
    confirmRows: [
      { label: "Amount", value: "USD 12,450.00" },
      { label: "Reference", value: "PAY 90316" },
      { label: "Status", value: "Paid" },
    ],
    time: "10:44",
  },
  proof: {
    at: 15.85,
    fileName: "Proof of payment.pdf",
    fileMeta: "64 KB",
    fileType: "PDF",
    time: "10:44",
  },
};

// Scene 5: four short scenarios. `start` is when the screen blurs through;
// other times are relative to `start`.
export const SCENARIO_TRANSITION = 0.35;

export const SCENARIOS = [
  {
    id: "status",
    start: 16.4,
    chip: "Status",
    outgoing: {
      kind: "text",
      text: "Where is payment INV 2041?",
      time: "10:51",
    },
    reply: {
      text: "Paid today at 10:44. Reference PAY 90316.",
      time: "10:51",
      chip: "Paid",
    },
  },
  {
    id: "bulk",
    start: 17.9,
    chip: "Bulk",
    outgoing: {
      kind: "file",
      text: "5 invoices attached",
      meta: "5 files",
      time: "11:02",
    },
    reply: {
      text: "Pay all 5 invoices, total USD 38,920.00?",
      time: "11:02",
      button: "Approve",
      tapAt: 1.1,
    },
  },
  {
    id: "duplicate",
    start: 19.4,
    chip: "Duplicate",
    outgoing: {
      kind: "file",
      text: "INV 2041.pdf",
      meta: "218 KB",
      time: "11:15",
    },
    reply: {
      text: "This invoice was paid on 14 Oct.",
      time: "11:15",
      chip: "Held for review",
    },
  },
  {
    id: "scheduled",
    start: 20.9,
    chip: "Scheduled",
    outgoing: {
      kind: "text",
      text: "Pay INV 2058 on the due date",
      time: "11:20",
    },
    reply: {
      text: "Scheduled for 05 Nov 2026. I will confirm once it is paid.",
      time: "11:20",
      highlight: "05 Nov 2026",
    },
  },
] as const;

export const SCENARIO_TIMING = {
  outgoingAt: 0.2,
  replyAt: 0.5,
  extraAt: 0.72,
};

// T6 and the closing logo.
export const CLOSING = {
  contentOutAt: 22.45,
  circleAt: 22.6, // frame softens into a squircle, then a circle
  circleDuration: 0.65,
  coverAt: 23.25, // circle grows to cover the frame in white
  coverDuration: 0.55,
  logoAt: 23.8,
  logoDuration: 0.6,
  logoWidthRatio: 0.4,
};

// Virtual camera. Each shot moves from the previous shot over `duration`
// with the camera easing, then drifts its scale by DRIFT until the next shot.
// fx/fy is the canvas point placed at the frame anchor. fy is limited so the
// phone header always stays in frame.
export const CAMERA_DRIFT = 0.04;

export const CAMERA_SHOTS = [
  { at: 0, duration: 0, scale: 1, fx: 540, fy: 795 },
  { at: 6.0, duration: 0.8, scale: 1.22, fx: 500, fy: 830 },
  { at: 8.4, duration: 0.8, scale: 1.16, fx: 515, fy: 905 },
  { at: 10.35, duration: 0.8, scale: 1.2, fx: 515, fy: 1010 },
  { at: 12.2, duration: 0.8, scale: 1.0, fx: 540, fy: 795 },
  { at: 16.4, duration: 0.5, scale: 1.12, fx: 540, fy: 740 },
  { at: 22.45, duration: 0.5, scale: 1.0, fx: 540, fy: 795 },
];

// Chat scroll keyframes for scenes 2 to 4 (pixels the chat moves up).
export const CHAT_SCROLL = [
  { at: 8.4, duration: 0.5, y: 330 },
  { at: 10.35, duration: 0.5, y: 470 },
  { at: 12.2, duration: 0.5, y: 680 },
  { at: 15.0, duration: 0.45, y: 880 },
  { at: 15.85, duration: 0.4, y: 1050 },
];
