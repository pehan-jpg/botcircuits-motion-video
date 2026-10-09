import React from "react";
import { COLORS, TEXT } from "../theme";

// Editor card geometry, in world coordinates (the camera transforms the whole world).
export const CARD = { x: 160, y: 50, w: 640, h: 412 };
// Key element positions relative to the card, used to aim the cursor and the camera.
export const POS = {
  title: { x: 24, y: 72, w: 592, h: 32 },
  step1: { x: 24, y: 120, w: 592, h: 32 },
  addPill: { x: 64, y: 162, w: 128, h: 24 },
  ifCard: { x: 64, y: 162, w: 552, h: 92 },
  elseCard: { x: 64, y: 264, w: 552, h: 36 },
  // Steps 2 and 3 slide down when the branch is inserted under step 1.
  step2Y: [200, 316] as [number, number],
  step3Y: [240, 356] as [number, number],
  cond: { x: 50, y: 12, w: 250, h: 26 },
  action: { x: 50, y: 50, w: 236, h: 26 },
  toggle: { x: 306, y: 56, w: 26, h: 14 },
  railX: 40,
};
export const BRANCH_Y = POS.ifCard.y + 46; // where the branch connector meets the IF card

export type EditorState = {
  rows: number[]; // staggered entry progress: top bar, procedure name
  titleText: string;
  titleFocus: boolean;
  steps: [number, number, number]; // staggered pop-in of the three steps
  addPill: number; // 1 = visible, 0 = gone
  branches: [number, number]; // IF card, ELSE IF card (spring progress)
  condFocus: number;
  actionOpen: number;
  actionHover: number;
  actionSelected: boolean;
  toggle: number;
  glow: number;
  badge: number;
  triggered: number; // 0 = "Active Policy", 1 = "Strict Boundary Triggered" (lit)
  trail: number; // 0→1 live execution path: step 1 → IF card
  step1Active: number;
  ifActive: number;
  executed: number;
  caretOn: boolean;
  saved: boolean;
};

