import { useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { NoteRow } from "@/components/altered-note";
import { CorrectBurst } from "@/components/correct-burst";
import { NoteKeypad } from "@/components/keypad";
import { Button } from "@/components/ui/button";
import { QualityText } from "@/components/quality-text";
import { cardPlace, type DeckPlace } from "@/lib/deck";
import { accidentalGlyph, type Letter } from "@/lib/intervals/catalog";
import { useDrillStore } from "@/lib/intervals/store";
import {
  inversionLabel,
  noteGlyph,
  type Inversion,
  type InversionQuestion,
  type InversionResult,
  type Spelled,
} from "@/lib/inversions/quiz";
import { useAutoAdvance } from "@/lib/use-auto-advance";
import { cn } from "@/lib/utils";

const CHOICES: { value: Inversion; label: string }[] = [
  { value: 0, label: "Root" },
  { value: 1, label: "1st" },
  { value: 2, label: "2nd" },
];

type Slot = Spelled | null;
type Mark = "correct" | "wrong" | null;

export function InversionDrill({
  cards,
  deck,
  onExit,
  onDone,
}: {
  cards: InversionQuestion[];
  deck?: DeckPlace;
  onExit: () => void;
  onDone: (results: InversionResult[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [wrong, setWrong] = useState<Inversion[]>([]);
  const [slots, setSlots] = useState<Slot[]>([null, null, null]);
  const [focused, setFocused] = useState(0);
  const [marks, setMarks] = useState<Mark[]>([null, null, null]);
  const [solved, setSolved] = useState(false);
  const [missedFirst, setMissedFirst] = useState(false);
  const resultsRef = useRef<InversionResult[]>([]);
  const recordAnswer = useDrillStore((s) => s.recordAnswer);
  const streak = useDrillStore((s) => s.streak);
  const skipCorrect = useAutoAdvance(solved, goNext);
  const question = cards[index];
  const place = cardPlace(index, cards.length, deck);
  const naming = question.kind === "name";

  function reset(nextSlots = 3) {
    setWrong([]);
    setSlots(Array.from({ length: nextSlots }, () => null));
    setFocused(0);
    setMarks(Array.from({ length: nextSlots }, () => null));
    setSolved(false);
    setMissedFirst(false);
  }

  function finish(correct: boolean) {
    setSolved(true);
    recordAnswer(question.id, correct);
    resultsRef.current = [...resultsRef.current, { question, correct }];
  }

  function goNext() {
    if (index + 1 >= cards.length) {
      onDone(resultsRef.current);
      return;
    }
    setIndex((i) => i + 1);
    reset(cards[index + 1]?.notes.length ?? 3);
  }

  function pickName(value: Inversion) {
    if (solved || wrong.includes(value)) return;
    if (value !== question.inversion) {
      setWrong((prev) => [...prev, value]);
      setMissedFirst(true);
      return;
    }
    finish(wrong.length === 0 && !missedFirst);
  }

  function writeLetter(letter: Letter) {
    if (solved) return;
    const open = (i: number) => marks[i] !== "correct";
    const focusedEmpty = open(focused) && !slots[focused];
    const empty = slots.findIndex((slot, i) => open(i) && !slot);
    const target = focusedEmpty ? focused : empty >= 0 ? empty : marks[focused] === "correct" ? -1 : focused;
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
    const nextEmpty = slots.findIndex((slot, i) => i > target && open(i) && !slot);
    setFocused(nextEmpty >= 0 ? nextEmpty : target);
  }

  function writeAccidental(value: number) {
    if (solved) return;
    const target =
      slots[focused] && marks[focused] !== "correct"
        ? focused
        : ([...slots.keys()].reverse().find((i) => marks[i] !== "correct" && slots[i]) ?? -1);
    if (target < 0 || !slots[target]) return;
    const current = slots[target];
    if (!current) return;
    setSlots((prev) => {
      const next = [...prev];
      next[target] = { letter: current.letter, accidental: current.accidental === value ? 0 : value };
      return next;
    });
    setMarks((prev) => {
      const next = [...prev];
      next[target] = null;
      return next;
    });
  }

  function fillDelete() {
    if (solved) return;
    const current = slots[focused];
    if (current && marks[focused] !== "correct") {
      if (current.accidental) {
        writeAccidental(current.accidental);
        return;
      }
      setSlots((prev) => {
        const next = [...prev];
        next[focused] = null;
        return next;
      });
      return;
    }
    const prevIndex = [...slots.keys()].reverse().find((i) => i < focused && marks[i] !== "correct");
    if (prevIndex === undefined) return;
    setFocused(prevIndex);
    setSlots((prev) => {
      const next = [...prev];
      next[prevIndex] = null;
      return next;
    });
  }

  function submitBuild() {
    if (solved || slots.some((slot) => !slot)) return;
    const nextMarks = question.notes.map((note, i) =>
      slots[i]?.letter === note.letter && slots[i]?.accidental === note.accidental ? "correct" : "wrong",
    ) as Mark[];
    setMarks(nextMarks);
    if (nextMarks.some((mark) => mark !== "correct")) {
      setMissedFirst(true);
      const first = nextMarks.findIndex((mark) => mark === "wrong");
      if (first >= 0) setFocused(first);
      return;
    }
    finish(!missedFirst);
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden px-4 pt-4">
      <header className="flex shrink-0 items-center justify-between gap-2">
        <Button variant="ghost" size="icon-sm" onClick={onExit} aria-label="Back">
          <ArrowLeft />
        </Button>
        <BrandMark compact />
        <span className="w-12 text-right text-xs tabular-nums text-muted-foreground">
          {place.current}/{place.total}
        </span>
      </header>
      <article className="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-3">
        <div className="rounded-2xl bg-card px-4 py-4 shadow-border">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Inversion</p>
          <h2 className="mt-2 font-display text-xl leading-snug tracking-tight">
            {naming ? (
              <>
                <NoteRow notes={question.notes} className="text-highlight" />
                {" is which inversion?"}
              </>
            ) : (
              <>
                {question.inversion === 0 ? "Spell " : `Spell the ${inversionLabel(question.inversion).toLowerCase()} inversion of `}
                <em className="not-italic text-highlight">
                  <QualityText text={question.chordName} />
                </em>
                {question.inversion === 0 ? " in root position" : ""}
              </>
            )}
          </h2>
          {naming ? (
            <p className="mt-2 text-base text-muted-foreground">
              <QualityText text={question.chordName} />
            </p>
          ) : null}
          {!naming ? <p className="mt-2 text-sm text-muted-foreground">Lowest note first.</p> : null}
        </div>
        {solved && !skipCorrect ? (
          <CorrectBurst
            detail={
              naming
                ? `${inversionLabel(question.inversion)} inversion.`
                : question.notes.map(noteGlyph).join(" ")
            }
            streak={streak}
            compact
          />
        ) : null}
        {naming ? (
          <div className="grid grid-cols-3 gap-1.5">
            {CHOICES.map((item) => (
              <button
                key={item.value}
                type="button"
                disabled={solved || wrong.includes(item.value)}
                onClick={() => pickName(item.value)}
                className={cn(
                  "flex h-14 items-center justify-center rounded-md text-lg font-semibold shadow-border transition-colors disabled:opacity-40",
                  solved && question.inversion === item.value
                    ? "bg-success text-success-foreground"
                    : wrong.includes(item.value)
                      ? "bg-foreground/80 text-background"
                      : "bg-card",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-1.5">
              {slots.map((slot, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFocused(i)}
                  className={cn(
                    "flex h-16 items-center justify-center rounded-lg font-display text-2xl",
                    focused === i && !solved && "relative z-10 ring-[3px] ring-foreground ring-offset-2 ring-offset-background",
                    focused === i && !solved && !marks[i] && "bg-card",
                    marks[i] === "correct" && "bg-success text-success-foreground",
                    marks[i] === "wrong" && "bg-destructive text-destructive-foreground",
                    !marks[i] && focused !== i && "bg-secondary shadow-border",
                  )}
                >
                  {slot ? `${slot.letter}${accidentalGlyph(slot.accidental)}` : ""}
                </button>
              ))}
            </div>
            <NoteKeypad disabled={solved} onLetter={writeLetter} onAccidental={writeAccidental} onDelete={fillDelete} />
          </>
        )}
      </article>
      <div className="-mx-4 shrink-0 border-t border-border bg-background px-4 pt-3 safe-dock">
        {solved ? (
          <Button size="lg" className="h-12 w-full rounded-lg" onClick={goNext}>
            {place.last ? "See results" : "Next card"}
          </Button>
        ) : naming ? (
          <p className="pb-1 text-center text-xs text-muted-foreground">
            {wrong.length ? "Not that inversion." : "Root, first, or second."}
          </p>
        ) : (
          <Button size="lg" className="h-12 w-full rounded-lg" disabled={slots.some((slot) => !slot)} onClick={submitBuild}>
            Submit
          </Button>
        )}
      </div>
    </div>
  );
}
