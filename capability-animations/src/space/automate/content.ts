import type {ChannelKind} from '../../components/ChannelGlyph';
import type {StepKind} from '../../components/StepRow';

export const TRIGGERS_TITLE = 'Triggers';
export const TRIGGERS: {kind: ChannelKind; name: string; detail: string}[] = [
  {kind: 'mail', name: 'New email', detail: 'Claim sent to the claims inbox'},
  {kind: 'table', name: 'Table row added', detail: 'Claims table'},
  {kind: 'clock', name: 'Schedule', detail: 'Every weekday at 9:00'},
  {kind: 'link', name: 'Webhook', detail: 'From your systems'},
];
/** The trigger that fires. */
export const FIRED = 1;
export const EVENT = 'CLM 2087 added';

export const CONTROL_TITLE = 'Control Room';
export const RUN_CHIP = 'Run 2087';

export const RUN_STEPS: {time: string; altTime?: string; kind: StepKind; text: string}[] = [
  {time: '10:02', kind: 'collect', text: 'the claim details'},
  {time: '10:02', kind: 'tool', text: 'policy_lookup'},
  {time: '10:03', kind: 'agent', text: 'Policy agent checks cover'},
  {time: '10:04', kind: 'if', text: 'the amount is over 1,000 dollars'},
  {time: '10:04', altTime: '13:24', kind: 'review', text: 'Daniel Reyes approves the payment'},
];
export const PAY_STEP = {time: '13:24', kind: 'tool' as StepKind, text: 'pay_claim'};

export const WAITING_CHIP = 'Waiting for review';
export const RETRY_CHIP = 'Retrying, attempt 2';
export const NOTICE = 'Restarted, run continued from this step';
export const WAITING_LABEL = 'Waiting';
export const TOOK = 'Took 3 h 23 min';
