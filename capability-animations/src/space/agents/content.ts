import type {DetailSection} from '../components/DetailCard';

export const START = 'Claim CLM 2087';

export const AGENTS = [
  {name: 'Intake agent', role: 'Reads the claim'},
  {name: 'Policy agent', role: 'Checks cover'},
  {name: 'History agent', role: 'Checks past claims'},
];
/** The agent shown in the detail card. */
export const SELECTED_AGENT = 1;

export const APPROVAL = {pending: 'Needs approval', approved: 'Approved', initials: 'DR', name: 'Daniel Reyes'};
export const PAYOUT = {name: 'Payout agent', role: 'Prepares the payment'};
export const SETTLED = 'Claim settled';

export const DETAIL_SECTIONS: DetailSection[] = [
  {label: 'Skills', chips: [{label: 'Read policies'}, {label: 'Compare cover'}]},
  {label: 'Tools', chips: [{label: 'policy_search', tool: true}]},
  {label: 'Access', chips: [{label: 'Claims folder only'}, {label: 'Read only'}]},
];
export const DETAIL_NOTE = 'Access never goes beyond the person who started the claim.';
