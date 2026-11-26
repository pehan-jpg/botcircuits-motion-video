/**
 * Reel captions: planned voiceover starts (no transcript with exact timings exists).
 * A caption stays for words / 2.4 + 0.6 seconds, or until the next caption starts.
 * Captions longer than two lines at the reel size are split into sequential chunks.
 */
export const REEL_CAPTIONS: [number, string][] = [
  [1, "Someone has to prepare this claim for review."],
  [5, "The policy is in one place."],
  [8, "The excess is in another."],
  [10, "And the invoice? Somewhere in a chat."],
  [13, "Half the morning is gone."],
  [16, "What if agents did the work?"],
  [20, "Introducing Space, by BotCircuits."],
  [25, "Just ask, in plain language."],
  [27, "Emily, the claims officer, asks it to prepare that claim."],
  [32, "It checks the policy and the evidence, and shows where each answer came from."],
  [38, "It can act, too. A weekly report, and a Slack alert."],
  [43, "Next, give every agent a job."],
  [45, "Emily defines what each one does: intake, policy, evidence."],
  [50, "Each works with her access."],
  [54, "And this is the Control Room. Meet Iris, Emily's front desk."],
  [58, "Nora reads the claim."],
  [61, "Theo checks the policy."],
  [64, "Owen matches the evidence."],
  [67, "A new claim arrives. Iris hands it to Nora."],
  [70, "Nora reads the email in Gmail, and Theo finds the policy."],
  [75, "Owen flags what doesn't match."],
  [77, "Then they bring back the results, prepared and ready for Emily."],
  [82.5, "Then ground it in your own sources."],
  [85.5, "Connect your drives, sheets, websites and more."],
  [88.5, "Everything your team already knows, linked in one place."],
  [92, "It becomes your company brain, ready for every agent."],
  [96, "Now define the process once, as a playbook."],
  [100, "Steps, agents and tools, plus one step that waits for a person."],
  [105, "Emily is the reviewer. In this playbook, nothing goes out until she decides."],
  [110, "Check it, activate it, and it's ready for the next claim."],
  [115, "Now let it run on its own."],
  [118, "A claim arrives at night. Two minutes later, it's prepared."],
  [122.5, "Then it waits, and tells Emily in Slack."],
  [126, "And people approve what matters."],
  [128.5, "Next morning, Emily opens a prepared review pack."],
  [132.5, "It flags one thing: the invoice date doesn't match the date of loss."],
  [137.5, "She confirms it by phone, and approves."],
  [140.5, "The agents prepared it. Emily decided."],
  [143, "And every step is on record."],
  [146, "Who did what, and when. Emily's note sits beside her decision."],
  [152, "And build the views you need."],
  [155, "Describe a page, and Space builds it from live data."],
  [159.5, "Even a dashboard: volume, time to prepare, and flags."],
  [164, "The same claim, prepared in minutes."],
  [168, "Emily gets her morning back, and the decision stays hers."],
  [172.5, "Agents prepare. People decide. Every step on record."],
  [177, "Space, by BotCircuits."],
];

export const CAPTION_PX = 54;
export const CAPTION_MAX_W = 940;
/** Inter SemiBold average advance per character at 1px (measured on these captions, with margin). */
const CHAR_EM = 0.56;
const charsPerLine = Math.floor(CAPTION_MAX_W / (CAPTION_PX * CHAR_EM));

/** Lines a caption wraps to at the reel size (greedy word wrap). */
export const lineCount = (text: string) => {
  let lines = 1;
  let len = 0;
  for (const w of text.split(" ")) {
    const add = len === 0 ? w.length : len + 1 + w.length;
    if (add > charsPerLine && len > 0) {
      lines++;
      len = w.length;
    } else len = add;
  }
  return lines;
};

/** Split at sentence ends, then commas and colons, into chunks of at most two lines. */
const split = (text: string): string[] => {
  if (lineCount(text) <= 2) return [text];
  const parts = text.split(/(?<=[.?!])\s+/);
  const pieces = parts.length > 1 ? parts : text.split(/(?<=[,:])\s+/);
  if (pieces.length <= 1) return [text];
  const chunks: string[] = [];
  let cur = "";
  for (const p of pieces) {
    const next = cur ? `${cur} ${p}` : p;
    if (cur && lineCount(next) > 2) {
      chunks.push(cur);
      cur = p;
    } else cur = next;
  }
  if (cur) chunks.push(cur);
  return chunks.flatMap((c) => (c === text ? [c] : split(c)));
};

export type CaptionChunk = { from: number; to: number; text: string };

export const REEL_CHUNKS: CaptionChunk[] = REEL_CAPTIONS.flatMap(([start, text], i) => {
  const words = (s: string) => s.split(" ").length;
  const next = i < REEL_CAPTIONS.length - 1 ? REEL_CAPTIONS[i + 1][0] : Infinity;
  const end = Math.min(start + words(text) / 2.4 + 0.6, next);
  const chunks = split(text);
  const total = chunks.reduce((n, c) => n + words(c), 0);
  let t = start;
  return chunks.map((c) => {
    const d = ((end - start) * words(c)) / total;
    const chunk = { from: t, to: t + d, text: c };
    t += d;
    return chunk;
  });
});
