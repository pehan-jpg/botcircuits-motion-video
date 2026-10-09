import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { BrandMark } from "../components/BrandLogo";
import { Cursor } from "../components/Cursor";
import { Badge, BadgeKind, V } from "../components/ProcedureEditor";
import { Scene7Simulator } from "./Scene7Simulator";
import { S7, track } from "../editorTimeline";
import { COLORS, EXPO_OUT, GLIDE, STAGE_W, ease, fontFamily, pop } from "../theme";

// Beats (frames at 60fps)
const DIVE_IN = 20; // camera dives toward the step-3 node of the simulator view
const PULL = 58; // ...then pulls back fast, tilting into 3D
const ORBIT = [52, 62, 72]; // cards 2–4 orbit in
const SWEEP = [118, 196]; // cursor sweeps through the centre
const PULSE = 156; // variables light up as the cursor crosses the hub
const FLATTEN = [204, 252]; // canvas rotates flat, front-facing
const PUSH = 342; // 1.5s hold, then dive into a clean off-white field
export const S7B_LENGTH = PUSH + 42;

const CENTER = { x: 480, y: 270 };
const CARD_W = 300;
const CARD_H = 124;

type Row = (BadgeKind | { v: string; pulse?: boolean } | string)[];
type OrbitCard = { title: string; steps: string; x: number; y: number; rows: Row[]; active?: boolean };

const CARDS: OrbitCard[] = [
  {
    title: "Process Return & Refund Request",
    steps: "3 steps",
    x: 268,
    y: 146,
    active: true,
    rows: [
      ["IF", { v: "order_age", pulse: true }, "> 30 days", "→", "HANDOFF"],
      ["CALC", { v: "net_refund" }, "= $105.00"],
      ["CALL_API", "EasyPost", "→", { v: "shipping_label_url" }],
    ],
  },
  {
    title: "VIP Reservation & Table Upgrade",
    steps: "2 steps",
    x: 692,
    y: 146,
    rows: [
      ["IF", { v: "spend", pulse: true }, "> $2k"],
      ["CALL_API", "OpenTable", "→", "Upgrade table"],
      ["SEND", "Upgrade confirmation"],
    ],
  },
  {
    title: "Subscription Retention Flow",
    steps: "2 steps",
    x: 268,
    y: 394,
    rows: [
      ["IF", { v: "reason", pulse: true }, '== "Too expensive"'],
      ["APPLY_DISCOUNT", "20%"],
      ["SEND", "Offer"],
    ],
  },
  {
    title: "Identity & KYC Verification",
    steps: "2 steps",
    x: 692,
    y: 394,
    rows: [
      ["CALL_API", "Twilio_OTP"],
      ["VERIFY", { v: "id_token", pulse: true }],
      ["SEND", "Access granted"],
    ],
  },
];

const isBadge = (x: Row[number]): x is BadgeKind => typeof x === "string" && /^[A-Z_ ]+$/.test(x) && x.length > 1;

const ProcedureTile: React.FC<{ card: OrbitCard; pulse: number }> = ({ card, pulse }) => (
  <div
    style={{
      width: CARD_W,
      height: CARD_H,
      boxSizing: "border-box",
      borderRadius: 12,
      background: COLORS.surface,
      border: card.active ? "1.5px solid #D2F800" : `1px solid ${COLORS.border}`,
      boxShadow: card.active
        ? "0 0 0 4px rgba(210,248,0,0.25), 0 14px 32px -16px rgba(17,24,39,0.22)"
        : "0 1px 2px rgba(17,24,39,0.04), 0 14px 32px -16px rgba(17,24,39,0.18)",
      padding: "11px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 11.5, fontWeight: 500, color: COLORS.ink, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
        {card.title}
      </span>
      <span style={{ flex: 1 }} />
      <span style={{ fontSize: 8.5, color: COLORS.grey, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "1px 6px" }}>
        {card.steps}
      </span>
    </div>
    {card.rows.map((r, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9.5, color: COLORS.ink, whiteSpace: "nowrap" }}>
        {r.map((x, j) =>
          typeof x === "object" ? (
            <V key={j} pulse={x.pulse ? pulse : 0}>
              {x.v}
            </V>
          ) : isBadge(x) ? (
            <Badge key={j} kind={x} />
          ) : (
            <span key={j} style={{ color: x === "→" ? COLORS.greyLight : COLORS.ink }}>
              {x}
            </span>
          ),
        )}
      </div>
    ))}
  </div>
);

