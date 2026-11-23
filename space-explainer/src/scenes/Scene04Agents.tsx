import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { EASE, EASE_SETTLE } from "../theme";
import { f, local, localF, sceneById, sceneFrames } from "../timeline";
import { PLACEHOLDERS as P } from "../placeholders";
import { PlateBackground } from "../backgrounds/PlateBackground";
import { TextBeat, textBeatTiming } from "../components/TextBeat";
import { Cursor } from "../components/Cursor";
import { GuardLayer } from "../components/GuardLayer";
import { ChatScreen } from "../components/chat/ChatScreen";
import {
  ProductWindow,
  PRODUCT_RECT,
  PRODUCT_SCALE,
} from "../components/chat/ProductWindow";
import { AgentsPage, slotRect } from "../components/agents/AgentsPage";
import {
  ControlRoomPage,
  CR_OFFSET,
} from "../components/office/ControlRoomPage";
import type { AgentKey, OfficeState } from "../components/office/Office";
import type { TextBeatSpec } from "../lib/guards";
import { chatStateAt, S1_CHIP } from "./Scene03Chat";
import { S2_PLATE } from "./Scene02Intro";

const S = "S04" as const;
const ev = (n: Parameters<typeof localF>[0]) => localF(n, S);
const at = (n: Parameters<typeof local>[0]) => local(n, S);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], clamp);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const DUR = sceneById(S).end - sceneById(S).start;
const S3_FRAMES = sceneFrames("S03");
const S3_START = sceneById("S03").start;
const BEAT = "Give every agent a job";

/** Native screen point to pre-camera screen pixels. */
const nat = (x: number, y: number) => ({
  x: PRODUCT_RECT.x + x * PRODUCT_SCALE,
  y: PRODUCT_RECT.y + y * PRODUCT_SCALE,
});
/** Office (screenshot space) point to pre-camera screen pixels. */
const room = (x: number, y: number) => nat(x + CR_OFFSET.x, y + CR_OFFSET.y);
/** Camera origin: the centre of the product frame. */
const O = {
  x: PRODUCT_RECT.x + PRODUCT_RECT.w / 2,
  y: PRODUCT_RECT.y + PRODUCT_RECT.h / 2,
};

type Cam = { x: number; y: number; z: number };
/** Camera keys (seconds, focus point, zoom). Focus maps to the frame centre O. */
/** `lin`: the segment ending at this key moves linearly (slow drifts that must not settle to a stop). */
const CAM_KEYS: { t: number; c: Cam; lin?: boolean }[] = [
  { t: 0, c: { ...O, z: 1.035 } }, // Scene 3 ends with a 3.5 percent push about O
  { t: 0.5, c: { ...O, z: 1 } },
  { t: at("s4_zoom_cards"), c: { ...O, z: 1 } },
  { t: at("s4_zoom_cards") + 0.45, c: { ...nat(1045, 418), z: 1.7 } },
  // A slow drift while zoomed on the cards, so the picture never sits still.
  { t: at("s4_zoom_out_cards"), c: { ...nat(1100, 430), z: 1.72 }, lin: true },
  { t: at("s4_zoom_out_cards") + 0.45, c: { ...O, z: 1 } },
  { t: at("s4_control_page") + 0.3, c: { ...O, z: 1 } },
  // Gentle push on the full room while the team arrives.
  { t: at("s4_zoom_desks"), c: { ...O, z: 1.03 }, lin: true },
  { t: at("s4_zoom_desks") + 0.6, c: { ...room(560, 545), z: 1.8 } },
  { t: at("s4_path_theo") + 0.4, c: { ...room(600, 590), z: 1.8 } },
  { t: at("s4_path_owen") + 0.9, c: { ...room(680, 590), z: 1.8 } },
  {
    t: at("s4_zoom_out_room") - 0.6,
    c: { ...room(720, 600), z: 1.8 },
    lin: true,
  },
  { t: at("s4_zoom_out_room") + 1.4, c: { ...O, z: 1 } },
];
const camAt = (t: number): Cam => {
  for (let i = 0; i < CAM_KEYS.length - 1; i++) {
    const a = CAM_KEYS[i];
    const b = CAM_KEYS[i + 1];
    if (t <= b.t) {
      const raw = Math.max(
        0,
        Math.min(1, (t - a.t) / Math.max(0.001, b.t - a.t)),
      );
      const p = b.lin ? raw : EASE(raw);
      return {
        x: lerp(a.c.x, b.c.x, p),
        y: lerp(a.c.y, b.c.y, p),
        z: lerp(a.c.z, b.c.z, p),
      };
    }
  }
  return CAM_KEYS[CAM_KEYS.length - 1].c;
};

const TEAM: AgentKey[] = ["nora", "theo", "owen"];
const NEW_EVENTS = ["s4_new_nora", "s4_new_theo", "s4_new_owen"] as const;
const POP_EVENTS = ["s4_pop_nora", "s4_pop_theo", "s4_pop_owen"] as const;
const PATH_EVENTS = ["s4_path_nora", "s4_path_theo", "s4_path_owen"] as const;
const LINKS: { from: AgentKey; to: "gmail" | "drive" | "sheets" }[] = [
  { from: "nora", to: "gmail" },
  { from: "theo", to: "drive" },
  { from: "owen", to: "sheets" },
];
const SEG = 0.6; // seconds per path segment

