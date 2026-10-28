// All copy, names, amounts and timings for the PaymentsUseCase video.
// Every time is in seconds and is converted with Math.round(seconds * fps).
// All names and amounts are placeholders.

export const VIDEO = {
  fps: 60,
  durationSeconds: 26,
  width: 1080,
  height: 1920,
};

// Scene boundaries (seconds).
export const SCENES = {
  invoice: { start: 0, end: 3.0 },
  reads: { start: 3.0, end: 7.6 },
  approve: { start: 7.6, end: 11.6 },
  pay: { start: 11.6, end: 16.3 },
  more: { start: 16.3, end: 22.6 },
  close: { start: 22.6, end: 26.0 },
};

// Caption segments. `highlight.at` wipes the lime marker in; `until` removes it.
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
    id: "theme",
    typeAt: 0.33,
    cps: 20,
    fadeAt: 2.95,
    lines: [[{ text: "B2B payments, made easier." }]],
  },
  {
    id: "reads",
    typeAt: 3.2,
    cps: 32,
    fadeAt: 7.4,
    lines: [
      [{ text: "Send the invoice." }],
      [
        { text: "The agent " },
        { text: "reads it", highlight: { at: 4.42 } },
        { text: "." },
      ],
    ],
  },
  {
    id: "approve",
    typeAt: 7.7,
    cps: 32,
    fadeAt: 11.45,
    lines: [
      [{ text: "It checks the details." }],
      [{ text: "You approve.", highlight: { at: 8.85 } }],
    ],
  },
  {
    id: "pay",
    typeAt: 11.75,
    cps: 32,
    fadeAt: 16.1,
    lines: [
      [{ text: "The payment is made." }],
      [{ text: "You get proof.", highlight: { at: 12.9 } }],
    ],
  },
  {
    id: "more",
    typeAt: 16.45,
    cps: 40,
    fadeAt: 22.55,
    lines: [
      [
        { text: "Check status.", highlight: { at: 16.9, until: 18.25 } },
        { text: " " },
        { text: "Pay in bulk.", highlight: { at: 18.3, until: 19.8 } },
      ],
      [{ text: "Catch duplicates.", highlight: { at: 19.85, until: 21.4 } }],
      [{ text: "Schedule payments.", highlight: { at: 21.45 } }],
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

// Scenes 1 to 4: one continuous conversation.
export const MAIN_CHAT = {
  invoice: {
    attachFlashAt: 1.45,
    at: 1.6,
    fileName: "INV 2041.pdf",
    fileMeta: "218 KB",
    fileType: "PDF",
    time: "10:42",
    deliveredAt: 2.05,
    readAt: 2.35,
  },
  typingAt: 2.5,
  reply: {
    at: 4.5,
    cps: 70,
    text: "I read the invoice. Here is what I found:",
    time: "10:42",
  },
  dataCard: {
    at: 4.95,
    rows: [
      { label: "Supplier", value: "Northwind Supplies Ltd", at: 5.15 },
      { label: "Invoice", value: "INV 2041", at: 5.45 },
      { label: "Amount", value: "amount", at: 5.75 },
      { label: "Due date", value: "05 Nov 2026", at: 6.95 },
      { label: "Pay to", value: "Account ending 4821", at: 7.2 },
    ],
  },
  amount: {
    currency: "USD",
    value: 12450,
    countAt: 5.75,
    countDuration: 0.6,
    pillAt: 6.35,
  },
  checks: {
    at: 7.95,
    title: "Checks complete for INV 2041.",
    items: [
      { label: "Supplier verified", at: 8.35 },
      { label: "No duplicate found", at: 8.95 },
      { label: "Amount matches PO 7710", at: 9.55 },
    ],
    question: {
      at: 9.95,
      cps: 80,
      text: "Pay USD 12,450.00 to Northwind Supplies Ltd?",
    },
    buttonsAt: 10.5,
    approveLabel: "Approve",
    rejectLabel: "Reject",
    tapAt: 11.05,
    time: "10:43",
  },
  approveReply: { at: 11.3, text: "Approve", time: "10:43", readAt: 11.5 },
  payment: {
    at: 11.85,
    title: "Payment status",
    chipBefore: "Sent",
    chipAfter: "Paid",
    steps: ["Initiated", "Sent to provider", "Paid"],
    stepAt: [12.15, 13.6, 14.25],
    nodes: ["Your account", "Payment provider", "Supplier"],
    nodesAt: 12.4,
    nodeStagger: 0.12,
    linesAt: 12.6,
    lineDuration: 0.4,
    orb: {
      leaveAt: 13.05,
      providerAt: 13.6,
      leaveProviderAt: 13.72,
      supplierAt: 14.25,
    },
    chipFlipAt: 14.4,
    confirmAt: 15.15,
    confirmRows: [
      { label: "Amount", value: "USD 12,450.00" },
      { label: "Reference", value: "PAY 90316" },
      { label: "Status", value: "Paid" },
    ],
    time: "10:44",
  },
  proof: {
    at: 15.5,
    fileName: "Proof of payment.pdf",
    fileMeta: "64 KB",
    fileType: "PDF",
    time: "10:44",
  },
};

// Scene 5: four short scenarios. `start` is the scene time when the screen
// slides in; other times are relative to `start`.
export const SCENARIO_SLIDE = 0.4;

export const SCENARIOS = [
  {
    id: "status",
    start: 16.3,
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
    start: 17.875,
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
      tapAt: 1.2,
    },
  },
  {
    id: "duplicate",
    start: 19.45,
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
    start: 21.025,
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
  outgoingAt: 0.15,
  replyAt: 0.5,
  extraAt: 0.72,
};

// Scene 6: closing.
export const CLOSING = {
  phoneOutAt: 22.6,
  phoneOutDuration: 0.6,
  wordmark: "BotCircuits",
  wordmarkAt: 22.95,
  tagline: [
    [{ text: "Pay supplier invoices" }],
    [{ text: "on " }, { text: "WhatsApp.", highlight: { at: 24.3 } }],
  ] as CaptionSegment[][],
  taglineAt: 23.35,
  taglineCps: 36,
  subline: "B2B payments, made easier.",
  sublineAt: 24.5,
};

// Virtual camera. Each shot moves from the previous shot over `duration`
// with the camera easing, then drifts its scale by DRIFT until the next shot.
// fx/fy is the canvas point placed at the frame anchor.
export const CAMERA_DRIFT = 0.04;

export const CAMERA_SHOTS = [
  { at: 0, duration: 0, scale: 1, fx: 540, fy: 795 },
  { at: 4.7, duration: 0.8, scale: 1.3, fx: 500, fy: 830 },
  { at: 7.6, duration: 0.8, scale: 1.16, fx: 515, fy: 905 },
  { at: 9.9, duration: 0.8, scale: 1.2, fx: 515, fy: 1010 },
  { at: 11.6, duration: 0.8, scale: 1.0, fx: 540, fy: 795 },
  { at: 16.3, duration: 0.5, scale: 1.12, fx: 540, fy: 740 },
];

// Chat scroll keyframes for scenes 1 to 4 (pixels the chat moves up).
export const CHAT_SCROLL = [
  { at: 7.0, duration: 0.5, y: 120 },
  { at: 7.6, duration: 0.5, y: 330 },
  { at: 9.9, duration: 0.5, y: 470 },
  { at: 11.6, duration: 0.5, y: 680 },
  { at: 15.15, duration: 0.45, y: 880 },
  { at: 15.5, duration: 0.4, y: 1050 },
];
