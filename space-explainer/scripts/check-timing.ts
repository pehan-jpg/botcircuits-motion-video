// Static checks that need no render:
//  - ReadabilityGuard timing for every text beat in built scenes
//  - timeline consistency (scenes contiguous, 122s total, built scenes have components)
// Usage: npx tsx scripts/check-timing.ts
import { BUILT_FRAMES, BUILT_SCENES, SCENES, TOTAL_SECONDS } from "../src/timeline";
import { checkReadability, type GuardIssue, type TextBeatSpec } from "../src/lib/guards";
import { readHoldSeconds } from "../src/theme";
import { SCENE01_TEXT } from "../src/scenes/Scene01Problem";
import { SCENE02_TEXT, SCENE02_SETTLED } from "../src/scenes/Scene02Intro";
import { SCENE03_TEXT, S3_CURSOR } from "../src/scenes/Scene03Chat";
import { SCENE04_TEXT, S4_CURSOR } from "../src/scenes/Scene04Agents";
import { cursorClickReport } from "../src/components/Cursor";

const issues: GuardIssue[] = [];
const notes: string[] = [];
const report = (scene: string, beats: TextBeatSpec[]) => {
  console.log(`\n${scene}`);
  for (const b of beats) {
    const held = b.leaveAt - b.readyAt;
    const need = readHoldSeconds(b.text);
    const flag = held + 1e-6 >= need ? "ok" : b.carriesOver ? "carries over" : b.exception ? "brief exception" : "SHORT";
    console.log(`  ${b.id.padEnd(12)} ready ${b.readyAt.toFixed(2)}s  held ${held.toFixed(2)}s  needs ${need.toFixed(2)}s  ${String(b.fontPx).padStart(3)}px  ${flag.padEnd(15)} "${b.text.slice(0, 60)}"`);
    if (flag === "carries over") notes.push(`${scene} ${b.id}: on screen at scene end after ${held.toFixed(2)}s of ${need.toFixed(2)}s; the next scene must keep it until the hold is met`);
    if (flag === "brief exception") notes.push(`${scene} ${b.id}: ${b.exception} (held ${held.toFixed(2)}s, guard asks ${need.toFixed(2)}s)`);
    issues.push(...checkReadability(b));
  }
};
report("Scene 1", SCENE01_TEXT);
report("Scene 2", SCENE02_TEXT);
report("Scene 3", SCENE03_TEXT);
report("Scene 4", SCENE04_TEXT);

const s2Len = 5;
const hold = s2Len - SCENE02_SETTLED;
console.log(`\nScene 2 line complete at ${SCENE02_SETTLED.toFixed(2)}s, hold at end ${hold.toFixed(2)}s (needs at least 1.5s)`);
if (hold < 1.5) issues.push({ guard: "timeline", message: "Scene 2 end hold is under 1.5s" });

for (let i = 1; i < SCENES.length; i++) {
  if (SCENES[i].start !== SCENES[i - 1].end)
    issues.push({ guard: "timeline", message: `${SCENES[i].id} starts at ${SCENES[i].start}, previous ends at ${SCENES[i - 1].end}` });
}
if (SCENES[SCENES.length - 1].end !== TOTAL_SECONDS) issues.push({ guard: "timeline", message: "total length mismatch" });
console.log("\nScene start times:");
for (const sc of SCENES) console.log(`  Scene ${String(sc.number).padStart(2)} ${sc.built ? "built  " : "pending"} ${sc.start.toFixed(1).padStart(6)}s to ${sc.end.toFixed(1).padStart(6)}s  (${sc.duration}s)  ${sc.name}`);

console.log("\nCursor clicks (ripple centre against the cursor hotspot, every frame of the ripple):");
for (const [name, keys] of [["Scene 3", S3_CURSOR], ["Scene 4", S4_CURSOR]] as const) {
  for (const c of cursorClickReport(keys)) {
    console.log(`  ${name} click at ${c.t.toFixed(2)}s: worst offset ${c.worst.toFixed(2)}px`);
    if (c.worst > 1) issues.push({ guard: "cursor", message: `${name} click at ${c.t.toFixed(2)}s drifts ${c.worst.toFixed(1)}px from its ripple` });
  }
}
console.log(`Built scenes: ${BUILT_SCENES.map((s) => s.number).join(", ")}; SpaceVideo is ${BUILT_FRAMES} frames (${BUILT_FRAMES / 60}s)`);

if (notes.length) console.log(`\nNotes:\n${notes.map((n) => `  ${n}`).join("\n")}`);
console.log(issues.length ? `\n${issues.length} issue(s):\n${issues.map((i) => `  ${i.guard}: ${i.message}`).join("\n")}` : "\nTiming and timeline checks passed.");
process.exit(issues.length ? 1 : 0);
