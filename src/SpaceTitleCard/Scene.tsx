import React from "react";
import { Easing, Img, interpolate, staticFile } from "remotion";
import { BRAND_LIME, INK } from "../constants";
import { hash01, mix, pop, progress } from "../anim";
import { BoltIcon, CheckIcon, ClockIcon, MINT, MINT_SOFT, PersonIcon, StackIcon } from "../components/Icons";
import { Orb } from "../components/Orb";
import {
  AGENT, CANVAS, DIAMOND, EVENT_PATHS, EVENTS, LogoKey, MAIN_LOOP, N, NEW_ROW_DOT, NODE, P, Poly, ROW_TO_START,
  TABLE, TILE, TILE_RADIUS, TOOL_PATHS, TOOLS, TROW, logoFile, pointAt, reversed, toD,
} from "./geometry";
import { T } from "./timeline";

export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const TRAVEL = Easing.inOut(Easing.cubic);
const LINE_GREY = "#D3D8E0";
const GREY_DOT = "#C8CDD7";
const SHADOW = "0 10px 28px rgba(13,18,36,0.08), 0 2px 6px rgba(13,18,36,0.05)";

const within = (f: number, r: readonly [number, number]) => f >= r[0] && f <= r[1];
const bump = (frame: number, r: readonly [number, number], amt = 0.03) =>
  within(frame, r) ? 1 + amt * Math.sin(Math.PI * ((frame - r[0]) / (r[1] - r[0]))) : 1;

/* ---------------- lines and pulses ---------------- */

const Line: React.FC<{ poly: Poly; draw: number; width?: number; dashed?: boolean; color?: string }> = ({
  poly,
  draw,
  width = 3,
  dashed,
  color = LINE_GREY,
}) => {
  if (draw <= 0) return null;
  if (dashed) {
    // straight horizontal path: draw by clipping its end
    const a = poly[0];
    const b = poly[poly.length - 1];
    return (
      <line x1={a.x} y1={a.y} x2={mix(a.x, b.x, draw)} y2={b.y} stroke={color} strokeWidth={width} strokeDasharray="7 8" strokeLinecap="round" />
    );
  }
  return (
    <path
      d={toD(poly)}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray="1 2"
      strokeDashoffset={1 - draw}
    />
  );
};

/** A lime pulse travelling a polyline over a frame range: glowing head plus a short comet tail on the line. */
const Pulse: React.FC<{ frame: number; poly: Poly; range: readonly [number, number]; intensity?: number; tail?: number; ease?: (t: number) => number }> = ({
  frame,
  poly,
  range,
  intensity = 1,
  tail = 0.22,
  ease = TRAVEL,
}) => {
  const fadeFrames = 8;
  if (frame < range[0] || frame > range[1] + fadeFrames) return null;
  const t = interpolate(frame, range, [0, 1], { ...CLAMP, easing: ease });
  const after = interpolate(frame, [range[1], range[1] + fadeFrames], [1, 0], CLAMP);
  const head = pointAt(poly, t);
  const start = Math.max(0, t - tail);
  const len = Math.max(0.0001, t - start);
  return (
    <g opacity={intensity}>
      <path
        d={toD(poly)}
        fill="none"
        stroke={BRAND_LIME}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={`${len} 2`}
        strokeDashoffset={-start}
        opacity={0.85 * (frame > range[1] ? after * 0.6 : 1)}
      />
      <g opacity={after}>
        <circle cx={head.x} cy={head.y} r={16} fill="url(#pulseGlow)" />
        <circle cx={head.x} cy={head.y} r={6.5} fill={BRAND_LIME} />
      </g>
    </g>
  );
};

/* ---------------- tiles and nodes ---------------- */

