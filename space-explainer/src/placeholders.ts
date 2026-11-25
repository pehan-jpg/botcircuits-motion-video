/**
 * Every name, amount and ID shown on screen is a placeholder and lives here.
 * Swap values in this file only. The product name is always shown as the
 * SpaceByLockup ("Space by" plus the logo), never typed as text.
 */
export const PLACEHOLDERS = {
  product: "Space",
  productBy: "Space by",
  tagline: "An agent workspace where agents prepare and people decide.",

  claimId: "CL-7305",
  insured: "James Whitfield",
  policyId: "HL-20418",
  lossType: "Kitchen water damage",
  repairEstimate: "$1,840",
  excess: "$250",
  claimsOfficer: "Emily Carter",

  agents: {
    frontDesk: { name: "Iris", role: "Front Desk" },
    intake: { name: "Nora", role: "Intake" },
    policy: { name: "Theo", role: "Policy" },
    evidence: { name: "Owen", role: "Evidence" },
  },

  policySource: "Home Policy Wording 2026",
  policySection: "Section 4.2 Accidental water damage",
  policyPage: "page 12",
  policyCite: "[S1]",
  excessCite: "[S2]",
  evidence: { photos: 3, invoices: 1 },
  flag: "The invoice date does not match the reported date of loss. A person should check it.",

  // Scene 1
  scene1Places: ["Inbox", "Sheet", "Chat", "PDF"],
  scene1Versions: ["v1", "v2", "v2 final", "v3"],
  scene1Stamps: ["Sent", "Paid"],

  // Scene 3, chat screen (rebuilt from reference/ui/01-chat.png)
  workspace: "Northfield",
  user: { name: "Emily Carter", role: "Claims Officer", initial: "E" },
  recents: ["Claim CL-7211 summary", "Weekly claims by status"],
  chatPrompt:
    "Prepare claim CL-7305 for review. Check the policy and the evidence.",
  chatPromptLines: [
    "Prepare claim CL-7305 for review.",
    "Check the policy and the evidence.",
  ],
  statusPills: ["Reading claim", "Checking policy", "Matching evidence"],
  /** Fixed lines so the answer never reflows. [S1] and [S2] render as source chips. */
  answerLines: [
    "Claim CL-7305 is covered under Section 4.2 [S1].",
    "A $250 excess applies [S2].",
    "One item needs a person: the invoice date",
    "does not match the date of loss.",
  ],
  sourceCardTitle: "Home Policy Wording 2026, p. 12",
  /** Scene 3, turn 2: an action request. */
  chat2: {
    prompt: "Send me the weekly claims by status on Mondays at 8, and tell me in Slack when a review is waiting for me.",
    promptLines: ["Send me the weekly claims by status on Mondays at 8, and tell me", "in Slack when a review is waiting for me."],
    status: "Setting this up",
    cardTitle: "2 changes made",
    rows: [
      { kind: "Scheduled task", text: "Weekly claims by status, Mondays at 8:00 AM" },
      { kind: "Notification rule", text: "Slack, when a review is waiting for Emily Carter" },
    ],
    chip: "Create agents for this claim",
  },
  /** Placeholder policy text. The first sentence (Section 4.2) is highlighted. */
  policyText: [
    "4.2 We cover sudden and accidental escape of water from a fixed pipe or appliance in your home.",
    "We do not cover damage caused by gradual leaks, wear and tear, or poor maintenance.",
  ],

  // Scene 4, Agents page and Control Room
  agentAccessLine: "Works with Emily's access",
  agentsPage: {
    iris: {
      name: "Iris",
      handle: "@iris",
      role: "Personal assistant",
      state: "Idle",
      badge: "Default",
    },
    team: [
      { name: "Nora", handle: "@nora", role: "Intake" },
      { name: "Theo", handle: "@theo", role: "Policy" },
      { name: "Owen", handle: "@owen", role: "Evidence" },
    ],
  },
  playbook: {
    name: "Home claim review",
    steps: [
      "Email arrives in the claims inbox",
      "Read claim",
      "Check policy",
      "Match evidence",
      "Waiting for Emily",
      "approved",
      "Slack: Claim CL-7305 approved by Emily",
    ],
    sendText: "settlement via Gmail",
    waiting: "Waiting for Emily",
  },
  review: {
    item: "Claim CL-7305, James Whitfield, Home water damage",
    itemSub: "Home claim review, step 5, Review",
    requested: "Requested 6:47 PM",
    note: "Approved. Invoice date confirmed with the insured by phone.",
    settlement: "$1,590",
    emailSent: "Settlement notice sent to James Whitfield, $1,590",
    slack: "Claim CL-7305 approved by Emily",
  },
  evening: {
    clockStart: "6:42 PM",
    clockEnd: "9:05 AM",
    email: "New claim CL-7305, James Whitfield, kitchen water damage",
    emailFrom: "BotCircuits Concierge",
    slack: "Claim CL-7305 needs your review",
    slackFrom: "Space",
  },
  /** Scene 6: the Playbook graph. */
  graph: {
    nodes: [
      { badge: "ASK", text: "Get claim details" },
      { badge: "AGENT", text: "Read the claim email and prepare the intake summary", agent: "nora" },
      { badge: "AGENT", text: "Check the claim against the policy", agent: "theo", chip: "Claims knowledge" },
      { badge: "AGENT", text: "Match the photos and the invoice to the claim", agent: "owen" },
      { badge: "PAGE", text: "Write the review pack" },
      { badge: "REVIEW", text: "Wait for Emily to approve or decline", human: true },
      { badge: "IF", text: "review is approved" },
      { badge: "RUN", text: "Send the settlement notice with Gmail", logo: "logos/gmail.svg" },
      { badge: "RUN", text: "Post to Slack", logo: "logos/slack.svg" },
      { badge: "SEND", text: "Return to Emily with a note" },
      { badge: "END", text: "End" },
    ] as { badge: string; text: string; agent?: "nora" | "theo" | "owen"; chip?: string; human?: boolean; logo?: string }[],
    trigger: "Email arrives in the claims inbox",
    reviewName: "Emily reviews the claim",
    reviewMessage: ["Please review claim CL-7305.", "One item needs a person: the invoice", "date does not match the date of loss."],
    variable: "review",
    note: "This flow has loops or jumps, so it can only be shown as a graph.",
    checkToast: "No issues found",
  },
  records: {
    title: "Claim CL-7305, Home claim review",
    sub: "Run of Home claim review, started by an email, finished 9:12 AM",
    rows: [
      { time: "6:42 PM", text: "Handed over by BotCircuits Concierge" },
      { time: "6:43 PM", text: "Intake summary", agent: "Nora" },
      { time: "6:44 PM", text: "Policy check", agent: "Theo" },
      { time: "6:46 PM", text: "Evidence match", agent: "Owen" },
      { time: "6:47 PM", text: "Review requested" },
      { time: "9:12 AM", text: "Approved by Emily Carter", human: true, note: "Approved. Invoice date confirmed with the insured by phone." },
      { time: "9:12 AM", text: "Settlement notice sent" },
      { time: "9:12 AM", text: "Slack notified" },
    ] as { time: string; text: string; agent?: string; human?: boolean; note?: string }[],
  },
  pages: {
    prompt: "Open claims by status, with who approved each",
    title: "Open claims by status",
    rows: [
      { status: "Approved", count: 18, approvedBy: "Emily Carter" },
      { status: "In review", count: 7, approvedBy: "" },
      { status: "With agents", count: 12, approvedBy: "" },
      { status: "Declined", count: 3, approvedBy: "Emily Carter" },
    ],
    claimRow: { id: "Claim CL-7305", insured: "James Whitfield", approvedBy: "Emily Carter" },
  },
  concierge: {
    title: "BotCircuits Concierge",
    customer: "My kitchen has water damage. Can you help?",
    reply: ["Yes, James. I have your details and I am", "passing this to the claims team."],
    handed: "Handed to Space",
  },
  endCard: ["Agents prepare.", "People decide.", "Every step on record."],
  brain: {
    kbName: "Claims knowledge",
    files: ["Home Policy Wording 2026.pdf", "Excess Schedule 2026.pdf"],
    passages: [132, 214],
    driveChip: "Claims shared drive, Synced",
    citeLine: "Answers cite these files",
    /** Scene 5: sources added through Connect data (counts are placeholders). */
    sources: [
      { kind: "drive", name: "Claims shared drive", type: "Google Drive folder", done: "Synced", passages: 96 },
      { kind: "sheets", name: "Excess and limits", type: "Google Sheets", done: "Synced", passages: 38 },
      { kind: "web", name: "northfield.example/claims-faq", type: "Website", done: "Crawled, 12 pages", passages: 54 },
      { kind: "slack", name: "#claims-escalations", type: "Slack channel", done: "Synced", passages: 10 },
      { kind: "file", name: "Home Policy Wording 2026.pdf", type: "File", done: "Ready", passages: 132 },
      { kind: "file", name: "Excess Schedule 2026.pdf", type: "File", done: "Ready", passages: 82 },
    ] as { kind: "drive" | "sheets" | "web" | "slack" | "file"; name: string; type: string; done: string; passages: number }[],
    totalSources: 6,
    totalPassages: 412,
    url: "northfield.example/claims-faq",
    graph: ["Policy", "Claim", "Insured", "Excess", "FAQ", "Escalations"],
    useInPlaybook: "Use in playbook",
  },
  controlRoom: {
    irisStatusIdle: "Listening for requests",
    irisStatusBusy: "Passed to Nora",
    statuses: ["Reading claim", "Checking policy", "Matching evidence"],
    irisMessage: "Claim CL-7305 is with the team.",
    resources: 4,
    bubbles: {
      nora: ["Reading the claim email", "Pulling claimant and loss details", "Writing intake summary"],
      theo: ["Opening Home Policy Wording 2026", "Section 4.2 covers escape of water", "Checking the $250 excess"],
      owen: ["Reading 3 photos", "Reading plumber invoice", "Invoice date does not match date of loss"],
    },
    pills: ["Meet your team", "A new claim arrives", "The team works in tandem", "Prepared for Emily's review"],
    outputs: [
      { agent: "nora", text: "Claim CL-7305 | James Whitfield | Kitchen water damage | Estimate $1,840" },
      { agent: "theo", text: "Covered under Section 4.2 | Excess $250" },
      { agent: "owen", text: "3 photos and 1 plumber invoice found", flag: "1 flag: invoice date does not match the date of loss" },
    ] as { agent: string; text: string; flag?: string }[],
    pedestals: ["Gmail", "Google Drive", "Google Sheets", "Slack"],
  },
} as const;
