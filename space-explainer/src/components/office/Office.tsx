import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, UIN, type OrbPaletteKey } from "../../theme";
import { SpaceOrb } from "../SpaceOrb";

/**
 * The Control Room office: an original SVG rebuild of
 * reference/ui/02-control-room-office.png, authored in that screenshot's pixel
 * space (1633 x 836) so the two compare directly, and built from parts so
 * the people can move.
 *
 * Projection (oblique, measured from the screenshot):
 *   world x runs along the back wall, y toward the viewer, z up.
 *   screen = (340 + x - 0.484 y, 330 + 0.143 x + y - z)
 */
export const proj = (x: number, y: number, z = 0) => ({ x: 340 + x - 0.484 * y, y: 330 + 0.143 * x + y - z });
const pts = (...p: [number, number, number?][]) =>
  p
    .map(([x, y, z]) => {
      const q = proj(x, y, z ?? 0);
      return `${q.x.toFixed(1)},${q.y.toFixed(1)}`;
    })
    .join(" ");
const W = 700;
const D = 310;
const H = 115;
const FLOOR = "matrix(1 0.143 -0.484 1 340 330)";
const BACK_WALL = "matrix(1 0.143 0 1 340 330)"; // local (x, -z)
const LEFT_WALL = "matrix(-0.484 1 0 1 340 330)"; // local (y, -z)

export type AgentKey = "iris" | "nora" | "theo" | "owen";
export const AGENT_ORDER: AgentKey[] = ["iris", "nora", "theo", "owen"];
export const DESKS: Record<AgentKey, { desk: [number, number]; feet: [number, number] }> = {
  iris: { desk: [40, 5], feet: [125, 60] },
  nora: { desk: [290, 5], feet: [375, 60] },
  theo: { desk: [90, 215], feet: [175, 270] },
  owen: { desk: [330, 215], feet: [415, 270] },
};
export const feetScreen = (k: AgentKey) => proj(DESKS[k].feet[0], DESKS[k].feet[1]);

export type PedestalKey = "gmail" | "drive" | "sheets" | "slack";
export const PEDESTALS: Record<PedestalKey, { at: [number, number]; logo: string; name: string }> = {
  gmail: { at: [540, 70], logo: "logos/gmail.svg", name: "Gmail" },
  drive: { at: [635, 70], logo: "logos/google-drive.svg", name: "Google Drive" },
  sheets: { at: [570, 270], logo: "logos/google-sheets.svg", name: "Google Sheets" },
  slack: { at: [668, 270], logo: "logos/slack.svg", name: "Slack" },
};
export const pedestalCard = (k: PedestalKey) => {
  const [x, y] = PEDESTALS[k].at;
  const top = proj(x + 18, y + 14, 46);
  return { x: top.x, y: top.y - 34 };
};

const Window: React.FC<{ x0: number; x1: number }> = ({ x0, x1 }) => (
  <g transform={BACK_WALL}>
    <rect x={x0 - 3} y={-40} width={x1 - x0 + 6} height={4} fill="#F7F3EA" />
    <rect x={x0} y={-102} width={x1 - x0} height={62} fill="#E3DED2" />
    <rect x={x0 + 4} y={-98} width={x1 - x0 - 8} height={54} fill="#D3E5EC" />
    {[0.06, 0.2, 0.32, 0.5, 0.62, 0.78].map((f, i) => (
      <rect key={i} x={x0 + 4 + f * (x1 - x0 - 8)} y={-44 - (10 + ((i * 7) % 4) * 6)} width={(x1 - x0) * 0.09} height={10 + ((i * 7) % 4) * 6} fill="#B9D2DC" />
    ))}
    <line x1={x0 + 10} y1={-90} x2={x0 + (x1 - x0) * 0.45} y2={-70} stroke="#FFFFFF" strokeOpacity={0.8} strokeWidth={1.6} />
    <line x1={x0 + (x1 - x0) * 0.35} y1={-96} x2={x0 + (x1 - x0) * 0.6} y2={-84} stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={1.2} />
    <line x1={x0 + (x1 - x0) / 2} y1={-98} x2={x0 + (x1 - x0) / 2} y2={-44} stroke="#E3DED2" strokeWidth={3} />
  </g>
);

