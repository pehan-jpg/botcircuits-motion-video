import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Stage } from "../components/Stage";
import { Camera } from "../components/Camera";
import { CARD, CONTENT_BOTTOM, ProcedureEditor } from "../components/ProcedureEditor";
import { Simulator, flashCurve } from "../components/Simulator";
import { IF_CENTER, S7, scene7State, track } from "../editorTimeline";
import { EXPO_OUT, TEXT, ease, pop, typed } from "../theme";

// Split view: editor centred in the left 600px, simulator drawer on the right.
const LEFT_CENTER = 308;
const SPLIT_S = 0.88;
const fxFor = (s: number) => 480 + (480 - LEFT_CENTER) / s;
const TOP_FY = CARD.y + 270 / SPLIT_S;
const BOTTOM_FY = CARD.y + CONTENT_BOTTOM - 270 / SPLIT_S + 10;

export const Scene7Simulator: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cam = {
    s: ease(frame, [0, 46], [1.6, SPLIT_S], EXPO_OUT),
    fx: track(frame, [
      { f: 0, v: IF_CENTER.x },
      { f: 46, v: fxFor(SPLIT_S) },
    ]),
    // Follows the traversal down to step 3.
    fy: track(frame, [
      { f: 0, v: IF_CENTER.y + 24 },
      { f: 46, v: TOP_FY },
      { f: S7.step3 - 8, v: TOP_FY },
      { f: S7.step3 + 16, v: BOTTOM_FY },
    ]),
  };
  const input = frame < S7.send ? typed(TEXT.userMessage, frame, S7.typeStart, S7.typeFpc) : "";
  const wordCount = TEXT.agentReply.split(" ").length;
  const status =
    frame < S7.step2
      ? "Step 1 · Verifying eligibility…"
      : frame < S7.step3
        ? "Step 2 · Calculating refund…"
        : "Step 3 · Generating return label…";
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
          // Phase 2: a 1.0s typing indicator while step 2 evaluates
          typingDots: frame >= S7.step2 && frame < S7.agentReply ? ease(frame, [S7.step2, S7.step2 + 8], [0, 1]) : 0,
          status,
          agentBubble: frame >= S7.agentReply ? pop(frame, S7.agentReply, fps, 16) : 0,
          agentWords: Math.floor(ease(frame, [S7.agentReply, S7.agentReply + 30], [0, wordCount], (t) => t)),
          button: pop(frame, S7.agentReply + 32, fps, 12),
          allDone: pop(frame, S7.allDone, fps, 9),
          flash: flashCurve(frame, S7.allDone),
          meta: ease(frame, [S7.allDone + 10, S7.allDone + 30], [0, 1]),
        }}
      />
    </Stage>
  );
};
