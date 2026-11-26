// Prints the reel caption chunks with their times and estimated line counts.
import { lineCount, REEL_CHUNKS } from "../src/reel/captions";
for (const c of REEL_CHUNKS) console.log(`${c.from.toFixed(2).padStart(7)} to ${c.to.toFixed(2).padStart(7)}  [${lineCount(c.text)}]  ${c.text}`);
