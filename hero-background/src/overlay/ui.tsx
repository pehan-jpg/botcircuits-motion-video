import type React from "react";
import { MOTION, STACK, THEME } from "./config";
import { inter } from "./fonts";
import { type ItemMotion, blurFilter, lerp, ramp, stackTransform } from "./motion";

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

/** Customer query bubble with its industry label; dims once the action card arrives. */
export const QueryBubble: React.FC<{
  frame: number;
  /** Small label above the query, e.g. "Customer · Travel". */
  label: string;
  text: string;
  enter: number;
  dimAt: number;
  tint: number;
  motion: ItemMotion;
  /** Vertical position relative to the stack bottom (negative = up). */
  y: number;
}> = ({ frame, label, text, enter, dimAt, tint, motion, y }) => {
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
      <Label>{label}</Label>
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
