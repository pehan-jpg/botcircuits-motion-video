// Renders HeroOverlay verification stills (and matching raw base-video frames for brightness checks).
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const outDir = process.env.STILLS_DIR ?? "out/overlay-stills";
const frames = (process.argv[2] ?? "0,20,70,120,144,152,160,200,250,294,302,310,340,390,440,456,464,472,500,560,613")
  .split(",")
  .map(Number);
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const chromeMode = process.env.REMOTION_CHROME_MODE ?? "headless-shell";
const chromiumOptions = process.env.REMOTION_GL ? { gl: process.env.REMOTION_GL } : {};

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "HeroOverlay", browserExecutable, chromeMode, chromiumOptions });
for (const frame of frames) {
  const output = path.join(outDir, `f${String(frame).padStart(3, "0")}.png`);
  await renderStill({ serveUrl, composition, frame, browserExecutable, chromeMode, chromiumOptions, output });
  console.log(output);
}
