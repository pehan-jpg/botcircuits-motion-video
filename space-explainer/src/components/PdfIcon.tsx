import React from "react";

/** Original generic PDF file icon: a red document with a "PDF" mark. No third party branding. */
export const PdfIcon: React.FC<{
  size: number;
  style?: React.CSSProperties;
}> = ({ size, style }) => (
  <svg
    width={size * 0.8}
    height={size}
    viewBox="0 0 32 40"
    style={style}
    aria-label="PDF file"
  >
    <path
      d="M4 1h17l9 9v27a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2z"
      fill="#FFFFFF"
      stroke="#D93025"
      strokeWidth={2}
    />
    <path
      d="M21 1v7a2 2 0 0 0 2 2h7"
      fill="#FBE3E1"
      stroke="#D93025"
      strokeWidth={2}
      strokeLinejoin="round"
    />
    <rect x={0} y={20} width={26} height={12} rx={2} fill="#D93025" />
    <text
      x={13}
      y={29.4}
      textAnchor="middle"
      fontFamily="Arial, Helvetica, sans-serif"
      fontWeight={700}
      fontSize={9.5}
      fill="#FFFFFF"
    >
      PDF
    </text>
  </svg>
);
