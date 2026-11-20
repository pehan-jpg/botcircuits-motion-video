import React from "react";
import { COLOR, FONT } from "../../theme";
import { PLACEHOLDERS as P } from "../../placeholders";
import { BlurText } from "../../components/BlurText";
import { SpaceByLockup } from "../../components/SpaceByLockup";

/**
 * Layout shared by the end of Scene 1, Scene 2 and the opening of Scene 3.
 * Changing a value here moves it on both sides of a scene boundary.
 */
export const INTRO = {
  /** Orb at the Scene 1 to Scene 2 boundary: centre of frame, core 187.5px (150 x 1.25). */
  handoffOrb: { x: 960, y: 540, size: 187.5 },
  /** Lead Space orb at rest in Scene 2 (core 150px, shown 1.3x with the double ring). */
  leadOrb: { x: 960, y: 338, size: 150 },
  card: { x: 300, y: 520, w: 1320, h: 300, radius: 36 },
  introTop: 548,
  titleTop: 590,
  taglineTop: 742,
  titleSize: 104,
  taglineSize: 40,
} as const;

/** White title card at 92 percent, rounded and soft, so the logo sits on white. */
export const CARD_BG = "rgba(255,255,255,0.92)";
export const CARD_SHADOW =
  "0 30px 80px rgba(13,18,36,0.14), 0 8px 24px rgba(13,18,36,0.08)";

type TextProps = {
  /** Frames (in the parent sequence). Undefined means already fully in. */
  introIn?: number;
  titleStart?: number;
  taglineIn?: number;
  /** Frame at which the whole group blurs out. */
  outFrame?: number;
  outSeconds?: number;
};

const ALWAYS = -100000;

/** "Introducing", the Space by lockup and the tagline. */
export const IntroText: React.FC<TextProps> = ({
  introIn,
  titleStart,
  taglineIn,
  outFrame,
  outSeconds = 0.5,
}) => (
  <>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: INTRO.introTop,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <BlurText
        inFrame={introIn ?? ALWAYS}
        outFrame={outFrame}
        outSeconds={outSeconds}
        guardLabel="Introducing"
        style={{
          fontFamily: FONT.mono,
          fontWeight: 500,
          fontSize: 28,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: COLOR.ink,
        }}
      >
        Introducing
      </BlurText>
    </div>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: INTRO.titleTop,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <BlurText
        inFrame={ALWAYS}
        outFrame={outFrame}
        outSeconds={outSeconds}
        asText={false}
      >
        <SpaceByLockup
          fontSize={INTRO.titleSize}
          startFrame={titleStart}
          seed="s2-title"
          onWhite
        />
      </BlurText>
    </div>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: INTRO.taglineTop,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <BlurText
        inFrame={taglineIn ?? ALWAYS}
        outFrame={outFrame}
        outSeconds={outSeconds}
        guardLabel="Tagline"
        style={{
          fontFamily: FONT.sans,
          fontWeight: 600,
          fontSize: INTRO.taglineSize,
          letterSpacing: "-0.01em",
          color: COLOR.ink,
          whiteSpace: "nowrap",
        }}
      >
        {P.tagline}
      </BlurText>
    </div>
  </>
);
