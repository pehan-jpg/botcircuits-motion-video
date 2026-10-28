import React from "react";
import { interpolate } from "remotion";
import { mix, useTimeline } from "../anim";
import { CHAT_SCROLL, MAIN_CHAT } from "../content";
import { C, EASE_IN, R } from "../theme";
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
      <TypedLine at={M.reply.at} cps={M.reply.cps} text={M.reply.text} />
      <Reveal progress={card}>
        <DataCard>
          {M.dataCard.rows.map((row) => (
            <DataRow key={row.label} label={row.label} at={row.at}>
              {row.value === "amount" ? <Amount /> : row.value}
            </DataRow>
          ))}
        </DataCard>
      </Reveal>
      <Meta time={M.reply.time} />
    </Bubble>
  );
};

const Checks: React.FC = () => {
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
            label={ch.approveLabel}
            primary
            tapAt={ch.tapAt}
            dimmed={dimmed}
          />
          <ChatButton label={ch.rejectLabel} dimmed={dimmed} />
        </div>
      </Reveal>
      <Meta time={ch.time} />
    </Bubble>
  );
};

const PaymentStatus: React.FC = () => {
  const { p, since } = useTimeline();
  const pay = M.payment;
  const route = p(pay.nodesAt - 0.1, 0.45);
  const confirm = p(pay.confirmAt, 0.45);
  const flashS = since(pay.orb.supplierAt);
  const flash =
    flashS >= 0 && flashS <= 0.7 ? Math.sin((flashS / 0.7) * Math.PI) : 0;
  const flashX = interpolate(flashS, [0, 0.7], [70, 30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_IN,
  });
  return (
    <Bubble side="in" at={pay.at} width={640}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: R.bubble,
          borderBottomLeftRadius: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: flash * 0.9,
            background: `radial-gradient(70% 60% at ${flashX + 20}% 45%, rgba(180,240,0,0.38) 0%, rgba(234,249,184,0.25) 45%, rgba(234,249,184,0) 100%)`,
          }}
        />
      </div>
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
        <Stepper />
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

export const MainChat: React.FC = () => {
  const y = useScroll();
  const inv = M.invoice;
  return (
    <div
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
      <Bubble side="out" at={inv.at} padding="14px 14px 10px 14px">
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
      <Checks />
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
      <PaymentStatus />
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
    </div>
  );
};
