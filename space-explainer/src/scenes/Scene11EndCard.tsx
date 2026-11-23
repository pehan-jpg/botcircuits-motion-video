import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { COLOR, EASE, FONT } from "../theme";
import { PLACEHOLDERS as P } from "../placeholders";
import { GuardLayer } from "../components/GuardLayer";
import { HumanGlyph } from "../components/HumanGlyph";
import { FEATURE_TITLE } from "../components/FeatureTitle";
import { lockupTiming, SpaceByLockup } from "../components/SpaceByLockup";
import type { TextBeatSpec } from "../lib/guards";
import { NEUTRAL } from "./Scene10Concierge";
import { ramp, useScene } from "./shared/stage";

const S = "S11" as const;
const LINES = P.endCard;
export const S11 = { white: [0, 0.5], lines: [0.35, 0.8, 1.25], underline: [2.05, 2.45], exit: [3.55, 3.95], lockup: 3.9 };
const SIZE = 80;
const LINE_Y = [400, 520, 640];
const lock = lockupTiming("", "s11-lockup", "assemble");
export const S11_LOCKUP_READY = S11.lockup + lock.ready;

export const SCENE11_TEXT: TextBeatSpec[] = [
  { id: "lines", text: LINES.join(" "), readyAt: S11.lines[0], leaveAt: S11.exit[0], fontPx: SIZE },
  { id: "lockup", text: "Space by", readyAt: S11_LOCKUP_READY, leaveAt: 7, fontPx: 96 },
];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** One end card line in FeatureTitle style: words blur in, drift up and out. */
const Line: React.FC<{ text: string; t: number; start: number; exitP: number; y: number; children?: React.ReactNode }> = ({ text, t, start, exitP, y, children }) => {
  const words = text.split(" ");
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", transform: "translateY(-50%)" }}>
      <div data-guard="text" data-guard-label={`End card: ${text}`} style={{ position: "relative", fontFamily: FONT.sans, fontWeight: FEATURE_TITLE.weight, fontSize: SIZE, letterSpacing: FEATURE_TITLE.tracking, lineHeight: 1.1, color: COLOR.ink, whiteSpace: "nowrap", opacity: 1 - exitP }}>
        {words.map((w, i) => {
          const p = EASE(interpolate(t - start, [i * FEATURE_TITLE.stagger, i * FEATURE_TITLE.stagger + FEATURE_TITLE.wordIn], [0, 1], clamp));
          const blur = FEATURE_TITLE.blur * (1 - p) + 12 * exitP;
          return (
            <React.Fragment key={i}>
              <span style={{ display: "inline-block", opacity: p, filter: blur > 0.05 ? `blur(${blur}px)` : undefined, transform: `translateY(${FEATURE_TITLE.rise * (1 - p) - FEATURE_TITLE.exitRise * exitP}px)` }}>{w}</span>
              {i < words.length - 1 ? " " : null}
            </React.Fragment>
          );
        })}
        {children}
      </div>
    </div>
  );
};

export const Scene11EndCard: React.FC = () => {
  const { t, F } = useScene(S);
  const white = EASE(ramp(t, S11.white[0], S11.white[1]));
  const exitP = EASE(ramp(t, S11.exit[0], S11.exit[1]));
  const under = EASE(ramp(t, S11.underline[0], S11.underline[1]));
  const glyph = EASE(ramp(t, S11.underline[0] + 0.15, S11.underline[1] + 0.1));
  return (
    <AbsoluteFill style={{ width: 1920, height: 1080, background: "#FFFFFF" }}>
      <AbsoluteFill style={{ background: NEUTRAL, opacity: 1 - white }} />
      {exitP < 1
        ? LINES.map((l, i) => (
            <Line key={l} text={l} t={t} start={S11.lines[i]} exitP={exitP} y={LINE_Y[i]}>
              {i === 1 ? (
                <>
                  {/* Amber underline: the line about people deciding. */}
                  <div style={{ position: "absolute", left: 0, bottom: -14, height: 8, borderRadius: 4, width: `${under * 100}%`, background: COLOR.amber, transform: `translateY(${-FEATURE_TITLE.exitRise * exitP}px)` }} />
                  <div style={{ position: "absolute", left: "100%", top: "50%", marginLeft: 26, opacity: glyph, transform: `translateY(calc(-50% - ${FEATURE_TITLE.exitRise * exitP}px)) scale(${0.85 + 0.15 * glyph})` }}>
                    <HumanGlyph size={46} />
                  </div>
                </>
              ) : null}
            </Line>
          ))
        : null}
      {t >= S11.lockup ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 540, display: "flex", justifyContent: "center", transform: "translateY(-50%)" }}>
          <SpaceByLockup fontSize={96} startFrame={F(S11.lockup)} seed="s11-lockup" logoMode="assemble" backing="white" color={COLOR.ink} />
        </div>
      ) : null}
      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};
