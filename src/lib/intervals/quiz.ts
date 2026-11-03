import {
  articleFor,
  INTERVAL_BY_ID,
  type Interval,
  type IntervalId,
  poolFor,
  randomNaturalRoot,
  spellUpper,
  type SpelledNote,
  stepsPhrase,
} from "./catalog";

export type Direction = "both" | "name-to-steps" | "steps-to-name";
export type Range = "core" | "full";
export type PromptKind = "name-to-steps" | "steps-to-name";

export interface Choice {
  value: string;
  label: string;
  shortLabel?: string;
}

export interface Question {
  id: string;
  kind: PromptKind;
  interval: Interval;
  promptLead: string;
  promptEmphasis: string;
  promptTail: string;
  answer: string;
  choices: Choice[];
  lower: SpelledNote;
  upper: SpelledNote;
}

export interface IntervalStats {
  seen: number;
  correct: number;
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function pickWeighted(pool: Interval[], stats: Record<string, IntervalStats>): Interval {
  const weights = pool.map((interval) => {
    const record = stats[interval.id];
    if (!record || record.seen < 2) return 3;
    const accuracy = record.correct / record.seen;
    return 1 + (1 - accuracy) * 4;
  });
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let dart = Math.random() * total;
  for (let i = 0; i < pool.length; i += 1) {
    dart -= weights[i];
    if (dart <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

function uniqueChoices(values: Choice[], needed: number, extras: Choice[]): Choice[] {
  const seen = new Set(values.map((choice) => choice.value));
  const result = [...values];
  for (const extra of shuffle(extras)) {
    if (result.length >= needed) break;
    if (seen.has(extra.value)) continue;
    seen.add(extra.value);
    result.push(extra);
  }
  return result;
}

function stepChoices(correct: number): Choice[] {
  const nearby = [correct - 2, correct - 1, correct + 1, correct + 2, correct + 3, correct - 3];
  const extras = nearby
    .filter((value) => value >= 0 && value <= 12 && value !== correct)
    .map((value) => ({ value: String(value), label: String(value) }));
  const rest = Array.from({ length: 13 }, (_, value) => ({
    value: String(value),
    label: String(value),
  })).filter((choice) => choice.value !== String(correct));
  return shuffle(
    uniqueChoices([{ value: String(correct), label: String(correct) }], 4, [...extras, ...rest]),
  );
}

function nameChoices(correct: Interval, pool: Interval[]): Choice[] {
  const toChoice = (interval: Interval): Choice => ({
    value: interval.id,
    label: interval.name,
    shortLabel: interval.shortName,
  });
  const others = pool.filter((interval) => interval.id !== correct.id).map(toChoice);
  return shuffle(uniqueChoices([toChoice(correct)], 4, others));
}

function nameToStepsPrompt(interval: Interval): Pick<Question, "promptLead" | "promptEmphasis" | "promptTail"> {
  const name = interval.name;
  const art = articleFor(name);
  const roll = Math.random();
  if (roll < 0.45) {
    return { promptLead: "How many half-steps are in", promptEmphasis: `${art} ${name}`, promptTail: "?" };
  }
  if (roll < 0.8) {
    return { promptLead: "", promptEmphasis: `${art[0].toUpperCase()}${art.slice(1)} ${name}`, promptTail: "has how many half-steps?" };
  }
  return { promptLead: "How many semitones are in", promptEmphasis: `${art} ${name}`, promptTail: "?" };
}

function stepsToNamePrompt(interval: Interval): Pick<Question, "promptLead" | "promptEmphasis" | "promptTail"> {
  const n = interval.steps;
  const roll = Math.random();
  if (roll < 0.5) {
    return { promptLead: "Which interval has", promptEmphasis: stepsPhrase(n), promptTail: "?" };
  }
  if (roll < 0.8) {
    return { promptLead: "What interval spans", promptEmphasis: stepsPhrase(n), promptTail: "?" };
  }
  return { promptLead: "", promptEmphasis: stepsPhrase(n), promptTail: "make up which interval?" };
}

export function makeQuestion(
  interval: Interval,
  kind: PromptKind,
  pool: Interval[],
): Question {
  const lower = randomNaturalRoot(interval.steps);
  const upper = spellUpper(lower, interval);
  const prompt = kind === "name-to-steps" ? nameToStepsPrompt(interval) : stepsToNamePrompt(interval);
  return {
    id: crypto.randomUUID(),
    kind,
    interval,
    ...prompt,
    answer: kind === "name-to-steps" ? String(interval.steps) : interval.id,
    choices: kind === "name-to-steps" ? stepChoices(interval.steps) : nameChoices(interval, pool),
    lower,
    upper,
  };
}

export function makeSession(opts: {
  direction: Direction;
  range: Range;
  length: number;
  stats: Record<string, IntervalStats>;
  onlyIds?: IntervalId[];
}): Question[] {
  const pool = opts.onlyIds?.length
    ? opts.onlyIds.map((id) => INTERVAL_BY_ID[id]).filter(Boolean)
    : poolFor(opts.range);
  const questions: Question[] = [];
  let lastId: IntervalId | null = null;

  for (let i = 0; i < opts.length; i += 1) {
    let interval = pickWeighted(pool, opts.stats);
    if (pool.length > 1 && interval.id === lastId) {
      interval = pickWeighted(
        pool.filter((item) => item.id !== lastId),
        opts.stats,
      );
    }
    const kind: PromptKind =
      opts.direction === "both"
        ? Math.random() < 0.5
          ? "name-to-steps"
          : "steps-to-name"
        : opts.direction;
    questions.push(makeQuestion(interval, kind, pool.length >= 4 ? pool : poolFor(opts.range)));
    lastId = interval.id;
  }
  return questions;
}

export interface CardResult {
  question: Question;
  picked: string;
  correct: boolean;
}
