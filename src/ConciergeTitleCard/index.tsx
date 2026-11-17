import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { INK, MAX_OVERSHOOT } from "../constants";
import { lerp, tween } from "../anim";
import { SANS, useFontsReady } from "../fonts";
import { Backdrop, CREAM } from "../components/Backdrop";
import { Orb, OrbSurface, orbShadow } from "../components/Orb";
import { Typewriter } from "../components/Typewriter";
import { LimeUnderline } from "../components/LimeUnderline";
import { MintCheck, PetalSpinner } from "../components/ChipIcons";
import { BrandSymbol, BrandWordmark, useBrandAssets, BrandAssets } from "../components/BrandMarks";
import { SafeAreaGuard } from "../components/SafeAreaGuard";
import { computeLayout, CX, CY, Layout } from "./layout";
import {
  CHIP_BUSY,
  CHIP_DONE,
  CUSTOMER_TEXT,
  DURATION,
  T,
  TITLE_TEXT,
  chatSchedule,
  titleSchedule,
} from "./timeline";

export type ConciergeTitleCardProps = {
  /** When true, the title fades in the last 0.4s and the empty chat card returns. */
  loop: boolean;
  /** Development guard; fails the render on layout violations. */
  guards: boolean;
};

const ROOT_ID = "concierge-title-card";
const GREY_LINE = "#E4E5EC";
const BUBBLE_BG = "#EEE9FB";
const CHIP_BG = "#F2F2F7";
const CHIP_DONE_BG = "#E3F6EC";
const CHIP_DONE_EDGE = "#BCE6CF";
const CHIP_TEXT = INK;
const DOT = "#8E93A6";

/** A pop that grows from 0.96 to 1 with a fade. Never overshoots. */
const pop = (frame: number, range: [number, number]) => {
  const p = tween(frame, range);
  return { opacity: p, scale: 0.96 + 0.04 * p };
};

export const ConciergeTitleCard: React.FC<ConciergeTitleCardProps> = (props) => {
  const fontsReady = useFontsReady();
  const brand = useBrandAssets();
  if (!fontsReady || !brand) {
    return <AbsoluteFill style={{ background: CREAM }} />;
  }
  return <Scene {...props} brand={brand} />;
};

