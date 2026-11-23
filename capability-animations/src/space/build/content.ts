import type {StepKind} from '../../components/StepRow';

export const TITLE = 'Claim review';
export const DRAFT = 'Draft';
export const READY = 'Ready';

export const STEPS: {number: string; kind: StepKind; text: string; level: number; orb?: boolean; review?: boolean}[] = [
  {number: '1', kind: 'collect', text: 'the claim details', level: 0},
  {number: '2', kind: 'tool', text: 'policy_lookup', level: 0},
  {number: '3', kind: 'agent', text: 'Policy agent checks cover', level: 0, orb: true},
  {number: '4', kind: 'if', text: 'the amount is over 1,000 dollars', level: 0},
  {number: '4.1', kind: 'review', text: 'Daniel Reyes approves the payment', level: 1, review: true},
  {number: '5', kind: 'tool', text: 'pay_claim', level: 0},
];

export const WAITING = 'Waiting for review';

export const VARIABLES = [
  {name: 'claim_id', type: 'Text'},
  {name: 'amount', type: 'Number'},
  {name: 'policy_number', type: 'Secure', secure: true},
];

export const CHECKS = {
  title: 'Checks',
  button: 'Run test',
  rows: ['All steps connected', 'Variables typed', 'Approval step set'],
  passed: 'Test passed',
};
