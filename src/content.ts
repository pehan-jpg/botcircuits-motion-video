// All copy, names, amounts and timings for the PaymentsUseCase video.
// Every time is in seconds and is converted with Math.round(seconds * fps).
// All names and amounts are placeholders.

export const VIDEO = {
  fps: 60,
  durationSeconds: 27.35,
  width: 1080,
  height: 1920,
};

// Scene boundaries (seconds).
export const SCENES = {
  intro: { start: 0, end: 3.4 },
  chats: { start: 3.4, end: 6.25 },
  reads: { start: 6.25, end: 10.1 },
  approve: { start: 10.1, end: 13.35 },
  pay: { start: 13.35, end: 17.4 },
  more: { start: 17.4, end: 23.0 },
  toLogo: { start: 23.0, end: 24.35 },
  logo: { start: 24.35, end: 27.35 },
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

// T1: the headline clears, a frosted glass phone rises, and the glass
// resolves into the Chats list.
export const MORPH_IN = {
  start: 3.0,
  glassAt: 3.15,
  phoneAt: 3.95,
  resolveDuration: 0.2, // 12 frames at 60 fps
  chatFadeInAt: 3.7,
};

// Chats list. All names are fictional; avatars are initials, never photos.
export type ChatRow = {
  name: string;
  preview: string;
  time: string;
  initials?: string;
  color?: string;
  fromMe?: boolean;
  unread?: number;
  agent?: boolean;
};

export const CHATS: ChatRow[] = [
  {
    name: "Accounts Team",
    initials: "AT",
    color: "#DCE8F7",
    time: "10:38",
    fromMe: true,
    preview: "Payment run for this week is ready",
  },
  {
    name: "Northbridge Payments",
    agent: true,
    time: "10:41",
    unread: 1,
    preview: "Send me an invoice and I will take care of it.",
  },
  {
    name: "Warehouse Ops",
    initials: "WO",
    color: "#F7E6D3",
    time: "Yesterday",
    preview: "Stock count finished for aisle 4",
  },
  {
    name: "Finance Group",
    initials: "FG",
    color: "#E7E0F5",
    time: "Yesterday",
    fromMe: true,
    preview: "Month end close starts on Friday",
  },
  {
    name: "Logistics Desk",
    initials: "LD",
    color: "#D9F0EC",
    time: "Tuesday",
    preview: "Truck 12 arrives at 3 pm",
  },
  {
    name: "Procurement",
    initials: "PR",
    color: "#E9EDF1",
    time: "Sunday",
    preview: "New supplier form attached",
  },
];

export const CHATS_TAB_BADGE = 1;

export const LIST = {
  rowsAt: 4.1,
  rowStagger: 0.07,
  rowDuration: 0.35,
  agentRow: 1, // zero based: Northbridge Payments is row 2
  pointer: { in: 4.85, arrive: 5.4, out: 5.75 },
  tapAt: 5.45,
  pushAt: 5.7,
  pushDuration: 0.55,
};

// Soft atmosphere: the only times colour appears behind the white frame.
export const ATMOSPHERE = [
  { at: 3.25, peak: 3.75, end: 4.28, cx: 540, cy: 820 },
  { at: 15.65, peak: 16.15, end: 16.65, cx: 540, cy: 760 },
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
    typeAt: 6.85,
    cps: 32,
    fadeAt: 9.95,
    lines: [
      [{ text: "Send the invoice." }],
      [
        { text: "The agent " },
        { text: "reads it", highlight: { at: 8.05 } },
        { text: "." },
      ],
    ],
  },
  {
    id: "approve",
    typeAt: 10.2,
    cps: 32,
    fadeAt: 13.3,
    lines: [
      [{ text: "It checks the details." }],
      [{ text: "You approve.", highlight: { at: 11.35 } }],
    ],
  },
  {
    id: "pay",
    typeAt: 13.55,
    cps: 32,
    fadeAt: 17.25,
    lines: [
      [{ text: "The payment is made." }],
      [{ text: "You get proof.", highlight: { at: 14.7 } }],
    ],
  },
  {
    id: "more",
    typeAt: 17.5,
    cps: 40,
    fadeAt: 22.95,
    lines: [
      [
        { text: "Check status.", highlight: { at: 17.85, until: 18.75 } },
        { text: " " },
        { text: "Pay in bulk.", highlight: { at: 18.8, until: 20.15 } },
      ],
      [{ text: "Catch duplicates.", highlight: { at: 20.2, until: 21.55 } }],
      [{ text: "Schedule payments.", highlight: { at: 21.6 } }],
    ],
  },
];

// Conversation header.
export const CHAT_HEADER = {
  name: "Northbridge Payments",
  status: "tap here for contact info",
};

