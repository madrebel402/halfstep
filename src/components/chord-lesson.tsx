import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import type { ChordFilter } from "@/lib/chords/catalog";
import { accidentalGlyph } from "@/lib/intervals/catalog";
import { QualityText } from "@/components/quality-text";
import { cn } from "@/lib/utils";

type Tone = { letter: string; accidental: number };

const CHROMATIC: Tone[] = [
  { letter: "C", accidental: 0 },
  { letter: "C", accidental: 1 },
  { letter: "D", accidental: 0 },
  { letter: "D", accidental: 1 },
  { letter: "E", accidental: 0 },
  { letter: "F", accidental: 0 },
  { letter: "F", accidental: 1 },
  { letter: "G", accidental: 0 },
  { letter: "G", accidental: 1 },
  { letter: "A", accidental: 0 },
  { letter: "A", accidental: 1 },
  { letter: "B", accidental: 0 },
];

function path(steps: number, goal: Tone): Tone[] {
  const notes = CHROMATIC.slice(0, steps + 1).map((note) => ({ ...note }));
  notes[notes.length - 1] = goal;
  return notes;
}

type Beat = {
  name: string;
  steps: number;
  detail: string;
  goal: Tone;
  result: string;
};

type Lesson = {
  id: ChordFilter;
  name: string;
  title: string;
  formula: string;
  intro: string;
  beats: Beat[];
  tones: { letter: string; accidental: number; label: string }[];
  closing: string;
  practice: string;
};

