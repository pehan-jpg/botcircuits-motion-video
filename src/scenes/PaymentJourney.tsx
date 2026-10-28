import React from "react";
import { AbsoluteFill } from "remotion";
import { Trail } from "@remotion/motion-blur";
import { mix, useTimeline } from "../anim";
import { JOURNEY } from "../content";
import { JourneyIcon } from "../components/Icons";
import { C, EASE_CAMERA, EASE_IN, FONT, R } from "../theme";

const J = JOURNEY;
const NODE = J.nodeSize;
const ORB = 56;
const S_WIDTH = 180; // horizontal pull of the S curves
const ARRIVALS = [J.toTop.arrive, J.legs[0].arrive, J.legs[1].arrive];

// S shaped curve between two node centres (cubic bezier).
const curve = (i: number) => {
  const y1 = J.nodeY[i];
  const y2 = J.nodeY[i + 1];
  const d = y2 - y1;
  return [
    [J.x, y1],
    [J.x - S_WIDTH, y1 + d * 0.45],
    [J.x + S_WIDTH, y2 - d * 0.45],
    [J.x, y2],
  ];
};
const curvePath = (i: number) => {
  const [a, b, c, d] = curve(i);
  return `M ${a[0]} ${a[1]} C ${b[0]} ${b[1]}, ${c[0]} ${c[1]}, ${d[0]} ${d[1]}`;
};
const pointOn = (i: number, t: number) => {
  const [a, b, c, d] = curve(i);
  const u = 1 - t;
  const w = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  return {
    x: w[0] * a[0] + w[1] * b[0] + w[2] * c[0] + w[3] * d[0],
    y: w[0] * a[1] + w[1] * b[1] + w[2] * c[1] + w[3] * d[1],
  };
};

// Orb position and shape at the current (possibly frozen) frame. It starts
// as the Approve button, shrinks into the orb, moves to the first node, then
// travels the curves.
const useOrb = () => {
  const { p, t } = useTimeline();
  const a = J.approveRect;
  const morph = p(J.start, J.orbMorph, EASE_CAMERA);
  const toTop = p(J.toTop.leave, J.toTop.arrive - J.toTop.leave, EASE_CAMERA);
  const leg = J.legs.map((l) => p(l.leave, l.arrive - l.leave, EASE_CAMERA));
  let pos = {
    x: mix(a.x + a.w / 2, J.x, toTop),
    y: mix(a.y + a.h / 2, J.nodeY[0], toTop),
  };
  if (t >= J.legs[0].leave) pos = pointOn(0, leg[0]);
  if (t >= J.legs[1].leave) pos = pointOn(1, leg[1]);
  const dissolve = p(J.legs[1].arrive, 0.35);
  return {
    ...pos,
    w: mix(a.w, ORB, morph),
    h: mix(a.h, ORB, morph),
    radius: mix(16, ORB / 2, morph),
    morph,
    opacity: 1 - dissolve,
    scale: mix(1, 1.8, dissolve),
  };
};

const Orb: React.FC = () => {
  const o = useOrb();
  if (o.opacity <= 0) return null;
  const lime = `rgba(180, 240, 0, ${o.morph})`;
  return (
    <div
      style={{
        position: "absolute",
        left: o.x - o.w / 2,
        top: o.y - o.h / 2,
        width: o.w,
        height: o.h,
        borderRadius: o.radius,
        backgroundColor:
          o.morph < 1 ? `rgba(255,255,255,${1 - o.morph})` : C.lime,
        backgroundImage:
          o.morph > 0 ? `linear-gradient(${lime}, ${lime})` : undefined,
        boxShadow: `0 0 ${mix(0, 36, o.morph)}px rgba(180, 240, 0, ${0.75 * o.morph}), 0 4px 14px rgba(11, 20, 26, ${0.12 * (1 - o.morph)})`,
        opacity: o.opacity,
        scale: String(o.scale),
      }}
    />
  );
};

// White pill with the amount, riding to the left of the orb.
const AmountPill: React.FC = () => {
  const { p } = useTimeline();
  const o = useOrb();
  const show = p(J.toTop.arrive - 0.1, 0.3) * (1 - p(J.legs[1].arrive, 0.3));
  if (show <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        right: 1080 - (o.x - ORB / 2 - 22),
        top: o.y - 36,
        height: 72,
        padding: "0 28px",
        borderRadius: 36,
        backgroundColor: C.bg,
        boxShadow:
          "0 1px 2px rgba(11, 20, 26, 0.08), 0 10px 28px rgba(11, 20, 26, 0.10)",
        display: "flex",
        alignItems: "center",
        fontSize: 40,
        fontWeight: 500,
        letterSpacing: -0.6,
        whiteSpace: "nowrap",
        opacity: show,
      }}
    >
      {J.amount}
    </div>
  );
};

