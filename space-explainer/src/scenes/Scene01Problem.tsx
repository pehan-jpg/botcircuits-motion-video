import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BLUR_IN, COLOR, EASE, EASE_SETTLE, FONT } from "../theme";
import { f, localF, local } from "../timeline";
import { PLACEHOLDERS as P } from "../placeholders";
import { TextBeat, textBeatTiming } from "../components/TextBeat";
import { BlurText } from "../components/BlurText";
import { AgentOrb, orbOuterRadius } from "../components/AgentOrb";
import { GuardLayer } from "../components/GuardLayer";
import type { TextBeatSpec } from "../lib/guards";

const S = "S01" as const;
const ev = (n: Parameters<typeof localF>[0]) => localF(n, S);

// ---------- Layout ----------
const TILE = { w: 330, h: 250, top: 420, header: 56 };
const TILE_X = [330, 750, 1170, 1590];
const CARD = { w: 282, h: 120 };
const cardCentre = (i: number) => ({
  x: TILE_X[i],
  y: TILE.top + TILE.header + (TILE.h - TILE.header) / 2,
});
const ORB_SIZE = 150;
const ORB_POS = { x: 820, y: 600 };
const CENTRE = { x: 960, y: 540 };
const STAMP_POS = [
  { x: 1112, y: 545, rot: -7 },
  { x: 1112, y: 662, rot: 5 },
];
const SLOT = { x: 1440, y: 600, d: 168 };
const CHIP_TOP = 762;
const LINE_A_TOP = 788;
const LINE_B_TOP = 866;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], clamp);

// ---------- Text timing (read by the check script) ----------
const H1 = "Work moves between people, tools and inboxes.";
const H2 = "AI can do the work. But who checks it?";
const CHIPS = [
  "Who has it now?",
  "Who approved it?",
  "Which version is right?",
];
const LINE_A = "No record of who decided.";
const LINE_B = "No one deciding.";
const CHIP_EVENTS = [
  "chip_who_has_it",
  "chip_who_approved",
  "chip_which_version",
] as const;
const CHIPS_OUT = 7.15;
const LINES_OUT = 14.4;

export const SCENE01_TEXT: TextBeatSpec[] = (() => {
  const h1 = textBeatTiming(H1, "s1-h1");
  const h2 = textBeatTiming(H2, "s1-h2");
  return [
    {
      id: "h1",
      text: H1,
      readyAt: local("headline_work_moves", S) + h1.typed,
      leaveAt: local("headline_work_moves", S) + h1.outAt,
      fontPx: 56,
    },
    {
      id: "h2",
      text: H2,
      readyAt: local("headline_who_checks", S) + h2.typed,
      leaveAt: local("headline_who_checks", S) + h2.outAt,
      fontPx: 56,
    },
    ...CHIPS.map((c, i) => ({
      id: `chip${i + 1}`,
      text: c,
      readyAt: local(CHIP_EVENTS[i], S) + BLUR_IN.seconds,
      leaveAt: CHIPS_OUT,
      fontPx: 30,
    })),
    {
      id: "lineA",
      text: LINE_A,
      readyAt: local("line_no_record", S) + BLUR_IN.seconds,
      leaveAt: LINES_OUT,
      fontPx: 52,
    },
    {
      id: "lineB",
      text: LINE_B,
      readyAt: local("line_no_one", S) + BLUR_IN.seconds,
      leaveAt: LINES_OUT,
      fontPx: 52,
    },
  ];
})();

// ---------- Pieces ----------
type Variant = 0 | 1 | 2 | 3;

const Tile: React.FC<{ i: Variant; appear: number; version: number }> = ({
  i,
  appear,
  version,
}) => {
  const left = TILE_X[i] - TILE.w / 2;
  return (
    <div
      data-guard="box"
      style={{
        position: "absolute",
        left,
        top: TILE.top,
        width: TILE.w,
        height: TILE.h,
        borderRadius: 20,
        background: "#FFFFFF",
        border: "1px solid rgba(13,18,36,0.08)",
        boxShadow: "0 12px 36px rgba(13,18,36,0.07)",
        opacity: appear,
        transform: `translateY(${(1 - appear) * 16}px)`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: TILE.header,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          borderBottom: "1px solid rgba(13,18,36,0.07)",
          fontFamily: FONT.mono,
          fontSize: 28,
          color: COLOR.inkMuted,
        }}
      >
        <span data-guard="text" data-guard-label={`Tile ${P.scene1Places[i]}`}>
          {P.scene1Places[i]}
        </span>
        <span
          data-guard="text"
          data-guard-label={`Version ${P.scene1Versions[i]}`}
          style={{ opacity: version, fontSize: 28 }}
        >
          {P.scene1Versions[i]}
        </span>
      </div>
      <TileDecor i={i} />
    </div>
  );
};

