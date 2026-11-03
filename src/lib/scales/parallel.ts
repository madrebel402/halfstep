import type { IntervalStats } from "@/lib/intervals/quiz";
import {
  DEGREES,
  diagnose,
  KIND_BY_ID,
  LADDER,
  LADDER_PROMPTS,
  SCALE_KINDS,
  shapeInstruction,
  TONICS,
  type AlterMap,
  type ScaleId,
  type ScaleKind,
  type Tonic,
} from "./catalog";

export type ParallelPrompt = "name" | "shape" | "function" | "ladder";
export type ParallelStage = 1 | 2 | 3 | 4 | "ladder";

export interface ParallelQuestion {
  id: string;
  prompt: ParallelPrompt;
  tonic: Tonic;
  target: ScaleKind;
  requiredAlterations: AlterMap;
  instruction: string;
  startAlterations: AlterMap;
  nameChoices?: { id: ScaleId; label: string }[];
  ladderIndex?: number;
  tooltip?: string;
}

export interface ParallelResult {
  question: ParallelQuestion;
  correct: boolean;
}

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffle<T>(list: T[]): T[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function kindsForStage(stage: ParallelStage): ScaleKind[] {
  if (stage === "ladder") return LADDER.map((id) => KIND_BY_ID[id]);
  const max = stage === 4 ? 5 : stage;
  return SCALE_KINDS.filter((kind) => kind.stage >= 1 && kind.stage <= max);
}

function nameChoicesFor(target: ScaleKind): { id: ScaleId; label: string }[] {
  const pool = SCALE_KINDS.filter((kind) => kind.stage >= 1 && kind.id !== target.id);
  const picks = shuffle(pool).slice(0, 3);
  return shuffle([{ id: target.id, label: target.label }, ...picks.map((kind) => ({ id: kind.id, label: kind.label }))]);
}

function promptFor(kind: ScaleKind, maxStage: number): ParallelPrompt {
  if (maxStage >= 2 && kind.functions.length && Math.random() < 0.32) return "function";
  if (Math.random() < 0.45) return "shape";
  return "name";
}

export function makeParallelSession(opts: {
  length: number;
  stats: Record<string, IntervalStats>;
  stage: ParallelStage;
  onlyIds?: string[];
}): ParallelQuestion[] {
  if (opts.stage === "ladder") return makeLadderSession();

  let pool = kindsForStage(opts.stage);
  if (opts.onlyIds?.length) {
    const focused = pool.filter((kind) => opts.onlyIds?.includes(kind.id));
    if (focused.length) pool = focused;
  }
  const maxStage = opts.stage === 4 ? 5 : opts.stage;
  const questions: ParallelQuestion[] = [];
  let lastKey = "";

  for (let i = 0; i < opts.length; i += 1) {
    let kind = pick(pool);
    let tonic = pick(TONICS);
    let key = `${tonic.id}-${kind.id}`;
    if (key === lastKey && pool.length > 1) {
      kind = pick(pool.filter((item) => item.id !== kind.id));
      tonic = pick(TONICS);
      key = `${tonic.id}-${kind.id}`;
    }
    const prompt = promptFor(kind, maxStage);
    questions.push(makeQuestion(tonic, kind, prompt));
    lastKey = key;
  }
  return questions;
}

function makeQuestion(tonic: Tonic, kind: ScaleKind, prompt: ParallelPrompt): ParallelQuestion {
  const instruction =
    prompt === "name"
      ? `Make ${tonic.name} ${kind.label}.`
      : prompt === "shape"
        ? shapeInstruction(kind)
        : pick(kind.functions);
  return {
    id: crypto.randomUUID(),
    prompt,
    tonic,
    target: kind,
    requiredAlterations: kind.alterations,
    instruction,
    startAlterations: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 },
    nameChoices: prompt === "shape" ? nameChoicesFor(kind) : undefined,
    tooltip: kind.tooltip,
  };
}

function makeLadderSession(): ParallelQuestion[] {
  const tonic = pick(TONICS);
  const questions: ParallelQuestion[] = [];
  for (let i = 0; i < LADDER_PROMPTS.length; i += 1) {
    const from = KIND_BY_ID[LADDER[i]];
    const to = KIND_BY_ID[LADDER[i + 1]];
    questions.push({
      id: crypto.randomUUID(),
      prompt: "ladder",
      tonic,
      target: to,
      requiredAlterations: to.alterations,
      instruction: LADDER_PROMPTS[i],
      startAlterations: from.alterations,
      ladderIndex: i,
      tooltip: to.tooltip,
    });
  }
  return questions;
}

export { diagnose, DEGREES };
