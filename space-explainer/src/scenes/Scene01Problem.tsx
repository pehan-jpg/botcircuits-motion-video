import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Clock, Layers } from "lucide-react";
import { EASE, FONT, PRODUCT_THEME_LIGHT as T } from "../theme";
import { sceneById } from "../timeline";
import { PLACEHOLDERS as P } from "../placeholders";
import { ProblemBackdrop } from "../backgrounds/ProblemBackdrop";
import { GuardLayer } from "../components/GuardLayer";
import { SpaceOrb, spaceOrbOuterRadius } from "../components/SpaceOrb";
import { Cursor, cursorPosAt, type CursorKey } from "../components/Cursor";
import { FEATURE_TITLE } from "../components/FeatureTitle";
import {
  attachmentCentre,
  DragStack,
  DRIVE_SEARCH,
  DriveBody,
  driveRowCentre,
  GmailBody,
  sheetRowCentre,
  SheetsBody,
  SLACK_INPUT,
  SLACK_SEND,
  SlackBody,
  SummaryBody,
  TickChip,
  Tray,
  TRAY,
  Win,
} from "../components/desktop/Desktop";
import type { TextBeatSpec } from "../lib/guards";
import { INTRO } from "./shared/intro";

/**
 * Scene 1, "One claim, five places": an employee's screen. The work of
 * preparing one claim for review is spread across Gmail, Drive, a PDF, Sheets
 * and Slack, and gathering it takes the morning. Then the violet orb does the
 * gathering. No people on screen: the cursor is the only actor.
 */
const S = "S01" as const;
const DUR = sceneById(S).duration;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const SMOOTH = (x: number) => x * x * (3 - 2 * x);

/** Scene 1 beats, seconds. */
export const S1 = {
  hudIn: 2.2,
  gmail: 3.4,
  tray: 3.6,
  dragPress: 4.05,
  drop: 4.75,
  drive: 5.0,
  searchClick: 5.3,
  searchType: 5.33,
  results: 5.75,
  rowClick: 6.6,
  pdf: 6.65,
  scroll: [6.68, 6.9],
  highlight: [6.9, 7.05],
  sheets: 7.0,
  rowHover: [7.45, 7.85],
  cellClick: 7.9,
  slack: 8.6,
  slackClick: 8.95,
  slackType: 9.0,
  send: 9.65,
  pullBack: [9.95, 11.2],
  summary: 10.75,
  orbIn: [11.2, 11.7],
  gather: { gmail: 11.5, drive: 11.75, sheets: 12.0, slack: 12.25, tray: 11.5, summary: 12.5 } as Record<string, number>,
  gatherLen: 0.55,
  chips: [12.3, 12.6, 12.9],
  hudOut: [13.9, 14.4],
  orbShrink: [13.6, 14.6],
};
/** Top lines: on screen from, to (swaps blur out and in). */
const LINES: { text: string; from: number; to: number }[] = [
  { text: P.scene1.lines[0], from: 0.0, to: 6.0 },
  { text: P.scene1.lines[1], from: 6.25, to: 11.05 },
  { text: P.scene1.lines[2], from: 11.3, to: S1.hudOut[0] },
];
/** Open tabs, believable steps through the morning, then counted down by the orb. */
const TABS: [number, number][] = [[S1.hudIn, 1], [S1.gmail, 2], [S1.drive, 3], [S1.rowClick, 4], [S1.sheets, 5], [S1.slack, 6], [8.9, 7], [9.2, 8], [10.2, 9], [10.5, 11], [10.8, 14]];
const CLOCK_AT = [S1.hudIn, 4.6, 6.4, 7.5, 8.3, 9.2, 10.4];

const HUD = { taskX: 96, top: 96, lineY: 196, lineScale: 64 / 88 };
const ORB = { x: INTRO.handoffOrb.x, y: INTRO.handoffOrb.y, gatherSize: 300, endSize: INTRO.handoffOrb.size };

