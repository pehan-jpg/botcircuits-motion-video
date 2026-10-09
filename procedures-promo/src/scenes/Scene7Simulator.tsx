import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Stage } from "../components/Stage";
import { Camera } from "../components/Camera";
import { CARD, CONTENT_BOTTOM, ProcedureEditor } from "../components/ProcedureEditor";
import { Simulator } from "../components/Simulator";
import { FULL_VIEW, S7, scene7State, track } from "../editorTimeline";
import { EXPO_OUT, TEXT, ease, pop, typed } from "../theme";

// Split view: editor centred in the left 590px, simulator drawer on the right.
const LEFT_CENTER = 300;
const SPLIT_S = 0.86;
const fxFor = (s: number) => 480 + (480 - LEFT_CENTER) / s;
const TOP_FY = CARD.y + 270 / SPLIT_S;
const BOTTOM_FY = CARD.y + CONTENT_BOTTOM - 270 / SPLIT_S + 10;

const words = (text: string, frame: number, start: number) =>
  Math.floor(ease(frame, [start, start + 26], [0, text.split(" ").length], (t) => t));

// `atFrame` lets the orbit scene show this scene's final frame (Freeze would clamp to its own length).
export const Scene7Simulator: React.FC<{ atFrame?: number }> = ({ atFrame }) => {
  const current = useCurrentFrame();
  const frame = atFrame ?? current;
  const { fps } = useVideoConfig();
  const cam = {
    s: ease(frame, [0, 46], [FULL_VIEW.s, SPLIT_S], EXPO_OUT),
    fx: track(frame, [
      { f: 0, v: 480 },
      { f: 46, v: fxFor(SPLIT_S) },
    ]),
    // Follows the traversal down to step 3.
    fy: track(frame, [
      { f: 0, v: FULL_VIEW.fy },
      { f: 46, v: TOP_FY },
      { f: S7.step3 - 8, v: TOP_FY },
      { f: S7.step3 + 18, v: BOTTOM_FY },
    ]),
  };
  // The input holds customer message 1, then (after reply 2) customer message 2.
  const message = frame < S7.send2 && frame >= S7.type2Start ? TEXT.userMessage2 : TEXT.userMessage;
  const input =
    frame < S7.send
      ? typed(TEXT.userMessage, frame, S7.typeStart, S7.typeFpc)
      : frame >= S7.type2Start && frame < S7.send2
        ? typed(TEXT.userMessage2, frame, S7.type2Start, S7.typeFpc)
        : "";
  // A typing indicator precedes each agent message.
  const typingWindows: [number, number, string][] = [
    [S7.step1 + 6, S7.reply1, "Step 1 · Verifying eligibility…"],
    [S7.step2 + 4, S7.reply2, "Step 2 · Calculating refund…"],
    [S7.step3 + 4, S7.card, "Step 3 · Generating label…"],
  ];
  const win = typingWindows.find(([a, b]) => frame >= a && frame < b);
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
          caretOn: input.length < message.length || Math.floor(frame / 18) % 2 === 0,
          sendPress: (frame >= S7.send - 2 && frame <= S7.send + 6) || (frame >= S7.send2 - 2 && frame <= S7.send2 + 6) ? 1 : 0,
          userBubbles: [pop(frame, S7.send + 2, fps, 14), pop(frame, S7.send2 + 2, fps, 14)],
          typing: win ? ease(frame, [win[0], win[0] + 8], [0, 1]) : 0,
          status: win ? win[2] : "",
          replies: [pop(frame, S7.reply1, fps, 16), pop(frame, S7.reply2, fps, 16)],
          words: [words(TEXT.reply1, frame, S7.reply1), words(TEXT.reply2, frame, S7.reply2)],
          card: pop(frame, S7.card, fps, 15),
          hover: ease(frame, [S7.hover, S7.hover + 18], [0, 1]),
        }}
      />
    </Stage>
  );
};