const Plant: React.FC<{ x: number; y: number; scale?: number; sway: number }> = ({ x, y, scale = 1, sway }) => {
  const p = proj(x, y);
  return (
    <g transform={`translate(${p.x} ${p.y}) scale(${scale})`}>
      <ellipse cx={0} cy={2} rx={16} ry={5} fill="rgba(0,0,0,0.12)" />
      <path d="M-11 -20 L11 -20 L8 0 L-8 0 Z" fill="#F4F1EA" stroke="#D9D3C6" strokeWidth={1} />
      <g transform={`rotate(${sway} 0 -20)`}>
        {(
          [
            [-14, -44, -30, "#5E8C4C"],
            [12, -46, 28, "#5E8C4C"],
            [-4, -58, -6, "#77A85E"],
            [6, -52, 14, "#6A9A55"],
            [-10, -36, -50, "#77A85E"],
            [12, -34, 48, "#6A9A55"],
          ] as [number, number, number, string][]
        ).map(([cx, cy, r, c], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={6} ry={18} fill={c} transform={`rotate(${r} ${cx} ${cy})`} />
        ))}
      </g>
    </g>
  );
};

const Desk: React.FC<{ x: number; y: number; glow: number }> = ({ x, y, glow }) => {
  const legs: [number, number][] = [
    [x + 4, y + 4],
    [x + 91, y + 4],
    [x + 4, y + 38],
    [x + 91, y + 38],
  ];
  const chair = proj(x + 48, y + 72, 0);
  return (
    <g>
      <polygon points={pts([x, y + 42, 0], [x + 95, y + 42, 0], [x + 95, y + 50, 0], [x, y + 50, 0])} fill="rgba(0,0,0,0.08)" />
      {legs.map(([lx, ly], i) => {
        const a = proj(lx, ly, 0);
        const b = proj(lx, ly, 28);
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#3A3D42" strokeWidth={3} />;
      })}
      <polygon points={pts([x, y, 30], [x + 95, y, 30], [x + 95, y + 42, 30], [x, y + 42, 30])} fill="#D9B88E" />
      <polygon points={pts([x, y + 42, 30], [x + 95, y + 42, 30], [x + 95, y + 42, 26], [x, y + 42, 26])} fill="#B8946A" />
      <polygon points={pts([x + 95, y, 30], [x + 95, y + 42, 30], [x + 95, y + 42, 26], [x + 95, y, 26])} fill="#A88560" />
      <polygon points={pts([x + 44, y + 12, 30], [x + 50, y + 12, 30], [x + 50, y + 12, 38], [x + 44, y + 12, 38])} fill="#2B2F36" />
      <polygon points={pts([x + 24, y + 10, 36], [x + 72, y + 10, 36], [x + 72, y + 10, 66], [x + 24, y + 10, 66])} fill="#262B33" />
      <polygon points={pts([x + 27, y + 10, 39], [x + 69, y + 10, 39], [x + 69, y + 10, 63], [x + 27, y + 10, 63])} fill="#3F5F78" />
      <polygon points={pts([x + 27, y + 10, 39], [x + 69, y + 10, 39], [x + 69, y + 10, 63], [x + 27, y + 10, 63])} fill="#7FB0D0" opacity={0.35 * glow} />
      <polygon points={pts([x + 30, y + 10, 57], [x + 56, y + 10, 57], [x + 56, y + 10, 59], [x + 30, y + 10, 59])} fill="#9CC3DA" />
      <polygon points={pts([x + 30, y + 10, 52], [x + 62, y + 10, 52], [x + 62, y + 10, 53.5], [x + 30, y + 10, 53.5])} fill="#7FA9C2" />
      <polygon points={pts([x + 28, y + 24, 30.5], [x + 66, y + 24, 30.5], [x + 66, y + 32, 30.5], [x + 28, y + 32, 30.5])} fill="#F2F0EC" />
      <polygon points={pts([x + 8, y + 18, 30.5], [x + 18, y + 18, 30.5], [x + 18, y + 26, 30.5], [x + 8, y + 26, 30.5])} fill="#6E5B4C" />
      <g transform={`translate(${chair.x} ${chair.y})`}>
        <line x1={0} y1={0} x2={0} y2={-16} stroke="#4A4F55" strokeWidth={3} />
        <ellipse cx={0} cy={1} rx={12} ry={3.5} fill="#4A4F55" />
        <ellipse cx={0} cy={-18} rx={15} ry={6} fill="#6E8A91" />
        <rect x={-11} y={-44} width={22} height={24} rx={5} fill="#7C979D" />
      </g>
    </g>
  );
};

