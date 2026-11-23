import React from "react";
import { Img, staticFile } from "remotion";
import { ArrowLeft, Braces, Check, GitBranch, ListOrdered, Play, Plus, Save, Share2, ShieldCheck } from "lucide-react";
import { COLOR, FONT, UIN, type OrbPaletteKey } from "../../theme";
import { PLACEHOLDERS as P } from "../../placeholders";
import { Sidebar, TopBar, UI } from "../chat/Sidebar";
import { SpaceOrb } from "../SpaceOrb";
import { HumanGlyph } from "../HumanGlyph";
import { READ } from "./common";

/** Menu items, from reference/ui/06-playbook-add-step.png. SEND and WAIT use a lime tone: amber is reserved for the human decision (REVIEW). */
type Tone = "grey" | "green" | "lime" | "amber";
const TONES: Record<Tone, { bg: string; fg: string }> = {
  grey: { bg: "#3a3a3a", fg: "#e6e6e6" },
  green: { bg: "#1F3A27", fg: "#5DD08A" },
  lime: { bg: "#30351A", fg: "#C9D86A" },
  amber: { bg: "#3E3015", fg: COLOR.amber },
};
export const MENU: { section?: string; badge: string; tone: Tone; desc: string }[] = [
  { section: "INPUT", badge: "ASK", tone: "grey", desc: "Ask the user and store the answer: text, bu…" },
  { section: "OUTPUT", badge: "SEND", tone: "lime", desc: "Send a message to the user" },
  { section: "ACTIONS", badge: "RUN", tone: "grey", desc: "Run an instruction, a tool, an API call, a fun…" },
  { badge: "AGENT", tone: "green", desc: "Give one of your agents a task and wait …" },
  { badge: "PLAYBOOK", tone: "green", desc: "Run another playbook" },
  { badge: "TABLE", tone: "grey", desc: "Read or change rows of a table" },
  { badge: "PAGE", tone: "green", desc: "Make a page for this run: written here, or …" },
  { badge: "EXTRACT", tone: "grey", desc: "Read a document into a fixed structu…" },
  { badge: "REVIEW", tone: "amber", desc: "Wait for a person to approve or decline" },
  { section: "FLOW", badge: "IF", tone: "grey", desc: "Branch on conditions or natural language" },
  { badge: "FOR EACH", tone: "green", desc: "Run an agent or a playbook for eac…" },
  { badge: "WAIT", tone: "lime", desc: "Wait for a time, a table row or an email" },
  { badge: "GO TO", tone: "green", desc: "Continue from another step (loops, retr…" },
  { badge: "SET", tone: "grey", desc: "Assign a value to a variable" },
  { badge: "END", tone: "grey", desc: "End the playbook" },
];
export const ADD_STEP = { x: 679, y: 150, w: 96, h: 26 };
export const MENU_BOX = { x: 679, y: 186, w: 330 };
/** y of a menu item centre (native). */
export const menuItemY = (i: number) => {
  let y = MENU_BOX.y + 10;
  for (let j = 0; j <= i; j++) {
    if (MENU[j].section) y += 30;
    if (j < i) y += 32;
  }
  return y + 16;
};
export const menuIndex = (badge: string) => MENU.findIndex((m) => m.badge === badge);

export type StepKind = { badge: string; tone: Tone; title: string; agent?: { name: string; palette: OrbPaletteKey }; logo?: string; chip?: string; human?: boolean; sub?: { badge: string; tone: Tone; text: string; logo?: string } };
export const STEPS: StepKind[] = [
  { badge: "TRIGGER", tone: "grey", title: P.playbook.steps[0], logo: "logos/gmail.svg" },
  { badge: "AGENT", tone: "green", title: P.playbook.steps[1], agent: { name: "Nora", palette: "nora" } },
  { badge: "AGENT", tone: "green", title: P.playbook.steps[2], agent: { name: "Theo", palette: "theo" }, chip: P.policySource },
  { badge: "AGENT", tone: "green", title: P.playbook.steps[3], agent: { name: "Owen", palette: "owen" }, logo: "logos/google-sheets.svg" },
  { badge: "REVIEW", tone: "amber", title: P.playbook.steps[4], human: true },
  { badge: "IF", tone: "grey", title: P.playbook.steps[5], sub: { badge: "SEND", tone: "lime", text: P.playbook.sendText, logo: "logos/gmail.svg" } },
  { badge: "NOTIFY", tone: "grey", title: P.playbook.steps[6], logo: "logos/slack.svg" },
];
/** Which menu item adds each step. */
export const STEP_MENU = ["WAIT", "AGENT", "AGENT", "AGENT", "REVIEW", "IF", "RUN"];
export const CARD = { x: 1040, y0: 196, w: 700, h: 66, gap: 18 };
export const cardY = (i: number) => CARD.y0 + i * (CARD.h + CARD.gap);

