import {
  type Letter,
  naturalMidi,
  noteLabel,
  spellBy,
  type SpelledNote,
} from "@/lib/intervals/catalog";

export const ROOT_LETTERS: Letter[] = ["A", "B", "C", "D", "E", "F", "G"];

export type ChordFilter = "major" | "minor" | "augmented" | "diminished" | "seventh";

export type ChordQuality = "major" | "minor" | "augmented" | "diminished" | "dom7" | "maj7" | "min7";

export const FILTERS: { id: ChordFilter; label: string }[] = [
  { id: "major", label: "Major" },
  { id: "minor", label: "Minor" },
  { id: "augmented", label: "Augmented" },
  { id: "diminished", label: "Diminished" },
  { id: "seventh", label: "7th chords" },
];

export const ALL_FILTERS: ChordFilter[] = FILTERS.map((item) => item.id);

const FILTER_QUALITIES: Record<ChordFilter, ChordQuality[]> = {
  major: ["major"],
  minor: ["minor"],
  augmented: ["augmented"],
  diminished: ["diminished"],
  seventh: ["dom7", "maj7", "min7"],
};

/** Diatonic steps from the root, then semitone distance. */
const INTERVALS: Record<ChordQuality, [diatonic: number, steps: number][]> = {
  major: [
    [2, 4],
    [4, 7],
  ],
  minor: [
    [2, 3],
    [4, 7],
  ],
  augmented: [
    [2, 4],
    [4, 8],
  ],
  diminished: [
    [2, 3],
    [4, 6],
  ],
  dom7: [
    [2, 4],
    [4, 7],
    [6, 10],
  ],
  maj7: [
    [2, 4],
    [4, 7],
    [6, 11],
  ],
  min7: [
    [2, 3],
    [4, 7],
    [6, 10],
  ],
};

export const QUALITY_META: Record<
  ChordQuality,
  { filter: ChordFilter; label: string; short: string; hint: string; button: string }
> = {
  major: {
    filter: "major",
    label: "major",
    short: "maj",
    button: "Major",
    hint: "A major chord has a major 3rd and a perfect 5th.",
  },
  minor: {
    filter: "minor",
    label: "minor",
    short: "min",
    button: "Minor",
    hint: "A minor chord has a minor 3rd and a perfect 5th.",
  },
  augmented: {
    filter: "augmented",
    label: "augmented",
    short: "aug",
    button: "Aug",
    hint: "An augmented chord has a major 3rd and an augmented 5th.",
  },
  diminished: {
    filter: "diminished",
    label: "diminished",
    short: "dim",
    button: "Dim",
    hint: "A diminished chord has a minor 3rd and a diminished 5th.",
  },
  dom7: {
    filter: "seventh",
    label: "7",
    short: "7",
    button: "7",
    hint: "A dominant 7th chord has a major 3rd, a perfect 5th, and a minor 7th.",
  },
  maj7: {
    filter: "seventh",
    label: "maj7",
    short: "maj7",
    button: "maj7",
    hint: "A major 7th chord has a major 3rd, a perfect 5th, and a major 7th.",
  },
  min7: {
    filter: "seventh",
    label: "m7",
    short: "m7",
    button: "m7",
    hint: "A minor 7th chord has a minor 3rd, a perfect 5th, and a minor 7th.",
  },
};

export interface ChordDef {
  id: string;
  root: Letter;
  quality: ChordQuality;
  name: string;
  notes: SpelledNote[];
  hint: string;
}

function chordName(root: Letter, quality: ChordQuality): string {
  if (quality === "dom7") return `${root}7`;
  if (quality === "maj7") return `${root}maj7`;
  if (quality === "min7") return `${root}m7`;
  return `${root} ${QUALITY_META[quality].label}`;
}

function makeChord(root: Letter, quality: ChordQuality): ChordDef {
  const lower: SpelledNote = {
    letter: root,
    accidental: 0,
    octave: 4,
    midi: naturalMidi(root, 4),
  };
  const notes = [lower, ...INTERVALS[quality].map(([diatonic, steps]) => spellBy(lower, diatonic, steps))];
  return {
    id: `${root}-${quality}`,
    root,
    quality,
    name: chordName(root, quality),
    notes,
    hint: QUALITY_META[quality].hint,
  };
}

export const CHORDS: ChordDef[] = ROOT_LETTERS.flatMap((root) =>
  (Object.keys(INTERVALS) as ChordQuality[]).map((quality) => makeChord(root, quality)),
);

export const CHORD_BY_ID = Object.fromEntries(CHORDS.map((chord) => [chord.id, chord]));

export function chordsFor(filters: ChordFilter[]): ChordDef[] {
  const wanted = new Set(filters.flatMap((filter) => FILTER_QUALITIES[filter] ?? []));
  return CHORDS.filter((chord) => wanted.has(chord.quality));
}

export function qualitiesFor(filters: ChordFilter[]): ChordQuality[] {
  const seen = new Set<ChordQuality>();
  const list: ChordQuality[] = [];
  for (const filter of filters) {
    for (const quality of FILTER_QUALITIES[filter] ?? []) {
      if (seen.has(quality)) continue;
      seen.add(quality);
      list.push(quality);
    }
  }
  return list;
}

export function notesPhrase(chord: ChordDef): string {
  return chord.notes.map((note) => noteLabel(note, false)).join(" · ");
}

export const SLOT_LABELS = ["Root", "3rd", "5th", "7th"];
