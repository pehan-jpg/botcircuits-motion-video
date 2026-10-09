import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Stage } from "../components/Stage";
import { Camera } from "../components/Camera";
import { Cursor, CursorKey } from "../components/Cursor";
import { POS, ProcedureEditor, menuItemCenter, pill21Pos, pill3Pos } from "../components/ProcedureEditor";
import { IntroLine } from "./Scene3Introducing";
import { S5, W, menuTimes, scene5Camera, scene5State } from "../editorTimeline";
import { ease } from "../theme";

const pillCenter = (p: { x: number; y: number }) => W(p.x + POS.addPill.w / 2, p.y + POS.addPill.h / 2);
const itemAt = (p: { x: number; y: number }, i: number) => {
  const m = menuItemCenter(p, i);
  return W(m.x, m.y);
};
const addStepAt = (slot: number) => W(POS.stepX + 70, POS.stepY[slot] + POS.stepH / 2);

// Cursor path for picking an item from a menu that opens below `anchor`.
const pickFrom = (click: number, anchor: { x: number; y: number }, item: { x: number; y: number }): CursorKey[] => {
  const m = menuTimes(click);
  return [
    { f: click - 2, ...anchor },
    { f: m.open + 2, ...anchor },
    { f: m.hover, ...item },
    { f: m.select + 6, ...item },
  ];
};

export const Scene5CreateProcedure: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cam = scene5Camera(frame);
  const title = W(POS.title.x + 300, POS.title.y + 18);
  const cond11 = W(POS.c11.x + 50 + 120, POS.c11.y + 25);
  const action = W(POS.c11.x + POS.action.x + 110, POS.c11.y + POS.action.y + 14);
  const handoff = W(POS.c11.x + POS.action.x + 90, POS.c11.y + POS.action.y + POS.action.h + 8 + 2 * 24 + 12);
  const toggle = W(POS.c11.x + POS.toggle.x + 14, POS.c11.y + POS.toggle.y + 8);
  const cond21 = W(POS.c21.x + 130, POS.c21.y + POS.c21Rows[0] + 10);
  const rest = (p: { x: number; y: number }) => ({ x: p.x + 150, y: p.y + 40 });
  const keys: CursorKey[] = [
    { f: 50, x: title.x + 160, y: title.y + 140 },
    { f: S5.title.click - 2, ...title },
    { f: S5.title.end + 4, ...title },
    // Step 1
    { f: S5.step1.click - 2, ...addStepAt(0) },
    { f: S5.step1.click + 8, ...addStepAt(0) },
    { f: S5.cond11.click - 2, ...cond11 },
    { f: S5.cond11.end + 4, ...cond11 },
    ...pickFrom(S5.action.click, action, handoff),
    { f: S5.toggle.click - 2, ...toggle },
    { f: S5.toggle.click + 18, ...toggle },
    // Step 2
    { f: S5.step2.click - 2, ...addStepAt(1) },
    { f: S5.step2.click + 8, ...addStepAt(1) },
    { f: S5.cond.click - 2, ...cond21 },
    { f: S5.cond.end + 4, ...cond21 },
    ...pickFrom(S5.set.pill, pillCenter(pill21Pos(1)), itemAt(pill21Pos(1), S5.set.hover)),
    { f: menuTimes(S5.set.pill).select + 30, ...rest(pillCenter(pill21Pos(1))) },
    { f: S5.set.end, ...rest(pillCenter(pill21Pos(1))) },
    ...pickFrom(S5.calc.pill, pillCenter(pill21Pos(2)), itemAt(pill21Pos(2), S5.calc.hover)),
    { f: menuTimes(S5.calc.pill).select + 30, ...rest(pillCenter(pill21Pos(2))) },
    // Step 3
    { f: S5.pan3 + 30, ...rest(addStepAt(2)) },
    { f: S5.step3.click - 2, ...addStepAt(2) },
    { f: S5.step3.click + 8, ...addStepAt(2) },
    ...pickFrom(S5.api.pill, pillCenter(pill3Pos(0)), itemAt(pill3Pos(0), S5.api.hover)),
    { f: menuTimes(S5.api.pill).select + 30, ...rest(pillCenter(pill3Pos(0))) },
    { f: S5.api.end + 6, ...rest(pillCenter(pill3Pos(0))) },
    ...pickFrom(S5.send.pill, pillCenter(pill3Pos(1)), itemAt(pill3Pos(1), S5.send.hover)),
    { f: menuTimes(S5.send.pill).select + 34, x: pillCenter(pill3Pos(1)).x + 200, y: pillCenter(pill3Pos(1)).y + 90 },
  ];
  const clicks = [
    S5.title.click,
    S5.step1.click,
    S5.cond11.click,
    S5.action.click,
    menuTimes(S5.action.click).select,
    S5.toggle.click,
    S5.step2.click,
    S5.cond.click,
    S5.set.pill,
    menuTimes(S5.set.pill).select,
    S5.calc.pill,
    menuTimes(S5.calc.pill).select,
    S5.step3.click,
    S5.api.pill,
    menuTimes(S5.api.pill).select,
    S5.send.pill,
    menuTimes(S5.send.pill).select,
  ];
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
        <Cursor
          frame={frame}
          opacity={ease(frame, [50, 62], [0, 1]) * ease(frame, [S5.done, S5.done + 14], [1, 0])}
          counterScale={1 / cam.s}
          clicks={clicks}
          keys={keys}
        />
      </Camera>
    </Stage>
  );
};