/** Same figure for everyone: dark suit, as Iris in the screenshot; hair and an accent in the agent's orb colour. */
export type Look = { skin: string; hair: string; accent: string; glasses?: boolean; hairStyle: "short" | "long" | "curly" };
export const LOOKS: Record<AgentKey, Look> = {
  iris: { skin: "#E8B996", hair: "#3B2A22", accent: "#6B4FE0", glasses: true, hairStyle: "short" },
  nora: { skin: "#C98E6A", hair: "#2B1D17", accent: "#D6457A", hairStyle: "long" },
  theo: { skin: "#F0C7A6", hair: "#8A6A4A", accent: "#1FA3A0", glasses: true, hairStyle: "short" },
  owen: { skin: "#8D5A3F", hair: "#1E1715", accent: "#E4572E", hairStyle: "curly" },
};
const SUIT = "#2C2F36";
const SUIT_SHADE = "#22252B";
const TROUSERS = "#23252A";

/** Pose of a figure. facing "front" shows the face, "back" the back of the head; mirror flips left and right. */
export type Pose = {
  facing: "front" | "back";
  mirror: boolean;
  /** Seconds into a wave (0 to waveLen), or negative for none. */
  wave: number;
  waveLen: number;
  /** Walk cycle phase in radians, or null when standing. */
  walk: number | null;
  carry: boolean;
  breathe: number;
  /** Wave oscillation frequency, Hz (default 3). */
  waveHz?: number;
  /** 0 to 1: leg and arm swing amplitude (eases to 0 as a walk stops). */
  stride?: number;
};
export const STANDING: Pose = { facing: "front", mirror: false, wave: -1, waveLen: 1.2, walk: null, carry: false, breathe: 0 };
/** Figure height in office units (feet to top of hair). */
export const FIGURE_H = 82;

