// Prints every scene's beats (s and 60 fps frames) and the hold each scene achieved.
import { ACHIEVED_HOLDS, SCENES, validateTimeline } from "../src/overlay/config";

validateTimeline();
for (const [key, scene] of Object.entries(SCENES)) {
  console.log(`\n${scene.name}  (hold ${ACHIEVED_HOLDS[key as keyof typeof ACHIEVED_HOLDS].toFixed(3)} s)`);
  for (const [beat, at] of Object.entries(scene.beats)) {
    console.log(`  ${beat.padEnd(12)} ${(at as number).toFixed(3)} s   f${Math.round((at as number) * 60)}@60`);
  }
}
