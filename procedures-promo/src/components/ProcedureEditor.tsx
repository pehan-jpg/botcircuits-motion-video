import React from "react";
import { COLORS, TEXT } from "../theme";

// Editor card geometry, in world coordinates (the camera transforms the whole world).
export const CARD = { x: 160, y: 56, w: 640, h: 428 };
// Key element positions relative to the card, used to aim the cursor and the camera.
export const POS = {
  title: { x: 24, y: 72, w: 592, h: 32 },
  step: { y: 120 },
  instr: { x: 140, y: 146, w: 360, h: 46 },
  chip: { x: 510, y: 158 },
  addPill: { x: 140, y: 208, w: 124, h: 24 },
  branchHeader: { y: 212 },
  ifCard: { x: 112, y: 238, w: 504, h: 92 },
  elseCard: { x: 112, y: 340, w: 504, h: 40 },
  cond: { x: 50, y: 12, w: 250, h: 26 },
  action: { x: 50, y: 50, w: 236, h: 26 },
  toggle: { x: 312, y: 56, w: 26, h: 14 },
  rail: { x: 44, y1: 132, y2: 360 },
};

export type EditorState = {
  rows: number[]; // staggered entry progress for the template rows (0→1)
  titleText: string;
  titleFocus: boolean;
  instrText: string;
  instrFocus: boolean;
  chip: number;
  addPill: number; // 1 = visible, 0 = gone
  branches: [number, number, number]; // header, IF card, ELSE IF card (spring progress)
  condText: string;
  condFocus: boolean;
  actionOpen: number;
  actionHover: number;
  actionSelected: boolean;
  toggle: number;
  glow: number;
  badge: number;
  trail: number; // 0→1 along the rail (live execution traversal)
  verifyActive: number;
  ifActive: number;
  caretOn: boolean;
  saved: boolean;
};

export const EMPTY_EDITOR: EditorState = {
  rows: [1, 1, 1, 1, 1, 1],
  titleText: "",
  titleFocus: false,
  instrText: "",
  instrFocus: false,
  chip: 0,
  addPill: 1,
  branches: [0, 0, 0],
  condText: "",
  condFocus: false,
  actionOpen: 0,
  actionHover: -1,
  actionSelected: false,
  toggle: 0,
  glow: 0,
  badge: 0,
  trail: 0,
  verifyActive: 0,
  ifActive: 0,
  caretOn: false,
  saved: false,
};

const Badge: React.FC<{ bg: string; fg: string; children: React.ReactNode; style?: React.CSSProperties }> = ({
  bg,
  fg,
  children,
  style,
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      height: 16,
      padding: "0 6px",
      borderRadius: 4,
      background: bg,
      color: fg,
      fontSize: 8.5,
      fontWeight: 500,
      letterSpacing: "0.04em",
      ...style,
    }}
  >
    {children}
  </span>
);

const Caret: React.FC<{ on: boolean }> = ({ on }) => (
  <span
    style={{
      display: "inline-block",
      width: 1,
      height: "1.05em",
      marginLeft: 1,
      verticalAlign: "-0.15em",
      background: COLORS.ink,
      opacity: on ? 1 : 0,
    }}
  />
);

const rowStyle = (p: number): React.CSSProperties => ({
  opacity: p,
  translate: `0px ${(1 - p) * 10}px`,
});

const ACTIONS = ["Send message", "Run instruction", TEXT.action, "End conversation"];

