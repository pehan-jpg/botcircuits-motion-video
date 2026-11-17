// Renders SpaceTitleCard: MP4 (H.264), WebM (VP9), poster PNG and stills every 0.25s.
// Guards run during every render (guards: true); any violation fails the render.
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const out = path.join(root, "out");
const stillsDir = path.join(out, "space_stills");
fs.mkdirSync(stillsDir, { recursive: true });

const loop = process.argv.includes("--loop");
const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
const inputProps = {
  loop,
  guards: true,
  logoAvailable: fs.existsSync(path.join(root, "public", "botcircuits-logo.svg")),
  wordmarkAvailable: fs.existsSync(path.join(root, "public", "botcircuits-wordmark.svg")),
};
for (const [k, f] of [["logoAvailable", "botcircuits-logo.svg"], ["wordmarkAvailable", "botcircuits-wordmark.svg"]]) {
  if (!inputProps[k]) console.warn(`WARNING: public/${f} missing, rendering a labelled placeholder.`);
}

const serveUrl = await bundle({ entryPoint: path.join(root, "src", "index.ts") });
// Uses a locally installed headless shell when REMOTION_BROWSER is set or a known path exists.
// The full Chromium build (new headless) trusts the system certificate store.
const knownChrome = "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome";
const browserExecutable = process.env.REMOTION_BROWSER || (fs.existsSync(knownChrome) ? knownChrome : null);
const chromeMode = browserExecutable ? "chrome-for-testing" : "headless-shell";
const puppeteerInstance = await openBrowser("chrome", { browserExecutable, chromeMode });
const composition = await selectComposition({ serveUrl, chromeMode, browserExecutable, id: "SpaceTitleCard", inputProps, puppeteerInstance });
console.log(`Composition: ${composition.width}x${composition.height}, ${composition.fps} fps, ${composition.durationInFrames} frames`);

const common = { composition, serveUrl, inputProps, puppeteerInstance, browserExecutable, chromeMode, muted: true, logLevel: "warn" };
const step = (name) => !only || only.split(",").includes(name);

if (step("stills")) {
  const every = Math.round(composition.fps * 0.25);
  for (let f = 0; f < composition.durationInFrames; f += every) {
    const t = (f / composition.fps).toFixed(2).padStart(5, "0");
    await renderStill({ ...common, frame: f, output: path.join(stillsDir, `space_${t}s_f${String(f).padStart(3, "0")}.png`) });
  }
  console.log("Stills done");
}
if (step("poster")) {
  await renderStill({ ...common, frame: composition.durationInFrames - 1, output: path.join(out, "space_title_card_poster.png") });
  console.log("Poster done");
}
if (step("mp4")) {
  await renderMedia({
    ...common,
    codec: "h264",
    crf: 16,
    pixelFormat: "yuv420p",
    x264Preset: "veryfast",
    colorSpace: "bt709",
    outputLocation: path.join(out, "space_title_card.mp4"),
  });
  console.log("MP4 done");
}
if (step("webm")) {
  await renderMedia({ ...common, codec: "vp9", outputLocation: path.join(out, "space_title_card.webm") });
  console.log("WebM done");
}
await puppeteerInstance.close({ silent: true });
