import React from "react";
import { Easing, Img, interpolate, staticFile } from "remotion";
import { BRAND_LIME, INK } from "../constants";
import { pop, progress } from "../anim";
import { CheckIcon, MINT, MINT_SOFT, PetalSpinner, StackIcon } from "../components/Icons";
import { FONT_FAMILY, MONO_FAMILY } from "../fonts";
import { Box, CARD_RADIUS, PAD, Poly, pointAt, toD } from "./layout";

export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const SHADOW = "0 12px 32px rgba(13,18,36,0.07), 0 2px 6px rgba(13,18,36,0.05)";
export const INK70 = "rgba(13,18,36,0.7)";
export const OK_TEXT = "#0E6B45"; // dark mint text on MINT_SOFT (5.9:1)
export const AMBER_BG = "#FDF3DC";
export const AMBER_ACCENT = "#B7791F"; // specified amber, used for the chip edge
export const AMBER_TEXT = "#8A5A13"; // darkened so the label reaches 4.5:1 on AMBER_BG (#B7791F is 3.3:1)
export const LINE_GREY = "#D3D8E0";
export const within = (f: number, r: readonly [number, number]) => f >= r[0] && f <= r[1];

export const TEXT = {
  title: { fontFamily: FONT_FAMILY, fontSize: 22, fontWeight: 600, color: INK, lineHeight: 1.4 } as React.CSSProperties,
  body: { fontFamily: FONT_FAMILY, fontSize: 20, fontWeight: 500, color: INK, lineHeight: 1.4 } as React.CSSProperties,
  label: { fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 600, color: INK70, lineHeight: 1.4 } as React.CSSProperties,
  mono: { fontFamily: MONO_FAMILY, fontSize: 18, fontWeight: 500, color: INK, lineHeight: 1.4 } as React.CSSProperties,
};

/* ---------------- logos: supplied files, unaltered ---------------- */
export const LOGOS = {
  gmail: { file: "logos/gmail.webp", aspect: 2000 / 1591, name: "Gmail" },
  sheets: { file: "logos/google-sheets.webp", aspect: 960 / 699, name: "Google Sheets" },
  drive: { file: "logos/google-drive.webp", aspect: 1280 / 1187, name: "Google Drive" },
  slack: { file: "logos/slack.webp", aspect: 1, name: "Slack" },
};
export type LogoId = keyof typeof LOGOS;
export const LOGO_H = 28;

/** The official logo at 28px high, or, only when its file is missing, a neutral named placeholder. */
export const Logo: React.FC<{ id: LogoId; available: boolean }> = ({ id, available }) => {
  const l = LOGOS[id];
  if (!available) {
    return (
      <span data-logo-placeholder={l.file} style={{ ...TEXT.label, color: INK, padding: "0 4px" }}>
        {l.name}
      </span>
    );
  }
  return (
    <Img
      data-logo={l.file}
      src={staticFile(l.file)}
      style={{ height: LOGO_H, width: LOGO_H * l.aspect, display: "block", flex: "none" }}
    />
  );
};

/** A white chip that holds a logo (or glyph) and a separate label. */
export const Chip: React.FC<{
  guard: string;
  logo?: React.ReactNode;
  label: React.ReactNode;
  labelStyle?: React.CSSProperties;
  height?: number;
  opacity?: number;
  transform?: string;
  badge?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ guard, logo, label, labelStyle = TEXT.label, height = 52, opacity = 1, transform, badge, style }) => (
  <div
    data-guard={guard}
    data-logo-tile=""
    style={{
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: 12,
      height,
      padding: "0 14px 0 10px",
      background: "#FFFFFF",
      border: "1px solid rgba(13,18,36,0.12)",
      borderRadius: 14,
      boxSizing: "border-box",
      boxShadow: "0 2px 6px rgba(13,18,36,0.05)",
      opacity,
      transform,
      flex: "none",
      ...style,
    }}
  >
    {logo}
    <span style={{ ...labelStyle, whiteSpace: "nowrap" }}>{label}</span>
    {badge}
  </div>
);

/** Spinner then mint check, sitting on the chip's top right corner (outside the logo's clear space). */
export const StatusBadge: React.FC<{ frame: number; spin: readonly [number, number]; show: number }> = ({ frame, spin, show }) => {
  if (frame < show) return null;
  const appear = pop(frame, show, 12);
  const done = progress(frame, spin[1], spin[1] + 10);
  const p = pop(frame, spin[1], 12);
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        right: -10,
        top: -10,
        width: 26,
        height: 26,
        transform: `scale(${appear.scale})`,
        opacity: appear.opacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 13,
          background: "#FFFFFF",
          border: "1px solid rgba(13,18,36,0.12)",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 1 - done,
        }}
      >
        <PetalSpinner size={18} color="rgba(13,18,36,0.6)" rotation={((frame - show) / 60) * 300} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 13,
          background: MINT,
          border: "2px solid #FFFFFF",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: done,
          transform: `scale(${done > 0 ? p.scale : 0})`,
        }}
      >
        <CheckIcon size={14} color="#FFFFFF" strokeWidth={3.4} draw={done} />
      </div>
    </div>
  );
};

export const MintCheck: React.FC<{ size: number; draw?: number }> = ({ size, draw = 1 }) => (
  <div
    aria-hidden
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      background: MINT,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "none",
    }}
  >
    <CheckIcon size={size * 0.6} color="#FFFFFF" strokeWidth={3.2} draw={draw} />
  </div>
);

