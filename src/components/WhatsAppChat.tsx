import React from "react";
import { useTimeline, mix, typedCount } from "../anim";
import { CHAT_HEADER } from "../content";
import { C, FONT, PHONE, R } from "../theme";

// WhatsApp style conversation: phone frame, header, chat area, input bar.
// No official logo or brand assets are used.

const ICON = {
  stroke: C.muted,
  strokeWidth: 2,
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const BackIcon = () => (
  <svg width={40} height={40} viewBox="0 0 24 24" {...ICON} stroke={C.ink}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const VideoIcon = () => (
  <svg width={42} height={42} viewBox="0 0 24 24" {...ICON}>
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const CallIcon = () => (
  <svg width={38} height={38} viewBox="0 0 24 24" {...ICON}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const ClipIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width={38} height={38} viewBox="0 0 24 24" {...ICON} stroke={color}>
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

const MicIcon = () => (
  <svg width={36} height={36} viewBox="0 0 24 24" {...ICON} stroke={C.ink}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const Header: React.FC = () => (
  <div
    style={{
      height: PHONE.headerHeight,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      gap: 18,
      padding: "28px 34px 0 26px",
      backgroundColor: C.bg,
      borderBottom: `1px solid ${C.line}`,
    }}
  >
    <BackIcon />
    <div
      style={{
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: C.lime,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 34,
        fontWeight: 600,
        color: C.ink,
      }}
    >
      {CHAT_HEADER.avatarLetter}
    </div>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ fontSize: 32, fontWeight: 500, letterSpacing: -0.4 }}>
        {CHAT_HEADER.name}
      </div>
      <div style={{ fontSize: 23, fontWeight: 400, color: C.muted }}>
        {CHAT_HEADER.status}
      </div>
    </div>
    <div style={{ display: "flex", gap: 34, alignItems: "center" }}>
      <VideoIcon />
      <CallIcon />
    </div>
  </div>
);

const InputBar: React.FC<{ flashes: number[] }> = ({ flashes }) => {
  const { since } = useTimeline();
  // A single flash: lime disc behind the icon fades in and out over 0.45 s.
  const flash = Math.max(
    0,
    ...flashes.map((at) => {
      const s = since(at);
      return s < 0 || s > 0.45 ? 0 : Math.sin((s / 0.45) * Math.PI);
    }),
  );
  return (
    <div
      style={{
        height: PHONE.inputHeight,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 22px 18px",
        backgroundColor: C.wallpaper,
      }}
    >
      <div
        style={{
          flex: 1,
          height: 82,
          borderRadius: 41,
          backgroundColor: C.bg,
          display: "flex",
          alignItems: "center",
          padding: "0 18px 0 34px",
          fontSize: 29,
          color: C.muted,
          fontWeight: 300,
        }}
      >
        <div style={{ flex: 1 }}>{CHAT_HEADER.placeholder}</div>
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: 31,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `rgba(180, 240, 0, ${flash})`,
            scale: String(1 + flash * 0.06),
          }}
        >
          <ClipIcon color={flash > 0.3 ? C.ink : C.muted} />
        </div>
      </div>
      <div
        style={{
          width: 82,
          height: 82,
          borderRadius: 41,
          backgroundColor: C.lime,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MicIcon />
      </div>
    </div>
  );
};

export const CHAT_AREA_HEIGHT =
  PHONE.height - PHONE.border * 2 - PHONE.headerHeight - PHONE.inputHeight;

export const WhatsAppChat: React.FC<{
  children: React.ReactNode;
  attachFlashes?: number[];
}> = ({ children, attachFlashes = [] }) => (
  <div
    style={{
      width: PHONE.width - PHONE.border * 2,
      height: PHONE.height - PHONE.border * 2,
      borderRadius: R.phone - PHONE.border,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      backgroundColor: C.wallpaper,
      fontFamily: FONT,
      color: C.ink,
      fontVariantNumeric: "tabular-nums",
    }}
  >
    <Header />
    <div
      style={{
        position: "relative",
        height: CHAT_AREA_HEIGHT,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
    <InputBar flashes={attachFlashes} />
  </div>
);

// ---------------------------------------------------------------------------
// Message parts

export const Ticks: React.FC<{ deliveredAt: number; readAt: number }> = ({
  deliveredAt,
  readAt,
}) => {
  const { p } = useTimeline();
  const second = p(deliveredAt, 0.2);
  const read = p(readAt, 0.25);
  const color = read > 0.5 ? C.read : "#8A9099";
  return (
    <svg width={34} height={20} viewBox="0 0 34 20" style={{ marginLeft: 6 }}>
      <path
        d="M3 10.5 L8 15.5 L19 4"
        fill="none"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 15.5 L25 4"
        fill="none"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeDasharray={16}
        strokeDashoffset={16 * (1 - second)}
        opacity={second}
      />
      <path
        d="M11.5 13 L14 15.5"
        fill="none"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        opacity={second}
      />
    </svg>
  );
};

export const Meta: React.FC<{
  time: string;
  ticks?: { deliveredAt: number; readAt: number };
}> = ({ time, ticks }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      marginTop: 6,
      fontSize: 20,
      fontWeight: 400,
      color: C.muted,
    }}
  >
    {time}
    {ticks ? <Ticks {...ticks} /> : null}
  </div>
);

const Tail: React.FC<{ side: "in" | "out" }> = ({ side }) =>
  side === "out" ? (
    <svg
      width={20}
      height={26}
      viewBox="0 0 20 26"
      style={{ position: "absolute", right: -16, bottom: 0 }}
    >
      <path d="M0 0 C0 15 6 22 18 26 L0 26 Z" fill={C.limeSoft} />
    </svg>
  ) : (
    <svg
      width={22}
      height={26}
      viewBox="0 0 22 26"
      style={{
        position: "absolute",
        left: -17,
        bottom: 0,
        overflow: "visible",
      }}
    >
      <path d="M18 0 C18 15 12 22 0 25.5 L19 25.5 L19 0 Z" fill={C.bg} />
      <path
        d="M17.5 0 C17.5 15 12 22 0.5 25.5 L19 25.5"
        fill="none"
        stroke={C.line}
        strokeWidth={1}
      />
    </svg>
  );

// Chat bubble. Hidden (but laid out) until `at`, then scales in from the tail.
export const Bubble: React.FC<{
  side: "in" | "out";
  at: number;
  width?: number;
  padding?: string;
  children: React.ReactNode;
}> = ({ side, at, width, padding = "18px 24px 12px", children }) => {
  const { p } = useTimeline();
  const e = p(at, 0.33);
  const out = side === "out";
  return (
    <div
      style={{
        alignSelf: out ? "flex-end" : "flex-start",
        position: "relative",
        width,
        maxWidth: 620,
        marginLeft: out ? 0 : 16,
        marginRight: out ? 16 : 0,
        padding,
        backgroundColor: out ? C.limeSoft : C.bg,
        border: out ? "none" : `1px solid ${C.line}`,
        borderRadius: R.bubble,
        borderBottomRightRadius: out ? 0 : R.bubble,
        borderBottomLeftRadius: out ? R.bubble : 0,
        fontSize: 30,
        lineHeight: 1.32,
        fontWeight: 300,
        opacity: e,
        scale: String(mix(0.92, 1, e)),
        transformOrigin: out ? "100% 100%" : "0% 100%",
        visibility: e <= 0 ? "hidden" : "visible",
        boxShadow: "0 1px 1px rgba(29, 33, 37, 0.04)",
      }}
    >
      <Tail side={side} />
      {children}
    </div>
  );
};

// Expands a block's height from 0 to its content height.
export const Reveal: React.FC<{
  progress: number;
  children: React.ReactNode;
}> = ({ progress, children }) => (
  <div style={{ display: "grid", gridTemplateRows: `${progress}fr` }}>
    <div
      style={{ overflow: progress >= 1 ? "visible" : "hidden", minHeight: 0 }}
    >
      {children}
    </div>
  </div>
);

export const TypingDots: React.FC<{ at: number }> = ({ at }) => {
  const { since } = useTimeline();
  const s = since(at);
  return (
    <div style={{ display: "flex", gap: 10, padding: "10px 4px 6px" }}>
      {[0, 1, 2].map((i) => {
        const phase = s * 7 - i * 0.9;
        const lift = Math.max(0, Math.sin(phase));
        return (
          <div
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: C.muted,
              opacity: 0.35 + lift * 0.45,
              translate: `0px ${-lift * 7}px`,
            }}
          />
        );
      })}
    </div>
  );
};

export const TypedLine: React.FC<{
  at: number;
  cps: number;
  text: string;
  style?: React.CSSProperties;
}> = ({ at, cps, text, style }) => {
  const { since } = useTimeline();
  const n = Math.min(text.length, typedCount(since(at), cps));
  return (
    <div style={{ position: "relative", ...style }}>
      {/* Invisible full text reserves the final layout so lines never reflow. */}
      <span style={{ visibility: "hidden" }}>{text}</span>
      <span style={{ position: "absolute", left: 0, top: 0, right: 0 }}>
        {text.slice(0, n)}
      </span>
    </div>
  );
};

export const FileCard: React.FC<{
  name: string;
  meta: string;
  type: string;
  tone?: "out" | "in";
}> = ({ name, meta, type, tone = "out" }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 20,
      padding: "16px 22px 16px 16px",
      borderRadius: 20,
      backgroundColor: tone === "out" ? "rgba(29, 33, 37, 0.05)" : C.panel,
      width: 460,
    }}
  >
    <div
      style={{
        position: "relative",
        width: 60,
        height: 74,
        borderRadius: 10,
        backgroundColor: C.bg,
        border: `1.5px solid ${C.line}`,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: 10,
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: 0.5,
      }}
    >
      {type}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: -0.3 }}>
        {name}
      </div>
      <div style={{ fontSize: 22, color: C.muted, fontWeight: 400 }}>
        {meta}
      </div>
    </div>
  </div>
);

