// Usage: node scripts/measure.mjs <CompositionId> <frame> <label substring> [inputPropsJSON]
// Prints guard rects of matching elements (screen px) for that frame.
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { getCompositions, renderStill, openBrowser } from "@remotion/renderer";
const [id, frameS, match, propsJson] = process.argv.slice(2);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const exe = process.env.REMOTION_BROWSER ?? "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const browser = await openBrowser("chrome", { browserExecutable: fs.existsSync(exe) ? exe : null });
const comp = (await getCompositions(serveUrl, { puppeteerInstance: browser })).find((c) => c.id === id);
const inputProps = { guardLog: true, ...(propsJson ? JSON.parse(propsJson) : {}) };
let last = null;
await renderStill({ composition: comp, serveUrl, frame: Number(frameS), output: path.join(root, "out", "measure.png"), puppeteerInstance: browser, inputProps, logLevel: "error",
  onBrowserLog: (l) => { if (l.text.startsWith("[guard]")) last = JSON.parse(l.text.slice(8)); } });
for (const it of last?.items ?? []) if (it.label?.includes(match)) console.log(it.label, JSON.stringify(Object.fromEntries(Object.entries(it.rect).map(([k, v]) => [k, Math.round(v)]))), "font", it.fontPx?.toFixed?.(1));
await browser.close({ silent: true });
