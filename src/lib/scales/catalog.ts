import {
  accidentalGlyph,
  type Letter,
  naturalMidi,
  noteLabel,
  spellBy,
  type SpelledNote,
} from "@/lib/intervals/catalog";

export const ROOTS: Letter[] = ["A", "B", "C", "D", "E", "F", "G"];

export type Degree = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type Alteration = -1 | 0 | 1;
export type AlterMap = Record<Degree, Alteration>;

export const DEGREES: Degree[] = [1, 2, 3, 4, 5, 6, 7];
export const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11] as const;

export const ZERO_ALTS: AlterMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };

export type ScaleId =
  | "major"
  | "mixolydian"
  | "lydian"
  | "dorian"
  | "natural-minor"
  | "harmonic-minor"
  | "melodic-minor"
  | "phrygian"
  | "locrian";

export type ScaleQuality = ScaleId;

export type ScaleFilter = ScaleId | "minor";

export interface Tonic {
  id: string;
  letter: Letter;
  accidental: number;
  name: string;
}

export const TONICS: Tonic[] = [
  { id: "C", letter: "C", accidental: 0, name: "C" },
  { id: "G", letter: "G", accidental: 0, name: "G" },
  { id: "F", letter: "F", accidental: 0, name: "F" },
  { id: "D", letter: "D", accidental: 0, name: "D" },
  { id: "Bb", letter: "B", accidental: -1, name: "B♭" },
  { id: "A", letter: "A", accidental: 0, name: "A" },
  { id: "Eb", letter: "E", accidental: -1, name: "E♭" },
  { id: "E", letter: "E", accidental: 0, name: "E" },
];

export interface ScaleKind {
  id: ScaleId;
  name: string;
  label: string;
  stage: 0 | 1 | 2 | 3 | 4 | 5;
  alterations: AlterMap;
  character: string;
  functions: string[];
  tooltip?: string;
}

function alts(patch: Partial<AlterMap>): AlterMap {
  return { ...ZERO_ALTS, ...patch };
}

export const SCALE_KINDS: ScaleKind[] = [
  {
    id: "major",
    name: "major",
    label: "Major",
    stage: 0,
    alterations: ZERO_ALTS,
    character: "The home scale — every degree unaltered.",
    functions: [],
  },
  {
    id: "mixolydian",
    name: "mixolydian",
    label: "Mixolydian",
    stage: 1,
    alterations: alts({ 7: -1 }),
    character: "Major with dominant 7th color.",
    functions: ["Major 3rd, minor 7th."],
  },
  {
    id: "lydian",
    name: "lydian",
    label: "Lydian",
    stage: 1,
    alterations: alts({ 4: 1 }),
    character: "Major with ♯4 — the brightest mode.",
    functions: ["Major 3rd and a raised 4th."],
  },
  {
    id: "dorian",
    name: "dorian",
    label: "Dorian",
    stage: 2,
    alterations: alts({ 3: -1, 7: -1 }),
    character: "Minor with a raised 6th.",
    functions: ["Minor 3rd, major 6th, minor 7th."],
  },
  {
    id: "natural-minor",
    name: "natural minor",
    label: "Natural minor",
    stage: 2,
    alterations: alts({ 3: -1, 6: -1, 7: -1 }),
    character: "Natural minor — the parallel minor.",
    functions: ["Natural minor."],
  },
  {
    id: "harmonic-minor",
    name: "harmonic minor",
    label: "Harmonic minor",
    stage: 3,
    alterations: alts({ 3: -1, 6: -1 }),
    character: "Minor tonic with a leading tone into the tonic.",
    functions: ["Minor tonic triad, but keep a leading tone into the tonic."],
  },
  {
    id: "melodic-minor",
    name: "melodic minor",
    label: "Melodic minor",
    stage: 3,
    alterations: alts({ 3: -1 }),
    character: "Jazz / ascending melodic minor — only the 3rd is lowered.",
    functions: [],
    tooltip: "Classical version raises 6 and 7 going up, and lowers them going down.",
  },
  {
    id: "phrygian",
    name: "phrygian",
    label: "Phrygian",
    stage: 4,
    alterations: alts({ 2: -1, 3: -1, 6: -1, 7: -1 }),
    character: "Minor with a flat 2 — Spanish color.",
    functions: [],
  },
  {
    id: "locrian",
    name: "locrian",
    label: "Locrian",
    stage: 5,
    alterations: alts({ 2: -1, 3: -1, 5: -1, 6: -1, 7: -1 }),
    character: "The unstable mode — diminished tonic triad.",
    functions: [],
  },
];