/** Faint, colourless hints of each tool. */
const TileDecor: React.FC<{ i: Variant }> = ({ i }) => {
  const line = "rgba(13,18,36,0.06)";
  if (i === 1)
    return (
      <svg
        width={TILE.w}
        height={TILE.h - TILE.header}
        style={{ position: "absolute", top: TILE.header }}
      >
        {[1, 2, 3, 4].map((r) => (
          <line
            key={r}
            x1={0}
            x2={TILE.w}
            y1={r * 39}
            y2={r * 39}
            stroke={line}
            strokeWidth={2}
          />
        ))}
        {[110, 220].map((c) => (
          <line
            key={c}
            x1={c}
            x2={c}
            y1={0}
            y2={TILE.h}
            stroke={line}
            strokeWidth={2}
          />
        ))}
      </svg>
    );
  return null;
};

const ClaimCard: React.FC<{
  variant: Variant;
  style?: React.CSSProperties;
  textOpacity?: number;
}> = ({ variant, style, textOpacity = 1 }) => {
  const base: React.CSSProperties = {
    position: "absolute",
    width: CARD.w,
    height: CARD.h,
    background: "#FFFFFF",
    border: "1.5px solid rgba(13,18,36,0.14)",
    borderRadius: 14,
    boxShadow: "0 10px 28px rgba(13,18,36,0.12)",
    padding: "16px 20px",
    boxSizing: "border-box",
    fontFamily: FONT.sans,
    color: COLOR.ink,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 2,
  };
  const variants: React.CSSProperties[] = [
    { borderLeft: "6px solid rgba(13,18,36,0.35)" },
    { borderRadius: 4, background: "#F7F8FA" },
    { borderRadius: "22px 22px 22px 6px" },
    { borderRadius: "6px 22px 6px 6px" },
  ];
  return (
    <div style={{ ...base, ...variants[variant], ...style }}>
      <div
        data-guard="text"
        data-guard-label="Claim card"
        style={{ opacity: textOpacity }}
      >
        <div
          style={{
            fontSize: 30,
            fontWeight: 700,
            lineHeight: 1.2,
            whiteSpace: "nowrap",
          }}
        >
          Claim {P.claimId}
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            lineHeight: 1.25,
            whiteSpace: "nowrap",
            color: COLOR.ink,
          }}
        >
          {P.insured}
        </div>
      </div>
    </div>
  );
};

const Stamp: React.FC<{
  label: string;
  at: number;
  x: number;
  y: number;
  rot: number;
  out: number;
}> = ({ label, at, x, y: y0, rot, out }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const y = y0 + Math.sin((frame / fps / 3.3) * Math.PI * 2 + rot) * 5;
  const p = ramp(frame, at, at + 0.38 * fps);
  if (frame < at) return null;
  const s = 1.35 - 0.35 * EASE_SETTLE(p);
  const o = Math.min(1, p * 4) * (1 - out);
  const ring = ramp(frame, at + 0.2 * fps, at + 0.75 * fps);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x - 80,
          top: y - 40,
          width: 160,
          height: 80,
          borderRadius: 14,
          border: "2px solid rgba(13,18,36,0.25)",
          transform: `rotate(${rot}deg) scale(${1 + ring * 0.35})`,
          opacity: (1 - ring) * 0.6 * (1 - out),
        }}
      />
      <div
        data-guard="text"
        data-guard-label={`Stamp ${label}`}
        style={{
          position: "absolute",
          left: x,
          top: y,
          transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${s})`,
          opacity: o,
          border: `3px solid ${COLOR.ink}`,
          borderRadius: 12,
          padding: "6px 24px",
          fontFamily: FONT.mono,
          fontWeight: 600,
          fontSize: 36,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: COLOR.ink,
          background: "rgba(255,255,255,0.7)",
        }}
      >
        {label}
      </div>
    </>
  );
};

/** Dashed empty slot where a person would be. Grey on purpose: no amber, no one is here. */
const EmptySlot: React.FC<{ appear: number; spin: number }> = ({
  appear,
  spin,
}) => (
  <div
    data-guard="box"
    style={{
      position: "absolute",
      left: SLOT.x - SLOT.d / 2,
      top: SLOT.y - SLOT.d / 2,
      width: SLOT.d,
      height: SLOT.d,
      opacity: appear,
      transform: `scale(${0.92 + 0.08 * EASE(appear)})`,
    }}
  >
    <svg
      width={SLOT.d}
      height={SLOT.d}
      viewBox="-84 -84 168 168"
      style={{ overflow: "visible" }}
    >
      <circle
        r={80}
        fill="rgba(255,255,255,0.45)"
        stroke="rgba(13,18,36,0.38)"
        strokeWidth={2.5}
        strokeDasharray="10 9"
        transform={`rotate(${spin})`}
      />
      <g
        fill="none"
        stroke="rgba(13,18,36,0.32)"
        strokeWidth={2.5}
        strokeDasharray="6 6"
      >
        <circle cx={0} cy={-20} r={18} />
        <path d="M-34 40 C-34 14 -18 4 0 4 C18 4 34 14 34 40" />
      </g>
    </svg>
  </div>
);

const Connector: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  draw: number;
  opacity: number;
}> = ({ x1, y1, x2, y2, draw, opacity }) => {
  const len = Math.hypot(x2 - x1, y2 - y1);
  return (
    <svg
      width={1920}
      height={1080}
      style={{ position: "absolute", inset: 0, overflow: "visible", opacity }}
    >
      <defs>
        <mask id={`m-${x1}-${y1}-${x2}`}>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="white"
            strokeWidth={6}
            strokeDasharray={`${len * draw} ${len}`}
          />
        </mask>
      </defs>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="rgba(13,18,36,0.3)"
        strokeWidth={2}
        strokeDasharray="6 8"
        mask={`url(#m-${x1}-${y1}-${x2})`}
      />
    </svg>
  );
};

