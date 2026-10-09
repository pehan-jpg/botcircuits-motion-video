import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Stage } from "../components/Stage";
import { Camera } from "../components/Camera";
import { ProcedureEditor } from "../components/ProcedureEditor";
import { Simulator, flashCurve } from "../components/Simulator";
import { IF_CENTER, S7, scene7State } from "../editorTimeline";
import { EXPO_OUT, GLIDE, TEXT, ease, pop, typed } from "../theme";

export const Scene7Simulator: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cam = {
    fx: ease(frame, [0, 46], [IF_CENTER.x, 675], GLIDE),
    fy: ease(frame, [0, 46], [IF_CENTER.y + 24, 256], GLIDE),
    s: ease(frame, [0, 46], [1.6, 0.88], EXPO_OUT),
  };
  const input = frame < S7.send ? typed(TEXT.userMessage, frame, S7.typeStart, S7.typeFpc) : "";
  const reveal = Math.floor(ease(frame, [S7.agentReply, S7.agentReply + 30], [0, TEXT.agentReply.split(" ").length], (t) => t));
  return (
    <Stage>
      <Camera cam={cam}>
        <ProcedureEditor s={scene7State(frame, fps)} />
      </Camera>
      <Simulator
        style={{
          translate: `${ease(frame, [12, 42], [300, 0])}px 0px`,
          opacity: ease(frame, [12, 28], [0, 1]),
        }}
        st={{
          frame,
          inputText: input,
          caretOn: input.length < TEXT.userMessage.length || Math.floor(frame / 18) % 2 === 0,
          sendPress: frame >= S7.send - 2 && frame <= S7.send + 6 ? 1 : 0,
          userBubble: pop(frame, S7.send + 2, fps, 14),
          typingDots: frame >= S7.step1 && frame < S7.agentReply ? ease(frame, [S7.step1, S7.step1 + 8], [0, 1]) : 0,
          agentBubble: frame >= S7.agentReply ? pop(frame, S7.agentReply, fps, 16) : 0,
          agentWords: reveal,
          followed: pop(frame, S7.followed, fps, 9),
          flash: flashCurve(frame, S7.followed),
          meta: ease(frame, [S7.executed, S7.executed + 20], [0, 1]),
        }}
      />
    </Stage>
  );
};
