import type { AgentState } from "../components/AgentCard";

/** Healthcare: a patient reschedules an appointment. Fictional data only. */
export const healthcareStates: AgentState[] = [
  {
    agentId: "AGENT-01",
    role: "Intake Agent",
    status: "RECEIVED",
    title: "Appointment Request",
    content: [
      {
        type: "reschedule",
        initials: "PR",
        name: "Priya R. · Reschedule",
        from: "Thu 3",
        to: "Fri 4",
        detail: "Dr. Perera · 10:30 AM",
      },
    ],
  },
  {
    agentId: "AGENT-02",
    role: "Scheduling Agent",
    status: "MATCHED",
    title: "Slot Confirmed",
    content: [{ type: "checkPanel", items: ["Dr. Perera free · Fri 10:30 AM", "Room 4 available", "Waitlist updated"] }],
  },
  {
    agentId: "AGENT-03",
    role: "Reminder Agent",
    status: "SCHEDULED",
    title: "Reminders Set",
    content: [
      {
        type: "channelPanel",
        rows: [
          { icon: "whatsapp", label: "Confirmation sent · WhatsApp" },
          { icon: "sms", label: "Reminder · Thu 10:30 AM" },
          { icon: "email", label: "Follow up · after visit" },
        ],
      },
    ],
  },
  {
    agentId: "AGENT-04",
    status: "COMPLETED",
    pillFilled: true,
    layout: "timeline",
    icon: "calendarCheck",
    title: "Appointment Rebooked",
    subtitle: "Patient notified, calendar updated",
    content: [{ type: "checkPanel", items: ["Patient confirmed", "Calendar updated", "Reminders scheduled"] }],
  },
];
