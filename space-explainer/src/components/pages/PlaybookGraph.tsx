import React from "react";
import { Img, staticFile } from "remotion";
import { Braces, Check, ChevronDown, Flag, GitBranch, ListOrdered, Maximize, Minus, Play, Plus, Save, Settings, Share2, ShieldCheck, Trash2, X } from "lucide-react";
import { CHAT_CPS, FONT, UIN, type OrbPaletteKey } from "../../theme";
import { PLACEHOLDERS as P } from "../../placeholders";
import { Sidebar, TopBar, UI } from "../chat/Sidebar";
import { SpaceOrb } from "../SpaceOrb";
import { HumanGlyph } from "../HumanGlyph";
import { Typewriter } from "../Typewriter";
import { READ } from "./common";

/**
 * Playbook page, Graph view, rebuilt from reference/ui/11-playbook-graph.png
 * in the light theme: toolbar, note line, dotted canvas with zoom controls,
 * the Add control and its menu, the step graph, and the inspector panel.
 * Native px layout, exported for the cursor and the camera.
 */
export const PBG = {
  titleY: 58,
  toolbarY: 100,
  noteY: 150,
  canvas: { x: 262, y: 176, w: 1598, h: 706 },
  inspector: { x: 1440, w: 420 },
  select: { x: 280, y: 192, w: 160, h: 40 },
  add: { x: 452, y: 192, w: 92, h: 40 },
  menu: { x: 280, y: 236, w: 170, rowH: 24 },
  kbPark: { x: 700, y: 62 },
};
/** Toolbar buttons (native px). */
export const TOOLBAR = {
  sequence: { x: 262, w: 116 },
  graph: { x: 378, w: 104 },
  variables: { x: 494, w: 140 },
  check: { x: 646, w: 104 },
  test: { x: 762, w: 92 },
  share: { x: 866, w: 104 },
  settings: { x: 982, w: 112 },
  saveDraft: { x: 1106, w: 122 },
  save: { x: 1240, w: 192 },
};
export const toolbarCentre = (k: keyof typeof TOOLBAR) => ({ x: TOOLBAR[k].x + TOOLBAR[k].w / 2, y: PBG.toolbarY + 19 });

/** The Add menu: groups and items, as in the product. */
export const MENU_GROUPS: { group: string; items: string[] }[] = [
  { group: "Input", items: ["Ask"] },
  { group: "Output", items: ["Send"] },
  { group: "Actions", items: ["Run", "Agent", "Playbook", "Table", "Page", "Extract", "Review"] },
  { group: "Flow", items: ["If", "For each", "Wait", "Go to", "Set", "End"] },
];
const MENU_ROWS: { label: string; group: boolean }[] = MENU_GROUPS.flatMap((g) => [{ label: g.group, group: true }, ...g.items.map((i) => ({ label: i, group: false }))]);
/** Menu row centre (native px) for an item label. */
export const menuItemCentre = (label: string) => {
  const i = MENU_ROWS.findIndex((r) => !r.group && r.label === label);
  return { x: PBG.menu.x + 60, y: PBG.menu.y + 8 + i * PBG.menu.rowH + PBG.menu.rowH / 2 };
};

/** Node rectangles (native px). Main chain, then the approved branch, then the declined branch. */
const MAIN = { x: 290, w: 660, h: 50, y0: 248, step: 64 };
export const NODE_RECTS: { x: number; y: number; w: number; h: number }[] = [
  ...[0, 1, 2, 3, 4].map((i) => ({ x: MAIN.x, y: MAIN.y0 + i * MAIN.step, w: MAIN.w, h: MAIN.h })),
  { x: MAIN.x, y: MAIN.y0 + 5 * MAIN.step, w: MAIN.w, h: 72 },
  { x: 520, y: 700, w: 360, h: 50 },
  { x: 520, y: 764, w: 360, h: 50 },
  { x: 520, y: 828, w: 360, h: 46 },
  { x: 960, y: 700, w: 340, h: 50 },
  { x: 960, y: 764, w: 340, h: 46 },
];
export const nodeCentre = (i: number) => ({ x: NODE_RECTS[i].x + NODE_RECTS[i].w / 2, y: NODE_RECTS[i].y + NODE_RECTS[i].h / 2 });
const REVIEW_OUT = { approved: { x: MAIN.x + 150, y: NODE_RECTS[5].y + NODE_RECTS[5].h }, declined: { x: MAIN.x + 420, y: NODE_RECTS[5].y + NODE_RECTS[5].h } };
/** Edges: [from, to, from point override]. */
const EDGES: { from: number; to: number; out?: "approved" | "declined" }[] = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 4 },
  { from: 4, to: 5 },
  { from: 5, to: 6, out: "approved" },
  { from: 6, to: 7 },
  { from: 7, to: 8 },
  { from: 5, to: 9, out: "declined" },
  { from: 9, to: 10 },
];
/** Theo's chip "Claims knowledge" (native px, centre), where the chip from Brain lands. */
export const KB_CHIP_TARGET = { x: MAIN.x + MAIN.w - 172, y: NODE_RECTS[2].y + MAIN.h / 2 };
/** Parked chip centre in the header, after the "Knowledge" label. */
export const KB_PARKED = { x: PBG.kbPark.x + 170, y: PBG.kbPark.y + 10 };

