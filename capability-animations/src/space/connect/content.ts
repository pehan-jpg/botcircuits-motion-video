import type {ChannelKind} from '../../components/ChannelGlyph';

export const SPACE_NAME = 'Space';
export const connectionsText = (n: number) =>
  n === 0 ? 'Ready to connect' : `${n} connection${n === 1 ? '' : 's'}`;
export const ACCESS = 'Uses the access of the person who started the claim';

export const TILES: {kind: ChannelKind; name: string; detail: string}[] = [
  {kind: 'table', name: 'Claims system', detail: 'Records and status'},
  {kind: 'card', name: 'Payments', detail: 'Pay and refund'},
  {kind: 'email', name: 'Email', detail: 'Send and receive'},
  {kind: 'file', name: 'Documents', detail: 'Policies and forms'},
];
export const MCP = {name: 'MCP server', detail: 'Any tool that supports MCP', tools: ['claim_status', 'send_receipt']};

export const RECORD_TITLE = 'Claim record';
export const MODEL_TITLE = 'What the model sees';
export const FIELDS = [
  {label: 'Name', value: 'Emily Carter', masked: '[Name]'},
  {label: 'Policy number', value: 'PL 4471 8820', masked: '[Policy number]'},
  {label: 'Email', value: 'emily.carter@mail.example', masked: '[Email]'},
];
export const MASK_LABEL = 'Hide personal details';
export const SUMMARY = '3 details hidden';
export const AUDIT = 'Only a Security Admin can reveal a value, with a recorded reason';
