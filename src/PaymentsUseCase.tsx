import React from "react";
import { AbsoluteFill } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { mix, useTimeline } from "./anim";
import {
  CAMERA_DRIFT,
  CAMERA_SHOTS,
  CLOSING,
  LIST,
  MAIN_CHAT,
  MORPH_IN,
  SCENARIO_TRANSITION,
  SCENARIOS,
} from "./content";
import { Background } from "./components/Background";
import { Captions } from "./components/Captions";
import { AgentAvatar } from "./components/Icons";
import {
  Chip,
  Conversation,
  HEADER_AVATAR,
  PhoneScreen,
} from "./components/WhatsAppChat";
import { ChatsList, rowAvatar } from "./scenes/ChatsList";
import { Closing } from "./scenes/Closing";
import { Intro } from "./scenes/Intro";
import { MainChat, useFocusBlur } from "./scenes/MainChat";
import { ScenarioChat } from "./scenes/ScenarioChat";
import { C, EASE_CAMERA, EASE_IN, PHONE, R, SCREEN, WA } from "./theme";

// Screen point the camera focus is placed on (phone centre at scale 1).
const ANCHOR = { x: 540, y: PHONE.top + PHONE.height / 2 };
// Keep at least this much space above the phone so its header stays in frame.
const HEADER_MARGIN = 60;

const PHONE_END = CLOSING.coverAt + CLOSING.coverDuration;

// Fast moves that get camera motion blur.
const BLUR_WINDOWS: [number, number][] = [
  ...CAMERA_SHOTS.filter((s) => s.duration > 0).map((s): [number, number] => [
    s.at,
    s.at + s.duration,
  ]),
  [
    MAIN_CHAT.approveToStep.at,
    MAIN_CHAT.approveToStep.at + MAIN_CHAT.approveToStep.duration,
  ],
  [CLOSING.circleAt, PHONE_END],
  [LIST.pushAt, LIST.pushAt + LIST.pushDuration],
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
    // Slow drift until the next shot starts. The phone holds still until it
    // has finished resolving from glass.
    const from = Math.max(
      shot.at + shot.duration,
      MORPH_IN.phoneAt + MORPH_IN.resolveDuration,
    );
    const to = CAMERA_SHOTS[i + 1]?.at ?? CLOSING.circleAt;
    const d =
      to > from ? Math.min(1, Math.max(0, (t - from) / (to - from))) : 0;
    cur = { ...cur, scale: cur.scale * (1 + CAMERA_DRIFT * d) };
  });
  const maxFy = PHONE.top + (ANCHOR.y - HEADER_MARGIN) / cur.scale;
  return { ...cur, fy: Math.min(cur.fy, maxFy) };
};

// Scenario screens blur through: the outgoing one drifts left and blurs out
// while the incoming one drifts in from the right and resolves.
const Screens: React.FC = () => {
  const { p } = useTimeline();
  const starts = SCENARIOS.map((s) => s.start);
  const screens = [
    <MainChat key="main" />,
    ...SCENARIOS.map((s) => <ScenarioChat key={s.id} scenario={s} />),
  ];
  return (
    <>
      {screens.map((screen, k) => {
        const inP = k === 0 ? 1 : p(starts[k - 1], SCENARIO_TRANSITION);
        const outP =
          k < starts.length
            ? p(starts[k], SCENARIO_TRANSITION * 0.85, EASE_CAMERA)
            : 0;
        if (inP <= 0 || outP >= 1) return null;
        const blur = 12 * (1 - inP) + 12 * outP;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              inset: 0,
              opacity: inP * (1 - outP),
              translate: `${40 * (1 - inP) - 40 * outP}px 0px`,
              filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
            }}
          >
            {screen}
          </div>
        );
      })}
    </>
  );
};