export type StepStatus = "idle" | "running" | "done" | "waiting" | "approved";
export type PlaybookState = {
  steps: { appear: number; connector: number; status: StepStatus; pulse: number }[];
  menu: { open: number; highlight: number };
  addPressed: number;
  reviewGlow: number;
  runPressed?: number;
  bellBadge?: number;
  bellPulse?: number;
  clock: number;
};

const Badge: React.FC<{ label: string; tone: Tone }> = ({ label, tone }) => (
  <span style={{ display: "inline-block", padding: "2px 9px", borderRadius: 6, background: TONES[tone].bg, color: TONES[tone].fg, fontFamily: FONT.sans, fontSize: UIN.helper, fontWeight: 700, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>{label}</span>
);

const ToolButton: React.FC<{ icon: React.ReactNode; label: string; primary?: boolean; dim?: boolean; pressed?: number }> = ({ icon, label, primary, dim, pressed = 0 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, height: 36, padding: "0 13px", borderRadius: 9, border: `1px solid ${primary ? "transparent" : UI.line}`, background: primary ? "#FFFFFF" : pressed > 0 ? "#333" : "transparent", color: primary ? "#111" : dim ? "#8a8a8a" : UI.text, fontFamily: FONT.sans, fontSize: UIN.button, fontWeight: 500, whiteSpace: "nowrap" }}>
    {icon}
    {label}
  </div>
);

export const PlaybookPage: React.FC<{ s: PlaybookState }> = ({ s }) => (
  <div style={{ position: "absolute", inset: 0, background: UI.bg }}>
    <Sidebar active="playbook" />
    <TopBar page="Playbook" bellBadge={s.bellBadge ?? 0} bellPulse={s.bellPulse ?? 0} />
    <div style={{ position: "absolute", left: 455, top: 66, display: "flex", alignItems: "center", gap: 8, fontFamily: FONT.sans, fontSize: UIN.button, color: "#bdbdbd" }}>
      <ArrowLeft size={15} color="#bdbdbd" />
      Playbooks
    </div>
    <div style={{ position: "absolute", left: 455, top: 98, display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ fontFamily: FONT.sans, fontSize: UIN.pageTitle, fontWeight: 600, color: UI.text, whiteSpace: "nowrap" }}>{P.playbook.name}</div>
      <span style={{ padding: "1px 9px", borderRadius: 999, background: "#333", color: "#d0d0d0", fontFamily: FONT.sans, fontSize: UIN.helper }}>draft</span>
      <span style={{ padding: "1px 9px", borderRadius: 999, background: "#3A4A1E", color: "#E6F0C8", fontFamily: FONT.sans, fontSize: UIN.helper, fontWeight: 600 }}>Personal</span>
      <span style={{ fontFamily: FONT.sans, fontSize: UIN.helper, color: "#bdbdbd" }}>v1</span>
    </div>
    <div style={{ position: "absolute", left: 900, top: 98, display: "flex", gap: 8 }}>
      <div style={{ display: "flex", gap: 2, padding: 3, borderRadius: 10, border: `1px solid ${UI.line}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 12px", borderRadius: 8, background: "#333", fontFamily: FONT.sans, fontSize: UIN.button, color: UI.text }}>
          <ListOrdered size={15} color="#e6e6e6" />
          Sequence
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 12px", fontFamily: FONT.sans, fontSize: UIN.button, color: "#cfcfcf" }}>
          <GitBranch size={15} color="#cfcfcf" />
          Graph
        </div>
      </div>
      <ToolButton icon={<ShieldCheck size={15} color="#e6e6e6" />} label="Check" />
      <ToolButton icon={<Play size={15} color="#e6e6e6" />} label="Run playbook" pressed={s.runPressed} />
      <ToolButton icon={<Share2 size={15} color="#e6e6e6" />} label="Share" />
      <ToolButton icon={<Braces size={15} color="#e6e6e6" />} label="Save draft" />
      <ToolButton icon={<Save size={15} color="#111" />} label="Save & activate" primary />
    </div>

    {/* + Add step and its menu */}
    <div style={{ position: "absolute", left: ADD_STEP.x, top: ADD_STEP.y, display: "flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 7, background: s.addPressed > 0 ? "#3a3a3a" : "#2c2c2c", fontFamily: FONT.sans, fontSize: UIN.helper, color: UI.text, whiteSpace: "nowrap" }}>
      <Plus size={14} color="#e6e6e6" />
      Add step
    </div>
    {s.menu.open > 0 ? (
      <div style={{ position: "absolute", left: MENU_BOX.x, top: MENU_BOX.y, width: MENU_BOX.w, padding: "8px 12px 12px", boxSizing: "border-box", borderRadius: 12, background: "#262626", border: "1px solid #3a3a3a", boxShadow: "0 20px 50px rgba(0,0,0,0.45)", opacity: s.menu.open, transform: `translateY(${(1 - s.menu.open) * -8}px)` }}>
        {MENU.map((m, i) => (
          <React.Fragment key={m.badge}>
            {m.section ? <div style={{ height: 30, display: "flex", alignItems: "flex-end", paddingBottom: 4, fontFamily: FONT.sans, fontSize: UIN.helper, fontWeight: 600, color: "#a3a3a3" }}>{m.section}</div> : null}
            <div style={{ height: 32, display: "flex", alignItems: "center", gap: 10, padding: "0 6px", margin: "0 -6px", borderRadius: 7, background: i === s.menu.highlight ? "#353535" : "transparent", overflow: "hidden", whiteSpace: "nowrap" }}>
              <Badge label={m.badge} tone={m.tone} />
              <span style={{ fontFamily: FONT.sans, fontSize: UIN.helper, color: "#cfcfcf", overflow: "hidden", textOverflow: "ellipsis" }}>{m.desc}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    ) : null}

    {/* Steps */}
    {STEPS.map((st, i) => {
      const a = s.steps[i];
      if (a.appear <= 0) return null;
      const y = cardY(i);
      const review = st.human;
      const lit = a.status === "running" ? 1 : 0;
      return (
        <React.Fragment key={i}>
          {i > 0 && a.connector > 0 ? (
            <div style={{ position: "absolute", left: CARD.x + 34, top: cardY(i - 1) + CARD.h, width: 2, height: CARD.gap * a.connector, background: a.status === "idle" ? "#555" : "#8fd694" }} />
          ) : null}
          <div
            data-guard="uitext"
            data-guard-read="1"
            data-guard-label={`Step ${i + 1}`}
            style={{
              position: "absolute",
              left: CARD.x,
              top: y,
              width: CARD.w,
              height: CARD.h,
              boxSizing: "border-box",
              borderRadius: 14,
              background: "#262626",
              border: `1.5px solid ${review && s.reviewGlow > 0 ? `rgba(242,164,58,${0.4 + 0.6 * s.reviewGlow})` : lit ? "#B5D23E" : a.status === "done" || a.status === "approved" ? "#3E6B4A" : "#3a3a3a"}`,
              boxShadow: review && s.reviewGlow > 0 ? `0 0 ${18 + 16 * a.pulse}px rgba(242,164,58,${0.25 + 0.25 * s.reviewGlow * (0.6 + 0.4 * a.pulse)})` : lit ? "0 0 18px rgba(181,210,62,0.25)" : "none",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "0 16px",
              opacity: a.appear,
              filter: a.appear < 1 ? `blur(${(1 - a.appear) * 10}px)` : undefined,
              transform: `translateY(${(1 - a.appear) * 12}px)`,
              fontFamily: FONT.sans,
              whiteSpace: "nowrap",
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: 14, border: `1px solid ${UI.chipBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: UIN.helper, color: "#cfcfcf", flexShrink: 0 }}>{i + 1}</div>
            <Badge label={st.badge} tone={st.tone} />
            <span style={{ fontSize: READ, fontWeight: 600, color: UI.text }}>{st.title}</span>
            {st.sub ? (
              <>
                <span style={{ fontSize: READ, color: "#9a9a9a" }}>then</span>
                <Badge label={st.sub.badge} tone={st.sub.tone} />
                <span style={{ fontSize: READ, color: UI.text }}>{st.sub.text}</span>
              </>
            ) : null}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              {st.chip ? <span style={{ padding: "2px 10px", borderRadius: 8, background: "#2f2f2f", border: `1px solid ${UI.chipBorder}`, fontSize: UIN.helper, color: "#d8d8d8" }}>{st.chip}</span> : null}
              {st.agent ? (
                <>
                  <SpaceOrb size={26} palette={st.agent.palette} timeOffset={s.clock} style={{ transform: `scale(${1 + 0.12 * lit * a.pulse})` }} />
                  <span style={{ fontSize: UIN.button, color: "#d8d8d8" }}>{st.agent.name}</span>
                </>
              ) : null}
              {st.logo || st.sub?.logo ? <Img data-guard="brand" src={staticFile((st.logo ?? st.sub?.logo)!)} style={{ width: 24, height: 22, objectFit: "contain" }} /> : null}
              {review ? <HumanGlyph size={26} style={{ width: 36, height: 36 }} /> : null}
              {a.status === "done" || a.status === "approved" ? (
                <div style={{ width: 22, height: 22, borderRadius: 11, background: "#3C8F52", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Check size={14} color="#fff" strokeWidth={3} />
                </div>
              ) : null}
              {a.status === "waiting" ? <span style={{ padding: "2px 10px", borderRadius: 8, background: "#3E3015", color: COLOR.amber, fontSize: UIN.helper, fontWeight: 700 }}>{P.playbook.waiting}</span> : null}
              {a.status === "approved" ? <span style={{ padding: "2px 10px", borderRadius: 8, background: "#1F3A27", color: "#8fd694", fontSize: UIN.helper, fontWeight: 700 }}>Approved</span> : null}
            </div>
          </div>
        </React.Fragment>
      );
    })}
  </div>
);