const LogoOrPlaceholder: React.FC<{ k: LogoKey; available: boolean; size: number }> = ({ k, available, size }) =>
  available ? (
    <Img src={staticFile(logoFile(k))} style={{ width: size, height: size, objectFit: "contain", display: "block" }} />
  ) : (
    // Neutral placeholder: never a redrawn brand logo. Labelled in data attributes and the render report.
    <svg width={size} height={size} viewBox="0 0 52 52" data-placeholder={logoFile(k)} style={{ display: "block" }}>
      <title>{`PLACEHOLDER: public/${logoFile(k)}`}</title>
      <rect x={2} y={2} width={48} height={48} rx={12} fill="#F1F3F6" stroke="#A9B0BC" strokeWidth={2} strokeDasharray="6 5" />
      <path d="M14 14 38 38 M38 14 14 38" stroke="#C3C8D1" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );

const Badge: React.FC<{ frame: number; at: number; corner: "tr" | "tl"; color?: string; children: React.ReactNode }> = ({
  frame,
  at,
  corner,
  color = MINT,
  children,
}) => {
  if (frame < at) return null;
  const p = pop(frame, at, 14);
  return (
    <div
      style={{
        position: "absolute",
        top: -9,
        [corner === "tr" ? "right" : "left"]: -9,
        width: 28,
        height: 28,
        borderRadius: 14,
        background: color,
        border: "2px solid #FFFFFF",
        boxSizing: "border-box",
        boxShadow: "0 3px 8px rgba(13,18,36,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${p.scale})`,
        opacity: p.opacity,
      }}
    >
      {children}
    </div>
  );
};

const Tile: React.FC<{
  guard: string;
  x: number;
  y: number;
  size?: number;
  radius?: number;
  opacity: number;
  dx?: number;
  scale?: number;
  background?: string;
  glow?: number;
  children: React.ReactNode;
}> = ({ guard, x, y, size = TILE, radius = TILE_RADIUS, opacity, dx = 0, scale = 1, background = "#FFFFFF", glow = 0, children }) => {
  if (opacity <= 0) return null;
  return (
    <div
      data-guard={guard}
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: radius,
        background,
        border: "1px solid rgba(13,18,36,0.06)",
        boxSizing: "border-box",
        boxShadow: `${SHADOW}${glow > 0 ? `, 0 0 0 ${4 * glow}px rgba(150,201,61,${0.35 * glow}), 0 0 ${28 * glow}px rgba(150,201,61,${0.55 * glow})` : ""}`,
        transform: `translateX(${dx}px) scale(${scale})`,
        opacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );
};

/* ---------------- table ---------------- */

const rowShape = (seed: number) => ({
  w1: 170 + Math.round(hash01(seed * 3 + 1) * 140),
  w2: 90 + Math.round(hash01(seed * 3 + 2) * 110),
  pill: 60 + Math.round(hash01(seed * 3 + 3) * 30),
});

const TableRow: React.FC<{ seed: number; y: number; opacity: number; highlight: number; status: React.ReactNode }> = ({
  seed,
  y,
  opacity,
  highlight,
  status,
}) => {
  const s = rowShape(seed);
  const barY = (TROW.height - 10) / 2;
  return (
    <div
      style={{
        position: "absolute",
        left: 12,
        right: 12,
        top: y,
        height: TROW.height,
        opacity,
        borderRadius: 8,
        background: `rgba(150,201,61,${0.2 * highlight})`,
      }}
    >
      <div style={{ position: "absolute", left: TROW.dotX - 12 - 8, top: TROW.height / 2 - 8, width: 16, height: 16 }}>{status}</div>
      <div style={{ position: "absolute", left: 44, top: barY, width: s.w1, height: 10, borderRadius: 5, background: "#E2E6EC" }} />
      <div style={{ position: "absolute", left: 44 + s.w1 + 16, top: barY, width: s.w2, height: 10, borderRadius: 5, background: "#ECEFF3" }} />
      <div style={{ position: "absolute", right: 16, top: (TROW.height - 14) / 2, width: s.pill, height: 14, borderRadius: 7, background: "#EEF1F5" }} />
    </div>
  );
};