export const DataRow: React.FC<{
  label: string;
  at: number;
  children: React.ReactNode;
}> = ({ label, at, children }) => {
  const { p } = useTimeline();
  const e = p(at, 0.4);
  return (
    <Reveal progress={p(at - 0.05, 0.3)}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: 54,
          gap: 24,
        }}
      >
        <div
          style={{ fontSize: 24, color: C.muted, fontWeight: 400, opacity: e }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 500,
            opacity: e,
            translate: `0px ${mix(8, 0, e)}px`,
            letterSpacing: -0.2,
          }}
        >
          {children}
        </div>
      </div>
    </Reveal>
  );
};

export const DataCard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      marginTop: 14,
      padding: "10px 24px",
      borderRadius: R.card,
      backgroundColor: C.panel,
    }}
  >
    {children}
  </div>
);

export const Chip: React.FC<{
  children: React.ReactNode;
  tone?: "lime" | "soft";
  size?: number;
}> = ({ children, tone = "lime", size = 22 }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: `${size * 0.32}px ${size * 0.8}px`,
      borderRadius: 999,
      backgroundColor: tone === "lime" ? C.lime : C.limeSoft,
      color: C.ink,
      fontSize: size,
      fontWeight: 500,
      lineHeight: 1.1,
      letterSpacing: -0.1,
    }}
  >
    {children}
  </div>
);

