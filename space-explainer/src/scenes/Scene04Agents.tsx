import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CHAT_CPS, EASE, EASE_SETTLE, type OrbPaletteKey } from "../theme";
import { sceneById, sceneFrames } from "../timeline";
import { PLACEHOLDERS as P } from "../placeholders";
import { PlateBackground } from "../backgrounds/PlateBackground";
import { Cursor, type CursorKey } from "../components/Cursor";
import { StatusPill } from "../components/StatusPill";
import { GuardLayer } from "../components/GuardLayer";
import { FeatureTitle, featureTitleTiming, frameRiseStyle } from "../components/FeatureTitle";
import { ChatScreen } from "../components/chat/ChatScreen";
import { navY } from "../components/chat/Sidebar";
import { camAt, camTransform, FRAME_CENTRE, nat, PRODUCT_RECT, ProductWindow, type CamKey } from "../components/chat/ProductWindow";
import { AgentsPage, slotRect, type CardData } from "../components/agents/AgentsPage";
import { CreateAgentPanel, PANEL, createButtonCentre, swatchCentre, NEW_AGENT_FIELDS } from "../components/agents/CreateAgentPanel";
import { ControlRoomPage, CR_OFFSET, type OutputCard } from "../components/office/ControlRoomPage";
import { AGENT_ORDER, feetScreen, type AgentKey, type OfficeState, type PedestalKey } from "../components/office/Office";
import { typeDuration } from "../lib/typewriter";
import type { TextBeatSpec } from "../lib/guards";
import { chatStateAt, S1_CHIP, S3_END_CAM, S3_KB_END } from "./Scene03Chat";
import { S2_PLATE } from "./Scene02Intro";

const S = "S04" as const;
const DUR = sceneById(S).duration;
const S3 = sceneById("S03");
const S3_FRAMES = sceneFrames("S03");
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (x: number, a: number, b: number) => interpolate(x, [a, b], [0, 1], clamp);

export const S4_TITLE = "Give every agent a job";
const TITLE_START = 0.15;
const TT = featureTitleTiming(S4_TITLE);

/** Scene 4 beats, seconds from the scene start. 4A is 0 to 10s, 4B is 10 to 28s. */
export const S4 = {
  sinkEnd: 0.6,
  frameRise: TITLE_START + TT.frameRiseStart,
  clickAgents: 3.75,
  agentsPage: 3.8,
  clickTile: 4.35,
  panelOpen: 4.4,
  nameType: 4.85,
  handle: 5.05,
  roleType: 5.15,
  clickSwatch: 5.45,
  taskType: 5.5,
  clickCreate: 7.85,
  panelClose: 7.9,
  created: { nora: 8.05, theo: 8.6, owen: 9.2 } as Record<Exclude<AgentKey, "iris">, number>,
  clickControl: 10.6,
  controlPage: 10.65,
  pillMeet: 10.4,
  arrive: { iris: 11.5, nora: 13.5, theo: 15.0, owen: 16.5 } as Record<AgentKey, number>,
  claim: 18.0,
  pillClaim: 18.0,
  pathStart: 19.3,
  seg: 0.8,
  pillTandem: 20.55,
  zoomOutPath: 23.4,
  mini: 23.6,
  outputs: [24.6, 25.2, 25.8],
  pillReview: 26.4,
};
const reachAt = (i: number) => S4.pathStart + S4.seg * (i + 1); // Nora, Theo, Owen

const PALETTE: Record<AgentKey, OrbPaletteKey> = { iris: "iris", nora: "nora", theo: "theo", owen: "owen" };
const ROLE: Record<AgentKey, string> = { iris: P.agents.frontDesk.role, nora: P.agents.intake.role, theo: P.agents.policy.role, owen: P.agents.evidence.role };
const NAME: Record<AgentKey, string> = { iris: "Iris", nora: "Nora", theo: "Theo", owen: "Owen" };
const LINKS: { from: AgentKey; to: PedestalKey }[] = [
  { from: "nora", to: "gmail" },
  { from: "theo", to: "drive" },
  { from: "owen", to: "sheets" },
];