const LESSONS: Lesson[] = [
  {
    id: "major",
    name: "Major triad",
    title: "Let’s make a major chord.",
    formula: "Root + major 3rd + perfect 5th",
    intro: "Start on any root. The other two notes are intervals above it.",
    beats: [
      {
        name: "Major 3rd",
        steps: 4,
        detail: "Starting with your root, count up 4 half-steps to find the major 3rd.",
        goal: { letter: "E", accidental: 0 },
        result: "E is the major 3rd of C.",
      },
      {
        name: "Perfect 5th",
        steps: 7,
        detail: "Start from the root again, not from the 3rd. Count up 7 half-steps to find the perfect 5th.",
        goal: { letter: "G", accidental: 0 },
        result: "G is the perfect 5th of C.",
      },
    ],
    tones: [
      { letter: "C", accidental: 0, label: "Root" },
      { letter: "E", accidental: 0, label: "Major 3rd" },
      { letter: "G", accidental: 0, label: "Perfect 5th" },
    ],
    closing: "C, E, G. That is C major. Same recipe from any root.",
    practice: "Practice major chords",
  },
  {
    id: "minor",
    name: "Minor triad",
    title: "Let’s make a minor chord.",
    formula: "Root + minor 3rd + perfect 5th",
    intro: "A minor chord is a major chord with the 3rd lowered.",
    beats: [
      {
        name: "Minor 3rd",
        steps: 3,
        detail: "Starting with your root, count up 3 half-steps to find the minor 3rd.",
        goal: { letter: "E", accidental: -1 },
        result: "E♭ is the minor 3rd of C.",
      },
      {
        name: "Perfect 5th",
        steps: 7,
        detail: "Start from the root again. Count up 7 half-steps to find the perfect 5th.",
        goal: { letter: "G", accidental: 0 },
        result: "G is the perfect 5th of C.",
      },
    ],
    tones: [
      { letter: "C", accidental: 0, label: "Root" },
      { letter: "E", accidental: -1, label: "Minor 3rd" },
      { letter: "G", accidental: 0, label: "Perfect 5th" },
    ],
    closing: "C, E♭, G. That is C minor. Same recipe from any root.",
    practice: "Practice minor chords",
  },
  {
    id: "augmented",
    name: "Augmented triad",
    title: "Let’s make an augmented chord.",
    formula: "Root + major 3rd + augmented 5th",
    intro: "An augmented chord is a major chord with the 5th raised.",
    beats: [
      {
        name: "Major 3rd",
        steps: 4,
        detail: "Starting with your root, count up 4 half-steps to find the major 3rd.",
        goal: { letter: "E", accidental: 0 },
        result: "E is the major 3rd of C.",
      },
      {
        name: "Augmented 5th",
        steps: 8,
        detail: "Start from the root again. Count up 8 half-steps to find the augmented 5th.",
        goal: { letter: "G", accidental: 1 },
        result: "G♯ is the augmented 5th of C.",
      },
    ],
    tones: [
      { letter: "C", accidental: 0, label: "Root" },
      { letter: "E", accidental: 0, label: "Major 3rd" },
      { letter: "G", accidental: 1, label: "Augmented 5th" },
    ],
    closing: "C, E, G♯. That is C augmented. Same recipe from any root.",
    practice: "Practice augmented chords",
  },
  {
    id: "diminished",
    name: "Diminished triad",
    title: "Let’s make a diminished chord.",
    formula: "Root + minor 3rd + diminished 5th",
    intro: "Both the 3rd and the 5th sit lower than in a major chord.",
    beats: [
      {
        name: "Minor 3rd",
        steps: 3,
        detail: "Starting with your root, count up 3 half-steps to find the minor 3rd.",
        goal: { letter: "E", accidental: -1 },
        result: "E♭ is the minor 3rd of C.",
      },
      {
        name: "Diminished 5th",
        steps: 6,
        detail: "Start from the root again. Count up 6 half-steps to find the diminished 5th.",
        goal: { letter: "G", accidental: -1 },
        result: "G♭ is the diminished 5th of C.",
      },
    ],
    tones: [
      { letter: "C", accidental: 0, label: "Root" },
      { letter: "E", accidental: -1, label: "Minor 3rd" },
      { letter: "G", accidental: -1, label: "Diminished 5th" },
    ],
    closing: "C, E♭, G♭. That is C diminished. Same recipe from any root.",
    practice: "Practice diminished chords",
  },
  {
    id: "dom7",
    name: "Dominant 7",
    title: "Let’s make a dominant 7th.",
    formula: "Root + major 3rd + perfect 5th + minor 7th",
    intro: "A major triad, plus a minor 7th.",
    beats: [
      {
        name: "Major 3rd",
        steps: 4,
        detail: "Starting with your root, count up 4 half-steps to find the major 3rd.",
        goal: { letter: "E", accidental: 0 },
        result: "E is the major 3rd of C.",
      },
      {
        name: "Perfect 5th",
        steps: 7,
        detail: "Start from the root again. Count up 7 half-steps to find the perfect 5th.",
        goal: { letter: "G", accidental: 0 },
        result: "G is the perfect 5th of C.",
      },
      {
        name: "Minor 7th",
        steps: 10,
        detail: "Start from the root again. Count up 10 half-steps to find the minor 7th.",
        goal: { letter: "B", accidental: -1 },
        result: "B♭ is the minor 7th of C.",
      },
    ],
    tones: [
      { letter: "C", accidental: 0, label: "Root" },
      { letter: "E", accidental: 0, label: "Major 3rd" },
      { letter: "G", accidental: 0, label: "Perfect 5th" },
      { letter: "B", accidental: -1, label: "Minor 7th" },
    ],
    closing: "C, E, G, B♭. That is C7. Same recipe from any root.",
    practice: "Practice dominant 7ths",
  },
  {
    id: "maj7",
    name: "Major 7",
    title: "Let’s make a major 7th.",
    formula: "Root + major 3rd + perfect 5th + major 7th",
    intro: "A major triad, plus a 7th one half-step under the octave.",
    beats: [
      {
        name: "Major 3rd",
        steps: 4,
        detail: "Starting with your root, count up 4 half-steps to find the major 3rd.",
        goal: { letter: "E", accidental: 0 },
        result: "E is the major 3rd of C.",
      },
      {
        name: "Perfect 5th",
        steps: 7,
        detail: "Start from the root again. Count up 7 half-steps to find the perfect 5th.",
        goal: { letter: "G", accidental: 0 },
        result: "G is the perfect 5th of C.",
      },
      {
        name: "Major 7th",
        steps: 11,
        detail: "Start from the root again. Count up 11 half-steps to find the major 7th.",
        goal: { letter: "B", accidental: 0 },
        result: "B is the major 7th of C.",
      },
    ],
    tones: [
      { letter: "C", accidental: 0, label: "Root" },
      { letter: "E", accidental: 0, label: "Major 3rd" },
      { letter: "G", accidental: 0, label: "Perfect 5th" },
      { letter: "B", accidental: 0, label: "Major 7th" },
    ],
    closing: "C, E, G, B. That is Cmaj7. Same recipe from any root.",
    practice: "Practice major 7ths",
  },
  {
    id: "min7",
    name: "Minor 7",
    title: "Let’s make a minor 7th.",
    formula: "Root + minor 3rd + perfect 5th + minor 7th",
    intro: "A minor triad, plus a minor 7th.",
    beats: [
      {
        name: "Minor 3rd",
        steps: 3,
        detail: "Starting with your root, count up 3 half-steps to find the minor 3rd.",
        goal: { letter: "E", accidental: -1 },
        result: "E♭ is the minor 3rd of C.",
      },
      {
        name: "Perfect 5th",
        steps: 7,
        detail: "Start from the root again. Count up 7 half-steps to find the perfect 5th.",
        goal: { letter: "G", accidental: 0 },
        result: "G is the perfect 5th of C.",
      },
      {
        name: "Minor 7th",
        steps: 10,
        detail: "Start from the root again. Count up 10 half-steps to find the minor 7th.",
        goal: { letter: "B", accidental: -1 },
        result: "B♭ is the minor 7th of C.",
      },
    ],
    tones: [
      { letter: "C", accidental: 0, label: "Root" },
      { letter: "E", accidental: -1, label: "Minor 3rd" },
      { letter: "G", accidental: 0, label: "Perfect 5th" },
      { letter: "B", accidental: -1, label: "Minor 7th" },
    ],
    closing: "C, E♭, G, B♭. That is Cm7. Same recipe from any root.",
    practice: "Practice minor 7ths",
  },
];

