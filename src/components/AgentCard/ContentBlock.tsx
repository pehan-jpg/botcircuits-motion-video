import React from "react";
import { Easing, interpolate } from "remotion";
import { theme } from "./theme";
import { CheckIcon, Icon } from "./icons";
import { progress, useTiming, type Timing } from "./timing";
import type { ContentBlock as Block, IconName } from "./types";

type Of<T extends Block["type"]> = Extract<Block, { type: T }>;
type BlockProps<T extends Block["type"]> = { block: Of<T>; frame: number; start: number; timing: Timing };

/** How many stagger slots a block occupies before the next block starts. */
export const itemCount = (block: Block): number => {
  switch (block.type) {
    case "message":
      return 2;
    case "chips":
      return block.chips.length;
    case "checklist":
      return block.items.length;
    case "rows":
      return block.rows.length;
    case "boardingPass":
      return 3;
    case "ratingStrip":
      return 2;
    case "files":
      return block.files.length;
    case "summary":
      return block.items.length;
    case "callout":
      return 2;
    case "reschedule":
      return 3;
    case "checkPanel":
      return block.items.length;
    case "channelPanel":
      return block.rows.length;
  }
};

const at = (timing: Timing, start: number, i: number) => start + i * timing.contentStagger;

const rise = (p: number, dist = 12): React.CSSProperties => ({
  opacity: p,
  transform: `translateY(${(1 - p) * dist}px)`,
});

const inset: React.CSSProperties = {
  background: theme.insetBg,
  border: `1px solid ${theme.insetBorder}`,
  borderRadius: 18,
};

