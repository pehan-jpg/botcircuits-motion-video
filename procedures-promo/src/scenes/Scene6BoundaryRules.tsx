import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Stage } from "../components/Stage";
import { Camera } from "../components/Camera";
import { Cursor } from "../components/Cursor";
import { POS, ProcedureEditor } from "../components/ProcedureEditor";
import { IF_CENTER, S6, W, scene6State } from "../editorTimeline";
import { EXPO_OUT, GLIDE, ease } from "../theme";

export const Scene6BoundaryRules: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cam = {
    fx: ease(frame, [0, 54], [480, IF_CENTER.x], GLIDE),
    fy: ease(frame, [0, 54], [256, IF_CENTER.y + 24], GLIDE),
    s: ease(frame, [0, 60], [1, 1.6], EXPO_OUT),
  };
  const ifX = POS.ifCard.x;
  const ifY = POS.ifCard.y;
  const action = W(ifX + POS.action.x + 110, ifY + POS.action.y + 14);
  const option = W(ifX + POS.action.x + 90, ifY + POS.action.y + POS.action.h + 8 + 2 * 24 + 12);
  const toggle = W(ifX + POS.toggle.x + 14, ifY + POS.toggle.y + 8);
  return (
    <Stage>
      <Camera cam={cam}>
        <ProcedureEditor s={scene6State(frame, fps)} />
        <Cursor
          frame={frame}
          opacity={ease(frame, [66, 76], [0, 1])}
          counterScale={1 / cam.s}
          clicks={[S6.actionClick, S6.optionClick, S6.toggleClick]}
          keys={[
            { f: 66, x: action.x + 90, y: action.y + 70 },
            { f: 94, x: action.x, y: action.y },
            { f: 110, x: action.x, y: action.y },
            { f: 130, x: option.x, y: option.y },
            { f: 146, x: option.x, y: option.y },
            { f: 172, x: toggle.x, y: toggle.y },
            { f: 206, x: toggle.x, y: toggle.y },
            { f: 250, x: toggle.x + 70, y: toggle.y + 60 },
          ]}
        />
      </Camera>
    </Stage>
  );
};
