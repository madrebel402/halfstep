import { accidentalGlyph, type Letter } from "@/lib/intervals/catalog";

export interface CircleStep {
  id: string;
  slot: number;
  letter: Letter;
  accidental: number;
  count: number;
  kind: "sharp" | "flat";
  role: "major" | "minor";
  /** Major key this minor belongs to. Majors leave it blank. */
  of: string;
}

function step(slot: number, letter: Letter, accidental: number, count: number, kind: "sharp" | "flat"): CircleStep {
  return { id: `${kind}-${letter}${accidental}`, slot, letter, accidental, count, kind, role: "major", of: "" };
}

function minor(slot: number, letter: Letter, accidental: number, count: number, kind: "sharp" | "flat", of: string): CircleStep {
  return { id: `minor-${kind}-${letter}${accidental}`, slot, letter, accidental, count, kind, role: "minor", of };
}

/** Clockwise from C: one more sharp each step. */
export const FIFTHS: CircleStep[] = [
  step(1, "G", 0, 1, "sharp"),
  step(2, "D", 0, 2, "sharp"),
  step(3, "A", 0, 3, "sharp"),
  step(4, "E", 0, 4, "sharp"),
  step(5, "B", 0, 5, "sharp"),
  step(6, "F", 1, 6, "sharp"),
  step(7, "C", 1, 7, "sharp"),
];

/** Counterclockwise from C: one more flat each step. */
export const FOURTHS: CircleStep[] = [
  step(11, "F", 0, 1, "flat"),
  step(10, "B", -1, 2, "flat"),
  step(9, "E", -1, 3, "flat"),
  step(8, "A", -1, 4, "flat"),
  step(7, "D", -1, 5, "flat"),
  step(6, "G", -1, 6, "flat"),
  step(5, "C", -1, 7, "flat"),
];

/** Relative minor of each major, same signature. Sharp side, then flat side. */
export const MINORS: CircleStep[] = [
  minor(0, "A", 0, 0, "sharp", "C"),
  minor(1, "E", 0, 1, "sharp", "G"),
  minor(2, "B", 0, 2, "sharp", "D"),
  minor(3, "F", 1, 3, "sharp", "A"),
  minor(4, "C", 1, 4, "sharp", "E"),
  minor(5, "G", 1, 5, "sharp", "B"),
  minor(6, "D", 1, 6, "sharp", "F♯"),
  minor(7, "A", 1, 7, "sharp", "C♯"),
  minor(11, "D", 0, 1, "flat", "F"),
  minor(10, "G", 0, 2, "flat", "B♭"),
  minor(9, "C", 0, 3, "flat", "E♭"),
  minor(8, "F", 0, 4, "flat", "A♭"),
  minor(7, "B", -1, 5, "flat", "D♭"),
  minor(6, "E", -1, 6, "flat", "G♭"),
  minor(5, "A", -1, 7, "flat", "C♭"),
];

export const CIRCLE_STEPS: CircleStep[] = [...FIFTHS, ...FOURTHS, ...MINORS];

export function stepName(item: Pick<CircleStep, "letter" | "accidental">): string {
  return `${item.letter}${accidentalGlyph(item.accidental)}`;
}

export function countMark(item: Pick<CircleStep, "count" | "kind">): string {
  if (item.count === 0) return "0";
  return `${item.count}${item.kind === "sharp" ? "♯" : "♭"}`;
}

/** The key this step moves away from. C for the first step in each direction. */
export function comesAfter(item: CircleStep): string {
  const prev = item.kind === "sharp" ? (item.slot + 11) % 12 : (item.slot + 1) % 12;
  if (prev === 0) return "C";
  const prior = CIRCLE_STEPS.find((step) => step.role === "major" && step.slot === prev && step.kind === item.kind);
  return prior ? stepName(prior) : "C";
}