export const EMPTY_EDITOR: EditorState = {
  rows: [1, 1],
  titleText: "",
  titleFocus: false,
  steps: [0, 0, 0],
  addPill: 0,
  branches: [0, 0],
  condFocus: 0,
  actionOpen: 0,
  actionHover: -1,
  actionSelected: false,
  toggle: 0,
  glow: 0,
  badge: 0,
  triggered: 0,
  trail: 0,
  step1Active: 0,
  ifActive: 0,
  executed: 0,
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

const Check: React.FC<{ color?: string }> = ({ color = COLORS.ink }) => (
  <svg width={9} height={9} viewBox="0 0 10 10">
    <path d="M2 5.2 L4.2 7.3 L8 3" stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const StepRow: React.FC<{
  n: number;
  title: string;
  y: number;
  p: number;
  active?: number;
}> = ({ n, title, y, p, active = 0 }) => (
  <div
    style={{
      position: "absolute",
      left: POS.step1.x,
      top: y,
      width: POS.step1.w,
      height: POS.step1.h,
      boxSizing: "border-box",
      borderRadius: 8,
      border: active > 0 ? `1.5px solid rgba(210,248,0,${active})` : `1px solid ${COLORS.border}`,
      background: active > 0 ? `rgba(210,248,0,${0.1 * active})` : COLORS.surface,
      boxShadow: active > 0 ? `0 0 ${14 * active}px rgba(210,248,0,${0.5 * active})` : undefined,
      opacity: Math.min(1, p * 1.4),
      translate: `0px ${(1 - p) * 12}px`,
      display: "flex",
      alignItems: "center",
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: "-0.005em",
      zIndex: 1,
    }}
  >
    <span
      style={{
        position: "absolute",
        left: POS.railX - POS.step1.x - 9,
        width: 18,
        height: 18,
        borderRadius: 9,
        border: `1px solid ${active > 0.5 ? COLORS.ink : COLORS.border}`,
        background: active > 0.5 ? COLORS.lime : COLORS.surface,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 9,
        color: active > 0.5 ? COLORS.ink : COLORS.grey,
      }}
    >
      {n}
    </span>
    <span style={{ position: "absolute", left: 36 }}>
      <span style={{ color: COLORS.greyLight, fontWeight: 400 }}>{n}.</span> {title}
    </span>
    <Badge bg={COLORS.runBg} fg={COLORS.runFg} style={{ position: "absolute", right: 10 }}>
      RUN
    </Badge>
  </div>
);

const ACTIONS = ["Send message", "Run instruction", TEXT.action, "End conversation"];

export const ProcedureEditor: React.FC<{ s: EditorState; style?: React.CSSProperties }> = ({ s, style }) => {
  const focusBorder = (f: boolean) => (f ? "1px solid #111827" : `1px solid ${COLORS.border}`);
  const lit = Math.max(s.glow, s.ifActive);
  const step2Y = lerp(POS.step2Y[0], POS.step2Y[1], s.branches[0]);
  const step3Y = lerp(POS.step3Y[0], POS.step3Y[1], s.branches[0]);
  const s1c = POS.step1.y + POS.step1.h / 2;
  const s3c = step3Y + POS.step1.h / 2;
  // Live trail: down the rail from step 1 to the branch, then across into the IF card.
  const vLen = BRANCH_Y - s1c;
  const hLen = POS.ifCard.x - POS.railX;
  const dist = s.trail * (vLen + hLen);
  const vDone = Math.min(dist, vLen);
  const hDone = Math.max(0, dist - vLen);
  const head = { x: POS.railX + hDone, y: s1c + vDone };
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
          opacity: s.rows[0],
          translate: `0px ${(1 - s.rows[0]) * 10}px`,
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
      <div style={{ opacity: s.rows[1], position: "absolute", left: POS.title.x, top: 54, fontSize: 9.5, color: COLORS.grey }}>
        Procedure name
      </div>
      <div
        style={{
          opacity: s.rows[1],
          translate: `0px ${(1 - s.rows[1]) * 10}px`,
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

      {/* Step rail */}
      <div
        style={{
          position: "absolute",
          left: POS.railX,
          top: s1c,
          width: 1,
          height: (s3c - s1c) * s.steps[2],
          background: COLORS.border,
        }}
      />
      {/* Branch connector */}
      <div
        style={{
          position: "absolute",
          left: POS.railX,
          top: BRANCH_Y,
          width: hLen * s.branches[0],
          height: 1,
          background: COLORS.border,
        }}
      />
      {/* Live execution trail */}
      {s.trail > 0 ? (
        <>
          <div style={{ position: "absolute", left: POS.railX - 0.5, top: s1c, width: 2, height: vDone, background: COLORS.lime, boxShadow: "0 0 6px rgba(210,248,0,0.9)" }} />
          <div style={{ position: "absolute", left: POS.railX, top: BRANCH_Y - 0.5, width: hDone, height: 2, background: COLORS.lime, boxShadow: "0 0 6px rgba(210,248,0,0.9)" }} />
          {s.trail < 1 ? (
            <div
              style={{
                position: "absolute",
                left: head.x - 4.5,
                top: head.y - 4.5,
                width: 9,
                height: 9,
                borderRadius: 5,
                background: COLORS.lime,
                boxShadow: "0 0 10px 4px rgba(210,248,0,0.75)",
                zIndex: 3,
              }}
            />
          ) : null}
        </>
      ) : null}

      <StepRow n={1} title={TEXT.steps[0]} y={POS.step1.y} p={s.steps[0]} active={s.step1Active} />
      <StepRow n={2} title={TEXT.steps[1]} y={step2Y} p={s.steps[1]} />
      <StepRow n={3} title={TEXT.steps[2]} y={step3Y} p={s.steps[2]} />

      {/* + Add branch rule (under step 1) */}
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
          background: COLORS.surface,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          fontSize: 10.5,
          color: COLORS.grey,
          opacity: s.addPill,
          scale: String(0.9 + 0.1 * s.addPill),
        }}
      >
        <span style={{ fontSize: 13, lineHeight: 1 }}>+</span> Add branch rule
      </div>

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
          border: s.glow > 0 ? `1.5px solid rgba(210,248,0,${s.glow})` : `1px solid ${COLORS.border}`,
          background: COLORS.surface,
          boxShadow: lit > 0 ? `0 0 ${16 * lit}px rgba(210,248,0,${0.55 * lit})` : "0 1px 2px rgba(17,24,39,0.04)",
          opacity: Math.min(1, s.branches[0] * 1.5),
          translate: `0px ${(1 - s.branches[0]) * 12}px`,
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
            border: `1px solid ${COLORS.border}`,
            boxShadow: s.condFocus > 0 ? `0 0 0 ${2 * s.condFocus}px rgba(17,24,39,${0.12 * s.condFocus})` : undefined,
            padding: "0 9px",
            display: "flex",
            alignItems: "center",
            fontSize: 11,
            color: COLORS.ink,
          }}
        >
          {TEXT.condition}
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

        <span style={{ position: "absolute", left: 14, top: 57, fontSize: 9.5, color: COLORS.greyLight }}>1.1</span>
        <div
          style={{
            position: "absolute",
            left: POS.action.x,
            top: POS.action.y,
            width: POS.action.w,
            height: POS.action.h,
            boxSizing: "border-box",
            borderRadius: 6,
            border: s.executed > 0 ? `1px solid rgba(17,24,39,${0.2 + 0.8 * s.executed})` : focusBorder(s.actionOpen > 0.5),
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

        {/* ✓ Executed */}
        <div
          style={{
            position: "absolute",
            right: 12,
            top: 53,
            height: 20,
            padding: "0 8px",
            borderRadius: 10,
            background: COLORS.lime,
            color: COLORS.ink,
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 9.5,
            fontWeight: 500,
            opacity: Math.min(1, s.executed * 1.4),
            scale: String(s.executed),
          }}
        >
          <Check /> Executed
        </div>

        {/* ● Active Policy → ● Strict Boundary Triggered */}
        <div
          style={{
            position: "absolute",
            right: 12,
            top: -9,
            height: 18,
            padding: "0 8px",
            borderRadius: 9,
            background: s.triggered > 0.5 ? COLORS.lime : COLORS.ink,
            color: s.triggered > 0.5 ? COLORS.ink : "#FFFFFF",
            boxShadow: s.triggered > 0 ? `0 0 ${16 * s.triggered}px ${3 * s.triggered}px rgba(210,248,0,${0.7 * s.triggered})` : undefined,
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 9,
            fontWeight: 500,
            whiteSpace: "nowrap",
            opacity: Math.min(1, s.badge * 1.4),
            scale: String(s.badge),
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: 3, background: s.triggered > 0.5 ? COLORS.ink : COLORS.lime }} />
          {s.triggered > 0.5 ? "Strict Boundary Triggered" : "Active Policy"}
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
          opacity: Math.min(1, s.branches[1] * 1.5),
          translate: `0px ${(1 - s.branches[1]) * 12}px`,
        }}
      >
        <Badge bg={COLORS.ifBg} fg={COLORS.ifFg}>ELSE IF</Badge>
        <span style={{ color: COLORS.ink }}>{TEXT.elseCondition}</span>
        <span style={{ color: COLORS.greyLight }}>→</span>
        <Badge bg={COLORS.sendBg} fg={COLORS.sendFg}>SEND</Badge>
        Explain final-sale policy
      </div>
    </div>
  );
};
