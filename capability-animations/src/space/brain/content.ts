import type {ChannelKind} from '../../components/ChannelGlyph';

export const SOURCES_TITLE = 'Company Brain';
export const ITEMS_TOTAL = 9896; // 312 + 8,400 + 1,120 + 64; folders do not add to the count.

export const SOURCES: {kind: ChannelKind; name: string; detail?: string; dashed?: boolean}[] = [
  {kind: 'file', name: 'Documents', detail: '312 files'},
  {kind: 'table', name: 'Spreadsheets', detail: '8,400 rows'},
  {kind: 'image', name: 'Scanned images', detail: '1,120 images, text read'},
  {kind: 'folder', name: 'Connected folders', detail: '3 folders, synced'},
  {kind: 'book', name: 'Knowledge bases', detail: '64 articles'},
  {kind: 'more', name: 'More sources', dashed: true},
];

export const ANSWER_TITLE = 'Ask Space';
export const CLAIM_CHIP = 'Claim CLM 2087';
export const QUESTION = 'Is this water damage claim covered?';
export const ANSWER_TEXT =
  'Yes, it is covered. The claim was filed 9 days after the damage and the repair estimate is 1,850 dollars.';

export const CITATIONS: {kind: ChannelKind; label: string}[] = [
  {kind: 'file', label: 'Policy 4.2'},
  {kind: 'table', label: 'Claim row 2087'},
  {kind: 'image', label: 'Repair estimate'},
];

export const PREVIEWS = {
  document: {
    title: 'Home policy, section 4.2',
    passage: 'Accidental water damage is covered when it is reported within 30 days.',
  },
  table: {
    title: 'Claims table',
    columns: ['Claim', 'Filed', 'Days'],
    rows: [
      ['CLM 2085', '3 Nov', '4'],
      ['CLM 2086', '5 Nov', '12'],
      ['CLM 2087', '9 Nov', '9'],
      ['CLM 2088', '11 Nov', '2'],
    ],
    highlightRow: 2,
  },
  image: {title: 'Repair estimate', total: 'Total 1,850 dollars', chip: 'Text read from image'},
};

export const PERMISSION = 'Showing only what each person can read';
