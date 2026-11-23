import type {StepKind} from '../../components/StepRow';

export const PROMPT = 'Handle booking changes and refunds for our customers';

export type ProcedureStep = {number?: string; kind: StepKind; text: string; level: number};

export const PROCEDURE: ProcedureStep[] = [
  {number: '1', kind: 'ask', text: 'for the booking reference', level: 0},
  {number: '2', kind: 'tool', text: 'booking_lookup', level: 0},
  {number: '3', kind: 'ask', text: 'what they want to change', level: 0},
  {number: '4', kind: 'if', text: 'the fare allows changes', level: 0},
  {number: '4.1', kind: 'tell', text: 'them the options and any fee', level: 1},
  {kind: 'elseIf', text: 'the fare is fixed', level: 0},
  {number: '4.2', kind: 'tell', text: 'them the fare rules', level: 1},
];

export const CONSOLE_LABEL = 'Console';
export const GUARDRAILS_LABEL = 'Guardrails on';
export const AGENT_NAME = 'Booking support';
export const AGENT_SUBTITLE = 'Built from your procedure';
export const READY_LABEL = 'Agent ready';
