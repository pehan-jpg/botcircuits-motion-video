import React, { useLayoutEffect, useRef, useState } from "react";
import { mix, useTimeline } from "../anim";
import { CHAT_SCROLL, MAIN_CHAT } from "../content";
import { C, EASE_CAMERA } from "../theme";
import { FlipChip, PaymentRoute, Stepper } from "../components/PaymentRoute";
import {
  Bubble,
  ChatButton,
  CheckCircle,
  DataCard,
  DataRow,
  FileCard,
  Meta,
  Reveal,
  TypedLine,
  TypingDots,
} from "../components/WhatsAppChat";

const M = MAIN_CHAT;

// Depth of field around the data card (px of blur outside the card).
export const useFocusBlur = () => {
  const { p } = useTimeline();
  const f = M.dataCard.focus;
  return f.blur * p(f.in, 0.6, EASE_CAMERA) * (1 - p(f.out, 0.5, EASE_CAMERA));
};

type Box = { x: number; y: number; w: number; h: number };

// Layout box of `el` relative to `container`. Uses offsets, so camera
// transforms and entrance scales do not affect it.
const boxIn = (el: HTMLElement, container: HTMLElement): Box => {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== container) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
};

const useScroll = () => {
  const { p } = useTimeline();
  let y = 0;
  for (const k of CHAT_SCROLL) {
    y = mix(y, k.y, p(k.at, k.duration));
  }
  return y;
};

const Amount: React.FC = () => {
  const { p } = useTimeline();
  const count = p(M.amount.countAt, M.amount.countDuration);
  const pill = p(M.amount.pillAt, 0.33);
  const value = (M.amount.value * count).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        padding: "4px 14px",
        margin: "0 -14px",
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 999,
          backgroundColor: C.lime,
          clipPath: `inset(0 ${(1 - pill) * 100}% 0 0 round 999px)`,
        }}
      />
      <span style={{ position: "relative", fontWeight: 600 }}>
        {M.amount.currency} {value}
      </span>
    </span>
  );
};

const AgentReply: React.FC = () => {
  const { t, p } = useTimeline();
  const blur = useFocusBlur();
  const soft = blur > 0 ? `blur(${blur}px)` : undefined;
  const card = p(M.dataCard.at, 0.45);
  if (t < M.reply.at) {
    return (
      <Bubble side="in" at={M.typingAt} padding="16px 26px 14px">
        <TypingDots at={M.typingAt} />
      </Bubble>
    );
  }
  return (
    <Bubble side="in" at={M.reply.at - 0.33} width={620}>
      <div style={{ filter: soft }}>
        <TypedLine at={M.reply.at} cps={M.reply.cps} text={M.reply.text} />
      </div>
      <Reveal progress={card}>
        <DataCard>
          {M.dataCard.rows.map((row) => (
            <DataRow key={row.label} label={row.label} at={row.at}>
              {row.value === "amount" ? <Amount /> : row.value}
            </DataRow>
          ))}
        </DataCard>
      </Reveal>
      <div style={{ filter: soft }}>
        <Meta time={M.reply.time} />
      </div>
    </Bubble>
  );
};