/** Standing or walking figure, feet at (0, 0). Wave: arm raise with 20 degrees of oscillation at 3Hz and a slight head turn. */
export const Person: React.FC<{ look: Look; pose: Pose }> = ({ look, pose }) => {
  const { wave, waveLen, walk, facing, carry } = pose;
  const inWave = wave >= 0 && wave <= waveLen;
  const ramp = Math.min(0.2, waveLen / 4);
  const up = inWave ? Math.min(1, wave / ramp, (waveLen - wave) / ramp) : 0;
  const swing = walk === null ? 0 : Math.sin(walk) * (pose.stride ?? 1);
  const bob = walk === null ? pose.breathe * 0.6 : Math.abs(Math.sin(walk)) * 1.6 * (pose.stride ?? 1);
  const waveArm = -150 * up + 24 * Math.sin(wave * Math.PI * 2 * (pose.waveHz ?? 3)) * up;
  const rightArm = inWave ? waveArm : carry ? -35 : -swing * 22;
  const leftArm = swing * 22;
  const legA = swing * 20;
  const turn = inWave ? 2.4 * up : 0;
  const back = facing === "back";
  return (
    <g transform={`scale(${pose.mirror ? -1 : 1} 1)`}>
      <ellipse cx={0} cy={0} rx={15} ry={4.5} fill="rgba(0,0,0,0.16)" />
      {/* Legs swing about the hips */}
      <g transform={`rotate(${legA} -4.5 -27)`}>
        <rect x={-8} y={-27} width={6.5} height={26} rx={2.5} fill={TROUSERS} />
        <rect x={-10} y={-3} width={9} height={4} rx={2} fill="#141414" />
      </g>
      <g transform={`rotate(${-legA} 4.5 -27)`}>
        <rect x={1.5} y={-27} width={6.5} height={26} rx={2.5} fill={TROUSERS} />
        <rect x={1} y={-3} width={9} height={4} rx={2} fill="#141414" />
      </g>
      <g transform={`translate(0 ${-bob})`}>
        {look.hairStyle === "long" && !back ? <path d="M-12 -68 Q-14 -50 -10 -47 L10 -47 Q14 -50 12 -68 Z" fill={look.hair} /> : null}
        <g transform={`rotate(${leftArm} -14 -49)`}>
          <rect x={-17} y={-50} width={6} height={23} rx={3} fill={SUIT_SHADE} />
          <circle cx={-14} cy={-27} r={3.2} fill={look.skin} />
        </g>
        <path d="M-13 -25 Q-14 -51 -6 -54 L6 -54 Q14 -51 13 -25 Z" fill={SUIT} />
        {back ? (
          <path d="M-1 -53 L1 -53 L1 -27 L-1 -27 Z" fill={SUIT_SHADE} />
        ) : (
          <>
            <path d="M-4 -54 L0 -44 L4 -54 Z" fill="#F4F4F4" />
            <path d="M-1.3 -51 L1.3 -51 L1.8 -40 L0 -37 L-1.8 -40 Z" fill={look.accent} />
            <path d="M-6 -54 L-1.5 -44 L-4 -40 Z" fill={SUIT_SHADE} />
            <path d="M6 -54 L1.5 -44 L4 -40 Z" fill={SUIT_SHADE} />
            <rect x={5} y={-48} width={4} height={3} rx={1} fill="#FFFFFF" opacity={0.9} />
          </>
        )}
        <g transform={`rotate(${rightArm} 14 -49)`}>
          <rect x={11} y={-50} width={6} height={23} rx={3} fill={SUIT} />
          <circle cx={14} cy={-27} r={3.4} fill={look.skin} />
          {carry ? <rect x={9} y={-31} width={13} height={10} rx={1.5} fill="#F1D9A6" stroke="#B89A5E" strokeWidth={1} /> : null}
        </g>
        <rect x={-3} y={-59} width={6} height={6} fill={look.skin} />
        <g transform={`translate(${turn * 0.4} 0)`}>
          <circle cx={0} cy={-68} r={10.5} fill={look.skin} />
          {back ? (
            // Back of the head: hair covers it
            look.hairStyle === "curly" ? (
              <g fill={look.hair}>
                {[-8, -4, 0, 4, 8].map((x) => (
                  <circle key={x} cx={x} cy={-72 + Math.abs(x) * 0.2} r={5.2} />
                ))}
              </g>
            ) : (
              <path d={look.hairStyle === "long" ? "M-11.5 -69 Q-11 -81 0 -81 Q11 -81 11.5 -69 L12 -50 L-12 -50 Z" : "M-11 -67 Q-11 -81 0 -81 Q11 -81 11 -67 Q6 -60 0 -60 Q-6 -60 -11 -67 Z"} fill={look.hair} />
            )
          ) : look.hairStyle === "curly" ? (
            <g fill={look.hair}>
              {[-8, -4, 0, 4, 8].map((x) => (
                <circle key={x} cx={x} cy={-77 + Math.abs(x) * 0.3} r={4.2} />
              ))}
            </g>
          ) : (
            <path d="M-11 -69 Q-11 -81 0 -81 Q11 -81 11 -69 Q6 -75 -4 -73 Q-9 -72 -11 -69 Z" fill={look.hair} />
          )}
          {!back ? (
            <g transform={`translate(${turn} 0)`}>
              {look.glasses ? (
                <g stroke="#1E1E1E" strokeWidth={1.3} fill="none">
                  <circle cx={-4} cy={-67} r={3} />
                  <circle cx={4} cy={-67} r={3} />
                  <line x1={-1} y1={-67} x2={1} y2={-67} />
                </g>
              ) : (
                <g fill="#2A2A2A">
                  <circle cx={-3.5} cy={-67} r={1.2} />
                  <circle cx={3.5} cy={-67} r={1.2} />
                </g>
              )}
              <path d={`M-2.5 -62 Q0 ${-60 + up * 1.2} 2.5 -62`} stroke="#7A4A3A" strokeWidth={1.1} fill="none" />
            </g>
          ) : null}
        </g>
      </g>
    </g>
  );
};

/** Every status a plate will ever show. Plates are sized to the widest so text never leaves its box. */
export const PLATE_STATUSES = ["Listening for requests", "Idle", "Reading claim", "Checking policy", "Matching evidence", "Passed to Nora", "Done"];
export const PLATE_TEXT = { name: 16.5, line: UIN.helper };

export type PlateState = { role: string; status: string; pulse: number; opacity: number };

