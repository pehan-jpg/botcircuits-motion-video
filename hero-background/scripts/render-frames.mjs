// Renders HeroOverlay frame by frame, each frame as a fresh still (PNG), in parallel workers.
// Sequence rendering in this headless Chrome sometimes captured a frame before the overlay text had
// painted (empty glass); every independently rendered still is correct.
// Usage: node scripts/render-frames.mjs <outDir> <fps> <firstFrame> <lastFrame> [workers]
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const [outDir, fpsArg, firstArg, lastArg, workersArg] = process.argv.slice(2);
const fps = Number(fpsArg);
const workers = Number(workersArg ?? 4);
const browserExecutable = process.env.REMOTION_BROWSER ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const chromeMode = "chrome-for-testing";
const chromiumOptions = { gl: "swangle" };
const inputProps = { showOverlay: true, fps, ...(process.env.EXTRA_PROPS ? JSON.parse(process.env.EXTRA_PROPS) : {}) };

fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const puppeteerInstance = await openBrowser("chrome", { browserExecutable, chromeMode, chromiumOptions });
const composition = await selectComposition({ serveUrl, id: "HeroOverlay", inputProps, puppeteerInstance, chromeMode });
const last = Math.min(Number(lastArg), composition.durationInFrames - 1);
const queue = [];
for (let f = Number(firstArg); f <= last; f++) queue.push(f);
let done = 0;
const t0 = Date.now();
const worker = async () => {
  while (queue.length) {
    const frame = queue.shift();
    const output = path.join(outDir, `f${String(frame).padStart(5, "0")}.png`);
    if (fs.existsSync(output)) { done++; continue; }
    for (let attempt = 1; ; attempt++) {
      try {
        await renderStill({
          serveUrl,
          composition,
          frame,
          output,
          inputProps,
          puppeteerInstance,
          chromeMode,
          imageFormat: "png",
          timeoutInMilliseconds: 120000,
        });
        break;
      } catch (err) {
        if (attempt >= 4) throw err;
        console.log(`frame ${frame}: attempt ${attempt} failed (${String(err).split("\n")[0].slice(0, 120)}), retrying`);
      }
    }
    done++;
    if (done % 50 === 0) console.log(`${done} frames, ${((Date.now() - t0) / done).toFixed(0)} ms/frame`);
  }
};
await Promise.all(Array.from({ length: workers }, worker));
await puppeteerInstance.close({ silent: true });
console.log(`done: ${done} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