// Scenario chip that changes its label with a vertical roll.
const ScenarioChip: React.FC = () => {
  const { p } = useTimeline();
  const enter = p(SCENARIOS[0].start, SCENARIO_TRANSITION);
  if (enter <= 0) return null;
  const rolls = SCENARIOS.map((s, i) =>
    i === 0 ? 1 : p(s.start, SCENARIO_TRANSITION, EASE_CAMERA),
  );
  const current = rolls.reduce((n, r, i) => (r > 0 ? i : n), 0);
  const r = rolls[current];
  const widthOf = (label: string) => label.length * 14 + 50;
  const width =
    current === 0
      ? widthOf(SCENARIOS[0].chip)
      : mix(
          widthOf(SCENARIOS[current - 1].chip),
          widthOf(SCENARIOS[current].chip),
          r,
        );
  const label = (text: string, y: number, opacity: number) => (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        translate: `0px ${y}%`,
        opacity,
      }}
    >
      {text}
    </div>
  );
  return (
    <div
      style={{
        position: "absolute",
        top: 28,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: enter,
        filter: enter < 1 ? `blur(${mix(10, 0, enter)}px)` : undefined,
      }}
    >
      <Chip size={24}>
        <div
          style={{
            position: "relative",
            width: width - 38,
            height: 28,
            overflow: "hidden",
          }}
        >
          {current > 0 && r < 1
            ? label(SCENARIOS[current - 1].chip, -100 * r, 1 - r)
            : null}
          {label(SCENARIOS[current].chip, 100 * (1 - r), r)}
        </div>
      </Chip>
    </div>
  );
};

// Chats list, then an iOS navigation push into the conversation: the list
// moves left at 30 percent with a dim, the conversation slides in from the
// right, and the agent avatar flies from its row into the header.
const NavigationPush: React.FC = () => {
  const { p, t } = useTimeline();
  const edgeBlur = useFocusBlur();
  const push = p(LIST.pushAt, LIST.pushDuration, EASE_IN);
  const W = SCREEN.width;
  const from = rowAvatar(LIST.agentRow);
  const to = HEADER_AVATAR;
  const started = t >= LIST.pushAt;
  return (
    <>
      {push < 1 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            translate: `${-0.3 * W * push}px 0px`,
          }}
        >
          <ChatsList />
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: `rgba(0, 0, 0, ${0.08 * push})`,
            }}
          />
        </div>
      ) : null}
      {started ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            translate: `${W * (1 - push)}px 0px`,
            boxShadow:
              push < 1 ? "-16px 0 40px rgba(11, 20, 26, 0.14)" : undefined,
          }}
        >
          <Conversation
            edgeBlur={edgeBlur}
            avatarVisible={push >= 1}
            attachFlashes={[
              MAIN_CHAT.invoice.attachFlashAt,
              ...SCENARIOS.filter((s) => s.outgoing.kind === "file").map(
                (s) => s.start + 0.05,
              ),
            ]}
          >
            <Screens />
            <ScenarioChip />
          </Conversation>
        </div>
      ) : null}
      {started && push < 1 ? (
        <div
          style={{
            position: "absolute",
            left: mix(from.x, to.x, push),
            top: mix(from.y, to.y, push),
          }}
        >
          <AgentAvatar size={mix(from.size, to.size, push)} />
        </div>
      ) : null}
    </>
  );
};

