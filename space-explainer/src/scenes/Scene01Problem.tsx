import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
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
  logoPoint,
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
  type WinKey,
} from "../components/desktop/Desktop";
import type { TextBeatSpec } from "../lib/guards";
import { INTRO } from "./shared/intro";

/**
 * Scene 1, "One claim, five places": an employee's screen. It opens straight
 * on the work: Gmail, Drive and the policy PDF, Sheets and Slack, tabs and
 * clock climbing. Then the windows collapse into the violet orb, which does
 * the work. No people on screen: the cursor is the only actor.
 */
const S = "S01" as const;
const DUR = sceneById(S).duration;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const SMOOTH = (x: number) => x * x * (3 - 2 * x);

/** Scene 1 beats, seconds. */
export const S1 = {
  hudIn: [0.0, 0.9],
  gmail: 0.3,
  tray: 0.6,
  dragPress: 2.3,
  drop: 3.2,
  drive: 4.2,
  searchClick: 4.7,
  searchType: 4.73,
  results: 5.15,
  rowClick: 6.4,
  pdf: 6.5,
  scroll: [6.55, 6.95],
  highlight: [6.95, 7.15],
  sheets: 7.6,
  rowHover: [8.3, 8.85],
  cellClick: 9.0,
  slack: 10.2,
  slackClick: 10.65,
  slackType: 10.7,
  send: 11.5,
  pullBack: [12.3, 13.6],
  summary: 12.9,
  hudOut: [13.6, 14.0],
  gather: { gmail: 14.0, drive: 14.1, sheets: 14.2, slack: 14.3 } as Record<string, number>,
  gatherLen: 0.7,
  glow: [14.4, 15.2],
  orbIn: [14.9, 15.6],
  tabsDown: [14.0, 15.0],
  tabsOut: [15.1, 15.5],
  line2: 15.4,
  chips: [15.3, 15.8, 16.3, 16.8],
  endOut: [18.35, 18.75],
  orbShrink: [18.3, 18.95],
};
/** Top lines: the first at 5.0s, the second after the morph. */
const LINES = [
  { text: P.scene1.lines[0], from: 5.0, to: S1.hudOut[0] },
  { text: P.scene1.lines[1], from: S1.line2, to: S1.endOut[0] },
];
const TABS: [number, number][] = [[0, 1], [1.2, 2], [S1.drive, 3], [S1.rowClick, 4], [S1.sheets, 5], [S1.slack, 6], [10.6, 7], [11.0, 8], [12.7, 9], [13.0, 11], [13.3, 14]];
const CLOCK_AT = [0, 2.6, 5.6, 8.5, 9.6, 11.0, 13.0];

const HUD = { left: 120, top: 104, lineY: 204 };
const ORB = { x: INTRO.handoffOrb.x, y: INTRO.handoffOrb.y, size: 300, endSize: INTRO.handoffOrb.size };
const ORDER: WinKey[] = ["gmail", "drive", "sheets", "slack"];
const ROT: Record<string, number> = { gmail: -7, drive: 5, sheets: -4, slack: 6 };

