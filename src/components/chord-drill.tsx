import { useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { CorrectBurst } from "@/components/correct-burst";
import { NoteKeypad } from "@/components/keypad";
import { Button } from "@/components/ui/button";
import {
  CHORD_BY_ID,
  notesPhrase,
  QUALITY_META,
  qualitiesFor,
  SLOT_LABELS,
  type ChordQuality,
} from "@/lib/chords/catalog";
import type { ChordQuestion, ChordResult } from "@/lib/chords/quiz";
import { accidentalGlyph, type Letter } from "@/lib/intervals/catalog";
import { useDrillStore } from "@/lib/intervals/store";
import { cn } from "@/lib/utils";

type Slot = { letter: Letter | null; accidental: number };
type Mark = "correct" | "wrong" | null;

const EMPTY: Slot = { letter: null, accidental: 0 };

function slotLabel(slot: Slot): string {
  if (!slot.letter) return "";
  return `${slot.letter}${accidentalGlyph(slot.accidental)}`;
}

function emptySlots(count: number): Slot[] {
  return Array.from({ length: count }, () => EMPTY);
}

export function ChordDrill({
  cards,
  onExit,
  onDone,
}: {
  cards: ChordQuestion[];
  onExit: () => void;
  onDone: (results: ChordResult[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [slots, setSlots] = useState<Slot[]>(emptySlots(cards[0]?.chord.notes.length ?? 3));
  const [focused, setFocused] = useState(0);
  const [marks, setMarks] = useState<Mark[]>(slots.map(() => null));
  const [solved, setSolved] = useState(false);
  const [missedFirst, setMissedFirst] = useState(false);
  const [rootLetter, setRootLetter] = useState<Letter | null>(null);
  const [rootAcc, setRootAcc] = useState(0);
  const [quality, setQuality] = useState<ChordQuality | null>(null);
  const resultsRef = useRef<ChordResult[]>([]);
  const recordAnswer = useDrillStore((s) => s.recordAnswer);
  const streak = useDrillStore((s) => s.streak);
  const filters = useDrillStore((s) => s.chordFilters);
  const qualityButtons = qualitiesFor(filters.length ? filters : ["major", "minor"]);

  const question = cards[index];
  const build = question.kind === "build";
  const noteCount = question.chord.notes.length;
  const locked = marks.map((mark) => mark === "correct");
  const filled = slots.length === noteCount && slots.every((slot) => slot.letter !== null);

  function resetName() {
    setRootLetter(null);
    setRootAcc(0);
    setQuality(null);
  }

  function writeLetter(letter: Letter) {
    if (solved) return;
    if (!build) {
      setRootLetter(letter);
      setRootAcc(0);
      checkName(letter, 0, quality);
      return;
    }
    const empty = slots.findIndex((slot, i) => !locked[i] && slot.letter === null);
    const target = empty >= 0 ? empty : locked[focused] ? -1 : focused;
    if (target < 0) return;
    setSlots((prev) => {
      const next = [...prev];
      next[target] = { letter, accidental: 0 };
      return next;
    });
    setMarks((prev) => {
      const next = [...prev];
      next[target] = null;
      return next;
    });
    const nextEmpty = slots.findIndex((slot, i) => i > target && !locked[i] && slot.letter === null);
    setFocused(nextEmpty >= 0 ? nextEmpty : target);
  }

  function writeAccidental(value: number) {
    if (solved) return;
    if (!build) {
      if (!rootLetter) return;
      const next = rootAcc === value ? 0 : value;
      setRootAcc(next);
      checkName(rootLetter, next, quality);
      return;
    }
    const target =
      !locked[focused] && slots[focused].letter ? focused : ([...slots.keys()].reverse().find((i) => !locked[i] && slots[i].letter) ?? -1);
    if (target < 0) return;
    setSlots((prev) => {
      const next = [...prev];
      next[target] = { ...next[target], accidental: next[target].accidental === value ? 0 : value };
      return next;
    });
    setMarks((prev) => {
      const next = [...prev];
      next[target] = null;
      return next;
    });
  }

  function backspace() {
    if (solved) return;
    if (!build) {
      if (quality) {
        setQuality(null);
        return;
      }
      if (rootAcc) {
        setRootAcc(0);
        return;
      }
      setRootLetter(null);
      return;
    }
    if (!locked[focused] && slots[focused].letter) {
      setSlots((prev) => {
        const next = [...prev];
        next[focused] = EMPTY;
        return next;
      });
      setMarks((prev) => {
        const next = [...prev];
        next[focused] = null;
        return next;
      });
      return;
    }
    const prevIndex = [...slots.keys()].reverse().find((i) => i < focused && !locked[i]);
    if (prevIndex === undefined) return;
    setFocused(prevIndex);
    setSlots((prev) => {
      const next = [...prev];
      next[prevIndex] = EMPTY;
      return next;
    });
    setMarks((prev) => {
      const next = [...prev];
      next[prevIndex] = null;
      return next;
    });
  }

  function submitBuild() {
    if (!filled || solved) return;
    const nextMarks: Mark[] = question.chord.notes.map((note, i) =>
      slots[i].letter === note.letter && slots[i].accidental === note.accidental ? "correct" : "wrong",
    );
    setMarks(nextMarks);
    if (!nextMarks.every((mark) => mark === "correct")) {
      setMissedFirst(true);
      const firstWrong = nextMarks.findIndex((mark) => mark === "wrong");
      if (firstWrong >= 0) setFocused(firstWrong);
      return;
    }
    finish(slots.map(slotLabel), !missedFirst);
  }

  function checkName(letter: Letter | null, accidental: number, nextQuality: ChordQuality | null) {
    if (!letter || !nextQuality) return;
    const match = accidental === 0 ? CHORD_BY_ID[`${letter}-${nextQuality}`] : undefined;
    if (match && match.id === question.chord.id) {
      finish([match.name], !missedFirst);
      return;
    }
    setMissedFirst(true);
  }

  function pickQuality(value: ChordQuality) {
    if (solved) return;
    const next = quality === value ? null : value;
    setQuality(next);
    checkName(rootLetter, rootAcc, next);
  }

  function finish(picked: string[], correct: boolean) {
    setSolved(true);
    recordAnswer(question.chord.id, correct);
    resultsRef.current = [...resultsRef.current, { question, picked, correct }];
  }

  function goNext() {
    if (index + 1 >= cards.length) {
      onDone(resultsRef.current);
      return;
    }
    const next = cards[index + 1];
    setIndex((i) => i + 1);
    setSlots(emptySlots(next.chord.notes.length));
    setFocused(0);
    setMarks(emptySlots(next.chord.notes.length).map(() => null));
    setSolved(false);
    setMissedFirst(false);
    resetName();
  }

  const named =
    rootLetter == null
      ? ""
      : quality === "dom7"
        ? `${rootLetter}${accidentalGlyph(rootAcc)}7`
        : quality === "maj7"
          ? `${rootLetter}${accidentalGlyph(rootAcc)}maj7`
          : quality === "min7"
            ? `${rootLetter}${accidentalGlyph(rootAcc)}m7`
            : `${rootLetter}${accidentalGlyph(rootAcc)}${quality ? ` ${QUALITY_META[quality].label}` : ""}`;

  return (
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden px-4 pt-4">
      <header className="flex shrink-0 items-center justify-between gap-2">
        <Button variant="ghost" size="icon-sm" onClick={onExit} aria-label="Back">
          <ArrowLeft />
        </Button>
        <BrandMark compact />
        <span className="size-9" />
      </header>

      <div className="mt-3 flex shrink-0 items-center justify-between text-xs tabular-nums text-muted-foreground">
        <span>
          {index + 1} / {cards.length}
        </span>
        <span>{streak > 0 ? `Streak ${streak}` : " "}</span>
      </div>
      <div className="mt-2 h-1 shrink-0 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-foreground transition-[width] duration-200 ease-out"
          style={{ width: `${(index / cards.length) * 100}%` }}
        />
      </div>

      <article key={question.id} className="stagger-in mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-3">
        <div className="rounded-2xl bg-card px-4 py-5 shadow-border">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {build ? "Build this chord" : "Name this chord"}
          </p>
          {build ? (
            <h2 className="mt-2 font-display text-2xl leading-snug tracking-tight">{question.chord.name}</h2>
          ) : (
            <h2 className="mt-2 font-display text-2xl leading-snug tracking-tight">{notesPhrase(question.chord)}</h2>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {build ? "Root, then 3rd, 5th" + (noteCount > 3 ? ", 7th." : ".") : "Root and quality."}
          </p>

          {build ? (
            <div className={cn("mt-5 grid gap-2", noteCount === 4 ? "grid-cols-4" : "grid-cols-3")}>
              {slots.map((slot, i) => {
                const mark = marks[i];
                return (
                  <button
                    key={SLOT_LABELS[i]}
                    type="button"
                    disabled={solved || locked[i]}
                    onClick={() => setFocused(i)}
                    className={cn(
                      "flex min-h-16 flex-col items-center justify-center rounded-lg px-1 py-2 shadow-border transition-colors duration-150",
                      mark === "correct" && "bg-success text-success-foreground",
                      mark === "wrong" && "bg-destructive text-destructive-foreground",
                      mark === null && focused === i && "bg-secondary text-foreground ring-2 ring-ring/40",
                      mark === null && focused !== i && "bg-secondary/60 text-foreground",
                    )}
                  >
                    <span className="text-xs opacity-70">{SLOT_LABELS[i]}</span>
                    <span className="mt-1 font-display text-xl">{slot.letter ? slotLabel(slot) : "·"}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className={cn("mt-5 font-display text-2xl", missedFirst && !solved && "text-destructive")}>
              {named || "·"}
            </p>
          )}

          {solved ? (
            <div className="mt-4">
              <CorrectBurst detail={question.chord.hint} streak={streak} compact />
            </div>
          ) : build && marks.some((mark) => mark === "wrong") ? (
            <p className="mt-4 text-sm text-muted-foreground">Red notes are off. Fix them and submit again.</p>
          ) : !build && missedFirst ? (
            <p className="mt-3 text-sm text-muted-foreground">Not that chord. Try another spelling.</p>
          ) : null}
        </div>

        {!solved ? (
          <div className="flex flex-col gap-2">
            <NoteKeypad onLetter={writeLetter} onAccidental={writeAccidental} onDelete={backspace} />
            {!build ? (
              <div
                className={cn(
                  "grid gap-1.5",
                  qualityButtons.length <= 2 ? "grid-cols-2" : qualityButtons.length === 3 ? "grid-cols-3" : "grid-cols-4",
                )}
              >
                {qualityButtons.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => pickQuality(item)}
                    className={cn(
                      "flex h-11 items-center justify-center rounded-md px-1 text-sm font-medium shadow-border transition-colors duration-150 active:scale-[0.96]",
                      quality === item ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary",
                    )}
                  >
                    {QUALITY_META[item].button}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </article>

      <div className="-mx-4 shrink-0 border-t border-border bg-background px-4 pt-3 safe-dock">
        {solved ? (
          <Button size="lg" className="h-12 w-full rounded-lg" onClick={goNext}>
            {index + 1 >= cards.length ? "See results" : "Next chord"}
          </Button>
        ) : build ? (
          <Button size="lg" className="h-12 w-full rounded-lg" disabled={!filled} onClick={submitBuild}>
            Submit
          </Button>
        ) : (
          <p className="pb-1 text-center text-xs text-muted-foreground">Letter, then the quality</p>
        )}
      </div>
    </div>
  );
}
