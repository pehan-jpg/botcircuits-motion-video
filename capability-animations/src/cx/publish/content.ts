import type {ChannelKind} from '../../components/ChannelGlyph';

export const AGENT_NAME = 'Booking support';
export const liveText = (n: number) =>
  n === 0 ? 'Ready to publish' : `Live on ${n} channel${n === 1 ? '' : 's'}`;

export type Channel = {kind: ChannelKind; name: string; detail?: string; live: boolean};

export const CHANNELS: Channel[] = [
  {kind: 'web', name: 'Web chat', live: true},
  {kind: 'whatsapp', name: 'WhatsApp', live: true},
  {kind: 'instagram', name: 'Instagram', live: true},
  {kind: 'voice', name: 'Voice', live: true},
  {kind: 'sms', name: 'SMS', live: true},
  {kind: 'email', name: 'Email', live: true},
  {kind: 'messenger', name: 'Messenger', live: true},
  {kind: 'more', name: 'More channels', detail: 'Same agent, no rebuild', live: false},
];

/** Rows that become the three mockup cards, in card order. */
export const MOCK_ROWS = [1, 2, 3] as const;

export const CUSTOMER = {initials: 'EC', name: 'Emily Carter', booking: 'Booking BK 4821'};

export const STORY = {
  whatsapp: {
    time: 'Mon 10:02',
    stamp: '10:02',
    customer: 'Can I move my booking to 15 Dec?',
    agent: 'Done. Your booking is now on 15 Dec.',
  },
  instagram: {
    time: 'Mon 14:30',
    customer: 'Does my airport transfer move too?',
    agent: 'Yes. It is now on 15 Dec as well.',
  },
  voice: {
    time: 'Tue 09:15',
    customer: 'What was the change fee?',
    agent: '25 dollars. I have emailed the receipt.',
  },
} as const;
