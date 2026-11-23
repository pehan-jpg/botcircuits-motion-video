import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT } from "../../theme";

/**
 * The Control Room office, rebuilt as an original SVG to match
 * reference/ui/02-control-room-office.png. Everything is authored in that
 * screenshot's pixel space (1633 x 836) so the two can be compared directly.
 *
 * Projection (oblique, measured from the screenshot):
 *   world x runs along the back wall, y toward the viewer, z up.
 *   screen = (340 + x - 0.484 y, 330 + 0.143 x + y - z)
 */
export const proj = (x: number, y: number, z = 0) => ({
  x: 340 + x - 0.484 * y,
  y: 330 + 0.143 * x + y - z,
});
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
/** Plane transforms: draw in local 2D coordinates on the floor or walls. */
const FLOOR = "matrix(1 0.143 -0.484 1 340 330)";
const BACK_WALL = "matrix(1 0.143 0 1 340 330)"; // local (x, -z)
const LEFT_WALL = "matrix(-0.484 1 0 1 340 330)"; // local (y, -z)

export type AgentKey = "iris" | "nora" | "theo" | "owen";
export const DESKS: Record<
  AgentKey,
  { desk: [number, number]; feet: [number, number] }
> = {
  iris: { desk: [40, 5], feet: [125, 60] },
  nora: { desk: [290, 5], feet: [375, 60] },
  theo: { desk: [90, 215], feet: [175, 270] },
  owen: { desk: [330, 215], feet: [415, 270] },
};
export const feetScreen = (k: AgentKey) =>
  proj(DESKS[k].feet[0], DESKS[k].feet[1]);

export type PedestalKey = "gmail" | "drive" | "sheets" | "slack";
export const PEDESTALS: Record<
  PedestalKey,
  { at: [number, number]; logo: string; name: string }
> = {
  gmail: { at: [540, 70], logo: "logos/gmail.svg", name: "Gmail" },
  drive: {
    at: [635, 70],
    logo: "logos/google-drive.svg",
    name: "Google Drive",
  },
  sheets: {
    at: [575, 250],
    logo: "logos/google-sheets.svg",
    name: "Google Sheets",
  },
  slack: { at: [665, 250], logo: "logos/slack.svg", name: "Slack" },
};
/** Centre of a pedestal's logo card, in screenshot pixels. */
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
      <rect
        key={i}
        x={x0 + 4 + f * (x1 - x0 - 8)}
        y={-44 - (10 + ((i * 7) % 4) * 6)}
        width={(x1 - x0) * 0.09}
        height={10 + ((i * 7) % 4) * 6}
        fill="#B9D2DC"
      />
    ))}
    <line
      x1={x0 + 10}
      y1={-90}
      x2={x0 + (x1 - x0) * 0.45}
      y2={-70}
      stroke="#FFFFFF"
      strokeOpacity={0.8}
      strokeWidth={1.6}
    />
    <line
      x1={x0 + (x1 - x0) * 0.35}
      y1={-96}
      x2={x0 + (x1 - x0) * 0.6}
      y2={-84}
      stroke="#FFFFFF"
      strokeOpacity={0.6}
      strokeWidth={1.2}
    />
    <line
      x1={x0 + (x1 - x0) / 2}
      y1={-98}
      x2={x0 + (x1 - x0) / 2}
      y2={-44}
      stroke="#E3DED2"
      strokeWidth={3}
    />
  </g>
);

const Plant: React.FC<{
  x: number;
  y: number;
  scale?: number;
  sway: number;
}> = ({ x, y, scale = 1, sway }) => {
  const p = proj(x, y);
  return (
    <g transform={`translate(${p.x} ${p.y}) scale(${scale})`}>
      <ellipse cx={0} cy={2} rx={16} ry={5} fill="rgba(0,0,0,0.12)" />
      <path
        d="M-11 -20 L11 -20 L8 0 L-8 0 Z"
        fill="#F4F1EA"
        stroke="#D9D3C6"
        strokeWidth={1}
      />
      <g transform={`rotate(${sway} 0 -20)`}>
        {[
          [-14, -44, -30, "#5E8C4C"],
          [12, -46, 28, "#5E8C4C"],
          [-4, -58, -6, "#77A85E"],
          [6, -52, 14, "#6A9A55"],
          [-10, -36, -50, "#77A85E"],
          [12, -34, 48, "#6A9A55"],
        ].map(([cx, cy, r, c], i) => (
          <ellipse
            key={i}
            cx={cx as number}
            cy={cy as number}
            rx={6}
            ry={18}
            fill={c as string}
            transform={`rotate(${r} ${cx} ${cy})`}
          />
        ))}
      </g>
    </g>
  );
};

