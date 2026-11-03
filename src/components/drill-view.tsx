import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { CorrectBurst } from "@/components/correct-burst";
import { ChoicePad } from "@/components/keypad";
import { ReferenceDialog } from "@/components/reference-dialog";
import { Button } from "@/components/ui/button";
import {
  articleFor,
  intervalFromParts,
  type IntervalQuality,
  stepsPhrase,
} from "@/lib/intervals/catalog";
import type { CardResult, Question } from "@/lib/intervals/quiz";
import { cardPlace, type DeckPlace } from "@/lib/deck";
import { useDrillStore } from "@/lib/intervals/store";
import { useAutoAdvance } from "@/lib/use-auto-advance";
import { QualityText } from "@/components/quality-text";
import { cn } from "@/lib/utils";

const QUALITIES: { value: IntervalQuality; label: string }[] = [
  { value: "perfect", label: "Perfect" },
  { value: "major", label: "Major" },
  { value: "minor", label: "Minor" },
  { value: "tritone", label: "Tritone" },
];

const DEGREES = [
  { value: 1, label: "1" },
  { value: 2, label: "2nd" },
  { value: 3, label: "3rd" },
  { value: 4, label: "4th" },
  { value: 5, label: "5th" },
  { value: 6, label: "6th" },
  { value: 7, label: "7th" },
  { value: 8, label: "8ve" },
];

const STEP_OPTIONS = Array.from({ length: 13 }, (_, value) => ({ value: String(value), label: String(value) }));

