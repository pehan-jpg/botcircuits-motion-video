import type { AgentFlow } from "../components/AgentCard";

export const travelFlow: AgentFlow = {
  framesPerState: 300, // 5s at 60fps: ~0.6s in, ~4s hold, 0.5s out
  states: [
    {
      agentId: "AGENT-01",
      role: "Intake Agent",
      status: "RECEIVED",
      title: "Booking Request Received",
      subtitle: "Via WhatsApp",
      content: { type: "message", text: "Desert safari for 4 · Sat 12 Dec · hotel pickup" },
    },
    {
      agentId: "AGENT-02",
      role: "Availability Agent",
      status: "CONFIRMED",
      title: "Availability Confirmed",
      subtitle: "Live inventory checked",
      content: {
        type: "checklist",
        items: [
          "Slot open for 4 guests",
          "Hotel pickup arranged",
          "Dietary note added",
          "Price quoted in guest currency",
        ],
      },
    },
    {
      agentId: "AGENT-04",
      role: "Booking Agent",
      status: "COMPLETED",
      title: "Booking Confirmed",
      subtitle: "Voucher sent to guest",
      content: { type: "files", files: ["Voucher_BK2841.pdf", "Itinerary.pdf"] },
    },
    {
      agentId: "AGENT-05",
      role: "Escalation Agent",
      status: "ESCALATED",
      title: "Escalated to Guest Relations",
      subtitle: "Full booking context transferred",
      content: {
        type: "callout",
        heading: "Human Review Required",
        body: "Guest asked to add a private transfer outside standard packages. Routed to the Guest Relations team.",
      },
      escalation: true,
    },
  ],
};
