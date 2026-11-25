import React from "react";
import { Check, X } from "lucide-react";
import { CHAT_CPS, FONT, PRODUCT, UIN, type OrbPaletteKey } from "../../theme";
import { Typewriter } from "../Typewriter";
import { SpaceOrb } from "../SpaceOrb";
import { UI } from "../chat/Sidebar";

/** Input text in the panel: 17px native (15.7px at 1x), read at a 1.3x zoom. */
export const PANEL_TEXT = 17;
/** 560px wide on screen at 1x. */
export const PANEL = { w: Math.round(560 / PRODUCT.scale), h: 612, x: 0, y: 140 };
PANEL.x = Math.round((229 + 1875) / 2 - PANEL.w / 2);

export const SWATCHES: OrbPaletteKey[] = ["iris", "nora", "theo", "owen", "plum"];
const SW = { size: 38, gap: 16, x: 28, y: 470 };
/** Swatch centre, native px. */
export const swatchCentre = (i: number) => ({ x: PANEL.x + SW.x + SW.size / 2 + i * (SW.size + SW.gap), y: PANEL.y + SW.y + SW.size / 2 });
export const CREATE_BUTTON = { x: 0, y: 0, w: 156, h: 42 };
CREATE_BUTTON.x = PANEL.x + PANEL.w - 28 - CREATE_BUTTON.w;
CREATE_BUTTON.y = PANEL.y + PANEL.h - 26 - CREATE_BUTTON.h;
export const createButtonCentre = () => ({ x: CREATE_BUTTON.x + CREATE_BUTTON.w / 2, y: CREATE_BUTTON.y + CREATE_BUTTON.h / 2 });

export type PanelState = {
  open: number;
  /** Typing start frames for each field; Infinity hides the text. */
  nameStart: number;
  roleStart: number;
  taskStart: number;
  handle: number;
  swatch: number; // selected index, -1 none
  createPressed: number;
  clock: number;
};

export const NEW_AGENT_FIELDS = {
  name: "Nora",
  handle: "@nora",
  role: "Intake",
  taskLines: ["Read the claim, pull the key facts and", "prepare the intake summary."],
  access: ["Works with Emily's access", "Own access"],
};

const label: React.CSSProperties = { position: "absolute", left: 28, fontFamily: FONT.sans, fontSize: UIN.helper, color: "#5B6478", whiteSpace: "nowrap" };
const field = (top: number, h: number): React.CSSProperties => ({
  position: "absolute",
  left: 28,
  top,
  width: PANEL.w - 56,
  height: h,
  boxSizing: "border-box",
  borderRadius: 10,
  background: "#FFFFFF",
  border: `1px solid ${UI.chipBorder}`,
});
const typed: React.CSSProperties = { fontFamily: FONT.sans, fontSize: PANEL_TEXT, color: UI.text, lineHeight: 1.4 };

