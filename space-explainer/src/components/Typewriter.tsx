import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR, TYPE } from "../theme";
import { TAG, toUnits, typeSchedule } from "../lib/typewriter";

type Props = {
  /** One string per line. Lines are fixed: the full text is laid out invisibly first, so nothing reflows. */
  lines: string[];
  cps: number;
  /** Frame (in the parent sequence) at which typing starts. */
  startFrame: number;
  seed?: string;
  style?: React.CSSProperties;
  lineStyle?: React.CSSProperties;
  caretColor?: string;
  align?: "left" | "center" | "right";
  showCaret?: boolean;
  /** Seconds after typing starts at which the caret begins its 0.3s fade. Defaults to the end of typing. */
  caretFadeAt?: number;
  /** Renders multi-character units such as [S1] source tags. */
  renderTag?: (tag: string, opacity: number) => React.ReactNode;
  /** Rendered after the last line, inline (for example a logo in a lockup). */
  after?: React.ReactNode;
};

export const Typewriter: React.FC<Props> = ({
  lines,
  cps,
  startFrame,
  seed = "tw",
  style,
  lineStyle,
  caretColor = COLOR.ink,
  align = "left",
  showCaret = true,
  caretFadeAt,
  renderTag,
  after,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const joined = lines.join("\n");
  const sched = useMemo(
    () => typeSchedule(joined, cps, seed),
    [joined, cps, seed],
  );
  const t = (frame - startFrame) / fps;
  const fade = TYPE.charFadeMs / 1000;

  // Index of the last unit that has started to appear.
  let lastIdx = -1;
  for (let i = 0; i < sched.times.length; i++) {
    if (sched.times[i] <= t) lastIdx = i;
    else break;
  }
  const typingDone = t >= sched.end;
  const sinceEnd = t - sched.end;
  const sinceFade = t - (caretFadeAt ?? sched.end);
  let caretOpacity = 0;
  if (showCaret && t >= 0) {
    if (!typingDone) caretOpacity = TYPE.caretOpacity;
    else {
      const blinkOn = (sinceEnd * TYPE.caretHz) % 1 < 0.5;
      const fadeOut = Math.max(
        0,
        Math.min(1, 1 - sinceFade / (TYPE.caretFadeAfterMs / 1000)),
      );
      caretOpacity = blinkOn ? TYPE.caretOpacity * fadeOut : 0;
    }
  }

  const caret = (
    <span
      data-guard-caret
      style={{
        display: "inline-block",
        width: 0,
        height: "1em",
        verticalAlign: "-0.14em",
        position: "relative",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 2,
          top: 0,
          bottom: 0,
          width: TYPE.caretWidth,
          background: caretColor,
          opacity: caretOpacity,
        }}
      />
    </span>
  );

  let gi = 0;
  return (
    <div style={{ textAlign: align, ...style }}>
      {lines.map((line, li) => {
        const units = toUnits(line);
        const lineStart = gi;
        const nodes = units.map((u, ci) => {
          const idx = lineStart + ci;
          const o = Math.min(1, Math.max(0, (t - sched.times[idx]) / fade));
          return (
            <React.Fragment key={ci}>
              {u.length > 1 && TAG.test(u) && renderTag ? (
                renderTag(u, o)
              ) : (
                <span style={{ opacity: o }}>{u}</span>
              )}
              {idx === lastIdx ? caret : null}
            </React.Fragment>
          );
        });
        gi += units.length + 1; // +1 for the newline unit in the schedule
        const caretAtLineStart = li === 0 && lastIdx === -1 && t >= 0;
        return (
          <div key={li} style={{ whiteSpace: "pre", ...lineStyle }}>
            {caretAtLineStart ? caret : null}
            {nodes}
            {li === lines.length - 1 ? after : null}
          </div>
        );
      })}
    </div>
  );
};
