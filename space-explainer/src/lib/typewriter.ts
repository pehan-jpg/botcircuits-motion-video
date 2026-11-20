import { random } from "remotion";
import { TYPE } from "../theme";

export type TypeSchedule = {
  /** Seconds (relative to typing start) at which each character starts to fade in. */
  times: number[];
  /** Seconds at which the last character is fully visible. */
  end: number;
};

/**
 * Deterministic typing schedule. Base interval is 1/cps with plus or minus
 * 10 percent jitter, plus 140ms after commas and 260ms after full stops.
 * Each character fades in over 70ms.
 */
export const typeSchedule = (
  text: string,
  cps: number,
  seed = "type",
): TypeSchedule => {
  const base = 1 / cps;
  const times: number[] = [];
  let t = 0;
  const chars = [...text];
  chars.forEach((ch, i) => {
    times.push(t);
    const jitter = (random(`${seed}-${i}`) * 2 - 1) * TYPE.jitter;
    let step = base * (1 + jitter);
    if (ch === ",") step += TYPE.commaPauseMs / 1000;
    if (ch === "." || ch === "?" || ch === "!") step += TYPE.stopPauseMs / 1000;
    t += step;
  });
  const last = times.length ? times[times.length - 1] : 0;
  return { times, end: last + TYPE.charFadeMs / 1000 };
};

export const typeDuration = (text: string, cps: number, seed?: string) =>
  typeSchedule(text, cps, seed).end;
