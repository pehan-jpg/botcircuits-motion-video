import React from "react";
import { interpolateColors } from "remotion";
import { C } from "../theme";

// Characters that were just revealed carry a brief lime tint that settles
// to ink. `ages` gives each character's seconds since it appeared.
export const TintedText: React.FC<{
  text: string;
  ageOf: (index: number) => number;
  settle?: number;
}> = ({ text, ageOf, settle = 0.3 }) => (
  <>
    {Array.from(text).map((ch, i) => {
      const age = ageOf(i);
      return (
        <span
          key={i}
          style={{
            color:
              age >= settle
                ? C.ink
                : interpolateColors(age, [0, settle], [C.tint, C.ink]),
          }}
        >
          {ch}
        </span>
      );
    })}
  </>
);
