import type React from "react";
import { random, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENES, STACK, THEME, exitTiming } from "../config";
import { type ItemMotion, floatY, itemMotion, progressEase, ramp, stackLayout, stackTransform } from "../motion";
import { Body, Glass, Label, PLANE_PATH, QueryBubble, RollText, Stack, Title } from "../ui";

const S = SCENES.boardingPass;
const EXIT = exitTiming(S.exitEnd);
const ARC = { w: 196, h: 52, p0: [12, 40], p1: [98, -8], p2: [184, 40] } as const;
const BAR_WIDTHS = Array.from({ length: S.barcode.bars }, (_, i) => [2, 2, 3, 4, 6][Math.floor(random(`bar-${i}`) * 5)]);

const arcPoint = (t: number) => {
  const { p0, p1, p2 } = ARC;
  const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0];
  const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1];
  const dx = 2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
  const dy = 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI };
};

const Airport: React.FC<{ code: string; city: string; align: "left" | "right" }> = ({ code, city, align }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: align === "left" ? "flex-start" : "flex-end", width: 98 }}>
    <Title style={{ letterSpacing: "0.04em" }}>{code}</Title>
    <Label>{city}</Label>
  </div>
);

const Route: React.FC<{ frame: number }> = ({ frame }) => {
  const draw = ramp(frame, S.route.start, S.route.end - S.route.start, progressEase);
  const show = ramp(frame, S.route.start, 8);
  const plane = arcPoint(draw);
  const d = `M ${ARC.p0[0]} ${ARC.p0[1]} Q ${ARC.p1[0]} ${ARC.p1[1]} ${ARC.p2[0]} ${ARC.p2[1]}`;
  return (
    <svg width={ARC.w} height={ARC.h} viewBox={`0 0 ${ARC.w} ${ARC.h}`} style={{ overflow: "visible", opacity: show }}>
      <defs>
        <mask id="route-reveal" maskUnits="userSpaceOnUse" x={-20} y={-30} width={ARC.w + 40} height={ARC.h + 60}>
          <path d={d} fill="none" stroke="white" strokeWidth={8} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        </mask>
      </defs>
      <path d={d} fill="none" stroke={THEME.textSecondary} strokeWidth={2} strokeDasharray="5 6" strokeLinecap="round" mask="url(#route-reveal)" />
      <circle cx={ARC.p0[0]} cy={ARC.p0[1]} r={4} fill={THEME.text} />
      <circle cx={ARC.p2[0]} cy={ARC.p2[1]} r={4} fill={THEME.text} opacity={ramp(frame, S.route.end - 6, 6)} />
      <g transform={`translate(${plane.x.toFixed(2)} ${plane.y.toFixed(2)}) rotate(${(plane.angle + 90).toFixed(2)})`}>
        <circle r={13} fill={THEME.lime} />
        <g transform="translate(-8 -8) scale(0.6667)">
          <path d={PLANE_PATH} fill={THEME.onLime} />
        </g>
      </g>
    </svg>
  );
};

const Detail: React.FC<{ frame: number; label: string; value: string; start: number }> = ({ frame, label, value, start }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5, opacity: ramp(frame, start, 8) }}>
    <Label>{label}</Label>
    <Title>
      <RollText text={value} frame={frame} start={start + 2} style={{ height: 31 }} />
    </Title>
  </div>
);

const Barcode: React.FC<{ frame: number }> = ({ frame }) => {
  const span = S.barcode.end - S.barcode.start - 8;
  return (
    <div style={{ display: "flex", gap: 3, height: 32, alignItems: "flex-end" }}>
      {BAR_WIDTHS.map((w, i) => (
        <div
          key={i}
          style={{
            flex: `${w} 0 0`,
            height: "100%",
            background: THEME.text,
            borderRadius: 1,
            transformOrigin: "50% 100%",
            scale: `1 ${ramp(frame, S.barcode.start + (i / S.barcode.bars) * span, 8)}`,
          }}
        />
      ))}
    </div>
  );
};

