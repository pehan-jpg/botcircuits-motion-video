import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT_SANS, kf, press, tween} from '../theme';
import {sec} from '../timeline';
import {
  AGENT_CARD,
  AGENT_CARD_AVATAR,
  AGENT_CARD_TITLE,
  AGENT_CHIP,
  AGENT_NAME,
  BUILD_DURATIONS,
  CAM_S5_END,
  PAGE_CENTER,
  PAGE_S6_END,
  PROMPT_SLIM,
} from '../handoff';
import {PromptBar} from '../components/PromptBar';
import {camAt, CamKeys, toScreen, World} from '../components/Stage';
import {typedCount, typingEnd} from '../components/TypingText';
import {AgentCardBody, AgentChip, agentChipHome} from '../components/Agent';
import {AgentAvatar} from '../components/Logo';
import {Cursor} from '../components/Cursor';
import {ProcedureAnim, ProcedurePage, PAGE_TITLE, RowAnim, SECTION_TITLES} from '../components/procedure/ProcedurePage';
import {HEADER, ROWS, TOOLS} from '../components/procedure/layout';
import {Dissolve, Scene05Bg, Scene06Bg} from './backgrounds';
import {ParkedLockup, agentCardState} from './Scene05';

/** SCENE 6 (6 s) "Set the Procedure". */
export const S6_PROMPT = 'Add a procedure to block a lost card.';
export const S6_CAM: CamKeys = {
  t: [0, 0.85, 1.7, 2.2, 2.45, 3.0, 3.3, 3.85, 4.3, 4.6, 5.0, 6.0],
  x: [330, 330, 700, 760, 760, 760, 760, 760, 780, 800, 960, 960],
  y: [215, 215, 330, 420, 450, 450, 470, 470, 700, 760, 540, 540],
  s: [2.2, 2.2, 1.55, 1.45, 1.45, 1.45, 1.42, 1.42, 1.35, 1.3, 1, 1],
};
const ROW_STARTS = [2.4, 3.0, 4.0, 4.3];
const ROW_PER_CHAR = 0.5; // frames per character (fast, jittered)
const SAVE_CLICK = 5.2;

const rowAnim = (f: number, start: number, len: number, hasChip: boolean, seed: string): RowAnim & {end: number} => {
  const S = sec(start);
  const tStart = S + sec(0.15);
  const end = typingEnd(tStart, len, ROW_PER_CHAR) / sec(1); // seconds
  return {
    num: tween(f, start, start + 0.15),
    tag1: tween(f, start + 0.05, start + 0.25),
    tag2: tween(f, start + 0.1, start + 0.3),
    typed: typedCount(f, tStart, len, ROW_PER_CHAR, seed),
    into: hasChip ? tween(f, end + 0.03, end + 0.18) : 0,
    chip: hasChip ? tween(f, end + 0.08, end + 0.28) : 0,
    glow: hasChip ? kf(f, [end + 0.08, end + 0.25, end + 0.75], [0, 1, 0]) : 0,
    sweep: hasChip ? tween(f, end + 0.15, end + 0.55) : 0,
    end,
  };
};

/** Full animation state of the Procedure page at frame f (scene-6 clock). */
export const procedureAnim = (f: number): ProcedureAnim => {
  const rows = ROWS.map((r, i) => rowAnim(f, ROW_STARTS[i], r.text.length, !!r.variable, `row-${r.id}`));
  const r12end = rows[1].end;
  return {
    titleTyped: typedCount(f, sec(1.0), PAGE_TITLE.length, 1.6, 'page-title'),
    pencil: tween(f, 1.45, 1.62),
    tools: [tween(f, 1.45, 1.65), tween(f, 1.5, 1.7), tween(f, 1.55, 1.75), tween(f, 1.6, 1.8)],
    saved: tween(f, SAVE_CLICK + 0.08, SAVE_CLICK + 0.25),
    savedCheck: tween(f, SAVE_CLICK + 0.13, SAVE_CLICK + 0.38),
    savePress: press(f, SAVE_CLICK),
    steps: tween(f, 1.6, 2.0),
    sections: [tween(f, 1.85, 2.15), tween(f, 3.8, 4.1)],
    sectionTyped: [
      typedCount(f, sec(2.0), SECTION_TITLES[0].length, 1.4, 'sec-1'),
      typedCount(f, sec(3.85), SECTION_TITLES[1].length, 1.2, 'sec-2'),
    ],
    rows,
    underline: tween(f, r12end + 0.02, r12end + 0.27),
    person: tween(f, r12end + 0.1, r12end + 0.3),
    flowDraw: tween(f, 4.6, 5.0),
    flowDot: kf(f, [4.75, 5.35], [0, 1]),
    flowDotOpacity: kf(f, [4.75, 4.8, 5.3, 5.45], [0, 1, 1, 0]),
    frameCard: tween(f, 5.5, 5.9),
  };
};

