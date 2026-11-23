import React from 'react';
import {iconStroke} from '../tokens';

/**
 * Line icons drawn in a 24 unit box. Strokes use non scaling stroke, so a
 * 1.5px stroke stays 1.5px at any rendered size.
 */
type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

const Svg: React.FC<IconProps & {children: React.ReactNode}> = ({
  size = 14,
  color = 'currentColor',
  strokeWidth = iconStroke,
  children,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{display: 'block', flexShrink: 0, overflow: 'visible'}}
  >
    {React.Children.map(children, (child) =>
      React.isValidElement(child)
        ? React.cloneElement(child as React.ReactElement<{vectorEffect?: string}>, {
            vectorEffect: 'non-scaling-stroke',
          })
        : child,
    )}
  </svg>
);

/** Ask: message bubble. */
export const MessageIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M20.5 11.5a8.5 8.5 0 0 1-12.3 7.6L3.5 20.5l1.4-4.6A8.5 8.5 0 1 1 20.5 11.5z" />
  </Svg>
);

/** Tool: wrench. */
export const WrenchIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.8 3.8z" />
  </Svg>
);

/** If and Else if: branch. */
export const BranchIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M6 3v12" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M18 9a9 9 0 0 1-9 9" />
  </Svg>
);

/** Tell: speech arrow. */
export const SpeechArrowIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M15 17l5-5-5-5" />
    <path d="M4 18v-2a4 4 0 0 1 4-4h12" />
  </Svg>
);

/** Guardrails: shield. */
export const ShieldIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
  </Svg>
);

/** Send: arrow pointing up. */
export const ArrowUpIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 19V5" />
    <path d="M5 12l7-7 7 7" />
  </Svg>
);

/**
 * Tick that draws on by stroke. `draw` runs 0..1.
 */
export const TickIcon: React.FC<IconProps & {draw: number}> = ({
  size = 16,
  color = 'currentColor',
  strokeWidth = 2,
  draw,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{display: 'block', flexShrink: 0, overflow: 'visible'}}
  >
    <path
      d="M5 12.5l4.5 4.5L19 7.5"
      stroke={color}
      strokeWidth={strokeWidth}
      vectorEffect="non-scaling-stroke"
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - draw}
      opacity={draw > 0 ? 1 : 0}
    />
  </svg>
);

/** Integrate: users (CRM). */
export const UsersIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);

/** Integrate: calendar (Booking). */
export const CalendarIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="3" y="4.5" width="18" height="17" rx="2.5" />
    <path d="M8 2.5v4" />
    <path d="M16 2.5v4" />
    <path d="M3 10h18" />
  </Svg>
);

/** Integrate: credit card (Payments). */
export const CardIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
    <path d="M2.5 10h19" />
    <path d="M6.5 15h4" />
  </Svg>
);

/** Integrate: ticket (Ticketing). */
export const TicketIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M3 8.5a2.5 2.5 0 0 0 0 5V17a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3.5a2.5 2.5 0 0 1 0-5V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" />
    <path d="M14 5v2" />
    <path d="M14 11v2" />
    <path d="M14 17v2" />
  </Svg>
);

/** Collect: clipboard with lines. */
export const ClipboardIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="5" y="4.5" width="14" height="17" rx="2" />
    <path d="M9 3.5h6v3H9z" />
    <path d="M8.5 11h7" />
    <path d="M8.5 15h5" />
  </Svg>
);

/** Agent: small robot head. */
export const BotIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="4" y="8" width="16" height="12" rx="3" />
    <path d="M12 4v4" />
    <circle cx="9" cy="14" r="1" />
    <circle cx="15" cy="14" r="1" />
  </Svg>
);

/** Review: person with a tick. */
export const UserCheckIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M3 20a6 6 0 0 1 12 0" />
    <path d="M15.5 12l2 2 4-4" />
  </Svg>
);

/** Pause: two bars. */
export const PauseIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M9 6v12" />
    <path d="M15 6v12" />
  </Svg>
);