/** Name plate: orb avatar, name, role, status; width fits the widest of all its strings plus 16px each side. */
export const NamePlate: React.FC<{ name: string; p: PlateState; palette: OrbPaletteKey; clock: number; style?: React.CSSProperties; read?: boolean }> = ({ name, p, palette, clock, style, read = true }) => (
  <div
    data-guard="uitext"
    data-guard-read={read ? "1" : undefined}
    data-guard-label={`Plate ${name}`}
    data-fit-box={`plate ${name}`}
    style={{
      position: "absolute",
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 16px",
      borderRadius: 10,
      background: "#FFFFFF",
      boxShadow: "0 4px 14px rgba(60,45,30,0.16)",
      border: "1px solid rgba(0,0,0,0.06)",
      fontFamily: FONT.sans,
      lineHeight: "21px",
      whiteSpace: "nowrap",
      opacity: p.opacity,
      ...style,
    }}
  >
    <SpaceOrb size={30} palette={palette} timeOffset={clock} />
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <span data-fit-text style={{ fontSize: PLATE_TEXT.name, fontWeight: 700, color: "#0D1224" }}>
        {name}
      </span>
      <span data-fit-text style={{ fontSize: PLATE_TEXT.line, color: "rgba(13,18,36,0.66)" }}>
        {p.role}
      </span>
      <div style={{ display: "grid" }}>
        {PLATE_STATUSES.map((st) => (
          <span
            key={st}
            data-fit-text={st === p.status ? "" : undefined}
            style={{
              gridArea: "1 / 1",
              justifySelf: "start",
              visibility: st === p.status ? "visible" : "hidden",
              fontSize: PLATE_TEXT.line,
              fontWeight: 600,
              color: "#2B57C9",
              background: st === p.status ? `rgba(91,63,214,${0.12 * p.pulse})` : undefined,
              borderRadius: 4,
            }}
          >
            {st}
          </span>
        ))}
      </div>
    </div>
  </div>
);

/** Plate position for an agent: centred under the desk standing spot. */
export const plateAnchor = (k: AgentKey) => {
  const f = feetScreen(k);
  return { x: f.x, y: f.y + 12 };
};

/** Pedestal labels sit beside the card: Gmail and Google Sheets to the left, Google Drive and Slack to the right. */
const LABEL_SIDE: Record<PedestalKey, "left" | "right"> = { gmail: "left", sheets: "left", drive: "right", slack: "right" };

const Pedestal: React.FC<{ k: PedestalKey; pulse: number; t: number }> = ({ k, pulse, t }) => {
  const { at, logo, name } = PEDESTALS[k];
  const [x, y] = at;
  const card = pedestalCard(k);
  const dot = 0.75 + 0.25 * Math.sin(t * 2.2 + x);
  const side = LABEL_SIDE[k];
  return (
    <>
      <svg width={1633} height={836} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <polygon points={pts([x, y + 28, 0], [x + 36, y + 28, 0], [x + 36, y + 34, 0], [x, y + 34, 0])} fill="rgba(0,0,0,0.1)" />
        <polygon points={pts([x, y + 28, 0], [x + 36, y + 28, 0], [x + 36, y + 28, 46], [x, y + 28, 46])} fill="#A9B8BA" />
        <polygon points={pts([x + 36, y, 0], [x + 36, y + 28, 0], [x + 36, y + 28, 46], [x + 36, y, 46])} fill="#8FA0A3" />
        <polygon points={pts([x, y + 28, 36], [x + 36, y + 28, 36], [x + 36, y + 28, 46], [x, y + 28, 46])} fill="#3F7F84" />
        <polygon points={pts([x + 36, y, 36], [x + 36, y + 28, 36], [x + 36, y + 28, 46], [x + 36, y, 46])} fill="#356C70" />
        <polygon points={pts([x, y, 46], [x + 36, y, 46], [x + 36, y + 28, 46], [x, y + 28, 46])} fill="#5E9CA0" />
      </svg>
      {pulse > 0 && pulse < 1 ? (
        <div style={{ position: "absolute", left: card.x - 46, top: card.y - 46, width: 92, height: 92, borderRadius: 24, border: `3px solid rgba(124,100,255,${0.8 * (1 - pulse)})`, transform: `scale(${0.7 + 0.6 * pulse})` }} />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: card.x - 27,
          top: card.y - 27,
          width: 54,
          height: 54,
          borderRadius: 13,
          background: "#FFFFFF",
          border: "3px solid #4E8F93",
          boxShadow: "0 6px 14px rgba(40,60,60,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
          transform: `scale(${1 + 0.08 * Math.sin(Math.PI * Math.min(1, pulse * 2))})`,
        }}
      >
        <Img data-guard="brand" src={staticFile(logo)} style={{ width: 30, height: 30, objectFit: "contain" }} />
        <div style={{ position: "absolute", right: -5, bottom: -5, width: 11, height: 11, borderRadius: 6, background: "#3DBE5A", border: "2px solid #FFFFFF", opacity: dot }} />
      </div>
      <div
        data-collide="pedestal-label"
        style={{
          position: "absolute",
          top: card.y - 22,
          ...(side === "left" ? { right: 1633 - (card.x - 40) } : { left: card.x + 40 }),
          padding: "3px 10px 4px",
          borderRadius: 6,
          background: "#FFFFFF",
          boxShadow: "0 3px 8px rgba(60,45,30,0.14)",
          textAlign: side === "left" ? "right" : "left",
          fontFamily: FONT.sans,
          lineHeight: 1.2,
          whiteSpace: "nowrap",
        }}
      >
        <div style={{ fontSize: UIN.helper, fontWeight: 600, color: "#1d1d1d" }}>{name}</div>
        <div style={{ fontSize: UIN.helper, color: "#3E7F83" }}>Integration</div>
      </div>
    </>
  );
};