export type NodeStatus = "idle" | "running" | "done" | "waiting" | "approved";
export type GraphState = {
  status: "Draft" | "Active";
  statusPulse: number;
  /** Claims knowledge chip inside Theo's step: 0 hidden to 1 shown (it appears once the step is added). */
  kbLand: number;
  settings: number;
  selectValue: string;
  selectPressed: number;
  addPressed: number;
  menu: { open: number; highlight: string | null };
  nodes: { appear: number; connector: number; status: NodeStatus; pulse: number }[];
  inspector: number;
  insp: { nameStart: number | null; reviewer: number; msgStart: number | null; variable: number };
  checkPressed: number;
  toast: number;
  savePressed: number;
  /** REVIEW node glow (amber: a person decides). */
  reviewGlow: number;
  clock: number;
};

const BADGE: Record<string, { bg: string; fg: string }> = {
  ASK: { bg: "#EEF0F4", fg: "#3B4256" },
  AGENT: { bg: UI.lilacBg, fg: "#3A24A6" },
  PAGE: { bg: "#E7F6EA", fg: "#155A28" },
  REVIEW: { bg: "#FFF1DC", fg: "#7A4600" },
  IF: { bg: "#EEF0F4", fg: "#2E3446" },
  RUN: { bg: "#E8F1FB", fg: "#1D4673" },
  SEND: { bg: "#F4EEF2", fg: "#62304D" },
  END: { bg: "#EEF0F4", fg: "#3B4256" },
};
const Badge: React.FC<{ b: string }> = ({ b }) => (
  <span style={{ padding: "2px 8px", borderRadius: 6, background: BADGE[b].bg, color: BADGE[b].fg, fontFamily: FONT.sans, fontSize: UIN.helper, fontWeight: 700, letterSpacing: "0.02em" }}>{b}</span>
);

const ToolButton: React.FC<{ k: keyof typeof TOOLBAR; icon: React.ReactNode; label: string; primary?: boolean; disabled?: boolean; pressed?: number }> = ({ k, icon, label, primary, disabled, pressed = 0 }) => (
  <div
    style={{
      position: "absolute",
      left: TOOLBAR[k].x,
      top: PBG.toolbarY,
      width: TOOLBAR[k].w,
      height: 38,
      boxSizing: "border-box",
      borderRadius: 10,
      border: `1px solid ${primary ? UI.primaryBg : UI.line}`,
      background: primary ? (pressed > 0.3 ? "#2A3147" : UI.primaryBg) : pressed > 0.3 ? UI.selected : "#FFFFFF",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      fontFamily: FONT.sans,
      fontSize: UIN.button,
      fontWeight: primary ? 600 : 500,
      color: primary ? UI.primaryText : disabled ? UI.placeholder : UI.text,
      transform: `scale(${1 - 0.04 * pressed})`,
      whiteSpace: "nowrap",
    }}
  >
    {icon}
    {label}
  </div>
);

const edgePath = (e: (typeof EDGES)[number]) => {
  const a = e.out ? REVIEW_OUT[e.out] : { x: nodeCentre(e.from).x, y: NODE_RECTS[e.from].y + NODE_RECTS[e.from].h };
  const b = { x: nodeCentre(e.to).x, y: NODE_RECTS[e.to].y };
  const my = (a.y + b.y) / 2;
  return `M ${a.x} ${a.y} C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y}`;
};

