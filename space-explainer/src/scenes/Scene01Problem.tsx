import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BLUR_IN, COLOR, EASE, EASE_SETTLE, FONT } from "../theme";
import { localF, local } from "../timeline";
import { PLACEHOLDERS as P } from "../placeholders";
import { TextBeat, textBeatTiming } from "../components/TextBeat";
import { BlurText } from "../components/BlurText";
import { AgentOrb, orbOuterRadius } from "../components/AgentOrb";
import { GuardLayer } from "../components/GuardLayer";
import type { TextBeatSpec } from "../lib/guards";
import { INTRO } from "./shared/intro";

const S = "S01" as const;
const ev = (n: Parameters<typeof localF>[0]) => localF(n, S);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], clamp);

// ---------- Layout ----------
// The document row and the orb group are authored in "group" coordinates,
// then scaled 1.25x about GROUP_ORIGIN and moved so they sit centred in the
// space below the headline.
const SCALE = 1.25;
const GROUP_ORIGIN = { x: 960, y: 545 };
const GROUP_DY = -45; // group centre lands at y 500 on screen
const toScreen = (p: { x: number; y: number }) => ({
  x: GROUP_ORIGIN.x + (p.x - GROUP_ORIGIN.x) * SCALE,
  y: GROUP_ORIGIN.y + (p.y - GROUP_ORIGIN.y) * SCALE + GROUP_DY,
});

const TILE = { w: 310, h: 250, top: 420, header: 56 };
const TILE_X = [450, 790, 1130, 1470];
const CARD = { w: 282, h: 120 };
const cardCentre = (i: number) => ({
  x: TILE_X[i],
  y: TILE.top + TILE.header + (TILE.h - TILE.header) / 2,
});
const ORB_GROUP_SIZE = 150; // in group units; 187.5px on screen
const ORB_SCREEN_SIZE = ORB_GROUP_SIZE * SCALE;
const ORB_POS = { x: 800, y: 545 };
const STAMP_POS = [
  { x: 1080, y: 487, rot: -7 },
  { x: 1080, y: 603, rot: 5 },
];
const SLOT = { x: 1370, y: 545, d: 168 };
// Screen coordinates
const CHIP_TOP = 714;
const LINE_A_TOP = 730;
const LINE_B_TOP = 808;

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
}) => (
  <div
    data-guard="box"
    style={{
      position: "absolute",
      left: TILE_X[i] - TILE.w / 2,
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
        padding: "0 18px",
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
        style={{ opacity: version }}
      >
        {P.scene1Versions[i]}
      </span>
    </div>
    {i === 1 ? (
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
            stroke="rgba(13,18,36,0.06)"
            strokeWidth={2}
          />
        ))}
        {[103, 206].map((c) => (
          <line
            key={c}
            x1={c}
            x2={c}
            y1={0}
            y2={TILE.h}
            stroke="rgba(13,18,36,0.06)"
            strokeWidth={2}
          />
        ))}
      </svg>
    ) : null}
  </div>
);