export const CreateAgentPanel: React.FC<{ s: PanelState }> = ({ s }) => {
  if (s.open <= 0) return null;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${0.5 * s.open})` }} />
      <div
        data-guard="uitext"
        data-guard-read="1"
        data-guard-label="New agent panel"
        style={{
          position: "absolute",
          left: PANEL.x,
          top: PANEL.y,
          width: PANEL.w,
          height: PANEL.h,
          borderRadius: 18,
          background: "#FFFFFF",
          border: "1px solid #E7E9F2",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
          opacity: s.open,
          transform: `translateY(${(1 - s.open) * 18}px) scale(${0.97 + 0.03 * s.open})`,
          fontFamily: FONT.sans,
          color: UI.text,
        }}
      >
        <div style={{ position: "absolute", left: 28, top: 22, fontSize: UIN.sourceTitle, fontWeight: 700, whiteSpace: "nowrap" }}>New agent</div>
        <X size={18} color="#5B6478" style={{ position: "absolute", right: 26, top: 28 }} />

        <div style={{ ...label, top: 74 }}>Name</div>
        <div style={field(98, 44)}>
          <div style={{ position: "absolute", left: 14, top: 8, display: "flex", gap: 12, alignItems: "baseline" }}>
            <Typewriter lines={[NEW_AGENT_FIELDS.name]} cps={CHAT_CPS} startFrame={s.nameStart} seed="panel-name" caretColor={UI.text} style={typed} />
            <span style={{ ...typed, color: UI.muted, opacity: s.handle }}>{NEW_AGENT_FIELDS.handle}</span>
          </div>
        </div>

        <div style={{ ...label, top: 158 }}>Role</div>
        <div style={field(182, 44)}>
          <div style={{ position: "absolute", left: 14, top: 8 }}>
            <Typewriter lines={[NEW_AGENT_FIELDS.role]} cps={CHAT_CPS} startFrame={s.roleStart} seed="panel-role" caretColor={UI.text} style={typed} />
          </div>
        </div>

        <div style={{ ...label, top: 242 }}>What should this agent do?</div>
        <div style={field(266, 80)}>
          <div style={{ position: "absolute", left: 14, top: 10 }}>
            <Typewriter lines={NEW_AGENT_FIELDS.taskLines} cps={CHAT_CPS} startFrame={s.taskStart} seed="panel-task" caretColor={UI.text} style={typed} />
          </div>
        </div>

        <div style={{ ...label, top: 362 }}>Access</div>
        <div style={{ position: "absolute", left: 28, top: 386, display: "flex", gap: 12 }}>
          {NEW_AGENT_FIELDS.access.map((a, i) => (
            <div
              key={a}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 14px",
                borderRadius: 10,
                border: `1px solid ${i === 0 ? "#5B6478" : UI.chipBorder}`,
                background: i === 0 ? "#E7E9F2" : "transparent",
                fontSize: PANEL_TEXT,
                whiteSpace: "nowrap",
              }}
            >
              <div style={{ width: 18, height: 18, borderRadius: 9, border: `2px solid ${i === 0 ? "#0D1224" : "#C5CAD8"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {i === 0 ? <div style={{ width: 8, height: 8, borderRadius: 4, background: "#0D1224" }} /> : null}
              </div>
              {a}
            </div>
          ))}
        </div>

        <div style={{ ...label, top: 446 }}>Avatar</div>
        {SWATCHES.map((p, i) => {
          const c = swatchCentre(i);
          const on = s.swatch === i;
          return (
            <div key={p} style={{ position: "absolute", left: c.x - PANEL.x - SW.size / 2 - 5, top: c.y - PANEL.y - SW.size / 2 - 5, width: SW.size + 10, height: SW.size + 10, borderRadius: "50%", border: `2px solid ${on ? "#0D1224" : "transparent"}`, boxSizing: "border-box" }}>
              <SpaceOrb size={SW.size} palette={p} timeOffset={s.clock} style={{ position: "absolute", left: 3, top: 3 }} />
              {on ? (
                <div style={{ position: "absolute", right: -4, bottom: -4, width: 18, height: 18, borderRadius: 9, background: "#0D1224", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Check size={12} color={UI.primaryText} strokeWidth={3} />
                </div>
              ) : null}
            </div>
          );
        })}

        <div style={{ position: "absolute", left: 28, right: 28, top: PANEL.h - 92, height: 1, background: "#E7E9F2" }} />
        <div style={{ position: "absolute", left: CREATE_BUTTON.x - PANEL.x - 112, top: CREATE_BUTTON.y - PANEL.y, width: 100, height: CREATE_BUTTON.h, borderRadius: 10, border: `1px solid ${UI.chipBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: UIN.button, color: "#5B6478" }}>
          Cancel
        </div>
        <div
          style={{
            position: "absolute",
            left: CREATE_BUTTON.x - PANEL.x,
            top: CREATE_BUTTON.y - PANEL.y,
            width: CREATE_BUTTON.w,
            height: CREATE_BUTTON.h,
            borderRadius: 10,
            background: s.createPressed > 0 ? "#2A3147" : UI.primaryBg,
            transform: `scale(${1 - 0.04 * s.createPressed})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: UIN.button,
            fontWeight: 600,
            color: UI.primaryText,
            whiteSpace: "nowrap",
          }}
        >
          Create agent
        </div>
      </div>
    </>
  );
};
