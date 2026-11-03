import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { CorrectBurst } from "@/components/correct-burst";
import { ChoicePad, NoteKeypad } from "@/components/keypad";
import { Button } from "@/components/ui/button";
import { accidentalGlyph, type Letter } from "@/lib/intervals/catalog";
import { SCALE_LETTERS } from "@/lib/keys/catalog";
import type { KeyBonus, KeyQuestion, KeyResult } from "@/lib/keys/quiz";
import { cardPlace, type DeckPlace } from "@/lib/deck";
import { useDrillStore } from "@/lib/intervals/store";
import { useAutoAdvance } from "@/lib/use-auto-advance";
import { cn } from "@/lib/utils";

type Phase = "ask" | "solved" | "bonus" | "bonus-solved";
type Mark = "correct" | "wrong" | "missed" | null;

const COUNT_OPTIONS = Array.from({ length: 8 }, (_, value) => ({ value: String(value), label: String(value) }));

export function KeysDrill({
  cards,
  deck,
  onExit,
  onDone,
}: {
  cards: KeyQuestion[];
  deck?: DeckPlace;
  onExit: () => void;
  onDone: (results: KeyResult[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const place = cardPlace(index, cards.length, deck);
  const [wrongPicks, setWrongPicks] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("ask");
  const [selected, setSelected] = useState<Letter[]>([]);
  const [marks, setMarks] = useState<Record<string, Mark>>({});
  const [letter, setLetter] = useState<Letter | null>(null);
  const [accidental, setAccidental] = useState(0);
  const [nameWrong, setNameWrong] = useState(false);
  const [bonusLetter, setBonusLetter] = useState<Letter | null>(null);
  const [bonusAcc, setBonusAcc] = useState(0);
  const [bonusNameWrong, setBonusNameWrong] = useState(false);
  const resultsRef = useRef<KeyResult[]>([]);
  const recordAnswer = useDrillStore((s) => s.recordAnswer);
  const streak = useDrillStore((s) => s.streak);
  const skipCorrect = useAutoAdvance(phase === "solved" || phase === "bonus-solved", goNext);

  const question = cards[index];
  const bonus = question.bonus;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if ((phase === "solved" || phase === "bonus-solved") && event.key === "Enter") {
        event.preventDefault();
        goNext();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function choose(value: string) {
    if (phase !== "ask" || wrongPicks.includes(value)) return;
    if (value !== question.answer) {
      setWrongPicks((prev) => [...prev, value]);
      return;
    }
    const firstTry = wrongPicks.length === 0;
    setPhase("solved");
    recordAnswer(question.topicId, firstTry);
    resultsRef.current = [...resultsRef.current, { question, picked: value, correct: firstTry }];
  }

  function submitKeyName() {
    if (phase !== "ask" || !letter) return;
    const right = letter === question.answerLetter && accidental === (question.answerAccidental ?? 0);
    if (!right) {
      setNameWrong(true);
      return;
    }
    const firstTry = !nameWrong;
    const picked = `${letter}${accidentalGlyph(accidental)}`;
    setPhase("solved");
    recordAnswer(question.topicId, firstTry);
    resultsRef.current = [...resultsRef.current, { question, picked, correct: firstTry }];
  }

  function submitBonusName(current: KeyBonus) {
    if (phase !== "bonus" || !bonusLetter) return;
    const right = bonusLetter === current.answerLetter && bonusAcc === (current.answerAccidental ?? 0);
    if (!right) {
      setBonusNameWrong(true);
      return;
    }
    setPhase("bonus-solved");
  }

  function toggleNote(next: Letter) {
    if (phase !== "bonus") return;
    if (marks[next] === "correct") return;
    setSelected((prev) => (prev.includes(next) ? prev.filter((item) => item !== next) : [...prev, next]));
    setMarks((prev) => ({ ...prev, [next]: null }));
  }

  function submitNotes(current: KeyBonus) {
    if (phase !== "bonus" || selected.length === 0) return;
    const needed = new Set(current.letters);
    const nextMarks: Record<string, Mark> = {};
    for (const item of SCALE_LETTERS) {
      const picked = selected.includes(item);
      const want = needed.has(item);
      if (picked && want) nextMarks[item] = "correct";
      else if (picked && !want) nextMarks[item] = "wrong";
      else if (!picked && want) nextMarks[item] = "missed";
      else nextMarks[item] = null;
    }
    setMarks(nextMarks);
    const extras = selected.filter((item) => !needed.has(item));
    const missing = current.letters.some((item) => !selected.includes(item));
    if (extras.length === 0 && !missing) setPhase("bonus-solved");
  }

  function openBonus() {
    if (!bonus || phase !== "solved") return;
    setPhase("bonus");
    setSelected([]);
    setMarks({});
    setBonusLetter(null);
    setBonusAcc(0);
    setBonusNameWrong(false);
  }

  function goNext() {
    if (index + 1 >= cards.length) {
      onDone(resultsRef.current);
      return;
    }
    setIndex((i) => i + 1);
    setWrongPicks([]);
    setPhase("ask");
    setSelected([]);
    setMarks({});
    setLetter(null);
    setAccidental(0);
    setNameWrong(false);
    setBonusLetter(null);
    setBonusAcc(0);
    setBonusNameWrong(false);
  }

  const kindLabel =
    question.kind === "memory" ? "Mnemonic" : question.kind === "key-to-count" ? "Key → count" : "Count → key";
  const asking = phase === "ask";
  const inBonus = phase === "bonus" || phase === "bonus-solved";

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
          {place.current} / {place.total}
        </span>
        <span>{streak > 0 ? `Streak ${streak}` : " "}</span>
      </div>
      <div className="mt-2 h-1 shrink-0 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-foreground transition-[width] duration-200 ease-out"
          style={{ width: place.width }}
        />
      </div>

      <article key={question.id + phase} className="stagger-in mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-3">
        <div className="rounded-2xl bg-card px-4 py-4 shadow-border">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {inBonus ? "Bonus" : kindLabel}
          </p>
          {inBonus ? (
            <>
              <h2 className="mt-2 font-display text-xl leading-snug tracking-tight sm:text-2xl">{bonus?.prompt}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{question.answer}</p>
            </>
          ) : question.kind === "memory" ? (
            <>
              <h2 className="mt-2 font-display text-xl leading-snug tracking-tight sm:text-2xl">
                What is this mnemonic used for?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">“{question.promptEmphasis}”</p>
            </>
          ) : (
            <h2 className="mt-2 font-display text-xl leading-snug tracking-tight text-balance sm:text-2xl">
              {question.promptLead ? `${question.promptLead} ` : null}
              <em className="not-italic text-highlight">{question.promptEmphasis}</em>
              {question.promptTail.startsWith("?") ? question.promptTail : ` ${question.promptTail}`}
            </h2>
          )}
          {asking && question.input === "key-name" && letter ? (
            <p className={cn("mt-3 font-display text-2xl", nameWrong && "text-destructive")}>
              {letter}
              {accidentalGlyph(accidental)}
            </p>
          ) : null}
          {phase === "bonus" && bonus?.mode === "key-name" && bonusLetter ? (
            <p className={cn("mt-3 font-display text-2xl", bonusNameWrong && "text-destructive")}>
              {bonusLetter}
              {accidentalGlyph(bonusAcc)}
            </p>
          ) : null}
        </div>

        {phase === "solved" && !skipCorrect ? <CorrectBurst detail={question.reveal} streak={streak} compact /> : null}
        {phase === "bonus-solved" && bonus && !skipCorrect ? (
          <CorrectBurst detail={bonus.reveal} streak={streak} compact />
        ) : null}

        {asking && question.input === "choices" ? (
          <ChoicePad options={question.choices} wrong={wrongPicks} solved={false} onPick={choose} columns={2} />
        ) : null}

        {asking && question.input === "count" ? (
          <ChoicePad options={COUNT_OPTIONS} wrong={wrongPicks} solved={false} answer={question.answer} columns={4} onPick={choose} />
        ) : null}

        {asking && question.input === "key-name" ? (
          <NoteKeypad
            onLetter={(value) => {
              setLetter(value);
              setAccidental(0);
              setNameWrong(false);
            }}
            onAccidental={(value) => {
              setAccidental((prev) => (prev === value ? 0 : value));
              setNameWrong(false);
            }}
            onDelete={() => {
              if (accidental) setAccidental(0);
              else setLetter(null);
              setNameWrong(false);
            }}
          />
        ) : null}

        {phase === "solved" && question.input === "choices" ? (
          <ChoicePad options={question.choices} wrong={wrongPicks} solved answer={question.answer} columns={2} onPick={choose} />
        ) : null}

        {phase === "solved" && question.input === "count" ? (
          <ChoicePad options={COUNT_OPTIONS} wrong={wrongPicks} solved answer={question.answer} columns={4} onPick={choose} />
        ) : null}

        {phase === "bonus" && bonus?.mode === "select-notes" ? (
          <NotePicker kind={bonus.kind} selected={selected} marks={marks} onToggle={toggleNote} />
        ) : null}

        {phase === "bonus-solved" && bonus?.mode === "select-notes" ? (
          <NotePicker
            kind={bonus.kind}
            selected={bonus.letters}
            marks={Object.fromEntries(bonus.letters.map((item) => [item, "correct" as Mark]))}
            onToggle={() => {}}
            locked
          />
        ) : null}

        {phase === "bonus" && bonus?.mode === "key-name" ? (
          <NoteKeypad
            onLetter={(value) => {
              setBonusLetter(value);
              setBonusAcc(0);
              setBonusNameWrong(false);
            }}
            onAccidental={(value) => {
              setBonusAcc((prev) => (prev === value ? 0 : value));
              setBonusNameWrong(false);
            }}
            onDelete={() => {
              if (bonusAcc) setBonusAcc(0);
              else setBonusLetter(null);
              setBonusNameWrong(false);
            }}
          />
        ) : null}
      </article>

      <div className="-mx-4 shrink-0 border-t border-border bg-background px-4 pt-3 safe-dock">
        {asking && question.input === "key-name" ? (
          <Button size="lg" className="h-12 w-full rounded-lg" disabled={!letter} onClick={submitKeyName}>
            Submit
          </Button>
        ) : null}

        {asking && question.input !== "key-name" ? (
          <p className="pb-1 text-center text-xs text-muted-foreground">
            {wrongPicks.length > 0 ? "Try another option" : question.kind === "memory" ? "What is it for?" : "Tap an answer"}
          </p>
        ) : null}

        {phase === "solved" ? (
          <div className="flex gap-2">
            {bonus ? (
              <Button size="lg" variant="outline" className="h-12 flex-1 rounded-lg" onClick={openBonus}>
                Bonus question
              </Button>
            ) : null}
            <Button size="lg" className="h-12 flex-1 rounded-lg" onClick={goNext}>
              {place.last ? "See results" : "Next card"}
            </Button>
          </div>
        ) : null}

        {phase === "bonus" && bonus?.mode === "select-notes" ? (
          <Button
            size="lg"
            className="h-12 w-full rounded-lg"
            disabled={selected.length === 0}
            onClick={() => submitNotes(bonus)}
          >
            Submit
          </Button>
        ) : null}

        {phase === "bonus" && bonus?.mode === "key-name" ? (
          <Button size="lg" className="h-12 w-full rounded-lg" disabled={!bonusLetter} onClick={() => submitBonusName(bonus)}>
            Submit
          </Button>
        ) : null}

        {phase === "bonus-solved" ? (
          <Button size="lg" className="h-12 w-full rounded-lg" onClick={goNext}>
            {place.last ? "See results" : "Next card"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function NotePicker({
  kind,
  selected,
  marks,
  onToggle,
  locked = false,
}: {
  kind: "sharp" | "flat";
  selected: Letter[];
  marks: Record<string, Mark>;
  onToggle: (letter: Letter) => void;
  locked?: boolean;
}) {
  const mark = kind === "flat" ? "♭" : "♯";
  const missing = Object.values(marks).includes("missed");
  const hasWrong = Object.values(marks).includes("wrong");

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-7 gap-1.5">
        {SCALE_LETTERS.map((item) => {
          const state = marks[item];
          const on = selected.includes(item) || state === "correct";
          return (
            <button
              key={item}
              type="button"
              disabled={locked || state === "correct"}
              onClick={() => onToggle(item)}
              className={cn(
                "flex h-14 flex-col items-center justify-center rounded-md shadow-border transition-colors duration-150 active:not-disabled:scale-[0.96]",
                state === "correct" && "bg-success text-success-foreground",
                state === "wrong" && "bg-destructive text-destructive-foreground",
                state === "missed" && "bg-card text-foreground ring-2 ring-highlight",
                !state && on && "bg-secondary text-foreground ring-2 ring-ring/40",
                !state && !on && "bg-card text-card-foreground hover:bg-secondary",
              )}
            >
              <span className="font-display text-lg leading-none">{item}</span>
              <span className="mt-1 text-xs opacity-70">{on || state === "missed" ? mark : " "}</span>
            </button>
          );
        })}
      </div>
      {hasWrong || missing ? (
        <p className="text-center text-xs text-muted-foreground">
          {hasWrong && missing
            ? "Red notes are extra. Ringed notes are still missing."
            : hasWrong
              ? "Red notes are not in this key. Tap to drop them."
              : "Ringed notes are still missing."}
        </p>
      ) : (
        <p className="text-center text-xs text-muted-foreground">Tap every {kind === "flat" ? "flat" : "sharp"}.</p>
      )}
    </div>
  );
}
