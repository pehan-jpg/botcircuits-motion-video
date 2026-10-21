// Renders verification stills: midpoint of each scene and each dissolve, plus loop seam frames.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const outDir = process.argv[2] ?? "out/stills";
const frames = {
  "A-airport-mid": 67,
  "AB-dissolve-mid": 125,
  "B-sofa-mid": 182,
  "BC-dissolve-mid": 240,
  "C-hands-mid": 297,
  "CD-dissolve-mid": 355,
  "D-headset-mid": 412,
  "loop-000": 0,
  "loop-472": 472,
  "loop-479": 479,
};

const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "HeroBackground", browserExecutable });
for (const [name, frame] of Object.entries(frames)) {
  await renderStill({ serveUrl, composition, frame, browserExecutable, output: path.join(outDir, `${name}.png`) });
  console.log(name, frame);
}