/** Office point (screenshot space) to pre-camera screen px. */
const cr = (x: number, y: number) => nat(x + CR_OFFSET.x, y + CR_OFFSET.y);
const plateFocus = (k: AgentKey) => {
  const f = feetScreen(k);
  return cr(f.x, f.y + 10);
};
const mid = (a: { x: number; y: number }, b: { x: number; y: number }) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const panelCentre = nat(PANEL.x + PANEL.w / 2, PANEL.y + PANEL.h / 2);
const gridCentre = nat(1071, 400);

export const S4_CAM_KEYS: CamKey[] = [
  { t: 0, c: S3_END_CAM },
  // Carry Scene 3's slow drift through the sink so the boundary is continuous.
  { t: S4.sinkEnd, c: { x: S3_END_CAM.x + 5.8, y: S3_END_CAM.y + 1.8, z: S3_END_CAM.z }, lin: true },
  { t: 1.6, c: { ...FRAME_CENTRE, z: 1 } },
  { t: S4.panelOpen, c: { ...FRAME_CENTRE, z: 1 } },
  { t: S4.panelOpen + 0.5, c: { ...panelCentre, z: 1.3 } },
  { t: S4.panelClose, c: { x: panelCentre.x + 6, y: panelCentre.y + 4, z: 1.31 }, lin: true },
  { t: S4.panelClose + 0.6, c: { ...gridCentre, z: 1.35 } },
  { t: 10.0, c: { x: gridCentre.x + 14, y: gridCentre.y + 6, z: 1.36 }, lin: true },
  { t: 10.45, c: { ...FRAME_CENTRE, z: 1 } },
  { t: S4.arrive.iris, c: { ...FRAME_CENTRE, z: 1 } },
  { t: S4.arrive.iris + 0.8, c: { ...plateFocus("iris"), z: 1.4 } },
  { t: S4.arrive.nora, c: { x: plateFocus("iris").x + 16, y: plateFocus("iris").y + 5, z: 1.42 }, lin: true },
  { t: S4.arrive.nora + 0.5, c: { ...plateFocus("nora"), z: 1.4 } },
  { t: S4.arrive.theo, c: { x: plateFocus("nora").x + 16, y: plateFocus("nora").y + 5, z: 1.42 }, lin: true },
  { t: S4.arrive.theo + 0.5, c: { ...plateFocus("theo"), z: 1.4 } },
  { t: S4.arrive.owen, c: { x: plateFocus("theo").x + 16, y: plateFocus("theo").y + 5, z: 1.42 }, lin: true },
  { t: S4.arrive.owen + 0.5, c: { ...plateFocus("owen"), z: 1.4 } },
  { t: 17.5, c: { x: plateFocus("owen").x + 12, y: plateFocus("owen").y + 4, z: 1.42 }, lin: true },
  { t: 18.0, c: { ...FRAME_CENTRE, z: 1 } },
  { t: S4.pathStart, c: { x: FRAME_CENTRE.x + 4, y: FRAME_CENTRE.y + 2, z: 1.01 }, lin: true },
  { t: S4.pathStart + 0.45, c: { ...mid(plateFocus("iris"), plateFocus("nora")), z: 1.5 } },
  { t: reachAt(0), c: { x: mid(plateFocus("iris"), plateFocus("nora")).x + 14, y: mid(plateFocus("iris"), plateFocus("nora")).y + 4, z: 1.51 }, lin: true },
  { t: reachAt(1), c: { ...mid(plateFocus("nora"), plateFocus("theo")), z: 1.5 } },
  { t: reachAt(2), c: { ...mid(plateFocus("theo"), plateFocus("owen")), z: 1.5 } },
  { t: S4.zoomOutPath, c: { ...mid(plateFocus("theo"), plateFocus("owen")), z: 1.5 }, lin: true },
  { t: S4.zoomOutPath + 0.45, c: { ...FRAME_CENTRE, z: 1 } },
  { t: S4.outputs[0], c: { ...FRAME_CENTRE, z: 1 } },
  // A very slow push while the results arrive; still from the final pill to the end.
  { t: S4.pillReview, c: { x: FRAME_CENTRE.x, y: FRAME_CENTRE.y + 3, z: 1.012 }, lin: true },
];

