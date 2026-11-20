/**
 * Every name, amount and ID shown on screen is a placeholder and lives here.
 * Swap values in this file only.
 */
export const PLACEHOLDERS = {
  product: "Space",
  brand: "BotCircuits",
  productFull: "Space by BotCircuits",
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

  // Scene 1 props
  scene1Places: ["Inbox", "Sheet", "Chat", "PDF"],
  scene1Versions: ["v1", "v2", "v2 final", "v3"],
  scene1Stamps: ["Sent", "Paid"],
} as const;
