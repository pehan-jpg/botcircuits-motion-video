import React from "react";
import { Composition, Folder } from "remotion";
import { SpaceVideo } from "./SpaceVideo";
import { NightGradeTest } from "./NightGradeTest";
import { BUILT_FRAMES, BUILT_SCENES, sceneFrames } from "./timeline";
import { SCENE_COMPONENTS } from "./scenes";
import { SpaceReel9x16 } from "./reel/SpaceReel9x16";

const W = 1920;
const H = 1080;
const FPS = 60;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="SpaceVideo"
      component={SpaceVideo}
      durationInFrames={BUILT_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />
    <Composition
      id="SpaceReel9x16"
      component={SpaceReel9x16}
      durationInFrames={BUILT_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
    <Folder name="Scenes">
      {BUILT_SCENES.map((s) => (
        <Composition
          key={s.id}
          id={`Scene${String(s.number).padStart(2, "0")}`}
          component={SCENE_COMPONENTS[s.id] as React.FC}
          durationInFrames={sceneFrames(s.id)}
          fps={FPS}
          width={W}
          height={H}
        />
      ))}
    </Folder>
    <Folder name="Tests">
      <Composition
        id="NightGradeTest"
        component={NightGradeTest}
        durationInFrames={600}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{ grade: 0.5, showZones: true }}
      />
    </Folder>
  </>
);