const slotCentre = (i: number) => {
  const r = slotRect(i);
  return nat(r.x + r.w / 2, r.y + r.h / 2);
};
export const S4_CURSOR: CursorKey[] = [
  { ...nat(1350, 700), t: 2.9 },
  { ...nat(63, navY("agents")), t: S4.clickAgents - 0.05 },
  { ...nat(63, navY("agents")), t: S4.clickAgents, click: true },
  { ...slotCentre(1), t: S4.clickTile - 0.05 },
  { ...slotCentre(1), t: S4.clickTile, click: true },
  { ...nat(swatchCentre(1).x, swatchCentre(1).y), t: S4.clickSwatch - 0.05 },
  { ...nat(swatchCentre(1).x, swatchCentre(1).y), t: S4.clickSwatch, click: true },
  { ...nat(createButtonCentre().x, createButtonCentre().y), t: S4.clickCreate - 0.05 },
  { ...nat(createButtonCentre().x, createButtonCentre().y), t: S4.clickCreate, click: true },
  // Rest on the page while the camera holds on the cards, then head for the sidebar as it zooms out.
  { ...nat(createButtonCentre().x, createButtonCentre().y - 60), t: 10.0 },
  { ...nat(85, navY("control")), t: S4.clickControl - 0.05 },
  { ...nat(85, navY("control")), t: S4.clickControl, click: true },
  { ...nat(160, 600), t: S4.clickControl + 1.0 },
];

const TEAM_CARD = (k: Exclude<AgentKey, "iris">): CardData => {
  const a = P.agentsPage.team.find((x) => x.name === NAME[k])!;
  return { name: a.name, handle: a.handle, role: a.role, palette: PALETTE[k], line: P.agentAccessLine, badges: [{ label: "Idle", tone: "grey" }] };
};
const IRIS_CARD: CardData = {
  name: P.agentsPage.iris.name,
  handle: P.agentsPage.iris.handle,
  role: P.agentsPage.iris.role,
  palette: "iris",
  badges: [
    { label: P.agentsPage.iris.state, tone: "grey" },
    { label: P.agentsPage.iris.badge, tone: "olive" },
  ],
};

const OUTPUTS = P.controlRoom.outputs;

const PILLS: { label: string; at: number; until: number; spin: boolean }[] = [
  { label: P.controlRoom.pills[0], at: S4.pillMeet, until: 13.2, spin: false },
  { label: P.controlRoom.pills[1], at: S4.pillClaim, until: S4.pillTandem, spin: true },
  { label: P.controlRoom.pills[2], at: S4.pillTandem, until: 23.6, spin: true },
  { label: P.controlRoom.pills[3], at: S4.pillReview, until: 999, spin: false },
];

export const SCENE04_TEXT: TextBeatSpec[] = [
  { id: "title", text: S4_TITLE, readyAt: TITLE_START, leaveAt: TITLE_START + TT.exitStart, fontPx: 88 },
  {
    id: "panel",
    text: `${NEW_AGENT_FIELDS.name} ${NEW_AGENT_FIELDS.role} ${NEW_AGENT_FIELDS.taskLines.join(" ")}`,
    readyAt: S4.taskType + typeDuration(NEW_AGENT_FIELDS.taskLines.join("\n"), CHAT_CPS, "panel-task"),
    leaveAt: S4.panelClose,
    fontPx: 20,
    ui: true,
    exception: "Brief: the panel is filled and created between 4.0s and 8.0s",
  },
  ...(["nora", "theo", "owen"] as const).map((k) => ({
    id: `card-${k}`,
    text: `${NAME[k]} ${ROLE[k]} ${P.agentAccessLine} Idle`,
    readyAt: S4.created[k] + 0.4,
    leaveAt: 10.0,
    fontPx: 20,
    ui: true,
    exception: "Brief: Theo and Owen appear 0.6s apart and the set holds 0.8s",
  })),
  ...PILLS.map((p) => ({ id: `pill-${p.label}`, text: p.label, readyAt: p.at + 0.3, leaveAt: Math.min(p.until, DUR), fontPx: 28, carriesOver: p.until > DUR })),
  ...(["nora", "theo", "owen"] as const).map((k, i) => ({ id: `plate-${k}`, text: P.controlRoom.statuses[i], readyAt: reachAt(i), leaveAt: S4.zoomOutPath, fontPx: 22, ui: true })),
  ...OUTPUTS.map((o, i) => ({ id: `output-${i + 1}`, text: `${o.text} ${o.flag ?? ""}`, readyAt: S4.outputs[i] + 0.5, leaveAt: DUR, fontPx: 21, ui: true, carriesOver: true })),
];

