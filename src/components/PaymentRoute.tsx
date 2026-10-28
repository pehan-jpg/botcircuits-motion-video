import React from "react";
import { AbsoluteFill } from "remotion";
import { Trail } from "@remotion/motion-blur";
import { mix, useTimeline } from "../anim";
import { MAIN_CHAT } from "../content";
import { C, EASE_CAMERA } from "../theme";

const PAY = MAIN_CHAT.payment;
const ORB = PAY.orb;

export const ROUTE_WIDTH = 590;
const ROUTE_HEIGHT = 170;
const NODE = 66;
const LINE_Y = NODE / 2 + 6;
const NODE_X = [80, ROUTE_WIDTH / 2, ROUTE_WIDTH - 80];
const LABEL_WIDTH = 160;
const ARRIVALS = [ORB.leaveAt, ORB.providerAt, ORB.supplierAt];

// S shaped connector between two node centres (cubic bezier).
const S_DEPTH = 30;
const curve = (i: number) => {
  const x1 = NODE_X[i];
  const x2 = NODE_X[i + 1];
  const d = x2 - x1;
  return [
    [x1, LINE_Y],
    [x1 + d * 0.45, LINE_Y + S_DEPTH],
    [x2 - d * 0.45, LINE_Y - S_DEPTH],
    [x2, LINE_Y],
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

// Orb position along the route at the current (possibly frozen) frame.
const useOrb = () => {
  const { p, t } = useTimeline();
  const a = p(ORB.leaveAt, ORB.providerAt - ORB.leaveAt, EASE_CAMERA);
  const b = p(
    ORB.leaveProviderAt,
    ORB.supplierAt - ORB.leaveProviderAt,
    EASE_CAMERA,
  );
  const pos = t < ORB.leaveProviderAt ? pointOn(0, a) : pointOn(1, b);
  const appear = p(ORB.leaveAt - 0.2, 0.2);
  const dissolve = p(ORB.supplierAt, 0.35);
  return {
    ...pos,
    opacity: appear * (1 - dissolve),
    scale: mix(1, 2.2, dissolve),
  };
};

const Orb: React.FC = () => {
  const { x, y, opacity, scale } = useOrb();
  if (opacity <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 22,
        top: y - 22,
        width: 44,
        height: 44,
        borderRadius: 22,
        background: `radial-gradient(circle, ${C.lime} 0%, ${C.lime} 38%, rgba(180,240,0,0.55) 62%, rgba(180,240,0,0) 100%)`,
        filter: "blur(2px)",
        opacity,
        scale: String(scale),
      }}
    />
  );
};

