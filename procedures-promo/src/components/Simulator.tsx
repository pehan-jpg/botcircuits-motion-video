import React from "react";
import { COLORS, TEXT, ease } from "../theme";
import { BrandMark } from "./BrandLogo";

export const SIM = { x: 616, y: 20, w: 324, h: 500 };

export type SimState = {
  inputText: string;
  caretOn: boolean;
  sendPress: number;
  userBubble: number;
  typingDots: number; // 0 hidden, 1 visible
  agentBubble: number;
  agentWords: number; // words of the reply revealed
  followed: number; // badge pop progress
  flash: number; // 1 at flash peak → 0
  meta: number;
  frame: number;
};

export const Simulator: React.FC<{ st: SimState; style?: React.CSSProperties }> = ({ st, style }) => {
  const words = TEXT.agentReply.split(" ");
  return (
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

      {/* ✓ Procedure Followed */}
      <div
        style={{
          position: "absolute",
          right: 14,
          top: 15,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            height: 22,
            padding: "0 10px",
            borderRadius: 11,
            background: COLORS.lime,
            color: COLORS.ink,
            fontSize: 10,
            fontWeight: 500,
            opacity: Math.min(1, st.followed * 1.5),
            scale: String(st.followed),
            boxShadow: `0 0 ${24 * st.flash}px ${6 * st.flash}px rgba(210,248,0,${0.8 * st.flash})`,
          }}
        >
          <svg width={10} height={10} viewBox="0 0 10 10">
            <path d="M2 5.2 L4.2 7.3 L8 3" stroke={COLORS.ink} strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Procedure Followed
        </div>
      </div>

      {/* User message */}
      <div
        style={{
          position: "absolute",
          right: 16,
          top: 74,
          maxWidth: 220,
          padding: "8px 11px",
          borderRadius: "12px 12px 3px 12px",
          background: COLORS.ink,
          color: "#FFFFFF",
          fontSize: 11,
          lineHeight: 1.45,
          opacity: st.userBubble,
          translate: `0px ${(1 - st.userBubble) * 10}px`,
          scale: String(0.94 + 0.06 * st.userBubble),
          transformOrigin: "100% 100%",
        }}
      >
        {TEXT.userMessage}
      </div>

      {/* Agent */}
      <div style={{ position: "absolute", left: 16, top: 142, display: "flex", gap: 8, opacity: Math.max(st.typingDots, st.agentBubble) }}>
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
        {st.agentBubble > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div
              style={{
                width: 236,
                boxSizing: "border-box",
                padding: "8px 11px",
                borderRadius: "12px 12px 12px 3px",
                background: "#F3F4F6",
                fontSize: 11,
                lineHeight: 1.5,
                color: COLORS.ink,
                translate: `0px ${(1 - st.agentBubble) * 10}px`,
              }}
            >
              {words.map((w, i) => (
                <span key={i} style={{ opacity: i < st.agentWords ? 1 : 0 }}>
                  {w}{" "}
                </span>
              ))}
            </div>
            <div style={{ fontSize: 9, color: COLORS.grey, opacity: st.meta, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 5, height: 5, borderRadius: 3, background: COLORS.lime }} />
              Escalated to human · Strict Boundary Rule
            </div>
          </div>
        ) : (
          <div
            style={{
              height: 26,
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
        )}
      </div>

      {/* Input bar */}
      <div
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 12,
          height: 38,
          boxSizing: "border-box",
          borderRadius: 10,
          border: `1px solid ${st.inputText ? COLORS.ink : COLORS.border}`,
          display: "flex",
          alignItems: "center",
          padding: "0 6px 0 12px",
          fontSize: 10.5,
          color: st.inputText ? COLORS.ink : COLORS.greyLight,
        }}
      >
        <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden" }}>
          {st.inputText || "Send a test message…"}
          {st.inputText ? (
            <span style={{ display: "inline-block", width: 1, height: 11, marginLeft: 1, verticalAlign: -2, background: COLORS.ink, opacity: st.caretOn ? 1 : 0 }} />
          ) : null}
        </span>
        <div
          style={{
            width: 26,
            height: 26,
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
};

export const flashCurve = (frame: number, start: number) =>
  frame < start ? 0 : ease(frame, [start, start + 6], [0, 1]) * ease(frame, [start + 6, start + 40], [1, 0]);
