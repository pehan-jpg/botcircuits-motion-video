import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ConnectionLine, Point, fanCurve} from '../../components/ConnectionLine';
import {HEIGHT, WIDTH} from '../../config';
import {mix, progress} from '../../motion';
import {colors, fontFamily} from '../../tokens';
import {AGENT_CARD, AgentCard} from '../components/AgentCard';
import {ApprovalNode} from '../components/ApprovalNode';
import {DetailCard, detailItemCount} from '../components/DetailCard';
import {FlowDot} from '../components/FlowDot';
import {SettledPill} from '../components/SettledPill';
import {StartNode} from '../components/StartNode';
import {AGENTS, APPROVAL, DETAIL_NOTE, DETAIL_SECTIONS, PAYOUT, SELECTED_AGENT, SETTLED, START} from './content';
import {SPACE_AGENTS_TIMELINE as T} from './timeline';

/* ------------------------------------------------------------------ */
/* Layout (graph local coordinates; the group is moved by one translateX) */
/* ------------------------------------------------------------------ */

const GAP = 70;
const START_NODE = {width: 150, height: 56};
const APPROVAL_NODE = {width: 160, height: 96};
const AGENT_GAP = 24;
const GRAPH_W = START_NODE.width + GAP + AGENT_CARD.width + GAP + APPROVAL_NODE.width + GAP + AGENT_CARD.width; // 960
const GRAPH_X = 60;
const CY = HEIGHT / 2;

const X = {
  start: 0,
  agents: START_NODE.width + GAP,
  approval: START_NODE.width + GAP + AGENT_CARD.width + GAP,
  payout: START_NODE.width + GAP + AGENT_CARD.width + GAP + APPROVAL_NODE.width + GAP,
};
const colH = AGENTS.length * AGENT_CARD.height + (AGENTS.length - 1) * AGENT_GAP;
const agentY = (i: number) => CY - colH / 2 + i * (AGENT_CARD.height + AGENT_GAP);
const agentCY = (i: number) => agentY(i) + AGENT_CARD.height / 2;

const START_RIGHT: Point = {x: X.start + START_NODE.width, y: CY};
const LINES_IN = AGENTS.map((_, i) => fanCurve(START_RIGHT, {x: X.agents, y: agentCY(i)}));
const LINES_OUT = AGENTS.map((_, i) => fanCurve({x: X.agents + AGENT_CARD.width, y: agentCY(i)}, {x: X.approval, y: CY}));
const LINE_PAYOUT = fanCurve({x: X.approval + APPROVAL_NODE.width, y: CY}, {x: X.payout, y: CY});

/** The graph starts centred (centre at x=800) and slides to x=60. */
const START_SHIFT = WIDTH / 2 - (GRAPH_X + GRAPH_W / 2);

const DETAIL = {x: 1100, width: 440, height: 500};

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