const ClaimCard: React.FC<{
  variant: Variant;
  style?: React.CSSProperties;
  textOpacity?: number;
}> = ({ variant, style, textOpacity = 1 }) => {
  const variants: React.CSSProperties[] = [
    { borderLeft: "6px solid rgba(13,18,36,0.35)" },
    { borderRadius: 4, background: "#F7F8FA" },
    { borderRadius: "22px 22px 22px 6px" },
    { borderRadius: "6px 22px 6px 6px" },
  ];
  return (
    <div
      style={{
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
        ...variants[variant],
        ...style,
      }}
    >
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
  const y = y0 + Math.sin((frame / fps / 3.3) * Math.PI * 2 + rot) * 4;
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
          padding: "4px 20px",
          fontFamily: FONT.mono,
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: COLOR.ink,
          background: "rgba(255,255,255,0.92)",
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
  id: string;
}> = ({ x1, y1, x2, y2, draw, opacity, id }) => {
  const len = Math.hypot(x2 - x1, y2 - y1);
  return (
    <svg
      width={1920}
      height={1080}
      style={{ position: "absolute", inset: 0, overflow: "visible", opacity }}
    >
      <defs>
        <mask id={`m-${id}`}>
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
        mask={`url(#m-${id})`}
      />
    </svg>
  );
};

// ---------- Scene ----------
export const Scene01Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);
  const tSec = frame / fps;

  // Camera: slow drift in, released during the final orb move so the last frame is at scale 1.
  const toCentre = EASE(
    ramp(frame, ev("orb_to_centre"), ev("orb_to_centre") + sec(1.6)),
  );
  const cam =
    1 + 0.03 * EASE(ramp(frame, 0, ev("orb_to_centre"))) * (1 - toCentre);

  // Tiles appear, dim to a ghost layer that drifts slowly, then fade out.
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
  const ghostDrift =
    14 * ramp(frame, ev("card_to_orb"), ev("strays_fade") + sec(1));

  // Hops: the card lives in tile 0, then moves 0 to 1 to 2 to 3.
  const hops = [ev("hop_sheet"), ev("hop_chat"), ev("hop_pdf")];
  const HOP = sec(0.62);
  const land = ev("claim_lands");
  const landP = EASE(ramp(frame, land, land + sec(0.6)));
  let live = cardCentre(0);
  let liveVariant: Variant = 0;
  let liveLift = 0;
  hops.forEach((h, k) => {
    if (frame >= h) {
      const p = EASE(ramp(frame, h, h + HOP));
      const a = cardCentre(k);
      const b = cardCentre(k + 1);
      live = {
        x: a.x + (b.x - a.x) * p,
        y: a.y + (b.y - a.y) * p - Math.sin(Math.PI * p) * 28,
      };
      liveVariant = (p > 0.5 ? k + 1 : k) as Variant;
      liveLift = Math.sin(Math.PI * p);
    }
  });
  const versionShown = (i: number) =>
    i === 0
      ? landP
      : EASE(ramp(frame, hops[i - 1] + HOP * 0.7, hops[i - 1] + HOP));

  // Card to orb morph in the PDF tile, then the orb glides to its spot.
  const m0 = ev("card_to_orb");
  const textFade = 1 - EASE(ramp(frame, m0, m0 + sec(0.25)));
  const shape = EASE(ramp(frame, m0 + sec(0.1), m0 + sec(0.75)));
  const orbIn = EASE(ramp(frame, m0 + sec(0.55), m0 + sec(0.9)));
  const glide = EASE(ramp(frame, m0 + sec(0.95), m0 + sec(1.95)));
  const pdf = toScreen(cardCentre(3));
  const rest = toScreen(ORB_POS);
  const gx = pdf.x + (rest.x - pdf.x) * glide;
  const gy = pdf.y + (rest.y - pdf.y) * glide - Math.sin(Math.PI * glide) * 60;
  const float = glide * (1 - toCentre);
  const end = INTRO.handoffOrb;
  const orbX =
    gx +
    (end.x - gx) * toCentre +
    Math.sin((tSec / 4.1) * Math.PI * 2) * 8 * float;
  const orbY =
    gy +
    (end.y - gy) * toCentre +
    Math.cos((tSec / 2.9) * Math.PI * 2) * 10 * float;
  const orbR = orbOuterRadius(ORB_SCREEN_SIZE);

  // Stamps, slot and connectors.
  const groupOut = EASE(ramp(frame, sec(12.9), sec(13.5)));
  const slotIn = EASE(
    ramp(frame, ev("empty_slot"), ev("empty_slot") + sec(0.7)),
  );
  const slotOut = EASE(
    ramp(frame, ev("strays_fade") + sec(0.2), ev("strays_fade") + sec(1.0)),
  );
  const orbGroupR = orbOuterRadius(ORB_GROUP_SIZE);

  const morphW = CARD.w + (ORB_GROUP_SIZE - CARD.w) * shape;
  const morphH = CARD.h + (ORB_GROUP_SIZE - CARD.h) * shape;
  const morphRadius = 14 + (ORB_GROUP_SIZE / 2 - 14) * shape;

  return (
    <AbsoluteFill
      style={{ width: 1920, height: 1080, background: COLOR.problemGrey }}
    >
      <AbsoluteFill
        style={{ transform: `scale(${cam})`, transformOrigin: "960px 540px" }}
      >
        {/* Document row and orb group, scaled 1.25x */}
        <AbsoluteFill
          style={{
            transform: `translateY(${GROUP_DY}px) scale(${SCALE})`,
            transformOrigin: `${GROUP_ORIGIN.x}px ${GROUP_ORIGIN.y}px`,
          }}
        >
          <AbsoluteFill
            style={{
              opacity: layerOpacity,
              filter: layerBlur > 0.05 ? `blur(${layerBlur}px)` : undefined,
              transform: `translateY(${ghostDrift}px)`,
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
            <div style={{ opacity: frame < m0 ? 1 : 1 - orbIn }}>
              {frame < m0 ? (
                <ClaimCard
                  variant={liveVariant}
                  style={{
                    left: live.x - CARD.w / 2,
                    top: live.y - CARD.h / 2 - (1 - landP) * 90,
                    opacity: landP,
                    filter:
                      landP < 1 ? `blur(${(1 - landP) * 10}px)` : undefined,
                    transform: `rotate(${liveLift * 3}deg) scale(${1 + liveLift * 0.04})`,
                    boxShadow: `0 ${10 + liveLift * 20}px ${28 + liveLift * 30}px rgba(13,18,36,${0.12 + liveLift * 0.03})`,
                    zIndex: 2,
                  }}
                />
              ) : (
                <div
                  style={{
                    position: "absolute",
                    left: cardCentre(3).x - morphW / 2,
                    top: cardCentre(3).y - morphH / 2,
                    width: morphW,
                    height: morphH,
                    borderRadius: morphRadius,
                    // The card takes on the Space orb's own colours as it becomes the orb.
                    background: `radial-gradient(circle at 38% 32%, ${COLOR.orbLight} 0%, ${COLOR.orbMid} 52%, ${COLOR.orbDeep} 100%)`,
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
                      left: 0,
                      top: 0,
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

          {/* Connectors from the orb to the stamps, and one that ends at an empty slot */}
          {STAMP_POS.map((s, i) => {
            const at = i === 0 ? ev("stamp_sent") : ev("stamp_paid");
            return (
              <Connector
                key={i}
                id={`c${i}`}
                x1={ORB_POS.x + orbGroupR * 0.9}
                y1={ORB_POS.y + (s.y - ORB_POS.y) * 0.25}
                x2={s.x - 78}
                y2={s.y}
                draw={EASE(ramp(frame, at - sec(0.3), at))}
                opacity={1 - groupOut}
              />
            );
          })}
          <Connector
            id="slot"
            x1={STAMP_POS[0].x + 84}
            y1={SLOT.y}
            x2={SLOT.x - SLOT.d / 2 - 12}
            y2={SLOT.y}
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
            <EmptySlot
              appear={slotIn * (1 - slotOut)}
              spin={(frame / fps) * 14}
            />
          ) : null}
        </AbsoluteFill>

        {/* The Space orb, in screen coordinates so its final size and place match Scene 2 exactly */}
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
            <AgentOrb size={ORB_SCREEN_SIZE} style={{ position: "absolute" }} />
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

        {/* Closing lines, rising slowly while they hold */}
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
