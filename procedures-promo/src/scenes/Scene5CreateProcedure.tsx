import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Stage } from "../components/Stage";
import { Camera } from "../components/Camera";
import { Cursor } from "../components/Cursor";
import { CARD, POS, ProcedureEditor } from "../components/ProcedureEditor";
import { FeatureTitle } from "./Scene4FeatureName";
import { S5, W, scene5Camera, scene5State } from "../editorTimeline";
import { ease } from "../theme";

export const Scene5CreateProcedure: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cam = scene5Camera(frame);
  const title = W(POS.title.x + 300, POS.title.y + 18);
  return (
    <Stage>
      {/* Feature name dissolves as the camera pushes in */}
      <FeatureTitle
        frame={200}
        style={{
          opacity: ease(frame, [0, 22], [1, 0]),
          scale: String(ease(frame, [0, 30], [1, 1.08])),
          filter: `blur(${ease(frame, [0, 22], [0, 6])}px)`,
        }}
      />
      <Camera cam={cam}>
        <ProcedureEditor s={scene5State(frame, fps)} style={{ opacity: ease(frame, [8, 30], [0, 1]) }} />
        <Cursor
          frame={frame}
          opacity={ease(frame, [44, 56], [0, 1]) * ease(frame, [S5.cascade + 20, S5.cascade + 36], [1, 0])}
          counterScale={1 / cam.s}
          clicks={[S5.titleClick]}
          keys={[
            { f: 44, x: CARD.x + 560, y: CARD.y + 400 },
            { f: 70, x: title.x, y: title.y },
            { f: S5.cascade, x: title.x, y: title.y },
            { f: S5.cascade + 36, x: title.x + 160, y: title.y + 120 },
          ]}
        />
      </Camera>
    </Stage>
  );
};
