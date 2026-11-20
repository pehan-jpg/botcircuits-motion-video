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
  workspace: "Northfield Insurance",
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
  /** Placeholder policy text. The first sentence (Section 4.2) is highlighted. */
  policyText: [
    "4.2 We cover sudden and accidental escape of water from a fixed pipe or appliance in your home.",
    "We do not cover damage caused by gradual leaks, wear and tear, or poor maintenance.",
  ],
} as const;
