import React from "react";

export const CheckIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="11" fill={color} />
    <path d="M7 12.4l3.2 3.1L17 8.8" stroke="#0b0c0b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const FileIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 3h8l4 4v14H6z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M14 3v4h4" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M9 13h6M9 16.5h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const InfoIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" />
    <path d="M12 11v6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="7.6" r="1.25" fill={color} />
  </svg>
);