const Phone: React.FC = () => {
  const { p } = useTimeline();
  // Appears inside the glass, then fully as the glass resolves.
  const appear =
    0.55 * p(MORPH_IN.chatFadeInAt, MORPH_IN.phoneAt - MORPH_IN.chatFadeInAt) +
    0.45 * p(MORPH_IN.phoneAt, MORPH_IN.resolveDuration);
  // T6: content fades, frame softens into a circle, circle covers the frame.
  const contentOut = p(CLOSING.contentOutAt, 0.25);
  const circle = p(CLOSING.circleAt, CLOSING.circleDuration, EASE_CAMERA);
  const cover = p(CLOSING.coverAt, CLOSING.coverDuration, EASE_CAMERA);
  const h = mix(PHONE.height, PHONE.width, circle);
  return (
    <div
      style={{
        position: "absolute",
        left: (1080 - PHONE.width) / 2,
        top: PHONE.top + (PHONE.height - h) / 2,
        width: PHONE.width,
        height: h,
        borderRadius: mix(R.phone, PHONE.width / 2, circle),
        padding: PHONE.border,
        overflow: "hidden",
        // iPhone style dark bezel.
        background: `linear-gradient(150deg, #42464C 0%, ${WA.bezel} 38%, #2C3035 100%)`,
        boxShadow: [
          `0 2px 6px rgba(29, 33, 37, ${0.05 * (1 - cover)})`,
          `0 22px 44px rgba(29, 33, 37, ${0.07 * (1 - cover)})`,
          `0 60px 120px rgba(29, 33, 37, ${0.09 * (1 - cover)})`,
        ].join(", "),
        opacity: appear,
        scale: String(mix(1, 3.4, cover)),
      }}
    >
      <div style={{ opacity: 1 - contentOut }}>
        <PhoneScreen>
          <NavigationPush />
        </PhoneScreen>
      </div>
      {/* The frame turns white as it becomes a circle. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: C.bg,
          opacity: Math.max(contentOut, circle),
        }}
      />
      {/* Faint specular highlight on the frame edge. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          padding: 2,
          opacity: 1 - circle,
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
  );
};

const World: React.FC = () => {
  const cam = useCamera();
  const s = cam.scale;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transformOrigin: "0 0",
        transform: `translate(${ANCHOR.x - cam.fx * s}px, ${ANCHOR.y - cam.fy * s}px) scale(${s})`,
      }}
    >
      <Phone />
    </div>
  );
};

// T1: a white pill with a send button grows into a frosted glass phone,
// then hands over to the real chat.
const GlassMorph: React.FC = () => {
  const { p, t } = useTimeline();
  const end = MORPH_IN.phoneAt + MORPH_IN.resolveDuration;
  if (t < MORPH_IN.start || t > end) return null;
  const toPill = p(
    MORPH_IN.start,
    MORPH_IN.pillAt - MORPH_IN.start,
    EASE_CAMERA,
  );
  const toPhone = p(
    MORPH_IN.pillAt,
    MORPH_IN.phoneAt - MORPH_IN.pillAt,
    EASE_CAMERA,
  );
  const resolve = p(MORPH_IN.phoneAt, MORPH_IN.resolveDuration);
  const box = {
    cx: 540,
    cy: mix(960, ANCHOR.y, toPhone),
    w: mix(mix(900, 680, toPill), PHONE.width, toPhone),
    h: mix(mix(360, 120, toPill), PHONE.height, toPhone),
    r: mix(mix(120, 60, toPill), R.phone, toPhone),
  };
  const send =
    p(MORPH_IN.start + 0.15, 0.2) * (1 - p(MORPH_IN.pillAt + 0.05, 0.15));
  return (
    <div
      style={{
        position: "absolute",
        left: box.cx - box.w / 2,
        top: box.cy - box.h / 2,
        width: box.w,
        height: box.h,
        borderRadius: box.r,
        backgroundColor: `rgba(255, 255, 255, ${mix(1, 0.3, toPhone)})`,
        backdropFilter: `blur(${mix(0, 28, toPhone)}px) saturate(140%)`,
        WebkitBackdropFilter: `blur(${mix(0, 28, toPhone)}px) saturate(140%)`,
        border: "1.5px solid rgba(255, 255, 255, 0.9)",
        boxShadow: [
          "0 0 0 1px rgba(29, 33, 37, 0.06)",
          "inset 0 1.5px 0 rgba(255, 255, 255, 0.95)",
          "inset 0 -20px 40px rgba(255, 255, 255, 0.25)",
          "0 24px 60px rgba(29, 33, 37, 0.08)",
        ].join(", "),
        opacity: toPill * (1 - resolve),
      }}
    >
      <div
        style={{
          position: "absolute",
          right: 18,
          top: "50%",
          width: 84,
          height: 84,
          marginTop: -42,
          borderRadius: 42,
          backgroundColor: C.ink,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: send,
        }}
      >
        <svg
          width={38}
          height={38}
          viewBox="0 0 24 24"
          fill="none"
          stroke={C.bg}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </div>
    </div>
  );
};

export const PaymentsUseCase: React.FC = () => {
  const { t } = useTimeline();
  const blurring = BLUR_WINDOWS.some(([a, b]) => t >= a && t <= b);
  const phoneVisible = t >= MORPH_IN.chatFadeInAt && t < PHONE_END;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Background />
      <Intro />
      <GlassMorph />
      {phoneVisible ? (
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
      <Captions />
      <Closing />
    </AbsoluteFill>
  );
};