const Checks: React.FC<{ approveRef: React.Ref<HTMLDivElement> }> = ({
  approveRef,
}) => {
  const { p } = useTimeline();
  const ch = M.checks;
  const question = p(ch.question.at - 0.05, 0.3);
  const buttons = p(ch.buttonsAt, 0.4);
  const dimmed = p(M.approveReply.at, 0.3);
  return (
    <Bubble side="in" at={ch.at} width={620}>
      <div style={{ fontWeight: 500, marginBottom: 10 }}>{ch.title}</div>
      {ch.items.map((item) => (
        <Reveal key={item.label} progress={p(item.at - 0.08, 0.3)}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              height: 58,
            }}
          >
            <CheckCircle at={item.at} />
            <div
              style={{
                opacity: p(item.at + 0.1, 0.35),
                translate: `${mix(-8, 0, p(item.at + 0.1, 0.35))}px 0px`,
              }}
            >
              {item.label}
            </div>
          </div>
        </Reveal>
      ))}
      <Reveal progress={question}>
        <TypedLine
          at={ch.question.at}
          cps={ch.question.cps}
          text={ch.question.text}
          style={{ marginTop: 18, fontWeight: 400 }}
        />
      </Reveal>
      <Reveal progress={buttons}>
        <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: 18,
            opacity: buttons,
            translate: `0px ${mix(24, 0, buttons)}px`,
          }}
        >
          <ChatButton
            ref={approveRef}
            label={ch.approveLabel}
            primary
            tapAt={ch.tapAt}
            dimmed={dimmed}
            fillGone={p(M.approveToStep.at, 0.12)}
          />
          <ChatButton label={ch.rejectLabel} dimmed={dimmed} />
        </div>
      </Reveal>
      <Meta time={ch.time} />
    </Bubble>
  );
};

const PaymentStatus: React.FC<{ stepRef: React.Ref<HTMLDivElement> }> = ({
  stepRef,
}) => {
  const { p } = useTimeline();
  const pay = M.payment;
  const route = p(pay.nodesAt - 0.1, 0.45);
  const confirm = p(pay.confirmAt, 0.45);
  return (
    <Bubble side="in" at={pay.at} width={640}>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 22,
        }}
      >
        <div style={{ fontWeight: 500 }}>{pay.title}</div>
        <FlipChip />
      </div>
      <div style={{ position: "relative" }}>
        <Stepper firstStepRef={stepRef} />
      </div>
      <Reveal progress={route}>
        <div
          style={{
            position: "relative",
            marginTop: 18,
            paddingTop: 18,
            borderTop: `1px solid ${C.line}`,
          }}
        >
          <PaymentRoute />
        </div>
      </Reveal>
      <Reveal progress={confirm}>
        <DataCard>
          {pay.confirmRows.map((row, i) => (
            <DataRow
              key={row.label}
              label={row.label}
              at={pay.confirmAt + 0.1 + i * 0.08}
            >
              {row.label === "Status" ? (
                <span
                  style={{
                    padding: "4px 16px",
                    borderRadius: 999,
                    backgroundColor: C.lime,
                  }}
                >
                  {row.value}
                </span>
              ) : (
                row.value
              )}
            </DataRow>
          ))}
        </DataCard>
      </Reveal>
      <Meta time={pay.time} />
    </Bubble>
  );
};

// Hand pointer (finger tip at 0,0) that travels to the Approve button.
const POINTER_TIP = { x: 27, y: 8 };
const Pointer: React.FC<{ target: Box }> = ({ target }) => {
  const { p, since } = useTimeline();
  const pt = M.checks.pointer;
  const move = p(pt.in, pt.arrive - pt.in, EASE_CAMERA);
  const show = p(pt.in, 0.2) * (1 - p(pt.out, 0.3));
  if (show <= 0) return null;
  const end = { x: target.x + target.w * 0.42, y: target.y + target.h * 0.62 };
  const start = { x: end.x + 230, y: end.y + 320 };
  const ctrl = { x: end.x + 250, y: end.y + 60 };
  const u = 1 - move;
  const x = u * u * start.x + 2 * u * move * ctrl.x + move * move * end.x;
  const y = u * u * start.y + 2 * u * move * ctrl.y + move * move * end.y;
  const s = since(M.checks.tapAt);
  const press = s >= 0 && s <= 0.26 ? Math.sin((s / 0.26) * Math.PI) : 0;
  return (
    <svg
      width={80}
      height={80}
      viewBox="0 0 24 24"
      style={{
        position: "absolute",
        left: x - POINTER_TIP.x,
        top: y - POINTER_TIP.y,
        opacity: show,
        scale: String(1 - press * 0.08),
        transformOrigin: `${POINTER_TIP.x}px ${POINTER_TIP.y}px`,
        filter: "drop-shadow(0 6px 10px rgba(29, 33, 37, 0.18))",
        overflow: "visible",
      }}
      fill={C.bg}
      stroke={C.ink}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 14V4a2 2 0 0 1 4 0v5a2 2 0 0 1 4 0v1a2 2 0 0 1 4 0v1a2 2 0 0 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L6 14z" />
      <path d="M10 9v2.5M14 10v2M18 11v1.5" fill="none" />
    </svg>
  );
};

