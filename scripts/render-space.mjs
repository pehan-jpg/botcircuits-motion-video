// Flags: --loop, --end-mark=symbol, --allow-placeholders, --only=stills,poster,mp4,webm
// Renders SpaceTitleCard: MP4 (H.264), WebM (VP9), poster PNG and stills every 0.25s.
// Guards run during every render (guards: true); any violation fails the render.
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const out = path.join(root, "out");
const stillsDir = path.join(out, "space_stills");


const loop = process.argv.includes("--loop");
const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
const endMark = process.argv.find((a) => a.startsWith("--end-mark="))?.slice(11) ?? "none";
const allowPlaceholders = process.argv.includes("--allow-placeholders");
const publicDir = path.join(root, "public");
const listFiles = (dir, prefix = "") =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
        d.isDirectory() ? listFiles(path.join(dir, d.name), `${prefix}${d.name}/`) : [`${prefix}${d.name}`],
      )
    : [];
const availableFiles = listFiles(publicDir);

// Section 0: official logos must be present before anything renders.
const requiredLogos = ["logos/gmail.webp", "logos/google-sheets.webp", "logos/google-drive.webp", "logos/slack.webp"];
const missing = requiredLogos.filter((f) => !availableFiles.includes(f));
if (missing.length && !allowPlaceholders) {
  console.error(`STOP: official logo files missing: ${missing.map((f) => `public/${f}`).join(", ")}. Add them, or rerun with --allow-placeholders.`);
  process.exit(1);
}
if (endMark === "symbol" && !availableFiles.includes("botcircuits-logo.svg")) {
  console.error("STOP: END_MARK \"symbol\" needs public/botcircuits-logo.svg. Add it first.");
  process.exit(1);
}
for (const f of missing) console.warn(`PLACEHOLDER: public/${f} missing, rendering a named neutral tile.`);
const inputProps = { loop, guards: true, endMark, pageBg: "#FFFFFF", availableFiles, reportedPlaceholders: missing };
console.log(`Logos used: ${requiredLogos.filter((f) => !missing.includes(f)).map((f) => `public/${f}`).join(", ")}`);

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
  fs.rmSync(stillsDir, { recursive: true, force: true });
  fs.mkdirSync(stillsDir, { recursive: true });
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
