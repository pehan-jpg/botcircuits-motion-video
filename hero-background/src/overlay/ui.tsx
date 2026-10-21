import type React from "react";
import { interpolate } from "remotion";
import { THEME } from "./config";
import { inter, mono } from "./fonts";
import { clamp, glassSurface, lerp, ramp, revealEase } from "./motion";

/* ---------- Typography ---------- */

export const Label: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({
  children,
  color = THEME.textSecondary,
  style,
}) => (
  <div
    style={{
      fontFamily: mono,
      fontSize: THEME.type.label.size,
      fontWeight: THEME.type.label.weight,
      letterSpacing: THEME.type.label.letterSpacing,
      textTransform: "uppercase",
      lineHeight: 1.2,
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Title: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      fontFamily: inter,
      fontSize: THEME.type.title.size,
      fontWeight: THEME.type.title.weight,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
      color: THEME.text,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Body: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({
  children,
  color = THEME.text,
  style,
}) => (
  <div
    style={{
      fontFamily: inter,
      fontSize: THEME.type.body.size,
      fontWeight: THEME.type.body.weight,
      lineHeight: 1.4,
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

/* ---------- Glass card ---------- */

type GlassProps = {
  x: number;
  y: number;
  width: number;
  /** Container transform (translate / scale / float). */
  transform: React.CSSProperties;
  /** Opacity + blur, applied on the surface itself. */
  fade: React.CSSProperties;
  /** Optional reveal: inset in px from the right / bottom edges, and corner radius. */
  reveal?: { right: number; bottom: number; radius: number; height: number };
  surfaceStyle?: React.CSSProperties;
  radius?: number;
  children: React.ReactNode;
};

export const Glass: React.FC<GlassProps> = ({ x, y, width, transform, fade, reveal, surfaceStyle, radius: radiusProp, children }) => {
  const radius = reveal?.radius ?? radiusProp ?? THEME.glass.radius;
  return (
    <div style={{ position: "absolute", left: x, top: y, width, ...transform }}>
      {/* Shadow lives on its own layer so a clip-path reveal never clips it. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          borderRadius: radius,
          boxShadow: THEME.glass.shadow,
          transformOrigin: "0 0",
          scale: reveal ? `${1 - reveal.right / width} ${1 - reveal.bottom / reveal.height}` : undefined,
          opacity: fade.opacity,
        }}
      />
      <div
        style={{
          ...glassSurface,
          position: "relative",
          borderRadius: radius,
          clipPath: reveal ? `inset(0px ${reveal.right.toFixed(2)}px ${reveal.bottom.toFixed(2)}px 0px round ${radius.toFixed(2)}px)` : undefined,
          ...fade,
          ...surfaceStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/* ---------- Icons and indicators ---------- */

/** Material "flight" glyph (Apache 2.0), points up. */
export const PLANE_PATH =
  "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z";

export const LimeIcon: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 8,
      background: THEME.lime,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" style={{ rotate: "45deg" }}>
      <path d={PLANE_PATH} fill={THEME.onLime} />
    </svg>
  </div>
);

/** A check mark drawn with stroke-dashoffset; progress 0 → 1. */
export const DrawnCheck: React.FC<{ progress: number; size: number; color?: string; strokeWidth?: number }> = ({
  progress,
  size,
  color = THEME.onLime,
  strokeWidth = 2.6,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M6.2 12.6l3.8 3.8 7.8-8.4"
      pathLength={1}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={1}
      strokeDashoffset={1 - progress}
      opacity={progress > 0 ? 1 : 0}
    />
  </svg>
);

/** Lime circle that scales in, then a check draws on it. */
export const LimeCheck: React.FC<{ frame: number; start: number; size: number; drawFrames?: number }> = ({
  frame,
  start,
  size,
  drawFrames = 12,
}) => {
  const circle = ramp(frame, start, 10);
  const draw = ramp(frame, start + 4, drawFrames);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: THEME.lime,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: circle,
        scale: String(lerp(0.6, 1, circle)),
        flexShrink: 0,
      }}
    >
      <DrawnCheck progress={draw} size={size * 0.72} />
    </div>
  );
};

/** Rotating ring spinner. */
export const Spinner: React.FC<{ frame: number; size: number }> = ({ frame, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ rotate: `${frame * 14}deg` }}>
    <circle cx={12} cy={12} r={9} stroke={THEME.hairline} strokeWidth={2.4} />
    <circle
      cx={12}
      cy={12}
      r={9}
      stroke={THEME.text}
      strokeWidth={2.4}
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray="0.28 0.72"
    />
  </svg>
);

/** Three-dot wave loader. */
export const DotLoader: React.FC<{ frame: number; color?: string; size?: number }> = ({
  frame,
  color = THEME.textSecondary,
  size = 6,
}) => (
  <div style={{ display: "flex", gap: size * 0.8, alignItems: "center", height: size * 3 }}>
    {[0, 1, 2].map((i) => {
      const wave = Math.max(0, Math.sin(((frame - i * 4) / 24) * Math.PI * 2));
      return (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: color,
            translate: `0px ${(-4 * wave).toFixed(2)}px`,
            opacity: 0.45 + 0.55 * wave,
          }}
        />
      );
    })}
  </div>
);

/** Soft tap ripple: a lime ring and fill expanding from a point. */
export const Ripple: React.FC<{ frame: number; at: number; x: number; y: number; size?: number; duration?: number }> = ({
  frame,
  at,
  x,
  y,
  size = 120,
  duration = 20,
}) => {
  if (frame < at || frame > at + duration) return null;
  const t = ramp(frame, at, duration);
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        border: `2px solid ${THEME.lime}`,
        background: `color-mix(in srgb, ${THEME.lime} 18%, transparent)`,
        scale: String(lerp(0.15, 1, t)),
        opacity: interpolate(t, [0, 0.15, 1], [0, 0.9, 0], clamp),
        pointerEvents: "none",
      }}
    />
  );
};

/** Skeleton line with a moving shimmer. */
export const Shimmer: React.FC<{ frame: number; width: number | string; height?: number }> = ({
  frame,
  width,
  height = 14,
}) => (
  <div
    style={{
      width,
      height,
      borderRadius: height / 2,
      background: "rgba(18, 22, 27, 0.07)",
      overflow: "hidden",
      position: "relative",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        width: "60%",
        background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 100%)",
        translate: `${(((frame * 4) % 260) - 80).toFixed(1)}% 0px`,
      }}
    />
  </div>
);

/** Characters roll up into place one after another. */
export const RollText: React.FC<{
  text: string;
  frame: number;
  start: number;
  stagger?: number;
  duration?: number;
  style?: React.CSSProperties;
}> = ({ text, frame, start, stagger = 2, duration = 12, style }) => (
  <div style={{ display: "flex", overflow: "hidden", ...style }}>
    {text.split("").map((ch, i) => {
      const t = interpolate(frame, [start + i * stagger, start + i * stagger + duration], [0, 1], {
        ...clamp,
        easing: revealEase,
      });
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            whiteSpace: "pre",
            translate: `0px ${((1 - t) * 100).toFixed(2)}%`,
            opacity: t,
          }}
        >
          {ch}
        </span>
      );
    })}
  </div>
);
