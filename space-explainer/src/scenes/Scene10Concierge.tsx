import React from "react";
import { AbsoluteFill } from "remotion";
import { ArrowRight, FileText } from "lucide-react";
import { CHAT_CPS, COLOR, EASE, FONT } from "../theme";
import { PLACEHOLDERS as P } from "../placeholders";
import { GuardLayer } from "../components/GuardLayer";
import { SpaceOrb } from "../components/SpaceOrb";
import { Typewriter } from "../components/Typewriter";
import { typeDuration } from "../lib/typewriter";
import type { TextBeatSpec } from "../lib/guards";
import { Scene09EndFrame, S9_PILL_LABEL } from "./Scene09Records";
import { Pills, ramp, useScene, type Pill } from "./shared/stage";

const S = "S10" as const;
export const NEUTRAL = "#F4F6F8";
const C = P.concierge;
export const S10 = { neutral: [0.05, 0.6], card: 0.45, customer: 0.7, reply: 1.15, chip: 3.45, tag: 3.9, slide: [4.5, 5.1], cardOut: [5.7, 5.95] };
const REPLY = C.reply.join(" ");
const REPLY_DUR = typeDuration(REPLY, CHAT_CPS, "concierge-reply");
const CARD = { x: 480, y: 240, w: 960, h: 560 };
const MSG = 28;

export const S10_PILLS: Pill[] = [{ label: S9_PILL_LABEL, at: -10, until: 0 }];
export const SCENE10_TEXT: TextBeatSpec[] = [
  { id: "customer", text: C.customer, readyAt: S10.customer + 0.3, leaveAt: S10.cardOut[0], fontPx: MSG },
  { id: "reply", text: REPLY, readyAt: S10.reply + REPLY_DUR, leaveAt: S10.cardOut[0], fontPx: MSG, exception: "Read as it types; brief: 6s scene" },
  { id: "chip", text: C.handed, readyAt: S10.chip + 0.3, leaveAt: S10.cardOut[0], fontPx: 28 },
];

export const Scene10Concierge: React.FC = () => {
  const { t, F, clock, start } = useScene(S);
  const neutral = EASE(ramp(t, S10.neutral[0], S10.neutral[1]));
  const card = EASE(ramp(t, S10.card, S10.card + 0.45));
  const out = EASE(ramp(t, S10.cardOut[0], S10.cardOut[1]));
  const cust = EASE(ramp(t, S10.customer, S10.customer + 0.35));
  const replyIn = EASE(ramp(t, S10.reply - 0.2, S10.reply));
  const chip = EASE(ramp(t, S10.chip, S10.chip + 0.35));
  const tagIn = EASE(ramp(t, S10.tag, S10.tag + 0.3));
  const slide = EASE(ramp(t, S10.slide[0], S10.slide[1]));
  return (
    <AbsoluteFill style={{ width: 1920, height: 1080, background: NEUTRAL }}>
      {neutral < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - neutral, transform: `scale(${1 - 0.03 * neutral})` }}>
          <Scene09EndFrame F={F} clock={clock} />
        </AbsoluteFill>
      ) : null}
      {neutral > 0 && neutral < 1 ? <AbsoluteFill style={{ background: NEUTRAL, opacity: neutral }} /> : null}
      {card > 0 && out < 1 ? (
        <div
          style={{
            position: "absolute",
            left: CARD.x,
            top: CARD.y,
            width: CARD.w,
            height: CARD.h,
            boxSizing: "border-box",
            borderRadius: 24,
            background: "#FFFFFF",
            boxShadow: "0 30px 80px rgba(13,18,36,0.12), 0 8px 20px rgba(13,18,36,0.06)",
            opacity: card * (1 - out),
            transform: `translateY(${(1 - card) * 24 - out * 16}px) scale(${0.98 + 0.02 * card})`,
            fontFamily: FONT.sans,
            color: COLOR.ink,
          }}
        >
          <div data-guard="text" data-guard-label="Concierge title" style={{ position: "absolute", left: 40, top: 32, fontSize: 28, fontWeight: 700, letterSpacing: "-0.01em" }}>
            {C.title}
          </div>
          <div style={{ position: "absolute", left: 40, right: 40, top: 92, height: 1, background: "#E6E9EE" }} />
          {/* Customer */}
          <div style={{ position: "absolute", right: 40, top: 128, opacity: cust, transform: `translateY(${(1 - cust) * 12}px)` }}>
            <div data-guard="text" data-guard-label="Customer message" style={{ padding: "16px 22px", borderRadius: "20px 20px 6px 20px", background: "#EEF0F4", fontSize: MSG, lineHeight: 1.35, whiteSpace: "nowrap" }}>
              {C.customer}
            </div>
            <div style={{ marginTop: 8, textAlign: "right", fontSize: 20, color: "#5B6273" }}>{P.insured}</div>
          </div>
          {/* Reply */}
          <div style={{ position: "absolute", left: 40, top: 280, opacity: replyIn }}>
            <div data-guard="text" data-guard-label="Concierge reply" style={{ padding: "16px 22px", borderRadius: "20px 20px 20px 6px", border: "1px solid #E1E4EA", fontSize: MSG, lineHeight: 1.35 }}>
              <Typewriter lines={[...C.reply]} cps={CHAT_CPS} startFrame={F(S10.reply)} seed="concierge-reply" caretColor={COLOR.ink} style={{ fontSize: MSG, color: COLOR.ink }} />
            </div>
          </div>
          {/* Handoff */}
          <div style={{ position: "absolute", left: 40, top: 452, display: "flex", alignItems: "center", gap: 16 }}>
            <div data-guard="text" data-guard-label="Handed chip" style={{ display: "flex", alignItems: "center", gap: 12, height: 58, padding: "0 22px 0 12px", borderRadius: 29, background: "#F3F0FF", border: "1px solid #DCD3FF", fontSize: 28, fontWeight: 600, color: "#3B2A8F", opacity: chip, transform: `scale(${0.94 + 0.06 * chip})`, whiteSpace: "nowrap" }}>
              <SpaceOrb size={38} timeOffset={start} />
              {C.handed}
            </div>
            {chip > 0 ? <ArrowRight size={24} color="#8E7CF0" style={{ opacity: chip }} /> : null}
            {tagIn > 0 ? (
              <div
                data-guard="text"
                data-guard-label="Claim tag"
                style={{ display: "flex", alignItems: "center", gap: 10, height: 48, padding: "0 18px", borderRadius: 12, background: "#FFFFFF", border: "2px solid #6B4FE0", boxShadow: "0 8px 18px rgba(13,18,36,0.12)", fontSize: 22, fontWeight: 700, color: COLOR.ink, whiteSpace: "nowrap", opacity: tagIn * (1 - ramp(t, S10.slide[1] - 0.15, S10.slide[1])), transform: `translateX(${slide * 1100}px)` }}
              >
                <FileText size={20} color="#6B4FE0" />
                {`Claim ${P.claimId}`}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      <Pills t={t} pills={S10_PILLS} />
      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};
