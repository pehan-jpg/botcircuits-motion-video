import type {Bubble} from '../../components/BubbleChart';
import type {StepKind} from '../../components/StepRow';

export const TOPICS_TITLE = 'What customers ask about';
export const TOPICS_RANGE = 'Last 7 days';

/** Hand placed centres; the chart centres the cluster. Largest first. */
export const TOPICS: Bubble[] = [
  {label: 'Booking changes', share: 38, x: 300, y: 250},
  {label: 'Refunds', share: 17, x: 500, y: 170},
  {label: 'Baggage', share: 14, x: 490, y: 360},
  {label: 'Seats', share: 12, x: 175, y: 430},
  {label: 'Payments', share: 10, x: 330, y: 445},
  {label: 'Other', share: 9, x: 110, y: 190},
];
export const ALERT_TOPIC = 1;

export const ALERT = {
  badge: 'Needs attention',
  title: 'Refund questions are often passed on',
  body: '31 of the last 100 refund questions needed follow up.',
  suggestion: 'Suggested: add a step explaining credit options',
  primary: 'Apply suggestion',
  secondary: 'Dismiss',
};

export const PROCEDURE_TITLE = 'Procedure: Booking changes';
export const DRAFT = 'Draft';
export const SAVED = 'Saved as version 2';
export const NEW_CHIP = 'New';

export const STEPS: {number: string; kind: StepKind; text: string}[] = [
  {number: '1', kind: 'tool', text: 'booking_lookup'},
  {number: '2', kind: 'if', text: 'the fare is fixed'},
  {number: '3', kind: 'tell', text: 'them the fare rules'},
  {number: '4', kind: 'tell', text: 'them they can take a credit instead'},
];
export const NEW_STEP = 3;

export const BOARD = {
  title: 'Test on live conversations',
  split: '50 / 50 split',
  splitDone: '100 / 0 split',
  current: 'Current version',
  updated: 'Updated version',
  metric: 'Resolved without follow up',
  currentValue: 72,
  updatedValue: 84,
  uplift: '+12 points',
  rolledOut: 'Rolled out to all conversations',
};