const Desk: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const legs: [number, number][] = [
    [x + 4, y + 4],
    [x + 91, y + 4],
    [x + 4, y + 38],
    [x + 91, y + 38],
  ];
  const chair = proj(x + 48, y + 72, 0);
  return (
    <g>
      <polygon
        points={pts(
          [x, y + 42, 0],
          [x + 95, y + 42, 0],
          [x + 95, y + 50, 0],
          [x, y + 50, 0],
        )}
        fill="rgba(0,0,0,0.08)"
      />
      {legs.map(([lx, ly], i) => {
        const a = proj(lx, ly, 0);
        const b = proj(lx, ly, 28);
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="#3A3D42"
            strokeWidth={3}
          />
        );
      })}
      <polygon
        points={pts(
          [x, y, 30],
          [x + 95, y, 30],
          [x + 95, y + 42, 30],
          [x, y + 42, 30],
        )}
        fill="#D9B88E"
      />
      <polygon
        points={pts(
          [x, y + 42, 30],
          [x + 95, y + 42, 30],
          [x + 95, y + 42, 26],
          [x, y + 42, 26],
        )}
        fill="#B8946A"
      />
      <polygon
        points={pts(
          [x + 95, y, 30],
          [x + 95, y + 42, 30],
          [x + 95, y + 42, 26],
          [x + 95, y, 26],
        )}
        fill="#A88560"
      />
      {/* Monitor */}
      <polygon
        points={pts(
          [x + 44, y + 12, 30],
          [x + 50, y + 12, 30],
          [x + 50, y + 12, 38],
          [x + 44, y + 12, 38],
        )}
        fill="#2B2F36"
      />
      <polygon
        points={pts(
          [x + 24, y + 10, 36],
          [x + 72, y + 10, 36],
          [x + 72, y + 10, 66],
          [x + 24, y + 10, 66],
        )}
        fill="#262B33"
      />
      <polygon
        points={pts(
          [x + 27, y + 10, 39],
          [x + 69, y + 10, 39],
          [x + 69, y + 10, 63],
          [x + 27, y + 10, 63],
        )}
        fill="#3F5F78"
      />
      <polygon
        points={pts(
          [x + 30, y + 10, 57],
          [x + 56, y + 10, 57],
          [x + 56, y + 10, 59],
          [x + 30, y + 10, 59],
        )}
        fill="#9CC3DA"
      />
      <polygon
        points={pts(
          [x + 30, y + 10, 52],
          [x + 62, y + 10, 52],
          [x + 62, y + 10, 53.5],
          [x + 30, y + 10, 53.5],
        )}
        fill="#7FA9C2"
      />
      {/* Keyboard and mug */}
      <polygon
        points={pts(
          [x + 28, y + 24, 30.5],
          [x + 66, y + 24, 30.5],
          [x + 66, y + 32, 30.5],
          [x + 28, y + 32, 30.5],
        )}
        fill="#F2F0EC"
      />
      <polygon
        points={pts(
          [x + 8, y + 18, 30.5],
          [x + 18, y + 18, 30.5],
          [x + 18, y + 26, 30.5],
          [x + 8, y + 26, 30.5],
        )}
        fill="#6E5B4C"
      />
      {/* Chair */}
      <g transform={`translate(${chair.x} ${chair.y})`}>
        <line x1={0} y1={0} x2={0} y2={-16} stroke="#4A4F55" strokeWidth={3} />
        <ellipse cx={0} cy={1} rx={12} ry={3.5} fill="#4A4F55" />
        <ellipse cx={0} cy={-18} rx={15} ry={6} fill="#6E8A91" />
        <rect x={-11} y={-44} width={22} height={24} rx={5} fill="#7C979D" />
      </g>
    </g>
  );
};

export type Look = {
  skin: string;
  hair: string;
  top: string;
  bottom: string;
  glasses?: boolean;
  longHair?: boolean;
};
export const LOOKS: Record<AgentKey, Look> = {
  iris: {
    skin: "#E8B996",
    hair: "#3B2A22",
    top: "#2E3138",
    bottom: "#23252A",
    glasses: true,
  },
  nora: {
    skin: "#C98E6A",
    hair: "#2B1D17",
    top: "#5B48C7",
    bottom: "#2E2A3A",
    longHair: true,
  },
  theo: { skin: "#F0C7A6", hair: "#8A6A4A", top: "#2C4A6E", bottom: "#2A2E36" },
  owen: { skin: "#8D5A3F", hair: "#1E1715", top: "#2F6F73", bottom: "#2A2F33" },
};

