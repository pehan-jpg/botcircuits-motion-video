import React from "react";
import { COLORS, TEXT, ease } from "../theme";
import { BrandMark } from "./BrandLogo";

export const SIM = { x: 600, y: 20, w: 340, h: 500 };

export type SimState = {
  frame: number;
  inputText: string;
  caretOn: boolean;
  sendPress: number;
  userBubbles: [number, number]; // customer messages 1 and 2
  typing: number; // typing indicator visibility
  status: string; // live step status under the typing indicator
  replies: [number, number]; // pop progress of agent replies 1 and 2
  words: [number, number]; // words revealed per reply
  card: number; // interactive label card slide-in progress
  hover: number; // cursor over the download button
};

const Avatar: React.FC = () => (
  <div
    style={{
      width: 22,
      height: 22,
      borderRadius: 11,
      border: `1px solid ${COLORS.border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: COLORS.surface,
      flexShrink: 0,
    }}
  >
    <BrandMark size={13} />
  </div>
);

const enter = (p: number): React.CSSProperties => ({
  opacity: Math.min(1, p * 1.4),
  translate: `0px ${(1 - Math.min(1, p)) * 10}px`,
});

const AgentBubble: React.FC<{ p: number; text: string; words: number }> = ({ p, text, words }) => (
  <div style={{ display: "flex", gap: 8, flexShrink: 0, ...enter(p) }}>
    <Avatar />
    <div
      style={{
        maxWidth: 262,
        boxSizing: "border-box",
        padding: "8px 11px",
        borderRadius: "12px 12px 12px 3px",
        background: "#F3F4F6",
        fontSize: 11,
        lineHeight: 1.5,
        color: COLORS.ink,
      }}
    >
      {text.split(" ").map((w, i) => (
        <span key={i} style={{ opacity: i < words ? 1 : 0 }}>
          {w}{" "}
        </span>
      ))}
    </div>
  </div>
);

const UserBubble: React.FC<{ p: number; text: string }> = ({ p, text }) => (
  <div
    style={{
      alignSelf: "flex-end",
      maxWidth: 236,
      padding: "8px 11px",
      borderRadius: "12px 12px 3px 12px",
      background: COLORS.ink,
      color: "#FFFFFF",
      fontSize: 11,
      lineHeight: 1.45,
      flexShrink: 0,
      ...enter(p),
    }}
  >
    {text}
  </div>
);

// Agent reply 3: the interactive prepaid-label card.
const LabelCard: React.FC<{ p: number; hover: number }> = ({ p, hover }) => (
  <div style={{ display: "flex", flexShrink: 0, opacity: Math.min(1, p * 1.4), translate: `${(1 - Math.min(1, p)) * 24}px 0px` }}>
    <div
      style={{
        width: 304,
        boxSizing: "border-box",
        padding: 12,
        borderRadius: 12,
        border: `1px solid ${COLORS.border}`,
        background: COLORS.surface,
        boxShadow: "0 1px 2px rgba(17,24,39,0.05), 0 8px 20px -10px rgba(17,24,39,0.18)",
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "#F3F4F6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {/* package / label icon */}
          <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke={COLORS.ink} strokeWidth={1.2} strokeLinejoin="round">
            <path d="M8 1.8 L14 4.8 L14 11.2 L8 14.2 L2 11.2 L2 4.8 Z" />
            <path d="M2 4.8 L8 7.8 L14 4.8 M8 7.8 L8 14.2" />
            <path d="M5 3.3 L11 6.3" />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: COLORS.ink, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
            {TEXT.labelCardTitle}
          </div>
          <div style={{ fontSize: 12, color: COLORS.grey, whiteSpace: "nowrap" }}>{TEXT.labelCardSub}</div>
        </div>
      </div>
      <div
        style={{
          position: "relative",
          marginTop: 12,
          height: 32,
          borderRadius: 8,
          background: hover > 0.5 ? "#374151" : COLORS.ink,
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          fontSize: 11,
          fontWeight: 500,
          scale: String(1 + 0.015 * hover),
        }}
      >
        <svg width={11} height={11} viewBox="0 0 10 10">
          <path d="M5 1.5 L5 6.5 M2.8 4.5 L5 6.7 L7.2 4.5 M2 8.5 L8 8.5" stroke="#FFFFFF" strokeWidth={1.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {TEXT.labelCardButton}
        {/* pointer gliding onto the button */}
        <svg
          width={14}
          height={18}
          viewBox="0 0 16 20"
          style={{
            position: "absolute",
            left: "62%",
            top: "55%",
            translate: `${(1 - hover) * 46}px ${(1 - hover) * 34}px`,
            opacity: ease(hover, [0, 0.3], [0, 1]),
            filter: "drop-shadow(0 1px 1.5px rgba(0,0,0,0.25))",
          }}
        >
          <path d="M1 1 L1 15.5 L4.8 12 L7.4 18 L10 16.9 L7.5 11 L12.5 11 Z" fill="#111827" stroke="#FFFFFF" strokeWidth={1.2} strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  </div>
);

export const Simulator: React.FC<{ st: SimState; style?: React.CSSProperties }> = ({ st, style }) => (
  <div
    style={{
      position: "absolute",
      left: SIM.x,
      top: SIM.y,
      width: SIM.w,
      height: SIM.h,
      boxSizing: "border-box",
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 12,
      boxShadow: "0 1px 2px rgba(17,24,39,0.04), 0 18px 40px -16px rgba(17,24,39,0.16)",
      overflow: "hidden",
      ...style,
    }}
  >
    {/* Header */}
    <div
      style={{
        height: 52,
        borderBottom: `1px solid ${COLORS.border}`,
        padding: "0 16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 3,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 500 }}>Simulator</div>
      <div style={{ fontSize: 9.5, color: COLORS.grey }}>Live test</div>
    </div>
    {/* Conversation: anchored to the bottom so earlier messages scroll up as new ones arrive */}
    <div
      style={{
        position: "absolute",
        left: 14,
        right: 14,
        top: 62,
        bottom: 78,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        gap: 10,
      }}
    >
      {st.userBubbles[0] > 0 ? <UserBubble p={st.userBubbles[0]} text={TEXT.userMessage} /> : null}
      {st.replies[0] > 0 ? <AgentBubble p={st.replies[0]} text={TEXT.reply1} words={st.words[0]} /> : null}
      {st.replies[1] > 0 ? <AgentBubble p={st.replies[1]} text={TEXT.reply2} words={st.words[1]} /> : null}
      {st.userBubbles[1] > 0 ? <UserBubble p={st.userBubbles[1]} text={TEXT.userMessage2} /> : null}
      {st.card > 0 ? <LabelCard p={st.card} hover={st.hover} /> : null}
      {st.typing > 0 ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0, opacity: st.typing }}>
          <Avatar />
          <div
            style={{
              height: 26,
              width: 44,
              boxSizing: "border-box",
              padding: "0 10px",
              borderRadius: "12px 12px 12px 3px",
              background: "#F3F4F6",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  background: COLORS.greyLight,
                  opacity: 0.4 + 0.6 * Math.max(0, Math.sin((st.frame - i * 5) / 5)),
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 9, color: COLORS.grey, whiteSpace: "nowrap" }}>{st.status}</span>
        </div>
      ) : null}
    </div>

    {/* Two-line, auto-wrapping input so the whole message stays visible */}
    <div
      style={{
        position: "absolute",
        left: 12,
        right: 12,
        bottom: 12,
        height: 54,
        boxSizing: "border-box",
        borderRadius: 10,
        border: `1px solid ${st.inputText ? COLORS.ink : COLORS.border}`,
        display: "flex",
        alignItems: "center",
        padding: "0 8px 0 12px",
        fontSize: 10.5,
        color: st.inputText ? COLORS.ink : COLORS.greyLight,
      }}
    >
      <span style={{ flex: 1, lineHeight: 1.5, whiteSpace: "normal" }}>
        {st.inputText || "Send a test message…"}
        {st.inputText ? (
          <span style={{ display: "inline-block", width: 1, height: 11, marginLeft: 1, verticalAlign: -2, background: COLORS.ink, opacity: st.caretOn ? 1 : 0 }} />
        ) : null}
      </span>
      <div
        style={{
          width: 26,
          height: 26,
          flexShrink: 0,
          marginLeft: 6,
          borderRadius: 8,
          background: st.inputText ? COLORS.ink : "#E5E7EB",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          scale: String(1 - 0.12 * st.sendPress),
        }}
      >
        <svg width={11} height={11} viewBox="0 0 11 11">
          <path d="M5.5 9 L5.5 2 M2.5 5 L5.5 2 L8.5 5" stroke="#FFFFFF" strokeWidth={1.3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  </div>
);
