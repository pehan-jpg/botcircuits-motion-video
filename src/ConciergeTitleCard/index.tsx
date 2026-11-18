import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND_LIME, DURATION, EndMark, INK, PAGE_BG } from "../constants";
import { lerp, tween } from "../anim";
import { SANS, useFontsReady } from "../fonts";
import { Orb } from "../components/Orb";
import { Typewriter } from "../components/Typewriter";
import { BrandAssets, BrandSymbol, useBrandAssets, WhatsAppLogo } from "../components/BrandMarks";
import { MicIcon, SendIcon } from "../components/Glyphs";
import { StageMist } from "../components/StageMist";
import { SafeAreaGuard } from "../components/SafeAreaGuard";
import { ReadabilityGuard } from "../components/ReadabilityGuard";
import {
  AVATAR,
  AVATAR_GAP,
  BUBBLE,
  CHAT,
  CHAT_HEADER,
  CHIP,
  COMPOSER,
  Layout,
  MSG_FONT,
  PILL,
  RAIL,
  Rect,
  SLOT,
  STAGE,
  THREAD,
  computeLayout,
  slotRect,
} from "./layout";
import { BEATS, CHIPS, ChipRowBeat, ChipSpec, MESSAGES, MessageBeat, T } from "./timeline";
import { CHIP_BG, ChipFace, KeptChip, MINT_BG, MINT_EDGE, ReceiptFace, mix, pop } from "./parts";

export type ConciergeTitleCardProps = {
  /** Fade the stage contents in the last 0.4s, back to the empty chat and slots. */
  loop: boolean;
  /** "symbol": a final 0.8s collapse into the BotCircuits symbol (clip becomes 10.8s). */
  endMark: EndMark;
  /** Development guards; fail the render on layout or readability violations. */
  guards: boolean;
  /** Page colour behind the stage. */
  pageBg?: string;
};

const ROOT_ID = "concierge-title-card";
const SOFT_SHADOW = "0 18px 44px rgba(13,18,36,0.08), 0 2px 6px rgba(13,18,36,0.04)";
const STAGE_SHADOW = "0 24px 60px rgba(13,18,36,0.08)";
const CUSTOMER_BG = "#EEE9FB";
const AGENT_BG = "#F1F2F6";
const ONLINE = "#25B567";
const SEND_BG = "#1E8E5A";
const DOT = "#8E93A6";
const ARC = 36; // px: the slight upward arc of the chip flight
const SYMBOL_SIZE = 120;

export const ConciergeTitleCard: React.FC<ConciergeTitleCardProps> = (props) => {
  const fontsReady = useFontsReady();
  const brand = useBrandAssets();
  if (!fontsReady || !brand) return <AbsoluteFill style={{ background: props.pageBg ?? PAGE_BG }} />;
  return <Scene {...props} brand={brand} />;
};

const easedSteps = (frame: number, steps: { at: number; delta: number }[], dur: number) =>
  steps.reduce((acc, s) => acc + s.delta * tween(frame, [s.at, s.at + dur]), 0);

/** Current height of each thread item, and its top within the thread content. */
const threadGeometry = (L: Layout, frame: number) => {
  const tops = new Map<string, number>();
  const heights = new Map<string, number>();
  let y = THREAD.padTop;
  for (const beat of BEATS) {
    const start = beat.kind === "message" ? (beat.indicator ?? beat.enter)[0] : beat.indicator[0];
    if (frame < start) break;
    let h: number;
    if (beat.kind === "message") {
      const ml = L.messages.get(beat.id)!;
      const grow = ml.growAt.reduce((a, at) => a + MSG_FONT.lineHeight * tween(frame, [at, at + T.lineGrow * 60]), 0);
      h = beat.side === "agent" ? lerp(PILL.h, ml.oneLineH, tween(frame, beat.enter)) + grow : ml.oneLineH + grow;
    } else {
      h = lerp(PILL.h, L.rowHeights.get(beat.id)!, tween(frame, beat.expand));
    }
    tops.set(beat.id, y);
    heights.set(beat.id, h);
    y += h + THREAD.gap;
  }
  return { tops, heights, scroll: easedSteps(frame, L.scrollSteps, T.scroll) };
};