export const SCENE04_TEXT: TextBeatSpec[] = (() => {
  const b = textBeatTiming(BEAT, "s4-beat");
  return [
    {
      id: "beat",
      text: BEAT,
      readyAt: at("s4_textbeat") + b.typed,
      leaveAt: at("s4_textbeat") + b.outAt,
      fontPx: 56,
    },
    ...P.agentsPage.team.map((a, i) => ({
      id: `card-${a.name}`,
      text: `${a.name} ${a.handle} ${a.role} ${P.agentAccessLine}`,
      readyAt: at(NEW_EVENTS[i]) + 0.45,
      leaveAt: at("s4_zoom_out_cards") + 0.2,
      fontPx: 28,
      exception:
        "Brief: three agents created one at a time between 0.5s and 4.0s",
    })),
    ...TEAM.map((k, i) => ({
      id: `plate-${k}`,
      text: P.controlRoom.statuses[i],
      readyAt: at(PATH_EVENTS[i]) + SEG,
      leaveAt: at("s4_zoom_out_room"),
      fontPx: 28,
    })),
  ];
})();

export const Scene04Agents: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);
  const t = frame / fps;

  // ---- Page 1: the chat from Scene 3, source card closing.
  const chat = chatStateAt(S3_FRAMES, fps, -S3_FRAMES);
  chat.cardOpen = 1 - EASE(ramp(frame, 0, sec(0.5)));
  chat.citeActive = 1 - EASE(ramp(frame, 0, sec(0.5)));
  chat.clock = S3_START;
  const toAgents = EASE(
    ramp(frame, ev("s4_agents_page"), ev("s4_agents_page") + sec(0.3)),
  );
  const toControl = EASE(
    ramp(frame, ev("s4_control_page"), ev("s4_control_page") + sec(0.6)),
  );

  // ---- Page 2: agents created one at a time through the "New agent" card.
  const created = NEW_EVENTS.map((e) =>
    EASE(ramp(frame, ev(e) + sec(0.05), ev(e) + sec(0.4))),
  );
  const lastNew = NEW_EVENTS.reduce(
    (acc, e, i) => (frame >= ev(e) ? i : acc),
    -1,
  );
  const newSlot = 1 + (lastNew + 1);
  const sinceNew =
    lastNew >= 0
      ? ramp(
          frame,
          ev(NEW_EVENTS[lastNew]) + sec(0.3),
          ev(NEW_EVENTS[lastNew]) + sec(0.6),
        )
      : 1;
  const pressed = NEW_EVENTS.reduce(
    (acc, e) => Math.max(acc, 1 - Math.abs(frame - ev(e)) / sec(0.15)),
    0,
  );

  // ---- Page 3: Control Room office.
  const pops = POP_EVENTS.map((e) =>
    EASE_SETTLE(ramp(frame, ev(e), ev(e) + sec(0.45))),
  );
  // Path runs Iris to Nora (from s4_path_nora), Nora to Theo, Theo to Owen.
  const segP = PATH_EVENTS.map((e) => ramp(frame, ev(e), ev(e) + sec(SEG)));
  const path = segP.reduce((a, b) => a + b, 0) / 3;
  const office: OfficeState = {
    pop: { iris: 1, nora: pops[0], theo: pops[1], owen: pops[2] },
    names: { iris: "Iris", nora: "Nora", theo: "Theo", owen: "Owen" },
    plates: {
      iris: {
        role: P.agents.frontDesk.role,
        status:
          frame >= ev("s4_claim_to_iris") + sec(0.5)
            ? P.controlRoom.irisStatusBusy
            : P.controlRoom.irisStatusIdle,
        pulse: Math.sin(
          Math.PI *
            ramp(
              frame,
              ev("s4_claim_to_iris") + sec(0.5),
              ev("s4_claim_to_iris") + sec(1.1),
            ),
        ),
        opacity: 1,
      },
      ...(Object.fromEntries(
        TEAM.map((k, i) => {
          const reached = ev(PATH_EVENTS[i]) + sec(SEG);
          return [
            k,
            {
              role: [
                P.agents.intake.role,
                P.agents.policy.role,
                P.agents.evidence.role,
              ][i],
              status: frame >= reached ? P.controlRoom.statuses[i] : "Ready",
              pulse: Math.sin(
                Math.PI * ramp(frame, reached, reached + sec(0.6)),
              ),
              opacity: EASE(
                ramp(
                  frame,
                  ev(POP_EVENTS[i]) + sec(0.15),
                  ev(POP_EVENTS[i]) + sec(0.5),
                ),
              ),
            },
          ];
        }),
      ) as Omit<OfficeState["plates"], "iris">),
    },
    path,
    links: LINKS.map((l, i) => {
      const reached = ev(PATH_EVENTS[i]) + sec(SEG);
      return {
        ...l,
        draw: EASE(ramp(frame, reached, reached + sec(0.35))),
        pulse: ramp(frame, reached + sec(0.3), reached + sec(1.1)),
      };
    }),
    claim: ramp(
      frame,
      ev("s4_claim_to_iris"),
      ev("s4_claim_to_iris") + sec(0.6),
    ),
  };
  const agentsCount = 1 + pops.filter((p) => p > 0.3).length;
  const activeTasks = frame >= ev("s4_claim_to_iris") + sec(0.5) ? 1 : 0;
  const irisMessage = EASE(
    ramp(frame, ev("s4_iris_message"), ev("s4_iris_message") + sec(0.4)),
  );

  // ---- Camera
  const cam = camAt(t);
  const camTransform = `translate(${O.x}px, ${O.y}px) scale(${cam.z}) translate(${-cam.x}px, ${-cam.y}px)`;

  // ---- Cursor (pre-camera coordinates)
  const agentsItem = nat(63, 197);
  const controlItem = nat(85, 159);
  const slotC = (i: number) => {
    const r = slotRect(i);
    return nat(r.x + r.w / 2, r.y + r.h / 2);
  };
  const cursorKeys = [
    { x: S1_CHIP.x, y: S1_CHIP.y, t: 0 },
    { x: S1_CHIP.x, y: S1_CHIP.y, t: 0.3 },
    { ...agentsItem, t: at("s4_click_agents") - 0.05 },
    { ...agentsItem, t: at("s4_click_agents"), click: true },
    ...NEW_EVENTS.flatMap((e, i) => [
      { ...slotC(i + 1), t: at(e) - 0.05 },
      { ...slotC(i + 1), t: at(e), click: true },
    ]),
    { ...slotC(4), t: at("s4_zoom_out_cards") + 0.2 },
    { ...controlItem, t: at("s4_click_control") - 0.05 },
    { ...controlItem, t: at("s4_click_control"), click: true },
    {
      x: controlItem.x + 120,
      y: controlItem.y + 700,
      t: at("s4_click_control") + 1.0,
    },
  ];
  const cursorO =
    1 -
    EASE(
      ramp(
        frame,
        ev("s4_click_control") + sec(0.4),
        ev("s4_click_control") + sec(0.9),
      ),
    );

  // Sidebar highlight: none on the chat, then Agents, then Control Room.
  const hiY = frame >= ev("s4_control_page") ? 158 : 196;
  const hiO = frame >= ev("s4_control_page") ? toControl : toAgents;

  // Page cross dissolve with a short blur through.
  const blurThrough = (p: number) => Math.sin(Math.PI * p) * 10;
  const agentsO = toAgents * (1 - toControl);

  return (
    <AbsoluteFill style={{ width: 1920, height: 1080 }}>
      <PlateBackground
        plate="02"
        duration={sec(DUR)}
        kbFrom={1.3}
        kbTo={1.33}
        timeOffset={5 + 12}
        {...S2_PLATE}
      />
      <AbsoluteFill style={{ transform: camTransform, transformOrigin: "0 0" }}>
        <div
          style={{
            position: "absolute",
            left: PRODUCT_RECT.x,
            top: PRODUCT_RECT.y,
            width: PRODUCT_RECT.w,
            height: PRODUCT_RECT.h,
          }}
        >
          <ProductWindow>
            {toAgents < 1 ? (
              <div
                style={{
                  filter:
                    toAgents > 0
                      ? `blur(${blurThrough(toAgents)}px)`
                      : undefined,
                  opacity: 1 - toAgents,
                }}
              >
                <ChatScreen s={chat} />
              </div>
            ) : null}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 177 + (hiY - 196),
                width: 222,
                height: 38,
                borderRadius: 8,
                background: "rgba(255,255,255,0.09)",
                opacity: hiO,
              }}
            />
            {agentsO > 0 ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: agentsO,
                  filter:
                    toAgents < 1 || (toControl > 0 && toControl < 1)
                      ? `blur(${blurThrough(toAgents < 1 ? toAgents : toControl)}px)`
                      : undefined,
                }}
              >
                <AgentsPage
                  s={{
                    created,
                    newSlot: Math.min(newSlot, 4),
                    newOpacity: lastNew < 0 ? 1 : sinceNew,
                    newPressed: pressed,
                  }}
                />
              </div>
            ) : null}
            {toControl > 0 ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: toControl,
                  filter:
                    toControl < 1
                      ? `blur(${blurThrough(toControl)}px)`
                      : undefined,
                }}
              >
                <ControlRoomPage
                  s={{ office, agents: agentsCount, activeTasks, irisMessage }}
                />
              </div>
            ) : null}
          </ProductWindow>
        </div>
        {cursorO > 0 ? <Cursor keys={cursorKeys} opacity={cursorO} /> : null}
      </AbsoluteFill>
      <TextBeat
        text={BEAT}
        startFrame={ev("s4_textbeat")}
        seed="s4-beat"
        panel="glass"
      />
      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};

export const SCENE04_FRAMES = f(DUR);