const Node: React.FC<{ index: number; fade: number }> = ({ index, fade }) => {
  const { p, since } = useTimeline();
  const node = J.nodes[index];
  const enter = p(J.drawAt + index * 0.1, 0.45, EASE_IN);
  const arrived = since(ARRIVALS[index]);
  const reached = p(ARRIVALS[index], 0.25);
  const pulse = arrived >= 0 && arrived <= 0.7 ? arrived / 0.7 : -1;
  const isSupplier = index === 2;
  const check = isSupplier ? p(J.checkAt, 0.4) : 0;
  const y = J.nodeY[index];
  return (
    <div
      style={{
        position: "absolute",
        left: J.x - NODE / 2,
        top: y - NODE / 2,
        width: NODE,
        height: NODE,
        opacity: enter * fade,
        scale: String(mix(0.8, 1, enter)),
      }}
    >
      {pulse >= 0 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: NODE,
            border: `4px solid ${C.lime}`,
            scale: String(mix(1, 1.9, pulse)),
            opacity: 0.85 * (1 - pulse),
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: NODE,
          backgroundColor: isSupplier && check > 0 ? C.lime : C.bg,
          boxShadow: [
            `inset 0 0 0 ${mix(2, 4, reached)}px ${reached > 0.5 ? C.lime : "#E1E4E8"}`,
            "0 2px 6px rgba(11, 20, 26, 0.06)",
            "0 18px 40px rgba(11, 20, 26, 0.08)",
          ].join(", "),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isSupplier && check > 0 ? (
          <svg width={70} height={70} viewBox="0 0 24 24">
            <path
              d="M4.5 12.5 L9.5 17.5 L19.5 7"
              fill="none"
              stroke={C.ink}
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={23}
              strokeDashoffset={23 * (1 - check)}
            />
          </svg>
        ) : (
          <JourneyIcon name={node.icon} />
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: NODE + 32,
          top: NODE / 2 - 30,
          fontSize: 44,
          lineHeight: "60px",
          fontWeight: 300,
          letterSpacing: -0.8,
          whiteSpace: "nowrap",
          color: C.ink,
        }}
      >
        {node.label}
      </div>
    </div>
  );
};

// One status line that changes with a vertical text roll.
const StatusLine: React.FC<{ fade: number }> = ({ fade }) => {
  const { p } = useTimeline();
  const rolls = ARRIVALS.map((at, i) =>
    i === 0 ? p(at, 0.35) : p(at, 0.35, EASE_CAMERA),
  );
  const current = rolls.reduce((n, r, i) => (r > 0 ? i : n), 0);
  const r = rolls[current];
  const line = (text: string, y: number, opacity: number) => (
    <div
      style={{
        position: "absolute",
        inset: 0,
        textAlign: "center",
        translate: `0px ${y}%`,
        opacity,
      }}
    >
      {text}
    </div>
  );
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top: J.statusY - 30,
        height: 60,
        overflow: "hidden",
        fontSize: 40,
        lineHeight: "60px",
        fontWeight: 400,
        letterSpacing: -0.4,
        color: C.ink,
        opacity: fade,
      }}
    >
      {current === 0 ? (
        line(J.status[0], 100 * (1 - r), r)
      ) : (
        <>
          {r < 1 ? line(J.status[current - 1], -100 * r, 1 - r) : null}
          {line(J.status[current], 100 * (1 - r), r)}
        </>
      )}
    </div>
  );
};

// Supplier node shrinks and morphs into the chat bubble as the phone returns.
const ReturnMorph: React.FC = () => {
  const { p } = useTimeline();
  const m = p(J.returnAt, J.returnDuration, EASE_CAMERA);
  const out = p(J.returnAt + J.returnDuration - 0.1, 0.2);
  if (m <= 0 || out >= 1) return null;
  const b = J.bubbleRect;
  const w = mix(NODE, b.w, m);
  const h = mix(NODE, b.h, m);
  const cx = mix(J.x, b.x + b.w / 2, m);
  const cy = mix(J.nodeY[2], b.y + b.h / 2, m);
  return (
    <div
      style={{
        position: "absolute",
        left: cx - w / 2,
        top: cy - h / 2,
        width: w,
        height: h,
        borderRadius: mix(NODE / 2, R.bubble, m),
        borderBottomLeftRadius: mix(NODE / 2, 0, m),
        backgroundColor: C.bg,
        boxShadow: `inset 0 0 0 ${mix(4, 0, m)}px ${C.lime}, 0 1px 1px rgba(11, 20, 26, 0.13)`,
        opacity: 1 - out,
      }}
    />
  );
};

export const PaymentJourney: React.FC = () => {
  const { p, t } = useTimeline();
  if (t < J.start || t > J.returnAt + J.returnDuration + 0.2) return null;
  const fade = 1 - p(J.returnAt, 0.2);
  const draw = [
    p(J.drawAt + 0.05, 0.35, EASE_IN),
    p(J.drawAt + 0.25, 0.35, EASE_IN),
  ];
  const travelled = J.legs.map((l) =>
    p(l.leave, l.arrive - l.leave, EASE_CAMERA),
  );
  const returning = t >= J.returnAt;
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: C.ink }}>
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0, opacity: fade }}
      >
        {[0, 1].map((i) => (
          <React.Fragment key={i}>
            <path
              d={curvePath(i)}
              fill="none"
              stroke="#D9DDE2"
              strokeWidth={4}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - draw[i]}
            />
            <path
              d={curvePath(i)}
              fill="none"
              stroke={C.lime}
              strokeWidth={6}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - travelled[i]}
              opacity={travelled[i] > 0 ? 1 : 0}
            />
          </React.Fragment>
        ))}
      </svg>
      {J.nodes.map((n, i) => (
        <Node key={n.label} index={i} fade={i === 2 && returning ? 0 : fade} />
      ))}
      <StatusLine fade={fade * p(J.toTop.arrive - 0.1, 0.3)} />
      <AmountPill />
      <AbsoluteFill>
        <Trail layers={12} lagInFrames={0.5} trailOpacity={0.4}>
          <Orb />
        </Trail>
      </AbsoluteFill>
      <ReturnMorph />
    </AbsoluteFill>
  );
};