export const SpaceAgents: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const f = (s: number) => s * fps;
  const p = (a: number, b: number) => progress(frame, f(a), f(b));
  /** Dot travel: eased position plus short fades at both ends. */
  const dot = (start: number, end: number) => ({
    progress: p(start, end),
    opacity: p(start, start + T.dotFade) * (1 - p(end - T.dotFade, end)),
  });

  const startIn = p(T.startIn.start, T.startIn.end);
  const startLines = p(T.startLines.start, T.startLines.start + T.startLines.duration);
  const A = T.agentsIn;
  const agentOrb = AGENTS.map((_, i) => p(A.start + i * A.stagger, A.start + i * A.stagger + A.duration));
  const agentText = AGENTS.map((_, i) => p(A.start + i * A.stagger + A.textDelay, A.start + i * A.stagger + A.textDelay + A.duration));
  const approvalLines = p(T.approvalLines.start, T.approvalLines.start + T.approvalLines.duration);
  const approvalIn = p(T.approvalIn.start, T.approvalIn.start + T.approvalIn.duration);
  const payoutLine = p(T.payoutLine.start, T.payoutLine.start + T.payoutLine.duration);
  const payoutIn = p(T.payoutIn.start, T.payoutIn.start + T.payoutIn.duration);
  const payoutActive = p(T.payoutActive.start, T.payoutActive.start + T.payoutActive.duration);
  const payoutOpacity = payoutIn * mix(T.payoutIn.dimmed, 1, payoutActive);

  const spinner = p(T.spinners, T.spinners + 0.15);
  const done = T.ticks.map((t) => p(t, t + T.tickFade));
  const tickDraw = T.ticks.map((t) => p(t, t + T.tickFade + 0.15));

  const toAgents = dot(T.dotsToAgents.start, T.dotsToAgents.end);
  const toApproval = dot(T.dotsToApproval.start, T.dotsToApproval.start + T.dotsToApproval.duration);
  const PU = T.approvalPulse;
  const pulse = p(PU.start, PU.start + PU.duration / 2) * (1 - p(PU.start + PU.duration / 2, PU.start + PU.duration));

  const slide = p(T.slide.start, T.slide.start + T.slide.duration);
  const shift = START_SHIFT * (1 - slide);
  const selected = p(T.selected.start, T.selected.start + T.selected.duration);

  const D = T.detail;
  const detailIn = p(T.slide.start, T.slide.start + T.slide.duration);
  const header = p(D.header, D.header + D.duration);
  const nItems = detailItemCount(DETAIL_SECTIONS);
  const items = Array.from({length: nItems}, (_, k) => p(D.itemsStart + k * D.stagger, D.itemsStart + k * D.stagger + D.duration));
  const noteStart = D.itemsStart + (nItems - 1) * D.stagger + D.noteGap;
  const noteIn = p(noteStart, noteStart + D.duration);

  const AP = T.approve;
  const approved = p(AP.start, AP.start + AP.duration);
  const approvedLabel = p(AP.start, AP.start + AP.labelFade);
  const approvedTick = p(AP.start, AP.start + AP.labelFade + 0.2);
  const toPayout = dot(T.dotToPayout.start, T.dotToPayout.start + T.dotToPayout.duration);
  const payoutSpinner = p(T.payoutSpinner, T.payoutSpinner + 0.15);
  const payoutDone = p(T.payoutTick, T.payoutTick + T.tickFade);
  const payoutTick = p(T.payoutTick, T.payoutTick + T.tickFade + 0.15);
  const settled = p(T.settled.start, T.settled.start + T.settled.duration);
  const settledTick = p(T.settled.start + 0.1, T.settled.start + T.settled.duration + 0.1);

  const fadeOut = progress(frame, f(T.fadeOut.start), durationInFrames - 1);

  const rise = (v: number): React.CSSProperties => ({opacity: v, transform: `translateY(${mix(12, 0, v)}px)`});

  return (
    <AbsoluteFill style={{background: colors.background, fontFamily}}>
      <AbsoluteFill style={{opacity: 1 - fadeOut}}>
        {/* Graph group: one translateX for the slide */}
        <div style={{position: 'absolute', left: GRAPH_X, top: 0, width: GRAPH_W, height: HEIGHT, transform: `translateX(${shift}px)`}}>
          <svg width={GRAPH_W} height={HEIGHT} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            {LINES_IN.map((c, i) => (
              <ConnectionLine key={`in${i}`} curve={c} draw={startLines} />
            ))}
            {LINES_OUT.map((c, i) => (
              <ConnectionLine key={`out${i}`} curve={c} draw={approvalLines} />
            ))}
            <ConnectionLine curve={LINE_PAYOUT} draw={payoutLine} />
          </svg>

          {LINES_IN.map((c, i) => (
            <FlowDot key={`d1${i}`} curve={c} {...toAgents} />
          ))}
          {LINES_OUT.map((c, i) => (
            <FlowDot key={`d2${i}`} curve={c} {...toApproval} />
          ))}
          <FlowDot curve={LINE_PAYOUT} {...toPayout} />

          <div style={{position: 'absolute', left: X.start, top: CY - START_NODE.height / 2, ...rise(startIn)}}>
            <StartNode label={START} width={START_NODE.width} height={START_NODE.height} />
          </div>

          {AGENTS.map((a, i) =>
            agentOrb[i] > 0 ? (
              <div key={a.name} style={{position: 'absolute', left: X.agents, top: agentY(i), transform: `translateY(${mix(12, 0, agentOrb[i])}px)`}}>
                <div style={{opacity: agentOrb[i]}}>
                  <AgentCard
                    name={a.name}
                    role={a.role}
                    orb={1}
                    text={agentText[i]}
                    spinner={spinner}
                    done={done[i]}
                    tick={tickDraw[i]}
                    selected={i === SELECTED_AGENT ? selected : 0}
                  />
                </div>
              </div>
            ) : null,
          )}

          {approvalIn > 0 && (
            <div style={{position: 'absolute', left: X.approval, top: CY - APPROVAL_NODE.height / 2, ...rise(approvalIn)}}>
              <ApprovalNode
                pendingLabel={APPROVAL.pending}
                approvedLabel={APPROVAL.approved}
                initials={APPROVAL.initials}
                name={APPROVAL.name}
                approved={approved}
                labelMix={approvedLabel}
                tick={approvedTick}
                pulse={pulse}
                width={APPROVAL_NODE.width}
                height={APPROVAL_NODE.height}
              />
            </div>
          )}

          {payoutIn > 0 && (
            <div
              style={{
                position: 'absolute',
                left: X.payout,
                top: CY - AGENT_CARD.height / 2,
                opacity: payoutOpacity,
                transform: `translateY(${mix(12, 0, payoutIn)}px)`,
              }}
            >
              <AgentCard name={PAYOUT.name} role={PAYOUT.role} orb={1} text={1} spinner={payoutSpinner} done={payoutDone} tick={payoutTick} />
            </div>
          )}

          {settled > 0 && (
            <div
              style={{
                position: 'absolute',
                left: X.payout,
                width: AGENT_CARD.width,
                top: CY + AGENT_CARD.height / 2 + 16,
                display: 'flex',
                justifyContent: 'center',
                ...rise(settled),
              }}
            >
              <SettledPill label={SETTLED} tick={settledTick} />
            </div>
          )}
        </div>

        {/* Detail card for the selected agent */}
        {detailIn > 0 && (
          <div style={{position: 'absolute', left: DETAIL.x, top: CY - DETAIL.height / 2, ...rise(detailIn)}}>
            <DetailCard
              width={DETAIL.width}
              height={DETAIL.height}
              name={AGENTS[SELECTED_AGENT].name}
              role={AGENTS[SELECTED_AGENT].role}
              sections={DETAIL_SECTIONS}
              note={DETAIL_NOTE}
              header={header}
              items={items}
              noteIn={noteIn}
            />
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