const Node: React.FC<{ i: number; st: GraphState["nodes"][number]; clock: number; reviewGlow: number; kbOn: number }> = ({ i, st, clock, reviewGlow, kbOn }) => {
  const n = P.graph.nodes[i];
  const r = NODE_RECTS[i];
  const running = st.status === "running";
  const done = st.status === "done" || st.status === "approved";
  const waiting = st.status === "waiting";
  const review = n.badge === "REVIEW";
  const amber = review ? Math.max(reviewGlow, waiting ? 0.6 + 0.4 * st.pulse : 0, st.status === "approved" ? 1 : 0) : 0;
  return (
    <div
      data-guard="uitext"
      data-guard-read="1"
      data-guard-label={`Step ${i + 1}`}
      style={{
        position: "absolute",
        left: r.x,
        top: r.y,
        width: r.w,
        height: r.h,
        boxSizing: "border-box",
        borderRadius: 10,
        background: running ? "#F6F4FF" : "#FFFFFF",
        border: `1.5px solid ${amber > 0 ? `rgba(242,164,58,${0.5 + 0.5 * amber})` : running ? UI.accent : done ? "rgba(61,190,90,0.55)" : UI.line}`,
        boxShadow: amber > 0 ? `0 0 0 ${4 * amber}px rgba(255,226,179,${0.9 * amber})` : running ? `0 0 0 4px rgba(124,98,240,0.2)` : "0 4px 12px rgba(20,24,60,0.05)",
        opacity: st.appear,
        transform: `translateY(${(1 - st.appear) * 10}px) scale(${0.96 + 0.04 * st.appear})`,
        fontFamily: FONT.sans,
        padding: review ? "8px 14px" : "0 14px",
        display: "flex",
        flexDirection: review ? "column" : "row",
        alignItems: review ? "stretch" : "center",
        justifyContent: "center",
        gap: review ? 4 : 10,
      }}
    >
      {/* The REVIEW step is where a person decides: its amber glow is a decision mark. */}
      {review ? <div data-guard="decision" style={{ position: "absolute", inset: -8, pointerEvents: "none" }} /> : null}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Badge b={n.badge} />
        <span style={{ fontSize: UIN.helper, color: UI.secondary }}>s{i + 1}</span>
        <span style={{ fontSize: READ, color: UI.text, whiteSpace: "nowrap" }}>{n.text}</span>
        {review ? <HumanGlyph size={16} style={{ width: 26, height: 26, marginLeft: "auto" }} /> : null}
      </div>
      {review ? (
        <div style={{ display: "flex", justifyContent: "space-around", fontSize: UIN.helper, color: UI.secondary }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: 5, background: UI.green }} />
            approved
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: 5, background: "#E5484D" }} />
            declined
          </span>
        </div>
      ) : null}
      {!review ? (
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {n.chip ? (
            <span style={{ opacity: kbOn, transform: `scale(${0.9 + 0.1 * kbOn})`, padding: "2px 10px", borderRadius: 8, background: UI.lilacBg, color: UI.lilacText, fontSize: UIN.helper, fontWeight: 600, whiteSpace: "nowrap" }}>{n.chip}</span>
          ) : null}
          {n.agent ? <SpaceOrb size={24} palette={n.agent as OrbPaletteKey} timeOffset={clock} pulse={running} /> : null}
          {n.agent ? <span style={{ fontSize: UIN.helper, fontWeight: 600, color: UI.text }}>{n.agent[0].toUpperCase() + n.agent.slice(1)}</span> : null}
          {n.logo ? <Img data-guard="brand" src={staticFile(n.logo)} style={{ width: 20, height: 20, objectFit: "contain" }} /> : null}
          {done ? <Check size={16} color={UI.green} strokeWidth={3} /> : null}
          {waiting ? <span style={{ fontSize: UIN.helper, color: "#9A5B00", fontWeight: 600 }}>Waiting for Emily</span> : null}
        </div>
      ) : null}
    </div>
  );
};

const Field: React.FC<{ label: string; y: number; h?: number; children?: React.ReactNode; helper?: string }> = ({ label, y, h = 40, children, helper }) => {
  const X = PBG.inspector.x + 20;
  const W = PBG.inspector.w - 40;
  return (
    <>
      <div style={{ position: "absolute", left: X, top: y, fontFamily: FONT.sans, fontSize: UIN.helper, fontWeight: 600, color: UI.text }}>{label}</div>
      <div style={{ position: "absolute", left: X, top: y + 24, width: W, height: h, boxSizing: "border-box", borderRadius: 10, border: `1px solid ${UI.line}`, padding: "8px 12px", fontFamily: FONT.sans, fontSize: READ, color: UI.text, overflow: "hidden" }}>{children}</div>
      {helper ? <div style={{ position: "absolute", left: X, top: y + 30 + h, width: W, fontFamily: FONT.sans, fontSize: UIN.helper, lineHeight: 1.35, color: UI.secondary }}>{helper}</div> : null}
    </>
  );
};

