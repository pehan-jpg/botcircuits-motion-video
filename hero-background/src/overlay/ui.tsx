import type React from "react";
import { interpolate } from "remotion";
import { MOTION, STACK, THEME } from "./config";
import { inter } from "./fonts";
import { type ItemMotion, blurFilter, clamp, lerp, ramp, revealEase, stackTransform } from "./motion";

/* ---------- Typography (Inter only) ---------- */

const textBase: React.CSSProperties = {
  fontFamily: inter,
  fontVariantNumeric: "tabular-nums",
  textShadow: THEME.textShadow,
};

export const Label: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({
  children,
  color = THEME.text,
  style,
}) => (
  <div
    style={{
      ...textBase,
      fontSize: THEME.type.label.size,
      fontWeight: THEME.type.label.weight,
      letterSpacing: THEME.type.label.letterSpacing,
      textTransform: "uppercase",
      lineHeight: 1.2,
      color,
      opacity: THEME.type.label.opacity,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Title: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      ...textBase,
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
      ...textBase,
      fontSize: THEME.type.body.size,
      fontWeight: THEME.type.body.weight,
      lineHeight: 1.38,
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

/* ---------- Glass ---------- */

export type GlassVariant = "action" | "query";

const glassBackground = (variant: GlassVariant, tint: number) =>
  variant === "action"
    ? `${THEME.glass.actionSheen}, rgba(${THEME.glass.actionTint}, ${tint})`
    : `linear-gradient(${THEME.glass.queryFill}, ${THEME.glass.queryFill}), rgba(${THEME.glass.actionTint}, ${tint})`;

type GlassProps = {
  variant: GlassVariant;
  /** Alpha of the dark tint under the glass (per scene, from config). */
  tint: number;
  /** Fixed width, or "fit" to hug the content up to `maxWidth`. */
  width: number | "fit";
  maxWidth?: number;
  /** Surface height in px (animated for cards that grow upward). */
  height: number;
  /** Container transform (stack position, rise, float, exit drift). */
  transform: React.CSSProperties;
  /** Opacity + blur, applied on the surface itself. */
  fade: { opacity: number; filter?: string };
  /** Optional horizontal wipe: inset in px from the right edge. */
  clipRight?: number;
  /** Hidden top portion while the element rises into an opening slot. */
  clipTop?: number;
  radius?: number;
  surfaceStyle?: React.CSSProperties;
  children: React.ReactNode;
};

/**
 * A glass surface anchored to the bottom-right of its stack; the stack positions it with
 * `transform`. Its shadow lives on its own layer so reveals never clip it.
 */
export const Glass: React.FC<GlassProps> = ({
  variant,
  tint,
  width,
  maxWidth,
  height,
  transform,
  fade,
  clipRight = 0,
  clipTop = 0,
  radius: radiusProp,
  surfaceStyle,
  children,
}) => {
  const radius = radiusProp ?? THEME.glass.radius;
  const w = typeof width === "number" ? width : undefined;
  const clipped = clipRight > 0.01 || clipTop > 0.01;
  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        bottom: 0,
        width: width === "fit" ? "max-content" : width,
        maxWidth,
        transformOrigin: "100% 100%",
        ...transform,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          borderRadius: radius,
          boxShadow: THEME.glass.shadow,
          transformOrigin: "0 100%",
          scale: clipped ? `${w ? 1 - clipRight / w : 1} ${Math.max(0, 1 - clipTop / height)}` : undefined,
          opacity: fade.opacity,
        }}
      />
      <div
        style={{
          position: "relative",
          boxSizing: "border-box",
          height,
          overflow: "hidden",
          background: glassBackground(variant, tint),
          backdropFilter: THEME.glass.backdropFilter,
          WebkitBackdropFilter: THEME.glass.backdropFilter,
          border: THEME.glass.border,
          boxShadow: THEME.glass.innerHighlight,
          borderRadius: radius,
          clipPath: clipped
            ? `inset(${clipTop.toFixed(2)}px ${clipRight.toFixed(2)}px 0px 0px round ${Math.min(radius, height / 2).toFixed(2)}px)`
            : undefined,
          ...fade,
          ...surfaceStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** The single right-aligned column; its bottom edge sits at `bottom` and elements stack upward. */
export const Stack: React.FC<{ bottom: number; children: React.ReactNode }> = ({ bottom, children }) => (
  <div style={{ position: "absolute", left: STACK.left, top: 0, width: STACK.width, height: bottom }}>{children}</div>
);

/** Word-by-word reveal: each word fades in from a short blur. */
export const WordReveal: React.FC<{ text: string; frame: number; start: number }> = ({ text, frame, start }) => {
  const q = MOTION.query;
  return (
    <>
      {text.split(" ").map((word, i) => {
        const t = ramp(frame, start + i * q.wordStagger, q.wordFrames);
        return (
          <span key={i}>
            <span style={{ display: "inline-block", opacity: t, filter: blurFilter(q.wordBlurPx * (1 - t)) }}>{word}</span>{" "}
          </span>
        );
      })}
    </>
  );
};

/** Customer query bubble; dims once the action card arrives. */
export const QueryBubble: React.FC<{
  frame: number;
  text: string;
  enter: number;
  dimAt: number;
  tint: number;
  motion: ItemMotion;
  /** Vertical position relative to the stack bottom (negative = up). */
  y: number;
}> = ({ frame, text, enter, dimAt, tint, motion, y }) => {
  if (!motion.visible) return null;
  const dim = lerp(1, MOTION.query.dimTo, ramp(frame, dimAt, MOTION.query.dimFrames));

  return (
    <Glass
      variant="query"
      tint={tint}
      width="fit"
      maxWidth={STACK.queryMaxWidth}
      height={STACK.queryHeight}
      transform={stackTransform(y, motion.scale)}
      fade={{ ...motion.fade, opacity: motion.fade.opacity * dim }}
      surfaceStyle={{ padding: "11px 18px 12px", textAlign: "right" }}
    >
      <Label>Customer</Label>
      <div
        style={{
          ...textBase,
          marginTop: 4,
          fontSize: THEME.type.query.size,
          fontWeight: THEME.type.query.weight,
          lineHeight: 1.36,
          color: THEME.text,
          textWrap: "balance",
        }}
      >
        <WordReveal text={text} frame={frame} start={enter + MOTION.query.wordDelay} />
      </div>
    </Glass>
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
        background: `color-mix(in srgb, ${THEME.lime} 22%, transparent)`,
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
      background: THEME.shimmerBase,
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
        background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, ${THEME.shimmerHighlight} 50%, rgba(255,255,255,0) 100%)`,
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
}> = ({ text, frame, start, stagger = 1, duration = 12, style }) => (
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
