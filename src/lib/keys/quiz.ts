import type { IntervalStats } from "@/lib/intervals/quiz";
import type { Letter } from "@/lib/intervals/catalog";
import {
  countPhrase,
  KEY_BY_ID,
  KEYS,
  MEMORY,
  MEMORY_BY_ID,
  MNEMONIC_USES,
  notesPhrase,
  type KeySig,
  type MemoryDef,
} from "./catalog";

export type KeyPromptKind = "key-to-count" | "count-to-key" | "memory";
export type KeyInput = "count" | "key-name" | "choices";
export type BonusMode = "select-notes" | "key-name";

export interface KeyChoice {
  value: string;
  label: string;
}

export interface KeyBonus {
  mode: BonusMode;
  prompt: string;
  answer: string;
  letters: Letter[];
  kind: "sharp" | "flat";
  reveal: string;
  answerLetter?: Letter;
  answerAccidental?: number;
}

export interface KeyQuestion {
  id: string;
  kind: KeyPromptKind;
  input: KeyInput;
  topicId: string;
  promptLead: string;
  promptEmphasis: string;
  promptTail: string;
  answer: string;
  choices: KeyChoice[];
  reveal: string;
  bonus: KeyBonus | null;
  answerLetter?: Letter;
  answerAccidental?: number;
  answerCount?: number;
}

export interface KeyResult {
  question: KeyQuestion;
  picked: string;
  correct: boolean;
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
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

function notesBonus(key: KeySig): KeyBonus | null {
  if (key.kind === "none") return null;
  const unit = key.kind === "flat" ? "flat" : "sharp";
  return {
    mode: "select-notes",
    prompt: `Select which notes are ${unit} in ${key.name}.`,
    answer: notesPhrase(key),
    letters: key.letters,
    kind: key.kind,
    reveal: `${key.name} · ${notesPhrase(key)}`,
  };
}

function keyToCount(key: KeySig): KeyQuestion {
  const art = /^[aeiou]/i.test(key.name) ? "an" : "a";
  const roll = Math.random();
  const prompt =
    key.kind === "none"
      ? {
          promptLead: "How many sharps or flats are in",
          promptEmphasis: key.name,
          promptTail: "?",
        }
      : roll < 0.5
        ? {
            promptLead: `How many ${key.kind === "flat" ? "flats" : "sharps"} are in`,
            promptEmphasis: key.name,
            promptTail: "?",
          }
        : {
            promptLead: "",
            promptEmphasis: `${art[0].toUpperCase()}${art.slice(1)} ${key.name}`,
            promptTail: `has how many ${key.kind === "flat" ? "flats" : "sharps"}?`,
          };

  return {
    id: crypto.randomUUID(),
    kind: "key-to-count",
    input: "count",
    topicId: key.id,
    ...prompt,
    answer: String(key.count),
    choices: [],
    reveal: `${key.name} has ${countPhrase(key)}.`,
    bonus: notesBonus(key),
    answerCount: key.count,
  };
}

function countToKey(key: KeySig): KeyQuestion {
  const phrase = countPhrase(key);
  const roll = Math.random();
  const prompt =
    roll < 0.5
      ? {
          promptLead: "Which key has",
          promptEmphasis: phrase,
          promptTail: "?",
        }
      : {
          promptLead: "",
          promptEmphasis: phrase[0].toUpperCase() + phrase.slice(1),
          promptTail: "is which major key?",
        };

  return {
    id: crypto.randomUUID(),
    kind: "count-to-key",
    input: "key-name",
    topicId: key.id,
    ...prompt,
    answer: key.name.replace(" major", ""),
    choices: [],
    reveal: `${key.name} has ${phrase}.`,
    bonus: notesBonus(key),
    answerLetter: key.letter,
    answerAccidental: key.accidental,
  };
}

function memoryBonus(def: MemoryDef): KeyBonus {
  if (def.bonusKind === "select-sharps") {
    return {
      mode: "select-notes",
      prompt: "Select which notes are sharp in a key with 4 sharps.",
      answer: "F♯ · C♯ · G♯ · D♯",
      letters: ["F", "C", "G", "D"],
      kind: "sharp",
      reveal: "E major has 4 sharps: F♯ · C♯ · G♯ · D♯.",
    };
  }
  if (def.bonusKind === "select-flats") {
    return {
      mode: "select-notes",
      prompt: "Select which notes are flat in a key with 3 flats.",
      answer: "B♭ · E♭ · A♭",
      letters: ["B", "E", "A"],
      kind: "flat",
      reveal: "E♭ major has 3 flats: B♭ · E♭ · A♭.",
    };
  }
  if (def.bonusKind === "key-name-flats") {
    return {
      mode: "key-name",
      prompt: "Which major key has 3 flats?",
      answer: "E♭",
      letters: [],
      kind: "flat",
      reveal: "E♭ major has 3 flats.",
      answerLetter: "E",
      answerAccidental: -1,
    };
  }
  return {
    mode: "key-name",
    prompt: "Which major key has 5 sharps?",
    answer: "B",
    letters: [],
    kind: "sharp",
    reveal: "B major has 5 sharps.",
    answerLetter: "B",
    answerAccidental: 0,
  };
}

function memoryQuestion(def: MemoryDef): KeyQuestion {
  return {
    id: crypto.randomUUID(),
    kind: "memory",
    input: "choices",
    topicId: def.id,
    promptLead: "What is this mnemonic used for?",
    promptEmphasis: def.phrase,
    promptTail: "",
    answer: def.useLabel,
    choices: shuffle(MNEMONIC_USES.map((item) => ({ value: item.label, label: item.label }))),
    reveal: def.reveal,
    bonus: memoryBonus(def),
  };
}

export function makeKeySession(opts: {
  length: number;
  stats: Record<string, IntervalStats>;
  onlyIds?: string[];
}): KeyQuestion[] {
  const keyPool = opts.onlyIds?.length ? opts.onlyIds.map((id) => KEY_BY_ID[id]).filter(Boolean) : KEYS;
  const memoryPool = opts.onlyIds?.length ? opts.onlyIds.map((id) => MEMORY_BY_ID[id]).filter(Boolean) : MEMORY;

  const questions: KeyQuestion[] = [];
  let lastId: string | null = null;
  const wantMemory =
    memoryPool.length > 0 && keyPool.length > 0
      ? Math.min(3, Math.ceil(opts.length * 0.3))
      : memoryPool.length > 0
        ? opts.length
        : 0;

  const memoryUsed = new Set<string>();

  for (let i = 0; i < opts.length; i += 1) {
    const preferMemory = i < wantMemory && memoryUsed.size < memoryPool.length;
    if (preferMemory) {
      const remaining = memoryPool.filter((item) => !memoryUsed.has(item.id));
      const def = pickWeighted(remaining, opts.stats);
      memoryUsed.add(def.id);
      questions.push(memoryQuestion(def));
      lastId = def.id;
      continue;
    }

    const source = keyPool.length > 0 ? keyPool : KEYS;
    let key = pickWeighted(source, opts.stats);
    if (source.length > 1 && key.id === lastId) {
      key = pickWeighted(
        source.filter((item) => item.id !== lastId),
        opts.stats,
      );
    }
    const make = Math.random() < 0.5 ? keyToCount : countToKey;
    questions.push(make(key));
    lastId = key.id;
  }

  return shuffle(questions);
}
