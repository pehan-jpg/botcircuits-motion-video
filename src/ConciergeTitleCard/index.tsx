import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { EndMark, INK } from "../constants";
import { lerp, tween } from "../anim";
import { MONO, SANS, useFontsReady } from "../fonts";
import { Backdrop, CREAM } from "../components/Backdrop";
import { Orb, OrbSurface, orbShadow } from "../components/Orb";
import { Typewriter, TYPE_RULES } from "../components/Typewriter";
import { MintCheck, PetalSpinner } from "../components/ChipIcons";
import { BrandAssets, BrandSymbol, useBrandAssets } from "../components/BrandMarks";
import { SafeAreaGuard } from "../components/SafeAreaGuard";
import { ReadabilityGuard } from "../components/ReadabilityGuard";
import {
  AVATAR_GAP,
  BUBBLE,
  CARD,
  CHIP,
  CHIP_FONT,
  CUSTOMER_AVATAR,
  CX,
  CY,
  HEADER,
  INDICATOR,
  ITEM_GAP,
  Layout,
  MSG_FONT,
  STAMP,
  THREAD_PAD,
  computeLayout,
} from "./layout";
import { BEATS, ChipBeat, DURATION, MESSAGES, MessageBeat, T } from "./timeline";

export type ConciergeTitleCardProps = {
  /** When true, the thread fades in the last 0.4s, returning to the empty card. */
  loop: boolean;
  /** "symbol": the last 0.8s morphs the card into the BotCircuits symbol. */
  endMark: EndMark;
  /** Development guards; fail the render on layout or readability violations. */
  guards: boolean;
};

const ROOT_ID = "concierge-title-card";
const CARD_SHADOW = "0 30px 80px rgba(40,36,80,0.14), 0 3px 10px rgba(40,36,80,0.06)";
const CUSTOMER_BG = "#EEE9FB";
const AGENT_BG = "#F1F2F6";
const CHIP_BG = "#F1F2F6";
const CHIP_DONE_BG = "#E3F6EC";
const CHIP_DONE_EDGE = "#BCE6CF";
const ONLINE = "#23A06B";
const ONLINE_TEXT = "#1D7A52";
const MUTED = "#646A80";
const DOT = "#8E93A6";
const SYMBOL_SIZE = 120;

/** A pop that grows from 0.96 to 1 with a fade. Never overshoots. */
const pop = (frame: number, range: [number, number]) => {
  const p = tween(frame, range);
  return { opacity: p, scale: 0.96 + 0.04 * p };
};

export const ConciergeTitleCard: React.FC<ConciergeTitleCardProps> = (props) => {
  const fontsReady = useFontsReady();
  const brand = useBrandAssets();
  if (!fontsReady || !brand) return <AbsoluteFill style={{ background: CREAM }} />;
  return <Scene {...props} brand={brand} />;
};

