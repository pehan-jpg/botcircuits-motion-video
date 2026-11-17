// QA: render FullVideo stills every 0.5 s (build stage) with the SafeAreaGuard
// enabled and collect its warnings. node scripts/qa.mjs [outDir] [fromFrame] [toFrame]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
import {execSync} from 'node:child_process';

// ReadabilityGuard + assertGaps first (fail fast)
execSync('npx tsx scripts/guards.ts', {stdio: 'inherit'});

const outDir = process.argv[2] || 'out/qa';
const from = Number(process.argv[3] || 960);
const to = Number(process.argv[4] || 8708);
const browserExecutable = process.env.REMOTION_BROWSER || null;
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const inputProps = {qa: true};
const composition = await selectComposition({serveUrl, id: 'FullVideo', inputProps, browserExecutable});
const warnings = [];
for (let f = from; f <= to; f += 30) {
  const output = path.join(outDir, `qa_${String(f).padStart(4, '0')}.png`);
  await renderStill({
    composition,
    serveUrl,
    frame: f,
    output,
    inputProps,
    browserExecutable,
    scale: Number(process.env.SCALE || 0.5),
    onBrowserLog: (l) => {
      if (l.text.includes('SAFE')) warnings.push(`${(f / 60).toFixed(1)}s ${l.text}`);
    },
  });
}
fs.writeFileSync(path.join(outDir, 'safe-area-report.txt'), warnings.join('\n') + '\n');
console.log(`${warnings.length} warnings`);
console.log(warnings.join('\n'));
// fail the build on any violation
if (warnings.length > 0) process.exit(1);