/** The static room. */
const Room: React.FC<{ t: number; glow: Record<AgentKey, number> }> = ({ t, glow }) => (
  <>
    <defs>
      <pattern id="planks" patternUnits="userSpaceOnUse" width={70} height={18} patternTransform={FLOOR}>
        <rect width={70} height={18} fill="#CFAE84" />
        <line x1={0} y1={0} x2={70} y2={0} stroke="#B48F64" strokeWidth={1} />
        <line x1={34} y1={0} x2={34} y2={18} stroke="#B48F64" strokeWidth={0.8} />
      </pattern>
    </defs>
    <polygon points={pts([0, D, 0], [W, D, 0], [W, D, -12], [0, D, -12])} fill="#A9875F" />
    <polygon points={pts([W, 0, 0], [W, D, 0], [W, D, -12], [W, 0, -12])} fill="#977650" />
    <polygon points={pts([0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0])} fill="url(#planks)" />
    <polygon points={pts([55, 120, 0], [470, 120, 0], [470, 305, 0], [55, 305, 0])} fill="rgba(150,140,130,0.22)" />
    <g transform={FLOOR}>
      <text x={150} y={110} fontFamily={FONT.sans} fontSize={UIN.helper} letterSpacing={4} fill="rgba(90,70,50,0.55)">
        TEAM STUDIO
      </text>
      <text x={500} y={58} fontFamily={FONT.sans} fontSize={UIN.helper} letterSpacing={4} fill="rgba(90,70,50,0.55)">
        RESOURCES
      </text>
    </g>
    <polygon points={pts([0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H])} fill="#ECE4D3" />
    <polygon points={pts([0, 0, 0], [W, 0, 0], [W, 0, H], [0, 0, H])} fill="#F3EDE0" />
    <polygon points={pts([0, 0, 0], [W, 0, 0], [W, 0, 5], [0, 0, 5])} fill="#E2D8C4" />
    <polygon points={pts([0, 0, 0], [0, D, 0], [0, D, 5], [0, 0, 5])} fill="#DBD0BA" />
    <polygon points={pts([-8, -8, H], [W, -8, H], [W, 0, H], [0, 0, H], [0, D, H], [-8, D, H])} fill="#FBF8F1" />
    <polygon points={pts([0, D, 0], [-8, D, 0], [-8, D, H], [0, D, H])} fill="#E0D6C2" />
    <Window x0={30} x1={150} />
    <Window x0={205} x1={320} />
    <Window x0={420} x1={535} />
    <Window x0={575} x1={690} />
    <g transform={BACK_WALL}>
      <circle cx={372} cy={-80} r={13} fill="#FFFFFF" stroke="#3A3A3A" strokeWidth={2} />
      <line x1={372} y1={-80} x2={372} y2={-89} stroke="#3A3A3A" strokeWidth={1.6} />
      <line x1={372} y1={-80} x2={372 + 7 * Math.cos(t * 0.5)} y2={-80 + 7 * Math.sin(t * 0.5)} stroke="#3A3A3A" strokeWidth={1.6} />
    </g>
    <g transform={LEFT_WALL}>
      <rect x={150} y={-86} width={70} height={52} fill="#8C6A45" />
      <rect x={154} y={-82} width={62} height={44} fill="#BE966A" />
      <rect x={60} y={-90} width={64} height={46} rx={2} fill="#FFFFFF" stroke="#D8D1C2" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={68 + i * 13} y={-52 - (8 + i * 6)} width={8} height={8 + i * 6} fill={["#9DB7C9", "#7FA3BC", "#9DB7C9", "#6A92B0"][i]} />
      ))}
    </g>
    <polygon points={pts([150, 2, 0], [250, 2, 0], [250, 2, 44], [150, 2, 44])} fill="#7E948A" />
    <polygon points={pts([150, 2, 22], [250, 2, 22], [250, 30, 22], [150, 30, 22])} fill="#93A89E" />
    <polygon points={pts([150, 30, 0], [250, 30, 0], [250, 30, 22], [150, 30, 22])} fill="#6E8279" />
    {AGENT_ORDER.map((k) => (
      <Desk key={k} x={DESKS[k].desk[0]} y={DESKS[k].desk[1]} glow={glow[k]} />
    ))}
  </>
);

