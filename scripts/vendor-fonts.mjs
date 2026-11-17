// Copies the Google Fonts files listed by @remotion/google-fonts into public/fonts,
// so renders do not depend on reaching fonts.gstatic.com from the browser.
import fs from "node:fs";
import path from "node:path";
import { getInfo as jakartaInfo } from "@remotion/google-fonts/PlusJakartaSans";
import { getInfo as monoInfo } from "@remotion/google-fonts/JetBrainsMono";

const dir = path.resolve(import.meta.dirname, "../public/fonts");
fs.mkdirSync(dir, { recursive: true });

const wanted = [
  [jakartaInfo(), "PlusJakartaSans", ["500", "600"]],
  [monoInfo(), "JetBrainsMono", ["500"]],
];
for (const [info, name, weights] of wanted) {
  for (const w of weights) {
    const url = info.fonts.normal[w].latin;
    const file = path.join(dir, `${name}-${w}-latin.woff2`);
    if (fs.existsSync(file)) continue;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    console.log(`saved ${path.relative(process.cwd(), file)}`);
  }
}