/** The chip's rectangle in composition pixels at a given frame (the flight's start). */
const chipRect = (L: Layout, spec: ChipSpec, frame: number): Rect => {
  const cl = L.chips.get(spec.id)!;
  const g = threadGeometry(L, frame);
  return {
    x: CHAT.x + THREAD.padX + AVATAR + AVATAR_GAP,
    y: CHAT.y + THREAD.top + g.tops.get(cl.row.id)! - g.scroll + cl.index * (CHIP.h + CHIP.stack),
    w: cl.w,
    h: CHIP.h,
  };
};

const Scene: React.FC<ConciergeTitleCardProps & { brand: BrandAssets }> = ({ loop, endMark, guards, pageBg, brand }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const L = useMemo(() => computeLayout(), []);
  const flightStart = useMemo(
    () => new Map(CHIPS.map((c) => [c.id, chipRect(L, c, c.lift[0])] as const)),
    [L],
  );

  // Entrance. In LOOP mode the empty chat and slots are already there at frame 0.
  const stageIn = loop ? { opacity: 1, scale: 1 } : pop(frame, T.stageIn, 0.98);
  const chatIn = loop ? { opacity: 1, scale: 1 } : pop(frame, T.chatIn, 0.98);
  const loopOut: [number, number] = [durationInFrames - 24, durationInFrames - 6];
  const contents = loop ? 1 - tween(frame, loopOut) : 1;

  // END_MARK "symbol": stage contents collapse into the symbol at the stage centre.
  const em = endMark === "symbol" ? T.endMark : ([DURATION * 10, DURATION * 10 + 12] as [number, number]);
  const collapse = tween(frame, em);
  const symbolIn = tween(frame, [em[0] + 6, em[1]]);

  const cx = STAGE.x + STAGE.w / 2;
  const cy = STAGE.y + STAGE.h / 2;
  const limeDraw = tween(frame, T.limeDraw);
  const limeOpacity = 1 - tween(frame, T.limeFade);
  const badgePulse = tween(frame, T.badgePulse, [0, 1], (t) => t);
  const halo = tween(frame, T.halo, [0, 1], (t) => t);

  return (
    <AbsoluteFill id={ROOT_ID} style={{ background: pageBg ?? PAGE_BG, fontFamily: SANS }}>
      {/* Stage: rounded, misty, soft shadow. */}
      <div
        data-guard="stage"
        style={{
          position: "absolute",
          left: STAGE.x,
          top: STAGE.y,
          width: STAGE.w,
          height: STAGE.h,
          borderRadius: STAGE.radius,
          boxShadow: STAGE_SHADOW,
          opacity: stageIn.opacity,
          transform: `scale(${stageIn.scale})`,
        }}
      >
        <div style={{ position: "absolute", inset: 0, borderRadius: STAGE.radius, overflow: "hidden" }}>
          <StageMist width={STAGE.w} height={STAGE.h} frame={frame} period={durationInFrames} />
        </div>
      </div>

      {/* Stage contents share the stage's entrance transform. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: stageIn.opacity * (1 - collapse),
          transform: `scale(${stageIn.scale * lerp(1, 0.06, collapse)})`,
          transformOrigin: `${cx}px ${cy}px`,
        }}
      >
        {/* Rail slots (dashed outlines). */}
        {[0, 1, 2].map((i) => {
          const r = slotRect(i);
          const appear = loop ? 1 : tween(frame, T.slotIn(i));
          const chip = CHIPS.find((c) => c.slot === i);
          const covered = chip ? tween(frame, [chip.lift[0] + 18, chip.lift[1]]) : 0;
          const visible = Math.max(appear * (1 - covered), loop ? tween(frame, loopOut) : 0);
          return (
            <div
              key={i}
              data-guard={`slot-${i}`}
              data-box={`slot:${i}::${i}`}
              style={{
                position: "absolute",
                left: r.x,
                top: r.y,
                width: r.w,
                height: r.h,
                boxSizing: "border-box",
                borderRadius: SLOT.radius,
                border: "1.5px dashed rgba(13,18,36,0.14)",
                opacity: visible,
                transform: `scale(${lerp(0.98, 1, appear)})`,
              }}
            />
          );
        })}

        <ChatWindow L={L} frame={frame} fps={fps} brand={brand} chatIn={chatIn} contents={contents} halo={halo} />

        {/* Lime line down the rail's left edge. */}
        {limeDraw > 0 && limeOpacity > 0 ? (
          <div
            style={{
              position: "absolute",
              left: RAIL.x + 2,
              top: slotRect(0).y,
              width: 3,
              height: (slotRect(2).y + SLOT.h - slotRect(0).y) * limeDraw,
              borderRadius: 1.5,
              background: BRAND_LIME,
              opacity: limeOpacity * contents,
            }}
          />
        ) : null}

        {/* Receipts: each starts as its chip and flies to its slot. */}
        {CHIPS.map((spec) =>
          frame >= spec.lift[0] ? (
            <Flier
              key={spec.id}
              spec={spec}
              from={flightStart.get(spec.id)!}
              L={L}
              frame={frame}
              fps={fps}
              badgePulse={badgePulse}
              opacity={contents}
            />
          ) : null,
        )}
      </div>

      {endMark === "symbol" && symbolIn > 0 ? (
        <div
          data-guard="symbol"
          style={{
            position: "absolute",
            left: cx - SYMBOL_SIZE / 2,
            top: cy - SYMBOL_SIZE / 2,
            opacity: symbolIn * (loop ? 1 - tween(frame, loopOut) : 1),
            transform: `scale(${lerp(0.96, 1, symbolIn)})`,
          }}
        >
          <BrandSymbol size={SYMBOL_SIZE} present={brand.hasSymbol} />
        </div>
      ) : null}

      <SafeAreaGuard enabled={guards} frame={frame} rootId={ROOT_ID} centreBox={false} />
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

const ChatWindow: React.FC<{
  L: Layout;
  frame: number;
  fps: number;
  brand: BrandAssets;
  chatIn: { opacity: number; scale: number };
  contents: number;
  halo: number;
}> = ({ L, frame, fps, brand, chatIn, contents, halo }) => {
  const g = threadGeometry(L, frame);
  const fieldW = CHAT.w - COMPOSER.padX * 2 - COMPOSER.send - COMPOSER.gap;
  return (
    <div
      data-guard="chat"
      data-box="chat:chat"
      style={{
        position: "absolute",
        left: CHAT.x,
        top: CHAT.y,
        width: CHAT.w,
        height: CHAT.h,
        borderRadius: CHAT.radius,
        background: "#FFFFFF",
        boxShadow: SOFT_SHADOW,
        opacity: chatIn.opacity,
        transform: `scale(${chatIn.scale})`,
      }}
    >
      {/* Header: the WhatsApp logo, name and online dot; the agent orb on the right. */}
      <div
        style={{
          position: "absolute",
          left: CHAT_HEADER.padX,
          top: 0,
          height: CHAT_HEADER.h,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <WhatsAppLogo size={CHAT_HEADER.logo} present={brand.hasWhatsApp} />
        <div data-contrast style={{ fontSize: CHAT_HEADER.nameSize, fontWeight: 600, color: INK, lineHeight: "30px" }}>
          WhatsApp
        </div>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: ONLINE }} />
      </div>
      <div
        style={{
          position: "absolute",
          right: CHAT_HEADER.padX,
          top: (CHAT_HEADER.h - CHAT_HEADER.orb) / 2,
          width: CHAT_HEADER.orb,
          height: CHAT_HEADER.orb,
        }}
      >
        <Orb size={CHAT_HEADER.orb} haloPulse={halo} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: CHAT_HEADER.h, height: 1, background: "#ECEDF2" }} />

      {/* Thread viewport: scrolled out rows are clipped here; message text is never clipped on screen. */}
      <div
        style={{
          position: "absolute",
          left: THREAD.padX,
          top: THREAD.top,
          width: L.threadW,
          height: L.viewportH,
          overflow: "hidden",
          opacity: contents,
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, width: L.threadW, transform: `translateY(${-g.scroll}px)` }}>
          {BEATS.map((beat) => {
            const top = g.tops.get(beat.id);
            if (top === undefined) return null;
            return beat.kind === "message" ? (
              <MessageRow key={beat.id} L={L} beat={beat} frame={frame} fps={fps} y={top} h={g.heights.get(beat.id)!} />
            ) : (
              <ChipRow key={beat.id} L={L} beat={beat} frame={frame} fps={fps} y={top} />
            );
          })}
        </div>
      </div>

      {/* Empty message field with mic and send. */}
      <div
        style={{
          position: "absolute",
          left: COMPOSER.padX,
          top: CHAT.h - COMPOSER.padBottom - COMPOSER.h,
          width: fieldW,
          height: COMPOSER.h,
          borderRadius: COMPOSER.h / 2,
          background: "#F3F4F7",
          boxShadow: "inset 0 0 0 1px rgba(13,18,36,0.05)",
        }}
      >
        <div style={{ position: "absolute", right: 16, top: (COMPOSER.h - 24) / 2 }}>
          <MicIcon size={24} color="#6B7083" />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: COMPOSER.padX,
          top: CHAT.h - COMPOSER.padBottom - COMPOSER.send,
          width: COMPOSER.send,
          height: COMPOSER.send,
          borderRadius: "50%",
          background: SEND_BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ marginLeft: 3, display: "flex" }}>
          <SendIcon size={22} color="#FFFFFF" />
        </div>
      </div>
    </div>
  );
};

