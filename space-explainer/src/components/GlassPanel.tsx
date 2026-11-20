import React from "react";
import { GLASS } from "../theme";

/** Frosted glass: white at 60 percent, 24px backdrop blur, 1px white border. */
export const GlassPanel: React.FC<{
  style?: React.CSSProperties;
  strength?: number;
  children?: React.ReactNode;
}> = ({ style, strength = 0.6, children }) => (
  <div
    data-glass
    style={{
      ...GLASS,
      background: `rgba(255,255,255,${strength})`,
      borderRadius: 20,
      boxShadow: "0 10px 40px rgba(13,18,36,0.08)",
      ...style,
    }}
  >
    {children}
  </div>
);
