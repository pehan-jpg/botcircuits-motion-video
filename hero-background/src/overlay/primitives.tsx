/**
 * Shared animation primitives. Every timing (seconds) and size comes from PRIMITIVES in
 * config.ts, and every function takes the current time `t` in seconds, so renders are
 * deterministic at any frame rate. No blur and no scale anywhere: positions use translate3d,
 * everything else is opacity or stroke drawing.
 */
import { getLength, getPointAtLength, getTangentAtLength } from "@remotion/paths";
import type React from "react";
import { PRIMITIVES as P, THEME } from "./config";
import { inter } from "./fonts";
import { easeIn01, linear01, rowAppear, translateY } from "./motion";
import { Body, Label, TEXT_CLASS, textBase } from "./ui";

/* ---------- Glyphs ---------- */

/** Material "flight" glyph (Apache 2.0), points up. */
export const PLANE_PATH =
  "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z";

/** Material "local_shipping" glyph (Apache 2.0): a delivery van facing right. */
export const VAN_PATH =
  "M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z";

const SHIELD_PATH = "M12 2.6 L19.6 5.6 V11.6 C19.6 16.4 16.4 20.1 12 21.6 C7.6 20.1 4.4 16.4 4.4 11.6 V5.6 Z";

/** Small lime tile with the plane glyph (travel header). */
export const LimeIcon: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 7,
      background: THEME.lime,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" style={{ rotate: "45deg" }}>
      <path d={PLANE_PATH} fill={THEME.onLime} />
    </svg>
  </div>
);

/** Static skeleton lines for the loading state (the shimmer sweep is dropped). */
export const SkeletonLines: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{ width: "100%", height: 12, borderRadius: 6, background: THEME.skeleton }} />
    <div style={{ width: "68%", height: 12, borderRadius: 6, background: THEME.skeleton }} />
  </div>
);

/* ---------- Ring draw and button press ---------- */

/** A 1.5px lime ring drawn around a row (stroke-dashoffset). */
export const RingDraw: React.FC<{ t: number; at: number; width: number; height: number; radius: number }> = ({ t, at, width, height, radius }) => {
  const d = P.ringDraw;
  const k = easeIn01(t, at, d.duration);
  if (k <= 0) return null;
  const inset = d.strokePx / 2;
  return (
    <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      <rect
        x={inset}
        y={inset}
        width={width - d.strokePx}
        height={height - d.strokePx}
        rx={radius}
        fill="none"
        stroke={THEME.lime}
        strokeWidth={d.strokePx}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - k}
      />
    </svg>
  );
};

/** Lime button; a press brightens the fill 8% and back (no scale, so the text never resizes). */
export const LimeButton: React.FC<{ t: number; pressAt: number; children: React.ReactNode }> = ({ t, pressAt, children }) => {
  const half = P.press.duration / 2;
  const k = t < pressAt + half ? linear01(t, pressAt, half) : 1 - linear01(t, pressAt + half, half);
  return (
    <div
      style={{
        position: "relative",
        height: 32,
        padding: "0 14px",
        borderRadius: 16,
        background: THEME.lime,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "#FFFFFF", opacity: P.press.brighten * k }} />
      <span
        className={TEXT_CLASS}
        style={{ position: "relative", fontFamily: inter, fontSize: 16, fontWeight: 600, lineHeight: "20px", color: THEME.onLime }}
      >
        {children}
      </span>
    </div>
  );
};

/* ---------- Checks and spinners ---------- */

