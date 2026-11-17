import React from "react";
import { Easing, interpolate } from "remotion";
import { BRAND_LIME, INK } from "../constants";
import { hash01, mix, pop, progress } from "../anim";
import { BoltIcon, CheckIcon, MINT, MINT_SOFT, PersonIcon, PetalSpinner } from "../components/Icons";
import { Orb } from "../components/Orb";
import { CARD, NEW_ROW_DOT, NODE, ROW, T } from "./timeline";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const TRAVEL = Easing.inOut(Easing.cubic);
const GREY_DOT = "#C8CDD7";
const LINE_GREY = "#D3D8E0";
const SHADOW = "0 10px 30px rgba(13,18,36,0.08), 0 2px 6px rgba(13,18,36,0.05)";

/* ---------------- pulse path ---------------- */

type Pt = { x: number; y: number };
const nodeCentre = (i: number): Pt => ({ x: NODE.xs[i], y: NODE.y });

// Trigger leg: cubic bezier from the new row's dot out of the card's left edge, down into node A.
const LEG0 = {
  p0: { x: NEW_ROW_DOT.x, y: NEW_ROW_DOT.y },
  p1: { x: NEW_ROW_DOT.x - 70, y: NEW_ROW_DOT.y + 10 },
  p2: { x: NODE.xs[0], y: NODE.y - 190 },
  p3: nodeCentre(0),
};
const bez = (t: number): Pt => {
  const u = 1 - t;
  const { p0, p1, p2, p3 } = LEG0;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
};
export const LEG0_D = `M ${LEG0.p0.x} ${LEG0.p0.y} C ${LEG0.p1.x} ${LEG0.p1.y}, ${LEG0.p2.x} ${LEG0.p2.y}, ${LEG0.p3.x} ${LEG0.p3.y}`;

const LEGS: { range: readonly [number, number]; at: (t: number) => Pt }[] = [
  { range: T.leg0, at: bez },
  ...[0, 1, 2].map((i) => ({
    range: [T.leg1, T.leg2, T.leg3][i],
    at: (t: number) => ({ x: mix(NODE.xs[i], NODE.xs[i + 1], t), y: NODE.y }),
  })),
];

/** Continuous pulse position for any (fractional) frame; null when not active. */
export const pulseAt = (frame: number): Pt | null => {
  if (frame < T.leg0[0] || frame > T.leg3[1]) return null;
  for (let i = 0; i < LEGS.length; i++) {
    const [a, b] = LEGS[i].range;
    if (frame <= b) {
      if (frame < a) return LEGS[i - 1].at(1); // dwelling at a node
      return LEGS[i].at(interpolate(frame, [a, b], [0, 1], { ...CLAMP, easing: TRAVEL }));
    }
  }
  return nodeCentre(3);
};

/* ---------------- table card ---------------- */

const rowShape = (seed: number) => ({
  w1: 150 + Math.round(hash01(seed * 3 + 1) * 120),
  w2: 70 + Math.round(hash01(seed * 3 + 2) * 90),
  pill: 54 + Math.round(hash01(seed * 3 + 3) * 26),
});

const SkeletonRow: React.FC<{
  seed: number;
  y: number;
  opacity: number;
  highlight: number;
  status: React.ReactNode;
}> = ({ seed, y, opacity, highlight, status }) => {
  const s = rowShape(seed);
  const barY = (ROW.height - 12) / 2;
  return (
    <div
      style={{
        position: "absolute",
        left: ROW.inset,
        right: ROW.inset,
        top: y,
        height: ROW.height,
        opacity,
        borderRadius: 10,
        background: `rgba(150,201,61,${0.22 * highlight})`,
      }}
    >
      <div style={{ position: "absolute", left: ROW.dotX - ROW.inset - 9, top: ROW.height / 2 - 9, width: 18, height: 18 }}>
        {status}
      </div>
      <div style={{ position: "absolute", left: 44, top: barY, width: s.w1, height: 12, borderRadius: 6, background: "#E2E6EC" }} />
      <div style={{ position: "absolute", left: 44 + s.w1 + 14, top: barY, width: s.w2, height: 12, borderRadius: 6, background: "#ECEFF3" }} />
      <div style={{ position: "absolute", right: 16, top: (ROW.height - 16) / 2, width: s.pill, height: 16, borderRadius: 8, background: "#EEF1F5" }} />
    </div>
  );
};

const Dot: React.FC<{ color: string; scale?: number }> = ({ color, scale = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: 3,
      top: 3,
      width: 12,
      height: 12,
      borderRadius: 6,
      background: color,
      transform: `scale(${scale})`,
    }}
  />
);

