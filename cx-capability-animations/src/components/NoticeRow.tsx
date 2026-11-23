import React from 'react';
import {colors, fontFamily, fontWeights} from '../tokens';

/** Full width amber notice line inside a transcript. */
export const NoticeRow: React.FC<{text: string}> = ({text}) => (
  <div
    style={{
      height: 40,
      borderRadius: 12,
      background: colors.amber,
      color: colors.amberText,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily,
      fontSize: 15,
      fontWeight: fontWeights.medium,
    }}
  >
    {text}
  </div>
);
