// Renders still frames of PaymentsUseCase for review.
// Usage: node scripts/stills.mjs <outDir> <frame> [frame...]
// Set REMOTION_BROWSER to use a specific Chrome binary.
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const [outDir, ...frames] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const composition = await selectComposition({
  serveUrl,
  id: "PaymentsUseCase",
  browserExecutable,
});

for (const f of frames) {
  const output = path.join(outDir, `f${String(f).padStart(4, "0")}.png`);
  await renderStill({
    composition,
    serveUrl,
    output,
    frame: Number(f),
    browserExecutable,
    overwrite: true,
  });
  console.log(output);
}
