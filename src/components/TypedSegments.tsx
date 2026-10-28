import React from "react";
import { typedCount, useTimeline } from "../anim";
import type { CaptionSegment } from "../content";
import { C } from "../theme";
import { Highlight } from "./Highlight";

const lengthOf = (line: CaptionSegment[]) =>
  line.reduce((n, s) => n + s.text.length, 0);

// Lines of segments typed character by character, with a blinking cursor.
export const TypedSegments: React.FC<{
  lines: CaptionSegment[][];
  typeAt: number;
  cps: number;
}> = ({ lines, typeAt, cps }) => {
  const { since, t } = useTimeline();
  const total = lines.reduce((n, l) => n + lengthOf(l), 0);
  const count = Math.min(total, typedCount(since(typeAt), cps));
  const afterDone = t - (typeAt + total / cps);

  // Solid while typing, then blinks twice and fades out.
  const blinkOn = afterDone < 0 || Math.floor(afterDone / 0.4) % 2 === 0;
  const cursorOpacity =
    since(typeAt) < 0 || afterDone > 1.4 ? 0 : blinkOn ? 1 : 0;

  // The cursor sits on the first line that is not fully typed.
  let cursorLine = lines.length - 1;
  let acc = 0;
  for (let i = 0; i < lines.length; i++) {
    acc += lengthOf(lines[i]);
    if (count < acc) {
      cursorLine = i;
      break;
    }
  }

  let remaining = count;
  return (
    <>
      {lines.map((line, li) => (
        <div key={li} style={{ whiteSpace: "pre", minHeight: "1.18em" }}>
          {line.map((seg, si) => {
            const shown = seg.text.slice(0, Math.max(0, remaining));
            remaining -= seg.text.length;
            return seg.highlight ? (
              <Highlight
                key={si}
                at={seg.highlight.at}
                until={seg.highlight.until}
              >
                {shown}
              </Highlight>
            ) : (
              <span key={si}>{shown}</span>
            );
          })}
          {li === cursorLine ? (
            <span
              style={{
                display: "inline-block",
                width: 4,
                height: "0.92em",
                marginLeft: 4,
                marginRight: -8,
                verticalAlign: "-0.12em",
                backgroundColor: C.ink,
                opacity: cursorOpacity,
              }}
            />
          ) : null}
        </div>
      ))}
    </>
  );
};