/** Page wrapper transform at the end of the scene (and in scene 7). */
export const pageWrap = (cx: number, cy: number, scale: number): React.CSSProperties => ({
  position: 'absolute',
  left: 0,
  top: 0,
  width: 1920,
  height: 1080,
  transformOrigin: `${PAGE_CENTER.x}px ${PAGE_CENTER.y}px`,
  transform: `translate(${cx - PAGE_CENTER.x}px, ${cy - PAGE_CENTER.y}px) scale(${scale})`,
});

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const Scene06: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = f / fps;
  const cam = camAt(f, S6_CAM);
  const prevEnd = BUILD_DURATIONS.scene05 - 1;

  // ---- prompt bar: type, Enter, then morph into the page header ------------
  const typeStart = sec(0.05);
  const typedUntil = typingEnd(typeStart, S6_PROMPT.length, 1);
  const enter = kf(f, [0.7, 0.78, 0.88], [0, 1, 0]);
  const morph = tween(f, 0.85, 1.25);
  const barBack = tween(f, 5.5, 5.9);

  // ---- agent card -> chip (top-left) ---------------------------------------
  const m = tween(f, 0, 0.8);
  const last = agentCardState(prevEnd);
  const home = agentChipHome();
  const cardTL = toScreen(CAM_S5_END, {x: AGENT_CARD.left, y: AGENT_CARD.top});
  const s0 = CAM_S5_END.scale;
  const sEnd = AGENT_CHIP.height / AGENT_CARD.height;
  const cardTarget = {x: home.cx - (AGENT_CARD.width / 2) * sEnd, y: home.cy - (AGENT_CARD.height / 2) * sEnd};
  const av0 = toScreen(CAM_S5_END, {x: AGENT_CARD.left + AGENT_CARD_AVATAR.cx, y: AGENT_CARD.top + AGENT_CARD_AVATAR.cy});
  const avSize = lerp(AGENT_CARD_AVATAR.size * s0, AGENT_CHIP.avatar, m);
  const av = {x: lerp(av0.x, AGENT_CHIP.left + AGENT_CHIP.pad + AGENT_CHIP.avatar / 2, m), y: lerp(av0.y, AGENT_CHIP.cy, m)};
  const t0 = toScreen(CAM_S5_END, {x: AGENT_CARD.left + AGENT_CARD_TITLE.left, y: AGENT_CARD.top + AGENT_CARD_TITLE.cy});
  const titleScale = lerp(s0, AGENT_CHIP.fontSize / AGENT_CARD_TITLE.fontSize, m);
  const title = {x: lerp(t0.x, AGENT_CHIP.left + AGENT_CHIP.pad + AGENT_CHIP.avatar + AGENT_CHIP.gap, m), y: lerp(t0.y, AGENT_CHIP.cy, m)};

  // ---- page exit (5.5 - 6.0 s) ----------------------------------------------
  const exit = tween(f, 5.5, 5.98);
  const a = procedureAnim(f);

  return (
    <AbsoluteFill>
      <Dissolve
        from={<Scene05Bg seconds={prevEnd / fps} cam={CAM_S5_END} />}
        to={<Scene06Bg seconds={seconds} cam={cam} />}
        progress={tween(f, 0, 0.5)}
      />

      <World cam={cam}>
        <div style={{...pageWrap(lerp(PAGE_CENTER.x, PAGE_S6_END.cx, exit), lerp(PAGE_CENTER.y, PAGE_S6_END.cy, exit), lerp(1, PAGE_S6_END.scale, exit)), opacity: lerp(1, PAGE_S6_END.opacity, exit)}}>
          <ProcedurePage a={a} />
        </div>
      </World>

      <ParkedLockup opacity={1 - tween(f, 0, 0.4)} />

      {/* agent card -> chip morph */}
      {m < 1 ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: lerp(cardTL.x, cardTarget.x, m),
              top: lerp(cardTL.y, cardTarget.y, m),
              transformOrigin: '0 0',
              transform: `scale(${lerp(s0, sEnd, m)})`,
              opacity: 1 - tween(f, 0, 0.5),
            }}
          >
            <AgentCardBody frame={prevEnd + f} flip={last.flip} check={last.check} shine={0} chipIn={1} />
          </div>
          <div style={{position: 'absolute', left: home.cx, top: home.cy, opacity: tween(f, 0.45, 0.8)}}>
            <AgentChip cx={0} cy={0} avatar={0} name={0} />
          </div>
          <AgentAvatar size={avSize} style={{position: 'absolute', left: av.x - avSize / 2, top: av.y - avSize / 2}} />
          <div
            style={{
              position: 'absolute',
              left: title.x,
              top: title.y - AGENT_CARD_TITLE.fontSize * 0.7,
              height: AGENT_CARD_TITLE.fontSize * 1.4,
              display: 'flex',
              alignItems: 'center',
              fontFamily: FONT_SANS,
              fontWeight: 600,
              fontSize: AGENT_CARD_TITLE.fontSize,
              color: COLORS.ink,
              whiteSpace: 'nowrap',
              transformOrigin: '0 50%',
              transform: `scale(${titleScale})`,
            }}
          >
            {AGENT_NAME}
          </div>
        </>
      ) : (
        <AgentChip cx={home.cx} cy={home.cy} />
      )}

      {/* prompt bar (slim): types, submits, stretches into the header; returns at the end */}
      <PromptBar
        state={{
          cx: PROMPT_SLIM.cx,
          cy: PROMPT_SLIM.cy,
          scale: PROMPT_SLIM.scale,
          stretch: f < sec(1.5) ? 1 + 0.9 * morph : 1,
          opacity: f < sec(1.5) ? 1 - tween(f, 0.95, 1.25) : barBack,
          dy: f < sec(1.5) ? 0 : (1 - barBack) * -16,
        }}
        frame={f}
        text={f < sec(1.5) ? S6_PROMPT : ''}
        typeStart={typeStart}
        perChar={1}
        typingUntil={f < sec(1.5) ? typedUntil : sec(5.9)}
        enterPress={enter}
        textOpacity={1 - tween(f, 0.85, 0.95)}
      />

      <Cursor
        frame={f}
        from={{x: 1420, y: 760}}
        to={{x: TOOLS.saveX + TOOLS.saveW / 2 + 10, y: HEADER.cy + 6}}
        moveStart={sec(4.8)}
        moveEnd={sec(5.15)}
        clickAt={sec(SAVE_CLICK)}
        opacity={1 - tween(f, 5.5, 5.8)}
      />
    </AbsoluteFill>
  );
};