/** A check path drawn with stroke-dashoffset (progress 0 → 1); the stroke is a true `strokePx`. */
export const CheckMark: React.FC<{ progress: number; size: number; color?: string; strokePx?: number }> = ({
  progress,
  size,
  color = P.check.color,
  strokePx = P.check.strokePx,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path
      d="M6.5 12.5l3.6 3.6 7.4-8.1"
      pathLength={1}
      stroke={color}
      strokeWidth={(strokePx * 24) / size}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={1}
      strokeDashoffset={1 - progress}
      opacity={progress > 0 ? 1 : 0}
    />
  </svg>
);

/** Check draw: a lime circle fades in, then the dark check draws. */
export const CheckDraw: React.FC<{ t: number; start: number; size: number }> = ({ t, start, size }) => {
  const c = P.check;
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
        opacity: linear01(t, start, c.circleFade),
        flexShrink: 0,
      }}
    >
      <CheckMark progress={easeIn01(t, start + c.circleFade, c.drawDuration)} size={size * 0.8} />
    </div>
  );
};

/**
 * Spinner to check: an 18px ring with a 90° lime arc turning once per 0.667 s. At `done` the
 * rotation stops, the arc closes into a full circle, the circle fills lime, and the check draws.
 */
export const SpinnerCheck: React.FC<{ t: number; start: number; done: number }> = ({ t, start, done }) => {
  const s = P.spinner;
  const size = s.sizePx;
  const r = (size - s.strokePx) / 2;
  const arc = s.arcDeg / 360 + (1 - s.arcDeg / 360) * easeIn01(t, done, s.extend);
  const filled = done + s.extend;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ position: "absolute", inset: 0, rotate: `${(((Math.min(t, done) - start) / s.turnSeconds) * 360) % 360}deg` }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.track} strokeWidth={s.strokePx} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={THEME.lime}
          strokeWidth={s.strokePx}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${arc.toFixed(4)} 1`}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: THEME.lime, opacity: linear01(t, filled, s.fill) }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CheckMark progress={easeIn01(t, filled + s.fill, s.draw)} size={size * 0.9} />
      </div>
    </div>
  );
};

/** When a spinner that completes at `done` has finished drawing its check. */
export const spinnerDoneEnd = (done: number) => done + P.spinner.extend + P.spinner.fill + P.spinner.draw;

/** A step row: appears (fade + 8px rise, or present from the start), spins, then completes at `done`. */
export const StepRow: React.FC<{ t: number; label: string; appearAt: number | null; spinStart: number; done: number; height: number }> = ({
  t,
  label,
  appearAt,
  spinStart,
  done,
  height,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, height, ...rowAppear(t, appearAt) }}>
    <div style={{ width: 22, display: "flex", justifyContent: "center", flexShrink: 0 }}>
      <SpinnerCheck t={t} start={spinStart} done={done} />
    </div>
    <Body style={{ whiteSpace: "nowrap" }}>{label}</Body>
  </div>
);

/** 3px lime bar at the top of a card; advances one equal share per step, eased over that step. */
export const StepProgressBar: React.FC<{ t: number; steps: readonly { start: number; end: number }[] }> = ({ t, steps }) => {
  const progress = steps.reduce((sum, s) => sum + easeIn01(t, s.start, s.end - s.start), 0) / steps.length;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: P.stepBar.heightPx, background: THEME.subtleFill }}>
      <div style={{ width: "100%", height: "100%", background: THEME.lime, transformOrigin: "0 50%", scale: `${progress.toFixed(4)} 1` }} />
    </div>
  );
};

/* ---------- Dashed route draw ---------- */

/**
 * A dashed path revealed by a solid mask stroke (so the dashes stay intact), with a lime glyph
 * travelling along it at the same length, rotated to the tangent.
 */
export const RouteDraw: React.FC<{ id: string; t: number; start: number; width: number; height: number; d: string; glyph: "plane" | "van" }> = ({
  id,
  t,
  start,
  width,
  height,
  d,
  glyph,
}) => {
  const r = P.route;
  const length = getLength(d);
  const k = easeIn01(t, start, r.duration);
  const at = Math.max(0.001, length * k);
  const point = getPointAtLength(d, at) ?? { x: 0, y: 0 };
  const tangent = getTangentAtLength(d, at) ?? { x: 1, y: 0 };
  const angle = (Math.atan2(tangent.y, tangent.x) * 180) / Math.PI + (glyph === "plane" ? 90 : 0);
  const startPoint = getPointAtLength(d, 0) ?? { x: 0, y: 0 };
  const endPoint = getPointAtLength(d, length) ?? { x: 0, y: 0 };
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={-30} y={-30} width={width + 60} height={height + 60}>
          <path d={d} fill="none" stroke="white" strokeWidth={8} strokeDasharray={length} strokeDashoffset={length * (1 - k)} />
        </mask>
      </defs>
      <path d={d} fill="none" stroke={THEME.textSecondary} strokeWidth={2} strokeDasharray={`${r.dash} ${r.gap}`} mask={`url(#${id})`} />
      <circle cx={startPoint.x} cy={startPoint.y} r={4} fill={THEME.text} />
      <circle cx={endPoint.x} cy={endPoint.y} r={4} fill={THEME.text} opacity={k >= 0.999 ? 1 : 0.35} />
      <g transform={`translate(${point.x.toFixed(2)} ${point.y.toFixed(2)}) rotate(${angle.toFixed(2)})`}>
        <circle r={12} fill={THEME.lime} />
        <g transform="translate(-7.5 -7.5) scale(0.625)">
          <path d={glyph === "plane" ? PLANE_PATH : VAN_PATH} fill={THEME.onLime} />
        </g>
      </g>
    </svg>
  );
};

