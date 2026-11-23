import type React from "react";
import type { SceneId } from "../timeline";
import { Scene01Problem } from "./Scene01Problem";
import { Scene02Intro } from "./Scene02Intro";
import { Scene03Chat } from "./Scene03Chat";
import { Scene04Agents } from "./Scene04Agents";

export { Scene01Problem, Scene02Intro, Scene03Chat, Scene04Agents };

/** Component for each built scene. Add a scene here when a later prompt builds it. */
export const SCENE_COMPONENTS: Partial<Record<SceneId, React.FC>> = {
  S01: Scene01Problem,
  S02: Scene02Intro,
  S03: Scene03Chat,
  S04: Scene04Agents,
};
