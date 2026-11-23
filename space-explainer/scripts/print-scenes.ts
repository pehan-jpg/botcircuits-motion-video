// Prints built scenes as JSON for scripts/check-video.py.
import { BUILT_SCENES, sceneFrames } from "../src/timeline";
console.log(JSON.stringify(BUILT_SCENES.map((s) => ({ id: s.id, n: s.number, name: s.name, start: s.start, end: s.end, frames: sceneFrames(s.id) }))));
