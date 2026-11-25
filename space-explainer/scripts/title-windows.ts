// Prints the clean title windows (scene seconds) for Scenes 4 to 10 as JSON:
// from title start until the frame starts rising, only the plate, the glow and the title may show.
import { featureTitleTiming, type TitleVariant } from "../src/components/FeatureTitle";
import { S4_TITLE } from "../src/scenes/Scene04Agents";
import { S5_TITLE } from "../src/scenes/Scene05Brain";
import { S6_TITLE } from "../src/scenes/Scene06Playbook";
import { S7_TITLE } from "../src/scenes/Scene07Evening";
import { S8_TITLE } from "../src/scenes/Scene08Review";
import { S9_TITLE } from "../src/scenes/Scene09Records";
import { S10_TITLE } from "../src/scenes/Scene10Pages";

const specs: [string, string, number, TitleVariant][] = [
  ["Scene04", S4_TITLE, 0.45, "standard"],
  ["Scene05", S5_TITLE, 0.45, "compact"],
  ["Scene06", S6_TITLE, 0.45, "compact"],
  ["Scene07", S7_TITLE, 0.45, "compact"],
  ["Scene08", S8_TITLE, 0.8, "compact"],
  ["Scene09", S9_TITLE, 0.45, "compact"],
  ["Scene10", S10_TITLE, 0.45, "compact"],
];
console.log(JSON.stringify(specs.map(([id, title, start, v]) => ({ id, title, from: start, to: start + featureTitleTiming(title, v).frameRiseStart }))));
