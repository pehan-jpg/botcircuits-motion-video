/**
 * Data model for the multi-agent handoff hero card.
 * One `AgentFlow` = one composition (one industry). Each `AgentState`
 * is one card shown in sequence; its `content` is a stack of blocks.
 */

export type IconName = "plane" | "bed" | "pin" | "car" | "calendar" | "people" | "info" | "file" | "star";

export type IconLabel = { icon: IconName; label: string };

export type ContentBlock =
  /** Chat bubble from the customer. */
  | { type: "message"; text: string }
  /** Small icon chips in a row (e.g. trip facts). */
  | { type: "chips"; chips: IconLabel[] }
  /** Plain checklist with lime ticks. */
  | { type: "checklist"; items: string[] }
  /** Compact rows: icon tile, caption, text, lime tick on the right. */
  | { type: "rows"; rows: (IconLabel & { caption: string })[] }
  /** Boarding-pass panel with an animated plane along a dashed arc. */
  | {
      type: "boardingPass";
      from: { code: string; city: string };
      to: { code: string; city: string };
      footLeft: IconLabel;
      footRight: IconLabel;
    }
  /** Inset strip with an icon, text and a star rating that fills in. */
  | { type: "ratingStrip"; icon: IconName; text: string; stars: number }
  /** File chips. */
  | { type: "files"; files: string[] }
  /** Summary strip of icon items separated by dividers. */
  | { type: "summary"; caption: string; items: (IconLabel & { highlight?: boolean })[] }
  /** Human-review callout on a darker inset panel. */
  | { type: "callout"; heading: string; body: string };

export type AgentState = {
  /** e.g. "AGENT-01" */
  agentId: string;
  /** e.g. "Intake Agent" */
  role: string;
  /** Status pill text, e.g. "RECEIVED" */
  status: string;
  title: string;
  subtitle: string;
  content: ContentBlock[];
  /** Human-in-the-loop styling: lime filled tag and pill, lime-tinted border. */
  escalation?: boolean;
};

export type AgentFlow = {
  states: AgentState[];
  /** Frames each state occupies, including its in/out transitions. */
  framesPerState: number;
  /**
   * Fixed y of the card's top edge. Keeps the header in the same place in
   * every state even when cards differ in height. Pick it so the tallest
   * state sits centred.
   */
  cardTop: number;
};
