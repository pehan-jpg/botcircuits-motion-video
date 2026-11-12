// Render stills of FullVideo: node scripts/stills.mjs <outDir> <frame> [frame...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const [outDir, ...frames] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER || null;
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'FullVideo', browserExecutable});
for (const f of frames.map(Number)) {
  const output = path.join(outDir, `full_${String(f).padStart(4, '0')}.png`);
  await renderStill({composition, serveUrl, frame: f, output, browserExecutable, scale: Number(process.env.SCALE || 1)});
  console.log(output);
}
