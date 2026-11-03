import type { IntervalStats } from "@/lib/intervals/quiz";
import { SCALE_BY_ID, SCALES, scalesFor, type ScaleDef, type ScaleFilter, type ScaleId } from "./catalog";

export type ScaleMode = "spell" | "shift";
export type ScaleKind = "build" | "name";

export interface ScaleQuestion {
  id: string;
  kind: ScaleKind;
  scale: ScaleDef;
}

export interface ScaleResult {
  question: ScaleQuestion;
  picked: string[];
  correct: boolean;
}

function pickWeighted<T extends { id: string }>(pool: T[], stats: Record<string, IntervalStats>): T {
  const weights = pool.map((item) => {
    const record = stats[item.id];
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

export function makeScaleSession(opts: {
  length: number;
  stats: Record<string, IntervalStats>;
  filters: ScaleFilter[];
  mode?: ScaleMode;
  onlyIds?: string[];
}): ScaleQuestion[] {
  const filtered = scalesFor(opts.filters.length ? opts.filters : ["major", "minor"]);
  const pool = opts.onlyIds?.length
    ? opts.onlyIds.map((id) => SCALE_BY_ID[id]).filter(Boolean)
    : filtered;
  const source = pool.length > 0 ? pool : filtered.length > 0 ? filtered : SCALES;
  const questions: ScaleQuestion[] = [];
  let lastId: string | null = null;

  for (let i = 0; i < opts.length; i += 1) {
    let scale = pickWeighted(source, opts.stats);
    if (source.length > 1 && scale.id === lastId) {
      scale = pickWeighted(
        source.filter((item) => item.id !== lastId),
        opts.stats,
      );
    }
    const kind: ScaleKind = Math.random() < 0.5 ? "build" : "name";
    questions.push({ id: crypto.randomUUID(), kind, scale });
    lastId = scale.id;
  }
  return questions;
}

export type { ScaleId };
