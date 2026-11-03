import { CHORD_BY_ID, CHORDS, type ChordQuality } from "@/lib/chords/catalog";
import { accidentalGlyph, type Letter } from "@/lib/intervals/catalog";
import type { IntervalStats } from "@/lib/intervals/quiz";

export type Inversion = 0 | 1 | 2;
export type InversionKind = "name" | "build";

export interface Spelled {
  letter: Letter;
  accidental: number;
}

export interface InversionQuestion {
  id: string;
  kind: InversionKind;
  chordId: string;
  chordName: string;
  inversion: Inversion;
  notes: Spelled[];
}

export interface InversionResult {
  question: InversionQuestion;
  correct: boolean;
}

const LABELS = ["Root", "1st", "2nd"] as const;
const QUALITIES = new Set<ChordQuality>(["major", "minor", "augmented", "diminished"]);

export function inversionLabel(inversion: Inversion): string {
  return LABELS[inversion];
}

export function noteGlyph(note: Spelled): string {
  return `${note.letter}${accidentalGlyph(note.accidental)}`;
}

function rotate(notes: Spelled[], inversion: Inversion): Spelled[] {
  return [...notes.slice(inversion), ...notes.slice(0, inversion)];
}

function questionFor(chordId: string, inversion: Inversion, kind: InversionKind): InversionQuestion | null {
  const chord = CHORD_BY_ID[chordId];
  if (!chord || !QUALITIES.has(chord.quality)) return null;
  const tones = chord.notes.map((note) => ({ letter: note.letter, accidental: note.accidental }));
  return {
    id: `${chord.id}-${inversion}-${kind}`,
    kind,
    chordId: chord.id,
    chordName: chord.name,
    inversion,
    notes: rotate(tones, inversion),
  };
}

function pool(): InversionQuestion[] {
  const list: InversionQuestion[] = [];
  for (const chord of CHORDS) {
    if (!QUALITIES.has(chord.quality)) continue;
    for (const inversion of [0, 1, 2] as Inversion[]) {
      for (const kind of ["name", "build"] as InversionKind[]) {
        const made = questionFor(chord.id, inversion, kind);
        if (made) list.push(made);
      }
    }
  }
  return list;
}

function shuffle<T>(list: T[]): T[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function makeInversionSession(opts: {
  length: number;
  stats: Record<string, IntervalStats>;
  onlyIds?: string[];
}): InversionQuestion[] {
  const all = pool();
  if (opts.onlyIds?.length) {
    const wanted = new Set(opts.onlyIds);
    const picked = all.filter((item) => wanted.has(item.id));
    return picked.length ? shuffle(picked) : shuffle(all).slice(0, opts.length);
  }
  const fresh = all.filter((item) => (opts.stats[item.id]?.seen ?? 0) < 2);
  return shuffle(fresh.length >= opts.length ? fresh : all).slice(0, opts.length);
}
