import type { Letter } from "@/lib/intervals/catalog";

export const SCALE_LETTERS: Letter[] = ["C", "D", "E", "F", "G", "A", "B"];

export type AccidentalKind = "sharp" | "flat" | "none";

export interface KeySig {
  id: string;
  name: string;
  kind: AccidentalKind;
  count: number;
  letter: Letter;
  accidental: number;
  letters: Letter[];
}

const SHARP_LETTERS: Letter[] = ["F", "C", "G", "D", "A", "E", "B"];
const FLAT_LETTERS: Letter[] = ["B", "E", "A", "D", "G", "C", "F"];

function parseLetter(raw: string): { letter: Letter; accidental: number } {
  const letter = raw[0] as Letter;
  if (raw.includes("♯")) return { letter, accidental: 1 };
  if (raw.includes("♭")) return { letter, accidental: -1 };
  return { letter, accidental: 0 };
}

function sharpKey(raw: string, count: number): KeySig {
  const { letter, accidental } = parseLetter(raw);
  return {
    id: `${raw.replace("♯", "s")}-maj`,
    name: `${raw} major`,
    kind: count === 0 ? "none" : "sharp",
    count,
    letter,
    accidental,
    letters: SHARP_LETTERS.slice(0, count),
  };
}

function flatKey(raw: string, count: number): KeySig {
  const { letter, accidental } = parseLetter(raw);
  return {
    id: `${raw.replace("♭", "b")}-maj`,
    name: `${raw} major`,
    kind: "flat",
    count,
    letter,
    accidental,
    letters: FLAT_LETTERS.slice(0, count),
  };
}

export const KEYS: KeySig[] = [
  sharpKey("C", 0),
  sharpKey("G", 1),
  sharpKey("D", 2),
  sharpKey("A", 3),
  sharpKey("E", 4),
  sharpKey("B", 5),
  sharpKey("F♯", 6),
  sharpKey("C♯", 7),
  flatKey("F", 1),
  flatKey("B♭", 2),
  flatKey("E♭", 3),
  flatKey("A♭", 4),
  flatKey("D♭", 5),
  flatKey("G♭", 6),
  flatKey("C♭", 7),
];

export const KEY_BY_ID = Object.fromEntries(KEYS.map((key) => [key.id, key]));

export function countPhrase(key: KeySig): string {
  if (key.count === 0) return "no sharps or flats";
  const unit = key.kind === "flat" ? "flat" : "sharp";
  return key.count === 1 ? `1 ${unit}` : `${key.count} ${unit}s`;
}

export function notesPhrase(key: KeySig): string {
  if (key.count === 0) return "none";
  const mark = key.kind === "flat" ? "♭" : "♯";
  return key.letters.map((letter) => `${letter}${mark}`).join(" · ");
}

export const MNEMONIC_SHARP_KEYS = "God Does An Excellent Back Flip Carefully";
export const MNEMONIC_SHARPS = "Father Charles Goes Down And Ends Battle";
export const MNEMONIC_FLATS = "Battle Ends And Down Goes Charles Father";
export const MNEMONIC_FLAT_KEYS = "Fat Boys Eat All Day Getting Candy";

export const MNEMONIC_USES = [
  { id: "order-sharps", label: "Order of sharps" },
  { id: "order-flats", label: "Order of flats" },
  { id: "sharp-keys", label: "Order of keys by # of sharps" },
  { id: "flat-keys", label: "Order of keys by # of flats" },
] as const;

export type MnemonicUseId = (typeof MNEMONIC_USES)[number]["id"];

export interface MemoryDef {
  id: string;
  phrase: string;
  useId: MnemonicUseId;
  useLabel: string;
  reveal: string;
  bonusKind: "select-sharps" | "select-flats" | "key-name-sharps" | "key-name-flats";
}

export const MEMORY: MemoryDef[] = [
  {
    id: "mem-father-charles",
    phrase: MNEMONIC_SHARPS,
    useId: "order-sharps",
    useLabel: "Order of sharps",
    reveal: "Father Charles Goes Down And Ends Battle is the order sharps are added: F C G D A E B.",
    bonusKind: "select-sharps",
  },
  {
    id: "mem-battle-ends",
    phrase: MNEMONIC_FLATS,
    useId: "order-flats",
    useLabel: "Order of flats",
    reveal: "Battle Ends And Down Goes Charles Father is the order flats are added: B E A D G C F.",
    bonusKind: "select-flats",
  },
  {
    id: "mem-god-does",
    phrase: MNEMONIC_SHARP_KEYS,
    useId: "sharp-keys",
    useLabel: "Order of keys by # of sharps",
    reveal: "God Does An Excellent Back Flip Carefully is the sharp keys from 1 to 7: G D A E B F♯ C♯.",
    bonusKind: "key-name-sharps",
  },
  {
    id: "mem-fat-boys",
    phrase: MNEMONIC_FLAT_KEYS,
    useId: "flat-keys",
    useLabel: "Order of keys by # of flats",
    reveal: "Fat Boys Eat All Day Getting Candy is the flat keys from 1 to 7: F B♭ E♭ A♭ D♭ G♭ C♭.",
    bonusKind: "key-name-flats",
  },
];

export const MEMORY_BY_ID = Object.fromEntries(MEMORY.map((item) => [item.id, item]));
