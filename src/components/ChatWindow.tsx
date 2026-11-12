import React from 'react';
import {COLORS, FONT_MONO, FONT_SANS} from '../theme';
import {COMPOSER, HEADER_H, WINDOW, ROW_X, BUBBLE_X, AVATAR} from '../layout';
import {Avatar} from './Bubble';

export type ChatWindowProps = {
  /** 0 -> 1 entrance: fade + rise 24px. */
  enter: number;
  /** Opacity of the window chrome (surface, header, composer). */
  chromeOpacity: number;
  /** Agent presence block in the header (0 hidden -> 1 visible). */
  agentPresence: number;
  /** 0 = Online, 1 = Away. */
  away: number;
  /** World y of the composer's top edge. */
  composerY: number;
  /** "Support Agent · Away" line above the composer (0 -> 1). */
  presenceLine: number;
  /** Dim level of the SA avatars (0 = normal, 1 = dim). */
  agentDim: number;
  /** Thread content (bubbles); NOT affected by chromeOpacity. */
  children?: React.ReactNode;
};

const StatusDot: React.FC<{away: number; size?: number}> = ({away, size = 12}) => (
  <span style={{position: 'relative', display: 'inline-block', width: size, height: size}}>
    <span
      style={{position: 'absolute', inset: 0, borderRadius: size, background: COLORS.white, opacity: 1 - away}}
    />
    <span
      style={{position: 'absolute', inset: 0, borderRadius: size, background: COLORS.muted, opacity: away}}
    />
  </span>
);

/**
 * The oversized chat window. Positioned in world space; the camera crops it.
 * The same instance lives across scenes 1-3 (rendered once by ThreadStage).
 */
export const ChatWindow: React.FC<ChatWindowProps> = ({
  enter,
  chromeOpacity,
  agentPresence,
  away,
  composerY,
  presenceLine,
  agentDim,
  children,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: WINDOW.x,
        top: WINDOW.y,
        width: WINDOW.width,
        height: WINDOW.height,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 24}px)`,
      }}
    >
      {/* chrome */}
      <div style={{position: 'absolute', inset: 0, opacity: chromeOpacity}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: WINDOW.radius,
            background: 'rgba(11,13,12,0.82)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 60px 160px rgba(0,0,0,0.45)',
          }}
        />
        {/* header */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: WINDOW.width,
            height: HEADER_H,
            borderRadius: `${WINDOW.radius}px ${WINDOW.radius}px 0 0`,
            background: 'rgba(23,25,26,0.55)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <Avatar
            initials="M"
            speaker="customer"
            size={AVATAR}
            style={{position: 'absolute', left: ROW_X, top: (HEADER_H - AVATAR) / 2}}
          />
          <div style={{position: 'absolute', left: BUBBLE_X, top: 30, fontFamily: FONT_SANS}}>
            <div style={{color: COLORS.white, fontSize: 40, fontWeight: 600, lineHeight: '48px'}}>Maya</div>
            <div style={{color: COLORS.muted, fontSize: 28, fontWeight: 400, lineHeight: '40px'}}>Online</div>
          </div>

          {/* agent presence */}
          <div
            style={{
              position: 'absolute',
              left: 1160,
              top: 40,
              height: 70,
              display: 'flex',
              alignItems: 'center',
              gap: 22,
              opacity: agentPresence,
              transform: `translateY(${(1 - agentPresence) * 12}px)`,
              fontFamily: FONT_SANS,
            }}
          >
            <Avatar initials="SA" speaker="agent" size={68} dim={agentDim} />
            <div>
              <div style={{color: COLORS.white, fontSize: 30, fontWeight: 500, lineHeight: '38px'}}>
                Support Agent
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 12, height: 34}}>
                <StatusDot away={away} />
                <span style={{position: 'relative', display: 'inline-block', width: 120, height: 34, overflow: 'hidden'}}>
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      fontSize: 26,
                      lineHeight: '34px',
                      color: COLORS.mist,
                      opacity: 1 - away,
                      transform: `translateY(${-away * 14}px)`,
                    }}
                  >
                    Online
                  </span>
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      fontSize: 26,
                      lineHeight: '34px',
                      color: COLORS.muted,
                      opacity: away,
                      transform: `translateY(${(1 - away) * 14}px)`,
                    }}
                  >
                    Away
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* presence line + composer (slide down as the thread grows) */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transform: `translateY(${composerY}px)`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: ROW_X,
              top: -70,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              opacity: presenceLine,
              fontFamily: FONT_SANS,
              fontSize: 26,
              color: COLORS.muted,
              whiteSpace: 'nowrap',
            }}
          >
            <Avatar initials="SA" speaker="agent" size={44} dim={1} />
            <span>Support Agent</span>
            <StatusDot away={1} size={10} />
            <span style={{fontFamily: FONT_MONO, fontSize: 24}}>Away</span>
          </div>
          <div
            style={{
              position: 'absolute',
              left: COMPOSER.x,
              top: 0,
              width: COMPOSER.width,
              height: COMPOSER.height,
              borderRadius: COMPOSER.height / 2,
              background: 'rgba(23,25,26,0.7)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 48,
              fontFamily: FONT_SANS,
              fontSize: 34,
              color: COLORS.muted,
            }}
          >
            Message
          </div>
        </div>
      </div>

      {/* thread */}
      {children}
    </div>
  );
};
