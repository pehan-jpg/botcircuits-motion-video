import React from "react";
import { INK } from "../constants";
import { lerp, tween } from "../anim";
import { MONO, SANS } from "../fonts";
import { MintCheck, PetalSpinner } from "../components/ChipIcons";
import { Glyph } from "../components/Glyphs";
import { ChipSpec } from "./timeline";
import { CHIP, CHIP_FONT, KEPT, RECEIPT, SLOT } from "./layout";

export const CHIP_BG = "#F1F2F6";
export const MINT_BG = "#E3F6EC";
export const MINT_EDGE = "#BCE6CF";
export const DETAIL_INK = "rgba(13,18,36,0.6)";
export const STAMP_INK = "#5B6072";

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(",")})`;
};

/** A pop that grows from `from` to 1 with a fade. Never overshoots. */
export const pop = (frame: number, range: [number, number], from = 0.96) => {
  const p = tween(frame, range);
  return { opacity: p, scale: from + (1 - from) * p };
};

/** Chip content: spinner turning into a mint check, label crossfading busy to done. */
export const ChipFace: React.FC<{ spec: ChipSpec; labelW: number; frame: number; fps: number; labelIn: number }> = ({
  spec,
  labelW,
  frame,
  fps,
  labelIn,
}) => {
  const c = tween(frame, spec.check);
  const out = tween(c, [0, 0.5], [0, 1], (t) => t);
  const inn = tween(c, [0.45, 1], [0, 1], (t) => t);
  return (
    <div
      style={{
        position: "absolute",
        left: CHIP.padL,
        top: 0,
        height: CHIP.h,
        display: "flex",
        alignItems: "center",
        gap: CHIP.gap,
        opacity: labelIn,
      }}
    >
      <div style={{ position: "relative", width: CHIP.icon, height: CHIP.icon }}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - c, transform: `scale(${lerp(1, 0.9, c)})` }}>
          <PetalSpinner size={CHIP.icon} time={frame / fps} />
        </div>
        <div style={{ position: "absolute", inset: 0, opacity: c, transform: `scale(${lerp(0.9, 1, c)})` }}>
          <MintCheck size={CHIP.icon} draw={c} />
        </div>
      </div>
      <div
        style={{
          position: "relative",
          width: labelW,
          height: CHIP_FONT.lineHeight,
          fontFamily: SANS,
          fontSize: CHIP_FONT.size,
          fontWeight: CHIP_FONT.weight,
          lineHeight: `${CHIP_FONT.lineHeight}px`,
          whiteSpace: "pre",
        }}
      >
        {/* Sequential vertical crossfade: the busy label leaves before the done label arrives. */}
        <div data-contrast style={{ position: "absolute", left: 0, top: 0, color: INK, opacity: 1 - out, transform: `translateY(${-10 * out}px)` }}>
          {spec.busy}
        </div>
        <div data-contrast style={{ position: "absolute", left: 0, top: 0, color: INK, opacity: inn, transform: `translateY(${10 * (1 - inn)}px)` }}>
          {spec.doneLabel}
        </div>
      </div>
    </div>
  );
};

/** The small mint chip left in the chat after the action has lifted out. */
export const KeptChip: React.FC<{ spec: ChipSpec; w: number; labelW: number; opacity: number; scale: number }> = ({
  spec,
  w,
  labelW,
  opacity,
  scale,
}) => (
  <div
    data-box={`chip:${spec.id}-kept`}
    style={{
      position: "absolute",
      left: 0,
      top: (CHIP.h - KEPT.h) / 2,
      width: w,
      height: KEPT.h,
      borderRadius: KEPT.h / 2,
      background: MINT_BG,
      boxShadow: `inset 0 0 0 1px ${MINT_EDGE}`,
      display: "flex",
      alignItems: "center",
      gap: KEPT.gap,
      paddingLeft: KEPT.padL,
      boxSizing: "border-box",
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: "0% 50%",
    }}
  >
    <MintCheck size={KEPT.icon} draw={1} />
    <div
      data-contrast
      style={{
        width: labelW,
        fontFamily: SANS,
        fontSize: CHIP_FONT.size,
        fontWeight: CHIP_FONT.weight,
        lineHeight: `${CHIP_FONT.lineHeight}px`,
        color: INK,
        whiteSpace: "pre",
      }}
    >
      {spec.doneLabel}
    </div>
  </div>
);

/** Receipt content laid out for 520 x 120. */
export const ReceiptFace: React.FC<{ spec: ChipSpec; glyphDraw: number; badge: number; badgePulse: number }> = ({
  spec,
  glyphDraw,
  badge,
  badgePulse,
}) => {
  const r = spec.receipt;
  const pulseScale = 1 + 0.04 * Math.sin(Math.PI * badgePulse);
  const ring = badgePulse > 0 && badgePulse < 1;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: SLOT.w, height: SLOT.h }}>
      <div
        style={{
          position: "absolute",
          left: RECEIPT.padL,
          top: (SLOT.h - RECEIPT.glyphCircle) / 2,
          width: RECEIPT.glyphCircle,
          height: RECEIPT.glyphCircle,
          borderRadius: "50%",
          background: r.tint,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Glyph kind={r.glyph} size={32} draw={glyphDraw} />
      </div>
      <div
        data-contrast
        style={{
          position: "absolute",
          left: RECEIPT.textX,
          top: 22,
          fontFamily: SANS,
          fontSize: RECEIPT.titleSize,
          fontWeight: 600,
          lineHeight: "34px",
          color: INK,
          whiteSpace: "pre",
        }}
      >
        {r.title}
      </div>
      <div
        data-contrast
        style={{
          position: "absolute",
          left: RECEIPT.textX,
          top: 64,
          fontFamily: SANS,
          fontSize: RECEIPT.detailSize,
          fontWeight: 500,
          lineHeight: "28px",
          color: DETAIL_INK,
          whiteSpace: "pre",
        }}
      >
        {r.detail}
      </div>
      <div
        data-contrast
        style={{
          position: "absolute",
          right: 20,
          top: 66,
          fontFamily: MONO,
          fontSize: RECEIPT.stampSize,
          fontWeight: 500,
          lineHeight: "26px",
          color: STAMP_INK,
          whiteSpace: "pre",
        }}
      >
        {r.time}
      </div>
      {/* Mint check badge sitting on the top right corner. */}
      <div
        style={{
          position: "absolute",
          right: -8,
          top: -8,
          width: RECEIPT.badge,
          height: RECEIPT.badge,
          opacity: badge,
          transform: `scale(${lerp(0.96, 1, badge) * pulseScale})`,
        }}
      >
        {ring ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "2px solid rgba(35,160,107,0.5)",
              transform: `scale(${1 + 0.45 * badgePulse})`,
              opacity: 0.9 * (1 - badgePulse),
            }}
          />
        ) : null}
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 2px 6px rgba(13,18,36,0.12)" }} />
        <div style={{ position: "absolute", inset: 2 }}>
          <MintCheck size={RECEIPT.badge - 4} draw={badge} />
        </div>
      </div>
    </div>
  );
};
