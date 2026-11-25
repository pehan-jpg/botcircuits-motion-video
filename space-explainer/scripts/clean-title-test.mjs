// Clean title test for Scenes 4 to 10. From title start until the frame starts rising,
// only the plate, the glow and the title may be visible. Each sampled frame is rendered
// twice: as is, and with inputProps.cleanRef (every other layer hidden). Any pixel that
// differs means another layer (chip, cursor, tag, pill, partial UI) is showing.
// Usage: node scripts/clean-title-test.mjs [everyNthFrame] [SceneNN ...]
import path from 'node:path';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {getCompositions, renderStill, openBrowser} from '@remotion/renderer';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const step = Number(process.argv[2] ?? 6);
const windows = JSON.parse(execFileSync('npx', ['tsx', 'scripts/title-windows.ts'], {cwd: root}).toString());
const out = path.join(root, 'out/clean-title');
fs.rmSync(out, {recursive: true, force: true});
fs.mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const exe = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browser = await openBrowser('chrome', {browserExecutable: fs.existsSync(exe) ? exe : null});
const comps = await getCompositions(serveUrl, {puppeteerInstance: browser});
const pairs = [];
const only = process.argv.slice(3);
for (const w of windows.filter((x) => !only.length || only.includes(x.id))) {
	const comp = comps.find((c) => c.id === w.id);
	const f0 = Math.ceil(w.from * comp.fps);
	const f1 = Math.floor(w.to * comp.fps) - 1;
	const frames = [];
	for (let f = f0; f <= f1; f += step) frames.push(f);
	if (frames[frames.length - 1] !== f1) frames.push(f1);
	for (const frame of frames) {
		for (const ref of [false, true]) {
			const file = path.join(out, `${w.id}-${frame}${ref ? '-ref' : ''}.png`);
			await renderStill({composition: comp, serveUrl, frame, output: file, puppeteerInstance: browser, inputProps: ref ? {cleanRef: true} : {}, logLevel: 'error'});
		}
		pairs.push({id: w.id, frame, t: frame / comp.fps});
	}
}
await browser.close({silent: true});
fs.writeFileSync(path.join(out, 'pairs.json'), JSON.stringify({windows: windows.filter((x) => pairs.some((p) => p.id === x.id)), pairs}));
execFileSync('python3', ['-I', path.join(root, 'scripts/clean-title-compare.py'), out], {stdio: 'inherit'});