/** Original, simple standing character. Feet at (0, 0). */
export const Person: React.FC<{ look: Look; pop: number }> = ({
  look,
  pop,
}) => {
  if (pop <= 0) return null;
  return (
    <g transform={`scale(${pop})`} opacity={Math.min(1, pop * 1.5)}>
      <ellipse cx={0} cy={0} rx={15} ry={4.5} fill="rgba(0,0,0,0.16)" />
      <rect
        x={-8}
        y={-26}
        width={6.5}
        height={26}
        rx={2.5}
        fill={look.bottom}
      />
      <rect
        x={1.5}
        y={-26}
        width={6.5}
        height={26}
        rx={2.5}
        fill={look.bottom}
      />
      <rect x={-9} y={-2} width={8} height={4} rx={2} fill="#1C1C1C" />
      <rect x={1} y={-2} width={8} height={4} rx={2} fill="#1C1C1C" />
      <path
        d="M-13 -24 Q-14 -50 -6 -53 L6 -53 Q14 -50 13 -24 Z"
        fill={look.top}
      />
      <path d="M-3 -53 L0 -46 L3 -53 Z" fill="#F4F4F4" />
      <rect x={-17} y={-50} width={6} height={22} rx={3} fill={look.top} />
      <rect x={11} y={-50} width={6} height={22} rx={3} fill={look.top} />
      <circle cx={-14} cy={-27} r={3.2} fill={look.skin} />
      <circle cx={14} cy={-27} r={3.2} fill={look.skin} />
      <rect x={-3} y={-58} width={6} height={6} fill={look.skin} />
      {look.longHair ? (
        <path
          d="M-12 -66 Q-13 -48 -9 -44 L9 -44 Q13 -48 12 -66 Z"
          fill={look.hair}
        />
      ) : null}
      <circle cx={0} cy={-67} r={10.5} fill={look.skin} />
      <path
        d="M-11 -68 Q-11 -80 0 -80 Q11 -80 11 -68 Q6 -74 -4 -72 Q-9 -71 -11 -68 Z"
        fill={look.hair}
      />
      {look.glasses ? (
        <g stroke="#1E1E1E" strokeWidth={1.3} fill="none">
          <circle cx={-4} cy={-66} r={3} />
          <circle cx={4} cy={-66} r={3} />
          <line x1={-1} y1={-66} x2={1} y2={-66} />
        </g>
      ) : (
        <g fill="#2A2A2A">
          <circle cx={-3.5} cy={-66} r={1.2} />
          <circle cx={3.5} cy={-66} r={1.2} />
        </g>
      )}
      <rect
        x={-2}
        y={-46}
        width={4}
        height={5}
        rx={1}
        fill="#FFFFFF"
        opacity={0.9}
      />
    </g>
  );
};

export const PLATE = { w: 210, name: 20, line: 20 };

/** Name plate: name, role, status. 20px native so it reads at 28px when zoomed 1.8x. */
export const NamePlate: React.FC<{
  k: AgentKey;
  name: string;
  role: string;
  status: string;
  statusPulse: number;
  opacity: number;
}> = ({ k, name, role, status, statusPulse, opacity }) => {
  const f = feetScreen(k);
  return (
    <div
      data-guard="uitext"
      data-guard-label={`Plate ${name}`}
      style={{
        position: "absolute",
        left: f.x - PLATE.w / 2,
        top: f.y + 12,
        width: PLATE.w,
        boxSizing: "border-box",
        padding: "7px 10px 8px",
        borderRadius: 8,
        background: "#FFFFFF",
        boxShadow: "0 4px 14px rgba(60,45,30,0.16)",
        border: "1px solid rgba(0,0,0,0.06)",
        textAlign: "center",
        fontFamily: FONT.sans,
        lineHeight: "25px",
        opacity,
        transform: `translateY(${(1 - opacity) * 8}px)`,
      }}
    >
      <div style={{ fontSize: PLATE.name, fontWeight: 700, color: "#0D1224" }}>
        {name}
      </div>
      <div style={{ fontSize: PLATE.line, color: "rgba(13,18,36,0.66)" }}>
        {role}
      </div>
      <div
        style={{
          fontSize: PLATE.line,
          color: "#2B57C9",
          fontWeight: 500,
          background: `rgba(91,63,214,${0.1 * statusPulse})`,
          borderRadius: 6,
        }}
      >
        {status}
      </div>
    </div>
  );
};

