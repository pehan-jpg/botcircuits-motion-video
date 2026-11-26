/**
 * Data model for the multi-agent handoff hero card.
 * One `AgentFlow` = one composition (one industry). Each `AgentState`
 * is one card shown in sequence.
 */

export type ContentBlock =
  | { type: "message"; text: string; channel?: string }
  | { type: "checklist"; items: string[] }
  | { type: "files"; files: string[] }
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
  content: ContentBlock;
  /**
   * Human-in-the-loop styling: lime filled tag and pill, lime-tinted border.
   * Use on the final escalation state.
   */
  escalation?: boolean;
};

export type AgentFlow = {
  states: AgentState[];
  /** Frames each state occupies, including its in/out transitions. */
  framesPerState: number;
};
