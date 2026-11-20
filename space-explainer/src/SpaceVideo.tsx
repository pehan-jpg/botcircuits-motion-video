import React from "react";
import { Series } from "remotion";
import { BUILT_SCENES, sceneFrames } from "./timeline";
import { SCENE_COMPONENTS } from "./scenes";

/**
 * The one deliverable: every built scene, in order, back to back.
 * Unbuilt scenes are absent (no placeholders, no gaps). Scenes morph into
 * each other: each first frame matches the previous scene's last frame.
 */
export const SpaceVideo: React.FC = () => (
  <Series>
    {BUILT_SCENES.map((s) => {
      const C = SCENE_COMPONENTS[s.id];
      if (!C)
        throw new Error(
          `${s.id} is marked built but has no component in src/scenes/index.tsx`,
        );
      return (
        <Series.Sequence
          key={s.id}
          name={`${s.number} ${s.name}`}
          durationInFrames={sceneFrames(s.id)}
          premountFor={60}
        >
          <C />
        </Series.Sequence>
      );
    })}
  </Series>
);
