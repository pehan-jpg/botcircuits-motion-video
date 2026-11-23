import React from 'react';
import {colors, fontFamily, fontWeights, shadows} from '../../tokens';
import {ArrowUpIcon} from '../../components/Icons';

export const COMPOSER = {width: 880, height: 72, padX: 28, send: 44, sendPad: 14, fontSize: 20} as const;

/** 44px charcoal send button with a white up arrow. */
export const SendButton: React.FC<{background?: string}> = ({background = colors.charcoal}) => (
  <div
    style={{
      width: COMPOSER.send,
      height: COMPOSER.send,
      borderRadius: '50%',
      background,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <ArrowUpIcon size={20} strokeWidth={2} color="#ffffff" />
  </div>
);

/** Shared pill look, so the bubble morph starts from exactly this style. */
export const composerPillStyle: React.CSSProperties = {
  boxSizing: 'border-box',
  borderRadius: COMPOSER.height / 2,
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  boxShadow: shadows.card,
};

/**
 * Message composer pill: text (or placeholder) on the left, send button on
 * the right.
 */
export const Composer: React.FC<{
  text?: React.ReactNode;
  placeholder: string;
  placeholderOpacity?: number;
  sendBackground?: string;
  style?: React.CSSProperties;
}> = ({text, placeholder, placeholderOpacity = 1, sendBackground, style}) => (
  <div
    style={{
      position: 'relative',
      width: COMPOSER.width,
      height: COMPOSER.height,
      ...composerPillStyle,
      fontFamily,
      ...style,
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: COMPOSER.padX - 1,
        top: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        fontSize: COMPOSER.fontSize,
        fontWeight: fontWeights.regular,
        whiteSpace: 'pre',
      }}
    >
      {placeholderOpacity > 0 && (
        <span style={{position: 'absolute', left: 0, color: colors.textSecondary, opacity: placeholderOpacity}}>{placeholder}</span>
      )}
      <span style={{color: colors.text}}>{text}</span>
    </div>
    <div style={{position: 'absolute', right: COMPOSER.sendPad - 1, top: (COMPOSER.height - COMPOSER.send) / 2 - 1}}>
      <SendButton background={sendBackground} />
    </div>
  </div>
);