const Pedestal: React.FC<{ k: PedestalKey; pulse: number; t: number }> = ({
  k,
  pulse,
  t,
}) => {
  const { at, logo, name } = PEDESTALS[k];
  const [x, y] = at;
  const card = pedestalCard(k);
  const label = proj(x + 18, y + 40, 0);
  const dot = 0.75 + 0.25 * Math.sin(t * 2.2 + x);
  return (
    <>
      <svg
        width={1633}
        height={836}
        style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
      >
        <polygon
          points={pts(
            [x, y + 28, 0],
            [x + 36, y + 28, 0],
            [x + 36, y + 34, 0],
            [x, y + 34, 0],
          )}
          fill="rgba(0,0,0,0.1)"
        />
        <polygon
          points={pts(
            [x, y + 28, 0],
            [x + 36, y + 28, 0],
            [x + 36, y + 28, 46],
            [x, y + 28, 46],
          )}
          fill="#56767B"
        />
        <polygon
          points={pts(
            [x + 36, y, 0],
            [x + 36, y + 28, 0],
            [x + 36, y + 28, 46],
            [x + 36, y, 46],
          )}
          fill="#45636A"
        />
        <polygon
          points={pts(
            [x, y + 28, 38],
            [x + 36, y + 28, 38],
            [x + 36, y + 28, 41],
            [x, y + 28, 41],
          )}
          fill="#7FA3A6"
        />
        <polygon
          points={pts(
            [x, y, 46],
            [x + 36, y, 46],
            [x + 36, y + 28, 46],
            [x, y + 28, 46],
          )}
          fill="#C9DCDC"
        />
      </svg>
      {pulse > 0 ? (
        <div
          style={{
            position: "absolute",
            left: card.x - 46,
            top: card.y - 46,
            width: 92,
            height: 92,
            borderRadius: 24,
            border: `3px solid rgba(124,100,255,${0.75 * (1 - pulse)})`,
            transform: `scale(${0.7 + 0.6 * pulse})`,
          }}
        />
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
        }}
      >
        <Img
          data-guard="brand"
          src={staticFile(logo)}
          style={{ width: 30, height: 30, objectFit: "contain" }}
        />
        <div
          style={{
            position: "absolute",
            right: -5,
            bottom: -5,
            width: 11,
            height: 11,
            borderRadius: 6,
            background: "#3DBE5A",
            border: "2px solid #FFFFFF",
            opacity: dot,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: label.x - 52,
          top: label.y + 6,
          width: 104,
          padding: "3px 0 4px",
          borderRadius: 5,
          background: "#FFFFFF",
          boxShadow: "0 3px 8px rgba(60,45,30,0.14)",
          textAlign: "center",
          fontFamily: FONT.sans,
          lineHeight: 1.15,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: "#1d1d1d" }}>
          {name}
        </div>
        <div style={{ fontSize: 9, color: "#4E8F93" }}>Integration</div>
      </div>
    </>
  );
};

export type OfficeState = {
  pop: Record<AgentKey, number>;
  plates: Record<
    AgentKey,
    { role: string; status: string; pulse: number; opacity: number }
  >;
  names: Record<AgentKey, string>;
  /** 0 to 1 along the dashed path Iris, Nora, Theo, Owen. */
  path: number;
  /** Link progress and pulse for each agent to its pedestal. */
  links: { from: AgentKey; to: PedestalKey; draw: number; pulse: number }[];
  /** Claim card flying to the front desk, 0 to 1 (hidden at 0 or after 1). */
  claim: number;
};

const PATH_ORDER: AgentKey[] = ["iris", "nora", "theo", "owen"];

