/**
 * Shared animation primitives (spec section B). Every scene builds its motion from these,
 * and every timing and size comes from PRIMITIVES in config.ts. All motion is a pure function
 * of the frame, so renders are deterministic.
 */
import { getLength, getPointAtLength, getTangentAtLength } from "@remotion/paths";
import type React from "react";
import { interpolate, spring } from "remotion";
import { MOTION, PRIMITIVES as P, THEME } from "./config";
import { inter } from "./fonts";
import { clamp, easeInOut, easeOut, lerp, ramp } from "./motion";
import { Body, Label } from "./ui";

/* ---------- Glyphs ---------- */

/** Material "flight" glyph (Apache 2.0), points up. */
export const PLANE_PATH =
  "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z";

/** Material "local_shipping" glyph (Apache 2.0): a delivery van facing right. */
export const VAN_PATH =
  "M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z";

const SHIELD_PATH = "M12 2.6 L19.6 5.6 V11.6 C19.6 16.4 16.4 20.1 12 21.6 C7.6 20.1 4.4 16.4 4.4 11.6 V5.6 Z";

/** Small lime tile with the plane glyph (travel header). */
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

/* ---------- Skeleton shimmer and wave loader ---------- */

const ShimmerLine: React.FC<{ frame: number; start: number; width: string }> = ({ frame, start, width }) => {
  const s = P.shimmer;
  const t = easeInOut((((frame - start) % s.periodFrames) + s.periodFrames) % s.periodFrames / s.periodFrames);
  return (
    <div style={{ width, height: s.lineHeight, borderRadius: s.radius, background: s.fill, overflow: "hidden", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: "45%",
          background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, ${s.highlight} 50%, rgba(255,255,255,0) 100%)`,
          translate: `${lerp(-100, 222, t).toFixed(2)}% 0px`,
        }}
      />
    </div>
  );
};

/** Two rounded skeleton lines with a highlight band sweeping left to right every 24 frames. */
export const SkeletonShimmer: React.FC<{ frame: number; start: number }> = ({ frame, start }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: ramp(frame, start, P.shimmer.fadeInFrames) }}>
    <ShimmerLine frame={frame} start={start} width="100%" />
    <ShimmerLine frame={frame} start={start} width="68%" />
  </div>
);

/** Three lime dots moving in a sine wave, offset 4 frames per dot. */
export const WaveLoader: React.FC<{ frame: number }> = ({ frame }) => {
  const w = P.wave;
  return (
    <div style={{ display: "flex", gap: w.dotPx * 0.8, alignItems: "center", height: w.dotPx + w.amplitudePx * 2 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: w.dotPx,
            height: w.dotPx,
            borderRadius: "50%",
            background: THEME.lime,
            translate: `0px ${(w.amplitudePx * Math.sin(((frame - i * w.dotOffsetFrames) / w.periodFrames) * Math.PI * 2)).toFixed(2)}px`,
          }}
        />
      ))}
    </div>
  );
};

/* ---------- Tap ripple, ring draw, button press ---------- */

/** A circle growing to 56px and fading out over 16 frames, centred on the tap point. */
export const TapRipple: React.FC<{ frame: number; at: number; x: number; y: number }> = ({ frame, at, x, y }) => {
  const r = P.ripple;
  if (frame < at || frame > at + r.frames) return null;
  const t = ramp(frame, at, r.frames);
  return (
    <div
      style={{
        position: "absolute",
        left: x - r.sizePx / 2,
        top: y - r.sizePx / 2,
        width: r.sizePx,
        height: r.sizePx,
        borderRadius: "50%",
        background: THEME.lime,
        scale: String(t),
        opacity: r.opacity * (1 - t),
        pointerEvents: "none",
      }}
    />
  );
};

/** A 1.5px lime ring that draws around a row (stroke-dashoffset) over 10 frames. */
export const RingDraw: React.FC<{ frame: number; at: number; width: number; height: number; radius: number }> = ({
  frame,
  at,
  width,
  height,
  radius,
}) => {
  const d = P.ringDraw;
  const t = ramp(frame, at, d.frames);
  if (t <= 0) return null;
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
        strokeDashoffset={1 - t}
      />
    </svg>
  );
};

/** Press: scale 1 → 0.96 → 1 over 8 frames; the fill brightens 8% at the lowest point. */
export const pressStyle = (frame: number, at: number) => {
  const p = P.press;
  const k = interpolate(frame, [at, at + p.frames / 2, at + p.frames], [0, 1, 0], clamp);
  return { scale: lerp(1, p.scale, k), brighten: p.brighten * k };
};

export const LimeButton: React.FC<{ frame: number; pressAt: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  frame,
  pressAt,
  style,
  children,
}) => {
  const press = pressStyle(frame, pressAt);
  return (
    <div
      style={{
        position: "relative",
        height: 38,
        padding: "0 16px",
        borderRadius: 19,
        background: THEME.lime,
        color: THEME.onLime,
        fontFamily: inter,
        fontSize: THEME.type.button.size,
        fontWeight: THEME.type.button.weight,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        ...style,
        scale: String(press.scale * Number(style?.scale ?? 1)),
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "#FFFFFF", opacity: press.brighten }} />
      <span style={{ position: "relative" }}>{children}</span>
    </div>
  );
};

/* ---------- Checks and spinners ---------- */

/** A check path drawn with stroke-dashoffset (progress 0 → 1), with a true 2.5px stroke. */
export const CheckMark: React.FC<{ progress: number; size: number; color?: string; strokePx?: number }> = ({
  progress,
  size,
  color = P.check.color,
  strokePx = P.check.strokePx,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
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

/** Check draw: a lime circle springs 0.6 → 1 over 8 frames, then the dark check draws over 10 frames. */
export const CheckDraw: React.FC<{ frame: number; fps: number; start: number; size: number }> = ({ frame, fps, start, size }) => {
  const c = P.check;
  const pop = spring({ frame: frame - start, fps, config: MOTION.spring, durationInFrames: c.circleFrames });
  const draw = ramp(frame, start + c.circleFrames, c.drawFrames, easeOut);
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
        opacity: ramp(frame, start, 4),
        scale: String(lerp(0.6, 1, pop)),
        flexShrink: 0,
      }}
    >
      <CheckMark progress={draw} size={size * 0.8} />
    </div>
  );
};

/**
 * Spinner to check: an 18px ring with a 90° lime arc turning once per 20 frames. At `done` the arc
 * extends to a full circle over 6 frames, the circle fills lime, and the check draws.
 */
export const SpinnerCheck: React.FC<{ frame: number; start: number; done: number }> = ({ frame, start, done }) => {
  const s = P.spinner;
  const size = s.sizePx;
  const r = (size - s.strokePx) / 2;
  const arc = lerp(s.arcDeg / 360, 1, ramp(frame, done, s.extendFrames, easeInOut));
  const filled = done + s.extendFrames;
  const fill = ramp(frame, filled, 4);
  const draw = ramp(frame, filled, P.check.drawFrames, easeOut);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ position: "absolute", inset: 0, rotate: `${((frame - start) / s.turnFrames) * 360}deg` }}>
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
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: THEME.lime, opacity: fill }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CheckMark progress={draw} size={size * 0.9} />
      </div>
    </div>
  );
};

/** A step row: enters over 10 frames (fade, 10px rise), then runs spinner to check, completing at `end`. */
export const StepRow: React.FC<{ frame: number; label: string; start: number; end: number }> = ({ frame, label, start, end }) => {
  const e = P.stepEnter;
  const t = ramp(frame, start, e.frames);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, height: 30, opacity: t, translate: `0px ${(e.translatePx * (1 - t)).toFixed(2)}px` }}>
      <div style={{ width: 26, display: "flex", justifyContent: "center", flexShrink: 0 }}>
        <SpinnerCheck frame={frame} start={start} done={end - P.stepCompleteLead} />
      </div>
      <Body style={{ whiteSpace: "nowrap" }}>{label}</Body>
    </div>
  );
};

/** 3px lime bar at the top of a card; advances one equal share per step, eased over that step. */
export const StepProgressBar: React.FC<{ frame: number; steps: readonly { start: number; end: number }[] }> = ({ frame, steps }) => {
  const progress = steps.reduce((sum, s) => sum + ramp(frame, s.start, s.end - s.start, easeInOut), 0) / steps.length;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: P.stepBar.heightPx, background: THEME.subtleFill }}>
      <div style={{ width: "100%", height: "100%", background: THEME.lime, transformOrigin: "0 50%", scale: `${progress.toFixed(4)} 1` }} />
    </div>
  );
};

/* ---------- Clip path wipe ---------- */

/** Right inset (px) of a left-to-right clip-path wipe over 22 frames. */
export const wipeInset = (frame: number, start: number, width: number) => width * (1 - ramp(frame, start, P.wipe.frames));

/* ---------- Dashed route draw ---------- */

/**
 * A dashed path revealed by a solid mask stroke (so the dashes stay intact), with a lime glyph
 * travelling along it at the same length, rotated to the tangent, ending in a soft pulse ring.
 */
export const RouteDraw: React.FC<{
  id: string;
  frame: number;
  start: number;
  width: number;
  height: number;
  d: string;
  glyph: "plane" | "van";
}> = ({ id, frame, start, width, height, d, glyph }) => {
  const r = P.route;
  const length = getLength(d);
  const t = ramp(frame, start, r.frames, easeInOut);
  const at = Math.max(0.001, length * t);
  const point = getPointAtLength(d, at) ?? { x: 0, y: 0 };
  const tangent = getTangentAtLength(d, at) ?? { x: 1, y: 0 };
  const angle = (Math.atan2(tangent.y, tangent.x) * 180) / Math.PI + (glyph === "plane" ? 90 : 0);
  const startPoint = getPointAtLength(d, 0) ?? { x: 0, y: 0 };
  const endPoint = getPointAtLength(d, length) ?? { x: 0, y: 0 };
  const pulse = ramp(frame, start + r.frames, r.pulseFrames, easeOut);
  const pulseOn = frame >= start + r.frames && pulse < 1;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible", opacity: ramp(frame, start, 6) }}>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={-30} y={-30} width={width + 60} height={height + 60}>
          <path d={d} fill="none" stroke="white" strokeWidth={8} strokeDasharray={length} strokeDashoffset={length * (1 - t)} />
        </mask>
      </defs>
      <path d={d} fill="none" stroke={THEME.textSecondary} strokeWidth={2} strokeDasharray={`${r.dash} ${r.gap}`} mask={`url(#${id})`} />
      <circle cx={startPoint.x} cy={startPoint.y} r={4} fill={THEME.text} />
      <circle cx={endPoint.x} cy={endPoint.y} r={4} fill={THEME.text} opacity={ramp(frame, start + r.frames - 6, 6)} />
      {pulseOn ? (
        <circle
          cx={endPoint.x}
          cy={endPoint.y}
          r={13 * lerp(1, r.pulseScale, pulse)}
          fill="none"
          stroke={THEME.lime}
          strokeWidth={2}
          opacity={r.pulseOpacity * (1 - pulse)}
        />
      ) : null}
      <g transform={`translate(${point.x.toFixed(2)} ${point.y.toFixed(2)}) rotate(${angle.toFixed(2)})`}>
        <circle r={13} fill={THEME.lime} />
        <g transform="translate(-8 -8) scale(0.6667)">
          <path d={glyph === "plane" ? PLANE_PATH : VAN_PATH} fill={THEME.onLime} />
        </g>
      </g>
    </svg>
  );
};

/* ---------- Digit roll ---------- */

/** Each character slides up from +100% inside its own overflow-hidden column, 2 frames apart. */
export const DigitRoll: React.FC<{ text: string; frame: number; start: number; lineHeight: number }> = ({ text, frame, start, lineHeight }) => (
  <div style={{ display: "flex", height: lineHeight }}>
    {text.split("").map((ch, i) => {
      const t = ramp(frame, start + i * P.digitRoll.staggerFrames, P.digitRoll.frames);
      return (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", height: lineHeight, whiteSpace: "pre" }}>
          <span style={{ display: "inline-block", translate: `0px ${((1 - t) * 100).toFixed(2)}%` }}>{ch}</span>
        </span>
      );
    })}
  </div>
);

/** When the last character of a DigitRoll has settled. */
export const digitRollEnd = (text: string, start: number) => start + (text.length - 1) * P.digitRoll.staggerFrames + P.digitRoll.frames;

/* ---------- Segmented bar ---------- */

/** Four 6px segments; the first `filled` fill lime left to right over 10 frames, 4 frames apart. */
export const SegmentedBar: React.FC<{ frame: number; start: number; filled: number; labels: readonly string[] }> = ({
  frame,
  start,
  filled,
  labels,
}) => {
  const s = P.segments;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${s.count}, 1fr)`, columnGap: 6, rowGap: 7 }}>
      {labels.map((_, k) => (
        <div key={k} style={{ height: s.heightPx, borderRadius: s.radius, background: s.track, overflow: "hidden" }}>
          {k < filled ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: THEME.lime,
                transformOrigin: "0 50%",
                scale: `${ramp(frame, start + k * s.staggerFrames, s.fillFrames, easeOut).toFixed(4)} 1`,
              }}
            />
          ) : null}
        </div>
      ))}
      {labels.map((label, k) => (
        <div
          key={label}
          style={{
            fontFamily: inter,
            fontSize: 12,
            fontWeight: 500,
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            color: k === filled - 1 ? THEME.text : THEME.textSecondary,
            textShadow: THEME.textShadow,
            opacity: ramp(frame, start + k * s.staggerFrames, s.fillFrames),
          }}
        >
          {label}
        </div>
      ))}
    </div>
  );
};

/* ---------- Tag ticks ---------- */

/** Two ticks that draw one after another (4 frames apart), then both turn lime. */
export const TagTicks: React.FC<{ frame: number; start: number }> = ({ frame, start }) => {
  const g = P.tag;
  const a = ramp(frame, start, g.tickFrames, easeOut);
  const b = ramp(frame, start + g.tickStaggerFrames, g.tickFrames, easeOut);
  const lime = ramp(frame, start + g.tickStaggerFrames + g.tickFrames, g.limeFrames);
  const tick = (d: string, progress: number, color: string, opacity: number) => (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={2.4}
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
    <svg width={28} height={20} viewBox="0 0 28 20" style={{ flexShrink: 0 }}>
      {tick(t1, a, THEME.text, 1 - lime)}
      {tick(t2, b, THEME.text, 1 - lime)}
      {tick(t1, a, THEME.lime, lime)}
      {tick(t2, b, THEME.lime, lime)}
    </svg>
  );
};

/* ---------- Pill pop and detail row ---------- */

/** A lime pill that springs 0.9 → 1 and fades in over 10 frames, then its check draws. */
export const PillPop: React.FC<{ frame: number; fps: number; at: number; check?: boolean; small?: boolean; children: React.ReactNode }> = ({
  frame,
  fps,
  at,
  check = true,
  small = false,
  children,
}) => {
  const p = P.pill;
  const pop = spring({ frame: frame - at, fps, config: MOTION.spring });
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: small ? 26 : 34,
        padding: small ? "0 10px" : check ? "0 16px 0 10px" : "0 16px",
        borderRadius: 999,
        background: THEME.lime,
        color: THEME.onLime,
        fontFamily: inter,
        fontSize: small ? THEME.type.label.size : THEME.type.button.size,
        fontWeight: 600,
        letterSpacing: small ? THEME.type.label.letterSpacing : undefined,
        textTransform: small ? "uppercase" : undefined,
        transformOrigin: small ? "100% 50%" : "0% 50%",
        opacity: ramp(frame, at, p.fadeFrames),
        scale: String(lerp(p.scaleFrom, 1, pop)),
        whiteSpace: "nowrap",
      }}
    >
      {check ? <CheckMark progress={ramp(frame, at + p.checkDelayFrames, P.check.drawFrames, easeOut)} size={small ? 16 : 22} /> : null}
      {children}
    </div>
  );
};

/** Detail row: fades in and rises 8px over 14 frames. */
export const DetailRow: React.FC<{ frame: number; at: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  frame,
  at,
  style,
  children,
}) => {
  const t = ramp(frame, at, P.detail.frames);
  return <div style={{ opacity: t, translate: `0px ${(P.detail.translatePx * (1 - t)).toFixed(2)}px`, ...style }}>{children}</div>;
};

/* ---------- Shield draw ---------- */

/** The shield outline draws over 30 frames, fills with a light lime tint over 8, then a check draws inside. */
export const ShieldDraw: React.FC<{ frame: number; start: number; size: number }> = ({ frame, start, size }) => {
  const s = P.shield;
  const outline = ramp(frame, start, s.drawFrames, easeInOut);
  const fill = ramp(frame, start + s.drawFrames, s.fillFrames);
  const check = ramp(frame, start + s.drawFrames + s.fillFrames - 4, P.check.drawFrames, easeOut);
  // True 2.5px strokes, expressed in viewBox units (vector-effect would break the dash maths).
  const stroke = (s.strokePx * 24) / size;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0, overflow: "visible", opacity: ramp(frame, start, 4) }}>
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

/** When the shield's check has finished drawing. */
export const shieldCheckEnd = (start: number) => start + P.shield.drawFrames + P.shield.fillFrames - 4 + P.check.drawFrames;

/* ---------- Orb pulse ---------- */

/** A 20px lime orb breathing 1 → 1.12 → 1 every 36 frames, with a halo ring expanding and fading each cycle. */
export const OrbPulse: React.FC<{ frame: number }> = ({ frame }) => {
  const o = P.orb;
  const phase = (((frame % o.periodFrames) + o.periodFrames) % o.periodFrames) / o.periodFrames;
  const breathe = 1 + (o.scalePeak - 1) * (0.5 - 0.5 * Math.cos(phase * Math.PI * 2));
  return (
    <div style={{ position: "relative", width: o.sizePx, height: o.sizePx, flexShrink: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: `1.5px solid ${THEME.lime}`,
          scale: String(lerp(1, o.haloScale, phase)),
          opacity: o.haloOpacity * (1 - phase),
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9) 0%, ${THEME.lime} 55%, ${THEME.lime} 100%)`,
          boxShadow: `0 0 12px color-mix(in srgb, ${THEME.lime} 60%, transparent)`,
          scale: String(breathe),
        }}
      />
    </div>
  );
};

/* ---------- Small helpers ---------- */

/** A label + value pair whose value rolls in digit by digit. */
export const RollingDetail: React.FC<{ frame: number; label: string; value: string; start: number }> = ({ frame, label, value, start }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5, opacity: ramp(frame, start, 8) }}>
    <Label>{label}</Label>
    <div style={{ fontFamily: inter, fontSize: THEME.type.title.size, fontWeight: THEME.type.title.weight, color: THEME.text, fontVariantNumeric: "tabular-nums", textShadow: THEME.textShadow, lineHeight: 1.3 }}>
      <DigitRoll text={value} frame={frame} start={start + 2} lineHeight={31} />
    </div>
  </div>
);