const Scene: React.FC<ConciergeTitleCardProps & { brand: BrandAssets }> = ({
  loop,
  endMark,
  guards,
  brand,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useMemo(() => computeLayout(), []);

  // Card entrance. In LOOP mode the empty card is already there at frame 0.
  const cardIn = loop ? { opacity: 1, scale: 1 } : pop(frame, T.cardIn);
  const threadOpacity = loop ? 1 - tween(frame, T.loopOut) : 1;

  // Optional end mark: card collapses into the orb, which becomes the symbol.
  const em = endMark === "symbol" ? T.endMark : DURATION * 10; // never reached when "none"
  const c = tween(frame, [em, em + 8]);
  const contentOut = tween(frame, [em, em + 5]);
  const orbFill = tween(frame, [em + 2, em + 8]);
  const inkTint = tween(frame, [em + 7, em + 11]);
  const symbolIn = tween(frame, [em + 8, em + 12]);
  const collapsed = frame >= em + 8;
  const cardW = lerp(CARD.w, SYMBOL_SIZE, c);
  const cardH = lerp(CARD.h, SYMBOL_SIZE, c);
  const cardR = lerp(CARD.radius, SYMBOL_SIZE / 2, c);
  const contentScale = Math.min(cardW / CARD.w, cardH / CARD.h);

  return (
    <AbsoluteFill id={ROOT_ID} style={{ fontFamily: SANS }}>
      <Backdrop frame={frame} duration={DURATION} />

      {!collapsed ? (
        <div
          data-guard="chat-card"
          style={{
            position: "absolute",
            left: CX - cardW / 2,
            top: CY - cardH / 2,
            width: cardW,
            height: cardH,
            borderRadius: cardR,
            background: "#FFFFFF",
            boxShadow: c > 0 ? orbShadow(SYMBOL_SIZE) : CARD_SHADOW,
            opacity: cardIn.opacity,
            transform: `scale(${cardIn.scale})`,
          }}
        >
          {orbFill > 0 ? (
            <div style={{ position: "absolute", inset: 0, opacity: orbFill }}>
              <OrbSurface radius={cardR} />
            </div>
          ) : null}
          <div
            style={{
              position: "absolute",
              left: (cardW - CARD.w) / 2,
              top: (cardH - CARD.h) / 2,
              width: CARD.w,
              height: CARD.h,
              opacity: 1 - contentOut,
              transform: `scale(${contentScale})`,
            }}
          >
            <Header frame={frame} />
            <Thread L={L} frame={frame} fps={fps} opacity={threadOpacity} />
          </div>
        </div>
      ) : null}

      {endMark === "symbol" && collapsed ? (
        <>
          {symbolIn < 1 ? (
            <div style={{ position: "absolute", left: CX - SYMBOL_SIZE / 2, top: CY - SYMBOL_SIZE / 2, opacity: 1 - symbolIn }}>
              <Orb size={SYMBOL_SIZE} />
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: INK, opacity: inkTint }} />
            </div>
          ) : null}
          <div
            data-guard="symbol"
            style={{
              position: "absolute",
              left: CX - SYMBOL_SIZE / 2,
              top: CY - SYMBOL_SIZE / 2,
              opacity: symbolIn * (loop ? 1 - tween(frame, T.loopOut) : 1),
              transform: `scale(${lerp(0.96, 1, symbolIn)})`,
            }}
          >
            <BrandSymbol size={SYMBOL_SIZE} present={brand.hasSymbol} />
          </div>
        </>
      ) : null}

      {/* LOOP with the end mark: the empty card returns over the symbol. */}
      {loop && endMark === "symbol" && frame >= T.loopOut[0] ? (
        <div
          style={{
            position: "absolute",
            left: CX - CARD.w / 2,
            top: CY - CARD.h / 2,
            width: CARD.w,
            height: CARD.h,
            borderRadius: CARD.radius,
            background: "#FFFFFF",
            boxShadow: CARD_SHADOW,
            opacity: tween(frame, T.loopOut),
          }}
        >
          <Header frame={frame} />
        </div>
      ) : null}

      <SafeAreaGuard enabled={guards} frame={frame} rootId={ROOT_ID} />
      <ReadabilityGuard
        enabled={guards}
        frame={frame}
        rootId={ROOT_ID}
        messages={MESSAGES.map((m) => {
          const ml = L.messages.get(m.id)!;
          return {
            id: m.id,
            typeStart: Math.floor(m.typeStart),
            width: ml.w,
            oneLineHeight: ml.oneLineH,
            lineHeight: MSG_FONT.lineHeight,
            schedule: m.schedule,
          };
        })}
      />
    </AbsoluteFill>
  );
};

const Header: React.FC<{ frame: number }> = ({ frame }) => {
  const open = tween(frame, T.openHalo, [0, 1], (t) => t);
  const close = tween(frame, T.closeHalo, [0, 1], (t) => t);
  const halo = frame < T.closeHalo[0] ? open : close;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: CARD.padX,
          top: CARD.padTop,
          height: HEADER.height,
          display: "flex",
          alignItems: "center",
          gap: HEADER.gap,
        }}
      >
        <div style={{ width: HEADER.orb, height: HEADER.orb, flex: "none" }}>
          <Orb size={HEADER.orb} haloPulse={halo} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ fontSize: HEADER.nameSize, fontWeight: 600, lineHeight: "36px", color: INK }}>
            Card Services Agent
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: ONLINE }} />
            <div style={{ fontSize: HEADER.statusSize, fontWeight: 500, lineHeight: "26px", color: ONLINE_TEXT }}>
              Online
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: CARD.padX,
          right: CARD.padX,
          top: CARD.padTop + HEADER.height + 20,
          height: 1,
          background: "#ECEDF2",
        }}
      />
    </>
  );
};