/** A thought bubble: white rounded cloud with two tail circles; lines tick off one by one. */
export type BubbleLine = { text: string; appear: number; tick: number; flag?: boolean };
export const ThoughtBubble: React.FC<{ x: number; y: number; lines: BubbleLine[]; opacity: number; name: string }> = ({ x, y, lines, opacity, name }) =>
  opacity <= 0 ? null : (
    <div style={{ position: "absolute", left: x, top: y, opacity, transform: `translate(-50%, -100%) scale(${0.92 + 0.08 * opacity})`, transformOrigin: "50% 100%" }}>
      <div
        data-guard="uitext"
        data-guard-read="1"
        data-guard-label={`Bubble ${name}`}
        data-fit-box={`bubble ${name}`}
        style={{ position: "relative", padding: "12px 18px", borderRadius: 22, background: "#FFFFFF", boxShadow: "0 8px 22px rgba(40,30,20,0.18)", border: "1px solid rgba(0,0,0,0.06)", fontFamily: FONT.sans, whiteSpace: "nowrap" }}
      >
        {lines.map((l) =>
          l.appear > 0 ? (
            <div key={l.text} style={{ display: "flex", alignItems: "center", gap: 8, height: 25, opacity: l.appear, transform: `translateY(${(1 - l.appear) * 6}px)` }}>
              <div style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {l.flag ? (
                  <svg width={16} height={16} viewBox="0 0 16 16" style={{ opacity: l.tick }}>
                    <path d="M3 15 V2 M3 2 H12 L10 5 L12 8 H3" stroke="#5A6070" strokeWidth={1.6} fill="#D9DCE3" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width={16} height={16} viewBox="0 0 16 16" style={{ opacity: l.tick }}>
                    <circle cx={8} cy={8} r={7.5} fill="#3C8F52" />
                    <path d="M4.5 8.2 L7 10.6 L11.5 5.6" stroke="#FFFFFF" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span data-fit-text style={{ fontSize: 16.3, color: "#0D1224" }}>
                {l.text}
              </span>
            </div>
          ) : null,
        )}
      </div>
      <div style={{ position: "absolute", left: "50%", bottom: -14, width: 12, height: 12, borderRadius: 6, background: "#FFFFFF", boxShadow: "0 2px 6px rgba(40,30,20,0.15)", transform: "translateX(-14px)" }} />
      <div style={{ position: "absolute", left: "50%", bottom: -26, width: 7, height: 7, borderRadius: 4, background: "#FFFFFF", boxShadow: "0 2px 4px rgba(40,30,20,0.15)", transform: "translateX(-20px)" }} />
    </div>
  );

export type AgentState = {
  /** World position of the feet. */
  pos: [number, number];
  visible: boolean;
  pose: Pose;
  plate: PlateState;
  plateVisible: boolean;
  bubble?: { lines: BubbleLine[]; opacity: number };
};
export type OfficeState = {
  agents: Record<AgentKey, AgentState>;
  names: Record<AgentKey, string>;
  palettes: Record<AgentKey, OrbPaletteKey>;
  pedestalPulse: Partial<Record<PedestalKey, number>>;
  /** Claim tag: 0 hidden, 0 to 1 dropping onto the front desk; pickup 0 to 1 shrinks it into Iris's hand. */
  claim: number;
  pickup: number;
  /** Result cards flying from each agent to Iris, 0 to 1. */
  results: number;
  clock: number;
};

/** readPlates: false when the room is shown minimised, where plates are not meant to be read. */
/** drawAgents: false when figures, plates and bubbles are drawn by the Control Room's agent layer. */
export const Office: React.FC<{ s: OfficeState; readPlates?: boolean; drawAgents?: boolean }> = ({ s, readPlates = true, drawAgents = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps + s.clock;
  const sway = (i: number) => Math.sin(t * 0.9 + i) * 1.6;
  const iris = feetScreen("iris");
  const tagRest = { x: iris.x + 34, y: iris.y - 118 };
  const cp = Math.max(0, Math.min(1, s.claim));
  const pk = Math.max(0, Math.min(1, s.pickup));
  const tagY = tagRest.y - (1 - cp) * 160 + pk * 70;
  const glow = Object.fromEntries(AGENT_ORDER.map((k) => [k, s.agents[k].visible ? 1 : 0])) as Record<AgentKey, number>;
  // Draw people back to front so nearer figures overlap farther ones.
  const order = [...AGENT_ORDER].sort((a, b) => s.agents[a].pos[1] - s.agents[b].pos[1]);

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1633, height: 836 }}>
      <svg width={1633} height={836} style={{ position: "absolute", left: 0, top: 0 }}>
        <Room t={t} glow={glow} />
        <Plant x={10} y={20} sway={sway(1)} />
        <Plant x={690} y={18} sway={sway(2)} />
        <Plant x={12} y={292} sway={sway(3)} scale={1.05} />
        <Plant x={690} y={300} sway={sway(4)} />
      </svg>
      {(Object.keys(PEDESTALS) as PedestalKey[]).map((k) => (
        <Pedestal key={k} k={k} pulse={s.pedestalPulse[k] ?? 0} t={t} />
      ))}
      <svg width={1633} height={836} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {order.map((k, i) => {
          const a = s.agents[k];
          if (!a.visible || !drawAgents) return null;
          const p = proj(a.pos[0], a.pos[1]);
          return (
            <g key={k} transform={`translate(${p.x} ${p.y})`}>
              <Person look={LOOKS[k]} pose={{ ...a.pose, breathe: Math.sin(t * 1.6 + i) }} />
            </g>
          );
        })}
      </svg>
      {cp > 0 && pk < 1 ? (
        <div
          data-guard="uitext"
          data-guard-label="Claim tag"
          style={{
            position: "absolute",
            left: tagRest.x - 80,
            top: tagY - 17,
            width: 160,
            padding: "5px 0",
            borderRadius: 8,
            background: "#FFFFFF",
            border: "2px solid #6B4FE0",
            boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
            fontFamily: FONT.sans,
            fontSize: UIN.helper,
            fontWeight: 700,
            color: "#0D1224",
            textAlign: "center",
            whiteSpace: "nowrap",
            opacity: Math.min(1, cp * 3) * (1 - pk),
            transform: `scale(${1 - 0.7 * pk})`,
          }}
        >
          Claim CL-7305
        </div>
      ) : null}
      {/* Results fly from Nora, Theo and Owen to Iris */}
      {s.results > 0 && s.results < 1
        ? (["nora", "theo", "owen"] as AgentKey[]).map((k, i) => {
            const from = proj(s.agents[k].pos[0], s.agents[k].pos[1]);
            const to = proj(s.agents.iris.pos[0], s.agents.iris.pos[1]);
            const p = Math.max(0, Math.min(1, s.results * 1.3 - i * 0.15));
            return (
              <div
                key={k}
                style={{
                  position: "absolute",
                  left: from.x + (to.x - from.x) * p - 12,
                  top: from.y - 60 + (to.y - from.y) * p - Math.sin(Math.PI * p) * 50,
                  width: 24,
                  height: 17,
                  borderRadius: 3,
                  background: "#FFFFFF",
                  border: `2px solid ${LOOKS[k].accent}`,
                  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                  opacity: p > 0.97 ? 0 : 1,
                }}
              />
            );
          })
        : null}
      {AGENT_ORDER.map((k) => {
        const a = s.agents[k];
        if (!drawAgents || !a.plateVisible || a.plate.opacity <= 0) return null;
        const an = plateAnchor(k);
        return <NamePlate key={k} name={s.names[k]} p={a.plate} palette={s.palettes[k]} clock={s.clock} read={readPlates} style={{ left: an.x, top: an.y, transform: "translateX(-50%)" }} />;
      })}
      {AGENT_ORDER.map((k) => {
        const a = s.agents[k];
        if (!drawAgents || !a.bubble || !a.visible) return null;
        const p = proj(a.pos[0], a.pos[1]);
        return <ThoughtBubble key={k} x={p.x} y={p.y - FIGURE_H - 30} lines={a.bubble.lines} opacity={a.bubble.opacity} name={s.names[k]} />;
      })}
    </div>
  );
};
