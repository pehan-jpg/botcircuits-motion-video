// Renders chosen frames for visual review: node scripts/review-stills.mjs '[["Scene03",420,"name"],...]' outDir
import path from 'node:path';
import fs from 'node:fs';
import {bundle} from '@remotion/bundler';
import {getCompositions, renderStill, openBrowser} from '@remotion/renderer';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const jobs = JSON.parse(process.argv[2]);
const outDir = process.argv[3] ?? path.join(root, 'out', 'review');
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const exe = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browser = await openBrowser('chrome', {browserExecutable: fs.existsSync(exe) ? exe : null});
const comps = await getCompositions(serveUrl, {puppeteerInstance: browser});
for (const [id, sec, name] of jobs) {
	const comp = comps.find((c) => c.id === id);
	const frame = Math.min(comp.durationInFrames - 1, Math.max(0, Math.round(sec < 0 ? comp.durationInFrames + sec * comp.fps : sec * comp.fps)));
	await renderStill({composition: comp, serveUrl, frame, output: path.join(outDir, `${name}.png`), puppeteerInstance: browser, logLevel: 'error', scale: 0.5});
	process.stdout.write(`${name} `);
}
await browser.close({silent: true});