const Dots: React.FC<{ frame: number; fps: number; start: number; opacity: number }> = ({ frame, fps, start, opacity }) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity }}>
    {[0, 1, 2].map((i) => {
      const k = 0.5 + 0.5 * Math.sin(2 * Math.PI * 1.8 * ((frame - start) / fps) - i * 0.9);
      return (
        <div
          key={i}
          style={{ width: 10, height: 10, borderRadius: "50%", background: DOT, opacity: 0.35 + 0.65 * k, transform: `translateY(${-2 * k}px)` }}
        />
      );
    })}
  </div>
);

const AgentAvatar: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: 0, width: AVATAR, height: AVATAR }}>
    <Orb size={AVATAR} />
  </div>
);

const MessageRow: React.FC<{ L: Layout; beat: MessageBeat; frame: number; fps: number; y: number; h: number }> = ({
  L,
  beat,
  frame,
  fps,
  y,
  h,
}) => {
  const ml = L.messages.get(beat.id)!;
  const customer = beat.side === "customer";
  const time = (frame - beat.typeStart) / fps;
  if (customer) {
    const p = pop(frame, beat.enter);
    return (
      <div style={{ position: "absolute", left: 0, top: y, width: L.threadW, height: h, opacity: p.opacity, transform: `scale(${p.scale})`, transformOrigin: "100% 0%" }}>
        <div
          data-bubble={beat.id}
          style={{
            position: "absolute",
            right: AVATAR + AVATAR_GAP,
            top: 0,
            width: ml.w,
            height: h,
            boxSizing: "border-box",
            padding: `${BUBBLE.padY}px ${BUBBLE.padX}px`,
            background: CUSTOMER_BG,
            borderRadius: BUBBLE.radius,
            borderTopRightRadius: BUBBLE.tail,
          }}
        >
          <div data-contrast style={{ color: INK }}>
            <Typewriter
              lines={ml.lines}
              time={time}
              schedule={beat.schedule}
              fontFamily={SANS}
              fontSize={MSG_FONT.size}
              fontWeight={MSG_FONT.weight}
              lineHeight={MSG_FONT.lineHeight}
              caretLeadIn={(beat.typeStart - beat.enter[0]) / fps}
              charGuard={beat.id}
            />
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: AVATAR,
            height: AVATAR,
            borderRadius: "50%",
            background: INK,
            color: "#FFFFFF",
            fontSize: 18,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          M
        </div>
      </div>
    );
  }

  // Agent: (indicator) then the pill expands to the fixed bubble, then types.
  const appear = pop(frame, [(beat.indicator ?? beat.enter)[0], (beat.indicator ?? beat.enter)[0] + 9]);
  const ex = tween(frame, beat.enter);
  const w = lerp(PILL.w, ml.w, ex);
  const bh = beat.indicator && frame < beat.enter[0] ? PILL.h : h;
  const dots = beat.indicator ? 1 - tween(frame, [beat.enter[0], beat.enter[0] + 6]) : 0;
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: L.threadW, opacity: appear.opacity, transform: `scale(${appear.scale})`, transformOrigin: "0% 0%" }}>
      <AgentAvatar />
      <div
        data-bubble={beat.id}
        style={{
          position: "absolute",
          left: AVATAR + AVATAR_GAP,
          top: 0,
          width: w,
          height: bh,
          boxSizing: "border-box",
          padding: `${BUBBLE.padY}px ${BUBBLE.padX}px`,
          background: AGENT_BG,
          borderRadius: BUBBLE.radius,
          borderTopLeftRadius: BUBBLE.tail,
        }}
      >
        {dots > 0 && beat.indicator ? <Dots frame={frame} fps={fps} start={beat.indicator[0]} opacity={dots} /> : null}
        {frame >= beat.enter[0] ? (
          <div data-contrast style={{ color: INK, opacity: tween(frame, [beat.enter[1] - 6, beat.enter[1]]) }}>
            <Typewriter
              lines={ml.lines}
              time={time}
              schedule={beat.schedule}
              fontFamily={SANS}
              fontSize={MSG_FONT.size}
              fontWeight={MSG_FONT.weight}
              lineHeight={MSG_FONT.lineHeight}
              charGuard={beat.id}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

const ChipRow: React.FC<{ L: Layout; beat: ChipRowBeat; frame: number; fps: number; y: number }> = ({ L, beat, frame, fps, y }) => {
  const appear = pop(frame, [beat.indicator[0], beat.indicator[0] + 9]);
  const ex = tween(frame, beat.expand);
  const dots = 1 - tween(frame, [beat.expand[0], beat.expand[0] + 6]);
  const labelIn = tween(frame, [beat.expand[0] + 8, beat.expand[1] + 3]);
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: L.threadW, opacity: appear.opacity, transform: `scale(${appear.scale})`, transformOrigin: "0% 0%" }}>
      <AgentAvatar />
      {beat.chips.map((spec, i) => {
        const cl = L.chips.get(spec.id)!;
        const chipTop = i * (CHIP.h + CHIP.stack);
        const lifted = frame >= spec.lift[0];
        // The first chip grows out of the indicator; the others pop in beside it.
        const w = i === 0 ? lerp(PILL.w, cl.w, ex) : cl.w;
        const h = i === 0 ? lerp(PILL.h, CHIP.h, ex) : CHIP.h;
        const second = i === 0 ? { opacity: 1, scale: 1 } : pop(frame, beat.expand);
        const kept = pop(frame, [spec.lift[0] + 3, spec.lift[0] + 15]);
        return (
          <div key={spec.id} style={{ position: "absolute", left: AVATAR + AVATAR_GAP, top: chipTop }}>
            {!lifted ? (
              <div
                data-box={`chip:${spec.id}`}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: w,
                  height: h,
                  borderRadius: h / 2,
                  background: mix(CHIP_BG, MINT_BG, tween(frame, spec.check)),
                  boxShadow: `inset 0 0 0 1px ${tween(frame, spec.check) > 0 ? MINT_EDGE : "rgba(13,18,36,0.05)"}`,
                  opacity: second.opacity,
                  transform: `scale(${second.scale})`,
                  transformOrigin: "0% 50%",
                }}
              >
                {i === 0 && dots > 0 ? <Dots frame={frame} fps={fps} start={beat.indicator[0]} opacity={dots} /> : null}
                {labelIn > 0 ? <ChipFace spec={spec} labelW={cl.labelW} frame={frame} fps={fps} labelIn={labelIn} /> : null}
              </div>
            ) : (
              <KeptChip spec={spec} w={cl.keptW} labelW={cl.keptLabelW} opacity={kept.opacity} scale={kept.scale} />
            )}
          </div>
        );
      })}
    </div>
  );
};

