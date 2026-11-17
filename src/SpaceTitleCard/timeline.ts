import { sec } from "../constants";

export const DURATION = 480; // 8.0s at 60 fps

type R = readonly [number, number];
const r = (a: number, b: number): R => [sec(a), sec(b)];

/** All beats in frames (60 fps); arguments are seconds. */
export const T = {
  canvasIn: r(0, 0.6),

  // 0.6 to 1.8 inbound events (tiles 0.15s apart)
  eventTile: [0.6, 0.75, 0.9].map((s) => r(s, s + 0.3)),
  eventLine: [0.7, 0.85, 1.0].map((s) => r(s, s + 0.3)),
  eventPulse: [1.0, 1.2, 1.4].map((s) => r(s, s + 0.32)),
  popStart: sec(1.17),

  // 1.8 to 3.2 the process draws
  lines: {
    startAgent: r(1.8, 2.1),
    agentBranch: r(2.05, 2.35),
    branchPerson: r(2.3, 2.6),
    personDone: r(2.55, 2.85),
    auto: r(2.65, 2.95),
  },
  popAgent: sec(2.0),
  popBranch: sec(2.25),
  popPerson: sec(2.5),
  popDone: sec(2.75),
  popDur: sec(0.26),
  runToAgent: r(2.6, 2.85),
  haloAgent: r(2.85, 3.25),

  // 3.2 to 4.8 connected tools
  toolTile: [3.2, 3.3, 3.4, 3.5].map((s) => r(s, s + 0.3)),
  toolLine: [3.3, 3.4, 3.5, 3.6].map((s) => r(s, s + 0.3)),
  toolCall: [3.72, 3.99, 4.26, 4.53].map((s) => ({ out: r(s, s + 0.13), back: r(s + 0.14, s + 0.27) })),
  newRow: r(4.8, 5.1),

  // 4.8 to 6.2 the run continues
  agentBranch: r(4.85, 5.0),
  branchPerson: r(5.0, 5.2),
  ring: [sec(5.2), sec(5.4)],
  ringDur: sec(0.24),
  approve: r(5.58, 5.76),
  personDone: r(5.76, 5.96),
  donePop: r(5.94, 6.14),
  rowDone: r(6.0, 6.2),

  // 6.2 to 6.8 a row change starts another run
  rowToStart: r(6.25, 6.65),
  startLight: r(6.6, 6.9),

  // 6.8 to 8.0 hold
  ambient: r(6.8, 7.5),
  loopOut: r(7.6, 8.0),
  endMarkCollapse: r(7.2, 7.4),
  endMarkSymbol: r(7.3, 7.45),
};
