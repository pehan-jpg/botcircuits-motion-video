import React from "react";
import { interpolateColors } from "remotion";
import { useTimeline, mix, typedCount } from "../anim";
import { CHAT_HEADER } from "../content";
import { C, FONT, PHONE, R, SCREEN, WA } from "../theme";
import {
  AgentAvatar,
  CameraIcon,
  ChevronLeft,
  DocIcon,
  MicIcon,
  PhoneIcon,
  PlusIcon,
  ReplyArrow,
  StatusIcons,
  StickerIcon,
  VideoIcon,
} from "./Icons";

// iOS style messaging UI matched to the reference screens. Icons are
// original drawings; no official logo or brand asset is used.

// ---------------------------------------------------------------------------
// Phone screen: status bar and home indicator over the current screen(s).

export const PhoneScreen: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      position: "relative",
      width: SCREEN.width,
      height: SCREEN.height,
      borderRadius: R.phone - PHONE.border,
      overflow: "hidden",
      backgroundColor: C.bg,
      fontFamily: FONT,
      color: C.ink,
      fontVariantNumeric: "tabular-nums",
    }}
  >
    {children}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: PHONE.statusBar,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 52px 0 76px",
        pointerEvents: "none",
      }}
    >
      <div style={{ fontSize: 33, fontWeight: 600, letterSpacing: -0.5 }}>
        9:41
      </div>
      <StatusIcons />
    </div>
    <div
      style={{
        position: "absolute",
        bottom: 14,
        left: (SCREEN.width - 270) / 2,
        width: 270,
        height: 10,
        borderRadius: 5,
        backgroundColor: C.ink,
      }}
    />
  </div>
);

// ---------------------------------------------------------------------------
// Conversation screen

// Header avatar geometry, shared with the avatar that flies in from the list.
export const HEADER_AVATAR = {
  size: 72,
  x: 66,
  y: PHONE.statusBar + (PHONE.headerHeight - 72) / 2,
};