const DoubleTick: React.FC<{ frame: number; start: number }> = ({ frame, start }) => {
  const a = ramp(frame, start, 10);
  const b = ramp(frame, start + 6, 10);
  const common = { fill: "none", stroke: THEME.onLime, strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round", pathLength: 1, strokeDasharray: 1 } as const;
  return (
    <div style={{ width: 44, height: 28, borderRadius: 14, background: THEME.lime, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={28} height={20} viewBox="0 0 28 20">
        <path d="M3 10.5l4 4 9-9.5" strokeDashoffset={1 - a} opacity={a > 0 ? 1 : 0} {...common} />
        <path d="M12.5 13l1.5 1.5 9-9.5" strokeDashoffset={1 - b} opacity={b > 0 ? 1 : 0} {...common} />
      </svg>
    </div>
  );
};

const Pass: React.FC<{ frame: number; motion: ItemMotion; y: number; clipTop: number }> = ({ frame, motion, y, clipTop }) => {
  const wipe = ramp(frame, S.wipe.start, S.wipe.end - S.wipe.start);

  return (
    <Glass
      variant="action"
      tint={S.tint}
      width={STACK.width}
      height={S.card.height}
      transform={stackTransform(y, motion.scale)}
      fade={motion.fade}
      clipRight={STACK.width * (1 - wipe)}
      clipTop={clipTop}
      surfaceStyle={{ padding: 18, display: "flex", flexDirection: "column" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 26 }}>
        <Label>{S.copy.label}</Label>
        <Label color={THEME.onLime} style={{ opacity: 1, textShadow: "none", background: THEME.lime, padding: "5px 10px", borderRadius: 999 }}>
          {S.copy.badge}
        </Label>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, height: 52 }}>
        <Airport code={S.copy.from.code} city={S.copy.from.city} align="left" />
        <Route frame={frame} />
        <Airport code={S.copy.to.code} city={S.copy.to.city} align="right" />
      </div>

      <div style={{ borderTop: `1.5px dashed ${THEME.hairline}`, marginTop: 12 }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.25fr", marginTop: 12 }}>
        {S.copy.details.map((d, i) => (
          <Detail key={d.label} frame={frame} label={d.label} value={d.value} start={S.details.start + i * S.details.stagger} />
        ))}
      </div>

      <div style={{ marginTop: "auto" }}>
        <Barcode frame={frame} />
      </div>
    </Glass>
  );
};

const Tag: React.FC<{ frame: number; motion: ItemMotion; y: number; clipTop: number }> = ({ frame, motion, y, clipTop }) => (
  <Glass
    variant="action"
    tint={S.tint}
    width="fit"
    height={S.tag.height}
    radius={999}
    transform={stackTransform(y, motion.scale)}
    fade={motion.fade}
    clipTop={clipTop}
    surfaceStyle={{ padding: "0 18px 0 10px", display: "flex", alignItems: "center", gap: 12, whiteSpace: "nowrap" }}
  >
    <DoubleTick frame={frame} start={S.tag.at + 8} />
    <Body style={{ lineHeight: 1.3 }}>{S.copy.tag}</Body>
  </Glass>
);

export const BoardingPass: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const qm = itemMotion(frame, fps, S.query.enter, EXIT.query);
  const pm = itemMotion(frame, fps, S.card.enter, EXIT.card);
  const tm = itemMotion(frame, fps, S.tag.at, EXIT.card);
  if (!qm.visible && !pm.visible) return null;

  const [ql, pl, tl] = stackLayout([
    { p: qm.p, h: STACK.queryHeight, ownY: qm.ownY },
    { p: pm.p, h: S.card.height, ownY: pm.ownY },
    { p: tm.p, h: S.tag.height, ownY: tm.ownY },
  ]);
  const float = floatY(frame, S.query.enter);

  return (
    <Stack bottom={S.stackBottom}>
      <QueryBubble frame={frame} text={S.query.text} enter={S.query.enter} dimAt={S.card.enter} tint={S.queryTint} motion={qm} y={-ql.offset + qm.ownY + float} />
      {pm.visible ? <Pass frame={frame} motion={pm} y={-pl.offset + pm.ownY + float} clipTop={pl.clipTop} /> : null}
      {tm.visible ? <Tag frame={frame} motion={tm} y={-tl.offset + tm.ownY + float} clipTop={tl.clipTop} /> : null}
    </Stack>
  );
};
