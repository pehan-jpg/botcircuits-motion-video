import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  BLUR_IN,
  COLOR,
  EASE,
  EASE_SETTLE,
  FONT,
  HEADLINE_CPS,
} from "../theme";
import { local, localF, sceneById } from "../timeline";
import { PLACEHOLDERS as P } from "../placeholders";
import { PlateBackground } from "../backgrounds/PlateBackground";
import { AgentOrb, orbOuterRadius } from "../components/AgentOrb";
import { BlurText } from "../components/BlurText";
import { Typewriter } from "../components/Typewriter";
import { Logo } from "../components/Logo";
import { GlassPanel } from "../components/GlassPanel";
import { GuardLayer } from "../components/GuardLayer";
import { typeDuration } from "../lib/typewriter";
import type { TextBeatSpec } from "../lib/guards";

const S = "S02" as const;
const ev = (n: Parameters<typeof localF>[0]) => localF(n, S);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], clamp);

const ORB_SIZE = 150; // matches Scene 1 so the handoff is seamless
const START = { x: 960, y: 540 };
const LEAD_POS = { x: 960, y: 338 };
const AGENT_SIZE = 64;
/** Nora (Intake), Theo (Policy), Owen (Evidence). Hue shifts stay within 25 degrees and away from green. */
const AGENTS = [
  { name: P.agents.intake.name, angle: 200, radius: 212, hue: -14, delay: 0 },
  { name: P.agents.policy.name, angle: 270, radius: 178, hue: 12, delay: 0.1 },
  {
    name: P.agents.evidence.name,
    angle: 340,
    radius: 212,
    hue: 24,
    delay: 0.2,
  },
];

const INTRO_TOP = 548;
const TITLE_TOP = 592;
const TAGLINE_TOP = 742;
const LOGO_TOP = 872;
const TITLE_SIZE = 104;
const PANEL = { x: 300, y: 520, w: 1320, h: 300 };
const TAGLINE_SIZE = 40;

const sceneLen = sceneById(S).end - sceneById(S).start;
export const SCENE02_TEXT: TextBeatSpec[] = [
  {
    id: "introducing",
    text: "Introducing",
    readyAt: local("introducing", S) + BLUR_IN.seconds,
    leaveAt: sceneLen,
    fontPx: 28,
  },
  {
    id: "title",
    text: P.productFull,
    readyAt:
      local("title_typed", S) +
      typeDuration(P.productFull, HEADLINE_CPS, "s2-title"),
    leaveAt: sceneLen,
    fontPx: TITLE_SIZE,
  },
  {
    id: "tagline",
    text: P.tagline,
    readyAt: local("tagline", S) + BLUR_IN.seconds,
    leaveAt: sceneLen,
    fontPx: TAGLINE_SIZE,
  },
];

export const Scene02Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);
  const t = frame / fps;

  // Colour returns: flat grey dissolves into the dawn plate over 1s.
  const dissolve = EASE(
    ramp(frame, ev("colour_returns"), ev("colour_returns") + sec(1)),
  );

  // The lone orb becomes the lead Space orb and rises to make room for the title.
  const form = ev("space_orb_forms");
  const ring = EASE_SETTLE(ramp(frame, form + sec(0.1), form + sec(0.95)));
  const sat = 0.12 + 0.88 * EASE(ramp(frame, form, form + sec(1.0)));
  const rise = EASE(ramp(frame, form + sec(0.35), form + sec(1.4)));
  const lead = {
    x: START.x + (LEAD_POS.x - START.x) * rise,
    y: START.y + (LEAD_POS.y - START.y) * rise,
  };
  const leadR = orbOuterRadius(ORB_SIZE, true);
  // Scene 1 ends with its camera at 1.02; ease that back out on the orb.
  const handoffScale = 1.02 - 0.02 * EASE(ramp(frame, 0, sec(1)));
  const panelIn = EASE(
    ramp(frame, ev("introducing") - sec(0.1), ev("introducing") + sec(0.7)),
  );
  const drift = t * 2.2; // degrees, slow settle drift of the cluster

  return (
    <AbsoluteFill style={{ width: 1920, height: 1080 }}>
      <PlateBackground
        plate="01"
        zoom={0.03}
        panX={-10}
        panY={-8}
        overlay={0.6}
        dots={8}
      />
      <AbsoluteFill
        style={{ background: COLOR.problemGrey, opacity: 1 - dissolve }}
      />

      {/* Specialist agents settle around the lead orb */}
      {AGENTS.map((a, i) => {
        const at = ev("agents_settle") + sec(a.delay);
        const p = EASE_SETTLE(ramp(frame, at, at + sec(0.95)));
        const o = EASE(ramp(frame, at, at + sec(0.35)));
        const ang = ((a.angle + drift) * Math.PI) / 180;
        const x = lead.x + Math.cos(ang) * a.radius * p;
        const y = lead.y + Math.sin(ang) * a.radius * p;
        const r = orbOuterRadius(AGENT_SIZE);
        if (frame < at) return null;
        return (
          <div
            key={a.name}
            data-guard="box"
            style={{
              position: "absolute",
              left: x - r,
              top: y - r,
              width: r * 2,
              height: r * 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: o,
              transform: `scale(${0.6 + 0.4 * Math.min(1, p)})`,
            }}
          >
            <AgentOrb
              size={AGENT_SIZE}
              hueShift={a.hue}
              phase={i * 0.33}
              style={{ position: "absolute" }}
            />
          </div>
        );
      })}

      <div
        data-guard="box"
        style={{
          position: "absolute",
          left: lead.x - leadR,
          top: lead.y - leadR,
          width: leadR * 2,
          height: leadR * 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AgentOrb
          size={ORB_SIZE}
          leadRing={ring}
          saturation={sat}
          timeOffset={sceneById(S).start}
          style={{ position: "absolute", transform: `scale(${handoffScale})` }}
        />
      </div>

      {/* ReadabilityGuard fix: frosted glass behind the type block, the title sat at 4.0:1 over the tree line */}
      <GlassPanel
        strength={0.6}
        style={{
          position: "absolute",
          left: PANEL.x,
          top: PANEL.y,
          width: PANEL.w,
          height: PANEL.h,
          borderRadius: 36,
          opacity: panelIn,
          transform: `translateY(${(1 - panelIn) * 20}px) scale(${0.97 + 0.03 * panelIn})`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: INTRO_TOP,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <BlurText
          inFrame={ev("introducing")}
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
          top: TITLE_TOP,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div data-guard="text" data-guard-label="Title">
          <Typewriter
            lines={[P.productFull]}
            cps={HEADLINE_CPS}
            startFrame={ev("title_typed")}
            seed="s2-title"
            align="center"
            style={{
              fontFamily: FONT.sans,
              fontWeight: 800,
              fontSize: TITLE_SIZE,
              letterSpacing: "-0.035em",
              lineHeight: 1.15,
              color: COLOR.ink,
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: TAGLINE_TOP,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <BlurText
          inFrame={ev("tagline")}
          guardLabel="Tagline"
          style={{
            fontFamily: FONT.sans,
            fontWeight: 600,
            fontSize: TAGLINE_SIZE,
            letterSpacing: "-0.01em",
            color: COLOR.ink,
            whiteSpace: "nowrap",
          }}
        >
          {P.tagline}
        </BlurText>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: LOGO_TOP,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <BlurText inFrame={ev("logo_in")} asText={false}>
          <Logo height={34} padding={16} />
        </BlurText>
      </div>

      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};
