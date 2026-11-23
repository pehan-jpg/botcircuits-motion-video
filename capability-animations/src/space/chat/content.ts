export const PLACEHOLDER = 'Ask Space anything';
export const PROMPT = 'Can claim CLM 2087 be approved?';
export const WORKING = 'Working on it';
export const FOUND = 'Here is what I found';

export const PLAN_START = 'Claim CLM 2087';
export const PLAN_AGENTS = ['Read claim', 'Check policy', 'Check history'];
export const PLAN_RESULT = 'Decision';

export const RESULT = {
  title: 'Ready for approval',
  summary: '3 checks passed',
  findings: [
    {text: 'Water damage is covered', source: 'Policy 4.2'},
    {text: 'Filed within 30 days', source: 'Claim form'},
    {text: 'No other claims this year', source: 'Claim history'},
  ],
  primary: 'Approve',
  secondary: 'Ask a question',
};