// ---------- Scene ----------
export const Scene01Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);

  // Camera: very slow drift about the centre (centre stays fixed for the Scene 2 handoff).
  const cam = 1 + 0.035 * EASE(frame / durationInFrames);
  const tSec = frame / fps;

  // Tiles appear, then dim to a ghost layer, then fade out.
  const tileIn = (i: number) =>
    EASE(ramp(frame, sec(0.05 + i * 0.08), sec(0.65 + i * 0.08)));
  const dim = EASE(
    ramp(frame, ev("card_to_orb") + sec(0.2), ev("card_to_orb") + sec(1.2)),
  );
  const gone = EASE(
    ramp(frame, ev("strays_fade"), ev("strays_fade") + sec(0.8)),
  );
  const layerOpacity = (1 - 0.8 * dim) * (1 - gone);
  const layerBlur = 3 * dim;

  // Hops: card lives in tile 0 then moves 0 to 1 to 2 to 3.
  const hops = [ev("hop_sheet"), ev("hop_chat"), ev("hop_pdf")];
  const HOP = sec(0.62);
  const land = ev("claim_lands");
  const landP = EASE(ramp(frame, land, land + sec(0.6)));

  let live = cardCentre(0);
  let liveVariant: Variant = 0;
  let liveLift = 0;
  let liveRot = 0;
  hops.forEach((h, k) => {
    if (frame >= h) {
      const p = EASE(ramp(frame, h, h + HOP));
      const a = cardCentre(k);
      const b = cardCentre(k + 1);
      live = {
        x: a.x + (b.x - a.x) * p,
        y: a.y + (b.y - a.y) * p - Math.sin(Math.PI * p) * 70,
      };
      liveVariant = (p > 0.5 ? k + 1 : k) as Variant;
      liveLift = Math.sin(Math.PI * p);
      liveRot = Math.sin(Math.PI * p) * 3;
    }
  });
  const versionShown = (i: number) =>
    i === 0
      ? landP
      : EASE(ramp(frame, hops[i - 1] + HOP * 0.7, hops[i - 1] + HOP));

  // Card to orb morph (in the PDF tile), then glide to its spot.
  const m0 = ev("card_to_orb");
  const textFade = 1 - EASE(ramp(frame, m0, m0 + sec(0.25)));
  const shape = EASE(ramp(frame, m0 + sec(0.1), m0 + sec(0.75)));
  const orbIn = EASE(ramp(frame, m0 + sec(0.55), m0 + sec(0.9)));
  const glide = EASE(ramp(frame, m0 + sec(0.95), m0 + sec(1.95)));
  const toCentre = EASE(
    ramp(frame, ev("orb_to_centre"), ev("orb_to_centre") + sec(1.6)),
  );
  const pdf = cardCentre(3);
  const gx = pdf.x + (ORB_POS.x - pdf.x) * glide;
  const gy =
    pdf.y + (ORB_POS.y - pdf.y) * glide - Math.sin(Math.PI * glide) * 50;
  // Gentle float while it waits; zero at the centre so the Scene 2 handoff is exact.
  const float = glide * (1 - toCentre);
  const orbX =
    gx +
    (CENTRE.x - gx) * toCentre +
    Math.sin((tSec / 4.1) * Math.PI * 2) * 6 * float;
  const orbY =
    gy +
    (CENTRE.y - gy) * toCentre +
    Math.sin((tSec / 2.9) * Math.PI * 2) * 9 * float;

  // Stamps, slot and connectors.
  const groupOut = EASE(ramp(frame, sec(12.9), sec(13.5)));
  const slotIn = EASE(
    ramp(frame, ev("empty_slot"), ev("empty_slot") + sec(0.7)),
  );
  const slotOut = EASE(
    ramp(frame, ev("strays_fade") + sec(0.2), ev("strays_fade") + sec(1.0)),
  );
  const orbR = orbOuterRadius(ORB_SIZE);

  const morphW = CARD.w + (ORB_SIZE - CARD.w) * shape;
  const morphH = CARD.h + (ORB_SIZE - CARD.h) * shape;
  const morphRadius = 14 + (ORB_SIZE / 2 - 14) * shape;

  return (
    <AbsoluteFill
      style={{ width: 1920, height: 1080, background: COLOR.problemGrey }}
    >
      <AbsoluteFill
        style={{ transform: `scale(${cam})`, transformOrigin: "960px 540px" }}
      >
        {/* Tool tiles, stray copies and the live card */}
        <AbsoluteFill
          style={{
            opacity: layerOpacity,
            filter: layerBlur > 0.05 ? `blur(${layerBlur}px)` : undefined,
            // Ghost layer drifts slowly once dimmed, so the frame never sits still.
            transform: `translateX(${-26 * ramp(frame, ev("card_to_orb"), ev("strays_fade") + sec(1))}px)`,
          }}
        >
          {TILE_X.map((_, i) => (
            <Tile
              key={i}
              i={i as Variant}
              appear={tileIn(i)}
              version={versionShown(i)}
            />
          ))}
          {/* Stray copies left behind at each hop */}
          {hops.map((h, k) => {
            if (frame < h) return null;
            const c = cardCentre(k);
            const settle = EASE(ramp(frame, h, h + sec(0.5)));
            const rots = [-2.5, 2, -1.5];
            return (
              <ClaimCard
                key={k}
                variant={k as Variant}
                style={{
                  left: c.x - CARD.w / 2 - 6 * settle,
                  top: c.y - CARD.h / 2 + 6 * settle,
                  transform: `rotate(${rots[k] * settle}deg)`,
                  opacity: 1 - 0.28 * settle,
                  borderStyle: "dashed",
                  boxShadow: "none",
                }}
              />
            );
          })}
        </AbsoluteFill>

        {/* Live card: lands, hops, then morphs into the orb */}
        {frame >= land && orbIn < 1 ? (
          <div style={{ opacity: (frame < m0 ? 1 : 1 - orbIn) * (1 - gone) }}>
            {frame < m0 ? (
              <ClaimCard
                variant={liveVariant}
                style={{
                  left: live.x - CARD.w / 2,
                  top: live.y - CARD.h / 2 - (1 - landP) * 90,
                  opacity: landP,
                  filter: landP < 1 ? `blur(${(1 - landP) * 10}px)` : undefined,
                  transform: `rotate(${liveRot}deg) scale(${1 + liveLift * 0.04})`,
                  boxShadow: `0 ${10 + liveLift * 20}px ${28 + liveLift * 30}px rgba(13,18,36,${0.12 + liveLift * 0.03})`,
                  zIndex: 2,
                }}
              />
            ) : (
              <div
                style={{
                  position: "absolute",
                  left: pdf.x - morphW / 2,
                  top: pdf.y - morphH / 2,
                  width: morphW,
                  height: morphH,
                  borderRadius: morphRadius,
                  background: `radial-gradient(circle at 38% 32%, #E9ECF1 0%, #9AA1AE ${40 + 20 * shape}%, #5B6170 100%)`,
                  border: "1.5px solid rgba(13,18,36,0.14)",
                  boxShadow: "0 10px 28px rgba(13,18,36,0.12)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "#FFFFFF",
                    borderRadius: morphRadius,
                    opacity: 1 - shape,
                  }}
                />
                <ClaimCard
                  variant={3}
                  style={{
                    left: -1.5,
                    top: -1.5,
                    opacity: textFade,
                    border: "none",
                    boxShadow: "none",
                    background: "transparent",
                    transform: `scale(${1 - shape * 0.4})`,
                  }}
                  textOpacity={textFade}
                />
              </div>
            )}
          </div>
        ) : null}

        {/* Connectors from the orb to the stamps, and a line that ends at an empty slot */}
        {STAMP_POS.map((s, i) => {
          const at = i === 0 ? ev("stamp_sent") : ev("stamp_paid");
          return (
            <Connector
              key={i}
              x1={ORB_POS.x + orbR * 0.9}
              y1={ORB_POS.y + (s.y - ORB_POS.y) * 0.25}
              x2={s.x - 86}
              y2={s.y}
              draw={EASE(ramp(frame, at - sec(0.3), at))}
              opacity={1 - groupOut}
            />
          );
        })}
        <Connector
          x1={STAMP_POS[0].x + 92}
          y1={603}
          x2={SLOT.x - SLOT.d / 2 - 14}
          y2={603}
          draw={EASE(
            ramp(
              frame,
              ev("empty_slot") - sec(0.25),
              ev("empty_slot") + sec(0.35),
            ),
          )}
          opacity={(1 - slotOut) * 0.9}
        />
        <Stamp
          label={P.scene1Stamps[0]}
          at={ev("stamp_sent")}
          {...STAMP_POS[0]}
          out={groupOut}
        />
        <Stamp
          label={P.scene1Stamps[1]}
          at={ev("stamp_paid")}
          {...STAMP_POS[1]}
          out={groupOut}
        />
        {frame >= ev("empty_slot") ? (
          <EmptySlot appear={slotIn * (1 - slotOut)} spin={(frame / fps) * 6} />
        ) : null}

        {/* The lone orb. Colourless here; colour returns in Scene 2. */}
        {orbIn > 0 ? (
          <div
            data-guard="box"
            style={{
              position: "absolute",
              left: orbX - orbR,
              top: orbY - orbR,
              width: orbR * 2,
              height: orbR * 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: orbIn,
              transform: `scale(${0.92 + 0.08 * orbIn})`,
            }}
          >
            <AgentOrb
              size={ORB_SIZE}
              saturation={0.12}
              style={{ position: "absolute" }}
            />
          </div>
        ) : null}

        {/* Chips, one at a time */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: CHIP_TOP,
            display: "flex",
            justifyContent: "center",
            gap: 24,
          }}
        >
          {CHIPS.map((c, i) => (
            <BlurText
              key={c}
              inFrame={ev(CHIP_EVENTS[i])}
              outFrame={sec(CHIPS_OUT)}
              guardLabel={`Chip: ${c}`}
              style={{
                padding: "14px 28px",
                borderRadius: 999,
                background: "#FFFFFF",
                border: "1.5px solid rgba(13,18,36,0.12)",
                boxShadow: "0 8px 24px rgba(13,18,36,0.06)",
                fontFamily: FONT.sans,
                fontWeight: 600,
                fontSize: 30,
                color: COLOR.ink,
                whiteSpace: "nowrap",
              }}
            >
              {c}
            </BlurText>
          ))}
        </div>

        {/* Closing lines */}
        {[
          { t: LINE_A, at: ev("line_no_record"), top: LINE_A_TOP },
          { t: LINE_B, at: ev("line_no_one"), top: LINE_B_TOP },
        ].map((l) => (
          <div
            key={l.t}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: l.top - 12 * ramp(frame, l.at, sec(LINES_OUT)),
              display: "flex",
              justifyContent: "center",
            }}
          >
            <BlurText
              inFrame={l.at}
              outFrame={sec(LINES_OUT)}
              outSeconds={0.45}
              guardLabel={`Line: ${l.t}`}
              style={{
                fontFamily: FONT.sans,
                fontWeight: 700,
                fontSize: 52,
                letterSpacing: "-0.02em",
                color: COLOR.ink,
                whiteSpace: "nowrap",
              }}
            >
              {l.t}
            </BlurText>
          </div>
        ))}
      </AbsoluteFill>
      {/* Headlines sit outside the camera so they never drift into the margin */}
      <TextBeat text={H1} startFrame={ev("headline_work_moves")} seed="s1-h1" />
      <TextBeat text={H2} startFrame={ev("headline_who_checks")} seed="s1-h2" />
      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};

export const SCENE01_FRAMES = f(15);
