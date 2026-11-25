// Motion test for Scene 4: samples EVERY frame of the Control Room part from the
// rendered DOM (the GuardLayer logs each agent's feet marker) and reports, per
// agent, the largest position change between consecutive frames at 1x camera,
// and any frame where two copies of the same agent are visible.
// Fails above 14px per frame outside a hero morph.
// Usage: node scripts/motion-test.mjs [fromSecond] [toSecond]
import path from 'node:path';
import fs from 'node:fs';
import {bundle} from '@remotion/bundler';
import {getCompositions, renderFrames, openBrowser} from '@remotion/renderer';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const from = Number(process.argv[2] ?? 10);
const to = Number(process.argv[3] ?? 40);
const LIMIT = 14;
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const exe = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browser = await openBrowser('chrome', {browserExecutable: fs.existsSync(exe) ? exe : null});
const comps = await getCompositions(serveUrl, {puppeteerInstance: browser, inputProps: {guardLog: true}});
const comp = comps.find((c) => c.id === 'Scene04');
const f0 = Math.round(from * comp.fps);
const f1 = Math.min(comp.durationInFrames - 1, Math.round(to * comp.fps) - 1);
const byFrame = new Map();
await renderFrames({
	composition: comp,
	serveUrl,
	inputProps: {guardLog: true},
	imageFormat: 'none',
	frameRange: [f0, f1],
	concurrency: 4,
	puppeteerInstance: browser,
	logLevel: 'error',
	onStart: () => {},
	onFrameUpdate: () => {},
	outputDir: null,
	onBrowserLog: (l) => {
		if (!l.text.startsWith('[guard]')) return;
		const r = JSON.parse(l.text.slice(8));
		byFrame.set(r.frame, r.items.filter((i) => i.kind === 'agent'));
	},
});
await browser.close({silent: true});

const agents = ['iris', 'nora', 'theo', 'owen'];
const worst = Object.fromEntries(agents.map((a) => [a, {px: 0, frame: null}]));
const dupes = [];
let missing = 0;
let prev = null;
for (let f = f0; f <= f1; f++) {
	const items = byFrame.get(f);
	if (!items) {
		missing++;
		prev = null;
		continue;
	}
	const cur = {};
	for (const a of agents) {
		const vis = items.filter((i) => i.label === a && i.opacity > 0.05);
		if (vis.length > 1) dupes.push(`${a} at frame ${f} (${vis.length} copies)`);
		if (vis.length) cur[a] = vis[0];
	}
	if (prev) {
		for (const a of agents) {
			const p = prev[a];
			const c = cur[a];
			if (!p || !c || p.morph || c.morph) continue;
			const z = c.zoom || 1;
			const d = Math.hypot(c.rect.x - p.rect.x, c.rect.y - p.rect.y) / z;
			// Camera motion moves everything on screen; the marker delta includes it, so subtract nothing: report the worst.
			if (d > worst[a].px) worst[a] = {px: d, frame: f};
		}
	}
	prev = cur;
}
const lines = [];
lines.push(`Motion test, Scene 4 frames ${f0} to ${f1} (${f1 - f0 + 1} frames, every frame sampled from the DOM${missing ? `, ${missing} missing` : ''})`);
for (const a of agents) lines.push(`  ${a.padEnd(5)} max change per frame at 1x outside a hero: ${worst[a].px.toFixed(2)}px${worst[a].frame !== null ? ` (frame ${worst[a].frame}, ${(worst[a].frame / comp.fps).toFixed(2)}s)` : ''}`);
lines.push(dupes.length ? `  Duplicate copies: ${dupes.slice(0, 10).join('; ')}` : '  Duplicate copies: none');
const fail = agents.some((a) => worst[a].px > LIMIT) || dupes.length > 0 || missing > 0;
lines.push(fail ? `FAIL (limit ${LIMIT}px per frame)` : `PASS (limit ${LIMIT}px per frame)`);
if (process.env.DUMP) { const [a0,a1]=process.env.DUMP.split(",").map(Number); for (let f=a0; f<=a1; f++){ const it=byFrame.get(f)||[]; console.log(f, it.map(i=>`${i.label}:${i.rect.x.toFixed(1)},${i.rect.y.toFixed(1)} z${i.zoom.toFixed(3)} o${i.opacity.toFixed(2)}`).join("  ")); } }
const out = lines.join('\n');
console.log(out);
fs.mkdirSync(path.join(root, 'out'), {recursive: true});
fs.writeFileSync(path.join(root, 'out', 'motion-test.txt'), out + '\n');
process.exit(fail ? 1 : 0);
