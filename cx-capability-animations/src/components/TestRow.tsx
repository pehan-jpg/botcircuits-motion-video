import React from 'react';
import {interpolateColors} from 'remotion';
import {colors, fontFamily, fontWeights} from '../tokens';
import {ResultPill} from './ResultPill';
import {StatusIcon, StatusIconState} from './StatusIcon';

export const TEST_ROW = {
  height: 56,
  gap: 8,
  radius: 12,
  padX: 16,
  icon: 24,
  iconGap: 14,
  textSize: 20,
  /** Top of the detail area (reason line, fix block) inside a grown row. */
  detailTop: 46,
  reasonHeight: 20,
  /** Gap between the reason line and the fix block divider. */
  reasonGap: 14,
  /** Bottom padding under the reason line when only the reason shows. */
  reasonPad: 14,
} as const;

/** Extra height a row needs to show its reason line. */
export const reasonExtra = TEST_ROW.detailTop + TEST_ROW.reasonHeight + TEST_ROW.reasonPad - TEST_ROW.height;

export type TestRowProps = {
  text: string;
  width: number;
  /** Current height, computed from frame derived growth by the caller. */
  height: number;
  status: StatusIconState;
  result: {passed: number; failed: number};
  /** 0..1 strength of the rose failed treatment. */
  rose: number;
  /** Reason line under the scenario text. */
  reason?: string;
  reasonOpacity?: number;
  /** Content below the reason line, such as a FixBlock. */
  fix?: React.ReactNode;
  fixOpacity?: number;
};

/**
 * One scenario in a test run. Fixed 56px header band (status, text, result)
 * with an optional detail area underneath that is revealed as the row grows.
 */
export const TestRow: React.FC<TestRowProps> = ({
  text,
  width,
  height,
  status,
  result,
  rose,
  reason,
  reasonOpacity = 0,
  fix,
  fixOpacity = 0,
}) => {
  const detailLeft = TEST_ROW.padX + TEST_ROW.icon + TEST_ROW.iconGap;
  return (
    <div
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        width,
        height,
        borderRadius: TEST_ROW.radius,
        background: interpolateColors(rose, [0, 1], [colors.surface, colors.roseRowFill]),
        border: `1px solid ${interpolateColors(rose, [0, 1], [colors.border, colors.roseRowBorder])}`,
        overflow: 'hidden',
        fontFamily,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: TEST_ROW.padX - 1,
          right: TEST_ROW.padX - 1,
          top: -1,
          height: TEST_ROW.height,
          display: 'flex',
          alignItems: 'center',
          gap: TEST_ROW.iconGap,
        }}
      >
        <StatusIcon {...status} size={TEST_ROW.icon} />
        <div
          style={{
            flex: 1,
            fontSize: TEST_ROW.textSize,
            fontWeight: fontWeights.regular,
            color: colors.text,
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </div>
        <ResultPill {...result} />
      </div>
      {reason && reasonOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            left: detailLeft - 1,
            top: TEST_ROW.detailTop - 1,
            height: TEST_ROW.reasonHeight,
            lineHeight: `${TEST_ROW.reasonHeight}px`,
            fontSize: 15,
            fontWeight: fontWeights.regular,
            color: colors.roseText,
            opacity: reasonOpacity,
            whiteSpace: 'nowrap',
          }}
        >
          {reason}
        </div>
      )}
      {fix && fixOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            left: detailLeft - 1,
            right: TEST_ROW.padX - 1,
            top: TEST_ROW.detailTop + TEST_ROW.reasonHeight + TEST_ROW.reasonGap - 1,
            opacity: fixOpacity,
          }}
        >
          {fix}
        </div>
      )}
    </div>
  );
};