const Header: React.FC<{ avatarVisible: boolean }> = ({ avatarVisible }) => (
  <div
    style={{
      position: "relative",
      height: PHONE.statusBar + PHONE.headerHeight,
      flexShrink: 0,
      backgroundColor: WA.bar,
      borderBottom: `1px solid ${WA.hairline}`,
    }}
  >
    <div style={{ position: "absolute", left: 22, top: PHONE.statusBar + 28 }}>
      <ChevronLeft />
    </div>
    <div
      style={{
        position: "absolute",
        left: HEADER_AVATAR.x,
        top: HEADER_AVATAR.y,
        opacity: avatarVisible ? 1 : 0,
      }}
    >
      <AgentAvatar size={HEADER_AVATAR.size} />
    </div>
    <div
      style={{
        position: "absolute",
        left: HEADER_AVATAR.x + HEADER_AVATAR.size + 18,
        top: PHONE.statusBar + 16,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <div style={{ fontSize: 31, fontWeight: 600, letterSpacing: -0.4 }}>
        {CHAT_HEADER.name}
      </div>
      <div style={{ fontSize: 21, fontWeight: 400, color: WA.listGrey }}>
        {CHAT_HEADER.status}
      </div>
    </div>
    <div
      style={{
        position: "absolute",
        right: 30,
        top: PHONE.statusBar + 26,
        display: "flex",
        gap: 34,
        alignItems: "center",
      }}
    >
      <VideoIcon />
      <PhoneIcon />
    </div>
  </div>
);

const InputBar: React.FC<{ flashes: number[] }> = ({ flashes }) => {
  const { since } = useTimeline();
  // The attach (plus) button flashes once when a file is sent.
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
        height: PHONE.inputHeight + PHONE.homeArea,
        flexShrink: 0,
        display: "flex",
        alignItems: "flex-start",
        gap: 20,
        padding: "20px 26px 0 22px",
        backgroundColor: WA.bar,
        borderTop: `1px solid ${WA.hairline}`,
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: `rgba(33, 192, 99, ${flash * 0.18})`,
          scale: String(1 + flash * 0.08),
        }}
      >
        <PlusIcon />
      </div>
      <div
        style={{
          flex: 1,
          height: 62,
          borderRadius: 31,
          backgroundColor: C.bg,
          border: `1px solid ${WA.hairline}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "0 14px",
        }}
      >
        <StickerIcon />
      </div>
      <div
        style={{ display: "flex", gap: 22, alignItems: "center", height: 60 }}
      >
        <CameraIcon />
        <MicIcon />
      </div>
    </div>
  );
};

export const CHAT_AREA_HEIGHT =
  SCREEN.height -
  PHONE.statusBar -
  PHONE.headerHeight -
  PHONE.inputHeight -
  PHONE.homeArea;

// Low contrast doodle wallpaper built from simple original shapes.
const Wallpaper: React.FC = () => (
  <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
    <defs>
      <pattern
        id="doodles"
        width="220"
        height="220"
        patternUnits="userSpaceOnUse"
      >
        <g
          fill="none"
          stroke={WA.doodle}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="34" cy="36" r="16" />
          <path d="M28 36 H40 M34 30 V42" />
          <path d="M92 22 l8 16 l18 2 l-13 12 l3 18 l-16 -9 l-16 9 l3 -18 l-13 -12 l18 -2 Z" />
          <rect x="160" y="22" width="40" height="28" rx="8" />
          <path d="M168 50 l-6 10 l14 -10" />
          <path d="M20 120 q18 -24 36 0 t36 0" />
          <circle cx="150" cy="110" r="10" />
          <circle cx="178" cy="128" r="6" />
          <path d="M120 170 l14 -14 l14 14 l-14 14 Z" />
          <path d="M40 186 h30 M40 198 h18" />
          <path d="M190 180 a14 14 0 1 1 -28 0 q14 -8 28 0" />
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill={WA.wallpaper} />
    <rect width="100%" height="100%" fill="url(#doodles)" />
  </svg>
);

export const Conversation: React.FC<{
  children: React.ReactNode;
  attachFlashes?: number[];
  // Depth of field: blurs the header and input bar (px).
  edgeBlur?: number;
  avatarVisible?: boolean;
}> = ({ children, attachFlashes = [], edgeBlur = 0, avatarVisible = true }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      backgroundColor: WA.wallpaper,
    }}
  >
    <div style={{ filter: edgeBlur > 0 ? `blur(${edgeBlur}px)` : undefined }}>
      <Header avatarVisible={avatarVisible} />
    </div>
    <div
      style={{
        position: "relative",
        height: CHAT_AREA_HEIGHT,
        overflow: "hidden",
      }}
    >
      <Wallpaper />
      {children}
    </div>
    <div style={{ filter: edgeBlur > 0 ? `blur(${edgeBlur}px)` : undefined }}>
      <InputBar flashes={attachFlashes} />
    </div>
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
  const color = interpolateColors(read, [0, 1], [WA.tickGrey, WA.tick]);
  return (
    <svg width={34} height={20} viewBox="0 0 34 20" style={{ marginLeft: 6 }}>
      <path
        d="M2 10.5 L7 15.5 L18 4"
        fill="none"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 15.5 L23.5 4"
        fill="none"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeDasharray={16}
        strokeDashoffset={16 * (1 - second)}
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
      marginTop: 4,
      fontSize: 20,
      fontWeight: 400,
      color: WA.time,
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
      height={24}
      viewBox="0 0 20 24"
      style={{ position: "absolute", right: -13, bottom: 0 }}
    >
      <path d="M0 0 C1 14 6 20 18 24 L0 24 Z" fill={WA.bubbleOut} />
    </svg>
  ) : (
    <svg
      width={20}
      height={24}
      viewBox="0 0 20 24"
      style={{ position: "absolute", left: -13, bottom: 0 }}
    >
      <path d="M20 0 C19 14 14 20 2 24 L20 24 Z" fill={C.bg} />
    </svg>
  );

// Chat bubble. Hidden (but laid out) until `at`, then scales in from the
// tail. `footer` renders below the bubble (quick reply buttons).
export const Bubble: React.FC<{
  side: "in" | "out";
  at: number;
  width?: number;
  padding?: string;
  blur?: number;
  footer?: React.ReactNode;
  children: React.ReactNode;
}> = ({
  side,
  at,
  width,
  padding = "14px 22px 10px",
  blur = 0,
  footer,
  children,
}) => {
  const { p } = useTimeline();
  const e = p(at, 0.33);
  const out = side === "out";
  return (
    <div
      style={{
        alignSelf: out ? "flex-end" : "flex-start",
        width,
        maxWidth: 620,
        marginLeft: out ? 0 : 14,
        marginRight: out ? 14 : 0,
        opacity: e,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
        scale: String(mix(0.92, 1, e)),
        transformOrigin: out ? "100% 100%" : "0% 100%",
        visibility: e <= 0 ? "hidden" : "visible",
      }}
    >
      <div
        style={{
          position: "relative",
          padding,
          backgroundColor: out ? WA.bubbleOut : C.bg,
          borderRadius: R.bubble,
          borderBottomRightRadius: out ? 0 : R.bubble,
          borderBottomLeftRadius: out ? R.bubble : 0,
          fontSize: 30,
          lineHeight: 1.32,
          fontWeight: 400,
          boxShadow: "0 1px 1px rgba(11, 20, 26, 0.13)",
        }}
      >
        <Tail side={side} />
        {children}
      </div>
      {footer}
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
              backgroundColor: WA.tickGrey,
              opacity: 0.45 + lift * 0.45,
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

// Document message: file icon, name, then "PDF · 218 KB".
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
      gap: 18,
      padding: "14px 22px 14px 14px",
      borderRadius: 12,
      backgroundColor: tone === "out" ? "rgba(11, 20, 26, 0.05)" : "#F5F6F6",
      width: 470,
    }}
  >
    <DocIcon type={type} />
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: -0.3 }}>
        {name}
      </div>
      <div style={{ fontSize: 22, color: WA.time, fontWeight: 400 }}>
        {meta}
      </div>
    </div>
  </div>
);

// Business message body row: label and extracted value.
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
          borderTop: `1px solid ${WA.separator}`,
        }}
      >
        <div
          style={{ fontSize: 24, color: WA.time, fontWeight: 400, opacity: e }}
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
}) => <div style={{ marginTop: 10 }}>{children}</div>;

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

// Quick reply button: a separate white bar below the bubble with blue text.
// Taps show a ripple and a 3 percent dip.
export const QuickReply: React.FC<{
  label: string;
  tapAt?: number;
  dimmed?: number;
  // Hidden while the button is away as the payment orb.
  hidden?: boolean;
  ref?: React.Ref<HTMLDivElement>;
}> = ({ label, tapAt, dimmed = 0, hidden = false, ref }) => {
  const { since } = useTimeline();
  const s = tapAt === undefined ? -1 : since(tapAt);
  const ripple = s >= 0 && s <= 0.4 ? s / 0.4 : s > 0.4 ? 1 : 0;
  const dip = s >= 0 && s <= 0.26 ? Math.sin((s / 0.26) * Math.PI) : 0;
  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        marginTop: 5,
        height: 76,
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        fontSize: 28,
        fontWeight: 500,
        color: WA.replyBlue,
        backgroundColor: C.bg,
        boxShadow: "0 1px 1px rgba(11, 20, 26, 0.13)",
        scale: String(1 - dip * 0.03),
        opacity: hidden ? 0 : 1 - dimmed * 0.5,
      }}
    >
      {ripple > 0 && ripple < 1 ? (
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: 150,
            backgroundColor: C.ink,
            opacity: 0.12 * (1 - ripple),
            scale: String(mix(0.5, 1.4, ripple)),
          }}
        />
      ) : null}
      <ReplyArrow />
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