/** Camera on the desktop: a focus point (desktop px) brought to the frame centre at zoom z. */
type Cam = { x: number; y: number; z: number };
const CAM: { t: number; c: Cam; lin?: boolean }[] = [
  { t: 0, c: { x: 616, y: 552, z: 1.26 } },
  { t: 2.0, c: { x: 620, y: 556, z: 1.28 }, lin: true },
  { t: 2.6, c: { x: 600, y: 570, z: 1.24 } },
  { t: 4.2, c: { x: 604, y: 572, z: 1.24 }, lin: true },
  { t: 4.95, c: { x: 840, y: 566, z: 1.4 } },
  { t: 7.6, c: { x: 846, y: 570, z: 1.4 }, lin: true },
  { t: 8.35, c: { x: 1060, y: 616, z: 1.4 } },
  { t: 10.2, c: { x: 1066, y: 619, z: 1.4 }, lin: true },
  { t: 10.95, c: { x: 1280, y: 666, z: 1.4 } },
  { t: S1.pullBack[0], c: { x: 1284, y: 668, z: 1.4 }, lin: true },
  { t: S1.pullBack[1], c: { x: 960, y: 600, z: 0.9 } },
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
const toDesktop = (c: Cam, sx: number, sy: number) => ({ x: c.x + (sx - 960) / c.z, y: c.y + (sy - 540) / c.z });
const toScreen = (c: Cam, p: { x: number; y: number }) => ({ x: 960 + c.z * (p.x - c.x), y: 540 + c.z * (p.y - c.y) });

/** The cursor (desktop px): eased, gently arced moves; a drag carries the attachments to Downloads. */
const at = (p: { x: number; y: number }, t: number, click = false): CursorKey => ({ x: p.x, y: p.y, t, click });
export const S1_CURSOR: CursorKey[] = [
  at({ x: 760, y: 720 }, 1.2),
  at(attachmentCentre(0), S1.dragPress - 0.05),
  at(attachmentCentre(0), S1.dragPress + 0.05),
  at({ x: TRAY.x + 150, y: TRAY.y + 52 }, S1.drop - 0.05),
  at({ x: TRAY.x + 150, y: TRAY.y + 52 }, S1.drop, true),
  at(DRIVE_SEARCH, S1.searchClick - 0.05),
  at(DRIVE_SEARCH, S1.searchClick, true),
  at(driveRowCentre(0), 5.7),
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

const lineIn = (text: string) => (text.split(" ").length - 1) * FEATURE_TITLE.stagger + FEATURE_TITLE.wordIn;
/** Time at which the complete closing frame (orb, four chips, line) is on screen. */
export const S1_COMPLETE_AT = Math.max(S1.chips[3] + 0.3, S1.line2 + lineIn(LINES[1].text));
export const S1_COMPLETE_HOLD = S1.endOut[0] - S1_COMPLETE_AT;
export const S1_LINE3_HOLD = S1_COMPLETE_HOLD;
export const SCENE01_TEXT: TextBeatSpec[] = [
  { id: "line1", text: LINES[0].text, readyAt: LINES[0].from + lineIn(LINES[0].text), leaveAt: LINES[0].to, fontPx: 64 },
  { id: "line2", text: LINES[1].text, readyAt: LINES[1].from + lineIn(LINES[1].text), leaveAt: LINES[1].to, fontPx: 64, exception: "Brief: the line reveals at 15.4s and the complete frame holds 1.2s before 18.2s" },
  { id: "chips", text: P.scene1.chips.join(" "), readyAt: S1_COMPLETE_AT, leaveAt: S1.endOut[0], fontPx: 28, exception: "Brief: hold the complete frame at least 1.2s" },
  { id: "task", text: P.scene1.task, readyAt: 0.9, leaveAt: S1.hudOut[0], fontPx: 24, ui: true },
];

/** A top line, words blurring in as in FeatureTitle, at 64px. */
const Line: React.FC<{ text: string; t: number; out: number }> = ({ text, t, out }) => {
  const words = text.split(" ");
  return (
    <div data-guard="text" data-guard-label={`Line: ${text}`} style={{ fontFamily: FONT.sans, fontWeight: FEATURE_TITLE.weight, fontSize: 64, letterSpacing: FEATURE_TITLE.tracking, lineHeight: 1.1, color: T.ink, whiteSpace: "nowrap", opacity: 1 - out }}>
      {words.map((w, i) => {
        const p = EASE(ramp(t, i * FEATURE_TITLE.stagger, i * FEATURE_TITLE.stagger + FEATURE_TITLE.wordIn));
        const blur = 12 * (1 - p) + 10 * out;
        return (
          <React.Fragment key={i}>
            <span style={{ display: "inline-block", opacity: p, filter: blur > 0.05 ? `blur(${blur}px)` : undefined, transform: `translateY(${14 * (1 - p) - 12 * out}px)` }}>{w}</span>
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

const LOGO_FILE: Record<string, string> = { gmail: "logos/gmail.svg", drive: "logos/google-drive.svg", sheets: "logos/google-sheets.svg", slack: "logos/slack.svg" };

export const Scene01Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const F = (s: number) => Math.round(s * fps);
  const cam = s1CamAt(t);
  // Gmail opens over 0.9s at the start; later windows open over 0.4s.
  const appear = (a: number) => EASE(ramp(t, a, a + (a < 1 ? 0.9 : 0.4)));
  const centre = toDesktop(cam, ORB.x, ORB.y);
  const gather = (k: string) => SMOOTH(ramp(t, S1.gather[k], S1.gather[k] + S1.gatherLen));
  const focusWin = t < S1.drive ? "gmail" : t < S1.sheets ? "drive" : t < S1.slack ? "sheets" : t < S1.pullBack[0] ? "slack" : "none";
  const bg = (k: string) => focusWin !== k;

  // HUD: in at the start; the task card, clock and line fade first when the morph begins.
  const hudIn = EASE(ramp(t, S1.hudIn[0], S1.hudIn[1]));
  const hudOut = EASE(ramp(t, S1.hudOut[0], S1.hudOut[1]));
  const tabsCount = t >= S1.tabsDown[0] ? Math.round(14 * (1 - ramp(t, S1.tabsDown[0], S1.tabsDown[1]))) : TABS.reduce((n, [a, v]) => (t >= a ? v : n), 1);
  const tabsOut = EASE(ramp(t, S1.tabsOut[0], S1.tabsOut[1]));
  const clockIdx = CLOCK_AT.reduce((n, a, i) => (t >= a ? i : n), 0);
  const clockSwap = clockIdx === 0 ? 1 : ramp(t, CLOCK_AT[clockIdx], CLOCK_AT[clockIdx] + 0.25);
  const endOut = EASE(ramp(t, S1.endOut[0], S1.endOut[1]));

  // Drag: the attachments follow the cursor to Downloads.
  const dragging = t >= S1.dragPress && t < S1.drop;
  const cur = cursorPosAt(S1_CURSOR, t);
  const lift = EASE(ramp(t, S1.dragPress, S1.dragPress + 0.2));
  const cursorO = EASE(ramp(t, 1.2, 1.45)) * (1 - EASE(ramp(t, 12.1, 12.45)));

  // Morph: violet glow gathers at the centre; the orb grows out of it once the windows are small.
  const glow = EASE(ramp(t, S1.glow[0], S1.glow[1])) * (1 - 0.6 * EASE(ramp(t, S1.orbIn[1], S1.orbIn[1] + 0.8)));
  const orbIn = EASE(ramp(t, S1.orbIn[0], S1.orbIn[1]));
  const shrink = EASE(ramp(t, S1.orbShrink[0], S1.orbShrink[1]));
  const orbSize = ORB.size + (ORB.endSize - ORB.size) * shrink;
  const orbR = spaceOrbOuterRadius(orbSize, true);
  const summaryOut = EASE(ramp(t, S1.hudOut[0], S1.hudOut[1]));

  return (
    <AbsoluteFill style={{ width: 1920, height: 1080 }}>
      <ProblemBackdrop timeOffset={sceneById(S).start} />

      {/* Desktop under the camera */}
      <AbsoluteFill style={{ transform: camCss(cam), transformOrigin: "0 0" }}>
        {summaryOut < 1 ? (
          <div style={{ opacity: 1 - summaryOut }}>
            <Win k="summary" background appear={appear(S1.summary)}>
              <SummaryBody caret={t % 1.1 < 0.6 ? 0.7 : 0} />
            </Win>
          </div>
        ) : null}
        <div style={{ opacity: 1 - summaryOut }}>
          <Tray background={focusWin !== "gmail"} appear={appear(S1.tray)} count={t >= S1.drop ? 4 : 0} />
        </div>
        {ORDER.map((k) => {
          const g = gather(k);
          const body =
            k === "gmail" ? (
              <GmailBody lift={lift} />
            ) : k === "drive" ? (
              <DriveBody
                typeStart={t >= S1.searchType ? F(S1.searchType) : null}
                results={EASE(ramp(t, S1.results, S1.results + 0.2))}
                pressed={Math.max(0, 1 - Math.abs(t - S1.rowClick) / 0.2)}
                pdf={EASE(ramp(t, S1.pdf, S1.pdf + 0.15))}
                scroll={SMOOTH(ramp(t, S1.scroll[0], S1.scroll[1]))}
                highlight={EASE(ramp(t, S1.highlight[0], S1.highlight[1]))}
              />
            ) : k === "sheets" ? (
              <SheetsBody hover={t < S1.rowHover[0] ? -5 : SMOOTH(ramp(t, S1.rowHover[0], S1.rowHover[1]))} select={EASE(ramp(t, S1.cellClick, S1.cellClick + 0.15))} />
            ) : (
              <SlackBody
                focus={EASE(ramp(t, S1.slackClick, S1.slackClick + 0.15))}
                typeStart={t >= S1.slackType ? F(S1.slackType) : null}
                sent={EASE(ramp(t, S1.send + 0.05, S1.send + 0.35))}
                typing={EASE(ramp(t, S1.send + 0.45, S1.send + 0.7))}
                pulse={t}
              />
            );
          return (
            <Win key={k} k={k} background={bg(k) || g > 0} appear={appear((S1 as unknown as Record<string, number>)[k])} gather={g} to={centre} rot={ROT[k]} logoGone={g > 0} badge={k === "slack" && t >= 10.3 ? Math.max(1, Math.round(P.scene1.slack.unread * ramp(t, 10.3, 12.3))) : undefined}>
              {body}
            </Win>
          );
        })}
        {dragging ? <DragStack x={cur.x} y={cur.y} opacity={EASE(ramp(t, S1.dragPress, S1.dragPress + 0.12))} /> : null}
        {cursorO > 0 ? <Cursor keys={S1_CURSOR} opacity={cursorO} ripple="neutral" /> : null}
      </AbsoluteFill>

      {/* Logos detach from their windows and stream into the centre */}
      {ORDER.map((k) => {
        const a = S1.gather[k];
        const p = SMOOTH(ramp(t, a, a + 0.6));
        if (p <= 0 || p >= 1) return null;
        const from = toScreen(cam, logoPoint(k));
        const x = from.x + (ORB.x - from.x) * p;
        const y = from.y + (ORB.y - from.y) * p - Math.sin(Math.PI * p) * 40;
        return (
          <div key={k} data-guard="brand" style={{ position: "absolute", left: x - 18, top: y - 18, width: 36, height: 36, opacity: 1 - Math.max(0, (p - 0.7) / 0.3), transform: `scale(${1 - 0.5 * p})`, filter: p > 0.5 ? `blur(${(p - 0.5) * 4}px)` : undefined }}>
            <Img src={staticFile(LOGO_FILE[k])} style={{ width: 36, height: 36, objectFit: "contain" }} />
          </div>
        );
      })}

      {/* Soft violet glow gathering at the centre */}
      {glow > 0 ? (
        <div style={{ position: "absolute", left: ORB.x - 330, top: ORB.y - 330, width: 660, height: 660, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(168,155,255,0.55), rgba(124,98,240,0.25) 45%, rgba(124,98,240,0) 100%)", opacity: glow, transform: `scale(${0.4 + 0.6 * glow})` }} />
      ) : null}

      {/* The orb grows out of the glow */}
      {orbIn > 0 ? (
        <div style={{ position: "absolute", left: ORB.x - orbR, top: ORB.y - orbR, width: orbR * 2, height: orbR * 2, display: "flex", alignItems: "center", justifyContent: "center", transform: orbIn < 1 ? `scale(${orbIn})` : undefined, opacity: Math.min(1, orbIn * 2) }}>
          <SpaceOrb size={orbSize} ticks pulse timeOffset={sceneById(S).start} />
        </div>
      ) : null}

      {/* Task card, top left, inside the safe area */}
      {hudOut < 1 ? (
        <div style={{ position: "absolute", left: HUD.left, top: HUD.top, opacity: hudIn * (1 - hudOut), filter: hudOut > 0.02 ? `blur(${10 * hudOut}px)` : undefined, transform: `translateY(${(1 - hudIn) * 24}px)` }}>
          <Chip label="Task card">
            <span style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${T.secondary}`, boxSizing: "border-box" }} />
            {P.scene1.task}
          </Chip>
        </div>
      ) : null}
      {/* Status chips, top right, inside the safe area */}
      {tabsOut < 1 ? (
        <div style={{ position: "absolute", right: HUD.left, top: HUD.top, display: "flex", gap: 12, opacity: hudIn, transform: `translateY(${(1 - hudIn) * 24}px)` }}>
          <div style={{ opacity: 1 - tabsOut, filter: tabsOut > 0.02 ? `blur(${10 * tabsOut}px)` : undefined }}>
            <Chip label="Open tabs">
              <Layers size={22} color={T.secondary} />
              Open tabs <span style={{ display: "inline-block", minWidth: 28, textAlign: "right" }}>{tabsCount}</span>
            </Chip>
          </div>
          {hudOut < 1 ? (
            <div style={{ opacity: 1 - hudOut }}>
              <Chip label="Clock" style={{ minWidth: 168 }}>
                <Clock size={22} color={T.secondary} />
                <span style={{ display: "inline-block", opacity: 0.4 + 0.6 * clockSwap, transform: `translateY(${(1 - clockSwap) * 6}px)` }}>{P.scene1.clocks[clockIdx]}</span>
              </Chip>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Top line with a soft light behind it */}
      {LINES.map((l, i) => {
        if (t < l.from) return null;
        const out = i === 0 ? hudOut : endOut;
        if (out >= 1) return null;
        return (
          <React.Fragment key={l.text}>
            <div style={{ position: "absolute", left: 960 - 560, top: HUD.lineY - 160, width: 1120, height: 320, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,255,255,0.65), rgba(255,255,255,0.35) 45%, rgba(255,255,255,0) 100%)", opacity: EASE(ramp(t, l.from, l.from + 0.5)) * (1 - out) }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: HUD.lineY, display: "flex", justifyContent: "center", transform: "translateY(-50%)" }}>
              <Line text={l.text} t={t - l.from} out={out} />
            </div>
          </React.Fragment>
        );
      })}

      {/* Four chips pop around the orb, one after another */}
      {P.scene1.chips.map((c, i) => {
        const pos = [{ x: 520, y: 470 }, { x: 1400, y: 470 }, { x: 560, y: 720 }, { x: 1360, y: 720 }][i];
        const a = EASE(ramp(t, S1.chips[i], S1.chips[i] + 0.3));
        if (a <= 0 || endOut >= 1) return null;
        return (
          <div key={c} style={{ opacity: 1 - endOut, filter: endOut > 0.02 ? `blur(${10 * endOut}px)` : undefined }}>
            <TickChip label={c} x={pos.x} y={pos.y} appear={a} />
          </div>
        );
      })}

      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};