/** Camera on the desktop: a focus point (desktop px) brought to the frame centre at zoom z. */
type Cam = { x: number; y: number; z: number };
const CAM: { t: number; c: Cam; lin?: boolean; smooth?: boolean }[] = [
  { t: 0, c: { x: 960, y: 540, z: 1 } },
  { t: 3.4, c: { x: 962, y: 541, z: 1.004 }, lin: true },
  { t: 4.1, c: { x: 620, y: 556, z: 1.28 } },
  { t: 4.35, c: { x: 622, y: 558, z: 1.28 }, lin: true },
  { t: 4.75, c: { x: 600, y: 570, z: 1.24 } },
  { t: 5.05, c: { x: 604, y: 572, z: 1.24 }, lin: true },
  { t: 5.65, c: { x: 840, y: 566, z: 1.4 } },
  { t: 6.95, c: { x: 846, y: 569, z: 1.4 }, lin: true },
  { t: 7.6, c: { x: 1060, y: 616, z: 1.4 } },
  { t: 8.55, c: { x: 1066, y: 619, z: 1.4 }, lin: true },
  { t: 9.2, c: { x: 1280, y: 666, z: 1.4 } },
  { t: 10.0, c: { x: 1284, y: 668, z: 1.4 }, lin: true },
  { t: S1.pullBack[1], c: { x: 960, y: 600, z: 0.9 }, smooth: true },
  { t: 13.4, c: { x: 964, y: 602, z: 0.91 }, lin: true },
  { t: DUR, c: { x: 966, y: 603, z: 0.912 }, lin: true },
];
export const s1CamAt = (t: number): Cam => {
  if (t <= CAM[0].t) return CAM[0].c;
  for (let i = 0; i < CAM.length - 1; i++) {
    const a = CAM[i];
    const b = CAM[i + 1];
    if (t <= b.t) {
      const raw = ramp(t, a.t, b.t);
      // Symmetric ease (zero speed at both ends): the camera never jumps.
      const p = b.lin ? raw : SMOOTH(raw);
      return { x: a.c.x + (b.c.x - a.c.x) * p, y: a.c.y + (b.c.y - a.c.y) * p, z: a.c.z + (b.c.z - a.c.z) * p };
    }
  }
  return CAM[CAM.length - 1].c;
};
const camCss = (c: Cam) => `translate(960px, 540px) scale(${c.z}) translate(${-c.x}px, ${-c.y}px)`;
/** Desktop point under a screen point for camera c. */
const toDesktop = (c: Cam, sx: number, sy: number) => ({ x: c.x + (sx - 960) / c.z, y: c.y + (sy - 540) / c.z });

/** The cursor (desktop px): eased, gently arced moves; a drag carries the attachments to Downloads. */
const at = (p: { x: number; y: number }, t: number, click = false): CursorKey => ({ x: p.x, y: p.y, t, click });
export const S1_CURSOR: CursorKey[] = [
  at({ x: 760, y: 770 }, 3.6),
  at(attachmentCentre(0), S1.dragPress - 0.05),
  at(attachmentCentre(0), S1.dragPress + 0.05),
  at({ x: TRAY.x + 150, y: TRAY.y + 52 }, S1.drop - 0.05),
  at({ x: TRAY.x + 150, y: TRAY.y + 52 }, S1.drop, true),
  at(DRIVE_SEARCH, S1.searchClick - 0.05),
  at(DRIVE_SEARCH, S1.searchClick, true),
  at(driveRowCentre(0), 6.05),
  at(driveRowCentre(1), S1.rowClick - 0.05),
  at(driveRowCentre(1), S1.rowClick, true),
  at(sheetRowCentre(0), S1.rowHover[0]),
  at(sheetRowCentre(1), S1.rowHover[1]),
  at(sheetRowCentre(1), S1.cellClick, true),
  at(SLACK_INPUT, S1.slackClick - 0.05),
  at(SLACK_INPUT, S1.slackClick, true),
  at(SLACK_SEND, S1.send - 0.05),
  at(SLACK_SEND, S1.send, true),
];

