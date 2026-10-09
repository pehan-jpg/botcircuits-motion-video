import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Stage } from "../components/Stage";
import { Camera } from "../components/Camera";
import { Cursor } from "../components/Cursor";
import { CARD, POS, ProcedureEditor } from "../components/ProcedureEditor";
import { FeatureTitle } from "./Scene4FeatureName";
import { S5, W, scene5State } from "../editorTimeline";
import { ease } from "../theme";

export const Scene5CreateProcedure: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = ease(frame, [8, 60], [0.8, 1]);
  const title = W(POS.title.x + 260, POS.title.y + 18);
  const instr = W(POS.instr.x + 150, POS.instr.y + 26);
  const add = W(POS.addPill.x + 64, POS.addPill.y + 13);
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
      <Camera cam={{ fx: 480, fy: 270, s }}>
        <ProcedureEditor
          s={scene5State(frame, fps)}
          style={{ opacity: ease(frame, [8, 30], [0, 1]) }}
        />
        <Cursor
          frame={frame}
          opacity={ease(frame, [44, 56], [0, 1])}
          counterScale={1 / s}
          clicks={[S5.titleClick, S5.instrClick, S5.addClick]}
          keys={[
            { f: 44, x: CARD.x + 560, y: CARD.y + 400 },
            { f: 70, x: title.x, y: title.y },
            { f: 134, x: title.x, y: title.y },
            { f: 160, x: instr.x, y: instr.y },
            { f: 268, x: instr.x, y: instr.y },
            { f: 296, x: add.x, y: add.y },
            { f: 312, x: add.x, y: add.y },
            { f: 350, x: add.x + 220, y: add.y + 150 },
          ]}
        />
      </Camera>
    </Stage>
  );
};