export const KIND_BY_ID = Object.fromEntries(SCALE_KINDS.map((kind) => [kind.id, kind])) as Record<ScaleId, ScaleKind>;

export const FILTERS: { id: ScaleFilter; label: string }[] = [
  { id: "major", label: "Major" },
  { id: "mixolydian", label: "Mixolydian" },
  { id: "lydian", label: "Lydian" },
  { id: "dorian", label: "Dorian" },
  { id: "minor", label: "Minor" },
  { id: "natural-minor", label: "Natural minor" },
  { id: "harmonic-minor", label: "Harmonic minor" },
  { id: "melodic-minor", label: "Melodic minor" },
  { id: "phrygian", label: "Phrygian" },
  { id: "locrian", label: "Locrian" },
];

export const ALL_FILTERS: ScaleFilter[] = FILTERS.map((item) => item.id);
export const SEVEN_NOTE: ScaleFilter[] = [...ALL_FILTERS];

const FILTER_QUALITIES: Record<ScaleFilter, ScaleId[]> = {
  major: ["major"],
  mixolydian: ["mixolydian"],
  lydian: ["lydian"],
  dorian: ["dorian"],
  minor: ["natural-minor"],
  "natural-minor": ["natural-minor"],
  "harmonic-minor": ["harmonic-minor"],
  "melodic-minor": ["melodic-minor"],
  phrygian: ["phrygian"],
  locrian: ["locrian"],
};

export const QUALITY_META: Record<ScaleId, { label: string; short: string; button: string; hint: string }> = Object.fromEntries(
  SCALE_KINDS.map((kind) => [
    kind.id,
    {
      label: kind.name,
      short: kind.id,
      button: kind.id === "natural-minor" ? "Minor" : kind.label.replace(" / Ionian", "").replace(" / Aeolian", ""),
      hint: kind.character,
    },
  ]),
) as Record<ScaleId, { label: string; short: string; button: string; hint: string }>;

export function makeTonicNote(tonic: Tonic, octave = 4): SpelledNote {
  const midi = naturalMidi(tonic.letter, octave) + tonic.accidental;
  return { letter: tonic.letter, accidental: tonic.accidental, octave, midi };
}

export function degreePitch(tonic: SpelledNote, degree: Degree, alteration: Alteration): SpelledNote {
  return spellBy(tonic, degree - 1, MAJOR_STEPS[degree - 1] + alteration);
}

export function octavePitch(tonic: SpelledNote): SpelledNote {
  return spellBy(tonic, 7, 12);
}

export function scaleNotes(tonic: Tonic, alterations: AlterMap): SpelledNote[] {
  const root = makeTonicNote(tonic);
  return DEGREES.map((degree) => degreePitch(root, degree, alterations[degree]));
}

export function displayName(note: SpelledNote, alteration: Alteration, major: SpelledNote): string {
  if (alteration !== 0 && note.accidental === 0 && major.accidental !== 0) {
    return `${note.letter}♮`;
  }
  return `${note.letter}${accidentalGlyph(note.accidental)}`;
}

export function degreeTag(degree: Degree | 8, alteration: Alteration): string {
  if (degree === 8) return "1";
  if (alteration === -1) return `♭${degree}`;
  if (alteration === 1) return `♯${degree}`;
  return String(degree);
}

export function formulaStrip(alterations: AlterMap): string {
  return `${DEGREES.map((degree) => degreeTag(degree, alterations[degree])).join("  ")}  1`;
}

export function triadQuality(alterations: AlterMap): "major" | "minor" | "diminished" {
  if (alterations[5] === -1) return "diminished";
  if (alterations[3] === -1) return "minor";
  return "major";
}

export function intervalCallout(degree: Degree, alteration: Alteration): string {
  const quality =
    degree === 4 || degree === 5
      ? alteration === -1
        ? "diminished"
        : alteration === 1
          ? "augmented"
          : "perfect"
      : alteration === -1
        ? "minor"
        : alteration === 1
          ? "augmented"
          : "major";
  const names: Record<Degree, string> = {
    1: "unison",
    2: "2nd",
    3: "3rd",
    4: "4th",
    5: "5th",
    6: "6th",
    7: "7th",
  };
  return `${names[degree]} is now ${quality}`;
}

export function lockedDegrees(kind: ScaleKind): Set<number> {
  const lock = new Set<number>([1, 8]);
  if (kind.stage < 4) {
    lock.add(2);
    lock.add(5);
  }
  return lock;
}

export function identifyScale(alterations: AlterMap): ScaleKind | undefined {
  return SCALE_KINDS.find((kind) => DEGREES.every((degree) => kind.alterations[degree] === alterations[degree]));
}