// T3: the Approve button's fill shrinks into a lime circle and lands on
// step 1 of the stepper.
const ApproveToStep: React.FC<{ from: Box; to: Box }> = ({ from, to }) => {
  const { p } = useTimeline();
  const m = p(M.approveToStep.at, M.approveToStep.duration, EASE_CAMERA);
  const gone = p(M.payment.stepAt[0], 0.05);
  if (m <= 0 || gone >= 1) return null;
  const size = { w: mix(from.w, to.w, m), h: mix(from.h, to.h, m) };
  const cx = mix(from.x + from.w / 2, to.x + to.w / 2, m);
  const cy =
    mix(from.y + from.h / 2, to.y + to.h / 2, m) - Math.sin(m * Math.PI) * 60;
  return (
    <div
      style={{
        position: "absolute",
        left: cx - size.w / 2,
        top: cy - size.h / 2,
        width: size.w,
        height: size.h,
        borderRadius: mix(20, to.h / 2, m),
        backgroundColor: C.lime,
        opacity: 1 - gone,
      }}
    />
  );
};

export const MainChat: React.FC = () => {
  const y = useScroll();
  const blur = useFocusBlur();
  const inv = M.invoice;
  const container = useRef<HTMLDivElement>(null);
  const approveRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const [anchors, setAnchors] = useState<{ approve: Box; step: Box } | null>(
    null,
  );
  // Measure after every render; only store when the layout changed, so this
  // settles after one extra pass.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (!container.current || !approveRef.current || !stepRef.current) return;
    const next = {
      approve: boxIn(approveRef.current, container.current),
      step: boxIn(stepRef.current, container.current),
    };
    if (JSON.stringify(next) !== JSON.stringify(anchors)) setAnchors(next);
  });
  return (
    <div
      ref={container}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        padding: "24px 26px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        translate: `0px ${-y}px`,
      }}
    >
      <Bubble side="out" at={inv.at} padding="14px 14px 10px 14px" blur={blur}>
        <FileCard
          name={inv.fileName}
          meta={`${inv.fileType} · ${inv.fileMeta}`}
          type={inv.fileType}
        />
        <div style={{ paddingRight: 8 }}>
          <Meta
            time={inv.time}
            ticks={{ deliveredAt: inv.deliveredAt, readAt: inv.readAt }}
          />
        </div>
      </Bubble>
      <AgentReply />
      <Checks approveRef={approveRef} />
      <Bubble side="out" at={M.approveReply.at}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
          <span style={{ fontWeight: 400 }}>{M.approveReply.text}</span>
          <Meta
            time={M.approveReply.time}
            ticks={{
              deliveredAt: M.approveReply.at + 0.1,
              readAt: M.approveReply.readAt,
            }}
          />
        </div>
      </Bubble>
      <PaymentStatus stepRef={stepRef} />
      <Bubble side="in" at={M.proof.at} padding="14px 14px 10px 14px">
        <FileCard
          name={M.proof.fileName}
          meta={`${M.proof.fileType} · ${M.proof.fileMeta}`}
          type={M.proof.fileType}
          tone="in"
        />
        <div style={{ paddingRight: 8 }}>
          <Meta time={M.proof.time} />
        </div>
      </Bubble>
      {anchors ? (
        <>
          <ApproveToStep from={anchors.approve} to={anchors.step} />
          <Pointer target={anchors.approve} />
        </>
      ) : null}
    </div>
  );
};