export const Scene04Agents: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const F = (s: number) => Math.round(s * fps);
  const clock = sceneById(S).start;

  // ---- Frame: the Scene 3 frame sinks and fades, then rises again under the title.
  const sink = EASE(ramp(t, 0, S4.sinkEnd));
  const rise = EASE(ramp(t, S4.frameRise, S4.frameRise + 0.9));
  const frameStyle: React.CSSProperties =
    t < S4.sinkEnd + 0.01
      ? { opacity: 1 - sink, transform: `translateY(${40 * sink}px) scale(${1 - 0.06 * sink})`, transformOrigin: "50% 50%" }
      : frameRiseStyle(rise);

  // ---- Pages
  const showChatOpenCard = t < S4.sinkEnd + 0.01;
  const chat = chatStateAt(S3_FRAMES, fps, -S3_FRAMES);
  chat.clock = S3.start + S3.duration; // orb clocks continue from Scene 3's last frame
  if (!showChatOpenCard) {
    chat.cardOpen = 0;
    chat.citeActive = 0;
  }
  const toAgents = EASE(ramp(t, S4.agentsPage, S4.agentsPage + 0.3));
  const toControl = EASE(ramp(t, S4.controlPage, S4.controlPage + 0.6));
  const blurThrough = (p: number) => Math.sin(Math.PI * p) * 10;

  // ---- 4A: creation panel and cards
  const panelOpen = EASE(ramp(t, S4.panelOpen, S4.panelOpen + 0.3)) * (1 - EASE(ramp(t, S4.panelClose, S4.panelClose + 0.25)));
  const created = (k: Exclude<AgentKey, "iris">) => EASE(ramp(t, S4.created[k], S4.created[k] + 0.4));
  const team = ["nora", "theo", "owen"] as const;
  const doneCount = team.filter((k) => t >= S4.created[k]).length;
  const tileSlot = 1 + doneCount;
  const lastCreated = doneCount > 0 ? S4.created[team[doneCount - 1]] : -1;
  const tileOpacity = lastCreated < 0 ? 1 : EASE(ramp(t, lastCreated + 0.15, lastCreated + 0.45));
  const tilePressed = Math.max(0, 1 - Math.abs(t - S4.clickTile) / 0.15);

  // ---- 4B: office
  const agentAnim = (k: AgentKey, i: number) => {
    const a = S4.arrive[k];
    const drop = EASE_SETTLE(ramp(t, a, a + 0.45));
    const plateOpacity = EASE(ramp(t, a + 0.4, a + 0.75));
    let status: string = k === "iris" ? P.controlRoom.irisStatusIdle : "Idle";
    let pulse = 0;
    if (k === "iris" && t >= S4.claim + 0.6) {
      status = P.controlRoom.irisStatusBusy;
      pulse = Math.sin(Math.PI * ramp(t, S4.claim + 0.6, S4.claim + 1.2));
    }
    if (k !== "iris") {
      const r = reachAt(i - 1);
      if (t >= r) {
        status = P.controlRoom.statuses[i - 1];
        pulse = Math.sin(Math.PI * ramp(t, r, r + 0.6));
      }
    }
    return { drop, wave: t - (a + 0.25), plate: { role: ROLE[k], status, pulse, opacity: plateOpacity } };
  };
  const office: OfficeState = {
    agents: Object.fromEntries(AGENT_ORDER.map((k, i) => [k, agentAnim(k, i)])) as OfficeState["agents"],
    names: NAME,
    palettes: PALETTE,
    path: [0, 1, 2].reduce((a, i) => a + ramp(t, S4.pathStart + S4.seg * i, S4.pathStart + S4.seg * (i + 1)), 0) / 3,
    links: LINKS.map((l, i) => ({ ...l, draw: EASE(ramp(t, reachAt(i), reachAt(i) + 0.35)), pulse: ramp(t, reachAt(i) + 0.2, reachAt(i) + 1.0) })),
    claim: EASE_SETTLE(ramp(t, S4.claim, S4.claim + 0.5)),
    clock,
  };
  const agentsCount = AGENT_ORDER.filter((k) => t >= S4.arrive[k] + 0.2).length;
  const outputs: OutputCard[] = OUTPUTS.map((o, i) => ({
    agent: NAME[o.agent as AgentKey],
    role: ROLE[o.agent as AgentKey],
    palette: PALETTE[o.agent as AgentKey],
    text: o.text,
    flag: o.flag,
    appear: EASE(ramp(t, S4.outputs[i], S4.outputs[i] + 0.5)),
  }));

  // ---- Camera and cursor
  const cam = camAt(S4_CAM_KEYS, t, EASE);
  const cursorO = EASE(ramp(t, 2.9, 3.2)) * (1 - EASE(ramp(t, S4.clickControl + 0.5, S4.clickControl + 1.0)));
  const s3CursorO = 1 - sink;

  const activePill = PILLS.find((p) => t >= p.at && t < p.until + 0.35);

  return (
    <AbsoluteFill style={{ width: 1920, height: 1080 }}>
      <PlateBackground plate="02" duration={F(DUR)} kbFrom={S3_KB_END} kbTo={S3_KB_END + 0.03} timeOffset={sceneById("S02").duration + S3.duration} {...S2_PLATE} />
      <FeatureTitle text={S4_TITLE} startFrame={F(TITLE_START)} />
      {sink < 1 || rise > 0 ? (
        <AbsoluteFill style={{ transform: camTransform(cam), transformOrigin: "0 0" }}>
          <div style={{ position: "absolute", left: PRODUCT_RECT.x, top: PRODUCT_RECT.y, width: PRODUCT_RECT.w, height: PRODUCT_RECT.h, ...frameStyle }}>
            <ProductWindow>
              {toAgents < 1 ? (
                <div style={{ position: "absolute", inset: 0, opacity: 1 - toAgents, filter: toAgents > 0 ? `blur(${blurThrough(toAgents)}px)` : undefined }}>
                  <ChatScreen s={chat} />
                </div>
              ) : null}
              {toAgents > 0 && toControl < 1 ? (
                <div style={{ position: "absolute", inset: 0, opacity: toAgents * (1 - toControl), filter: (toAgents < 1 || toControl > 0) ? `blur(${blurThrough(toAgents < 1 ? toAgents : toControl)}px)` : undefined }}>
                  <AgentsPage
                    s={{
                      cards: [
                        { d: IRIS_CARD, slot: 0, appear: 1 },
                        ...team.map((k, i) => ({ d: TEAM_CARD(k), slot: i + 1, appear: created(k) })),
                      ],
                      tileSlot,
                      tileOpacity,
                      tilePressed,
                      clock,
                    }}
                  />
                  <CreateAgentPanel
                    s={{
                      open: panelOpen,
                      nameStart: F(S4.nameType),
                      roleStart: F(S4.roleType),
                      taskStart: F(S4.taskType),
                      handle: EASE(ramp(t, S4.handle, S4.handle + 0.3)),
                      swatch: t >= S4.clickSwatch ? 1 : -1,
                      createPressed: Math.max(0, 1 - Math.abs(t - S4.clickCreate) / 0.15),
                      clock,
                    }}
                  />
                </div>
              ) : null}
              {toControl > 0 ? (
                <div style={{ position: "absolute", inset: 0, opacity: toControl, filter: toControl < 1 ? `blur(${blurThrough(toControl)}px)` : undefined }}>
                  <ControlRoomPage
                    s={{
                      office,
                      agents: agentsCount,
                      activeTasks: t >= S4.claim + 0.4 ? 1 : 0,
                      irisMessage: EASE(ramp(t, S4.claim + 0.2, S4.claim + 0.6)),
                      mini: EASE(ramp(t, S4.mini, S4.mini + 1.0)),
                      outputs,
                      clock,
                    }}
                  />
                </div>
              ) : null}
            </ProductWindow>
          </div>
          {s3CursorO > 0 ? <Cursor keys={[{ ...S1_CHIP, t: -1 }]} opacity={s3CursorO} /> : null}
          {cursorO > 0 ? <Cursor keys={S4_CURSOR} opacity={cursorO} /> : null}
        </AbsoluteFill>
      ) : null}

      {activePill ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 912, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              opacity: EASE(ramp(t, activePill.at, activePill.at + 0.3)) * (1 - EASE(ramp(t, activePill.until, activePill.until + 0.35))),
              transform: `translateY(${(1 - EASE(ramp(t, activePill.at, activePill.at + 0.3))) * 14}px)`,
            }}
          >
            <StatusPill label={activePill.label} spinning={activePill.spin} />
          </div>
        </div>
      ) : null}

      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};
