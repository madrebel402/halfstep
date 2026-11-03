import type { IntervalStats } from "@/lib/intervals/quiz";
import { CHORD_BY_ID, CHORDS, chordsFor, type ChordDef, type ChordFilter } from "./catalog";

export type ChordKind = "build" | "name";

export interface ChordQuestion {
  id: string;
  kind: ChordKind;
  chord: ChordDef;
}

export interface ChordResult {
  question: ChordQuestion;
  picked: string[];
  correct: boolean;
}

function pickWeighted(pool: ChordDef[], stats: Record<string, IntervalStats>): ChordDef {
  const weights = pool.map((chord) => {
    const record = stats[chord.id];
    if (!record || record.seen < 2) return 3;
    return 1 + (1 - record.correct / record.seen) * 4;
  });
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let dart = Math.random() * total;
  for (let i = 0; i < pool.length; i += 1) {
    dart -= weights[i];
    if (dart <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

export function makeChordSession(opts: {
  length: number;
  stats: Record<string, IntervalStats>;
  filters: ChordFilter[];
  onlyIds?: string[];
}): ChordQuestion[] {
  const filtered = chordsFor(opts.filters.length ? opts.filters : ["major", "minor"]);
  const pool = opts.onlyIds?.length
    ? opts.onlyIds.map((id) => CHORD_BY_ID[id]).filter(Boolean)
    : filtered;
  const source = pool.length > 0 ? pool : filtered.length > 0 ? filtered : CHORDS;
  const questions: ChordQuestion[] = [];
  let lastId: string | null = null;

  for (let i = 0; i < opts.length; i += 1) {
    let chord = pickWeighted(source, opts.stats);
    if (source.length > 1 && chord.id === lastId) {
      chord = pickWeighted(
        source.filter((item) => item.id !== lastId),
        opts.stats,
      );
    }
    const kind: ChordKind = Math.random() < 0.5 ? "build" : "name";
    questions.push({ id: crypto.randomUUID(), kind, chord });
    lastId = chord.id;
  }
  return questions;
}