const easedSteps = (frame: number, steps: { at: number; delta: number }[], dur: number) =>
  steps.reduce((acc, s) => acc + s.delta * tween(frame, [s.at, s.at + dur]), 0);

const messageHeight = (L: Layout, m: MessageBeat, frame: number) => {
  const ml = L.messages.get(m.id)!;
  const grow = ml.growAt.reduce(
    (acc, at) => acc + MSG_FONT.lineHeight * tween(frame, [at, at + TYPE_RULES.lineGrow * 60]),
    0,
  );
  return { bubble: ml.oneLineH + grow, item: ml.oneLineH + grow + L.stampRow };
};

const chipHeight = (b: ChipBeat, frame: number) => lerp(INDICATOR.h, CHIP.h, tween(frame, b.expand));

const Thread: React.FC<{ L: Layout; frame: number; fps: number; opacity: number }> = ({
  L,
  frame,
  fps,
  opacity,
}) => {
  const scroll = easedSteps(frame, L.scrollSteps, T.scroll);
  let y = THREAD_PAD.top;
  const items: React.ReactNode[] = [];
  for (const beat of BEATS) {
    const start = beat.kind === "message" ? beat.pop[0] : beat.indicator[0];
    if (frame < start) break;
    if (beat.kind === "message") {
      const h = messageHeight(L, beat, frame);
      items.push(<MessageItem key={beat.id} L={L} beat={beat} frame={frame} fps={fps} y={y} bubbleH={h.bubble} />);
      y += h.item + ITEM_GAP;
    } else {
      items.push(<ChipItem key={beat.id} L={L} beat={beat} frame={frame} fps={fps} y={y} />);
      y += chipHeight(beat, frame) + ITEM_GAP;
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        left: CARD.padX,
        top: L.threadTop,
        width: L.threadW,
        height: L.viewportH,
        // The thread viewport clips scrolled out rows; message text itself is never clipped.
        overflow: "hidden",
        opacity,
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, width: L.threadW, transform: `translateY(${-scroll}px)` }}>
        {items}
      </div>
    </div>
  );
};

const MessageItem: React.FC<{
  L: Layout;
  beat: MessageBeat;
  frame: number;
  fps: number;
  y: number;
  bubbleH: number;
}> = ({ L, beat, frame, fps, y, bubbleH }) => {
  const ml = L.messages.get(beat.id)!;
  const p = pop(frame, beat.pop);
  const customer = beat.side === "customer";
  const stamp = tween(frame, [beat.done + 3, beat.done + 3 + T.stampFade]);
  const bubbleRight = customer ? CUSTOMER_AVATAR + AVATAR_GAP : undefined;
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 0,
        width: L.threadW,
        opacity: p.opacity,
        transform: `scale(${p.scale})`,
        transformOrigin: customer ? "100% 0%" : "0% 0%",
      }}
    >
      <div
        data-bubble={beat.id}
        style={{
          position: "absolute",
          top: 0,
          ...(customer ? { right: bubbleRight } : { left: 0 }),
          width: ml.w,
          height: bubbleH,
          boxSizing: "border-box",
          padding: `${BUBBLE.padY}px ${BUBBLE.padX}px`,
          background: customer ? CUSTOMER_BG : AGENT_BG,
          borderRadius: BUBBLE.radius,
          ...(customer ? { borderBottomRightRadius: BUBBLE.tail } : { borderBottomLeftRadius: BUBBLE.tail }),
        }}
      >
        <Typewriter
          lines={ml.lines}
          time={(frame - beat.typeStart) / fps}
          schedule={beat.schedule}
          fontFamily={SANS}
          fontSize={MSG_FONT.size}
          fontWeight={MSG_FONT.weight}
          lineHeight={MSG_FONT.lineHeight}
          caretLeadIn={(beat.typeStart - beat.pop[0]) / fps}
          charGuard={beat.id}
        />
      </div>
      {customer ? (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: bubbleH - CUSTOMER_AVATAR,
            width: CUSTOMER_AVATAR,
            height: CUSTOMER_AVATAR,
            borderRadius: "50%",
            background: "linear-gradient(140deg, #D8CEF7 0%, #F6D3C2 100%)",
            boxShadow: "inset 0 0 0 1px rgba(13,18,36,0.06)",
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          top: bubbleH + STAMP.gap,
          ...(customer ? { right: bubbleRight! + 6 } : { left: 6 }),
          fontFamily: MONO,
          fontSize: STAMP.size,
          fontWeight: 500,
          lineHeight: `${STAMP.lineHeight}px`,
          color: MUTED,
          opacity: stamp,
        }}
      >
        {beat.stamp}
      </div>
    </div>
  );
};

