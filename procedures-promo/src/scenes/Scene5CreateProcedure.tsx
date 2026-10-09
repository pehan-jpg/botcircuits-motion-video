import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Stage } from "../components/Stage";
import { Camera } from "../components/Camera";
import { Cursor } from "../components/Cursor";
import { POS, ProcedureEditor } from "../components/ProcedureEditor";
import { IntroLine } from "./Scene3Introducing";
import { S5, W, scene5Camera, scene5State } from "../editorTimeline";
import { ease } from "../theme";

export const Scene5CreateProcedure: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cam = scene5Camera(frame);
  const title = W(POS.title.x + 300, POS.title.y + 18);
  return (
    <Stage>
      {/* Scene 3 line dissolves as the camera pushes in */}
      <IntroLine
        frame={400}
        fps={fps}
        style={{
          opacity: ease(frame, [0, 22], [1, 0]),
          scale: String(ease(frame, [0, 30], [1, 1.08])),
          filter: `blur(${ease(frame, [0, 22], [0, 6])}px)`,
        }}
      />
      <Camera cam={cam}>
        <ProcedureEditor s={scene5State(frame, fps)} style={{ opacity: ease(frame, [8, 30], [0, 1]) }} />
        {/* The cursor only opens the title field; the logic then assembles itself. */}
        <Cursor
          frame={frame}
          opacity={ease(frame, [26, 36], [0, 1]) * ease(frame, [S5.title.end + 6, S5.title.end + 18], [1, 0])}
          counterScale={1 / cam.s}
          clicks={[S5.title.click]}
          keys={[
            { f: 26, x: title.x + 140, y: title.y + 120 },
            { f: S5.title.click - 2, ...title },
            { f: S5.title.end + 18, x: title.x + 60, y: title.y + 40 },
          ]}
        />
      </Camera>
    </Stage>
  );
};