const lineHold = (i: number) => {
  const words = LINES[i].text.split(" ").length;
  return (words - 1) * FEATURE_TITLE.stagger + FEATURE_TITLE.wordIn;
};
export const SCENE01_TEXT: TextBeatSpec[] = [
  { id: "line1", text: LINES[0].text, readyAt: LINES[0].from + lineHold(0), leaveAt: LINES[0].to, fontPx: 64 },
  { id: "line2", text: LINES[1].text, readyAt: LINES[1].from + lineHold(1), leaveAt: LINES[1].to, fontPx: 64 },
  { id: "line3", text: LINES[2].text, readyAt: LINES[2].from + lineHold(2), leaveAt: LINES[2].to, fontPx: 64, exception: "Brief: hold at least 1.4s before the closing fade" },
  { id: "task", text: P.scene1.task, readyAt: 3.0, leaveAt: S1.hudOut[0], fontPx: 28 },
];
export const S1_LINE3_HOLD = LINES[2].to - (LINES[2].from + lineHold(2));

/** One top line, words blurring in as in FeatureTitle; `out` blurs it out. */
const Line: React.FC<{ text: string; t: number; out: number }> = ({ text, t, out }) => {
  const words = text.split(" ");
  return (
    <div data-guard="text" data-guard-label={`Line: ${text}`} style={{ fontFamily: FONT.sans, fontWeight: FEATURE_TITLE.weight, fontSize: FEATURE_TITLE.size, letterSpacing: FEATURE_TITLE.tracking, lineHeight: 1.1, color: T.ink, whiteSpace: "nowrap", opacity: 1 - out }}>
      {words.map((w, i) => {
        const p = EASE(ramp(t, i * FEATURE_TITLE.stagger, i * FEATURE_TITLE.stagger + FEATURE_TITLE.wordIn));
        const blur = FEATURE_TITLE.blur * (1 - p) + 12 * out;
        return (
          <React.Fragment key={i}>
            <span style={{ display: "inline-block", opacity: p, filter: blur > 0.05 ? `blur(${blur}px)` : undefined, transform: `translateY(${FEATURE_TITLE.rise * (1 - p) - 16 * out}px)` }}>{w}</span>
            {i < words.length - 1 ? " " : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Chip: React.FC<{ children: React.ReactNode; label: string; style?: React.CSSProperties }> = ({ children, label, style }) => (
  <div data-guard="text" data-guard-min="24" data-guard-label={label} style={{ display: "flex", alignItems: "center", gap: 10, height: 52, padding: "0 20px", borderRadius: 14, background: "#FFFFFF", boxShadow: "0 10px 30px rgba(20,24,60,0.12)", fontFamily: FONT.sans, fontSize: 24, fontWeight: 600, color: T.ink, whiteSpace: "nowrap", ...style }}>
    {children}
  </div>
);

export const Scene01Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const F = (s: number) => Math.round(s * fps);
  const cam = s1CamAt(t);
  const appear = (a: number) => EASE(ramp(t, a, a + 0.35));
  const target = toDesktop(cam, ORB.x, ORB.y);
  // Only the window in focus is meant to be read; the others are background for the guards.
  const focusWin = t < S1.drive ? "gmail" : t < S1.sheets ? "drive" : t < S1.slack ? "sheets" : t < S1.pullBack[0] ? "slack" : "none";
  const bg = (k: string) => focusWin !== k;
  const gather = (k: string) => SMOOTH(ramp(t, S1.gather[k], S1.gather[k] + S1.gatherLen));

  // HUD: task card and chips rise in, then fade and blur out together with the line and chips.
  const hudIn = EASE(ramp(t, S1.hudIn, S1.hudIn + 0.8));
  const hudOut = EASE(ramp(t, S1.hudOut[0], S1.hudOut[1]));
  const tabsCount = t >= 11.5 ? Math.round(14 * (1 - ramp(t, 11.5, 12.8))) : TABS.reduce((n, [a, v]) => (t >= a ? v : n), 1);
  const clockIdx = CLOCK_AT.reduce((n, a, i) => (t >= a ? i : n), 0);
  const clockSwap = ramp(t, CLOCK_AT[clockIdx], CLOCK_AT[clockIdx] + 0.25);
  const clockOut = EASE(ramp(t, 12.6, 13.0));

  // Top line: centred at 88px, then glides up and shrinks to 64px at the top centre.
  const glide = EASE(ramp(t, S1.hudIn, S1.hudIn + 1.2));
  const lineY = 540 + (HUD.lineY - 540) * glide;
  const lineS = 1 + (HUD.lineScale - 1) * glide;
  const active = LINES.findIndex((l, i) => t >= l.from && (t < l.to + 0.3 || (i === LINES.length - 1 && t < S1.hudOut[1])));

  // Gmail drag: the attachments follow the cursor to Downloads.
  const dragging = t >= S1.dragPress && t < S1.drop;
  const cur = cursorPosAt(S1_CURSOR, t);
  const lift = EASE(ramp(t, S1.dragPress, S1.dragPress + 0.2)) * (t < S1.drop ? 1 : 1);
  const cursorO = EASE(ramp(t, 3.6, 3.85)) * (1 - EASE(ramp(t, 10.0, 10.35)));

  // Orb: rises in the centre at 300px, gathers the windows, then settles to Scene 2's size.
  const orbIn = EASE(ramp(t, S1.orbIn[0], S1.orbIn[1]));
  const shrink = EASE(ramp(t, S1.orbShrink[0], S1.orbShrink[1]));
  const orbSize = ORB.gatherSize + (ORB.endSize - ORB.gatherSize) * shrink;
  const orbR = spaceOrbOuterRadius(orbSize, true);
  const orbDy = (1 - orbIn) * 50;

  return (
    <AbsoluteFill style={{ width: 1920, height: 1080 }}>
      <ProblemBackdrop timeOffset={sceneById(S).start} />

      {/* Desktop under the camera */}
      <AbsoluteFill style={{ transform: camCss(cam), transformOrigin: "0 0" }}>
        <Win k="summary" background={bg("summary")} appear={appear(S1.summary)} gather={gather("summary")} to={target}>
          <SummaryBody caret={t % 1.1 < 0.6 ? 0.7 : 0} />
        </Win>
        <Tray background={focusWin !== "gmail"} appear={appear(S1.tray)} count={t >= S1.drop ? 4 : 0} gather={gather("tray")} to={target} />
        <Win k="gmail" background={bg("gmail")} appear={appear(S1.gmail)} gather={gather("gmail")} to={target}>
          <GmailBody lift={lift} />
        </Win>
        <Win k="drive" background={bg("drive")} appear={appear(S1.drive)} gather={gather("drive")} to={target}>
          <DriveBody
            typeStart={t >= S1.searchType ? F(S1.searchType) : null}
            results={EASE(ramp(t, S1.results, S1.results + 0.2))}
            pressed={Math.max(0, 1 - Math.abs(t - S1.rowClick) / 0.2)}
            pdf={EASE(ramp(t, S1.pdf, S1.pdf + 0.15))}
            scroll={SMOOTH(ramp(t, S1.scroll[0], S1.scroll[1]))}
            highlight={EASE(ramp(t, S1.highlight[0], S1.highlight[1]))}
          />
        </Win>
        <Win k="sheets" background={bg("sheets")} appear={appear(S1.sheets)} gather={gather("sheets")} to={target}>
          <SheetsBody hover={t < S1.rowHover[0] ? -5 : SMOOTH(ramp(t, S1.rowHover[0], S1.rowHover[1]))} select={EASE(ramp(t, S1.cellClick, S1.cellClick + 0.15))} />
        </Win>
        <Win k="slack" background={bg("slack")} appear={appear(S1.slack)} gather={gather("slack")} to={target} badge={t >= 8.7 ? Math.max(1, Math.round(P.scene1.slack.unread * ramp(t, 8.7, 9.9))) : 0}>
          <SlackBody
            focus={EASE(ramp(t, S1.slackClick, S1.slackClick + 0.15))}
            typeStart={t >= S1.slackType ? F(S1.slackType) : null}
            sent={EASE(ramp(t, S1.send + 0.05, S1.send + 0.35))}
            typing={EASE(ramp(t, S1.send + 0.45, S1.send + 0.7))}
            pulse={t}
          />
        </Win>
        {dragging ? <DragStack x={cur.x} y={cur.y} opacity={EASE(ramp(t, S1.dragPress, S1.dragPress + 0.12))} /> : null}
        {cursorO > 0 ? <Cursor keys={S1_CURSOR} opacity={cursorO} ripple="neutral" /> : null}
      </AbsoluteFill>

      {/* Task card, top left */}
      {hudIn > 0 && hudOut < 1 ? (
        <div style={{ position: "absolute", left: HUD.taskX, top: HUD.top, opacity: hudIn * (1 - hudOut), filter: hudOut > 0.02 ? `blur(${10 * hudOut}px)` : undefined, transform: `translateY(${(1 - hudIn) * 24}px)` }}>
          <Chip label="Task card">
            <span style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${T.secondary}`, boxSizing: "border-box" }} />
            {P.scene1.task}
          </Chip>
        </div>
      ) : null}
      {/* Status chips, top right */}
      {hudIn > 0 && hudOut < 1 ? (
        <div style={{ position: "absolute", right: 96, top: HUD.top, display: "flex", gap: 12, opacity: hudIn, transform: `translateY(${(1 - hudIn) * 24}px)` }}>
          <div style={{ opacity: 1 - hudOut, filter: hudOut > 0.02 ? `blur(${10 * hudOut}px)` : undefined }}>
            <Chip label="Open tabs">
              <Layers size={22} color={T.secondary} />
              Open tabs <span style={{ display: "inline-block", minWidth: 28, textAlign: "right" }}>{tabsCount}</span>
            </Chip>
          </div>
          <div style={{ opacity: 1 - clockOut }}>
            <Chip label="Clock" style={{ minWidth: 168 }}>
              <Clock size={22} color={T.secondary} />
              <span style={{ display: "inline-block", opacity: 0.4 + 0.6 * clockSwap, transform: `translateY(${(1 - clockSwap) * 6}px)` }}>{P.scene1.clocks[clockIdx]}</span>
            </Chip>
          </div>
        </div>
      ) : null}

      {/* Top line with a soft light behind it */}
      {active >= 0 ? (
        <>
          <div style={{ position: "absolute", left: 960 - 760 * lineS, top: lineY - 220 * lineS, width: 1520 * lineS, height: 440 * lineS, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,255,255,0.6), rgba(255,255,255,0.35) 45%, rgba(255,255,255,0) 100%)", opacity: 1 - hudOut }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: lineY, display: "flex", justifyContent: "center", transform: `translateY(-50%) scale(${lineS})`, transformOrigin: "50% 50%" }}>
            <Line text={LINES[active].text} t={t - LINES[active].from} out={active < LINES.length - 1 ? EASE(ramp(t, LINES[active].to, LINES[active].to + 0.3)) : hudOut} />
          </div>
        </>
      ) : null}

      {/* The orb gathers the work */}
      {orbIn > 0 ? (
        <div style={{ position: "absolute", left: ORB.x - orbR, top: ORB.y - orbR + orbDy, width: orbR * 2, height: orbR * 2, display: "flex", alignItems: "center", justifyContent: "center", opacity: orbIn }}>
          <SpaceOrb size={orbSize} ticks pulse timeOffset={sceneById(S).start} />
        </div>
      ) : null}
      {P.scene1.chips.map((c, i) => {
        const pos = [{ x: 540, y: 560 }, { x: 1380, y: 450 }, { x: 1300, y: 790 }][i];
        const a = EASE(ramp(t, S1.chips[i], S1.chips[i] + 0.3));
        return (
          <div key={c} style={{ opacity: 1 - hudOut, filter: hudOut > 0.02 ? `blur(${10 * hudOut}px)` : undefined }}>
            <TickChip label={c} x={pos.x} y={pos.y} appear={a} />
          </div>
        );
      })}

      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};
