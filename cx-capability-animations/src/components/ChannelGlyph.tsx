import React from 'react';
import {colors} from '../tokens';

export type ChannelKind =
  | 'web'
  | 'whatsapp'
  | 'instagram'
  | 'voice'
  | 'sms'
  | 'email'
  | 'messenger'
  | 'more';

/**
 * Generic channel glyphs: simple line drawings, no real logos or brand
 * colours. Drawn in a 24 unit box with a non scaling 1.75px stroke.
 */
const PATHS: Record<ChannelKind, React.ReactNode> = {
  // Chat window with a header bar.
  web: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M3 9h18" />
      <circle cx="6.5" cy="6.5" r="0.4" />
      <path d="M7 13.5h6" />
      <path d="M7 16.5h9" />
    </>
  ),
  // Round bubble with a small phone handset inside.
  whatsapp: (
    <>
      <path d="M20.5 12a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1.1-4.4A8.5 8.5 0 1 1 20.5 12z" />
      <path d="M9.2 8.6c.3-.3.8-.3 1 .1l.7 1.2c.2.3.1.7-.2.9l-.5.4c.4 1 1.2 1.8 2.2 2.3l.4-.5c.2-.3.6-.4.9-.2l1.2.7c.4.2.4.7.1 1l-.6.6c-.6.6-1.6.7-2.4.2a8 8 0 0 1-3.5-3.5c-.4-.8-.3-1.8.3-2.4z" />
    </>
  ),
  // Rounded square, circle and dot.
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="16.9" cy="7.1" r="0.5" />
    </>
  ),
  // Phone handset.
  voice: (
    <path d="M5.5 3.5h3l1.5 4-2 1.5a10 10 0 0 0 7 7l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 3.5 5.5a2 2 0 0 1 2-2z" />
  ),
  // Square bubble with three dots.
  sms: (
    <>
      <path d="M4 5h16a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 20 17H9l-4.5 3.5V17H4a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 4 5z" />
      <circle cx="8" cy="11" r="0.5" />
      <circle cx="12" cy="11" r="0.5" />
      <circle cx="16" cy="11" r="0.5" />
    </>
  ),
  // Envelope.
  email: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
    </>
  ),
  // Oval bubble with a small zigzag.
  messenger: (
    <>
      <path d="M12 3.5c4.8 0 8.5 3.5 8.5 8s-3.7 8-8.5 8c-.9 0-1.7-.1-2.5-.3L6 20.5v-3.2C4.4 15.8 3.5 13.8 3.5 11.5c0-4.5 3.7-8 8.5-8z" />
      <path d="M7.5 13.5l3-3 2.5 2 3.5-3" />
    </>
  ),
  // Plus.
  more: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
};

export const ChannelGlyph: React.FC<{kind: ChannelKind; size?: number; color?: string}> = ({
  kind,
  size = 22,
  color = colors.charcoal,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    // 1.75px on screen at any size.
    strokeWidth={(1.75 * 24) / size}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{display: 'block', flexShrink: 0, overflow: 'visible'}}
  >
    {PATHS[kind]}
  </svg>
);

/** 44px grey icon box holding a channel glyph. */
export const ChannelIconBox: React.FC<{kind: ChannelKind; size?: number}> = ({kind, size = 44}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 12,
      background: colors.greyPill,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <ChannelGlyph kind={kind} size={Math.round(size / 2)} />
  </div>
);
