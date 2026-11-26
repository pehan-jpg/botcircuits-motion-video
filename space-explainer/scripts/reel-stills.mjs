// Reel stills at the review times. Usage: node scripts/reel-stills.mjs [preview]
// "preview" uses the 1080p render as the source (before the high resolution render exists).
import path from 'node:path';
import fs from 'node:fs';
import {bundle} from '@remotion/bundler';
import {getCompositions, renderStill, openBrowser} from '@remotion/renderer';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const preview = process.argv[2] === 'preview';
const times = (process.env.TIMES ?? '2,9,15,21,25,28,34,40,44,49,55,62,70,77,84,90,97,103,110,116,124,127,133,139,145,150,153,158,162,168,174,178').split(',').map(Number);
const out = path.join(root, 'out/reel-stills');
fs.mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const exe = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browser = await openBrowser('chrome', {browserExecutable: fs.existsSync(exe) ? exe : null});
const inputProps = preview ? {src: 'http://localhost:8765/space_video.mp4', sourceScale: 1} : {};
const comps = await getCompositions(serveUrl, {puppeteerInstance: browser, inputProps});
const comp = comps.find((c) => c.id === 'SpaceReel9x16');
for (const t of times) {
	const frame = Math.min(comp.durationInFrames - 1, Math.round(t * comp.fps));
	await renderStill({composition: comp, serveUrl, frame, output: path.join(out, `reel-t${String(t).padStart(3, '0')}s.png`), puppeteerInstance: browser, inputProps, logLevel: 'error'});
	process.stdout.write(`${t} `);
}
await browser.close({silent: true});
console.log('\ndone');
