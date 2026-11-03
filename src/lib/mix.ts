import { makeChordSession, type ChordQuestion } from "@/lib/chords/quiz";
import type { FlashTopic } from "@/lib/intervals/store";
import type { IntervalId } from "@/lib/intervals/catalog";
import { makeSession, type Question } from "@/lib/intervals/quiz";
import type { Direction, IntervalStats, Range } from "@/lib/intervals/quiz";
import { makeInversionSession, type InversionQuestion } from "@/lib/inversions/quiz";
import { makeKeySession, type KeyQuestion } from "@/lib/keys/quiz";
import type { ChordFilter } from "@/lib/chords/catalog";
import type { ScaleFilter } from "@/lib/scales/catalog";
import { makeScaleSession, type ScaleQuestion } from "@/lib/scales/quiz";

export type MixCard =
  | { type: "intervals"; question: Question }
  | { type: "chords"; question: ChordQuestion }
  | { type: "accidentals"; question: KeyQuestion }
  | { type: "scales"; question: ScaleQuestion }
  | { type: "inversions"; question: InversionQuestion };

function shuffle<T>(list: T[]): T[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function makeMix(opts: {
  topics: FlashTopic[];
  length: number;
  stats: Record<string, IntervalStats>;
  direction: Direction;
  range: Range;
  chordFilters: ChordFilter[];
  scaleFilters: ScaleFilter[];
}): MixCard[] {
  const topics = opts.topics.length ? opts.topics : (["intervals"] as FlashTopic[]);
  const buckets: Record<FlashTopic, MixCard[]> = {
    intervals: makeSession({
      direction: opts.direction,
      range: opts.range,
      length: opts.length,
      stats: opts.stats,
    }).map((question) => ({ type: "intervals", question })),
    chords: makeChordSession({
      length: opts.length,
      stats: opts.stats,
      filters: opts.chordFilters.length ? opts.chordFilters : ["major", "minor"],
    }).map((question) => ({ type: "chords", question })),
    accidentals: makeKeySession({ length: opts.length, stats: opts.stats }).map((question) => ({
      type: "accidentals",
      question,
    })),
    scales: makeScaleSession({
      length: opts.length,
      stats: opts.stats,
      filters: opts.scaleFilters.length ? opts.scaleFilters : ["major", "minor"],
      mode: "spell",
    }).map((question) => ({ type: "scales", question })),
    inversions: makeInversionSession({ length: opts.length, stats: opts.stats }).map((question) => ({
      type: "inversions",
      question,
    })),
  };
  const cursors: Record<FlashTopic, number> = {
    intervals: 0,
    chords: 0,
    accidentals: 0,
    scales: 0,
    inversions: 0,
  };
  const order = shuffle(Array.from({ length: opts.length }, (_, i) => topics[i % topics.length]));
  return order.map((topic) => {
    const bucket = buckets[topic];
    const card = bucket[cursors[topic] % bucket.length];
    cursors[topic] += 1;
    return card;
  });
}

export type { IntervalId };
