// Dev guards (no render needed): ReadabilityGuard + assertGaps (scene 11).
// npx tsx scripts/guards.ts  -> exits 1 on any warning.
import {readabilityWarnings, gapWarnings, SCENE_LEN, BEAT_LEN} from '../src/pacing';
const w = [...readabilityWarnings(), ...gapWarnings()];
console.log('scene lengths', JSON.stringify(SCENE_LEN), 'beats', JSON.stringify(BEAT_LEN));
console.log(`${w.length} guard warnings`);
for (const x of w) console.log(x);
process.exit(w.length ? 1 : 0);
