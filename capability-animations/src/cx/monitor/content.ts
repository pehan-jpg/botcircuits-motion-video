import type {ChannelKind} from '../../components/ChannelGlyph';
import type {StepKind} from '../../components/StepRow';

export const LIST_TITLE = 'Live conversations';
export const COUNTER_VALUES = [6, 12, 18, 24];

export type Conversation = {name: string; kind: ChannelKind; snippet: string; startSeconds: number};

/** Rows 1 to 7 as specified; row 8 only peeks in when the list drifts up. */
export const CONVERSATIONS: Conversation[] = [
  {name: 'Emily Carter', kind: 'whatsapp', snippet: 'Can I move my booking to 15 Dec?', startSeconds: 134},
  {name: 'Marcus Webb', kind: 'voice', snippet: 'Checking your baggage allowance', startSeconds: 341},
  {name: 'Sofia Alvarez', kind: 'web', snippet: 'Which seat would you like?', startSeconds: 69},
  {name: 'Tom Becker', kind: 'instagram', snippet: 'Thanks, that is all I needed', startSeconds: 502},
  {name: 'Hannah Lee', kind: 'email', snippet: 'Your invoice has been sent', startSeconds: 185},
  {name: 'Oliver Grant', kind: 'sms', snippet: 'Reply 1 to confirm', startSeconds: 47},
  {name: 'Grace Morgan', kind: 'messenger', snippet: 'I can help with that', startSeconds: 270},
  {name: 'Noah Bennett', kind: 'web', snippet: 'Is breakfast included?', startSeconds: 22},
];

export const ATTENTION_SNIPPET = 'I want a refund for my booking';
export const NEEDS_ATTENTION = 'Needs attention';
export const WITH_DANIEL_SHORT = 'With Daniel';
export const WITH_DANIEL = 'With Daniel Reyes';

export const CUSTOMER = {name: 'Emily Carter', booking: 'Booking BK 4821'};

export const TRANSCRIPT = {
  customer1: 'I want a refund for my booking',
  traces: [
    {kind: 'tool' as StepKind, text: 'booking_lookup', duration: '0.4 s'},
    {kind: 'if' as StepKind, text: 'the fare is fixed', duration: '0.1 s'},
    {kind: 'tell' as StepKind, text: 'them the fare rules', duration: '0.3 s'},
  ],
  agent: 'Refunds are not available on this fare. I can offer a credit.',
  customer2: 'Can I speak to a person?',
  notice: 'Customer asked for a person',
  context: {
    initials: 'DR',
    title: 'Passed to Daniel Reyes',
    subtitle: 'Full conversation attached',
    chips: ['Booking BK 4821', 'Fare: fixed', 'Refund requested', '4 steps so far'],
  },
  daniel: 'Hi Emily, I have your booking in front of me. Let me look at the refund.',
};
