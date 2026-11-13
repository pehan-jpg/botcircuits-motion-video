// Prints the banking stack's translateY at every 60 fps frame through the card entrance and the
// exit, from the same layout code the composition renders, and checks the curve is clean.
import { SCENES } from "../src/overlay/config";
import { grownHeight, stackExit, stackLayout } from "../src/overlay/motion";

const S = SCENES.banking;
const B = S.beats;
const FPS = 60;
const growth = [
  { at: B.step2, grow: S.card.stepGrow },
  { at: B.step3, grow: S.card.stepGrow },
  { at: B.footer, grow: S.card.footerGrow },
];
const yAt = (t: number) => {
  const [q, c] = stackLayout(t, [
    { enter: B.query, height: S.queryHeight },
    { enter: B.card, height: grownHeight(t, S.card.height, growth) },
  ]);
  const x = stackExit(t, B.exit);
  return { query: q.y + x.y, card: c.y + x.y, opacity: x.opacity };
};

const check = (name: string, start: number, duration: number, key: "query" | "card") => {
  const f0 = Math.round(start * FPS) - 1;
  const f1 = Math.round((start + duration) * FPS) + 1;
  const vals: number[] = [];
  console.log(`\n${name}: frames ${f0}–${f1} at ${FPS} fps (${(f0 / FPS).toFixed(3)}–${(f1 / FPS).toFixed(3)} s)`);
  for (let f = f0; f <= f1; f++) {
    const v = yAt(f / FPS);
    vals.push(v[key]);
    console.log(`  f${f}  ${key} y = ${v[key].toFixed(3)} px${key === "query" ? `   opacity ${v.opacity.toFixed(3)}` : ""}`);
  }
  const deltas = vals.slice(1).map((v, i) => v - vals[i]);
  const moving = deltas.filter((d) => Math.abs(d) > 1e-9);
  const sign = Math.sign(moving[0] ?? 0);
  const monotonic = moving.every((d) => Math.sign(d) === sign);
  // Ease-out: per-frame step sizes never grow after the first moving frame (no jitter, no steps).
  const steps = moving.map((d) => Math.abs(d));
  const decreasing = steps.every((s, i) => i === 0 || s <= steps[i - 1] + 1e-9);
  console.log(`  -> ${moving.length} moving frames (${(moving.length / FPS).toFixed(3)} s), monotonic: ${monotonic}, step sizes only shrink (ease-out, no jitter/steps): ${decreasing}`);
};

check("Card entrance (query scrolls up as the card rises)", B.card, 0.4, "query");
check("Card entrance (the card rising into its slot)", B.card, 0.4, "card");
check("Exit (whole stack scrolls up 40px and fades)", B.exit, 0.4, "query");
