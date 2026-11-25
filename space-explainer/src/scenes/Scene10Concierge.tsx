import React from "react";
import { AbsoluteFill } from "remotion";
import { CHAT_CPS, EASE } from "../theme";
import { PLACEHOLDERS as P } from "../placeholders";
import { GuardLayer } from "../components/GuardLayer";
import { SpaceOrb } from "../components/SpaceOrb";
import { CONCIERGE, ConciergeCard, lerpRect, type Rect } from "../components/ConciergeCard";
import { typeDuration } from "../lib/typewriter";
import type { TextBeatSpec } from "../lib/guards";
import { Scene09EndFrame, S9_CARD_END } from "./Scene09Records";
import { ramp, useScene } from "./shared/stage";

const S = "S10" as const;
export const NEUTRAL = "#F4F6F8";
const C = P.concierge;
/** Scene 10 beats: the record's first entry is now the Concierge chat; the reply types; the orb blooms into white. */
export const S10 = { neutral: [0.05, 0.7], move: [0.0, 0.9], reply: 1.0, chip: 3.3, bloom: [5.15, 6.0] };
const REPLY = C.reply.join(" ");
const REPLY_DUR = typeDuration(C.reply.join("\n"), CHAT_CPS, "concierge-reply");
const CARD: Rect = { x: 480, y: 240, w: CONCIERGE.w, h: CONCIERGE.h };

export const SCENE10_TEXT: TextBeatSpec[] = [
  { id: "customer", text: C.customer, readyAt: 0, leaveAt: S10.bloom[0] + 0.4, fontPx: 28 },
  { id: "reply", text: REPLY, readyAt: S10.reply + REPLY_DUR, leaveAt: S10.bloom[0] + 0.4, fontPx: 28, exception: "Read as it types; brief: 6s scene" },
  { id: "chip", text: C.handed, readyAt: S10.chip + 0.3, leaveAt: S10.bloom[0] + 0.4, fontPx: 28 },
];

export const Scene10Concierge: React.FC = () => {
  const { t, F, clock, start } = useScene(S);
  const neutral = EASE(ramp(t, S10.neutral[0], S10.neutral[1]));
  const r0 = lerpRect(S9_CARD_END, CARD, EASE(ramp(t, S10.move[0], S10.move[1])));
  // A slow push in while the reply types, so the frame keeps moving.
  const g = 1 + 0.05 * ramp(t, 0, S10.bloom[1]);
  const r: Rect = { x: r0.x - (r0.w * (g - 1)) / 2, y: r0.y - (r0.h * (g - 1)) / 2, w: r0.w * g, h: r0.h * g };
  const chip = EASE(ramp(t, S10.chip, S10.chip + 0.35));
  // Bloom: the chip's orb grows and turns to white light that fills the frame.
  const grow = EASE(ramp(t, S10.bloom[0], S10.bloom[1]));
  const white = ramp(t, S10.bloom[0] + 0.25, S10.bloom[1] - 0.1);
  const blooming = t >= S10.bloom[0];
  const k = r.w / CONCIERGE.w;
  const orb = { x: r.x + CONCIERGE.chip.x * k, y: r.y + CONCIERGE.chip.y * k };
  const scale = 1 + 115 * grow * grow;
  return (
    <AbsoluteFill style={{ width: 1920, height: 1080, background: NEUTRAL }}>
      {neutral < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - neutral }}>
          <Scene09EndFrame F={F} clock={clock} />
        </AbsoluteFill>
      ) : null}
      <ConciergeCard r={r} opacity={1} content={1} replyStart={F(S10.reply)} chip={chip} orbHidden={blooming} clock={start} />
      {blooming ? (
        <div style={{ position: "absolute", left: orb.x, top: orb.y, width: 0, height: 0 }}>
          <div style={{ position: "absolute", left: -19, top: -19, width: 38, height: 38, transform: `scale(${scale})`, opacity: 1 - white }}>
            <SpaceOrb size={38} timeOffset={start} />
          </div>
          <div style={{ position: "absolute", left: -19, top: -19, width: 38, height: 38, borderRadius: "50%", background: "radial-gradient(circle, #FFFFFF 0%, #FFFFFF 60%, rgba(255,255,255,0.85) 80%, rgba(255,255,255,0) 100%)", transform: `scale(${scale * 1.05})`, opacity: Math.min(1, white * 1.2) }} />
        </div>
      ) : null}
      {t >= S10.bloom[1] - 0.12 ? <AbsoluteFill style={{ background: "#FFFFFF", opacity: ramp(t, S10.bloom[1] - 0.12, S10.bloom[1] - 0.02) }} /> : null}
      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};