export const PlaybookGraphPage: React.FC<{ s: GraphState }> = ({ s }) => {
  const C = PBG.canvas;
  const I = PBG.inspector;
  return (
    <div style={{ position: "absolute", inset: 0, background: UI.bg }}>
      <Sidebar active="playbook" />
      <TopBar page="Playbook" />
      {/* Title row */}
      <div style={{ position: "absolute", left: 262, top: PBG.titleY - 4, fontFamily: FONT.sans, fontSize: UIN.pageTitle, fontWeight: 600, color: UI.text, whiteSpace: "nowrap" }}>{P.playbook.name}</div>
      <div
        style={{ position: "absolute", left: 500, top: PBG.titleY, padding: "3px 12px", borderRadius: 999, background: s.status === "Active" ? UI.greenBg : "#F1F2F6", color: s.status === "Active" ? UI.greenText : UI.secondary, fontFamily: FONT.sans, fontSize: UIN.helper, fontWeight: 600, transform: `scale(${1 + 0.12 * s.statusPulse})`, whiteSpace: "nowrap" }}
      >
        {s.status}
      </div>

      {/* Toolbar */}
      <div style={{ position: "absolute", left: TOOLBAR.sequence.x, top: PBG.toolbarY, width: TOOLBAR.sequence.w + TOOLBAR.graph.w, height: 38, boxSizing: "border-box", borderRadius: 10, border: `1px solid ${UI.line}`, display: "flex", padding: 3, gap: 3 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: FONT.sans, fontSize: UIN.button, color: UI.placeholder }}>
          <ListOrdered size={15} color={UI.placeholder} />
          Sequence
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 7, background: UI.selected, fontFamily: FONT.sans, fontSize: UIN.button, fontWeight: 600, color: UI.text }}>
          <GitBranch size={15} color={UI.text} />
          Graph
        </div>
      </div>
      <ToolButton k="variables" icon={<Braces size={15} color={UI.text} />} label="Variables (0)" />
      <ToolButton k="check" icon={<ShieldCheck size={15} color={UI.text} />} label="Check" pressed={s.checkPressed} />
      <ToolButton k="test" icon={<Play size={15} color={UI.placeholder} />} label="Test" disabled />
      <ToolButton k="share" icon={<Share2 size={15} color={UI.text} />} label="Share" />
      <ToolButton k="settings" icon={<Settings size={15} color={UI.text} />} label="Settings" pressed={s.settings > 0.5 ? 0.5 : 0} />
      <ToolButton k="saveDraft" icon={null} label="Save draft" />
      <ToolButton k="save" icon={<Save size={15} color={UI.primaryText} />} label="Save & activate" primary pressed={s.savePressed} />
      <div style={{ position: "absolute", left: 262, top: PBG.noteY, fontFamily: FONT.sans, fontSize: UIN.helper, color: UI.secondary, whiteSpace: "nowrap" }}>{P.graph.note}</div>

      {/* Canvas */}
      <div style={{ position: "absolute", left: C.x, top: C.y, width: C.w, height: C.h, boxSizing: "border-box", borderRadius: 12, border: `1px solid ${UI.line}`, overflow: "hidden", backgroundColor: "#FFFFFF", backgroundImage: "radial-gradient(#D9DCE6 1.2px, transparent 1.3px)", backgroundSize: "18px 18px" }} />
      {/* Edges */}
      <svg width={1875} height={895} style={{ position: "absolute", left: 0, top: 0 }}>
        {EDGES.map((e) => {
          const st = s.nodes[e.to];
          const k = Math.min(1, Math.max(0, st.connector));
          const lit = s.nodes[e.to].status !== "idle" && s.nodes[e.from].status !== "idle";
          return k > 0 ? (
            <path key={`${e.from}-${e.to}`} d={edgePath(e)} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} fill="none" stroke={e.out === "approved" ? UI.green : e.out === "declined" ? "#E5484D" : lit ? UI.accent : "#A5ABBC"} strokeWidth={2} strokeLinecap="round" />
          ) : null;
        })}
        {EDGES.map((e) => {
          const k = s.nodes[e.to].connector;
          const a = e.out ? REVIEW_OUT[e.out] : { x: nodeCentre(e.from).x, y: NODE_RECTS[e.from].y + NODE_RECTS[e.from].h };
          return k > 0 ? <circle key={`dot-${e.from}-${e.to}`} cx={a.x} cy={a.y} r={3.5} fill={e.out === "approved" ? UI.green : e.out === "declined" ? "#E5484D" : "#7B8194"} /> : null;
        })}
      </svg>
      {P.graph.nodes.map((_, i) => (s.nodes[i].appear > 0 ? <Node key={i} i={i} st={s.nodes[i]} clock={s.clock} reviewGlow={s.reviewGlow} kbOn={s.kbLand} /> : null))}

      {/* Add control */}
      <div style={{ position: "absolute", left: PBG.select.x - 8, top: PBG.select.y - 8, width: PBG.add.x + PBG.add.w - PBG.select.x + 16, height: PBG.select.h + 16, boxSizing: "border-box", borderRadius: 12, background: "#FFFFFF", border: `1px solid ${UI.line}`, boxShadow: "0 6px 18px rgba(20,24,60,0.08)" }} />
      <div style={{ position: "absolute", left: PBG.select.x, top: PBG.select.y, width: PBG.select.w, height: PBG.select.h, boxSizing: "border-box", borderRadius: 9, border: `1.5px solid ${s.menu.open > 0 ? UI.text : UI.line}`, display: "flex", alignItems: "center", padding: "0 12px", fontFamily: FONT.sans, fontSize: UIN.button, color: UI.text, transform: `scale(${1 - 0.03 * s.selectPressed})` }}>
        {s.selectValue}
        <ChevronDown size={15} color={UI.text} style={{ marginLeft: "auto" }} />
      </div>
      <div style={{ position: "absolute", left: PBG.add.x, top: PBG.add.y, width: PBG.add.w, height: PBG.add.h, boxSizing: "border-box", borderRadius: 9, border: `1px solid ${UI.line}`, background: s.addPressed > 0.3 ? UI.selected : "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: FONT.sans, fontSize: UIN.button, color: UI.text, transform: `scale(${1 - 0.04 * s.addPressed})` }}>
        <Plus size={15} color={UI.text} />
        Add
      </div>
      {s.menu.open > 0 ? (
        <div
          data-guard="uitext"
          data-guard-label="Add menu"
          style={{ position: "absolute", left: PBG.menu.x, top: PBG.menu.y, width: PBG.menu.w, boxSizing: "border-box", padding: "8px 0", borderRadius: 4, background: "#FFFFFF", border: `1px solid ${UI.text}`, boxShadow: "0 12px 28px rgba(20,24,60,0.14)", fontFamily: FONT.sans, fontSize: UIN.helper, opacity: s.menu.open, transform: `translateY(${(1 - s.menu.open) * -6}px)`, transformOrigin: "50% 0", zIndex: 5 }}
        >
          {MENU_ROWS.map((r) => {
            const on = !r.group && r.label === s.menu.highlight;
            return (
              <div key={`${r.group}-${r.label}`} style={{ height: PBG.menu.rowH, display: "flex", alignItems: "center", paddingLeft: r.group ? 16 : 34, fontWeight: r.group ? 700 : 400, color: on ? "#FFFFFF" : UI.text, background: on ? "#2563EB" : "transparent" }}>
                {r.label}
              </div>
            );
          })}
        </div>
      ) : null}
      {/* Zoom controls */}
      <div style={{ position: "absolute", left: 278, top: 770, width: 34, height: 96, borderRadius: 8, border: `1px solid ${UI.line}`, background: "#FFFFFF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-around" }}>
        <Plus size={15} color={UI.text} />
        <Minus size={15} color={UI.placeholder} />
        <Maximize size={14} color={UI.text} />
      </div>

      {/* Inspector */}
      <div style={{ position: "absolute", left: I.x, top: C.y + 1, width: I.w - 1, height: C.h - 2, background: "#FFFFFF", borderLeft: `1px solid ${UI.line}` }} />
      {s.settings > 0 ? (
        <div data-guard="uitext" data-guard-read="1" data-guard-label="Playbook settings" style={{ position: "absolute", left: I.x, top: C.y, width: I.w, height: 300, opacity: s.settings }}>
          <div style={{ position: "absolute", left: 20, top: 20, fontFamily: FONT.sans, fontSize: READ + 1, fontWeight: 700, color: UI.text }}>Playbook settings</div>
          <div style={{ position: "absolute", left: 20, top: 64, fontFamily: FONT.sans, fontSize: UIN.helper, fontWeight: 600, color: UI.text }}>Trigger</div>
          <div style={{ position: "absolute", left: 20, top: 88, width: I.w - 40, height: 46, boxSizing: "border-box", borderRadius: 10, border: `1.5px solid ${UI.accent}`, display: "flex", alignItems: "center", gap: 10, padding: "0 12px", fontFamily: FONT.sans, fontSize: READ, color: UI.text, whiteSpace: "nowrap" }}>
            <Img data-guard="brand" src={staticFile("logos/gmail.svg")} style={{ width: 22, height: 17, objectFit: "contain" }} />
            {P.graph.trigger}
          </div>
          <div style={{ position: "absolute", left: 20, top: 144, width: I.w - 40, fontFamily: FONT.sans, fontSize: UIN.helper, lineHeight: 1.35, color: UI.secondary, whiteSpace: "normal" }}>Each new email starts a run with the email as input.</div>
        </div>
      ) : null}
      {s.inspector > 0 ? (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1875, height: 895, opacity: s.inspector, pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: I.x + 20, top: C.y + 18, display: "flex", alignItems: "center", gap: 14, width: I.w - 40 }}>
            <Badge b="REVIEW" />
            <X size={16} color={UI.secondary} style={{ marginLeft: "auto" }} />
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: FONT.sans, fontSize: UIN.helper, color: UI.text }}>
              <Flag size={15} color={UI.text} />
              Set as start
            </span>
            <Trash2 size={15} color={UI.secondary} />
          </div>
          <div data-guard="uitext" data-guard-read="1" data-guard-label="Review inspector">
            <Field label="Name" y={C.y + 62}>
              {s.insp.nameStart !== null ? <Typewriter lines={[P.graph.reviewName]} cps={CHAT_CPS} startFrame={s.insp.nameStart} seed="insp-name" caretColor={UI.text} style={{ fontSize: READ, color: UI.text }} /> : null}
            </Field>
            <Field label="Step type" y={C.y + 138}>
              <span style={{ display: "flex", alignItems: "center" }}>
                Review
                <ChevronDown size={15} color={UI.text} style={{ marginLeft: "auto" }} />
              </span>
            </Field>
            <Field label="Reviewers" y={C.y + 214} h={44} helper="Any one of them can approve or decline. The person running the playbook never reviews their own request.">
              {s.insp.reviewer > 0 ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 10px 2px 4px", borderRadius: 999, border: `1px solid ${UI.line}`, opacity: s.insp.reviewer, fontSize: UIN.helper, fontWeight: 600 }}>
                  <HumanGlyph size={14} style={{ width: 22, height: 22 }} />
                  {P.claimsOfficer}
                </span>
              ) : (
                <span style={{ fontSize: UIN.helper, color: UI.placeholder }}>Search people…</span>
              )}
            </Field>
            <Field label="Message to reviewers" y={C.y + 372} h={96} helper="Optional. Use ${name} to insert variables from earlier steps.">
              {s.insp.msgStart !== null ? (
                <Typewriter lines={[...P.graph.reviewMessage]} cps={60} startFrame={s.insp.msgStart} seed="insp-msg" caretColor={UI.text} style={{ fontSize: READ, lineHeight: 1.4, color: UI.text }} />
              ) : (
                <span style={{ fontSize: UIN.helper, color: UI.placeholder }}>Please approve the refund of ${"{amount}"} for ${"{order_id}"}.</span>
              )}
            </Field>
            <Field label="Save the decision as variable" y={C.y + 556}>
              <span style={{ opacity: s.insp.variable, fontFamily: FONT.mono, fontSize: UIN.helper }}>{P.graph.variable}</span>
            </Field>
          </div>
        </div>
      ) : null}

      {/* Check toast */}
      {s.toast > 0 ? (
        <div data-guard="uitext" data-guard-read="1" data-guard-label="Check toast" style={{ position: "absolute", left: 700, top: 150, display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 12, background: "#FFFFFF", border: `1px solid ${UI.line}`, boxShadow: "0 12px 30px rgba(20,24,60,0.14)", fontFamily: FONT.sans, fontSize: READ, fontWeight: 600, color: UI.text, opacity: s.toast, transform: `translateY(${(1 - s.toast) * -10}px)`, whiteSpace: "nowrap", zIndex: 6 }}>
          <ShieldCheck size={18} color={UI.green} />
          {P.graph.checkToast}
        </div>
      ) : null}
    </div>
  );
};
