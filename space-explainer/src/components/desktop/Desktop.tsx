import React from "react";
import { Img, staticFile } from "remotion";
import { ArrowUp, Check, FileText, Hash, Paperclip, Search } from "lucide-react";
import { FONT, PRODUCT_THEME_LIGHT as T } from "../../theme";
import { PLACEHOLDERS as P } from "../../placeholders";
import { PdfIcon } from "../PdfIcon";
import { Typewriter } from "../Typewriter";

/**
 * Scene 1 desktop: plain app windows on the backdrop (light theme), as an
 * employee would see them. Everything here is drawn originally; the only
 * third party artwork is the official Gmail, Google Drive, Google Sheets and
 * Slack logos in the window headers. No people anywhere.
 */
export const WIN = { w: 640, h: 420, header: 58, radius: 20 };
export type WinKey = "gmail" | "drive" | "sheets" | "slack" | "summary";
/** Window positions on the desktop (desktop px; the camera transforms the desktop). */
export const WINDOWS: Record<WinKey, { x: number; y: number }> = {
  summary: { x: 1180, y: 300 },
  gmail: { x: 300, y: 330 },
  drive: { x: 520, y: 380 },
  sheets: { x: 740, y: 430 },
  slack: { x: 960, y: 480 },
};
export const TRAY = { x: 300, y: 790, w: 420, h: 104 };
const LOGO: Partial<Record<WinKey, string>> = { gmail: "logos/gmail.svg", drive: "logos/google-drive.svg", sheets: "logos/google-sheets.svg", slack: "logos/slack.svg" };
const TITLE: Record<WinKey, string> = { gmail: "Inbox", drive: "Drive", sheets: P.scene1.sheets.title, slack: P.scene1.slack.channel, summary: P.scene1.summary.title };

const txt = (size: number, extra?: React.CSSProperties): React.CSSProperties => ({ fontFamily: FONT.sans, fontSize: size, color: T.ink, whiteSpace: "nowrap", ...extra });

/** An original document icon for the Review summary (no third party branding). */
const DocIcon: React.FC = () => (
  <svg width={26} height={30} viewBox="0 0 26 30">
    <path d="M3 1h13l8 8v18a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2z" fill="#EEEAFE" stroke="#7C62F0" strokeWidth={1.6} />
    <path d="M6 14h13M6 18h13M6 22h9" stroke="#7C62F0" strokeWidth={1.6} strokeLinecap="round" />
  </svg>
);

/**
 * A window: blur in and scale 0.96 to 1 on `appear`; `gather` 0 to 1 slides and
 * shrinks it into a point (the orb), given in desktop px.
 */
