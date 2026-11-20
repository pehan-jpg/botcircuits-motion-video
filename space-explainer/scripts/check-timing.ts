// Static checks that do not need a render:
//  - ReadabilityGuard timing for every text beat in built scenes
//  - timeline consistency (scenes are contiguous, total length 122s)
//  - Preview and Root durations match the timeline
// Usage: npx tsx scripts/check-timing.ts
import fs from 'node:fs';
import path from 'node:path';
import {SCENES, TOTAL_SECONDS, sceneFrames} from '../src/timeline';
import {checkReadability, type GuardIssue} from '../src/lib/guards';
import {SCENE01_TEXT} from '../src/scenes/Scene01Problem';
import {SCENE02_TEXT} from '../src/scenes/Scene02Intro';

const issues: GuardIssue[] = [];
const report = (scene: string, beats: typeof SCENE01_TEXT) => {
	console.log(`\n${scene}`);
	for (const b of beats) {
		const held = b.leaveAt - b.readyAt;
		const need = 1.2 + 0.25 * b.text.split(/\s+/).length;
		console.log(`  ${b.id.padEnd(12)} ready ${b.readyAt.toFixed(2)}s  held ${held.toFixed(2)}s  needs ${need.toFixed(2)}s  ${b.fontPx}px  "${b.text}"`);
		issues.push(...checkReadability(b));
	}
};
report('Scene 1', SCENE01_TEXT);
report('Scene 2', SCENE02_TEXT);

for (let i = 1; i < SCENES.length; i++) {
	if (SCENES[i].start !== SCENES[i - 1].end)
		issues.push({guard: 'timeline', message: `${SCENES[i].id} starts at ${SCENES[i].start}, previous ends at ${SCENES[i - 1].end}`});
}
if (SCENES[SCENES.length - 1].end !== TOTAL_SECONDS) issues.push({guard: 'timeline', message: 'total length mismatch'});

const root = path.resolve(__dirname, '..');
const preview = fs.readFileSync(path.join(root, 'src/Preview.tsx'), 'utf8');
const rootFile = fs.readFileSync(path.join(root, 'src/Root.tsx'), 'utf8');
const previewDurations = [...preview.matchAll(/durationInFrames=\{(\d+)\}/g)].map((m) => Number(m[1]));
SCENES.forEach((s, i) => {
	if (previewDurations[i] !== sceneFrames(s.id))
		issues.push({guard: 'timeline', message: `Preview duration for ${s.id} is ${previewDurations[i]}, timeline says ${sceneFrames(s.id)}`});
	const m = rootFile.match(new RegExp(`id="Scene${String(s.number).padStart(2, '0')}"[^>]*durationInFrames=\\{(\\d+)\\}`));
	if (!m || Number(m[1]) !== sceneFrames(s.id))
		issues.push({guard: 'timeline', message: `Root duration for ${s.id} does not match the timeline`});
});
const total = previewDurations.reduce((a, b) => a + b, 0);
if (!rootFile.includes(`durationInFrames={${total}}`)) issues.push({guard: 'timeline', message: `Preview composition should be ${total} frames`});

console.log(issues.length ? `\n${issues.length} issue(s):\n${issues.map((i) => `  ${i.guard}: ${i.message}`).join('\n')}` : '\nTiming and timeline checks passed.');
process.exit(issues.length ? 1 : 0);
