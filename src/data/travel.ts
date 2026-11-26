import type { AgentFlow } from "../components/AgentCard";

/** Travel & Hospitality: family trip package, Colombo to Dubai. Generic data only. */
export const travelFlow: AgentFlow = {
  framesPerState: 300, // 5s at 60fps: ~0.6s in, ~4s hold, 0.5s out
  cardTop: 200,
  states: [
    {
      agentId: "AGENT-01",
      role: "Intake Agent",
      status: "RECEIVED",
      title: "Trip Request Received",
      subtitle: "Via WhatsApp",
      content: [
        { type: "message", text: "Family trip to Dubai, 12 to 16 Dec, 4 of us. Hotel, flights and a desert safari." },
        {
          type: "chips",
          chips: [
            { icon: "pin", label: "Dubai" },
            { icon: "calendar", label: "12 to 16 Dec" },
            { icon: "people", label: "4 guests" },
          ],
        },
      ],
    },
    {
      agentId: "AGENT-02",
      role: "Availability Agent",
      status: "CONFIRMED",
      title: "Availability Confirmed",
      subtitle: "Live inventory checked",
      content: [
        {
          type: "rows",
          rows: [
            { icon: "plane", caption: "Flight", label: "CMB to DXB · 4 seats held" },
            { icon: "bed", caption: "Hotel", label: "Family room · 4 nights" },
            { icon: "pin", caption: "Experience", label: "Desert safari · Sat 13 Dec" },
          ],
        },
      ],
    },
    {
      agentId: "AGENT-04",
      role: "Booking Agent",
      status: "COMPLETED",
      title: "Booking Confirmed",
      subtitle: "Itinerary sent to guest",
      content: [
        {
          type: "boardingPass",
          from: { code: "CMB", city: "Colombo" },
          to: { code: "DXB", city: "Dubai" },
          footLeft: { icon: "calendar", label: "12 Dec" },
          footRight: { icon: "people", label: "4 seats" },
        },
        { type: "ratingStrip", icon: "bed", text: "Check in 12 Dec · Check out 16 Dec", stars: 5 },
        { type: "files", files: ["Voucher_BK2841.pdf", "Itinerary.pdf"] },
      ],
    },
    {
      agentId: "AGENT-05",
      role: "Escalation Agent",
      status: "ESCALATED",
      title: "Escalated to Guest Relations",
      subtitle: "Full booking context transferred",
      content: [
        {
          type: "summary",
          caption: "Trip context attached",
          items: [
            { icon: "plane", label: "CMB to DXB" },
            { icon: "bed", label: "Family room · 4 nights" },
            { icon: "pin", label: "Desert safari" },
          ],
        },
        {
          type: "callout",
          heading: "Human Review Required",
          body: "Guest asked to add a private airport transfer outside standard packages. Routed to the Guest Relations team.",
        },
      ],
      escalation: true,
    },
  ],
};