// WhatsApp reply style button, with a tap ripple and a 3 percent dip.
export const ChatButton: React.FC<{
  label: string;
  primary?: boolean;
  tapAt?: number;
  dimmed?: number;
}> = ({ label, primary = false, tapAt, dimmed = 0 }) => {
  const { since } = useTimeline();
  const s = tapAt === undefined ? -1 : since(tapAt);
  const ripple = s >= 0 && s <= 0.4 ? s / 0.4 : s > 0.4 ? 1 : 0;
  const dip = s >= 0 && s <= 0.26 ? Math.sin((s / 0.26) * Math.PI) : 0;
  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        height: 74,
        borderRadius: 20,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 28,
        fontWeight: 500,
        backgroundColor: primary ? C.lime : C.bg,
        border: primary ? "none" : `1.5px solid ${C.line}`,
        scale: String(1 - dip * 0.03),
        opacity: 1 - dimmed * 0.55,
      }}
    >
      {ripple > 0 && ripple < 1 ? (
        <div
          style={{
            position: "absolute",
            width: 260,
            height: 260,
            borderRadius: 130,
            backgroundColor: C.ink,
            opacity: 0.12 * (1 - ripple),
            scale: String(mix(0.5, 1.4, ripple)),
          }}
        />
      ) : null}
      <span style={{ position: "relative" }}>{label}</span>
    </div>
  );
};

export const CheckCircle: React.FC<{ at: number; size?: number }> = ({
  at,
  size = 40,
}) => {
  const { p } = useTimeline();
  const pop = p(at, 0.35);
  const draw = p(at + 0.12, 0.3);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: C.lime,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        scale: String(pop),
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24">
        <path
          d="M4 12.5 L9.5 18 L20 6.5"
          fill="none"
          stroke={C.ink}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={26}
          strokeDashoffset={26 * (1 - draw)}
        />
      </svg>
    </div>
  );
};