const Scene: React.FC<ConciergeTitleCardProps & { brand: BrandAssets }> = ({
  loop,
  guards,
  brand,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useMemo(() => computeLayout(brand.wordmarkAspect), [brand.wordmarkAspect]);

  // Card visibility: in LOOP mode the empty card is already present at frame 0
  // and returns during the last 0.4s, so the last frame meets the first.
  const cardPop = loop ? { opacity: 1, scale: 1 } : pop(frame, T.cardIn);
  const loopBack = loop ? pop(frame, T.loopOut) : { opacity: 0, scale: 0.96 };
  const loopFadeTitle = loop ? 1 - tween(frame, T.loopOut) : 1;

  // Collapse of the card into the hero orb.
  const c = tween(frame, T.collapse);
  const cardW = lerp(L.card.w, L.heroOrb, c);
  const cardH = lerp(L.card.h, L.heroOrb, c);
  const cardR = lerp(L.card.radius, L.heroOrb / 2, c);
  const contentOpacity = 1 - tween(frame, T.contentOut);
  const contentScale = Math.min(cardW / L.card.w, cardH / L.card.h);
  const orbFill = tween(frame, T.orbFill);
  const collapsed = frame >= T.collapse[1];

  // Orb pulse then move into the symbol slot.
  const pulseP = tween(frame, T.pulse, [0, 1], (t) => t);
  const pulseScale = 1 + MAX_OVERSHOOT * Math.sin(Math.PI * pulseP);
  const m = tween(frame, T.toSymbol);
  const orbSize = lerp(L.heroOrb, L.symbol.size, m);
  const orbCx = lerp(CX, L.symbol.cx, m);
  const inkTint = tween(frame, T.inkTint);
  const symbolIn = tween(frame, T.symbolIn);
  const orbVisible = collapsed && symbolIn < 1;

  const chatTime = (frame - T.chatTypeStart) / fps;
  const titleTime = (frame - T.titleStart) / fps;

  const wm = tween(frame, T.wordmarkIn);

  return (
    <AbsoluteFill id={ROOT_ID} style={{ fontFamily: SANS }}>
      <Backdrop frame={frame} duration={DURATION} />

      {/* Chat card (also the start of the shared element morph). */}
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
            boxShadow: c > 0
              ? `0 ${lerp(24, 14, c)}px ${lerp(60, 34, c)}px rgba(${Math.round(lerp(40, 11, c))},${Math.round(lerp(36, 59, c))},${Math.round(lerp(80, 44, c))},${lerp(0.14, 0.35, c)})`
              : "0 24px 60px rgba(40,36,80,0.14), 0 2px 6px rgba(40,36,80,0.06)",
            opacity: cardPop.opacity,
            transform: `scale(${cardPop.scale})`,
          }}
        >
          <div style={{ position: "absolute", inset: 0, opacity: orbFill }}>
            <OrbSurface radius={cardR} />
          </div>
          <div
            style={{
              position: "absolute",
              left: (cardW - L.card.w) / 2,
              top: (cardH - L.card.h) / 2,
              width: L.card.w,
              height: L.card.h,
              opacity: contentOpacity,
              transform: `scale(${contentScale})`,
            }}
          >
            <ChatContent L={L} frame={frame} chatTime={chatTime} fps={fps} />
          </div>
        </div>
      ) : null}

      {/* Hero orb: pulse, then shrink into the symbol slot and turn ink. */}
      {orbVisible ? (
        <div
          style={{
            position: "absolute",
            left: orbCx - orbSize / 2,
            top: CY - orbSize / 2,
            opacity: 1 - tween(frame, [T.symbolIn[0] + 2, T.symbolIn[1]]),
          }}
        >
          <Orb size={orbSize} scale={pulseScale} haloPulse={pulseP} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: INK,
              opacity: inkTint,
              transform: `scale(${pulseScale})`,
              boxShadow: inkTint > 0 ? orbShadow(orbSize * (1 - inkTint)) : undefined,
            }}
          />
        </div>
      ) : null}

      {/* Title lockup. Every piece sits at its final, pre-measured place. */}
      <div style={{ position: "absolute", inset: 0, opacity: loopFadeTitle }}>
        <div
          data-guard="symbol"
          style={{
            position: "absolute",
            left: L.symbol.cx - L.symbol.size / 2,
            top: L.symbol.cy - L.symbol.size / 2,
            opacity: symbolIn,
            transform: `scale(${lerp(0.96, 1, symbolIn)})`,
          }}
        >
          <BrandSymbol size={L.symbol.size} present={brand.hasSymbol} />
        </div>

        <div
          data-guard="title"
          data-title-box
          style={{
            position: "absolute",
            left: L.title.left,
            top: L.title.top,
            width: L.title.width,
            height: L.title.height,
          }}
        >
          <Typewriter
            text={TITLE_TEXT}
            time={titleTime}
            schedule={titleSchedule}
            fontFamily={SANS}
            fontSize={L.titleFont.size}
            fontWeight={L.titleFont.weight}
            lineHeight={L.titleFont.lineHeight}
            charGuard="title"
            style={{ letterSpacing: 0, textAlign: "left" }}
          />
        </div>

        <LimeUnderline
          frame={frame}
          startFrame={T.underlineStart}
          width={L.underline.width}
          style={{ left: L.underline.left, top: L.underline.top }}
        />

        <div
          data-guard="wordmark"
          style={{
            position: "absolute",
            left: L.wordmark.left,
            top: L.wordmark.top,
            opacity: wm,
            transform: `translate(${lerp(-14, 0, wm)}px, ${lerp(14, 0, wm)}px)`,
          }}
        >
          <BrandWordmark width={L.wordmark.w} height={L.wordmark.h} present={brand.hasWordmark} />
        </div>
      </div>

      {/* LOOP: the empty chat card returns in the last 0.4s. */}
      {loop && loopBack.opacity > 0 ? (
        <div
          style={{
            position: "absolute",
            left: CX - L.card.w / 2,
            top: CY - L.card.h / 2,
            width: L.card.w,
            height: L.card.h,
            borderRadius: L.card.radius,
            background: "#FFFFFF",
            boxShadow: "0 24px 60px rgba(40,36,80,0.14), 0 2px 6px rgba(40,36,80,0.06)",
            opacity: loopBack.opacity,
            transform: `scale(${loopBack.scale})`,
          }}
        >
          <ChatHeader L={L} />
        </div>
      ) : null}

      <SafeAreaGuard
        enabled={guards}
        frame={frame}
        rootId={ROOT_ID}
        title={{ startFrame: T.titleStart, box: L.title }}
      />
    </AbsoluteFill>
  );
};

const ChatHeader: React.FC<{ L: Layout }> = ({ L }) => (
  <>
    <div
      style={{
        position: "absolute",
        left: L.card.pad,
        top: L.card.pad,
        display: "flex",
        alignItems: "center",
        gap: L.header.gap,
      }}
    >
      <div style={{ width: L.header.avatar, height: L.header.avatar, borderRadius: "50%", background: INK }} />
      <div style={{ width: L.header.lineW, height: L.header.lineH, borderRadius: L.header.lineH / 2, background: GREY_LINE }} />
    </div>
    <div
      style={{
        position: "absolute",
        left: L.card.pad,
        right: L.card.pad,
        top: L.card.pad + L.header.avatar + L.divider.before,
        height: 1,
        background: "#EEEFF3",
      }}
    />
  </>
);

