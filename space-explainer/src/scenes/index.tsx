import type React from "react";
import type { SceneId } from "../timeline";
import { Scene01Problem } from "./Scene01Problem";
import { Scene02Intro } from "./Scene02Intro";
import { Scene03Chat } from "./Scene03Chat";
import { Scene04Agents } from "./Scene04Agents";
import { Scene05Brain as Scene05 } from "./Scene05Brain";
import { Scene06Playbook as Scene06 } from "./Scene06Playbook";
import { Scene07Evening as Scene07 } from "./Scene07Evening";
import { Scene08Review as Scene08 } from "./Scene08Review";
import { Scene09Records as Scene09 } from "./Scene09Records";
import { Scene10Pages as Scene10 } from "./Scene10Pages";
import { Scene11Contrast as Scene11 } from "./Scene11Contrast";
import { Scene12EndCard as Scene12 } from "./Scene12EndCard";


export { Scene01Problem, Scene02Intro, Scene03Chat, Scene04Agents };

/** Component for each built scene. Add a scene here when a later prompt builds it. */
export const SCENE_COMPONENTS: Partial<Record<SceneId, React.FC>> = {
  S01: Scene01Problem,
  S02: Scene02Intro,
  S03: Scene03Chat,
  S04: Scene04Agents,
  S05: Scene05,
  S06: Scene06,
  S07: Scene07,
  S08: Scene08,
  S09: Scene09,
  S10: Scene10,
  S11: Scene11,
  S12: Scene12,
};
