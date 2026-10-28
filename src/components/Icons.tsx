import React from "react";
import { C, WA } from "../theme";

// Original line icons for the phone UI. None reproduce a brand mark.

const line = (color: string, width = 2) => ({
  fill: "none",
  stroke: color,
  strokeWidth: width,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

// Northbridge Payments (fictional): lime disc with an ink "N" whose last
// stroke ends in an arrow. Deliberately unlike the BotCircuits mark.
export const AgentAvatar: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="50" fill={C.lime} />
    <path d="M31 70 V32 L66 68 V33" {...line(C.ink, 9)} />
    <path d="M56 42 L66 31 L76 42" {...line(C.ink, 9)} />
  </svg>
);

export const StatusIcons: React.FC = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    {/* Signal bars */}
    <svg width={36} height={24} viewBox="0 0 36 24">
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={i * 9}
          y={18 - i * 5}
          width={6.5}
          height={6 + i * 5}
          rx={1.5}
          fill={C.ink}
        />
      ))}
    </svg>
    {/* Wifi */}
    <svg width={32} height={24} viewBox="0 0 32 24">
      <path d="M16 22 L11 16.5 A7 7 0 0 1 21 16.5 Z" fill={C.ink} />
      <path d="M5.5 11 A15 15 0 0 1 26.5 11" {...line(C.ink, 3.4)} />
      <path d="M1.5 6 A21 21 0 0 1 30.5 6" {...line(C.ink, 3.4)} />
    </svg>
    {/* Battery */}
    <svg width={52} height={24} viewBox="0 0 52 24">
      <rect
        x="1"
        y="2"
        width="44"
        height="20"
        rx="6"
        fill="none"
        stroke={C.ink}
        strokeOpacity={0.4}
        strokeWidth={2}
      />
      <rect x="4" y="5" width="34" height="14" rx="3.5" fill={C.ink} />
      <rect
        x="47.5"
        y="8.5"
        width="3"
        height="7"
        rx="1.5"
        fill={C.ink}
        opacity={0.4}
      />
    </svg>
  </div>
);

export const ChevronLeft: React.FC<{ color?: string }> = ({
  color = WA.green,
}) => (
  <svg width={30} height={48} viewBox="0 0 15 24">
    <path d="M12 2 L3 12 L12 22" {...line(color, 2.6)} />
  </svg>
);

export const VideoIcon: React.FC<{ color?: string }> = ({
  color = WA.green,
}) => (
  <svg width={52} height={52} viewBox="0 0 24 24">
    <rect x="2" y="6" width="13.5" height="12" rx="3" {...line(color, 1.8)} />
    <path d="M15.5 10.5 L21.5 7 V17 L15.5 13.5" {...line(color, 1.8)} />
  </svg>
);