/** Shared element: the chip lifts out of the chat on a slight arc and becomes the receipt in its slot. */
const Flier: React.FC<{
  spec: ChipSpec;
  from: Rect;
  L: Layout;
  frame: number;
  fps: number;
  badgePulse: number;
  opacity: number;
}> = ({ spec, from, L, frame, fps, badgePulse, opacity }) => {
  const to = slotRect(spec.slot);
  const p = tween(frame, spec.lift);
  const x = lerp(from.x, to.x, p);
  // Arc away from the filled slots: upward into the first two slots, downward into the bottom one.
  const arcSign = spec.slot === 2 ? -1 : 1;
  const y = lerp(from.y, to.y, p) - arcSign * ARC * Math.sin(Math.PI * p);
  const w = lerp(from.w, to.w, p);
  const h = lerp(from.h, to.h, p);
  const radius = lerp(CHIP.h / 2, SLOT.radius, p);
  const landed = p >= 1;
  // Overlapping crossfade so the card is never blank mid flight.
  const chipOut = 1 - tween(p, [0.2, 0.62], [0, 1], (t) => t);
  const receiptIn = tween(p, [0.38, 0.85], [0, 1], (t) => t);
  const contentScale = Math.min(w / SLOT.w, h / SLOT.h);
  const cl = L.chips.get(spec.id)!;
  const glyphDraw = tween(frame, [spec.lift[1] - 8, spec.lift[1] + 20]);
  const badge = tween(frame, [spec.lift[1] - 4, spec.lift[1] + 10]);
  return (
    <div
      data-guard={`receipt-${spec.id}`}
      data-box={`receipt:${spec.id}:${landed ? "landed" : "flying"}:${spec.slot}`}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: radius,
        background: mix(MINT_BG, "#FFFFFF", tween(p, [0.15, 0.6], [0, 1], (t) => t)),
        boxShadow: `0 ${lerp(2, 14, p)}px ${lerp(6, 34, p)}px rgba(13,18,36,${lerp(0.04, 0.09, p)}), inset 0 0 0 1px rgba(188,230,207,${1 - p})`,
        opacity,
      }}
    >
      {chipOut > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: chipOut }}>
          <ChipFace spec={spec} labelW={cl.labelW} frame={frame} fps={fps} labelIn={1} />
        </div>
      ) : null}
      {receiptIn > 0 ? (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: receiptIn, transform: `scale(${contentScale})`, transformOrigin: "0 0" }}>
          <ReceiptFace spec={spec} glyphDraw={glyphDraw} badge={badge} badgePulse={badgePulse} />
        </div>
      ) : null}
    </div>
  );
};