export const Scene7bOrbit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ── Phase A: the simulator view dives in, then pulls back into the canvas ──
  const snapScale =
    frame < DIVE_IN ? ease(frame, [0, DIVE_IN], [1, 1.32], GLIDE) : ease(frame, [DIVE_IN, PULL], [1.32, 0.3], EXPO_OUT);
  const snapTilt = ease(frame, [DIVE_IN, PULL], [0, 1], EXPO_OUT);
  const snapOpacity = ease(frame, [DIVE_IN + 18, PULL + 4], [1, 0]);
  // Zoom is anchored on the step-3 node; the translate brings the view's centre onto card 1 (top-left).
  const origin = { x: 0.31 * width, y: 0.64 * height };
  const card1 = CARDS[0];
  const target = { x: (card1.x / 960) * width, y: (card1.y / 540) * height };
  const centreNow = {
    x: origin.x + snapScale * (width / 2 - origin.x),
    y: origin.y + snapScale * (height / 2 - origin.y),
  };
  const shift = { x: (target.x - centreNow.x) * snapTilt, y: (target.y - centreNow.y) * snapTilt };

  // ── Canvas camera: 3D tilt + slow continuous Z rotation, then flatten to front-facing ──
  const rz =
    frame < FLATTEN[0]
      ? track(frame, [
          { f: DIVE_IN, v: 0 },
          { f: PULL, v: -12 },
          { f: FLATTEN[0], v: -7 },
        ])
      : ease(frame, [FLATTEN[0], FLATTEN[1]], [-7, 0], GLIDE);
  const rx =
    frame < FLATTEN[0]
      ? track(frame, [
          { f: DIVE_IN, v: 0 },
          { f: PULL, v: 24 },
          { f: FLATTEN[0], v: 18 },
        ])
      : ease(frame, [FLATTEN[0], FLATTEN[1]], [18, 0], GLIDE);
  const planeScale =
    frame < PUSH
      ? track(frame, [
          { f: DIVE_IN, v: 0.86 },
          { f: FLATTEN[0], v: 0.92 },
          { f: FLATTEN[1], v: 1 },
        ])
      : ease(frame, [PUSH, PUSH + 36], [1, 3.4], GLIDE);
  const planeOpacity = ease(frame, [DIVE_IN + 14, PULL - 6], [0, 1]) * ease(frame, [PUSH + 8, PUSH + 34], [1, 0]);

  // Variables light up together as the cursor crosses the hub.
  const pulse = ease(frame, [PULSE, PULSE + 10], [0, 1]) * ease(frame, [PULSE + 34, PULSE + 56], [1, 0]);
  const hubRing = ease(frame, [PULSE, PULSE + 30], [0, 1], (x) => x);

  // Orbit-in for each card: swings in around the hub with momentum.
  const placement = (i: number) => {
    const c = CARDS[i];
    const dx = c.x - CENTER.x;
    const dy = c.y - CENTER.y;
    const rFinal = Math.hypot(dx, dy);
    const aFinal = Math.atan2(dy, dx);
    const p = i === 0 ? 1 : pop(frame, ORBIT[i - 1], fps, 13);
    const a = aFinal + (1 - p) * (Math.PI * 0.62);
    const r = rFinal * (0.5 + 0.5 * p);
    return {
      x: CENTER.x + Math.cos(a) * r,
      y: CENTER.y + Math.sin(a) * r,
      spin: (1 - p) * -28,
      scale: 0.8 + 0.2 * p,
      opacity: i === 0 ? ease(frame, [DIVE_IN + 22, PULL + 2], [0, 1]) : Math.min(1, Math.max(0, p) * 1.6),
    };
  };
  const placements = CARDS.map((_, i) => placement(i));

  return (
    <AbsoluteFill style={{ background: COLORS.canvas }}>
      {/* Canvas: the 3D plane is full output size and scales the 960×540 layout inside itself,
          so cards rasterize at full resolution instead of being upscaled after projection. */}
      <AbsoluteFill style={{ perspective: 1500 * (width / STAGE_W), opacity: planeOpacity }}>
        <AbsoluteFill
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${rx}deg) rotateZ(${rz}deg) scale(${planeScale})`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 960,
              height: 540,
              transformOrigin: "0 0",
              scale: String(width / STAGE_W),
              fontFamily,
              color: COLORS.ink,
            }}
          >
            {/* Hub-and-spoke guide lines */}
            <svg width={960} height={540} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              {placements.map((pl, i) => (
                <line
                  key={i}
                  x1={CENTER.x}
                  y1={CENTER.y}
                  x2={pl.x}
                  y2={pl.y}
                  stroke={pulse > 0 ? `rgba(190,225,0,${0.35 + 0.5 * pulse})` : COLORS.border}
                  strokeWidth={1.5}
                  opacity={pl.opacity}
                />
              ))}
            </svg>
            {/* Procedure cards */}
            {CARDS.map((c, i) => {
              const pl = placements[i];
              return (
                <div
                  key={c.title}
                  style={{
                    position: "absolute",
                    left: pl.x - CARD_W / 2,
                    top: pl.y - CARD_H / 2,
                    opacity: pl.opacity,
                    rotate: `${pl.spin}deg`,
                    scale: String(pl.scale),
                  }}
                >
                  <ProcedureTile card={c} pulse={pulse} />
                </div>
              );
            })}
            {/* Central BotCircuits node */}
            <div
              style={{
                position: "absolute",
                left: CENTER.x - 28,
                top: CENTER.y - 28,
                width: 56,
                height: 56,
                borderRadius: 28,
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                boxShadow: `0 10px 26px -12px rgba(17,24,39,0.25)${pulse > 0 ? `, 0 0 0 ${5 * pulse}px rgba(210,248,0,0.25)` : ""}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: ease(frame, [PULL - 16, PULL + 4], [0, 1]),
                scale: String(ease(frame, [PULL - 16, PULL + 10], [0.6, 1], EXPO_OUT)),
              }}
            >
              <BrandMark size={28} />
              {hubRing > 0 && hubRing < 1 ? (
                <div
                  style={{
                    position: "absolute",
                    inset: -1,
                    borderRadius: 29,
                    border: `1.5px solid rgba(210,248,0,${1 - hubRing})`,
                    scale: String(1 + 1.2 * hubRing),
                  }}
                />
              ) : null}
            </div>
            {/* High-precision cursor sweeping through the centre */}
            <Cursor
              frame={frame}
              opacity={ease(frame, [SWEEP[0], SWEEP[0] + 10], [0, 1]) * ease(frame, [SWEEP[1] - 12, SWEEP[1]], [1, 0])}
              clicks={[PULSE]}
              keys={[
                { f: SWEEP[0], x: CENTER.x - 210, y: CENTER.y + 190 },
                { f: PULSE, x: CENTER.x + 4, y: CENTER.y + 6 },
                { f: SWEEP[1], x: CENTER.x + 220, y: CENTER.y - 200 },
              ]}
            />
          </div>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* The simulator view from scene 7, frozen on its last frame */}
      {snapOpacity > 0 ? (
        <AbsoluteFill style={{ perspective: 1800 }}>
          <AbsoluteFill
            style={{
              opacity: snapOpacity,
              transformOrigin: "31% 64%",
              transform: `translate(${shift.x}px, ${shift.y}px) rotateX(${24 * snapTilt}deg) rotateZ(${-12 * snapTilt}deg) scale(${snapScale})`,
              boxShadow: snapTilt > 0 ? `0 30px 60px -30px rgba(17,24,39,${0.3 * snapTilt})` : undefined,
              borderRadius: 24 * snapTilt,
              overflow: "hidden",
            }}
          >
            <Scene7Simulator atFrame={S7.end - 1} />
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