const Node: React.FC<{ index: number; label: string }> = ({ index, label }) => {
  const { p, since } = useTimeline();
  const enter = p(PAY.nodesAt + index * PAY.nodeStagger, 0.4);
  const arrivedAt = ARRIVALS[index];
  const reached = p(arrivedAt, 0.25);
  const pulseS = since(arrivedAt);
  const pulse = pulseS >= 0 && pulseS <= 0.6 ? pulseS / 0.6 : -1;
  const isSupplier = index === 2;
  const check = isSupplier ? p(arrivedAt + 0.15, 0.35) : 0;
  const fill = isSupplier ? p(arrivedAt + 0.1, 0.3) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: NODE_X[index] - LABEL_WIDTH / 2,
        top: 6,
        width: LABEL_WIDTH,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: enter,
        translate: `0px ${mix(10, 0, enter)}px`,
      }}
    >
      <div style={{ position: "relative", width: NODE, height: NODE }}>
        {pulse >= 0 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: NODE,
              border: `3px solid ${C.lime}`,
              scale: String(mix(1, 2.1, pulse)),
              opacity: 0.8 * (1 - pulse),
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: NODE,
            backgroundColor:
              fill > 0
                ? `rgba(180,240,0,${fill})`
                : reached > 0 && index > 0
                  ? C.limeSoft
                  : C.bg,
            border: `2px solid ${reached > 0.5 ? C.lime : C.line}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isSupplier ? (
            <svg width={32} height={32} viewBox="0 0 24 24">
              <path
                d="M4 12.5 L9.5 18 L20 6.5"
                fill="none"
                stroke={C.ink}
                strokeWidth={2.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={26}
                strokeDashoffset={26 * (1 - check)}
              />
            </svg>
          ) : (
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: reached > 0.5 ? C.ink : C.line,
              }}
            />
          )}
        </div>
      </div>
      <div
        style={{
          marginTop: 12,
          fontSize: 22,
          lineHeight: 1.2,
          textAlign: "center",
          fontWeight: reached > 0.5 ? 500 : 400,
          color: reached > 0.5 ? C.ink : C.muted,
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const PaymentRoute: React.FC = () => {
  const { p } = useTimeline();
  const draw = [
    p(PAY.linesAt, PAY.lineDuration / 2),
    p(PAY.linesAt + PAY.lineDuration / 2, PAY.lineDuration / 2),
  ];
  // Lime stroke that follows the orb.
  const travelled = [
    p(ORB.leaveAt, ORB.providerAt - ORB.leaveAt, EASE_CAMERA),
    p(ORB.leaveProviderAt, ORB.supplierAt - ORB.leaveProviderAt, EASE_CAMERA),
  ];
  return (
    <div
      style={{ position: "relative", width: ROUTE_WIDTH, height: ROUTE_HEIGHT }}
    >
      <svg
        width={ROUTE_WIDTH}
        height={ROUTE_HEIGHT}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        {[0, 1].map((i) => (
          <React.Fragment key={i}>
            <path
              d={curvePath(i)}
              fill="none"
              stroke={C.line}
              strokeWidth={3}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - draw[i]}
            />
            <path
              d={curvePath(i)}
              fill="none"
              stroke={C.lime}
              strokeWidth={4}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - travelled[i]}
              opacity={travelled[i] > 0 ? 1 : 0}
            />
          </React.Fragment>
        ))}
      </svg>
      {PAY.nodes.map((label, i) => (
        <Node key={label} index={i} label={label} />
      ))}
      <AbsoluteFill>
        <Trail layers={7} lagInFrames={1} trailOpacity={0.5}>
          <Orb />
        </Trail>
      </AbsoluteFill>
    </div>
  );
};

export const Stepper: React.FC<{
  firstStepRef?: React.Ref<HTMLDivElement>;
}> = ({ firstStepRef }) => {
  const { p } = useTimeline();
  const bars = [
    p(ORB.leaveAt, ORB.providerAt - ORB.leaveAt, EASE_CAMERA),
    p(ORB.leaveProviderAt, ORB.supplierAt - ORB.leaveProviderAt, EASE_CAMERA),
  ];
  const colX = [50, ROUTE_WIDTH / 2, ROUTE_WIDTH - 50];
  return (
    <div style={{ position: "relative", width: ROUTE_WIDTH, height: 92 }}>
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: colX[i] + 22,
            width: colX[i + 1] - colX[i] - 44,
            top: 15,
            height: 4,
            borderRadius: 2,
            backgroundColor: C.line,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${bars[i] * 100}%`,
              height: "100%",
              backgroundColor: C.lime,
            }}
          />
        </div>
      ))}
      {PAY.steps.map((label, i) => {
        // Step 1 is filled by the circle that lands on it, so it switches at once.
        const on = p(PAY.stepAt[i], i === 0 ? 0.03 : 0.3);
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left: colX[i] - 100,
              width: 200,
              top: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              ref={i === 0 ? firstStepRef : undefined}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                border: `2px solid ${on > 0.5 ? C.lime : C.line}`,
                backgroundColor: C.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: C.lime,
                  scale: String(on),
                }}
              />
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 21,
                fontWeight: on > 0.5 ? 500 : 400,
                color: on > 0.5 ? C.ink : C.muted,
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Status chip that flips on the X axis from "Sent" to "Paid", then a sweep.
export const FlipChip: React.FC = () => {
  const { p } = useTimeline();
  const flip = p(PAY.chipFlipAt, 0.33, EASE_CAMERA);
  const sweep = p(PAY.chipFlipAt + 0.3, 0.55);
  const first = flip < 0.5;
  const angle = first ? flip * 180 : (flip - 1) * 180;
  return (
    <div style={{ perspective: 400 }}>
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 999,
          padding: "7px 20px",
          backgroundColor: first ? C.limeSoft : C.lime,
          fontSize: 22,
          fontWeight: 500,
          minWidth: 84,
          textAlign: "center",
          rotate: `x ${angle}deg`,
        }}
      >
        {first ? PAY.chipBefore : PAY.chipAfter}
        {sweep > 0 && sweep < 1 ? (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: 40,
              left: `${mix(-30, 130, sweep)}%`,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 100%)",
              rotate: "18deg",
            }}
          />
        ) : null}
      </div>
    </div>
  );
};
