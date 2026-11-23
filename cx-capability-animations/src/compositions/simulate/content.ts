export const SIM_LABEL = 'Simulation';
export const TITLE = 'Test run';
export const COUNTER_LABEL = 'Tests passed';
export const COUNTER_DONE_LABEL = 'All tests passed';

export const TESTS = [
  'Customer asks to change a booking',
  'Customer gives the wrong reference',
  'Customer asks for the fare rules',
  'Customer asks for a refund after the deadline',
  'Customer changes their mind midway',
] as const;

/** Index of the test that fails on its first run. */
export const FAILED_TEST = 3;
export const FAIL_REASON = 'Offered a refund outside the rules';
export const FIX_LABEL = 'Procedure updated';
export const FIX_KIND = 'tell' as const;
export const FIX_TEXT = 'them the fare rules and do not offer a refund';
