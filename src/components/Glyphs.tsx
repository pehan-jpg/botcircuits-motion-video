import React from 'react';

/**
 * Coloured line glyphs drawn in code (capabilities, procedure nodes and the
 * three channels that have no brand logo). 24x24 viewBox, round caps.
 */
type G = {size: number; color: string; stroke?: number; draw?: number; style?: React.CSSProperties};

const Svg: React.FC<G & {children: React.ReactNode}> = ({size, color, stroke = 2, style, children}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{display: 'block', overflow: 'visible', ...style}}
  >
    {children}
  </svg>
);

/** Path drawn with stroke-dashoffset (draw 0..1). */
const D: React.FC<{d: string; draw?: number}> = ({d, draw = 1}) => (
  <path d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} opacity={draw > 0 ? 1 : 0} />
);

// capabilities ------------------------------------------------------------------
export const GDocument: React.FC<G> = (p) => (
  <Svg {...p}>
    <path d="M6 2.8h8l4.5 4.5V20a1.2 1.2 0 0 1-1.2 1.2H6A1.2 1.2 0 0 1 4.8 20V4A1.2 1.2 0 0 1 6 2.8z" />
    <path d="M14 2.8v4.5h4.5M8.5 12h7M8.5 16h5" />
  </Svg>
);
export const GWrench: React.FC<G> = (p) => (
  <Svg {...p}>
    <path d="M14.8 3.4a5 5 0 0 0-5.9 6.6L3.4 15.5a2 2 0 0 0 2.8 2.8l5.5-5.5a5 5 0 0 0 6.6-5.9l-3 3-2.6-.6-.6-2.6z" />
  </Svg>
);
export const GSpark: React.FC<G> = (p) => (
  <Svg {...p}>
    <path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z" />
    <path d="M19 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
  </Svg>
);
export const GBolt: React.FC<G> = (p) => (
  <Svg {...p}>
    <path d="M13.2 2.5L5 13.5h6l-1.2 8 8.2-11h-6z" />
  </Svg>
);

// procedure nodes ---------------------------------------------------------------
export const GChat: React.FC<G> = (p) => (
  <Svg {...p}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z" />
    <path d="M8.5 9.5h.01M12 9.5h.01M15.5 9.5h.01" strokeWidth={2.8} />
  </Svg>
);
/** Chat bubble outline without dots (dots are animated separately). */
export const GChatBubble: React.FC<G> = (p) => (
  <Svg {...p}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z" />
  </Svg>
);
export const GShieldCheck: React.FC<G> = (p) => (
  <Svg {...p}>
    <path d="M12 2.8l7.5 3v5.6c0 4.6-3.2 8.3-7.5 9.8-4.3-1.5-7.5-5.2-7.5-9.8V5.8z" />
    <D d="M8.6 12.2l2.4 2.4 4.6-4.8" draw={p.draw} />
  </Svg>
);
/** Lock whose shackle closes with a stroke animation (draw 0 open -> 1 closed). */
export const GLock: React.FC<G> = (p) => (
  <Svg {...p}>
    <rect x="4.5" y="10.5" width="15" height="10.5" rx="2.4" />
    <path d="M12 14.6v2.4" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0" />
    <D d="M16 7.5v3" draw={p.draw} />
  </Svg>
);
export const GCheck: React.FC<G> = (p) => (
  <Svg {...p}>
    <D d="M4.5 12.5l4.8 4.8L19.5 7" draw={p.draw} />
  </Svg>
);
export const GPerson: React.FC<G> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 21c0-4.2 3.4-7 7.5-7s7.5 2.8 7.5 7" />
  </Svg>
);

// drawn channels ----------------------------------------------------------------
export const GWebChat: React.FC<G> = (p) => (
  <Svg {...p}>
    <rect x="2.8" y="4" width="18.4" height="13" rx="3" />
    <path d="M8 17l-1 4 5-4" />
    <path d="M7.5 9.5h9M7.5 12.5h6" />
  </Svg>
);
export const GWaveform: React.FC<G> = (p) => (
  <Svg {...p}>
    <path d="M3.5 10.5v3M7.5 7v10M11.5 3.5v17M15.5 7.5v9M19.5 10v4" />
  </Svg>
);
export const GPhone: React.FC<G> = (p) => (
  <Svg {...p}>
    <rect x="6.5" y="2.5" width="11" height="19" rx="2.6" />
    <path d="M10.5 18.3h3" />
  </Svg>
);
/** Generic placeholders for logos without an available asset. */
export const GHash: React.FC<G> = (p) => (
  <Svg {...p}>
    <path d="M9 3.5L7 20.5M17 3.5l-2 17M4 8.5h16.5M3.5 15.5H20" />
  </Svg>
);
export const GCloud: React.FC<G> = (p) => (
  <Svg {...p}>
    <path d="M7 18.5a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.3 1.5A3.8 3.8 0 0 1 17.2 18.5z" />
  </Svg>
);
