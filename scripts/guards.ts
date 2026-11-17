// Dev guards (no render needed): ReadabilityGuard (+ the no resize rule) and assertGaps (scene 11).
// npx tsx scripts/guards.ts  -> exits 1 on any warning.
import {readabilityWarnings, gapWarnings, SCENE_LEN, BEAT_LEN, CHATS} from '../src/pacing';
import {messageBox} from '../src/ui/ChatThread';

const w = [...readabilityWarnings(), ...gapWarnings()];
// no resize: a bubble's box is fixed from its first frame (sampled over its whole life)
for (const [scene, tl] of Object.entries(CHATS)) {
  for (const m of tl.msgs) {
    const first = JSON.stringify(messageBox(m));
    for (let t = m.at; t <= m.holdEnd + 1; t += 0.05) {
      const now = JSON.stringify(messageBox({...m}));
      if (now !== first) {
        w.push(`READABILITY ${scene} "${m.text}" bubble changes size at ${t.toFixed(2)} s`);
        break;
      }
    }
  }
}
console.log('scene lengths', JSON.stringify(SCENE_LEN), 'beats', JSON.stringify(BEAT_LEN));
console.log(`${w.length} guard warnings`);
for (const x of w) console.log(x);
process.exit(w.length ? 1 : 0);