/** Logo centre in a window header (desktop px), where a logo detaches from. */
export const logoPoint = (k: WinKey) => ({ x: WINDOWS[k].x + 20 + 53 + 15, y: WINDOWS[k].y + WIN.header / 2 });
export const Win: React.FC<{ k: WinKey; appear: number; gather?: number; to?: { x: number; y: number }; badge?: number; background?: boolean; rot?: number; logoGone?: boolean; children: React.ReactNode }> = ({ k, appear, gather = 0, to, badge, background, rot = 0, logoGone = false, children }) => {
  const p = WINDOWS[k];
  const g = gather;
  const cx = p.x + WIN.w / 2;
  const cy = p.y + WIN.h / 2;
  const dx = to ? (to.x - cx) * g : 0;
  const dy = to ? (to.y - cy) * g : 0;
  const s = (0.96 + 0.04 * appear) * (1 - 0.88 * g);
  const blur = 10 * (1 - appear) + 6 * g;
  if (appear <= 0 || g >= 1) return null;
  return (
    <div
      data-window={k}
      data-guard-bg={background ? "1" : undefined}
      style={{
        position: "absolute",
        left: p.x,
        top: p.y,
        width: WIN.w,
        height: WIN.h,
        borderRadius: WIN.radius,
        background: "#FFFFFF",
        border: `1px solid ${T.border}`,
        // Shadows fade as the window shrinks.
        boxShadow: `0 30px 80px rgba(20,24,60,${0.16 * (1 - g)}), 0 8px 20px rgba(20,24,60,${0.08 * (1 - g)})`,
        overflow: "hidden",
        opacity: Math.min(1, appear * 1.4) * (1 - Math.max(0, (g - 0.75) / 0.25)),
        filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
        transform: `translate(${dx}px, ${dy}px) rotate(${rot * g}deg) scale(${s})`,
        transformOrigin: "50% 50%",
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: WIN.header, borderBottom: `1px solid ${T.border}`, background: "#FBFBFD", display: "flex", alignItems: "center", gap: 12, padding: "0 20px" }}>
        <div style={{ display: "flex", gap: 7, marginRight: 6 }}>
          {["#E7E9F2", "#E7E9F2", "#E7E9F2"].map((c, i) => (
            <div key={i} style={{ width: 11, height: 11, borderRadius: 6, background: c }} />
          ))}
        </div>
        {LOGO[k] ? (
          <span data-guard={logoGone ? undefined : "logo"} data-guard-backing="white" data-guard-label={`Logo ${k}`} style={{ position: "relative", display: "inline-flex", width: 30, height: 30, alignItems: "center", justifyContent: "center", opacity: logoGone ? 0 : 1 }}>
            <Img data-guard="brand" src={staticFile(LOGO[k]!)} style={{ width: 30, height: 30, objectFit: "contain" }} />
            {badge !== undefined && badge > 0 ? (
              <span style={{ position: "absolute", right: -16, top: -10, minWidth: 28, height: 26, borderRadius: 13, background: "#E5484D", color: "#FFFFFF", fontFamily: FONT.sans, fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px", boxSizing: "border-box" }}>{badge}</span>
            ) : null}
          </span>
        ) : (
          <DocIcon />
        )}
        <span data-guard="text" data-guard-min="18" data-guard-label={`Window title ${k}`} style={txt(19, { fontWeight: 700, marginLeft: badge ? 18 : 0 })}>
          {TITLE[k]}
        </span>
      </div>
      <div style={{ position: "absolute", left: 0, top: WIN.header, right: 0, bottom: 0 }}>{children}</div>
    </div>
  );
};

/** Original placeholder thumbnail: a kitchen corner with water on the floor. No people. */
export const KitchenThumb: React.FC<{ v: 0 | 1 | 2; w?: number; h?: number }> = ({ v, w = 120, h = 84 }) => (
  <svg width={w} height={h} viewBox="0 0 120 84" style={{ borderRadius: 8, display: "block" }}>
    <rect width={120} height={84} fill="#EEF1F5" />
    <rect x={0} y={0} width={120} height={46} fill={["#E6E2D8", "#E3E7EC", "#E9E4DA"][v]} />
    <rect x={v === 1 ? 50 : 6} y={10} width={58} height={22} rx={2} fill="#C9B79A" />
    <rect x={v === 1 ? 52 : 8} y={12} width={26} height={18} rx={1.5} fill="#D9C9AE" />
    <rect x={v === 1 ? 80 : 36} y={12} width={26} height={18} rx={1.5} fill="#D9C9AE" />
    <rect x={0} y={40} width={120} height={6} fill="#B9AFA0" />
    <rect x={v === 2 ? 60 : 10} y={46} width={50} height={20} rx={2} fill="#C4B190" />
    <rect x={0} y={66} width={120} height={18} fill="#D8D4CC" />
    <ellipse cx={[44, 70, 58][v]} cy={74} rx={[34, 26, 40][v]} ry={[7, 6, 8][v]} fill="#9DB4C8" opacity={0.85} />
    <ellipse cx={[50, 64, 52][v]} cy={73} rx={[14, 10, 18][v]} ry={3} fill="#C9DAE8" opacity={0.9} />
    <path d={["M30 46 q4 10 2 20", "M88 46 q-3 9 0 20", "M74 46 q5 8 1 20"][v]} stroke="#8FA6BA" strokeWidth={2} fill="none" opacity={0.7} />
    <rect x={[90, 14, 20][v]} y={[18, 20, 16][v]} width={18} height={14} rx={3} fill="#A89E8C" opacity={0.25} />
  </svg>
);

const Attachment: React.FC<{ i: number; lift?: number }> = ({ i, lift = 0 }) => (
  <div style={{ width: 132, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 1 - 0.55 * lift }}>
    {i < 3 ? (
      <KitchenThumb v={i as 0 | 1 | 2} />
    ) : (
      <div style={{ width: 120, height: 84, borderRadius: 8, background: "#F4F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <PdfIcon size={44} />
      </div>
    )}
    <span style={txt(18, { color: T.secondary })}>{P.scene1.gmail.attachments[i]}</span>
  </div>
);

/** Gmail: the claim email with four attachments. `lift` dims them while they are dragged away. */
export const GmailBody: React.FC<{ lift: number }> = ({ lift }) => {
  const g = P.scene1.gmail;
  return (
    <div data-guard="text" data-guard-min="18" data-guard-label="Gmail email" data-fit-box="gmail email" style={{ position: "absolute", inset: 0, padding: "20px 26px" }}>
      <div data-fit-text style={txt(22, { fontWeight: 700 })}>{g.subject}</div>
      <div data-fit-text style={txt(18, { color: T.secondary, marginTop: 8 })}>{g.sender}</div>
      <div data-fit-text style={txt(18, { marginTop: 14, whiteSpace: "normal", width: 560, lineHeight: 1.4 })}>{g.body}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, ...txt(18, { color: T.secondary }) }}>
        <Paperclip size={18} color={T.secondary} />4 attachments
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        {[0, 1, 2, 3].map((i) => (
          <Attachment key={i} i={i} lift={lift} />
        ))}
      </div>
    </div>
  );
};
/** Attachment centre in desktop px (for the cursor and the drag). */
export const attachmentCentre = (i: number) => ({ x: WINDOWS.gmail.x + 26 + i * 142 + 66, y: WINDOWS.gmail.y + WIN.header + 248 });

/** The four attachments travelling together under the cursor. */
export const DragStack: React.FC<{ x: number; y: number; opacity: number }> = ({ x, y, opacity }) => (
  <div style={{ position: "absolute", left: x - 40, top: y - 28, width: 120, height: 84, opacity }}>
    {[3, 2, 1, 0].map((i, j) => (
      <div key={i} style={{ position: "absolute", left: j * 5, top: j * 4, transform: `scale(0.6)`, transformOrigin: "0 0", boxShadow: "0 8px 20px rgba(20,24,60,0.18)", borderRadius: 8 }}>
        {i < 3 ? <KitchenThumb v={i as 0 | 1 | 2} /> : <div style={{ width: 120, height: 84, borderRadius: 8, background: "#F4F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}><PdfIcon size={44} /></div>}
      </div>
    ))}
  </div>
);

/** Downloads tray: fills as the attachments land. */
export const Tray: React.FC<{ appear: number; count: number; gather?: number; to?: { x: number; y: number }; background?: boolean }> = ({ appear, count, gather = 0, to, background }) => {
  if (appear <= 0 || gather >= 1) return null;
  const dx = to ? (to.x - (TRAY.x + TRAY.w / 2)) * gather : 0;
  const dy = to ? (to.y - (TRAY.y + TRAY.h / 2)) * gather : 0;
  return (
    <div
      data-guard={background ? undefined : "text"}
      data-guard-min="18"
      data-guard-label="Downloads tray"
      style={{ position: "absolute", left: TRAY.x, top: TRAY.y, width: TRAY.w, height: TRAY.h, boxSizing: "border-box", borderRadius: 16, background: "rgba(255,255,255,0.92)", border: `1.5px dashed ${count > 0 ? "#B9AEF5" : T.border}`, display: "flex", alignItems: "center", gap: 16, padding: "0 20px", opacity: appear * (1 - gather), transform: `translate(${dx}px, ${dy}px) scale(${1 - 0.9 * gather})` }}
    >
      <div style={{ display: "flex" }}>
        {[0, 1, 2, 3].map((i) =>
          i < count ? (
            <div key={i} style={{ marginLeft: i ? -18 : 0, transform: "scale(0.5)", transformOrigin: "0 50%", width: 64 }}>
              {i < 3 ? <KitchenThumb v={i as 0 | 1 | 2} /> : <div style={{ width: 120, height: 84, borderRadius: 8, background: "#F4F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}><PdfIcon size={44} /></div>}
            </div>
          ) : null,
        )}
      </div>
      <div>
        <div style={txt(19, { fontWeight: 700 })}>{P.scene1.downloads}</div>
        <div style={txt(18, { color: T.secondary })}>{count} {count === 1 ? "file" : "files"}</div>
      </div>
    </div>
  );
};

/** Drive: search, three near identical results, then the 2026 PDF scrolled to page 12 with Section 4.2 highlighted. */
export const DRIVE_ROW0 = 82;
export const DRIVE_ROW_H = 66;
export const driveRowCentre = (i: number) => ({ x: WINDOWS.drive.x + 240, y: WINDOWS.drive.y + WIN.header + DRIVE_ROW0 + i * DRIVE_ROW_H + 26 });
export const DRIVE_SEARCH = { x: WINDOWS.drive.x + 200, y: WINDOWS.drive.y + WIN.header + 34 };
export const DriveBody: React.FC<{ typeStart: number | null; results: number; pressed: number; pdf: number; scroll: number; highlight: number }> = ({ typeStart, results, pressed, pdf, scroll, highlight }) => {
  const d = P.scene1.drive;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 22, top: 14, width: 596, height: 44, boxSizing: "border-box", borderRadius: 22, background: "#F1F3F8", display: "flex", alignItems: "center", gap: 12, padding: "0 18px" }}>
        <Search size={18} color={T.secondary} />
        {typeStart !== null ? (
          <Typewriter lines={[d.query]} cps={30} startFrame={typeStart} seed="s1-drive" caretColor={T.ink} style={txt(19)} />
        ) : (
          <span style={txt(18, { color: T.secondary })}>Search in Drive</span>
        )}
      </div>
      <div data-guard="text" data-guard-min="18" data-guard-label="Drive results" data-fit-box="drive results" style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, opacity: (1 - pdf) * results }}>
        {d.files.map((f, i) => (
          <div key={f.name} style={{ position: "absolute", left: 16, right: 16, top: DRIVE_ROW0 + i * DRIVE_ROW_H, height: 54, borderRadius: 10, background: i === 1 && pressed > 0 ? `rgba(124,98,240,${0.12 * pressed})` : "transparent", display: "flex", alignItems: "center", gap: 14, padding: "0 12px", opacity: Math.min(1, Math.max(0, results * 3 - i)) }}>
            <PdfIcon size={30} />
            <div>
              <div data-fit-text style={txt(19, { fontWeight: 600 })}>{f.name}</div>
              <div style={txt(18, { color: T.secondary })}>{f.meta}</div>
            </div>
          </div>
        ))}
      </div>
      {pdf > 0 ? (
        <div style={{ position: "absolute", left: 0, top: 70, right: 0, bottom: 0, background: "#EEF0F4", overflow: "hidden", opacity: pdf }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 40, zIndex: 2, background: "#EEF0F4", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", padding: "0 22px", ...txt(18, { color: T.secondary }) }}>
            {d.files[1].name} · {scroll >= 1 ? d.page : "Page 1 of 40"}
          </div>
          {/* Pages scroll past to page 12 */}
          <div style={{ position: "absolute", left: 60, top: 52 - 1400 * scroll, width: 520 }}>
            {[0, 1, 2, 3].map((pg) => (
              <div key={pg} style={{ height: 330, marginBottom: 20, background: "#FFFFFF", borderRadius: 4, boxShadow: "0 2px 8px rgba(20,24,60,0.08)", position: "relative" }}>
                {[0, 1, 2, 3, 4, 5, 6].map((l) => (
                  <div key={l} style={{ position: "absolute", left: 30, top: 34 + l * 36, width: 380 - (l % 3) * 60, height: 10, borderRadius: 5, background: "#E3E6EE" }} />
                ))}
              </div>
            ))}
            <div style={{ height: 330, background: "#FFFFFF", borderRadius: 4, boxShadow: "0 2px 8px rgba(20,24,60,0.08)", position: "relative", padding: "26px 30px", boxSizing: "border-box" }}>
              {/* Guarded box is the readable text only: the page below it is clipped by the window */}
              <div data-guard="text" data-guard-min="18" data-guard-label="Policy page 12">
                <div style={txt(20, { fontWeight: 700 })}>{d.heading}</div>
                <div style={{ marginTop: 14 }}>
                  {d.text.map((l) => (
                    <div key={l} style={{ display: "inline-block", ...txt(18, { lineHeight: 1.55 }), background: `rgba(124,98,240,${0.22 * highlight})`, borderRadius: 4, padding: "0 4px", marginBottom: 4 }}>
                      {l}
                    </div>
                  ))}
                </div>
              </div>
              {[0, 1, 2].map((l) => (
                <div key={l} style={{ marginTop: 16, width: 380 - l * 50, height: 10, borderRadius: 5, background: "#E3E6EE" }} />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

/** Sheets: the excess table; the matching row is found and highlighted. */
export const SHEET_ROW0 = 74;
export const SHEET_ROW_H = 46;
export const sheetRowCentre = (i: number) => ({ x: WINDOWS.sheets.x + 300, y: WINDOWS.sheets.y + WIN.header + SHEET_ROW0 + i * SHEET_ROW_H + 23 });
const COLS = [56, 190, 230, 164];
export const SheetsBody: React.FC<{ hover: number; select: number }> = ({ hover, select }) => {
  const s = P.scene1.sheets;
  const cell = (content: React.ReactNode, w: number, extra?: React.CSSProperties) => (
    <div style={{ width: w, height: "100%", display: "flex", alignItems: "center", padding: "0 12px", boxSizing: "border-box", borderRight: `1px solid ${T.border}`, ...extra }}>{content}</div>
  );
  return (
    <div data-guard="text" data-guard-min="18" data-guard-label="Sheets table" data-fit-box="sheets table" style={{ position: "absolute", inset: 0, fontFamily: FONT.sans }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 28, display: "flex", background: "#F6F7FA", borderBottom: `1px solid ${T.border}`, ...txt(18, { color: T.secondary }) }}>
        {cell("", COLS[0])}
        {["A", "B", "C"].map((c, i) => cell(c, COLS[i + 1], { justifyContent: "center" }))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 28, height: 46, display: "flex", borderBottom: `1px solid ${T.border}`, ...txt(18, { fontWeight: 700 }) }}>
        {cell("1", COLS[0], { color: T.secondary, fontWeight: 400, justifyContent: "center", background: "#F6F7FA" })}
        {s.header.map((h, i) => cell(<span data-fit-text>{h}</span>, COLS[i + 1]))}
      </div>
      {s.rows.map((r, i) => {
        const match = i === s.match;
        const on = match ? select : 0;
        const hov = Math.max(0, 1 - Math.abs(hover - i));
        return (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: SHEET_ROW0 + i * SHEET_ROW_H, height: SHEET_ROW_H, display: "flex", borderBottom: `1px solid ${T.border}`, background: on > 0 ? `rgba(124,98,240,${0.14 * on})` : hov > 0 ? `rgba(13,18,36,${0.03 * hov})` : "transparent", outline: on > 0.5 ? `2px solid rgba(124,98,240,${on})` : undefined, outlineOffset: -2, ...txt(18) }}>
            {cell(String(i + 2), COLS[0], { color: T.secondary, justifyContent: "center", background: "#F6F7FA" })}
            {r.map((c, j) => cell(<span data-fit-text>{c}</span>, COLS[j + 1], { fontWeight: match && on > 0.5 ? 700 : 400 }))}
          </div>
        );
      })}
    </div>
  );
};

/** Slack: an earlier note, the typed question, then a typing indicator and no reply. */
export const SLACK_INPUT = { x: WINDOWS.slack.x + 300, y: WINDOWS.slack.y + WIN.header + 316 };
export const SLACK_SEND = { x: WINDOWS.slack.x + 596, y: WINDOWS.slack.y + WIN.header + 316 };
export const SlackBody: React.FC<{ focus: number; typeStart: number | null; sent: number; typing: number; pulse: number }> = ({ focus, typeStart, sent, typing, pulse }) => {
  const s = P.scene1.slack;
  return (
    <div data-guard="text" data-guard-min="18" data-guard-label="Slack channel" style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 26, top: 16, display: "flex", alignItems: "center", gap: 10, ...txt(18, { color: T.secondary }) }}>
        <div style={{ flex: 1, height: 1, width: 230, background: T.border }} />
        Today
        <div style={{ flex: 1, height: 1, width: 230, background: T.border }} />
      </div>
      <div style={{ position: "absolute", left: 26, top: 56, width: 590 }}>
        <div style={txt(18, { color: T.secondary })}>Claims team · 8:52 AM</div>
        <div style={txt(19, { marginTop: 4, whiteSpace: "normal", lineHeight: 1.4 })}>{s.earlier}</div>
      </div>
      {sent > 0 ? (
        <div style={{ position: "absolute", left: 26, top: 150, width: 590, opacity: sent, transform: `translateY(${(1 - sent) * 12}px)` }}>
          <div style={txt(18, { color: T.secondary })}>{s.you} · 11:20 AM</div>
          <div style={txt(19, { marginTop: 4 })}>{s.message}</div>
        </div>
      ) : null}
      {typing > 0 ? (
        <div style={{ position: "absolute", left: 26, top: 238, display: "flex", alignItems: "center", gap: 10, opacity: typing, ...txt(18, { color: T.secondary }) }}>
          <span style={{ display: "flex", gap: 5 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ width: 8, height: 8, borderRadius: 4, background: T.secondary, opacity: 0.35 + 0.65 * Math.max(0, Math.sin(pulse * Math.PI * 2 - i * 0.9)) }} />
            ))}
          </span>
          {s.typing}
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 22, top: 290, width: 596, height: 52, boxSizing: "border-box", borderRadius: 12, border: `1.5px solid ${focus > 0 ? `rgba(124,98,240,${0.3 + 0.4 * focus})` : T.border}`, display: "flex", alignItems: "center", gap: 10, padding: "0 14px" }}>
        <Hash size={17} color={T.secondary} />
        {typeStart !== null && sent < 0.5 ? (
          <Typewriter lines={[s.message]} cps={70} startFrame={typeStart} seed="s1-slack" caretColor={T.ink} style={txt(19)} />
        ) : (
          <span style={txt(18, { color: T.secondary })}>Message {s.channel}</span>
        )}
        <div style={{ marginLeft: "auto", width: 34, height: 34, borderRadius: 8, background: typeStart !== null && sent < 0.5 ? T.ink : "#E7E9F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowUp size={17} color={typeStart !== null && sent < 0.5 ? "#FFFFFF" : T.secondary} />
        </div>
      </div>
    </div>
  );
};

/** Review summary: two lines typed, the rest empty with a blinking caret. */
export const SummaryBody: React.FC<{ caret: number }> = ({ caret }) => {
  const s = P.scene1.summary;
  return (
    <div data-guard="text" data-guard-min="18" data-guard-label="Review summary" style={{ position: "absolute", inset: 0, padding: "24px 30px", background: "#FFFFFF" }}>
      <div style={txt(22, { fontWeight: 700 })}>{s.title}</div>
      {s.lines.map((l) => (
        <div key={l} style={txt(18, { marginTop: 12 })}>
          {l}
        </div>
      ))}
      <div style={{ width: 2, height: 24, background: T.ink, marginTop: 12, opacity: caret }} />
      <div style={{ position: "absolute", right: 24, bottom: 20, display: "flex", alignItems: "center", gap: 8, ...txt(18, { color: T.secondary }) }}>
        <FileText size={17} color={T.secondary} />
        Draft
      </div>
    </div>
  );
};

/** A small status chip with a tick, popping around the orb. */
export const TickChip: React.FC<{ label: string; x: number; y: number; appear: number }> = ({ label, x, y, appear }) =>
  appear <= 0 ? null : (
    <div
      data-guard="text"
      data-guard-label={`Chip ${label}`}
      style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, calc(-50% + ${(1 - appear) * 14}px)) scale(${1 + 0.06 * (1 - appear)})`, opacity: appear, display: "flex", alignItems: "center", gap: 12, padding: "12px 22px 12px 14px", borderRadius: 999, background: "#FFFFFF", boxShadow: "0 14px 36px rgba(20,24,60,0.14)", ...txt(28, { fontWeight: 600 }) }}
    >
      <span style={{ width: 32, height: 32, borderRadius: 16, background: T.greenBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Check size={20} color={T.greenText} strokeWidth={3} />
      </span>
      {label}
    </div>
  );
