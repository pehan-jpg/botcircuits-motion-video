import React from 'react';

/**
 * Generic line icons (placeholders). Brand channel and system icons will be
 * swapped in later; these are deliberately neutral glyphs.
 */
type IconProps = {size?: number; color?: string; stroke?: number; style?: React.CSSProperties};

const Svg: React.FC<IconProps & {children: React.ReactNode}> = ({size = 24, color = 'currentColor', stroke = 1.8, style, children}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{display: 'block', flexShrink: 0, ...style}}
  >
    {children}
  </svg>
);

export const IconPencil: React.FC<IconProps> = (p) => (
  <Svg {...p}><path d="M4 20h4L19 9l-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" /></Svg>
);
export const IconUndo: React.FC<IconProps> = (p) => (
  <Svg {...p}><path d="M9 14L4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></Svg>
);
export const IconRedo: React.FC<IconProps> = (p) => (
  <Svg {...p}><path d="M15 14l5-5-5-5" /><path d="M20 9H10a6 6 0 0 0 0 12h3" /></Svg>
);
export const IconClose: React.FC<IconProps> = (p) => (
  <Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>
);
export const IconReturn: React.FC<IconProps> = (p) => (
  <Svg {...p}><path d="M20 5v7a3 3 0 0 1-3 3H5" /><path d="M9 11l-4 4 4 4" /></Svg>
);
/** Abstract person: circle and shoulders, no face. */
export const IconPerson: React.FC<IconProps> = (p) => (
  <Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></Svg>
);

// ---- systems ----------------------------------------------------------------
export const IconCard: React.FC<IconProps> = (p) => (
  <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3 10h18M7 15h4" /></Svg>
);
export const IconDatabase: React.FC<IconProps> = (p) => (
  <Svg {...p}><ellipse cx="12" cy="5.5" rx="7.5" ry="2.8" /><path d="M4.5 5.5v13c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-13" /><path d="M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8" /></Svg>
);
export const IconBook: React.FC<IconProps> = (p) => (
  <Svg {...p}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" /></Svg>
);
export const IconBank: React.FC<IconProps> = (p) => (
  <Svg {...p}><path d="M3 9.5L12 4l9 5.5" /><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18" /></Svg>
);
export const IconUsers: React.FC<IconProps> = (p) => (
  <Svg {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2.1.8 3.5 2.8 3.5 5.7" /></Svg>
);
export const IconPayments: React.FC<IconProps> = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M14.8 9.2c-.6-.9-1.6-1.4-2.8-1.4-1.7 0-2.8.9-2.8 2.1 0 2.9 5.7 1.6 5.7 4.4 0 1.2-1.2 2.1-2.9 2.1-1.3 0-2.4-.6-2.9-1.5M12 6v1.8M12 16.4V18" /></Svg>
);

// ---- channels ---------------------------------------------------------------
export const IconWebChat: React.FC<IconProps> = (p) => (
  <Svg {...p}><rect x="3" y="4" width="18" height="16" rx="2.5" /><path d="M3 8.5h18" /><path d="M7 13h7M7 16h4" /></Svg>
);
export const IconChatPhone: React.FC<IconProps> = (p) => (
  <Svg {...p}><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" /><path d="M9 9.5c.3 2.4 2.1 4.2 4.5 4.5l1-1.2 1.8.8-.4 1.6c-3.6.3-7.2-3.3-6.9-6.9l1.6-.4.8 1.8z" /></Svg>
);
export const IconBolt: React.FC<IconProps> = (p) => (
  <Svg {...p}><path d="M12 3C7 3 3 6.7 3 11.3c0 2.6 1.3 4.9 3.3 6.4V21l3-1.7c.9.3 1.8.4 2.7.4 5 0 9-3.7 9-8.4S17 3 12 3z" /><path d="M7.5 13.5l3-3.2 2.2 2 3.8-3.6" /></Svg>
);
export const IconCameraSquare: React.FC<IconProps> = (p) => (
  <Svg {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.6" /></Svg>
);
export const IconWave: React.FC<IconProps> = (p) => (
  <Svg {...p}><path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4" /></Svg>
);
export const IconPhone: React.FC<IconProps> = (p) => (
  <Svg {...p}><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" /><path d="M10.5 18.5h3" /></Svg>
);
export const IconHash: React.FC<IconProps> = (p) => (
  <Svg {...p}><path d="M9 3L7 21M17 3l-2 18M4 8.5h16.5M3.5 15.5H20" /></Svg>
);
export const IconPlane: React.FC<IconProps> = (p) => (
  <Svg {...p}><path d="M21 3L3 10.5l7 2.5 2.5 7z" /><path d="M10 13l11-10" /></Svg>
);