const ChatContent: React.FC<{ L: Layout; frame: number; chatTime: number; fps: number }> = ({
  L,
  frame,
  chatTime,
  fps,
}) => {
  const threadTop = L.card.pad + L.header.avatar + L.divider.before + 1 + L.divider.after;
  const customer = pop(frame, T.customerIn);
  const agent = pop(frame, T.agentIn);
  const agentRowTop = threadTop + L.bubble.h + L.rowGap;
  const agentRowH = Math.max(L.chip.h, L.agentAvatar);

  // Indicator to chip expansion.
  const ex = tween(frame, T.chipExpand);
  const chipW = lerp(L.indicator.w, L.chip.w, ex);
  const chipH = lerp(L.indicator.h, L.chip.h, ex);
  const dotsOpacity = 1 - tween(frame, [T.chipExpand[0], T.chipExpand[0] + 6]);
  const labelIn = tween(frame, T.chipLabelIn);
  const swap = tween(frame, T.chipSwap);
  const check = tween(frame, T.checkDraw);
  const done = swap;
  const t = frame / fps;

  return (
    <>
      <ChatHeader L={L} />

      {/* Customer row: bubble at its final width from its first frame. */}
      <div
        style={{
          position: "absolute",
          right: L.card.pad,
          top: threadTop,
          display: "flex",
          alignItems: "flex-end",
          gap: 12,
          opacity: customer.opacity,
          transform: `scale(${customer.scale})`,
          transformOrigin: "100% 100%",
        }}
      >
        <div
          data-guard="customer-bubble"
          style={{
            position: "relative",
            width: L.bubble.w,
            height: L.bubble.h,
            boxSizing: "border-box",
            padding: `${L.bubble.padY}px ${L.bubble.padX}px`,
            background: BUBBLE_BG,
            borderRadius: 22,
            borderBottomRightRadius: 8,
          }}
        >
          <Typewriter
            text={CUSTOMER_TEXT}
            time={chatTime}
            schedule={chatSchedule}
            fontFamily={SANS}
            fontSize={L.bubbleFont.size}
            fontWeight={L.bubbleFont.weight}
            lineHeight={L.bubbleFont.lineHeight}
            caretLeadIn={(T.chatTypeStart - T.customerIn[0]) / fps}
          />
        </div>
        <div
          style={{
            width: L.customerAvatar,
            height: L.customerAvatar,
            flex: "none",
            borderRadius: "50%",
            background: "linear-gradient(140deg, #D8CEF7 0%, #F6D3C2 100%)",
            boxShadow: "inset 0 0 0 1px rgba(13,18,36,0.06)",
          }}
        />
      </div>

      {/* Agent row: orb avatar, typing indicator that becomes an action chip. */}
      <div
        style={{
          position: "absolute",
          left: L.card.pad,
          top: agentRowTop,
          height: agentRowH,
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: agent.opacity,
          transform: `scale(${agent.scale})`,
          transformOrigin: "0% 50%",
        }}
      >
        <Orb size={L.agentAvatar} />
        <div
          data-guard="action-chip"
          style={{
            position: "relative",
            width: chipW,
            height: chipH,
            borderRadius: chipH / 2,
            background: done > 0 ? mix(CHIP_BG, CHIP_DONE_BG, done) : CHIP_BG,
            boxShadow: `inset 0 0 0 1px ${done > 0 ? mixAlpha(done) : "rgba(13,18,36,0.05)"}`,
          }}
        >
          {/* Typing indicator dots. */}
          {dotsOpacity > 0 ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: dotsOpacity,
              }}
            >
              {[0, 1, 2].map((i) => {
                const w = 0.5 + 0.5 * Math.sin(2 * Math.PI * 1.6 * (t - T.agentIn[0] / fps) - i * 0.9);
                return (
                  <div
                    key={i}
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background: DOT,
                      opacity: 0.35 + 0.65 * w,
                      transform: `translateY(${-2 * w}px)`,
                    }}
                  />
                );
              })}
            </div>
          ) : null}

          {/* Chip content. */}
          {labelIn > 0 ? (
            <div
              style={{
                position: "absolute",
                left: 20,
                top: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                gap: 12,
                opacity: labelIn,
              }}
            >
              <div style={{ position: "relative", width: L.chip.icon, height: L.chip.icon }}>
                <div style={{ position: "absolute", inset: 0, opacity: 1 - swap, transform: `scale(${lerp(1, 0.9, swap)})` }}>
                  <PetalSpinner size={L.chip.icon} time={t} />
                </div>
                <div style={{ position: "absolute", inset: 0, opacity: swap, transform: `scale(${lerp(0.9, 1, swap)})` }}>
                  <MintCheck size={L.chip.icon} draw={check} />
                </div>
              </div>
              <div
                style={{
                  position: "relative",
                  width: L.chip.labelW,
                  height: L.chipFont.lineHeight,
                  fontSize: L.chipFont.size,
                  fontWeight: L.chipFont.weight,
                  lineHeight: `${L.chipFont.lineHeight}px`,
                  color: CHIP_TEXT,
                  whiteSpace: "pre",
                }}
              >
                <div style={{ position: "absolute", left: 0, top: 0, opacity: 1 - swap, transform: `translateY(${-12 * swap}px)` }}>
                  {CHIP_BUSY}
                </div>
                <div style={{ position: "absolute", left: 0, top: 0, opacity: swap, transform: `translateY(${12 * (1 - swap)}px)` }}>
                  {CHIP_DONE}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(",")})`;
};
const mixAlpha = (t: number) => {
  const [r, g, b] = hex(CHIP_DONE_EDGE);
  return `rgba(${r},${g},${b},${lerp(0.3, 1, t)})`;
};
