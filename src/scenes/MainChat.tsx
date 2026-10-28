import React, { useLayoutEffect, useRef, useState } from "react";
import { interpolateColors } from "remotion";
import { mix, useTimeline } from "../anim";
import { CHAT_SCROLL, MAIN_CHAT } from "../content";
import { C, EASE_CAMERA } from "../theme";
import { FlipChip, PaymentRoute, Stepper } from "../components/PaymentRoute";
import { Pointer } from "../components/Pointer";
import {
  Bubble,
  CheckCircle,
  DataCard,
  DataRow,
  FileCard,
  Meta,
  QuickReply,
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
        <TypedLine
          at={M.reply.at}
          cps={M.reply.cps}
          text={M.reply.text}
          style={{ fontWeight: 600 }}
        />
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
    <Bubble
      side="in"
      at={ch.at}
      width={620}
      footer={
        <Reveal progress={buttons}>
          <div
            style={{
              opacity: buttons,
              translate: `0px ${mix(24, 0, buttons)}px`,
            }}
          >
            <QuickReply
              ref={approveRef}
              label={ch.approveLabel}
              tapAt={ch.tapAt}
              dimmed={dimmed}
            />
            <QuickReply label={ch.rejectLabel} dimmed={dimmed} />
          </div>
        </Reveal>
      }
    >
      <div style={{ fontWeight: 600, marginBottom: 10 }}>{ch.title}</div>
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
        <div style={{ fontWeight: 600 }}>{pay.title}</div>
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
        borderRadius: mix(16, to.h / 2, m),
        backgroundColor: interpolateColors(m, [0, 0.35], [C.bg, C.lime]),
        boxShadow: `0 6px 18px rgba(11, 20, 26, ${0.15 * (1 - m)})`,
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
      <Bubble side="in" at={M.greeting.at} blur={blur}>
        <span>{M.greeting.text}</span>
        <Meta time={M.greeting.time} />
      </Bubble>
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
          <Pointer
            target={{
              x: anchors.approve.x + anchors.approve.w * 0.42,
              y: anchors.approve.y + anchors.approve.h * 0.62,
            }}
            inAt={M.checks.pointer.in}
            arriveAt={M.checks.pointer.arrive}
            outAt={M.checks.pointer.out}
            tapAt={M.checks.tapAt}
          />
        </>
      ) : null}
    </div>
  );
};
