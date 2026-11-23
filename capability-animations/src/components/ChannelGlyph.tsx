import React from 'react';
import {Img, staticFile} from 'remotion';
import {colors} from '../tokens';

export type ChannelKind =
  | 'web'
  | 'whatsapp'
  | 'instagram'
  | 'voice'
  | 'sms'
  | 'email'
  | 'messenger'
  | 'more'
  // Source glyphs (Space Brain).
  | 'file'
  | 'table'
  | 'image'
  | 'folder'
  | 'book'
  | 'eye'
  | 'lock'
  // Trigger and run glyphs (Space Automate).
  | 'mail'
  | 'clock'
  | 'link'
  | 'hourglass'
  | 'restart'
  // Connect glyphs (Space Connect).
  | 'card'
  | 'plug'
  | 'shield';

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
  // Page with a folded corner and text lines.
  file: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </>
  ),
  // Grid.
  table: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17" />
      <path d="M3.5 14.5h17" />
      <path d="M10 9.5v10" />
    </>
  ),
  // Picture frame with a hill and sun.
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M20.5 16l-5-5L5 19.5" />
    </>
  ),
  // Folder.
  folder: <path d="M3.5 7a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />,
  // Open book.
  book: (
    <>
      <path d="M12 6.5c-1.6-1.3-4-2-7.5-2v13c3.5 0 5.9.7 7.5 2 1.6-1.3 4-2 7.5-2v-13c-3.5 0-5.9.7-7.5 2z" />
      <path d="M12 6.5v13" />
    </>
  ),
  // Eye.
  eye: (
    <>
      <path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  // Padlock.
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  // Envelope with a flap.
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </>
  ),
  // Clock face.
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  // Two chain links.
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </>
  ),
  // Hourglass.
  hourglass: (
    <>
      <path d="M6.5 3.5h11" />
      <path d="M6.5 20.5h11" />
      <path d="M7.5 3.5c0 4.5 4.5 5.5 4.5 8.5s-4.5 4-4.5 8.5" />
      <path d="M16.5 3.5c0 4.5-4.5 5.5-4.5 8.5s4.5 4 4.5 8.5" />
    </>
  ),
  // Circular arrow.
  restart: (
    <>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
      <path d="M4.5 4v4.5H9" />
    </>
  ),
  // Payment card.
  card: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 10h19" />
      <path d="M6.5 15h4" />
    </>
  ),
  // Plug.
  plug: (
    <>
      <path d="M9 3.5v4" />
      <path d="M15 3.5v4" />
      <path d="M6.5 7.5h11v3a5.5 5.5 0 0 1-11 0z" />
      <path d="M12 16v4.5" />
    </>
  ),
  // Shield.
  shield: (
    <path d="M12 3l7.5 3v6c0 4.5-3.2 7.6-7.5 9-4.3-1.4-7.5-4.5-7.5-9V6z" />
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

/**
 * Channels shown with their brand logo instead of a line glyph. The SVGs
 * live in public/logos (see SOURCE.md there) and load locally.
 */
const LOGOS: Partial<Record<ChannelKind, string>> = {
  whatsapp: 'logos/whatsapp.svg',
  instagram: 'logos/instagram.svg',
  messenger: 'logos/messenger.svg',
};

/**
 * 44px icon box. Brand logo channels get a white tile with a 1px border and
 * the logo centred at 26px, unaltered. Every other channel keeps its line
 * glyph on the grey box.
 */
export const ChannelIconBox: React.FC<{kind: ChannelKind; size?: number}> = ({kind, size = 44}) => {
  const logo = LOGOS[kind];
  if (logo) {
    const logoSize = Math.round((size * 26) / 44);
    return (
      <div
        style={{
          width: size,
          height: size,
          boxSizing: 'border-box',
          borderRadius: 12,
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Img src={staticFile(logo)} width={logoSize} height={logoSize} style={{display: 'block'}} />
      </div>
    );
  }
  return <GlyphBox kind={kind} size={size} />;
};

const GlyphBox: React.FC<{kind: ChannelKind; size: number}> = ({kind, size}) => (
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