// Scenes 3 and 4: one continuous conversation.
export const MAIN_CHAT = {
  // Matches the Chats list preview; already there when the chat opens.
  greeting: {
    at: 4.0,
    text: "Send me an invoice and I will take care of it.",
    time: "10:41",
  },
  invoice: {
    attachFlashAt: 6.45,
    at: 6.6,
    fileName: "INV 2041.pdf",
    fileMeta: "218 KB",
    fileType: "PDF",
    time: "10:42",
    deliveredAt: 6.95,
    readAt: 7.15,
  },
  typingAt: 7.25,
  reply: {
    at: 7.6,
    cps: 70,
    text: "I read the invoice. Here is what I found:",
    time: "10:42",
  },
  dataCard: {
    at: 8.0,
    // Everything outside the card blurs slightly while the camera is in.
    focus: { in: 7.85, out: 10.05, blur: 6 },
    rows: [
      { label: "Supplier", value: "Northwind Supplies Ltd", at: 8.15 },
      { label: "Invoice", value: "INV 2041", at: 8.35 },
      { label: "Amount", value: "amount", at: 8.55 },
      { label: "Due date", value: "05 Nov 2026", at: 9.6 },
      { label: "Pay to", value: "Account ending 4821", at: 9.75 },
    ],
  },
  amount: {
    currency: "USD",
    value: 12450,
    countAt: 8.55,
    countDuration: 0.55,
    pillAt: 9.1,
  },
  checks: {
    at: 10.3,
    title: "Checks complete for INV 2041.",
    items: [
      { label: "Supplier verified", at: 10.6 },
      { label: "No duplicate found", at: 11.0 },
      { label: "Amount matches PO 7710", at: 11.4 },
    ],
    question: {
      at: 11.75,
      cps: 80,
      text: "Pay USD 12,450.00 to Northwind Supplies Ltd?",
    },
    buttonsAt: 12.25,
    approveLabel: "Approve",
    rejectLabel: "Reject",
    pointer: { in: 12.3, arrive: 12.8, out: 13.2 },
    tapAt: 12.9,
    time: "10:43",
  },
  approveReply: { at: 13.05, text: "Approve", time: "10:43", readAt: 13.2 },
  // T3: the Approve button shrinks into a lime circle that lands on step 1.
  approveToStep: { at: 13.4, duration: 0.55 },
  payment: {
    at: 13.35,
    title: "Payment status",
    chipBefore: "Sent",
    chipAfter: "Paid",
    steps: ["Initiated", "Sent to provider", "Paid"],
    stepAt: [13.95, 14.85, 15.35],
    nodes: ["Your account", "Payment provider", "Supplier"],
    nodesAt: 14.0,
    nodeStagger: 0.12,
    linesAt: 14.1,
    lineDuration: 0.35,
    orb: {
      leaveAt: 14.45,
      providerAt: 14.85,
      leaveProviderAt: 14.95,
      supplierAt: 15.35,
    },
    chipFlipAt: 15.45,
    confirmAt: 15.85,
    confirmRows: [
      { label: "Amount", value: "USD 12,450.00" },
      { label: "Reference", value: "PAY 90316" },
      { label: "Status", value: "Paid" },
    ],
    time: "10:44",
  },
  proof: {
    at: 16.75,
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
    start: 17.4,
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
    start: 18.8,
    chip: "Bulk",
    outgoing: {
      kind: "file",
      text: "5 invoices attached",
      meta: "PDF · 5 files",
      time: "11:02",
    },
    reply: {
      text: "Pay all 5 invoices, total USD 38,920.00?",
      time: "11:02",
      button: "Approve",
      tapAt: 1.05,
    },
  },
  {
    id: "duplicate",
    start: 20.2,
    chip: "Duplicate",
    outgoing: {
      kind: "file",
      text: "INV 2041.pdf",
      meta: "PDF · 218 KB",
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
    start: 21.6,
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

// T6: the phone fades out, then the closing logo.
export const CLOSING = {
  phoneOutAt: 23.0, // the phone fades out and settles back slightly
  phoneOutDuration: 0.6,
  logoAt: 24.35,
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
  { at: 7.85, duration: 0.8, scale: 1.22, fx: 500, fy: 830 },
  { at: 10.1, duration: 0.8, scale: 1.16, fx: 515, fy: 905 },
  { at: 12.2, duration: 0.7, scale: 1.2, fx: 515, fy: 1010 },
  { at: 13.35, duration: 0.8, scale: 1.0, fx: 540, fy: 795 },
  { at: 17.4, duration: 0.5, scale: 1.12, fx: 540, fy: 740 },
  { at: 23.0, duration: 0.5, scale: 1.0, fx: 540, fy: 795 },
];

// Chat scroll keyframes for scenes 2 to 4 (pixels the chat moves up).
export const CHAT_SCROLL = [
  { at: 7.85, duration: 0.6, y: 150 },
  { at: 10.1, duration: 0.5, y: 480 },
  { at: 12.2, duration: 0.5, y: 640 },
  { at: 13.35, duration: 0.5, y: 900 },
  { at: 15.85, duration: 0.45, y: 1100 },
  { at: 16.75, duration: 0.4, y: 1270 },
];