const ChipItem: React.FC<{ L: Layout; beat: ChipBeat; frame: number; fps: number; y: number }> = ({
  L,
  beat,
  frame,
  fps,
  y,
}) => {
  const cl = L.chips.get(beat.id)!;
  const p = pop(frame, [beat.indicator[0], beat.indicator[0] + 9]);
  const ex = tween(frame, beat.expand);
  const w = lerp(INDICATOR.w, cl.w, ex);
  const h = lerp(INDICATOR.h, CHIP.h, ex);
  const dots = 1 - tween(frame, [beat.expand[0], beat.expand[0] + 6]);
  const labelIn = tween(frame, beat.labelIn);
  const swap = tween(frame, beat.swap);
  const check = tween(frame, beat.check);
  const t = frame / fps;
  return (
    <div
      data-chip={beat.id}
      style={{
        position: "absolute",
        left: 0,
        top: y,
        width: w,
        height: h,
        borderRadius: h / 2,
        background: mix(CHIP_BG, CHIP_DONE_BG, swap),
        boxShadow: `inset 0 0 0 1px ${swap > 0 ? edge(swap) : "rgba(13,18,36,0.05)"}`,
        opacity: p.opacity,
        transform: `scale(${p.scale})`,
        transformOrigin: "0% 50%",
      }}
    >
      {dots > 0 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            opacity: dots,
          }}
        >
          {[0, 1, 2].map((i) => {
            const k = 0.5 + 0.5 * Math.sin(2 * Math.PI * 1.6 * (t - beat.indicator[0] / fps) - i * 0.9);
            return (
              <div
                key={i}
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: DOT,
                  opacity: 0.35 + 0.65 * k,
                  transform: `translateY(${-2 * k}px)`,
                }}
              />
            );
          })}
        </div>
      ) : null}
      {labelIn > 0 ? (
        <div
          style={{
            position: "absolute",
            left: CHIP.padL,
            top: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            gap: CHIP.gap,
            opacity: labelIn,
          }}
        >
          <div style={{ position: "relative", width: CHIP.icon, height: CHIP.icon }}>
            <div style={{ position: "absolute", inset: 0, opacity: 1 - swap, transform: `scale(${lerp(1, 0.9, swap)})` }}>
              <PetalSpinner size={CHIP.icon} time={t} />
            </div>
            <div style={{ position: "absolute", inset: 0, opacity: swap, transform: `scale(${lerp(0.9, 1, swap)})` }}>
              <MintCheck size={CHIP.icon} draw={check} />
            </div>
          </div>
          <div
            style={{
              position: "relative",
              width: cl.labelW,
              height: CHIP_FONT.lineHeight,
              fontSize: CHIP_FONT.size,
              fontWeight: CHIP_FONT.weight,
              lineHeight: `${CHIP_FONT.lineHeight}px`,
              whiteSpace: "pre",
            }}
          >
            <div data-chip-label style={{ position: "absolute", left: 0, top: 0, color: INK, opacity: 1 - swap, transform: `translateY(${-12 * swap}px)` }}>
              {beat.busy}
            </div>
            <div data-chip-label style={{ position: "absolute", left: 0, top: 0, color: INK, opacity: swap, transform: `translateY(${12 * (1 - swap)}px)` }}>
              {beat.doneLabel}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(",")})`;
};
const edge = (t: number) => {
  const [r, g, b] = hex(CHIP_DONE_EDGE);
  return `rgba(${r},${g},${b},${lerp(0.3, 1, t)})`;
};

