// Renders ConciergeTitleCard: MP4, WebM, poster and stills every 0.25s.
// Guards are on, so any safe area or readability violation fails the render.
// Flags: --loop, --end-mark=symbol, --stills-only.
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "out");
const stillsDir = path.join(out, "concierge_stills");
fs.mkdirSync(stillsDir, { recursive: true });

const args = new Set(process.argv.slice(2));
const loop = args.has("--loop");
const only = (name) => !args.has("--stills-only") || name === "stills";
const endMark = args.has("--end-mark=symbol") ? "symbol" : "none";
const inputProps = { loop, endMark, guards: true };

// Use the pre-installed headless shell when present (no download needed).
const localShell =
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const browserExecutable = process.env.REMOTION_BROWSER ?? (fs.existsSync(localShell) ? localShell : null);

const chromiumOptions = { enableMultiProcessOnLinux: true };
const log = (m) => console.log(`[render:concierge] ${m}`);

// Brand file check before bundling: the official WhatsApp logo must be present and intact.
const logoPath = path.join(root, "public/logos/whatsapp.svg");
if (!fs.existsSync(logoPath)) {
  throw new Error("[render:concierge] public/logos/whatsapp.svg is missing (see public/logos/SOURCES.md)");
}
const logoSvg = fs.readFileSync(logoPath, "utf8");
if (!/^\s*(<\?xml[^>]*>\s*)?<svg[\s>]/i.test(logoSvg) || !/viewBox\s*=\s*"[^"]+"/i.test(logoSvg)) {
  throw new Error("[render:concierge] public/logos/whatsapp.svg is not a valid SVG with a viewBox");
}
if (!/#(57d163|23b33a|25d366)/i.test(logoSvg)) {
  throw new Error("[render:concierge] public/logos/whatsapp.svg does not contain the WhatsApp brand green");
}

log("bundling");
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public") });
const composition = await selectComposition({ serveUrl, id: "ConciergeTitleCard", inputProps, browserExecutable, chromiumOptions });
log(`${composition.width}x${composition.height} @ ${composition.fps} fps, ${composition.durationInFrames} frames`);

const common = { composition, serveUrl, inputProps, browserExecutable, chromiumOptions, imageFormat: "png" };

if (only("mp4")) {
  log("rendering MP4 (H.264, CRF 16, yuv420p, veryfast)");
  await renderMedia({
    ...common,
    codec: "h264",
    crf: 16,
    pixelFormat: "yuv420p",
    x264Preset: "veryfast",
    outputLocation: path.join(out, "concierge_title_card.mp4"),
  });
}

if (only("webm")) {
  log("rendering WebM (VP9)");
  await renderMedia({
    ...common,
    codec: "vp9",
    crf: 20,
    pixelFormat: "yuv420p",
    outputLocation: path.join(out, "concierge_title_card.webm"),
  });
}

if (only("poster")) {
  log("rendering poster (last frame)");
  await renderStill({
    composition,
    serveUrl,
    inputProps,
    browserExecutable,
    frame: composition.durationInFrames - 1,
    imageFormat: "png",
    output: path.join(out, "concierge_title_card_poster.png"),
  });
}

const step = Math.round(composition.fps * 0.25);
const frames = [];
for (let f = 0; f < composition.durationInFrames; f += step) frames.push(f);
log(`rendering ${frames.length} stills every 0.25s`);
for (const frame of frames) {
  const name = `still_${String(frame).padStart(3, "0")}_${(frame / composition.fps).toFixed(2)}s.png`;
  await renderStill({ composition, serveUrl, inputProps, browserExecutable, chromiumOptions, frame, imageFormat: "png", output: path.join(stillsDir, name) });
}
log("done");