export const StatusChip: React.FC<{ kind: "ok" | "over" | "approved"; style?: React.CSSProperties }> = ({ kind, style }) => {
  const amber = kind === "over";
  return (
    <span
      style={{
        ...TEXT.label,
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 10,
        background: amber ? AMBER_BG : MINT_SOFT,
        color: amber ? AMBER_TEXT : OK_TEXT,
        border: `1px solid ${amber ? "rgba(183,121,31,0.35)" : "rgba(35,160,107,0.3)"}`,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {kind === "over" ? "Over limit" : kind === "ok" ? "OK" : "Approved"}
    </span>
  );
};

/* ---------------- cards ---------------- */
export const Card: React.FC<{
  guard: string;
  box: Box;
  frame: number;
  popRange: readonly [number, number];
  skipPop?: boolean;
  background?: string;
  radius?: number;
  children: React.ReactNode;
}> = ({ guard, box, frame, popRange, skipPop, background = "#FFFFFF", radius = CARD_RADIUS, children }) => {
  const p = skipPop ? { scale: 1, opacity: 1 } : pop(frame, popRange[0], popRange[1] - popRange[0]);
  if (p.opacity <= 0) return null;
  return (
    <div
      data-guard={guard}
      style={{
        position: "absolute",
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        background,
        borderRadius: radius,
        border: "1px solid rgba(13,18,36,0.08)",
        boxShadow: SHADOW,
        boxSizing: "border-box",
        transform: `scale(${p.scale})`,
        opacity: p.opacity,
      }}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ ...TEXT.title, position: "absolute", left: PAD, top: 16, whiteSpace: "nowrap", ...style }}>{children}</div>
);

/** Light skeleton lines shown until a card's content arrives. */
export const Skeleton: React.FC<{ top: number; widths: number[]; opacity: number; gap?: number }> = ({ top, widths, opacity, gap = 26 }) =>
  opacity <= 0 ? null : (
    <div aria-hidden style={{ position: "absolute", left: PAD, top, opacity }}>
      {widths.map((w, i) => (
        <div key={i} style={{ width: w, height: 12, borderRadius: 6, background: i === 0 ? "#E2E6EC" : "#ECEFF3", marginBottom: gap - 12 }} />
      ))}
    </div>
  );

/* ---------------- lines and pulses ---------------- */
export const Line: React.FC<{ poly: Poly; draw: number }> = ({ poly, draw }) =>
  draw <= 0 ? null : (
    <path
      d={toD(poly)}
      fill="none"
      stroke={LINE_GREY}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray="1 2"
      strokeDashoffset={1 - draw}
    />
  );

export const Pulse: React.FC<{ frame: number; poly: Poly; range: readonly [number, number]; intensity?: number; tail?: number }> = ({
  frame,
  poly,
  range,
  intensity = 1,
  tail = 0.3,
}) => {
  const fade = 8;
  if (frame < range[0] || frame > range[1] + fade) return null;
  const t = interpolate(frame, range, [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) });
  const after = interpolate(frame, [range[1], range[1] + fade], [1, 0], CLAMP);
  const head = pointAt(poly, t);
  const start = Math.max(0, t - tail);
  return (
    <g opacity={intensity * after}>
      <path
        d={toD(poly)}
        fill="none"
        stroke={BRAND_LIME}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={`${Math.max(0.0001, t - start)} 2`}
        strokeDashoffset={-start}
        opacity={0.8}
      />
      <circle cx={head.x} cy={head.y} r={16} fill="url(#pulseGlow)" />
      <circle cx={head.x} cy={head.y} r={6.5} fill={BRAND_LIME} />
    </g>
  );
};

/* ---------------- cursor: ink arrow, hotspot exactly at the tip (0, 0) ---------------- */
export const Cursor: React.FC<{ x: number; y: number; opacity: number; pressed: number }> = ({ x, y, opacity, pressed }) =>
  opacity <= 0 ? null : (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity }}>
      <div data-cursor-tip="" style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0 }} />
      <svg
        width={30}
        height={40}
        viewBox="0 0 30 40"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          overflow: "visible",
          transformOrigin: "0 0",
          transform: `scale(${1 - 0.06 * pressed})`,
          filter: "drop-shadow(0 3px 5px rgba(13,18,36,0.25))",
        }}
      >
        <path d="M0 0 L0 30 L7.5 23 L12.5 35 L17.5 33 L12.5 21.5 L22.5 21.5 Z" fill={INK} stroke="#FFFFFF" strokeWidth={2} strokeLinejoin="round" />
      </svg>
    </div>
  );

/* ---------------- small glyphs ---------------- */
export const MicIcon: React.FC<{ size: number; color?: string }> = ({ size, color = INK70 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "block" }}>
    <rect x={8.5} y={3} width={7} height={12} rx={3.5} fill={color} />
    <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </svg>
);
export const SendIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "block" }}>
    <path d="M12 19V6M6.5 11 12 5.5 17.5 11" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const PauseGlyph: React.FC<{ opacity: number }> = ({ opacity }) => (
  <svg width={22} height={22} viewBox="0 0 24 24" aria-hidden style={{ display: "block", opacity }}>
    <rect x={6} y={5} width={4} height={14} rx={2} fill={INK70} />
    <rect x={14} y={5} width={4} height={14} rx={2} fill={INK70} />
  </svg>
);
export { StackIcon, MINT, MINT_SOFT };