const IconTile: React.FC<{ icon: IconName; size?: number }> = ({ icon, size = 46 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 12,
      background: theme.limeSoft,
      border: `1px solid rgba(196,230,57,0.22)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <Icon name={icon} size={Math.round(size * 0.5)} color={theme.lime} />
  </div>
);

const Message: React.FC<BlockProps<"message">> = ({ block, frame, start, timing }) => {
  const p = progress(frame, at(timing, start, 0), timing.itemDuration + 6);
  return (
    <div style={{ display: "flex", ...rise(p, 16) }}>
      <div
        style={{
          maxWidth: 640,
          background: theme.chipBg,
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: "20px 20px 20px 6px",
          padding: "20px 26px",
          fontSize: theme.size.body,
          fontWeight: 500,
          lineHeight: 1.45,
          color: theme.text,
          transformOrigin: "left bottom",
          transform: `scale(${interpolate(p, [0, 1], [0.96, 1])})`,
        }}
      >
        {block.text}
      </div>
    </div>
  );
};

const Chips: React.FC<BlockProps<"chips">> = ({ block, frame, start, timing }) => (
  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
    {block.chips.map((c, i) => {
      const p = progress(frame, at(timing, start, i), timing.itemDuration);
      return (
        <div
          key={c.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 18px 10px 14px",
            borderRadius: 999,
            background: theme.chipBg,
            border: `1px solid ${theme.cardBorder}`,
            opacity: p,
            transform: `translateX(${(1 - p) * 20}px)`,
          }}
        >
          <Icon name={c.icon} size={20} color={theme.lime} />
          <span style={{ fontSize: theme.size.chip - 1, color: theme.text, fontWeight: 500 }}>{c.label}</span>
        </div>
      );
    })}
  </div>
);

const Checklist: React.FC<BlockProps<"checklist">> = ({ block, frame, start, timing }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
    {block.items.map((item, i) => {
      const p = progress(frame, at(timing, start, i), timing.itemDuration);
      const tick = progress(frame, at(timing, start, i) + 4, timing.itemDuration - 4);
      return (
        <div key={item} style={{ display: "flex", alignItems: "center", gap: 18, opacity: p, transform: `translateX(${(1 - p) * -14}px)` }}>
          <div style={{ transform: `scale(${interpolate(tick, [0, 1], [0.4, 1])})` }}>
            <CheckIcon size={28} color={theme.lime} />
          </div>
          <span style={{ fontSize: theme.size.body, color: theme.text, fontWeight: 500 }}>{item}</span>
        </div>
      );
    })}
  </div>
);

const Rows: React.FC<BlockProps<"rows">> = ({ block, frame, start, timing }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    {block.rows.map((r, i) => {
      // Rows are spaced two stagger slots apart so each tick lands before the next row.
      const s = at(timing, start, i * 1.6);
      const p = progress(frame, s, timing.itemDuration);
      const tick = progress(frame, s + 12, 16);
      return (
        <div
          key={r.label}
          style={{
            ...inset,
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "14px 20px 14px 14px",
            opacity: p,
            transform: `translateX(${(1 - p) * -16}px)`,
          }}
        >
          <IconTile icon={r.icon} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            <span style={{ fontSize: theme.size.caption, color: theme.textDim, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {r.caption}
            </span>
            <span style={{ fontSize: theme.size.body - 1, color: theme.text, fontWeight: 500 }}>{r.label}</span>
          </div>
          <div style={{ opacity: tick, transform: `scale(${interpolate(tick, [0, 1], [0.3, 1])})` }}>
            <CheckIcon size={30} color={theme.lime} />
          </div>
        </div>
      );
    })}
  </div>
);

// Boarding pass geometry
const ARC_W = 360;
const ARC_H = 84;
const P0 = { x: 12, y: 66 };
const P1 = { x: ARC_W / 2, y: -8 };
const P2 = { x: ARC_W - 12, y: 66 };
const arcPath = `M ${P0.x} ${P0.y} Q ${P1.x} ${P1.y} ${P2.x} ${P2.y}`;
const quad = (t: number) => ({
  x: (1 - t) ** 2 * P0.x + 2 * (1 - t) * t * P1.x + t ** 2 * P2.x,
  y: (1 - t) ** 2 * P0.y + 2 * (1 - t) * t * P1.y + t ** 2 * P2.y,
});
const quadAngle = (t: number) => {
  const dx = 2 * (1 - t) * (P1.x - P0.x) + 2 * t * (P2.x - P1.x);
  const dy = 2 * (1 - t) * (P1.y - P0.y) + 2 * t * (P2.y - P1.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};
const PASS_TOP = 140; // height of the upper section; perforation sits here
const NOTCH = 12;
const PASS_FOOT = 58;
/** Inner width of the card: card width minus padding and the 1.5px borders. */
const PASS_W = theme.cardWidth - theme.cardPadding * 2 - 3;

const Airport: React.FC<{ code: string; city: string; align: "left" | "right"; p: number }> = ({ code, city, align, p }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: align === "left" ? "flex-start" : "flex-end", gap: 2, ...rise(p, 10) }}>
    <span style={{ fontSize: theme.size.caption, color: theme.textDim, fontWeight: 600, letterSpacing: "0.1em" }}>
      {align === "left" ? "FROM" : "TO"}
    </span>
    <span style={{ fontSize: 46, fontWeight: 700, color: theme.text, letterSpacing: "-0.01em", lineHeight: 1.1 }}>{code}</span>
    <span style={{ fontSize: 17, color: theme.textMuted }}>{city}</span>
  </div>
);

const BoardingPass: React.FC<BlockProps<"boardingPass">> = ({ block, frame, start, timing }) => {
  const panel = progress(frame, at(timing, start, 0), timing.itemDuration);
  const codes = progress(frame, at(timing, start, 0) + 6, timing.itemDuration);
  const foot = progress(frame, at(timing, start, 1) + 6, timing.itemDuration);
  const flight = interpolate(frame, [at(timing, start, 0) + 14, at(timing, start, 0) + 14 + 84], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const pos = quad(flight);
  const angle = quadAngle(flight);
  const W = PASS_W;
  const H = PASS_TOP + PASS_FOOT;
  const r = 18;
  const n = NOTCH;
  // Ticket outline: rounded rect with a semicircular notch on each side at the perforation.
  const ticket = `M ${r} 0.5 H ${W - r} A ${r} ${r} 0 0 1 ${W - 0.5} ${r} V ${PASS_TOP - n} A ${n} ${n} 0 0 0 ${W - n} ${PASS_TOP} A ${n} ${n} 0 0 0 ${W - 0.5} ${PASS_TOP + n} V ${H - r} A ${r} ${r} 0 0 1 ${W - r} ${H - 0.5} H ${r} A ${r} ${r} 0 0 1 0.5 ${H - r} V ${PASS_TOP + n} A ${n} ${n} 0 0 0 ${n} ${PASS_TOP} A ${n} ${n} 0 0 0 0.5 ${PASS_TOP - n} V ${r} A ${r} ${r} 0 0 1 ${r} 0.5 Z`;

  return (
    <div
      style={{
        position: "relative",
        width: W,
        height: H,
        ...rise(panel, 12),
      }}
    >
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <path d={ticket} fill={theme.insetBg} stroke={theme.insetBorder} strokeWidth={1} />
      </svg>
      <div style={{ position: "relative", height: PASS_TOP, padding: "0 30px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Airport code={block.from.code} city={block.from.city} align="left" p={codes} />
        <div style={{ position: "relative", width: ARC_W, height: ARC_H, marginTop: 6 }}>
          <svg width={ARC_W} height={ARC_H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <path d={arcPath} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={2} strokeDasharray="2 8" strokeLinecap="round" />
            <path
              d={arcPath}
              fill="none"
              stroke={theme.lime}
              strokeWidth={2}
              pathLength={1}
              strokeDasharray={`${flight} 1`}
              strokeLinecap="round"
              opacity={0.85}
            />
            <circle cx={P0.x} cy={P0.y} r={5} fill={theme.lime} opacity={codes} />
            <circle cx={P2.x} cy={P2.y} r={5} fill="none" stroke={flight > 0.98 ? theme.lime : "rgba(255,255,255,0.4)"} strokeWidth={2} opacity={codes} />
          </svg>
          <div
            style={{
              position: "absolute",
              left: pos.x - 15,
              top: pos.y - 15,
              opacity: codes,
              transform: `rotate(${angle + 45}deg)`,
            }}
          >
            <Icon name="plane" size={30} color={theme.lime} fill="rgba(12,13,12,1)" />
          </div>
        </div>
        <Airport code={block.to.code} city={block.to.city} align="right" p={codes} />
      </div>
      {/* Perforation */}
      <div style={{ position: "absolute", left: NOTCH + 8, right: NOTCH + 8, top: PASS_TOP, borderTop: "2px dashed rgba(255,255,255,0.14)" }} />
      <div style={{ position: "relative", height: PASS_FOOT, padding: "0 30px", display: "flex", alignItems: "center", justifyContent: "space-between", ...rise(foot, 6) }}>
        {[block.footLeft, block.footRight].map((f) => (
          <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name={f.icon} size={20} color={theme.lime} />
            <span style={{ fontSize: 18, color: theme.text, fontWeight: 500 }}>{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RatingStrip: React.FC<BlockProps<"ratingStrip">> = ({ block, frame, start, timing }) => {
  const p = progress(frame, at(timing, start, 0), timing.itemDuration);
  return (
    <div style={{ ...inset, borderRadius: 16, display: "flex", alignItems: "center", gap: 18, padding: "14px 22px 14px 14px", ...rise(p, 10) }}>
      <IconTile icon={block.icon} />
      <span style={{ flex: 1, fontSize: theme.size.body - 2, color: theme.text, fontWeight: 500 }}>{block.text}</span>
      <div style={{ display: "flex", gap: 6 }}>
        {Array.from({ length: block.stars }).map((_, i) => {
          const s = progress(frame, at(timing, start, 1) + i * 7, 14);
          return (
            <div key={i} style={{ position: "relative", width: 22, height: 22 }}>
              <div style={{ position: "absolute", inset: 0 }}>
                <Icon name="star" size={22} color="rgba(255,255,255,0.25)" strokeWidth={1.6} />
              </div>
              <div style={{ position: "absolute", inset: 0, opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.4, 1])})` }}>
                <Icon name="star" size={22} color={theme.lime} fill={theme.lime} strokeWidth={1.6} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Files: React.FC<BlockProps<"files">> = ({ block, frame, start, timing }) => (
  <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
    {block.files.map((file, i) => {
      const p = progress(frame, at(timing, start, i), timing.itemDuration + 4);
      return (
        <div
          key={file}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "13px 22px 13px 18px",
            borderRadius: 14,
            background: theme.chipBg,
            border: `1px solid ${theme.cardBorder}`,
            opacity: p,
            transform: `translateX(${(1 - p) * 28}px)`,
          }}
        >
          <Icon name="file" size={22} color={theme.lime} />
          <span style={{ fontSize: theme.size.chip, color: theme.text, fontWeight: 500 }}>{file}</span>
        </div>
      );
    })}
  </div>
);

