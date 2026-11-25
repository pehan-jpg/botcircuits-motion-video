import React from "react";
import { COLOR, FONT, CHAT_CPS } from "../theme";
import { PLACEHOLDERS as P } from "../placeholders";
import { SpaceOrb } from "./SpaceOrb";
import { Typewriter } from "./Typewriter";

/** Native layout of the Concierge chat card; it is drawn scaled to any screen rect. */
export const CONCIERGE = { w: 960, h: 560, chip: { x: 40 + 12 + 19, y: 452 + 29 } };
export type Rect = { x: number; y: number; w: number; h: number };
export const lerpRect = (a: Rect, b: Rect, p: number): Rect => ({ x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, w: a.w + (b.w - a.w) * p, h: a.h + (b.h - a.h) * p });

/**
 * The BotCircuits Concierge chat (text only, no logo): the customer's message,
 * the typed reply and the "Handed to Space" chip with the small violet orb.
 * Used by Scene 9 (it grows out of the first Records row) and Scene 10.
 */
export const ConciergeCard: React.FC<{
  r: Rect;
  opacity: number;
  /** 0 to 1: the card's content (title and customer message) fades in. */
  content: number;
  replyStart: number | null;
  chip: number;
  /** Hide the chip's orb (it is blooming as an overlay). */
  orbHidden?: boolean;
  clock: number;
}> = ({ r, opacity, content, replyStart, chip, orbHidden, clock }) => {
  const k = r.w / CONCIERGE.w;
  return (
    <div style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, opacity }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: CONCIERGE.w,
          height: r.h / k,
          transform: `scale(${k})`,
          transformOrigin: "0 0",
          boxSizing: "border-box",
          borderRadius: 24,
          background: "#FFFFFF",
          boxShadow: "0 30px 80px rgba(13,18,36,0.12), 0 8px 20px rgba(13,18,36,0.06)",
          fontFamily: FONT.sans,
          color: COLOR.ink,
          overflow: "hidden",
        }}
      >
        <div style={{ opacity: content }}>
          <div data-guard="text" data-guard-label="Concierge title" style={{ position: "absolute", left: 40, top: 32, fontSize: 28, fontWeight: 700, letterSpacing: "-0.01em" }}>
            {P.concierge.title}
          </div>
          <div style={{ position: "absolute", left: 40, right: 40, top: 92, height: 1, background: "#E6E9EE" }} />
          <div style={{ position: "absolute", right: 40, top: 128 }}>
            <div data-guard="text" data-guard-label="Customer message" style={{ padding: "16px 22px", borderRadius: "20px 20px 6px 20px", background: "#EEF0F4", fontSize: 28, lineHeight: 1.35, whiteSpace: "nowrap" }}>
              {P.concierge.customer}
            </div>
            <div style={{ marginTop: 8, textAlign: "right", fontSize: 20, color: "#5B6273" }}>{P.insured}</div>
          </div>
        </div>
        {replyStart !== null ? (
          <div style={{ position: "absolute", left: 40, top: 280 }}>
            <div data-guard="text" data-guard-label="Concierge reply" style={{ padding: "16px 22px", borderRadius: "20px 20px 20px 6px", border: "1px solid #E1E4EA", fontSize: 28, lineHeight: 1.35 }}>
              <Typewriter lines={[...P.concierge.reply]} cps={CHAT_CPS} startFrame={replyStart} seed="concierge-reply" caretColor={COLOR.ink} style={{ fontSize: 28, color: COLOR.ink }} />
            </div>
          </div>
        ) : null}
        {chip > 0 ? (
          <div data-guard="text" data-guard-label="Handed chip" style={{ position: "absolute", left: 40, top: 452, display: "flex", alignItems: "center", gap: 12, height: 58, padding: "0 22px 0 12px", borderRadius: 29, background: "#F3F0FF", border: "1px solid #DCD3FF", fontSize: 28, fontWeight: 600, color: "#3B2A8F", opacity: chip, transform: `scale(${0.94 + 0.06 * chip})`, transformOrigin: "0 50%", whiteSpace: "nowrap" }}>
            <div style={{ width: 38, height: 38, opacity: orbHidden ? 0 : 1 }}>
              <SpaceOrb size={38} timeOffset={clock} />
            </div>
            {P.concierge.handed}
          </div>
        ) : null}
      </div>
    </div>
  );
};