export const Office: React.FC<{ s: OfficeState }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const sway = (i: number) => Math.sin(t * 0.9 + i) * 1.6;

  // Dashed path through the agents' feet, and the travelling dot.
  const nodes = PATH_ORDER.map((k) => feetScreen(k));
  const segs = nodes
    .slice(1)
    .map((n, i) => Math.hypot(n.x - nodes[i].x, n.y - nodes[i].y));
  const total = segs.reduce((a, b) => a + b, 0);
  const d = `M ${nodes.map((n) => `${n.x} ${n.y}`).join(" L ")}`;
  let dist = s.path * total;
  let dot = nodes[0];
  for (let i = 0; i < segs.length; i++) {
    if (dist <= segs[i]) {
      const f = dist / segs[i];
      dot = {
        x: nodes[i].x + (nodes[i + 1].x - nodes[i].x) * f,
        y: nodes[i].y + (nodes[i + 1].y - nodes[i].y) * f,
      };
      break;
    }
    dist -= segs[i];
    dot = nodes[i + 1];
  }

  const iris = feetScreen("iris");
  const claimFrom = { x: iris.x + 160, y: iris.y - 210 };
  const cp = Math.max(0, Math.min(1, s.claim));

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1633,
        height: 836,
      }}
    >
      <svg
        width={1633}
        height={836}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        <defs>
          <pattern
            id="planks"
            patternUnits="userSpaceOnUse"
            width={70}
            height={18}
            patternTransform={FLOOR}
          >
            <rect width={70} height={18} fill="#CFAE84" />
            <line
              x1={0}
              y1={0}
              x2={70}
              y2={0}
              stroke="#B48F64"
              strokeWidth={1}
            />
            <line
              x1={34}
              y1={0}
              x2={34}
              y2={18}
              stroke="#B48F64"
              strokeWidth={0.8}
            />
          </pattern>
        </defs>
        {/* Floor slab */}
        <polygon
          points={pts([0, D, 0], [W, D, 0], [W, D, -12], [0, D, -12])}
          fill="#A9875F"
        />
        <polygon
          points={pts([W, 0, 0], [W, D, 0], [W, D, -12], [W, 0, -12])}
          fill="#977650"
        />
        <polygon
          points={pts([0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0])}
          fill="url(#planks)"
        />
        {/* Rug and floor labels */}
        <polygon
          points={pts([55, 120, 0], [470, 120, 0], [470, 305, 0], [55, 305, 0])}
          fill="rgba(150,140,130,0.22)"
        />
        <g transform={FLOOR}>
          <text
            x={150}
            y={110}
            fontFamily={FONT.sans}
            fontSize={13}
            letterSpacing={4}
            fill="rgba(90,70,50,0.5)"
          >
            TEAM STUDIO
          </text>
          <text
            x={505}
            y={60}
            fontFamily={FONT.sans}
            fontSize={13}
            letterSpacing={4}
            fill="rgba(90,70,50,0.5)"
          >
            RESOURCES
          </text>
        </g>
        {/* Walls */}
        <polygon
          points={pts([0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H])}
          fill="#ECE4D3"
        />
        <polygon
          points={pts([0, 0, 0], [W, 0, 0], [W, 0, H], [0, 0, H])}
          fill="#F3EDE0"
        />
        <polygon
          points={pts([0, 0, 0], [W, 0, 0], [W, 0, 5], [0, 0, 5])}
          fill="#E2D8C4"
        />
        <polygon
          points={pts([0, 0, 0], [0, D, 0], [0, D, 5], [0, 0, 5])}
          fill="#DBD0BA"
        />
        <polygon
          points={pts(
            [-8, -8, H],
            [W, -8, H],
            [W, 0, H],
            [0, 0, H],
            [0, D, H],
            [-8, D, H],
          )}
          fill="#FBF8F1"
        />
        <polygon
          points={pts([0, D, 0], [-8, D, 0], [-8, D, H], [0, D, H])}
          fill="#E0D6C2"
        />
        {/* Windows */}
        <Window x0={30} x1={150} />
        <Window x0={205} x1={320} />
        <Window x0={420} x1={535} />
        <Window x0={575} x1={690} />
        {/* Clock */}
        <g transform={BACK_WALL}>
          <circle
            cx={372}
            cy={-80}
            r={13}
            fill="#FFFFFF"
            stroke="#3A3A3A"
            strokeWidth={2}
          />
          <line
            x1={372}
            y1={-80}
            x2={372}
            y2={-89}
            stroke="#3A3A3A"
            strokeWidth={1.6}
          />
          <line
            x1={372}
            y1={-80}
            x2={379}
            y2={-78}
            stroke="#3A3A3A"
            strokeWidth={1.6}
          />
        </g>
        {/* Corkboard on the left wall */}
        <g transform={LEFT_WALL}>
          <rect x={150} y={-86} width={70} height={52} fill="#8C6A45" />
          <rect x={154} y={-82} width={62} height={44} fill="#BE966A" />
        </g>
        {/* Sofa behind the front desk */}
        <polygon
          points={pts([150, 2, 0], [250, 2, 0], [250, 2, 44], [150, 2, 44])}
          fill="#7E948A"
        />
        <polygon
          points={pts([150, 2, 22], [250, 2, 22], [250, 30, 22], [150, 30, 22])}
          fill="#93A89E"
        />
        <polygon
          points={pts([150, 30, 0], [250, 30, 0], [250, 30, 22], [150, 30, 22])}
          fill="#6E8279"
        />
        {/* Desks */}
        {(Object.keys(DESKS) as AgentKey[]).map((k) => (
          <Desk key={k} x={DESKS[k].desk[0]} y={DESKS[k].desk[1]} />
        ))}
        {/* Path, agents to pedestals */}
        {s.links.map((l, i) => {
          const a = feetScreen(l.from);
          const b = pedestalCard(l.to);
          const len = Math.hypot(b.x - a.x, b.y + 30 - a.y);
          return l.draw > 0 ? (
            <line
              key={i}
              x1={a.x}
              y1={a.y - 30}
              x2={a.x + (b.x - a.x) * l.draw}
              y2={a.y - 30 + (b.y + 30 - a.y) * l.draw}
              stroke="rgba(91,63,214,0.75)"
              strokeWidth={2}
              strokeDasharray="5 6"
              strokeDashoffset={-t * 18}
              data-len={len}
            />
          ) : null;
        })}
        {s.path > 0 ? (
          <>
            <path
              d={d}
              fill="none"
              stroke="rgba(91,63,214,0.85)"
              strokeWidth={2.2}
              strokeDasharray="6 7"
              pathLength={total}
              strokeDashoffset={-t * 14}
              style={{ clipPath: undefined }}
              mask="url(#pathmask)"
            />
            <defs>
              <mask id="pathmask" maskUnits="userSpaceOnUse">
                <path
                  d={d}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={8}
                  pathLength={1}
                  strokeDasharray={`${s.path} 1`}
                />
              </mask>
            </defs>
            <circle cx={dot.x} cy={dot.y} r={9} fill="rgba(124,100,255,0.25)" />
            <circle
              cx={dot.x}
              cy={dot.y}
              r={4.5}
              fill="#5B3FD6"
              stroke="#FFFFFF"
              strokeWidth={1.5}
            />
          </>
        ) : null}
        {/* Plants */}
        <Plant x={10} y={20} sway={sway(1)} />
        <Plant x={690} y={18} sway={sway(2)} />
        <Plant x={12} y={292} sway={sway(3)} scale={1.05} />
        <Plant x={690} y={300} sway={sway(4)} />
        {/* People */}
        {(Object.keys(DESKS) as AgentKey[]).map((k) => {
          const f = feetScreen(k);
          return (
            <g key={k} transform={`translate(${f.x} ${f.y})`}>
              <Person look={LOOKS[k]} pop={s.pop[k]} />
            </g>
          );
        })}
      </svg>
      {/* Pedestals */}
      {(Object.keys(PEDESTALS) as PedestalKey[]).map((k) => {
        const link = s.links.find((l) => l.to === k);
        return <Pedestal key={k} k={k} pulse={link ? link.pulse : 0} t={t} />;
      })}
      {/* Claim arriving at the front desk */}
      {cp > 0 && cp < 1 ? (
        <div
          style={{
            position: "absolute",
            left: claimFrom.x + (iris.x - claimFrom.x) * cp - 58,
            top: claimFrom.y + (iris.y - 90 - claimFrom.y) * cp - 18,
            width: 116,
            padding: "5px 8px",
            borderRadius: 6,
            background: "#FFFFFF",
            boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
            fontFamily: FONT.sans,
            fontSize: 12,
            fontWeight: 700,
            color: "#0D1224",
            textAlign: "center",
            opacity: Math.min(1, cp * 4) * (1 - Math.max(0, (cp - 0.8) / 0.2)),
            transform: `scale(${1 - 0.4 * cp})`,
          }}
        >
          Claim CL-7305
        </div>
      ) : null}
      {/* Name plates */}
      {(Object.keys(DESKS) as AgentKey[]).map((k) =>
        s.plates[k].opacity > 0 ? (
          <NamePlate
            key={k}
            k={k}
            name={s.names[k]}
            role={s.plates[k].role}
            status={s.plates[k].status}
            statusPulse={s.plates[k].pulse}
            opacity={s.plates[k].opacity}
          />
        ) : null,
      )}
    </div>
  );
};
