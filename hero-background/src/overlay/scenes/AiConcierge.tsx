import type React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENES, STACK, THEME, exitTiming } from "../config";
import { inter } from "../fonts";
import {
  type ItemMotion,
  clamp,
  floatY,
  grownHeight,
  itemMotion,
  lerp,
  progressEase,
  ramp,
  stackLayout,
  stackSpring,
  stackTransform,
  swap,
} from "../motion";
import { Body, DrawnCheck, Glass, Label, LimeCheck, QueryBubble, Spinner, Stack, Title } from "../ui";

const S = SCENES.aiConcierge;
const EXIT = exitTiming(S.exitEnd);
const ICON = 26;
const GROWTH = [
  ...S.steps.map((s) => ({ at: s.start, grow: s.grow })),
  { at: S.confirmed.at, grow: S.confirmed.grow },
  { at: S.detail.at, grow: S.detail.grow },
];
const ARC = { w: 150, h: 44, p0: [10, 32], p1: [75, 2], p2: [140, 32] } as const;

/** Material "directions_car" glyph (Apache 2.0). */
const CAR_PATH =
  "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z";

const arcPoint = (t: number) => {
  const { p0, p1, p2 } = ARC;
  return {
    x: (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0],
    y: (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1],
  };
};

/** Small lime orb with a gentle repeating pulse: the AI concierge at work. */
const ConciergeOrb: React.FC<{ frame: number }> = ({ frame }) => {
  const t = ((frame - S.card.enter) % 30) / 30;
  return (
    <div style={{ position: "relative", width: 12, height: 12, flexShrink: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: `1.5px solid ${THEME.lime}`,
          scale: String(lerp(1, 2.4, t)),
          opacity: 0.7 * (1 - t),
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9) 0%, ${THEME.lime} 55%)`,
          boxShadow: `0 0 10px color-mix(in srgb, ${THEME.lime} 60%, transparent)`,
        }}
      />
    </div>
  );
};

const Place: React.FC<{ name: string }> = ({ name }) => (
  <Title style={{ fontSize: 18, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{name.toUpperCase()}</Title>
);

const RouteLine: React.FC<{ frame: number }> = ({ frame }) => {
  const draw = ramp(frame, S.route.start, S.route.end - S.route.start, progressEase);
  const show = ramp(frame, S.route.start, 8);
  const car = arcPoint(draw);
  const d = `M ${ARC.p0[0]} ${ARC.p0[1]} Q ${ARC.p1[0]} ${ARC.p1[1]} ${ARC.p2[0]} ${ARC.p2[1]}`;
  return (
    <svg width={ARC.w} height={ARC.h} viewBox={`0 0 ${ARC.w} ${ARC.h}`} style={{ overflow: "visible", opacity: show }}>
      <defs>
        <mask id="transfer-reveal" maskUnits="userSpaceOnUse" x={-20} y={-30} width={ARC.w + 40} height={ARC.h + 60}>
          <path d={d} fill="none" stroke="white" strokeWidth={8} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        </mask>
      </defs>
      <path d={d} fill="none" stroke={THEME.textSecondary} strokeWidth={2} strokeDasharray="5 6" strokeLinecap="round" mask="url(#transfer-reveal)" />
      <circle cx={ARC.p0[0]} cy={ARC.p0[1]} r={4} fill={THEME.text} />
      <circle cx={ARC.p2[0]} cy={ARC.p2[1]} r={4} fill={THEME.text} opacity={ramp(frame, S.route.end - 6, 6)} />
      <g transform={`translate(${car.x.toFixed(2)} ${car.y.toFixed(2)})`}>
        <circle r={13} fill={THEME.lime} />
        <g transform="translate(-8 -8) scale(0.6667)">
          <path d={CAR_PATH} fill={THEME.onLime} />
        </g>
      </g>
    </svg>
  );
};

const Step: React.FC<{ frame: number; label: string; start: number; end: number }> = ({ frame, label, start, end }) => {
  const morphAt = end - S.morphFrames;
  const spinnerOut = ramp(frame, morphAt, 6);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, height: 30, ...swap(frame, start, null, 10, 10) }}>
      <div style={{ position: "relative", width: ICON, height: ICON, flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - spinnerOut, scale: String(lerp(1, 0.6, spinnerOut)) }}>
          <Spinner frame={frame} size={ICON} />
        </div>
        <div style={{ position: "absolute", inset: 0 }}>
          <LimeCheck frame={frame} start={morphAt + 2} size={ICON} drawFrames={8} />
        </div>
      </div>
      <Body style={{ whiteSpace: "nowrap" }}>{label}</Body>
    </div>
  );
};

/** Grows upward as each step, the confirmation pill and the pickup detail arrive. */
const TransferCard: React.FC<{ frame: number; fps: number; motion: ItemMotion; y: number; height: number; clipTop: number }> = ({
  frame,
  fps,
  motion,
  y,
  height,
  clipTop,
}) => {
  const pop = stackSpring(frame, S.confirmed.at, fps);
  const detail = ramp(frame, S.detail.at, 12);

  return (
    <Glass
      variant="action"
      tint={S.tint}
      width={STACK.width}
      height={height}
      transform={stackTransform(y, motion.scale)}
      fade={motion.fade}
      clipTop={clipTop}
      surfaceStyle={{ padding: 20 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, height: 18 }}>
        <ConciergeOrb frame={frame} />
        <Label>{S.copy.label}</Label>
      </div>
      <Title style={{ marginTop: 8, height: 31 }}>{S.copy.title}</Title>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, height: 52 }}>
        <Place name={S.copy.from} />
        <RouteLine frame={frame} />
        <Place name={S.copy.to} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
        {S.steps.map((step) => (
          <Step key={step.label} frame={frame} label={step.label} start={step.start} end={step.end} />
        ))}
      </div>

      <div style={{ marginTop: 14, height: 34, display: "flex" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 34,
            padding: "0 16px 0 10px",
            borderRadius: 17,
            background: THEME.lime,
            color: THEME.onLime,
            fontFamily: inter,
            fontSize: THEME.type.button.size,
            fontWeight: THEME.type.button.weight,
            transformOrigin: "0% 50%",
            opacity: interpolate(pop, [0, 0.4], [0, 1], clamp),
            scale: String(lerp(0.8, 1, pop)),
          }}
        >
          <DrawnCheck progress={ramp(frame, S.confirmed.at + 3, 10)} size={22} strokeWidth={2.8} />
          {S.copy.confirmed}
        </div>
      </div>

      <div style={{ marginTop: 8, height: 26, opacity: detail, translate: `0px ${(6 * (1 - detail)).toFixed(2)}px` }}>
        <Body color={THEME.textSecondary} style={{ lineHeight: "26px" }}>
          {S.copy.detail}
        </Body>
      </div>
    </Glass>
  );
};

export const AiConcierge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const qm = itemMotion(frame, fps, S.query.enter, EXIT.query);
  const cm = itemMotion(frame, fps, S.card.enter, EXIT.card);
  if (!qm.visible && !cm.visible) return null;

  const cardHeight = grownHeight(frame, fps, S.card.height, GROWTH);
  const [ql, cl] = stackLayout([
    { p: qm.p, h: STACK.queryHeight, ownY: qm.ownY },
    { p: cm.p, h: cardHeight, ownY: cm.ownY },
  ]);
  const float = floatY(frame, S.query.enter);

  return (
    <Stack bottom={S.stackBottom}>
      <QueryBubble frame={frame} text={S.query.text} enter={S.query.enter} dimAt={S.card.enter} tint={S.queryTint} motion={qm} y={-ql.offset + qm.ownY + float} />
      {cm.visible ? <TransferCard frame={frame} fps={fps} motion={cm} y={-cl.offset + cm.ownY + float} height={cardHeight} clipTop={cl.clipTop} /> : null}
    </Stack>
  );
};
