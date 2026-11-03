export const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;
export type Letter = (typeof LETTERS)[number];

export const LETTER_PC = [0, 2, 4, 5, 7, 9, 11] as const;
export const BLACK_PCS = new Set([1, 3, 6, 8, 10]);

export type IntervalId =
  | "P1"
  | "m2"
  | "M2"
  | "m3"
  | "M3"
  | "P4"
  | "TT"
  | "P5"
  | "m6"
  | "M6"
  | "m7"
  | "M7"
  | "P8";

export interface Interval {
  id: IntervalId;
  name: string;
  shortName: string;
  steps: number;
  /** Diatonic letter distance (unison = 0, second = 1, …). Tritone is spelled as an augmented fourth. */
  diatonic: number;
  core: boolean;
  quality: "perfect" | "major" | "minor" | "tritone";
  degree: number | null;
}

export const INTERVALS: Interval[] = [
  { id: "P1", name: "perfect unison", shortName: "P1", steps: 0, diatonic: 0, core: false, quality: "perfect", degree: 1 },
  { id: "m2", name: "minor second", shortName: "m2", steps: 1, diatonic: 1, core: true, quality: "minor", degree: 2 },
  { id: "M2", name: "major second", shortName: "M2", steps: 2, diatonic: 1, core: true, quality: "major", degree: 2 },
  { id: "m3", name: "minor third", shortName: "m3", steps: 3, diatonic: 2, core: true, quality: "minor", degree: 3 },
  { id: "M3", name: "major third", shortName: "M3", steps: 4, diatonic: 2, core: true, quality: "major", degree: 3 },
  { id: "P4", name: "perfect fourth", shortName: "P4", steps: 5, diatonic: 3, core: true, quality: "perfect", degree: 4 },
  { id: "TT", name: "tritone", shortName: "TT", steps: 6, diatonic: 3, core: false, quality: "tritone", degree: null },
  { id: "P5", name: "perfect fifth", shortName: "P5", steps: 7, diatonic: 4, core: true, quality: "perfect", degree: 5 },
  { id: "m6", name: "minor sixth", shortName: "m6", steps: 8, diatonic: 5, core: false, quality: "minor", degree: 6 },
  { id: "M6", name: "major sixth", shortName: "M6", steps: 9, diatonic: 5, core: false, quality: "major", degree: 6 },
  { id: "m7", name: "minor seventh", shortName: "m7", steps: 10, diatonic: 6, core: false, quality: "minor", degree: 7 },
  { id: "M7", name: "major seventh", shortName: "M7", steps: 11, diatonic: 6, core: false, quality: "major", degree: 7 },
  { id: "P8", name: "perfect octave", shortName: "P8", steps: 12, diatonic: 7, core: true, quality: "perfect", degree: 8 },
];

export const INTERVAL_BY_ID = Object.fromEntries(INTERVALS.map((interval) => [interval.id, interval])) as Record<
  IntervalId,
  Interval
>;

export function poolFor(range: "core" | "full"): Interval[] {
  return range === "core" ? INTERVALS.filter((interval) => interval.core) : INTERVALS;
}

export interface SpelledNote {
  letter: Letter;
  accidental: number;
  octave: number;
  midi: number;
}

export function accidentalGlyph(accidental: number): string {
  if (accidental <= -2) return "𝄫";
  if (accidental === -1) return "♭";
  if (accidental === 1) return "♯";
  if (accidental >= 2) return "𝄪";
  return "";
}

export function noteLabel(note: SpelledNote, withOctave = true): string {
  const body = `${note.letter}${accidentalGlyph(note.accidental)}`;
  return withOctave ? `${body}${note.octave}` : body;
}

export function naturalMidi(letter: Letter, octave: number): number {
  return (octave + 1) * 12 + LETTER_PC[LETTERS.indexOf(letter)];
}

export function diatonicOffset(note: SpelledNote): number {
  return note.octave * 7 + LETTERS.indexOf(note.letter);
}

export function spellBy(root: SpelledNote, diatonic: number, steps: number): SpelledNote {
  const rootIndex = LETTERS.indexOf(root.letter);
  const stepped = rootIndex + diatonic;
  const letter = LETTERS[stepped % 7];
  const octave = root.octave + Math.floor(stepped / 7);
  const midi = root.midi + steps;
  return {
    letter,
    accidental: midi - naturalMidi(letter, octave),
    octave,
    midi,
  };
}

export function spellUpper(root: SpelledNote, interval: Interval): SpelledNote {
  return spellBy(root, interval.diatonic, interval.steps);
}

export function randomNaturalRoot(steps: number): SpelledNote {
  const letters = [...LETTERS];
  const letter = letters[Math.floor(Math.random() * letters.length)];
  let octave = 4;
  const midi = naturalMidi(letter, octave);
  if (midi + steps > 81) {
    const low: Letter[] = ["C", "D", "E", "F"];
    const safer = low[Math.floor(Math.random() * low.length)];
    return { letter: safer, accidental: 0, octave: 4, midi: naturalMidi(safer, 4) };
  }
  return { letter, accidental: 0, octave, midi };
}

export function stepsPhrase(n: number): string {
  return n === 1 ? "1 half-step" : `${n} half-steps`;
}

export function articleFor(name: string): string {
  return /^[aeiou]/i.test(name) ? "an" : "a";
}

export type IntervalQuality = Interval["quality"];

export function intervalFromParts(quality: IntervalQuality, degree: number | null): Interval | null {
  if (quality === "tritone") return INTERVAL_BY_ID.TT;
  if (degree === null) return null;
  return INTERVALS.find((interval) => interval.quality === quality && interval.degree === degree) ?? null;
}
