// Dev guards (no render needed): ReadabilityGuard and assertGaps (scene 11).
// npx tsx scripts/guards.ts  -> exits 1 on any warning.
import {readabilityWarnings, gapWarnings, SCENE_LEN, BEAT_LEN, CHATS, TAGLINE_TYPING, MAX_HEADLINE_CPS, HEADLINE_CPS} from '../src/pacing';
import {typedChars, JITTER} from '../src/ui/typewriter';
import {taglineBoxes} from '../src/scenes/Scene13End';
import {messageGeom} from '../src/ui/ChatThread';

const w = [...readabilityWarnings(), ...gapWarnings()];
// frame by frame over each message's life, using the same pure geometry the renderer uses
for (const [scene, tl] of Object.entries(CHATS)) {
  for (const m of tl.msgs) {
    const fail = (why: string, t: number) => w.push(`READABILITY ${scene} "${m.text}" ${why} at ${t.toFixed(2)} s`);
    const first = messageGeom(m, m.at);
    if (first.chars > 0) fail(`shows ${first.chars} characters in its first frame`, m.at);
    let prevH = 0;
    let widthAtStart: number | null = null;
    for (let t = m.at; t <= m.holdEnd + 0.5; t += 1 / 60) {
      const g = messageGeom(m, t);
      if (g.grow - g.linesWithText > 1 + 1e-6) { fail(`has ${(g.grow - g.linesWithText).toFixed(2)} empty lines`, t); break; }
      if (t >= m.typeStart!) {
        if (widthAtStart === null) widthAtStart = g.w;
        else if (Math.abs(g.w - widthAtStart) > 0.5) { fail('changes width after its typing starts', t); break; }
      }
      if (g.h < prevH - 0.01) { fail('shrinks', t); break; }
      prevH = g.h;
    }
  }
}
// scene 13 end line: nothing visible in the first frame, fixed line boxes, at most MAX_HEADLINE_CPS
{
  const T = TAGLINE_TYPING;
  if (typedChars(T.times, 0) > 0) w.push('READABILITY s13 tagline has characters in the first frame');
  const chars = T.text.replace('\n', '').length;
  const cps = chars / (T.end - T.start);
  if (cps > MAX_HEADLINE_CPS || HEADLINE_CPS * (1 + JITTER) > MAX_HEADLINE_CPS) w.push(`READABILITY s13 tagline types at ${cps.toFixed(1)} chars/s`);
  const first = JSON.stringify(taglineBoxes());
  for (let t = T.start; t <= T.end + 0.5; t += 1 / 60) if (JSON.stringify(taglineBoxes()) !== first) { w.push(`READABILITY s13 tagline line box changes at ${t.toFixed(2)} s`); break; }
}
console.log('scene lengths', JSON.stringify(SCENE_LEN), 'beats', JSON.stringify(BEAT_LEN));
console.log(`${w.length} guard warnings`);
for (const x of w) console.log(x);
process.exit(w.length ? 1 : 0);
