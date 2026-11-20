import { random } from "remotion";
import { TYPE } from "../theme";

/** Source tags such as [S1] are typed as a single unit and rendered as a chip. */
export const TAG = /\[S\d+\]/;
export const toUnits = (text: string) => text.match(/\[S\d+\]|[\s\S]/gu) ?? [];

export type TypeSchedule = {
  /** Seconds (relative to typing start) at which each unit starts to fade in. */
  times: number[];
  /** Seconds at which the last unit is fully visible. */
  end: number;
};

/**
 * Deterministic typing schedule. Base interval is 1/cps with plus or minus
 * 10 percent jitter, plus 140ms after commas and 260ms after full stops.
 * A stop only pauses when it ends a sentence (so "4.2" and "p. 12" stay quick
 * unless followed by a space). Each unit fades in over 70ms.
 */
export const typeSchedule = (
  text: string,
  cps: number,
  seed = "type",
): TypeSchedule => {
  const base = 1 / cps;
  const units = toUnits(text);
  const times: number[] = [];
  let t = 0;
  units.forEach((u, i) => {
    times.push(t);
    const next = units[i + 1];
    const jitter = (random(`${seed}-${i}`) * 2 - 1) * TYPE.jitter;
    let step = base * (1 + jitter);
    if (u === ",") step += TYPE.commaPauseMs / 1000;
    const endsSentence = next === undefined || /\s/.test(next);
    if ((u === "." || u === "?" || u === "!") && endsSentence)
      step += TYPE.stopPauseMs / 1000;
    t += step;
  });
  const last = times.length ? times[times.length - 1] : 0;
  return { times, end: last + TYPE.charFadeMs / 1000 };
};

export const typeDuration = (text: string, cps: number, seed?: string) =>
  typeSchedule(text, cps, seed).end;