const NewRowStatus: React.FC<{ frame: number }> = ({ frame }) => {
  const spin = progress(frame, T.spinnerIn, T.spinnerIn + 10);
  const done = progress(frame, T.statusDone[0], T.statusDone[1]);
  const doneScale = pop(frame, T.statusDone[0], T.statusDone[1] - T.statusDone[0]).scale;
  const rotation = ((frame - T.spinnerIn) / 60) * 160; // slow, 160 deg per second
  return (
    <>
      <div style={{ opacity: 1 - spin }}>
        <Dot color={BRAND_LIME} scale={1 - 0.4 * spin} />
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: spin * (1 - done), transform: `scale(${0.6 + 0.4 * spin})` }}>
        <PetalSpinner size={18} color={BRAND_LIME} rotation={rotation} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 9,
          background: MINT,
          opacity: done,
          transform: `scale(${done > 0 ? doneScale : 0})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CheckIcon size={14} color="#FFFFFF" strokeWidth={3.2} draw={progress(frame, T.statusDone[0] + 4, T.statusDone[1])} />
      </div>
    </>
  );
};

export const TableCard: React.FC<{ frame: number; mode: "story" | "empty"; skipPop?: boolean }> = ({
  frame,
  mode,
  skipPop,
}) => {
  const p = skipPop ? { scale: 1, opacity: 1 } : pop(frame, T.cardIn, T.cardInDur);
  const shift = mode === "story" ? progress(frame, T.rowIn, T.rowIn + T.rowInDur) : 0;
  const slotY = (k: number) => ROW.top + k * ROW.pitch;
  const newIn = mode === "story" ? progress(frame, T.rowIn, T.rowIn + T.rowInDur) : 0;
  const highlight =
    mode === "story"
      ? Math.min(newIn, interpolate(frame, [T.highlightFade[0], T.highlightFade[1]], [1, 0], CLAMP))
      : 0;

  return (
    <div
      data-guard="table-card"
      style={{
        position: "absolute",
        left: CARD.left,
        top: CARD.top,
        width: CARD.width,
        height: CARD.height,
        background: "#FFFFFF",
        border: "1px solid rgba(13,18,36,0.12)",
        borderRadius: CARD.radius,
        boxShadow: SHADOW,
        boxSizing: "border-box",
        transform: `scale(${p.scale})`,
        opacity: p.opacity,
      }}
    >
      {/* header skeleton */}
      <div style={{ position: "absolute", left: 24, top: 22, width: 118, height: 12, borderRadius: 6, background: "#D9DEE5" }} />
      <div style={{ position: "absolute", right: 24, top: 22, width: 54, height: 12, borderRadius: 6, background: "#E8EBF0" }} />

      {[0, 1, 2].map((k) => {
        const y = mix(slotY(k), slotY(k + 1), shift);
        const opacity = k === 2 ? 1 - interpolate(shift, [0, 0.55], [0, 1], CLAMP) : 1;
        return (
          <SkeletonRow
            key={k}
            seed={k + 1}
            y={y}
            opacity={opacity}
            highlight={0}
            status={<Dot color={GREY_DOT} />}
          />
        );
      })}
      {mode === "story" && newIn > 0 ? (
        <SkeletonRow
          seed={7}
          y={slotY(0) - 18 * (1 - newIn)}
          opacity={newIn}
          highlight={highlight}
          status={<NewRowStatus frame={frame} />}
        />
      ) : null}
    </div>
  );
};

/* ---------------- process line ---------------- */

const NodeBox: React.FC<{
  index: number;
  frame: number;
  start: number;
  background?: string;
  children: React.ReactNode;
}> = ({ index, frame, start, background = "#FFFFFF", children }) => {
  const p = pop(frame, start, T.popDur);
  if (frame < start) return null;
  return (
    <div
      data-guard={`node-${"ABCD"[index]}`}
      style={{
        position: "absolute",
        left: NODE.xs[index] - NODE.size / 2,
        top: NODE.y - NODE.size / 2,
        width: NODE.size,
        height: NODE.size,
        borderRadius: NODE.radius,
        background,
        boxShadow: SHADOW,
        border: "1px solid rgba(13,18,36,0.06)",
        boxSizing: "border-box",
        transform: `scale(${p.scale})`,
        opacity: p.opacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );
};

const NodeLine: React.FC<{ from: number; range: readonly [number, number]; frame: number; lit: readonly [number, number] }> = ({
  from,
  range,
  frame,
  lit,
}) => {
  const x1 = NODE.xs[from] + NODE.size / 2;
  const x2 = NODE.xs[from + 1] - NODE.size / 2;
  const draw = progress(frame, range[0], range[1]);
  // Lime overlay follows the pulse across the gap, then fades.
  const pulse = interpolate(frame, [lit[0], lit[1]], [0, 1], { ...CLAMP, easing: TRAVEL });
  const pulseX = mix(NODE.xs[from], NODE.xs[from + 1], pulse);
  const litEnd = Math.min(x2, Math.max(x1, pulseX));
  const litOpacity = interpolate(frame, [lit[1], lit[1] + 24], [1, 0], CLAMP);
  return (
    <g>
      {draw > 0 ? (
        <line x1={x1} y1={NODE.y} x2={mix(x1, x2, draw)} y2={NODE.y} stroke={LINE_GREY} strokeWidth={3} strokeLinecap="round" />
      ) : null}
      {pulseX > x1 && litOpacity > 0 ? (
        <line x1={x1} y1={NODE.y} x2={litEnd} y2={NODE.y} stroke={BRAND_LIME} strokeWidth={3} strokeLinecap="round" opacity={litOpacity} />
      ) : null}
    </g>
  );
};

const PulseDot: React.FC<{ frame: number }> = ({ frame }) => {
  const fadeOut = interpolate(frame, [T.leg3[1], T.leg3[1] + 10], [1, 0], CLAMP);
  const ghosts = [6, 4.5, 3, 1.5, 0];
  return (
    <g opacity={fadeOut}>
      {ghosts.map((lag, i) => {
        const pt = pulseAt(frame - lag);
        if (!pt) return null;
        const head = lag === 0;
        return (
          <g key={i}>
            {head ? <circle cx={pt.x} cy={pt.y} r={16} fill="url(#pulseGlow)" /> : null}
            <circle cx={pt.x} cy={pt.y} r={head ? 7 : 6 - i * 0.6} fill={BRAND_LIME} opacity={head ? 1 : 0.12 + i * 0.1} />
          </g>
        );
      })}
    </g>
  );
};

export const ProcessLayer: React.FC<{ frame: number }> = ({ frame }) => {
  // Trigger trail along the bezier, drawn as the pulse travels.
  const leg0 = interpolate(frame, [T.leg0[0], T.leg0[1]], [0, 1], { ...CLAMP, easing: TRAVEL });
  const leg0Opacity = interpolate(frame, [T.leg0[1], T.leg0[1] + 30], [1, 0], CLAMP);

  const halo = frame >= T.haloB[0] && frame <= T.haloB[1] ? (frame - T.haloB[0]) / (T.haloB[1] - T.haloB[0]) : 0;
  // Two halo beats inside the 0.4s working window.
  const haloPulse = halo > 0 ? (halo * 2) % 1 : 0;

  const approve = progress(frame, T.approveC[0], T.approveC[1]);
  const approvePop = pop(frame, T.approveC[0], T.approveC[1] - T.approveC[0]);
  const dCheck = progress(frame, T.popD + 6, T.popD + 22);

  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <radialGradient id="pulseGlow">
            <stop offset="0%" stopColor={BRAND_LIME} stopOpacity={0.55} />
            <stop offset="100%" stopColor={BRAND_LIME} stopOpacity={0} />
          </radialGradient>
        </defs>
        {leg0 > 0 && leg0Opacity > 0 ? (
          <path
            d={LEG0_D}
            fill="none"
            stroke={BRAND_LIME}
            strokeWidth={3}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - leg0}
            opacity={leg0Opacity * 0.9}
          />
        ) : null}
        <NodeLine from={0} range={T.lineAB} frame={frame} lit={T.leg1} />
        <NodeLine from={1} range={T.lineBC} frame={frame} lit={T.leg2} />
        <NodeLine from={2} range={T.lineCD} frame={frame} lit={T.leg3} />
        <PulseDot frame={frame} />
      </svg>

      {/* review rings around node C */}
      {[T.ringC[0], T.ringC[1]].map((start, i) => {
        const r = interpolate(frame, [start, start + T.ringDur], [0, 1], CLAMP);
        if (frame < start || r >= 1) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: NODE.xs[2] - NODE.size / 2,
              top: NODE.y - NODE.size / 2,
              width: NODE.size,
              height: NODE.size,
              borderRadius: NODE.radius + 4,
              border: `2px solid ${INK}`,
              boxSizing: "border-box",
              opacity: 0.42 * (1 - r),
              transform: `scale(${1.04 + 0.3 * Easing.out(Easing.cubic)(r)})`,
            }}
          />
        );
      })}

      <NodeBox index={0} frame={frame} start={T.popA}>
        <BoltIcon size={40} />
      </NodeBox>
      <NodeBox index={1} frame={frame} start={T.popB}>
        <Orb size={46} haloPulse={haloPulse} scale={1 + 0.04 * Math.sin(Math.PI * haloPulse)} />
      </NodeBox>
      <NodeBox index={2} frame={frame} start={T.lineBC[1] - 6} background={`color-mix(in srgb, ${MINT_SOFT} ${approve * 100}%, #FFFFFF)`}>
        <div style={{ position: "relative" }}>
          <PersonIcon size={42} />
          <div
            style={{
              position: "absolute",
              right: -12,
              bottom: -10,
              width: 26,
              height: 26,
              borderRadius: 13,
              background: MINT,
              border: "2px solid #FFFFFF",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: approve,
              transform: `scale(${approve > 0 ? approvePop.scale : 0})`,
            }}
          >
            <CheckIcon size={16} color="#FFFFFF" strokeWidth={3.2} draw={approve} />
          </div>
        </div>
      </NodeBox>
      <NodeBox index={3} frame={frame} start={T.popD} background={MINT_SOFT}>
        <CheckIcon size={44} color={MINT} strokeWidth={2.8} draw={dCheck} />
      </NodeBox>
    </>
  );
};

export { CLAMP };
