import type React from "react";
import { LINES, STACK, STACK_CONTAINER_HEIGHT, THEME } from "./config";
import { inter } from "./fonts";
import { softEdgeMask } from "./motion";

/* ---------- Typography (Inter only, integer sizes, line height 1.3) ---------- */

/** Class on every text element, so verification renders can hide text to sample the glass behind it. */
export const TEXT_CLASS = "ovl-text";

export const textBase: React.CSSProperties = {
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
    className={TEXT_CLASS}
    style={{
      ...textBase,
      fontSize: THEME.type.label.size,
      fontWeight: THEME.type.label.weight,
      letterSpacing: THEME.type.label.letterSpacing,
      textTransform: "uppercase",
      lineHeight: `${LINES.label}px`,
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
    className={TEXT_CLASS}
    style={{
      ...textBase,
      fontSize: THEME.type.title.size,
      fontWeight: THEME.type.title.weight,
      lineHeight: `${LINES.title}px`,
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
    className={TEXT_CLASS}
    style={{
      ...textBase,
      fontSize: THEME.type.body.size,
      fontWeight: THEME.type.body.weight,
      lineHeight: `${LINES.body}px`,
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

/* ---------- Stack container and glass items ---------- */

/**
 * The single right-aligned column. Its bottom edge sits `maskBottomPx` below the scene's stack
 * anchor, so resting cards (bottom edge on the anchor) are fully opaque and new cards rise in
 * through the soft bottom band.
 */
export const Stack: React.FC<{ bottom: number; children: React.ReactNode }> = ({ bottom, children }) => (
  <div
    style={{
      position: "absolute",
      left: STACK.left,
      top: bottom + STACK.maskBottomPx - STACK_CONTAINER_HEIGHT,
      width: STACK.width,
      height: STACK_CONTAINER_HEIGHT,
    }}
  >
    {children}
  </div>
);

/** Average mask alpha over a card's vertical extent: dims the card's shadow as it passes the soft edges. */
const maskCoverage = (top: number, height: number) => {
  const h = STACK_CONTAINER_HEIGHT;
  let sum = 0;
  const n = 16;
  for (let i = 0; i < n; i++) {
    const y = top + ((i + 0.5) / n) * height;
    const a = y < 0 ? 0 : y < STACK.maskTopPx ? y / STACK.maskTopPx : y < h - STACK.maskBottomPx ? 1 : y < h ? (h - y) / STACK.maskBottomPx : 0;
    sum += a;
  }
  return sum / n;
};

export type GlassVariant = "action" | "query";

const glassBackground = (variant: GlassVariant, tint: number) =>
  variant === "action"
    ? `${THEME.glass.actionSheen}, rgba(${THEME.glass.actionRgb}, ${tint})`
    : `rgba(${THEME.glass.queryRgb}, ${tint})`;

type GlassProps = {
  variant: GlassVariant;
  /** Fill alpha (per scene, from config). */
  tint: number;
  /** Fixed width, or "fit" to hug the content up to `maxWidth`. */
  width: number | "fit";
  maxWidth?: number;
  /** Surface height in px (animated for cards that grow upward). */
  height: number;
  /** Vertical offset of the bottom edge from the stack anchor (px, down positive). */
  y: number;
  /** Surface opacity (entrance fade × exit fade × dim). */
  opacity: number;
  /** Content opacity (fades in 2 frames after the surface). */
  textOpacity: number;
  radius?: number;
  surfaceStyle?: React.CSSProperties;
  children: React.ReactNode;
};

/**
 * A glass card bottom-anchored in the stack and positioned with translate3d only. The soft
 * edge mask sits on the surface itself; the shadow is a separate layer that fades with it.
 */
export const Glass: React.FC<GlassProps> = ({
  variant,
  tint,
  width,
  maxWidth,
  height,
  y,
  opacity,
  textOpacity,
  radius: radiusProp,
  surfaceStyle,
  children,
}) => {
  const radius = radiusProp ?? THEME.glass.radius;
  const top = STACK_CONTAINER_HEIGHT - STACK.maskBottomPx - height + y;
  const isAction = variant === "action";
  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        // Positioned with a layout offset rather than a transform (see translateY in motion.ts).
        bottom: `${(STACK.maskBottomPx - y).toFixed(3)}px`,
        width: width === "fit" ? "max-content" : width,
        maxWidth,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height,
          borderRadius: radius,
          boxShadow: THEME.glass.shadow,
          opacity: opacity * maskCoverage(top, height),
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
          border: isAction ? THEME.glass.border : "none",
          boxShadow: isAction ? THEME.glass.innerHighlight : undefined,
          borderRadius: radius,
          opacity,
          ...softEdgeMask(top),
          ...surfaceStyle,
        }}
      >
        <div style={{ opacity: textOpacity, height: "100%" }}>{children}</div>
      </div>
    </div>
  );
};

/** Customer query bubble: dark glass, no border, right-aligned text hugging its content up to 400px. */
export const QueryBubble: React.FC<{
  /** Small label above the query, e.g. "Customer · Travel". */
  label: string;
  text: string;
  tint: number;
  height: number;
  y: number;
  opacity: number;
  textOpacity: number;
}> = ({ label, text, tint, height, y, opacity, textOpacity }) => (
  <Glass
    variant="query"
    tint={tint}
    width="fit"
    maxWidth={STACK.queryMaxWidth}
    height={height}
    y={y}
    opacity={opacity}
    textOpacity={textOpacity}
    surfaceStyle={{ padding: `${THEME.query.padY}px ${THEME.query.padX}px`, textAlign: "right" }}
  >
    <Label>{label}</Label>
    <div
      className={TEXT_CLASS}
      style={{
        ...textBase,
        marginTop: THEME.query.labelGap,
        fontSize: THEME.type.query.size,
        fontWeight: THEME.type.query.weight,
        lineHeight: `${LINES.body}px`,
        color: THEME.text,
        textWrap: "balance",
      }}
    >
      {text}
    </div>
  </Glass>
);
