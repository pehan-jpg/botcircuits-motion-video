import React from "react";
import { AbsoluteFill } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { mix, useTimeline } from "./anim";
import {
  CAMERA_DRIFT,
  CAMERA_SHOTS,
  CLOSING,
  MAIN_CHAT,
  SCENARIO_SLIDE,
  SCENARIOS,
  SCENES,
} from "./content";
import { Background } from "./components/Background";
import { Captions } from "./components/Captions";
import { WhatsAppChat } from "./components/WhatsAppChat";
import { Closing } from "./scenes/Closing";
import { MainChat } from "./scenes/MainChat";
import { ScenarioChat } from "./scenes/ScenarioChat";
import { C, EASE_CAMERA, EASE_IN, PHONE, R } from "./theme";

// Screen point the camera focus is placed on (phone centre at scale 1).
const ANCHOR = { x: 540, y: PHONE.top + PHONE.height / 2 };
const SCREEN_WIDTH = PHONE.width - PHONE.border * 2;

// Fast moves that get camera motion blur.
const BLUR_WINDOWS: [number, number][] = [
  ...CAMERA_SHOTS.slice(1).map((s): [number, number] => [
    s.at,
    s.at + s.duration,
  ]),
  ...SCENARIOS.map((s): [number, number] => [
    s.start,
    s.start + SCENARIO_SLIDE,
  ]),
  [CLOSING.phoneOutAt, CLOSING.phoneOutAt + CLOSING.phoneOutDuration],
];

const useCamera = () => {
  const { p, t } = useTimeline();
  let cur = {
    scale: CAMERA_SHOTS[0].scale,
    fx: CAMERA_SHOTS[0].fx,
    fy: CAMERA_SHOTS[0].fy,
  };
  CAMERA_SHOTS.forEach((shot, i) => {
    if (i > 0) {
      const m = p(shot.at, shot.duration, EASE_CAMERA);
      cur = {
        scale: mix(cur.scale, shot.scale, m),
        fx: mix(cur.fx, shot.fx, m),
        fy: mix(cur.fy, shot.fy, m),
      };
    }
    // Slow drift until the next shot starts.
    const from = shot.at + shot.duration;
    const to = CAMERA_SHOTS[i + 1]?.at ?? SCENES.close.start;
    const d = Math.min(1, Math.max(0, (t - from) / (to - from)));
    cur = { ...cur, scale: cur.scale * (1 + CAMERA_DRIFT * d) };
  });
  return cur;
};

const Screens: React.FC = () => {
  const { p } = useTimeline();
  const progress = SCENARIOS.reduce(
    (n, s) => n + p(s.start, SCENARIO_SLIDE, EASE_CAMERA),
    0,
  );
  const screens = [
    <MainChat key="main" />,
    ...SCENARIOS.map((s) => <ScenarioChat key={s.id} scenario={s} />),
  ];
  return (
    <>
      {screens.map((screen, i) => {
        const x = (i - progress) * SCREEN_WIDTH;
        if (Math.abs(x) >= SCREEN_WIDTH) return null;
        return (
          <div
            key={i}
            style={{ position: "absolute", inset: 0, translate: `${x}px 0px` }}
          >
            {screen}
          </div>
        );
      })}
    </>
  );
};

const Phone: React.FC = () => {
  const { p } = useTimeline();
  const enter = p(0, 0.6);
  const settle = p(0, 1.1);
  return (
    <div style={{ position: "absolute", inset: 0, perspective: 1800 }}>
      <div
        style={{
          position: "absolute",
          left: (1080 - PHONE.width) / 2,
          top: PHONE.top,
          width: PHONE.width,
          height: PHONE.height,
          borderRadius: R.phone,
          padding: PHONE.border,
          background: `linear-gradient(150deg, #F6F7F8 0%, ${C.frame} 45%, #E2E5E8 100%)`,
          boxShadow: [
            "0 2px 6px rgba(29, 33, 37, 0.05)",
            "0 22px 44px rgba(29, 33, 37, 0.07)",
            "0 60px 120px rgba(29, 33, 37, 0.09)",
          ].join(", "),
          opacity: enter,
          translate: `0px ${mix(60, 0, enter)}px`,
          transform: `rotateX(${mix(4, 0, settle)}deg) rotateY(${mix(-6, 0, settle)}deg)`,
        }}
      >
        <WhatsAppChat
          attachFlashes={[
            MAIN_CHAT.invoice.attachFlashAt,
            ...SCENARIOS.filter((s) => s.outgoing.kind === "file").map(
              (s) => s.start + 0.02,
            ),
          ]}
        >
          <Screens />
        </WhatsAppChat>
        {/* Faint specular highlight on the frame edge. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: R.phone,
            padding: 2,
            background:
              "linear-gradient(160deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.2) 28%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.5) 100%)",
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
};

const World: React.FC = () => {
  const { p } = useTimeline();
  const cam = useCamera();
  const away = p(CLOSING.phoneOutAt, CLOSING.phoneOutDuration, EASE_CAMERA);
  const s = cam.scale * mix(1, 0.6, away);
  const tx = ANCHOR.x - cam.fx * s - 160 * away;
  const ty = ANCHOR.y - cam.fy * s;
  return (
    <AbsoluteFill style={{ opacity: 1 - p(CLOSING.phoneOutAt + 0.1, 0.45) }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "0 0",
          transform: `translate(${tx}px, ${ty}px) scale(${s})`,
        }}
      >
        <Phone />
      </div>
    </AbsoluteFill>
  );
};

export const PaymentsUseCase: React.FC = () => {
  const { t, p } = useTimeline();
  const blurring = BLUR_WINDOWS.some(([a, b]) => t >= a && t <= b);
  const away = p(CLOSING.phoneOutAt, CLOSING.phoneOutDuration, EASE_IN);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Background />
      {t < CLOSING.phoneOutAt + CLOSING.phoneOutDuration + 0.1 ? (
        // The phone layer fades out above the caption band so they never overlap.
        <AbsoluteFill
          style={{
            WebkitMaskImage:
              "linear-gradient(180deg, #000 0px, #000 1452px, transparent 1500px)",
            maskImage:
              "linear-gradient(180deg, #000 0px, #000 1452px, transparent 1500px)",
          }}
        >
          {blurring ? (
            <CameraMotionBlur samples={6} shutterAngle={180}>
              <World />
            </CameraMotionBlur>
          ) : (
            <World />
          )}
        </AbsoluteFill>
      ) : null}
      <Captions offsetX={-160 * away} />
      <Closing />
    </AbsoluteFill>
  );
};
