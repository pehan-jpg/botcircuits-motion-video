import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Stage } from "../components/Stage";
import { Camera } from "../components/Camera";
import { Cursor } from "../components/Cursor";
import { POS, menuItemCenter, pill21Pos, pill3Pos } from "../components/ProcedureEditor";
import { ProcedureEditor } from "../components/ProcedureEditor";
import { IntroLine } from "./Scene3Introducing";
import { S5, W, menuTimes, scene5Camera, scene5State } from "../editorTimeline";
import { ease } from "../theme";

const pillCenter = (p: { x: number; y: number }) => W(p.x + POS.addPill.w / 2, p.y + POS.addPill.h / 2);
const itemAt = (p: { x: number; y: number }, i: number) => {
  const m = menuItemCenter(p, i);
  return W(m.x, m.y);
};

export const Scene5CreateProcedure: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cam = scene5Camera(frame);
  const cond = W(POS.c21.x + 130, POS.c21.y + POS.c21Rows[0] + 10);
  const pill1 = pillCenter(pill21Pos(1));
  const pill2 = pillCenter(pill21Pos(2));
  const pill30 = pillCenter(pill3Pos(0));
  const pill31 = pillCenter(pill3Pos(1));
  const mSet = menuTimes(S5.set.pill);
  const mCalc = menuTimes(S5.calc.pill);
  const mApi = menuTimes(S5.api.pill);
  const mSend = menuTimes(S5.send.pill);
  const rest = (p: { x: number; y: number }) => ({ x: p.x + 150, y: p.y + 40 });
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
          opacity={ease(frame, [100, 112], [0, 1]) * ease(frame, [S5.done, S5.done + 14], [1, 0])}
          counterScale={1 / cam.s}
          clicks={[S5.cond.click, S5.set.pill, mSet.select, S5.calc.pill, mCalc.select, S5.api.pill, mApi.select, S5.send.pill, mSend.select]}
          keys={[
            { f: 100, x: cond.x + 200, y: cond.y + 120 },
            { f: S5.cond.click - 4, ...cond },
            { f: S5.cond.end + 4, ...cond },
            { f: S5.set.pill - 2, ...pill1 },
            { f: mSet.open + 2, ...pill1 },
            { f: mSet.hover, ...itemAt(pill21Pos(1), S5.set.hover) },
            { f: mSet.select + 6, ...itemAt(pill21Pos(1), S5.set.hover) },
            { f: mSet.select + 30, ...rest(pill1) },
            { f: S5.set.end, ...rest(pill1) },
            { f: S5.calc.pill - 2, ...pill2 },
            { f: mCalc.open + 2, ...pill2 },
            { f: mCalc.hover, ...itemAt(pill21Pos(2), S5.calc.hover) },
            { f: mCalc.select + 6, ...itemAt(pill21Pos(2), S5.calc.hover) },
            { f: mCalc.select + 30, ...rest(pill2) },
            { f: S5.pan3 + 30, ...rest(pill30) },
            { f: S5.api.pill - 2, ...pill30 },
            { f: mApi.open + 2, ...pill30 },
            { f: mApi.hover, ...itemAt(pill3Pos(0), S5.api.hover) },
            { f: mApi.select + 6, ...itemAt(pill3Pos(0), S5.api.hover) },
            { f: mApi.select + 30, ...rest(pill30) },
            { f: S5.api.end + 6, ...rest(pill30) },
            { f: S5.send.pill - 2, ...pill31 },
            { f: mSend.open + 2, ...pill31 },
            { f: mSend.hover, ...itemAt(pill3Pos(1), S5.send.hover) },
            { f: mSend.select + 6, ...itemAt(pill3Pos(1), S5.send.hover) },
            { f: mSend.select + 34, x: pill31.x + 200, y: pill31.y + 90 },
          ]}
        />
      </Camera>
    </Stage>
  );
};
