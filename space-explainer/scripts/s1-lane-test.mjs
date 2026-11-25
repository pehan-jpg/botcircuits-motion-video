// Scene 1 caption lane test. Until the morph begins (13.6s), sampled every Nth frame:
//  (a) no pixel of the STAGE (windows, cursor, tray, summary) lies inside the caption lane:
//      the frame rendered without the HUD must equal the backdrop alone in rows 96 to 236;
//  (b) every visible HUD element lies inside the 96px safe area;
//  (c) the caption box does not come within 24px of the task card or the chips.
// After the release (14.0s) the stage clip is gone: (d) checks the release is complete and
// the morph frames are unaffected (see the report's notes).
// Usage: node scripts/s1-lane-test.mjs [everyNthFrame]
import path from 'node:path';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {getCompositions, renderStill, openBrowser} from '@remotion/renderer';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const step = Number(process.argv[2] ?? 6);
const out = path.join(root, 'out/s1-lane');
fs.rmSync(out, {recursive: true, force: true});
fs.mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const exe = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browser = await openBrowser('chrome', {browserExecutable: fs.existsSync(exe) ? exe : null});
const comps = await getCompositions(serveUrl, {puppeteerInstance: browser});
const comp = comps.find((c) => c.id === 'Scene01');
const end = Math.round(13.6 * comp.fps);
const frames = [];
for (let f = 0; f < end; f += step) frames.push(f);
frames.push(end - 1);
const hud = [];
for (const frame of frames) {
	const logs = [];
	await renderStill({composition: comp, serveUrl, frame, output: path.join(out, `${frame}-noHud.png`), puppeteerInstance: browser, logLevel: 'error', inputProps: {s1Layer: 'noHud', guardLog: true},
		onBrowserLog: (l) => { if (l.text.startsWith('[guard]')) logs.push(JSON.parse(l.text.slice(8))); }});
	await renderStill({composition: comp, serveUrl, frame, output: path.join(out, `${frame}-bg.png`), puppeteerInstance: browser, logLevel: 'error', inputProps: {s1Layer: 'backdrop'}});
	const g = logs[logs.length - 1];
	hud.push({frame, t: frame / comp.fps, items: (g?.items ?? []).filter((i) => /^(Task card|Open tabs|Clock|Line: )/.test(i.label)).map((i) => ({label: i.label, rect: i.rect, opacity: i.opacity}))});
}
await browser.close({silent: true});
fs.writeFileSync(path.join(out, 'frames.json'), JSON.stringify(hud));
execFileSync('python3', ['-I', path.join(root, 'scripts/s1-lane-compare.py'), out], {stdio: 'inherit'});