/* ---------- Digit roll ---------- */

/** Each character slides up from +100% inside its own overflow-hidden column, staggered left to right. */
export const DigitRoll: React.FC<{ text: string; t: number; start: number; lineHeight: number }> = ({ text, t, start, lineHeight }) => (
  <div style={{ display: "flex", height: lineHeight }}>
    {text.split("").map((ch, i) => {
      const k = easeIn01(t, start + i * P.digitRoll.stagger, P.digitRoll.duration);
      return (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", height: lineHeight, whiteSpace: "pre" }}>
          <span style={{ display: "inline-block", ...translateY(lineHeight * (1 - k)) }}>{ch}</span>
        </span>
      );
    })}
  </div>
);

/** A label + value pair whose value rolls in character by character (the label is present with the card). */
export const RollingDetail: React.FC<{ t: number; label: string; value: string; start: number; valueHeight: number }> = ({
  t,
  label,
  value,
  start,
  valueHeight,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
    <Label>{label}</Label>
    <div
      className={TEXT_CLASS}
      style={{ ...textBase, fontSize: THEME.type.title.size, fontWeight: THEME.type.title.weight, color: THEME.text, lineHeight: `${valueHeight}px` }}
    >
      <DigitRoll text={value} t={t} start={start} lineHeight={valueHeight} />
    </div>
  </div>
);

/* ---------- Segmented bar ---------- */

/** Four 6px segments; the first `filled` fill lime left to right, staggered. Stage labels sit beneath. */
export const SegmentedBar: React.FC<{ t: number; start: number; filled: number; labels: readonly string[] }> = ({ t, start, filled, labels }) => {
  const s = P.segments;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${s.count}, 1fr)`, columnGap: 6, rowGap: 6 }}>
      {labels.map((_, k) => (
        <div key={k} style={{ height: s.heightPx, borderRadius: s.radius, background: s.track, overflow: "hidden" }}>
          {k < filled ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: THEME.lime,
                transformOrigin: "0 50%",
                scale: `${easeIn01(t, start + k * s.stagger, s.fill).toFixed(4)} 1`,
              }}
            />
          ) : null}
        </div>
      ))}
      {labels.map((label, k) => (
        <div
          key={label}
          className={TEXT_CLASS}
          style={{
            ...textBase,
            fontSize: 11,
            fontWeight: 600,
            lineHeight: "14px",
            whiteSpace: "nowrap",
            color: k === filled - 1 ? THEME.text : THEME.textSecondary,
          }}
        >
          {label}
        </div>
      ))}
    </div>
  );
};

/* ---------- Tag ticks ---------- */

/** Two ticks that draw one after another, then both turn lime. */
export const TagTicks: React.FC<{ t: number; start: number }> = ({ t, start }) => {
  const g = P.tag;
  const a = easeIn01(t, start, g.tickDuration);
  const b = easeIn01(t, start + g.tickStagger, g.tickDuration);
  const lime = linear01(t, start + g.tickStagger + g.tickDuration, g.limeFade);
  const tick = (d: string, progress: number, color: string, opacity: number) => (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - progress}
      opacity={progress > 0 ? opacity : 0}
    />
  );
  const t1 = "M3 10.5l4 4 9-9.5";
  const t2 = "M12.5 13l1.5 1.5 9-9.5";
  return (
    <svg width={26} height={18} viewBox="0 0 28 20" style={{ flexShrink: 0 }}>
      {tick(t1, a, THEME.text, 1 - lime)}
      {tick(t2, b, THEME.text, 1 - lime)}
      {tick(t1, a, THEME.lime, lime)}
      {tick(t2, b, THEME.lime, lime)}
    </svg>
  );
};

/* ---------- Pill pop ---------- */

/** A lime pill that fades in (no scale), then its check draws (at `checkAt`, or right after the fade). */
export const PillPop: React.FC<{ t: number; at: number; checkAt?: number; small?: boolean; children: React.ReactNode }> = ({
  t,
  at,
  checkAt,
  small = false,
  children,
}) => {
  const p = P.pill;
  const checkStart = checkAt ?? at + p.fade + p.checkDelay;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: small ? 22 : 28,
        padding: small ? "0 9px 0 6px" : "0 14px 0 8px",
        borderRadius: 999,
        background: THEME.lime,
        opacity: linear01(t, at, p.fade),
        whiteSpace: "nowrap",
      }}
    >
      <CheckMark progress={easeIn01(t, checkStart, p.check)} size={small ? 14 : 18} />
      <span
        className={TEXT_CLASS}
        style={{
          fontFamily: inter,
          color: THEME.onLime,
          fontWeight: 600,
          fontSize: small ? 11 : 16,
          lineHeight: small ? "14px" : "20px",
          letterSpacing: small ? THEME.type.label.letterSpacing : undefined,
          textTransform: small ? "uppercase" : undefined,
        }}
      >
        {children}
      </span>
    </div>
  );
};

/* ---------- Shield draw and orb ---------- */

/** The shield outline draws, fills with a light lime tint, then a check draws inside. */
export const ShieldDraw: React.FC<{ t: number; start: number; size: number }> = ({ t, start, size }) => {
  const s = P.shield;
  const outline = easeIn01(t, start, s.draw);
  const fill = linear01(t, start + s.draw, s.fill);
  const check = easeIn01(t, start + s.draw + s.fill, s.check);
  const stroke = (s.strokePx * 24) / size;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0, overflow: "visible" }}>
      <path d={SHIELD_PATH} fill={THEME.lime} fillOpacity={s.fillAlpha * fill} stroke="none" />
      <path
        d={SHIELD_PATH}
        fill="none"
        stroke={THEME.lime}
        strokeWidth={stroke}
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - outline}
        opacity={outline > 0 ? 1 : 0}
      />
      <path
        d="M8.6 12.2l2.4 2.4 4.6-5"
        fill="none"
        stroke={THEME.lime}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - check}
        opacity={check > 0 ? 1 : 0}
      />
    </svg>
  );
};

/** Static lime orb for the AI concierge header (pulse and halo dropped so the card stays still). */
export const Orb: React.FC = () => (
  <div
    style={{
      width: P.orb.sizePx,
      height: P.orb.sizePx,
      borderRadius: "50%",
      flexShrink: 0,
      background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9) 0%, ${THEME.lime} 55%, ${THEME.lime} 100%)`,
      boxShadow: `0 0 10px color-mix(in srgb, ${THEME.lime} 55%, transparent)`,
    }}
  />
);