const Summary: React.FC<BlockProps<"summary">> = ({ block, frame, start, timing }) => {
  const panel = progress(frame, at(timing, start, 0), timing.itemDuration);
  return (
    <div style={{ ...inset, borderRadius: 16, padding: "14px 20px", ...rise(panel, 10) }}>
      <div style={{ fontSize: theme.size.caption, color: theme.textDim, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
        {block.caption}
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        {block.items.map((it, i) => {
          const p = progress(frame, at(timing, start, i) + 4, timing.itemDuration);
          return (
            <React.Fragment key={it.label}>
              {i > 0 && <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.12)", margin: "0 16px", opacity: p }} />}
              <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: p, transform: `translateX(${(1 - p) * 14}px)` }}>
                <Icon name={it.icon} size={22} color={theme.lime} />
                <span style={{ fontSize: 17, color: it.highlight ? theme.lime : theme.text, fontWeight: it.highlight ? 600 : 500, whiteSpace: "nowrap" }}>
                  {it.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const Callout: React.FC<BlockProps<"callout">> = ({ block, frame, start, timing }) => {
  const panel = progress(frame, at(timing, start, 0), timing.itemDuration);
  const head = progress(frame, at(timing, start, 0) + 6, timing.itemDuration);
  const body = progress(frame, at(timing, start, 1) + 6, timing.itemDuration);
  return (
    <div style={{ ...inset, display: "flex", gap: 18, padding: "22px 26px", ...rise(panel, 10) }}>
      <div style={{ paddingTop: 1, ...rise(head, 6) }}>
        <Icon name="info" size={26} color={theme.lime} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: theme.size.calloutHeading, fontWeight: 600, color: theme.text, ...rise(head, 8) }}>{block.heading}</div>
        <div style={{ fontSize: theme.size.calloutBody, lineHeight: 1.5, color: theme.textMuted, ...rise(body, 8) }}>{block.body}</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Light-panel blocks (Healthcare)

const lightPanel: React.CSSProperties = {
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 18,
};

/** Lime check circle that draws in: ring first, then the tick. */
const DrawnCheck: React.FC<{ ring: number; tick: number; size?: number }> = ({ ring, tick, size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block", flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10.5" fill={`rgba(196,230,57,${0.14 * tick})`} />
    <circle
      cx="12"
      cy="12"
      r="10.5"
      stroke={theme.lime}
      strokeWidth={1.8}
      pathLength={1}
      strokeDasharray="1 1"
      strokeDashoffset={1 - ring}
      transform="rotate(-90 12 12)"
      opacity={ring > 0 ? 1 : 0}
    />
    <path
      d="M7.5 12.3l3 3 6-6.3"
      stroke={theme.lime}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray="1 1"
      strokeDashoffset={1 - tick}
      opacity={tick > 0 ? 1 : 0}
    />
  </svg>
);

const Reschedule: React.FC<BlockProps<"reschedule">> = ({ block, frame, start, timing }) => {
  const row = (i: number) => progress(frame, at(timing, start, i), timing.itemDuration);
  const strikeStart = at(timing, start, 2) + timing.itemDuration;
  const strike = progress(frame, strikeStart, 20);
  const arrow = progress(frame, strikeStart + 18, 16);
  const toStart = strikeStart + 24;
  const to = progress(frame, toStart, 24);
  // Brief lime highlight as the new date lands, settling to the normal lime chip.
  const glow = interpolate(frame, [toStart, toStart + 12, toStart + 54], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const chip: React.CSSProperties = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 18px 10px 14px",
    borderRadius: 12,
    fontSize: theme.size.chip,
    fontWeight: 600,
  };
  return (
    <div style={{ ...lightPanel, padding: "22px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, ...rise(row(0), 10) }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 999,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: "0.04em",
            color: theme.text,
          }}
        >
          {block.initials}
        </div>
        <span style={{ fontSize: theme.size.body - 1, color: theme.text, fontWeight: 500 }}>{block.name}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, ...rise(row(1), 10) }}>
        <div
          style={{
            ...chip,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: `rgba(255,255,255,${interpolate(strike, [0, 1], [1, 0.55])})`,
          }}
        >
          <Icon name="calendar" size={20} color={`rgba(255,255,255,${interpolate(strike, [0, 1], [0.8, 0.45])})`} />
          {block.from}
          <div
            style={{
              position: "absolute",
              left: 10,
              right: 10,
              top: "50%",
              height: 2,
              marginTop: -1,
              borderRadius: 2,
              background: "rgba(255,255,255,0.8)",
              transformOrigin: "0% 50%",
              transform: `scaleX(${strike})`,
            }}
          />
        </div>
        <div style={{ opacity: arrow, transform: `translateX(${(1 - arrow) * -6}px)` }}>
          <Icon name="arrowRight" size={22} color={theme.textMuted} />
        </div>
        <div
          style={{
            ...chip,
            color: theme.lime,
            background: `rgba(196,230,57,${0.12 + 0.16 * glow})`,
            border: `1.5px solid ${theme.lime}`,
            boxShadow: `0 0 ${28 * glow}px rgba(196,230,57,${0.35 * glow})`,
            opacity: to,
            transform: `translateX(${(1 - to) * -16}px)`,
          }}
        >
          <Icon name="calendar" size={20} color={theme.lime} />
          {block.to}
        </div>
      </div>
      <div style={{ fontSize: theme.size.chip, color: theme.textMuted, ...rise(row(2), 8) }}>{block.detail}</div>
    </div>
  );
};

const PanelRows: React.FC<{
  rows: { key: string; lead?: React.ReactNode; label: string; trail?: React.ReactNode }[];
  frame: number;
  start: number;
  timing: Timing;
}> = ({ rows, frame, start, timing }) => (
  <div style={{ ...lightPanel, padding: "6px 24px" }}>
    {rows.map((r, i) => {
      const p = progress(frame, at(timing, start, i), timing.itemDuration);
      return (
        <div
          key={r.key}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "16px 0",
            borderTop: i > 0 ? `1px solid rgba(255,255,255,${0.07 * p})` : undefined,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, ...rise(p, 8) }}>
            {r.lead}
            <span style={{ fontSize: theme.size.body - 1, color: theme.text, fontWeight: 500 }}>{r.label}</span>
          </div>
          {r.trail}
        </div>
      );
    })}
  </div>
);

const CheckPanel: React.FC<BlockProps<"checkPanel">> = ({ block, frame, start, timing }) => {
  // Checks draw one after another, once the rows are in.
  const checksStart = at(timing, start, block.items.length) + 6;
  return (
    <PanelRows
      frame={frame}
      start={start}
      timing={timing}
      rows={block.items.map((label, i) => {
        const s = checksStart + i * 20;
        return {
          key: label,
          label,
          lead: <DrawnCheck ring={progress(frame, s, 18)} tick={progress(frame, s + 10, 14)} />,
        };
      })}
    />
  );
};

const ChannelPanel: React.FC<BlockProps<"channelPanel">> = ({ block, frame, start, timing }) => (
  <PanelRows
    frame={frame}
    start={start}
    timing={timing}
    rows={block.rows.map((r) => ({ key: r.label, label: r.label, lead: <IconTile icon={r.icon} size={42} /> }))}
  />
);

const renderBlock = (block: Block, frame: number, start: number, timing: Timing) => {
  switch (block.type) {
    case "message":
      return <Message block={block} frame={frame} start={start} timing={timing} />;
    case "chips":
      return <Chips block={block} frame={frame} start={start} timing={timing} />;
    case "checklist":
      return <Checklist block={block} frame={frame} start={start} timing={timing} />;
    case "rows":
      return <Rows block={block} frame={frame} start={start} timing={timing} />;
    case "boardingPass":
      return <BoardingPass block={block} frame={frame} start={start} timing={timing} />;
    case "ratingStrip":
      return <RatingStrip block={block} frame={frame} start={start} timing={timing} />;
    case "files":
      return <Files block={block} frame={frame} start={start} timing={timing} />;
    case "summary":
      return <Summary block={block} frame={frame} start={start} timing={timing} />;
    case "callout":
      return <Callout block={block} frame={frame} start={start} timing={timing} />;
    case "reschedule":
      return <Reschedule block={block} frame={frame} start={start} timing={timing} />;
    case "checkPanel":
      return <CheckPanel block={block} frame={frame} start={start} timing={timing} />;
    case "channelPanel":
      return <ChannelPanel block={block} frame={frame} start={start} timing={timing} />;
  }
};

/** Stacks a state's blocks; each block starts after the previous block's items. */
export const ContentStack: React.FC<{ blocks: Block[]; frame: number }> = ({ blocks, frame }) => {
  const timing = useTiming();
  let slot = 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {blocks.map((block, i) => {
        const start = timing.contentStart + slot * timing.contentStagger;
        slot += itemCount(block);
        return <React.Fragment key={i}>{renderBlock(block, frame, start, timing)}</React.Fragment>;
      })}
    </div>
  );
};