export const ProcedureEditor: React.FC<{ s: EditorState; style?: React.CSSProperties }> = ({ s, style }) => {
  const focusBorder = (f: boolean) => (f ? "1px solid #111827" : `1px solid ${COLORS.border}`);
  const ifBorder = s.glow > 0 ? `1.5px solid rgba(210,248,0,${s.glow})` : `1px solid ${COLORS.border}`;
  return (
    <div
      style={{
        position: "absolute",
        left: CARD.x,
        top: CARD.y,
        width: CARD.w,
        height: CARD.h,
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        boxShadow: "0 1px 2px rgba(17,24,39,0.04), 0 12px 32px -12px rgba(17,24,39,0.10)",
        ...style,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          ...rowStyle(s.rows[0]),
          height: 44,
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          fontSize: 11,
          color: COLORS.grey,
          gap: 6,
        }}
      >
        <span>Procedures</span>
        <span style={{ color: COLORS.greyLight }}>/</span>
        <span style={{ color: COLORS.ink, fontWeight: 500 }}>{s.titleText || "New procedure"}</span>
        <span style={{ flex: 1 }} />
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            height: 20,
            padding: "0 8px",
            borderRadius: 10,
            border: `1px solid ${COLORS.border}`,
            fontSize: 9.5,
            color: COLORS.grey,
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: 3, background: s.saved ? COLORS.lime : "#D1D5DB" }} />
          {s.saved ? "Live" : "Draft"}
        </span>
      </div>

      {/* Procedure name */}
      <div style={{ ...rowStyle(s.rows[1]), position: "absolute", left: POS.title.x, top: 54, fontSize: 9.5, color: COLORS.grey }}>
        Procedure name
      </div>
      <div
        style={{
          ...rowStyle(s.rows[1]),
          position: "absolute",
          left: POS.title.x,
          top: POS.title.y,
          width: POS.title.w,
          height: POS.title.h,
          boxSizing: "border-box",
          border: focusBorder(s.titleFocus),
          borderRadius: 8,
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          fontSize: 15,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          color: s.titleText ? COLORS.ink : COLORS.greyLight,
        }}
      >
        {s.titleText || (s.titleFocus ? "" : "Untitled procedure")}
        {s.titleFocus ? <Caret on={s.caretOn} /> : null}
      </div>

      {/* Execution rail */}
      <div
        style={{
          ...rowStyle(s.rows[2]),
          position: "absolute",
          left: POS.rail.x,
          top: POS.rail.y1,
          width: 1,
          height: (POS.rail.y2 - POS.rail.y1) * Math.max(0.35, s.branches[2]),
          background: COLORS.border,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: POS.rail.x - 0.5,
          top: POS.rail.y1,
          width: 2,
          height: (284 - POS.rail.y1) * s.trail,
          borderRadius: 1,
          background: COLORS.lime,
          boxShadow: "0 0 6px rgba(210,248,0,0.9)",
          opacity: s.trail > 0 ? 1 : 0,
        }}
      />
      {s.trail > 0 && s.trail < 1 ? (
        <div
          style={{
            position: "absolute",
            left: POS.rail.x - 4.5,
            top: POS.rail.y1 + (284 - POS.rail.y1) * s.trail - 4,
            width: 9,
            height: 9,
            borderRadius: 5,
            background: COLORS.lime,
            boxShadow: "0 0 10px 4px rgba(210,248,0,0.75)",
          }}
        />
      ) : null}

      {/* Step 1 header */}
      <div
        style={{
          ...rowStyle(s.rows[2]),
          position: "absolute",
          left: 24,
          top: POS.step.y,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        <span style={{ color: COLORS.greyLight, fontWeight: 400 }}>1.</span>
        Verify eligibility
      </div>

      {/* Row 1.1 — RUN instruction */}
      <div
        style={{
          ...rowStyle(s.rows[3]),
          position: "absolute",
          left: 56,
          top: POS.instr.y,
          width: 560,
          height: POS.instr.h,
          borderRadius: 8,
          background: `rgba(210,248,0,${0.16 * s.verifyActive})`,
          boxShadow: s.verifyActive > 0 ? `inset 0 0 0 1px rgba(210,248,0,${0.9 * s.verifyActive})` : undefined,
          marginLeft: -8,
          paddingLeft: 8,
        }}
      >
        <span style={{ position: "absolute", left: 8, top: 6, fontSize: 9.5, color: COLORS.greyLight }}>1.1</span>
        <Badge bg={COLORS.runBg} fg={COLORS.runFg} style={{ position: "absolute", left: 32, top: 4 }}>
          RUN
        </Badge>
        <span
          style={{
            position: "absolute",
            left: 32,
            top: 24,
            fontSize: 8.5,
            color: COLORS.grey,
            background: "#F3F4F6",
            borderRadius: 4,
            padding: "2px 5px",
          }}
        >
          Instruction
        </span>
      </div>
      <div
        style={{
          ...rowStyle(s.rows[3]),
          position: "absolute",
          left: POS.instr.x,
          top: POS.instr.y,
          width: POS.instr.w,
          height: POS.instr.h,
          boxSizing: "border-box",
          border: focusBorder(s.instrFocus),
          background: COLORS.surface,
          borderRadius: 8,
          padding: "6px 10px",
          fontSize: 11,
          lineHeight: 1.5,
          color: s.instrText ? COLORS.ink : COLORS.greyLight,
        }}
      >
        {s.instrText || (s.instrFocus ? "" : "Describe what the agent should do…")}
        {s.instrFocus ? <Caret on={s.caretOn} /> : null}
      </div>
      <div
        style={{
          position: "absolute",
          left: POS.chip.x,
          top: POS.chip.y,
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 9.5,
          color: COLORS.greyLight,
          opacity: s.chip,
          scale: String(0.85 + 0.15 * s.chip),
        }}
      >
        into
        <span
          style={{
            background: COLORS.varBg,
            color: COLORS.varFg,
            borderRadius: 5,
            padding: "3px 6px",
            fontSize: 9.5,
            fontWeight: 500,
          }}
        >
          <span style={{ fontSize: 7.5, opacity: 0.7, marginRight: 3 }}>Aa</span>
          order_age
        </span>
      </div>

      {/* + Add branch rule */}
      <div
        style={{
          position: "absolute",
          left: POS.addPill.x,
          top: POS.addPill.y,
          width: POS.addPill.w,
          height: POS.addPill.h,
          boxSizing: "border-box",
          borderRadius: 12,
          border: `1px dashed #D1D5DB`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          fontSize: 10.5,
          color: COLORS.grey,
          opacity: s.addPill * s.rows[4],
          translate: `0px ${(1 - s.rows[4]) * 10}px`,
          scale: String(0.9 + 0.1 * s.addPill),
        }}
      >
        <span style={{ fontSize: 13, lineHeight: 1 }}>+</span> Add branch rule
      </div>

      {/* 1.2 IF header */}
      <div
        style={{
          position: "absolute",
          left: 64,
          top: POS.branchHeader.y,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 9.5,
          color: COLORS.greyLight,
          opacity: s.branches[0],
          translate: `0px ${(1 - s.branches[0]) * 12}px`,
        }}
      >
        1.2
        <Badge bg={COLORS.ifBg} fg={COLORS.ifFg}>IF</Badge>
        <span style={{ color: COLORS.grey }}>2 branches</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 232,
          width: 1,
          height: 150 * s.branches[2],
          background: "#E9D5FF",
        }}
      />

      {/* IF card */}
      <div
        style={{
          position: "absolute",
          left: POS.ifCard.x,
          top: POS.ifCard.y,
          width: POS.ifCard.w,
          height: POS.ifCard.h,
          boxSizing: "border-box",
          borderRadius: 10,
          border: ifBorder,
          background: COLORS.surface,
          boxShadow:
            s.glow > 0 || s.ifActive > 0
              ? `0 0 ${16 * Math.max(s.glow, s.ifActive)}px rgba(210,248,0,${0.55 * Math.max(s.glow, s.ifActive)})`
              : "0 1px 2px rgba(17,24,39,0.04)",
          opacity: Math.min(1, s.branches[1] * 1.5),
          translate: `0px ${(1 - s.branches[1]) * 12}px`,
          zIndex: 2,
        }}
      >
        <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: `rgba(210,248,0,${0.1 * s.ifActive})` }} />
        <Badge bg={COLORS.ifBg} fg={COLORS.ifFg} style={{ position: "absolute", left: 12, top: 17 }}>
          IF
        </Badge>
        <div
          style={{
            position: "absolute",
            left: POS.cond.x,
            top: POS.cond.y,
            width: POS.cond.w,
            height: POS.cond.h,
            boxSizing: "border-box",
            borderRadius: 6,
            border: focusBorder(s.condFocus),
            padding: "0 9px",
            display: "flex",
            alignItems: "center",
            fontSize: 11,
            color: s.condText ? COLORS.ink : COLORS.greyLight,
          }}
        >
          {s.condText || "Add a condition…"}
          {s.condFocus ? <Caret on={s.caretOn} /> : null}
        </div>
        <span
          style={{
            position: "absolute",
            right: 12,
            top: 17,
            fontSize: 8.5,
            color: COLORS.grey,
            background: "#F3F4F6",
            borderRadius: 4,
            padding: "2px 6px",
          }}
        >
          Natural language
        </span>

        <span style={{ position: "absolute", left: 12, top: 57, fontSize: 8.5, color: COLORS.greyLight, letterSpacing: "0.04em" }}>
          THEN
        </span>
        <div
          style={{
            position: "absolute",
            left: POS.action.x,
            top: POS.action.y,
            width: POS.action.w,
            height: POS.action.h,
            boxSizing: "border-box",
            borderRadius: 6,
            border: focusBorder(s.actionOpen > 0.5),
            padding: "0 9px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: s.actionSelected ? COLORS.ink : COLORS.greyLight,
          }}
        >
          {s.actionSelected ? (
            <Badge bg={COLORS.sendBg} fg={COLORS.sendFg} style={{ height: 14, fontSize: 7.5 }}>
              HANDOFF
            </Badge>
          ) : null}
          <span style={{ flex: 1 }}>{s.actionSelected ? TEXT.action : "Select action"}</span>
          <svg width={8} height={8} viewBox="0 0 8 8">
            <path d="M1.5 3 L4 5.5 L6.5 3" stroke={COLORS.grey} strokeWidth={1} fill="none" />
          </svg>
        </div>

        {/* Strict Boundary Rule toggle */}
        <div
          style={{
            position: "absolute",
            left: POS.toggle.x,
            top: POS.toggle.y,
            width: POS.toggle.w,
            height: POS.toggle.h,
            borderRadius: 7,
            background: s.toggle > 0.5 ? COLORS.lime : "#E5E7EB",
            boxShadow: s.toggle > 0.5 ? "inset 0 0 0 1px rgba(17,24,39,0.06)" : undefined,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 2,
              left: 2 + 12 * s.toggle,
              width: 10,
              height: 10,
              borderRadius: 5,
              background: s.toggle > 0.5 ? COLORS.ink : COLORS.surface,
              boxShadow: "0 1px 2px rgba(17,24,39,0.2)",
            }}
          />
        </div>
        <span style={{ position: "absolute", left: POS.toggle.x + 34, top: 56, fontSize: 10.5, color: COLORS.ink }}>
          Strict Boundary Rule
        </span>

        {/* ● Active Policy badge */}
        <div
          style={{
            position: "absolute",
            right: 12,
            top: -9,
            height: 18,
            padding: "0 8px",
            borderRadius: 9,
            background: COLORS.ink,
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 9,
            fontWeight: 500,
            opacity: Math.min(1, s.badge * 1.4),
            scale: String(s.badge),
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: 3, background: COLORS.lime }} />
          Active Policy
        </div>

        {/* Action dropdown */}
        {s.actionOpen > 0 ? (
          <div
            style={{
              position: "absolute",
              left: POS.action.x,
              top: POS.action.y + POS.action.h + 4,
              width: POS.action.w,
              boxSizing: "border-box",
              padding: 4,
              borderRadius: 8,
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              boxShadow: "0 12px 28px -8px rgba(17,24,39,0.18)",
              opacity: s.actionOpen,
              translate: `0px ${(1 - s.actionOpen) * -6}px`,
              zIndex: 10,
            }}
          >
            {ACTIONS.map((a, i) => {
              const p = Math.min(1, Math.max(0, s.actionOpen * 4 - i * 0.6));
              return (
                <div
                  key={a}
                  style={{
                    height: 24,
                    borderRadius: 5,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 8px",
                    fontSize: 10.5,
                    color: COLORS.ink,
                    background: s.actionHover === i ? "#F3F4F6" : "transparent",
                    opacity: p,
                    translate: `0px ${(1 - p) * 6}px`,
                  }}
                >
                  {a}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* ELSE IF card */}
      <div
        style={{
          position: "absolute",
          left: POS.elseCard.x,
          top: POS.elseCard.y,
          width: POS.elseCard.w,
          height: POS.elseCard.h,
          boxSizing: "border-box",
          borderRadius: 10,
          border: `1px solid ${COLORS.border}`,
          background: COLORS.surface,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 12px",
          fontSize: 11,
          color: COLORS.grey,
          opacity: Math.min(1, s.branches[2] * 1.5),
          translate: `0px ${(1 - s.branches[2]) * 12}px`,
        }}
      >
        <Badge bg={COLORS.ifBg} fg={COLORS.ifFg}>ELSE IF</Badge>
        Order Age ≤ 30 Days
        <span style={{ color: COLORS.greyLight }}>→</span>
        <Badge bg={COLORS.runBg} fg={COLORS.runFg}>RUN</Badge>
        Calculate refund
      </div>
    </div>
  );
};