export const PhoneIcon: React.FC<{ color?: string; size?: number }> = ({
  color = WA.green,
  size = 44,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M6.6 3.5 L9.2 3.9 L10.4 8.4 L8.4 10.1 C9.5 12.4 11.6 14.5 13.9 15.6 L15.6 13.6 L20.1 14.8 L20.5 17.4 C20.6 18.7 19.5 20.6 17.8 20.5 C10.2 20 4 13.8 3.5 6.2 C3.4 4.5 5.3 3.4 6.6 3.5 Z"
      {...line(color, 1.8)}
    />
  </svg>
);

export const PlusIcon: React.FC<{ color?: string; size?: number }> = ({
  color = WA.green,
  size = 46,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 4 V20 M4 12 H20" {...line(color, 2.2)} />
  </svg>
);

export const StickerIcon: React.FC = () => (
  <svg width={40} height={40} viewBox="0 0 24 24">
    <path
      d="M4 6 A2 2 0 0 1 6 4 H18 A2 2 0 0 1 20 6 V13 L13 20 H6 A2 2 0 0 1 4 18 Z"
      {...line(C.ink, 1.7)}
    />
    <path d="M20 13 H15 A2 2 0 0 0 13 15 V20" {...line(C.ink, 1.7)} />
  </svg>
);

export const CameraIcon: React.FC<{ color?: string; size?: number }> = ({
  color = C.ink,
  size = 46,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M3 8.5 A2 2 0 0 1 5 6.5 H7.5 L9 4.5 H15 L16.5 6.5 H19 A2 2 0 0 1 21 8.5 V17.5 A2 2 0 0 1 19 19.5 H5 A2 2 0 0 1 3 17.5 Z"
      {...line(color, 1.7)}
    />
    <circle cx="12" cy="13" r="3.6" {...line(color, 1.7)} />
  </svg>
);

export const MicIcon: React.FC = () => (
  <svg width={44} height={44} viewBox="0 0 24 24">
    <rect x="9" y="3" width="6" height="11" rx="3" {...line(C.ink, 1.7)} />
    <path
      d="M5.5 11 A6.5 6.5 0 0 0 18.5 11 M12 17.5 V21"
      {...line(C.ink, 1.7)}
    />
  </svg>
);

export const ReplyArrow: React.FC = () => (
  <svg width={30} height={30} viewBox="0 0 24 24">
    <path d="M10 6 L4 12 L10 18" {...line(WA.replyBlue, 2)} />
    <path d="M4 12 H14 A6 6 0 0 1 20 18" {...line(WA.replyBlue, 2)} />
  </svg>
);

// Document icon used in file bubbles.
export const DocIcon: React.FC<{ type: string }> = ({ type }) => (
  <svg width={60} height={74} viewBox="0 0 30 37">
    <path
      d="M3 1 H20 L28 9 V34 A2 2 0 0 1 26 36 H3 A2 2 0 0 1 1 34 V3 A2 2 0 0 1 3 1 Z"
      fill="#FFFFFF"
      stroke="#D5D9DD"
      strokeWidth={1.2}
    />
    <path
      d="M20 1 V7 A2 2 0 0 0 22 9 H28"
      fill="#EEF0F2"
      stroke="#D5D9DD"
      strokeWidth={1.2}
    />
    <rect x="1" y="22" width="20" height="9" rx="1.5" fill="#E5484D" />
    <text
      x="11"
      y="29"
      textAnchor="middle"
      fontSize="6.5"
      fontWeight="700"
      fill="#FFFFFF"
      fontFamily="Inter, sans-serif"
    >
      {type}
    </text>
  </svg>
);

// Tab bar icons.
export const TabIcon: React.FC<{
  name: "updates" | "calls" | "communities" | "chats" | "settings";
  color: string;
  filled?: boolean;
}> = ({ name, color, filled }) => {
  const st = line(color, 1.6);
  return (
    <svg width={50} height={50} viewBox="0 0 24 24">
      {name === "updates" ? (
        <>
          <circle cx="12" cy="12" r="8.5" {...st} strokeDasharray="5 2.2" />
          <circle cx="12" cy="12" r="4.5" {...st} />
        </>
      ) : null}
      {name === "calls" ? (
        <path
          d="M6.6 3.5 L9.2 3.9 L10.4 8.4 L8.4 10.1 C9.5 12.4 11.6 14.5 13.9 15.6 L15.6 13.6 L20.1 14.8 L20.5 17.4 C20.6 18.7 19.5 20.6 17.8 20.5 C10.2 20 4 13.8 3.5 6.2 C3.4 4.5 5.3 3.4 6.6 3.5 Z"
          {...st}
        />
      ) : null}
      {name === "communities" ? (
        <>
          <circle cx="12" cy="8" r="3" {...st} />
          <path d="M6.5 18 A5.5 5.5 0 0 1 17.5 18" {...st} />
          <circle cx="5" cy="10" r="2.2" {...st} />
          <circle cx="19" cy="10" r="2.2" {...st} />
          <path
            d="M1.5 17 A3.6 3.6 0 0 1 5 13.8 M22.5 17 A3.6 3.6 0 0 0 19 13.8"
            {...st}
          />
        </>
      ) : null}
      {name === "chats" ? (
        <path
          d="M12 3.5 C17 3.5 20.5 6.8 20.5 11 C20.5 15.2 17 18.5 12 18.5 C10.8 18.5 9.7 18.3 8.7 18 L4.5 20 L5.4 16.2 C4.2 14.8 3.5 13 3.5 11 C3.5 6.8 7 3.5 12 3.5 Z"
          fill={filled ? color : "none"}
          stroke={color}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      ) : null}
      {name === "settings" ? (
        <>
          <circle cx="12" cy="12" r="3.2" {...st} />
          <path
            d="M12 2.8 L13.6 5.2 L16.4 4.4 L16.9 7.1 L19.6 7.6 L18.8 10.4 L21.2 12 L18.8 13.6 L19.6 16.4 L16.9 16.9 L16.4 19.6 L13.6 18.8 L12 21.2 L10.4 18.8 L7.6 19.6 L7.1 16.9 L4.4 16.4 L5.2 13.6 L2.8 12 L5.2 10.4 L4.4 7.6 L7.1 7.1 L7.6 4.4 L10.4 5.2 Z"
            {...st}
          />
        </>
      ) : null}
    </svg>
  );
};

export const DoubleTick: React.FC<{ color?: string; size?: number }> = ({
  color = WA.tick,
  size = 36,
}) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 34 20">
    <path d="M1.5 10.5 L6.5 15.5 L17.5 4" {...line(color, 2.4)} />
    <path d="M10 13 L12.5 15.5 L24 4" {...line(color, 2.4)} />
  </svg>
);

// Payment journey node icons (monoline).
export const JourneyIcon: React.FC<{
  name: "bank" | "exchange" | "store";
  size?: number;
}> = ({ name, size = 64 }) => {
  const st = line(C.ink, 1.5);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {name === "bank" ? (
        <>
          <path d="M3 9 L12 4 L21 9 Z" {...st} />
          <path
            d="M6 11 V16.5 M10 11 V16.5 M14 11 V16.5 M18 11 V16.5"
            {...st}
          />
          <path d="M4 18.5 H20 M3 20.5 H21" {...st} />
        </>
      ) : null}
      {name === "exchange" ? (
        <>
          <path d="M4 8 H19 M15 4 L19 8 L15 12" {...st} />
          <path d="M20 16 H5 M9 12 L5 16 L9 20" {...st} />
        </>
      ) : null}
      {name === "store" ? (
        <>
          <path d="M4.5 4 H19.5 L21 9 H3 Z" {...st} />
          <path
            d="M3 9 A3 3 0 0 0 9 9 A3 3 0 0 0 15 9 A3 3 0 0 0 21 9"
            {...st}
          />
          <path d="M5 11.5 V20 H19 V11.5" {...st} />
          <path d="M10 20 V15 H14 V20" {...st} />
        </>
      ) : null}
    </svg>
  );
};