export function DrillView({
  cards,
  deck,
  onExit,
  onDone,
}: {
  cards: Question[];
  deck?: DeckPlace;
  onExit: () => void;
  onDone: (results: CardResult[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [wrongPicks, setWrongPicks] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [quality, setQuality] = useState<IntervalQuality | null>(null);
  const [degree, setDegree] = useState<number | null>(null);
  const [missedFirst, setMissedFirst] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const resultsRef = useRef<CardResult[]>([]);
  const recordAnswer = useDrillStore((s) => s.recordAnswer);
  const streak = useDrillStore((s) => s.streak);
  const skipCorrect = useAutoAdvance(solved, goNext);

  const question = cards[index];

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (solved && event.key === "Enter") {
        event.preventDefault();
        goNext();
        return;
      }
      if (solved || question.kind !== "name-to-steps") return;
      if (event.key >= "0" && event.key <= "9") {
        const value = event.key;
        if (!wrongPicks.includes(value)) {
          event.preventDefault();
          chooseSteps(value);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function finish(picked: string, firstTry: boolean) {
    setSolved(true);
    recordAnswer(question.interval.id, firstTry);
    resultsRef.current = [...resultsRef.current, { question, picked, correct: firstTry }];
  }

  function chooseSteps(value: string) {
    if (solved || wrongPicks.includes(value)) return;
    if (value !== question.answer) {
      setWrongPicks((prev) => [...prev, value]);
      return;
    }
    finish(value, wrongPicks.length === 0);
  }

  function tryName(nextQuality: IntervalQuality | null, nextDegree: number | null) {
    if (solved) return;
    if (!nextQuality) return;
    if (nextQuality !== "tritone" && nextDegree === null) return;
    const built = intervalFromParts(nextQuality, nextQuality === "tritone" ? null : nextDegree);
    if (!built) {
      setInvalid(true);
      setMissedFirst(true);
      return;
    }
    setInvalid(false);
    if (built.id !== question.interval.id) {
      setMissedFirst(true);
      setQuality(null);
      setDegree(null);
      return;
    }
    finish(built.id, !missedFirst);
  }

  function pickQuality(value: IntervalQuality) {
    if (solved) return;
    const next = quality === value ? null : value;
    setQuality(next);
    if (next === "tritone") {
      setDegree(null);
      tryName("tritone", null);
      return;
    }
    tryName(next, degree);
  }

  function pickDegree(value: number) {
    if (solved) return;
    const next = degree === value ? null : value;
    setDegree(next);
    tryName(quality, next);
  }

  function goNext() {
    if (index + 1 >= cards.length) {
      onDone(resultsRef.current);
      return;
    }
    setWrongPicks([]);
    setSolved(false);
    setQuality(null);
    setDegree(null);
    setMissedFirst(false);
    setInvalid(false);
    setIndex((i) => i + 1);
  }

  const kindLabel = question.kind === "name-to-steps" ? "Name → half-steps" : "Half-steps → name";
  const art = articleFor(question.interval.name);
  const detail = `${art === "an" ? "An" : "A"} ${question.interval.name} is ${stepsPhrase(question.interval.steps)}.`;
  const builtLabel =
    quality === "tritone"
      ? "tritone"
      : quality && degree
        ? intervalFromParts(quality, degree)?.name ?? `${quality} ${DEGREES.find((item) => item.value === degree)?.label}`
        : quality
          ? quality
          : degree
            ? (DEGREES.find((item) => item.value === degree)?.label ?? "")
            : "";
  const place = cardPlace(index, cards.length, deck);

  return (
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden px-4 pt-4">
      <header className="flex shrink-0 items-center justify-between gap-2">
        <Button variant="ghost" size="icon-sm" onClick={onExit} aria-label="Back">
          <ArrowLeft />
        </Button>
        <BrandMark compact />
        <ReferenceDialog compact />
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

      <article key={question.id} className="stagger-in mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-3">
        <div className="rounded-2xl bg-card px-4 py-4 shadow-border sm:px-5 sm:py-5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{kindLabel}</p>
          <h2 className="mt-2 font-display text-xl leading-snug tracking-tight text-balance sm:text-2xl">
            {question.promptLead ? `${question.promptLead} ` : null}
            <em className="not-italic text-highlight">
              <QualityText text={question.promptEmphasis} />
            </em>
            {question.promptTail.startsWith("?") ? question.promptTail : ` ${question.promptTail}`}
          </h2>
          {question.kind === "steps-to-name" && builtLabel ? (
            <p className={cn("mt-3 font-display text-2xl", invalid && "text-destructive")}>
              <QualityText text={builtLabel} />
            </p>
          ) : null}
        </div>

        {solved && !skipCorrect ? <CorrectBurst detail={detail} streak={streak} compact /> : null}

        {question.kind === "name-to-steps" ? (
          <ChoicePad
            options={STEP_OPTIONS}
            wrong={wrongPicks}
            solved={solved}
            answer={question.answer}
            columns={7}
            onPick={chooseSteps}
          />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="rounded-xl bg-highlight/15 p-2">
              <p className="px-1 pb-1.5 text-xs font-medium tracking-wide text-highlight uppercase">Quality</p>
              <div className="grid grid-cols-4 gap-1.5">
                {QUALITIES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    disabled={solved}
                    onClick={() => pickQuality(item.value)}
                    className={cn(
                      "flex h-12 items-center justify-center rounded-md px-1 text-base font-semibold leading-none transition-colors duration-150 active:not-disabled:scale-[0.96]",
                      solved && question.interval.quality === item.value
                        ? "bg-success text-success-foreground"
                        : quality === item.value
                          ? "bg-highlight ring-2 ring-foreground"
                          : "bg-highlight",
                    )}
                  >
                    {solved && question.interval.quality === item.value ? (
                      item.label
                    ) : (
                      <QualityText text={item.label} tone="slate" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-card p-2 shadow-border">
              <p className="px-1 pb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">Quantity</p>
              <div className="grid grid-cols-4 gap-1.5">
                {DEGREES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    disabled={solved || quality === "tritone"}
                    onClick={() => pickDegree(item.value)}
                    className={cn(
                      "flex h-12 items-center justify-center rounded-md text-base font-semibold shadow-border transition-colors duration-150 active:not-disabled:scale-[0.96] disabled:opacity-40",
                      solved && question.interval.degree === item.value
                        ? "bg-success text-success-foreground"
                        : degree === item.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            {invalid ? (
              <p className="text-center text-xs text-muted-foreground">That pair isn’t an interval name. Try again.</p>
            ) : missedFirst && !solved ? (
              <p className="text-center text-xs text-muted-foreground">Not that one. Pick a quality and a quantity.</p>
            ) : (
              <p className="text-center text-xs text-muted-foreground">Pick one quality and one quantity.</p>
            )}
          </div>
        )}
      </article>

      <div className="-mx-4 shrink-0 border-t border-border bg-background px-4 pt-3 safe-dock">
        {solved ? (
          <Button size="lg" className="h-12 w-full rounded-lg" onClick={goNext}>
            {place.last ? "See results" : "Next card"}
          </Button>
        ) : (
          <p className="pb-1 text-center text-xs text-muted-foreground">
            {question.kind === "name-to-steps"
              ? wrongPicks.length > 0
                ? "Try another number"
                : "Tap the half-steps"
              : "Build the name"}
          </p>
        )}
      </div>
    </div>
  );
}