export function shapeInstruction(kind: ScaleKind): string {
  const flats = DEGREES.filter((degree) => kind.alterations[degree] === -1);
  const sharps = DEGREES.filter((degree) => kind.alterations[degree] === 1);
  const chunks: string[] = [];
  if (flats.length) chunks.push(`Flatten ${joinList(flats.map(String))}`);
  if (sharps.length) chunks.push(`${flats.length ? "raise" : "Raise"} ${joinList(sharps.map(String))}`);
  if (chunks.length === 0) return "Leave every degree as in major.";
  return `${chunks.join(" and ")}.`;
}

function joinList(items: string[]): string {
  if (items.length === 1) return items[0];
  if (items.length === 2) return items.join(" and ");
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function diagnose(player: AlterMap, target: ScaleKind): string {
  const wrong = DEGREES.filter((degree) => player[degree] !== target.alterations[degree]);
  const matched = identifyScale(player);
  const good = DEGREES.filter((degree) => player[degree] === target.alterations[degree] && target.alterations[degree] !== 0);

  if (wrong.length === 0) return "";

  if (matched && matched.id !== target.id && matched.id !== "major") {
    const extra = wrong.map((degree) => {
      const need = target.alterations[degree];
      const have = player[degree];
      if (need === -1 && have === 0) return `${degree} is still major`;
      if (need === 0 && have === -1) return `${degree} is flattened`;
      if (need === 1 && have === 0) return `${degree} is still natural`;
      if (need === 0 && have === 1) return `${degree} is still raised`;
      return `degree ${degree} is off`;
    });
    const praise = good.length ? `You flattened ${joinList(good.map(String))} — good — but ` : "";
    return `${praise}${extra[0]}, so this is ${matched.label}, not ${target.label}.`;
  }

  const degree = wrong[0];
  const need = target.alterations[degree];
  const have = player[degree];
  const haveWord = have === 0 ? "major" : have === -1 ? "flattened" : "raised";
  const needWord = need === -1 ? `♭${degree}` : need === 1 ? `♯${degree}` : `a natural ${degree}`;
  return `Degree ${degree} is still ${haveWord}. ${target.label} needs ${needWord}.`;
}

export interface ScaleDef {
  id: string;
  root: Letter;
  quality: ScaleId;
  name: string;
  notes: SpelledNote[];
  hint: string;
}

function makeScale(root: Letter, quality: ScaleId): ScaleDef {
  const kind = KIND_BY_ID[quality];
  const tonic: Tonic = { id: root, letter: root, accidental: 0, name: root };
  const notes = scaleNotes(tonic, kind.alterations);
  return {
    id: `${root}-${quality}`,
    root,
    quality,
    name: `${root} ${kind.name}`,
    notes,
    hint: kind.character,
  };
}

const SPELL_IDS: ScaleId[] = SCALE_KINDS.map((kind) => kind.id);

export const SCALES: ScaleDef[] = ROOTS.flatMap((root) => SPELL_IDS.map((quality) => makeScale(root, quality)));

export const SCALE_BY_ID = Object.fromEntries(SCALES.map((scale) => [scale.id, scale]));

export function qualitiesFor(filters: ScaleFilter[]): ScaleId[] {
  const seen = new Set<ScaleId>();
  const list: ScaleId[] = [];
  for (const filter of filters) {
    for (const quality of FILTER_QUALITIES[filter] ?? []) {
      if (seen.has(quality)) continue;
      seen.add(quality);
      list.push(quality);
    }
  }
  return list;
}

export function scalesFor(filters: ScaleFilter[]): ScaleDef[] {
  const wanted = new Set(qualitiesFor(filters));
  return SCALES.filter((scale) => wanted.has(scale.quality));
}

export function notesPhrase(scale: ScaleDef): string {
  return scale.notes.map((note) => noteLabel(note, false)).join(" · ");
}

export function buttonLabel(quality: ScaleId, _filters: ScaleFilter[]): string {
  return QUALITY_META[quality].button;
}

export const LADDER: ScaleId[] = [
  "lydian",
  "major",
  "mixolydian",
  "dorian",
  "natural-minor",
  "phrygian",
  "locrian",
];

export const LADDER_PROMPTS = [
  "This is Lydian — the brightest. Flatten ♯4 to reach major (Ionian).",
  "Flatten 7 — Mixolydian.",
  "Flatten 3 — Dorian.",
  "Flatten 6 — Aeolian (natural minor).",
  "Flatten 2 — Phrygian.",
  "Flatten 5 — Locrian.",
];
