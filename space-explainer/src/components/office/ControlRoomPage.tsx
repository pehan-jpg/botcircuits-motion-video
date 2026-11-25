import React from "react";
import {
  Activity,
  ArrowUp,
  Bot,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Expand,
  Flag,
  History,
  Layers,
  LayoutGrid,
  ListChecks,
  MessageSquare,
  Plus,
  Radio,
  RotateCcw,
  RotateCw,
  Search,
  Shapes,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { FONT, UIN, type OrbPaletteKey } from "../../theme";
import { PLACEHOLDERS as P } from "../../placeholders";
import { Sidebar, TopBar, UI } from "../chat/Sidebar";
import { SpaceOrb } from "../SpaceOrb";
import { FIGURE_H, LOOKS, NamePlate, Office, Person, ThoughtBubble, type AgentKey, type BubbleLine, type OfficeState, type PlateState, type Pose } from "./Office";
import type { Facing } from "./motion";
import { SourceChip } from "../pages/common";

/** Screenshot 02-control-room-office.png is drawn at this offset inside the native screen. */
export const CR_OFFSET = { x: 242, y: 52 };
/** The office canvas inside the page (screenshot coordinates). */
export const CANVAS = { x: 12, y: 201, w: 1248, h: 621 };
/** Where the canvas goes when the room is minimised (page coordinates) and its scale. */
export const MINI = { x: 24, y: 192, scale: 0.4 };
/** Output card text: 21px on screen at 1x. */
export const OUTPUT_TEXT = 22.8;

const t: React.CSSProperties = { fontFamily: FONT.sans, color: UI.text, position: "absolute", whiteSpace: "nowrap" };

const Counter: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({ icon, label, value }) => (
  <div style={{ height: 32, padding: "0 12px", borderRadius: 8, border: `1px solid ${UI.line}`, display: "flex", alignItems: "center", gap: 7, fontFamily: FONT.sans, fontSize: UIN.tabs, color: "#5B6478", whiteSpace: "nowrap" }}>
    {icon}
    {label} <span style={{ fontWeight: 700, color: UI.text }}>{value}</span>
  </div>
);

export type OutputCard = { agent: string; role: string; palette: OrbPaletteKey; text: string; flag?: string; cites?: string[]; citeActive?: number; /** Hide the [S1] chip (it has left as a shared element). */ citeHidden?: boolean; appear: number };

/**
 * One persistent figure per agent. The same element carries the agent from its
 * hero introduction to its desk and along its walks: a single transform
 * (translate to the feet point, then scale) driven by one path function of the
 * frame. The name plate follows the same path parameter.
 */
export type FigureRender = {
  k: AgentKey;
  name: string;
  palette: OrbPaletteKey;
  /** Feet point in page (room) coordinates, and figure scale (1 in the room). */
  x: number;
  y: number;
  scale: number;
  opacity: number;
  zIndex: number;
  /** 0 to 1: dimmed with the room (placed agents behind a hero). */
  dim: number;
  facings: { f: Facing; w: number }[];
  pose: Pose;
  plate: { x: number; y: number; scale: number; opacity: number; state: PlateState; read: boolean };
  bubble?: { lines: BubbleLine[]; opacity: number };
  /** True while in a hero or its morph (excluded from the per frame motion limit). */
  morphing: boolean;
};

export type ControlRoomState = {
  office: OfficeState;
  /** 0 to 1: the room dims to 35 percent and blurs 6px behind a hero. */
  dim: number;
  figures: FigureRender[];
  /** Camera zoom, recorded on each agent's guard marker for the motion test. */
  camZoom?: number;
  agents: number;
  activeTasks: number;
  irisMessage: number;
  /** 0 to 1: the room minimises into a small live card. */
  mini: number;
  outputs: OutputCard[];
  clock: number;
};

const OutputCardView: React.FC<{ c: OutputCard; y: number; clock: number }> = ({ c, y, clock }) => (
  <div
    data-guard="uitext"
    data-guard-read="1"
    data-guard-label={`Output ${c.agent}`}
    style={{
      position: "absolute",
      left: 560,
      top: y,
      width: 690,
      boxSizing: "border-box",
      padding: "16px 22px 18px",
      borderRadius: 16,
      background: "#FFFFFF",
      border: "1px solid #E7E9F2",
      boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
      fontFamily: FONT.sans,
      color: UI.text,
      opacity: c.appear,
      filter: c.appear < 1 ? `blur(${(1 - c.appear) * 10}px)` : undefined,
      transform: `translateY(${(1 - c.appear) * 16}px)`,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <SpaceOrb size={26} palette={c.palette} timeOffset={clock} />
      <div style={{ fontSize: UIN.button, fontWeight: 700 }}>{c.agent}</div>
      <div style={{ fontSize: UIN.button, color: UI.muted }}>{c.role}</div>
    </div>
    <div style={{ fontSize: OUTPUT_TEXT, lineHeight: 1.38 }}>
      {c.text}
      {c.cites
        ? c.cites.map((id) => (
            <span key={id} data-cite={id} data-guard="box" data-guard-label={`Cite ${c.agent} ${id}`} style={{ marginLeft: 8, verticalAlign: "2px", opacity: id === "S1" && c.citeHidden ? 0 : 1 }}>
              <SourceChip id={id} active={id === "S1" ? c.citeActive ?? 0 : 0} />
            </span>
          ))
        : null}
    </div>
    {c.flag ? (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 10, padding: "4px 12px", borderRadius: 8, background: "#F4F5F9", border: `1px solid ${UI.line}`, fontSize: OUTPUT_TEXT, color: UI.text }}>
        <Flag size={18} color={UI.secondary} />
        {c.flag}
      </div>
    ) : null}
  </div>
);

/** Control Room, Agents tab: rebuilt from reference/ui/02-control-room-office.png. */
export const ControlRoomPage: React.FC<{ s: ControlRoomState }> = ({ s }) => {
  const m = s.mini;
  const sc = 1 - (1 - MINI.scale) * m;
  const cx = CANVAS.x + (MINI.x - CANVAS.x) * m;
  const cy = CANVAS.y + (MINI.y - CANVAS.y) * m;
  const chromeO = 1 - m;
  let y = 141;
  const ys = s.outputs.map((c) => {
    const at = y;
    y += c.flag ? 196 : 136;
    return at;
  });
  return (
    <div style={{ position: "absolute", inset: 0, background: UI.bg }}>
      <Sidebar active="control" />
      <TopBar page="Control Room" actions={false} />
      <div style={{ position: "absolute", left: CR_OFFSET.x, top: CR_OFFSET.y, width: 1633, height: 836 }}>
        {/* Header */}
        <div style={{ position: "absolute", left: 12, top: 22, width: 38, height: 38, borderRadius: 19, border: `1px solid ${UI.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Layers size={18} color="#0D1224" />
        </div>
        <div style={{ ...t, left: 63, top: 18, fontSize: UIN.pageTitle, fontWeight: 600, letterSpacing: "-0.01em" }}>Control Room</div>
        <div style={{ ...t, left: 63, top: 50, fontSize: UIN.helper, color: "#5B6478" }}>A live view of your workspace</div>
        <div style={{ position: "absolute", left: 1370, top: 22, display: "flex", gap: 6, padding: 5, borderRadius: 10, border: `1px solid ${UI.line}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 12px", borderRadius: 8, background: "#EEF0FA", fontFamily: FONT.sans, fontSize: UIN.button, fontWeight: 600, color: UI.text, whiteSpace: "nowrap" }}>
            <MessageSquare size={14} color="#0D1224" />
            Hide chat
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 12px", fontFamily: FONT.sans, fontSize: UIN.button, color: "#5B6478", whiteSpace: "nowrap" }}>
            <Expand size={14} color="#5B6478" />
            Fullscreen
          </div>
        </div>
        {/* Tabs */}
        <div style={{ position: "absolute", left: 11, top: 84, display: "flex", gap: 4, padding: 5, borderRadius: 11, border: `1px solid ${UI.line}` }}>
          {[
            { l: "Dashboard", i: <LayoutGrid size={14} color="#5B6478" /> },
            { l: "Agents", i: <Bot size={14} color="#0D1224" />, on: true },
            { l: "Records", i: <ListChecks size={14} color="#5B6478" /> },
          ].map((tab) => (
            <div key={tab.l} style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 12px", borderRadius: 8, background: tab.on ? "#EEF0FA" : "transparent", fontFamily: FONT.sans, fontSize: UIN.tabs, fontWeight: tab.on ? 700 : 400, color: tab.on ? UI.text : "#5B6478", whiteSpace: "nowrap" }}>
              {tab.i}
              {tab.l}
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 720, top: 88, display: "flex", gap: 8 }}>
          <Counter icon={<Bot size={14} color="#5B6478" />} label="Agents" value={s.agents} />
          <Counter icon={<Shapes size={14} color="#5B6478" />} label="Resources" value={P.controlRoom.resources} />
          <Counter icon={<Activity size={14} color="#5B6478" />} label="Active tasks" value={s.activeTasks} />
        </div>
        <Radio size={14} color="#3DBE5A" style={{ position: "absolute", left: 1180, top: 97 }} />
        <div style={{ ...t, left: 1199, top: 94, fontSize: UIN.helper, color: "#3DBE5A" }}>Live</div>

        {/* Canvas panel chrome (fades out as the room minimises) */}
        <div style={{ position: "absolute", left: 11, top: 141, width: 1250, height: 694, borderRadius: 14, border: `1px solid ${UI.line}`, background: "#FFFFFF", opacity: chromeO }}>
          <div style={{ position: "absolute", left: 13, top: 13, width: 340, height: 34, borderRadius: 7, background: "#FFFFFF" }} />
          <Search size={15} color="#5B6478" style={{ position: "absolute", left: 24, top: 23 }} />
          <div style={{ ...t, left: 47, top: 19, fontSize: UIN.helper, color: "#5B6478" }}>Find an agent or resource…</div>
          <div style={{ position: "absolute", left: 1095, top: 10, width: 141, height: 40, borderRadius: 8, border: `1px solid ${UI.line}` }} />
          <ChevronLeft size={15} color="#5B6478" style={{ position: "absolute", left: 1106, top: 23 }} />
          <div style={{ ...t, left: 1128, top: 19, fontSize: UIN.button, fontWeight: 600 }}>Floor 1 / 2</div>
          <ChevronRight size={15} color="#0D1224" style={{ position: "absolute", left: 1212, top: 23 }} />
        </div>

        {/* Minimised card frame and label */}
        {m > 0 ? (
          <div style={{ position: "absolute", left: MINI.x - 10, top: MINI.y - 44, width: CANVAS.w * MINI.scale + 20, height: CANVAS.h * MINI.scale + 54, borderRadius: 14, border: `1px solid ${UI.line}`, background: "#FFFFFF", opacity: m }}>
            <div style={{ ...t, left: 14, top: 9, fontSize: UIN.button, fontWeight: 700 }}>Control Room</div>
            <Radio size={14} color="#3DBE5A" style={{ position: "absolute", right: 56, top: 14 }} />
            <div style={{ ...t, right: 16, top: 10, fontSize: UIN.helper, color: "#3DBE5A" }}>Live</div>
          </div>
        ) : null}

        {/* The office canvas: full size, then minimised */}
        <div
          style={{
            position: "absolute",
            left: cx,
            top: cy,
            width: CANVAS.w,
            height: CANVAS.h,
            transform: `scale(${sc})`,
            transformOrigin: "0 0",
            background: "#EAE6DD",
            overflow: "hidden",
            borderRadius: 4 + 16 * m,
            filter: s.dim > 0.001 ? `brightness(${1 - 0.65 * s.dim}) blur(${6 * s.dim}px)` : undefined,
          }}
        >
          <div style={{ position: "absolute", left: -CANVAS.x, top: -CANVAS.y }}>
            <Office s={s.office} readPlates={s.mini < 0.5} drawAgents={false} />
          </div>
          <div style={{ position: "absolute", left: 12, top: 565, display: "flex", alignItems: "center", gap: 18, height: 44, padding: "0 16px", borderRadius: 9, background: UI.primaryBg, boxShadow: "0 4px 12px rgba(0,0,0,0.12)", fontFamily: FONT.sans, fontSize: UIN.helper, color: "#E7E9F2", whiteSpace: "nowrap", opacity: chromeO }}>
            <RotateCcw size={16} color="#E7E9F2" />
            <RotateCw size={16} color="#E7E9F2" />
            <ZoomOut size={16} color="#E7E9F2" />
            <ZoomIn size={16} color="#E7E9F2" />
            <span>100%</span>
            <span>Reset view</span>
          </div>
        </div>

        {/* Agents: outside the dimmed canvas, same transform as the canvas */}
        <div style={{ position: "absolute", left: cx, top: cy, width: CANVAS.w, height: CANVAS.h, transform: `scale(${sc})`, transformOrigin: "0 0", overflow: m > 0 ? "hidden" : "visible", borderRadius: 4 + 16 * m }}>
          <div style={{ position: "absolute", left: -CANVAS.x, top: -CANVAS.y, width: 1633, height: 836 }}>
            <AgentLayer figures={s.figures} clock={s.clock} readPlates={s.mini < 0.5} zoom={s.camZoom ?? 1} />
          </div>
        </div>

        {/* Results the agents bring */}
        {s.outputs.map((c, i) => (c.appear > 0 ? <OutputCardView key={c.agent} c={c} y={ys[i]} clock={s.clock} /> : null))}

        {/* Chat panel */}
        <div style={{ position: "absolute", left: 1273, top: 141, width: 380, height: 694, borderRadius: 14, border: `1px solid ${UI.line}`, background: "#FFFFFF" }}>
          <div style={{ position: "absolute", left: 13, top: 15, width: 28, height: 28, borderRadius: 7, background: UI.lilacBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MessageSquare size={14} color={UI.lilacText} />
          </div>
          <div style={{ ...t, left: 49, top: 17, fontSize: UIN.button, fontWeight: 700 }}>Chat</div>
          <div style={{ position: "absolute", left: 315, top: 13, width: 32, height: 32, borderRadius: 7, background: "#F7F8FB", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plus size={16} color={UI.primaryText} />
          </div>
          <div style={{ position: "absolute", left: 13, top: 57, width: 334, height: 36, borderRadius: 8, border: `1px solid ${UI.line}` }} />
          <History size={14} color="#5B6478" style={{ position: "absolute", left: 25, top: 68 }} />
          <div style={{ ...t, left: 47, top: 64, fontSize: UIN.helper, color: "#5B6478" }}>New conversation</div>
          <ChevronDown size={14} color="#5B6478" style={{ position: "absolute", left: 323, top: 68 }} />
          {s.irisMessage > 0 ? (
            <div style={{ position: "absolute", left: 13, top: 120, width: 334, opacity: s.irisMessage, transform: `translateY(${(1 - s.irisMessage) * 14}px)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <SpaceOrb size={24} palette="iris" timeOffset={s.clock} />
                <div style={{ fontFamily: FONT.sans, fontSize: UIN.button, fontWeight: 700, color: UI.text }}>Iris</div>
              </div>
              <div data-guard="uitext" data-guard-label="Iris message" style={{ fontFamily: FONT.sans, fontSize: 16.5, lineHeight: 1.4, color: UI.text, background: "#FFFFFF", borderRadius: 12, padding: "10px 14px" }}>
                {P.controlRoom.irisMessage}
              </div>
            </div>
          ) : null}
          <div style={{ position: "absolute", left: 13, top: 561, width: 334, height: 120, borderRadius: 12, border: `1px solid ${UI.line}` }} />
          <div style={{ ...t, left: 28, top: 578, fontSize: UIN.helper, color: "#5B6478" }}>Message or @mention an agent…</div>
          <Plus size={16} color="#5B6478" style={{ position: "absolute", left: 30, top: 645 }} />
          <Zap size={14} color="#0D1224" style={{ position: "absolute", left: 66, top: 646 }} />
          <div style={{ ...t, left: 86, top: 641, fontSize: UIN.button, fontWeight: 500 }}>Auto</div>
          <div style={{ position: "absolute", left: 304, top: 637, width: 30, height: 30, borderRadius: 15, background: "#EEF0FA", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ArrowUp size={15} color="#777" />
          </div>
        </div>
      </div>
    </div>
  );
};

const dimFilter = (d: number) => (d > 0.001 ? `brightness(${1 - 0.65 * d}) blur(${6 * d}px)` : undefined);

/** Figures, plates and bubbles: one persistent element of each per agent, never unmounted or duplicated. */
const AgentLayer: React.FC<{ figures: FigureRender[]; clock: number; readPlates: boolean; zoom: number }> = ({ figures, clock, readPlates, zoom }) => (
  <>
    {figures.map((g) => (
      <div key={`fig-${g.k}`} data-agent-figure={g.k} style={{ position: "absolute", left: 0, top: 0, zIndex: g.zIndex, opacity: g.opacity, filter: dimFilter(g.dim) }}>
        <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <g transform={`translate(${g.x} ${g.y}) scale(${g.scale})`}>
            {g.facings.map(({ f, w }) => (
              <g key={`${f.facing}-${f.mirror}`} opacity={w}>
                <Person look={LOOKS[g.k]} pose={{ ...g.pose, facing: f.facing, mirror: f.mirror }} />
              </g>
            ))}
          </g>
        </svg>
        {/* Motion test marker at the feet point */}
        <div
          data-guard="agent"
          data-guard-label={g.k}
          data-zoom={String(zoom)}
          data-morph={g.morphing ? "1" : "0"}
          style={{ position: "absolute", left: g.x - 0.5, top: g.y - 0.5, width: 1, height: 1, opacity: g.opacity > 0.05 ? 1 : 0 }}
        />
      </div>
    ))}
    {figures.map((g) =>
      g.plate.opacity > 0 ? (
        <div key={`plate-${g.k}`} style={{ position: "absolute", left: 0, top: 0, zIndex: 2000 + g.zIndex, filter: dimFilter(g.dim) }}>
          <NamePlate
            name={g.name}
            p={{ ...g.plate.state, opacity: g.plate.opacity }}
            palette={g.palette}
            clock={clock}
            read={readPlates && g.dim < 0.5}
            style={{ left: g.plate.x, top: g.plate.y, transform: `translateX(-50%) scale(${g.plate.scale})`, transformOrigin: "50% 0" }}
          />
        </div>
      ) : null,
    )}
    {figures.map((g) =>
      g.bubble && g.bubble.opacity > 0 ? (
        <div key={`bubble-${g.k}`} style={{ position: "absolute", left: 0, top: 0, zIndex: 4000 }}>
          <ThoughtBubble x={g.x} y={g.y - FIGURE_H * g.scale - 30} lines={g.bubble.lines} opacity={g.bubble.opacity} name={g.name} />
        </div>
      ) : null,
    )}
  </>
);