export function ChordLesson({
  onExit,
  onPractice,
}: {
  onExit: () => void;
  onPractice: (filter: ChordFilter) => void;
}) {
  const [lessonId, setLessonId] = useState<ChordFilter | null>(null);
  const lesson = LESSONS.find((item) => item.id === lessonId) ?? null;

  return (
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden px-4 pt-4">
      <header className="flex shrink-0 items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={lesson ? () => setLessonId(null) : onExit}
          aria-label="Back"
        >
          <ArrowLeft />
        </Button>
        <BrandMark compact />
        <span className="w-12" />
      </header>
      {lesson ? (
        <LessonPage lesson={lesson} onPractice={() => onPractice(lesson.id)} />
      ) : (
        <TypePicker onPick={setLessonId} />
      )}
    </div>
  );
}

function TypePicker({ onPick }: { onPick: (id: ChordFilter) => void }) {
  return (
    <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Chord lesson</p>
        <h2 className="mt-1 font-display text-2xl tracking-tight">Which chord do you want to learn?</h2>
      </div>
      <div className="flex flex-col gap-2">
        {LESSONS.map((lesson) => (
          <button
            key={lesson.id}
            type="button"
            onClick={() => onPick(lesson.id)}
            className="flex min-h-16 flex-col items-start justify-center rounded-xl bg-card px-4 py-3 text-left shadow-border"
          >
            <span className="text-lg font-medium">
              <QualityText text={lesson.name} />
            </span>
            <span className="mt-0.5 text-sm text-muted-foreground">
              <QualityText text={lesson.formula} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function LessonPage({ lesson, onPractice }: { lesson: Lesson; onPractice: () => void }) {
  return (
    <>
      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
        <div>
          <p className="text-sm font-medium tracking-wide text-muted-foreground">
            <QualityText text={lesson.name} />
          </p>
          <h2 className="mt-1 font-display text-2xl tracking-tight">
            <QualityText text={lesson.title} />
          </h2>
          <p className="mt-3 font-display text-2xl leading-snug tracking-tight">
            <QualityText text={lesson.formula} />
          </p>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            <QualityText text={lesson.intro} />
          </p>
        </div>
        {lesson.beats.map((beat) => (
          <section key={beat.name} className="rounded-2xl bg-card px-4 py-4 shadow-border">
            <p className="text-sm font-medium tracking-wide text-muted-foreground">
              <QualityText text={beat.name} />
            </p>
            <h3 className="mt-2 font-display text-2xl tracking-tight">Count up {beat.steps} half-steps.</h3>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              <QualityText text={beat.detail} />
            </p>
            <p className="mt-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">Example · from C</p>
            <HalfStepPath notes={path(beat.steps, beat.goal)} goal={beat.name} />
            <p className="mt-1 text-base leading-relaxed">
              <QualityText text={beat.result} />
            </p>
          </section>
        ))}
        <section className="rounded-2xl bg-card px-4 py-4 shadow-border">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">The chord</p>
          <div className={cn("mt-3 grid gap-2", lesson.tones.length > 3 ? "grid-cols-4" : "grid-cols-3")}>
            {lesson.tones.map((tone) => (
              <ChordTone key={tone.label} letter={tone.letter} accidental={tone.accidental} label={tone.label} />
            ))}
          </div>
          <p className="mt-3 text-base leading-relaxed">
            <QualityText text={lesson.closing} />
          </p>
        </section>
      </div>
      <div className="-mx-4 shrink-0 border-t border-border bg-background px-4 pt-3 safe-dock">
        <Button size="lg" className="h-12 w-full rounded-lg" onClick={onPractice}>
          <QualityText text={lesson.practice} tone="primary" />
        </Button>
      </div>
    </>
  );
}

function HalfStepPath({ notes, goal }: { notes: Tone[]; goal: string }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-y-2 py-2">
      {notes.map((note, index) => {
        const last = index === notes.length - 1;
        const role = index === 0 ? "root" : last ? "goal" : "step";
        return (
          <div key={`${note.letter}${note.accidental}-${index}`} className="flex items-center">
            <span
              className={cn(
                "flex h-11 min-w-10 items-center justify-center rounded-md px-1.5 text-base font-medium",
                role === "goal" && "bg-primary text-primary-foreground",
                role === "root" && "bg-highlight text-highlight-foreground",
                role === "step" && "bg-secondary text-foreground",
              )}
              aria-label={role === "root" ? `${note.letter} root` : role === "goal" ? `${note.letter} ${goal}` : undefined}
            >
              {note.letter}
              {accidentalGlyph(note.accidental)}
            </span>
            {last ? null : (
              <span className="w-5 text-center text-xs font-medium tabular-nums text-muted-foreground">{index + 1}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ChordTone({ letter, accidental, label }: { letter: string; accidental: number; label: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-lg bg-secondary px-1 py-2 text-foreground",
      )}
    >
      <span className="font-display text-2xl">
        {letter}
        {accidentalGlyph(accidental)}
      </span>
      <span className="mt-1 text-center text-xs leading-tight text-muted-foreground">
        <QualityText text={label} />
      </span>
    </div>
  );
}