const Dot: React.FC<{ color: string }> = ({ color }) => (
  <div style={{ position: "absolute", left: 3, top: 3, width: 10, height: 10, borderRadius: 5, background: color }} />
);

const NewRowStatus: React.FC<{ frame: number }> = ({ frame }) => {
  const done = progress(frame, T.rowDone[0], T.rowDone[1]);
  const p = pop(frame, T.rowDone[0], T.rowDone[1] - T.rowDone[0]);
  return (
    <>
      <div style={{ opacity: 1 - done }}>
        <Dot color={BRAND_LIME} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 8,
          background: MINT,
          opacity: done,
          transform: `scale(${done > 0 ? p.scale : 0})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CheckIcon size={12} color="#FFFFFF" strokeWidth={3.4} draw={progress(frame, T.rowDone[0] + 3, T.rowDone[1])} />
      </div>
    </>
  );
};

const Table: React.FC<{ frame: number; empty: boolean }> = ({ frame, empty }) => {
  const shift = empty ? 0 : progress(frame, T.newRow[0], T.newRow[1]);
  const slotY = (k: number) => TROW.top + k * TROW.pitch;
  const highlight = Math.min(shift, interpolate(frame, [T.newRow[1] + 6, T.newRow[1] + 50], [1, 0], CLAMP));
  return (
    <div
      data-guard={empty ? "table:loop-return" : "table"}
      data-guard-container={empty ? "" : undefined}
      style={{
        position: "absolute",
        left: TABLE.x,
        top: TABLE.y,
        width: TABLE.w,
        height: TABLE.h,
        background: "#FFFFFF",
        border: "1px solid rgba(13,18,36,0.12)",
        borderRadius: TABLE.radius,
        boxShadow: SHADOW,
        boxSizing: "border-box",
      }}
    >
      <div style={{ position: "absolute", left: 24, top: 16, width: 128, height: 10, borderRadius: 5, background: "#D9DEE5" }} />
      <div style={{ position: "absolute", right: 24, top: 16, width: 60, height: 10, borderRadius: 5, background: "#E8EBF0" }} />
      {[0, 1, 2].map((k) => (
        <TableRow
          key={k}
          seed={k + 1}
          y={mix(slotY(k), slotY(k + 1), shift)}
          opacity={k === 2 ? 1 - interpolate(shift, [0, 0.5], [0, 1], CLAMP) : 1}
          highlight={0}
          status={<Dot color={GREY_DOT} />}
        />
      ))}
      {shift > 0 ? (
        <TableRow seed={9} y={slotY(0) - 14 * (1 - shift)} opacity={shift} highlight={highlight} status={<NewRowStatus frame={frame} />} />
      ) : null}
    </div>
  );
};

/* ---------------- the canvas contents ---------------- */

export type SceneProps = {
  frame: number;
  logos: Record<LogoKey, boolean>;
  /** The empty state (canvas only): used for the loop return. */
  empty?: boolean;
};

const nodePop = (frame: number, start: number) => pop(frame, start, T.popDur);

export const SceneContents: React.FC<SceneProps> = ({ frame, logos }) => {
  const L = T.lines;
  const draw = (r: readonly [number, number]) => progress(frame, r[0], r[1]);

  // Start node glow: each inbound pulse arrival, and the second run.
  const arrive = (end: number, strength: number) => strength * interpolate(frame, [end - 4, end + 2, end + 22], [0, 1, 0], CLAMP);
  const startGlow = Math.max(
    arrive(T.eventPulse[0][1], 1),
    arrive(T.eventPulse[1][1], 0.4),
    arrive(T.eventPulse[2][1], 0.4),
    0.8 * interpolate(frame, [T.startLight[0], T.startLight[0] + 6, T.startLight[1]], [0, 1, 0], CLAMP),
  );

  const halo = within(frame, T.haloAgent) ? ((frame - T.haloAgent[0]) / (T.haloAgent[1] - T.haloAgent[0]) * 2) % 1 : 0;
  const approve = progress(frame, T.approve[0], T.approve[1]);
  const approvePop = pop(frame, T.approve[0], T.approve[1] - T.approve[0]);
  const doneBoost = progress(frame, T.donePop[0], T.donePop[1]);

  const pStart = nodePop(frame, T.popStart);
  const pAgent = nodePop(frame, T.popAgent);
  const pBranch = nodePop(frame, T.popBranch);
  const pPerson = nodePop(frame, T.popPerson);
  const pDone = nodePop(frame, T.popDone);

  return (
    <>
      <svg width={CANVAS.w} height={CANVAS.h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <radialGradient id="pulseGlow">
            <stop offset="0%" stopColor={BRAND_LIME} stopOpacity={0.6} />
            <stop offset="100%" stopColor={BRAND_LIME} stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* lines */}
        {EVENT_PATHS.map((poly, i) => (
          <Line key={`e${i}`} poly={poly} draw={draw(T.eventLine[i])} />
        ))}
        <Line poly={P.startAgent} draw={draw(L.startAgent)} />
        <Line poly={P.agentBranch} draw={draw(L.agentBranch)} />
        <Line poly={P.branchPerson} draw={draw(L.branchPerson)} />
        <Line poly={P.personDone} draw={draw(L.personDone)} />
        <Line poly={P.auto} draw={draw(L.auto)} dashed width={2.5} color="#C3C9D3" />
        {TOOL_PATHS.map((poly, i) => (
          <Line key={`t${i}`} poly={poly} draw={draw(T.toolLine[i])} width={2} />
        ))}
        {/* pulses */}
        {EVENT_PATHS.map((poly, i) => (
          <Pulse key={`ep${i}`} frame={frame} poly={poly} range={T.eventPulse[i]} intensity={i === 0 ? 1 : 0.4} />
        ))}
        <Pulse frame={frame} poly={P.startAgent} range={T.runToAgent} />
        {TOOL_PATHS.map((poly, i) => (
          <React.Fragment key={`tp${i}`}>
            <Pulse frame={frame} poly={poly} range={T.toolCall[i].out} tail={0.18} />
            <Pulse frame={frame} poly={reversed(poly)} range={T.toolCall[i].back} tail={0.18} />
          </React.Fragment>
        ))}
        <Pulse frame={frame} poly={P.agentBranch} range={T.agentBranch} />
        <Pulse frame={frame} poly={P.branchPerson} range={T.branchPerson} />
        <Pulse frame={frame} poly={P.personDone} range={T.personDone} />
        <Pulse frame={frame} poly={ROW_TO_START} range={T.rowToStart} intensity={0.45} tail={0.3} />
        <Pulse frame={frame} poly={MAIN_LOOP} range={T.ambient} intensity={0.3} tail={0.12} ease={Easing.inOut(Easing.sin)} />
      </svg>

      {/* inbound event tiles */}
      {EVENTS.map((e, i) => {
        const p = progress(frame, T.eventTile[i][0], T.eventTile[i][1]);
        return (
          <Tile key={e.key} guard={`event:${e.key}`} x={e.x} y={e.y} opacity={p} dx={-36 * (1 - p)}>
            {e.key === "clock" ? <ClockIcon size={46} /> : <LogoOrPlaceholder k={e.key} available={logos[e.key]} size={52} />}
          </Tile>
        );
      })}

      {/* review rings around the person gate */}
      {T.ring.map((start, i) => {
        const r = interpolate(frame, [start, start + T.ringDur], [0, 1], CLAMP);
        if (frame < start || r >= 1) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: N.person.x - NODE / 2,
              top: N.person.y - NODE / 2,
              width: NODE,
              height: NODE,
              borderRadius: 28,
              border: `2px solid ${INK}`,
              boxSizing: "border-box",
              opacity: 0.42 * (1 - r),
              transform: `scale(${1.04 + 0.28 * Easing.out(Easing.cubic)(r)})`,
            }}
          />
        );
      })}

      {/* process nodes */}
      <Tile guard="node:start" x={N.start.x} y={N.start.y} size={NODE} opacity={frame >= T.popStart ? pStart.opacity : 0} scale={pStart.scale} glow={startGlow}>
        <BoltIcon size={40} />
      </Tile>
      <Tile guard="node:agent" x={N.agent.x} y={N.agent.y} size={AGENT} radius={30} opacity={frame >= T.popAgent ? pAgent.opacity : 0} scale={pAgent.scale}>
        <Orb size={60} haloPulse={halo} scale={1 + 0.035 * Math.sin(Math.PI * halo)} />
      </Tile>
      {frame >= T.popBranch ? (
        <div
          data-guard="node:branch"
          style={{
            position: "absolute",
            left: N.branch.x - DIAMOND / 2,
            top: N.branch.y - DIAMOND / 2,
            width: DIAMOND,
            height: DIAMOND,
            transform: `scale(${pBranch.scale})`,
            opacity: pBranch.opacity,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: (DIAMOND - DIAMOND / Math.SQRT2) / 2,
              top: (DIAMOND - DIAMOND / Math.SQRT2) / 2,
              width: DIAMOND / Math.SQRT2,
              height: DIAMOND / Math.SQRT2,
              borderRadius: 8,
              background: "#FFFFFF",
              border: "1px solid rgba(13,18,36,0.08)",
              boxSizing: "border-box",
              boxShadow: SHADOW,
              transform: `rotate(45deg) scale(${bump(frame, [T.agentBranch[1] - 4, T.agentBranch[1] + 12], 0.04)})`,
            }}
          />
          <div style={{ position: "absolute", left: DIAMOND / 2 - 5, top: DIAMOND / 2 - 5, width: 10, height: 10, borderRadius: 5, background: INK }} />
        </div>
      ) : null}
      <Tile
        guard="node:person"
        x={N.person.x}
        y={N.person.y}
        size={NODE}
        opacity={frame >= T.popPerson ? pPerson.opacity : 0}
        scale={pPerson.scale}
        background={`color-mix(in srgb, ${MINT_SOFT} ${approve * 100}%, #FFFFFF)`}
      >
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
      </Tile>
      <Tile
        guard="node:done"
        x={N.done.x}
        y={N.done.y}
        size={NODE}
        opacity={frame >= T.popDone ? pDone.opacity : 0}
        scale={pDone.scale * bump(frame, T.donePop, 0.035)}
        background={`color-mix(in srgb, ${MINT} ${doneBoost * 16}%, ${MINT_SOFT})`}
      >
        <CheckIcon size={44} color={MINT} strokeWidth={2.8 + 0.6 * doneBoost} draw={progress(frame, T.popDone + 6, T.popDone + 22)} />
      </Tile>

      {/* connected systems */}
      {TOOLS.map((t, i) => {
        const p = progress(frame, T.toolTile[i][0], T.toolTile[i][1]);
        const call = T.toolCall[i];
        return (
          <Tile key={t.key} guard={`tool:${t.key}`} x={t.x} y={t.y} opacity={p} dx={36 * (1 - p)} scale={bump(frame, [call.out[1] - 2, call.out[1] + 14], 0.03)}>
            <LogoOrPlaceholder k={t.key} available={logos[t.key]} size={52} />
            <Badge frame={frame} at={call.back[0]} corner="tr">
              <CheckIcon size={15} color="#FFFFFF" strokeWidth={3.4} />
            </Badge>
            {t.key === "google-drive" ? (
              <Badge frame={frame} at={call.out[1] - 2} corner="tl" color="#FFFFFF">
                <StackIcon size={14} />
              </Badge>
            ) : null}
          </Tile>
        );
      })}
    </>
  );
};

export const SceneTable: React.FC<{ frame: number; empty?: boolean }> = ({ frame, empty }) => (
  <Table frame={frame} empty={Boolean(empty)} />
);

export { NEW_ROW_DOT };
