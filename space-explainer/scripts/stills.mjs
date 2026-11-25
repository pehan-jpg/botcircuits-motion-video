// Renders a PNG still every 1s for each scene into out/stills, and collects
// runtime guard reports (SafeAreaGuard, ReadabilityGuard size, LogoGuard).
// For built scenes it also renders a text-hidden background pass so
// scripts/check.py can sample the luminance behind every text block.
// Usage: node scripts/stills.mjs [Scene01 Scene02 ...]
import path from 'node:path';
import fs from 'node:fs';
import {bundle} from '@remotion/bundler';
import {getCompositions, renderStill, openBrowser} from '@remotion/renderer';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const outDir = path.join(root, 'out');
const BUILT = (id) => /^Scene\d\d$/.test(id); // every registered scene is built
const browserExecutable =
	process.env.REMOTION_BROWSER ??
	'/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';

const only = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const browser = await openBrowser('chrome', {browserExecutable: fs.existsSync(browserExecutable) ? browserExecutable : null});
const comps = await getCompositions(serveUrl, {puppeteerInstance: browser});
const scenes = comps.filter((c) => /^Scene\d\d$/.test(c.id) && (!only.length || only.includes(c.id)));

const report = [];
for (const comp of scenes) {
	const n = comp.id.slice(5);
	const dir = path.join(outDir, 'stills', `scene-${n}`);
	const bgDir = path.join(outDir, 'guards', 'bg', `scene-${n}`);
	fs.mkdirSync(dir, {recursive: true});
	const seconds = Math.round(comp.durationInFrames / comp.fps);
	// STILL_STEP=0.5 renders a still every half second (half-second stills are named t05.5s).
	const step = Number(process.env.STILL_STEP ?? 1);
	for (let k = 0; k * step < seconds - 1e-9; k++) {
		const s = k * step;
		const frame = Math.min(comp.durationInFrames - 1, Math.round(s * comp.fps));
		const logs = [];
		const label = Number.isInteger(s) ? String(s).padStart(2, '0') : String(Math.floor(s)).padStart(2, '0') + (s % 1).toFixed(1).slice(1);
		const output = path.join(dir, `scene-${n}-t${label}s.png`);
		await renderStill({
			composition: comp,
			serveUrl,
			frame,
			output,
			puppeteerInstance: browser,
			logLevel: 'error',
			inputProps: {guardLog: true},
			onBrowserLog: (l) => {
				if (l.text.startsWith('[guard]')) logs.push(JSON.parse(l.text.slice(8)));
				else if (/Guard|Plate/.test(l.text)) console.warn(l.text);
			},
		});
		let bg = null;
		if (BUILT(comp.id)) {
			fs.mkdirSync(bgDir, {recursive: true});
			bg = path.join(bgDir, `t${label}s.png`);
			await renderStill({composition: comp, serveUrl, frame, output: bg, puppeteerInstance: browser, logLevel: 'error', inputProps: {hideText: true}});
		}
		report.push({scene: comp.id, second: s, frame, still: path.relative(root, output), bg: bg && path.relative(root, bg), guard: logs[logs.length - 1] ?? null});
		process.stdout.write(`${comp.id} t=${s}s\r`);
	}
	console.log(`${comp.id}: ${seconds} stills`);
}

// NightGrade test stills at grade 0, 0.5 and 1.
const ng = comps.find((c) => c.id === 'NightGradeTest');
if (ng && (!only.length || only.includes('NightGradeTest'))) {
	const dir = path.join(outDir, 'stills', 'nightgrade');
	fs.mkdirSync(dir, {recursive: true});
	for (const g of [0, 0.5, 1]) {
		const output = path.join(dir, `nightgrade-${g.toFixed(1)}.png`);
		await renderStill({composition: {...ng, props: {grade: g, showZones: true}}, serveUrl, frame: 300, output, puppeteerInstance: browser, inputProps: {grade: g, showZones: true}});
		console.log(`NightGrade ${g}: ${path.relative(root, output)}`);
	}
}

fs.mkdirSync(path.join(outDir, 'guards'), {recursive: true});
const reportPath = path.join(outDir, 'guards', only.length ? `report-${only.join('-')}.json` : 'report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 1));
await browser.close({silent: true});
console.log(`Guard report: ${path.relative(root, reportPath)}`);
