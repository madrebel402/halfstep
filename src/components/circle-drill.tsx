import { useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import {
  CIRCLE_STEPS,
  comesAfter,
  countMark,
  stepName,
  type CircleStep,
} from "@/lib/circle/catalog";
import { accidentalGlyph, type Letter } from "@/lib/intervals/catalog";
import { useDrillStore } from "@/lib/intervals/store";
import { useAutoAdvance } from "@/lib/use-auto-advance";
import { Major, Minor } from "@/components/quality-text";
import { cn } from "@/lib/utils";

const LETTERS: Letter[] = ["A", "B", "C", "D", "E", "F", "G"];
const COUNTS = [1, 2, 3, 4, 5, 6, 7];

export interface CircleResult {
  id: string;
  name: string;
  detail: string;
  correct: boolean;
}

export function CircleDrill({
  onlyIds,
  onExit,
  onDone,
}: {
  onlyIds?: string[];
  onExit: () => void;
  onDone: (results: CircleResult[]) => void;
}) {
  const queue = queueFrom(onlyIds);
  const prefilled = CIRCLE_STEPS.filter((item) => !queue.some((step) => step.id === item.id));
  const [index, setIndex] = useState(0);
  const [earned, setEarned] = useState<CircleStep[]>([]);
  const [letter, setLetter] = useState<Letter | null>(null);
  const [accidental, setAccidental] = useState(0);
  const [count, setCount] = useState<number | null>(null);
  const [wrongNames, setWrongNames] = useState<string[]>([]);
  const [wrongCounts, setWrongCounts] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [missedFirst, setMissedFirst] = useState(false);
  const resultsRef = useRef<CircleResult[]>([]);
  const recordAnswer = useDrillStore((s) => s.recordAnswer);
  const streak = useDrillStore((s) => s.streak);
  const auto = useDrillStore((s) => s.autoAdvance);
  const skipCorrect = useAutoAdvance(solved, goNext);

  const step = queue[index];
  if (!step) return null;

  const shown = [...prefilled, ...earned, ...(solved ? [step] : [])];
  const spelling = letter ? `${letter}${accidentalGlyph(accidental)}` : "";
  const mark = step.kind === "sharp" ? "♯" : "♭";
  const counts = step.role === "minor" ? [0, ...COUNTS] : COUNTS;
  const countText = count === null ? "—" : count === 0 ? "0" : `${count}${mark}`;

  function resetPicks() {
    setLetter(null);
    setAccidental(0);
    setCount(null);
    setWrongNames([]);
    setWrongCounts([]);
    setSolved(false);
    setMissedFirst(false);
  }

  function goNext() {
    if (index + 1 >= queue.length) {
      onDone(resultsRef.current);
      return;
    }
    setEarned((prev) => [...prev, step]);
    setIndex((i) => i + 1);
    resetPicks();
  }

  function submit() {
    if (solved || !letter || count === null) return;
    const name = `${letter}${accidentalGlyph(accidental)}`;
    if (wrongNames.includes(name) || wrongCounts.includes(count)) return;
    const keyOk = name === stepName(step);
    const countOk = count === step.count;
    if (keyOk && countOk) {
      setSolved(true);
      recordAnswer(step.id, !missedFirst);
      resultsRef.current = [
        ...resultsRef.current,
        { id: step.id, name: step.role === "minor" ? `${stepName(step)} minor` : stepName(step), detail: countMark(step), correct: !missedFirst },
      ];
      return;
    }
    setMissedFirst(true);
    if (!keyOk) {
      setWrongNames((prev) => [...prev, name]);
      setLetter(null);
      setAccidental(0);
    }
    if (!countOk) {
      setWrongCounts((prev) => [...prev, count]);
      setCount(null);
    }
  }

  function pickAccidental(value: number) {
    if (solved) return;
    setAccidental((prev) => (prev === value ? 0 : value));
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden px-4 pt-4">
      <header className="flex shrink-0 items-center justify-between gap-2">
        <Button variant="ghost" size="icon-sm" onClick={onExit} aria-label="Back">
          <ArrowLeft />
        </Button>
        <BrandMark compact />
        <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
          {index + 1}/{queue.length}
        </span>
      </header>

      <div className="mt-2 h-[min(42dvh,320px)] shrink-0">
        <CircleDiagram steps={shown} active={solved ? null : step} />
      </div>

      <div className="mt-2 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-2">
        <div>
          <p
            className={cn(
              "text-sm font-medium tracking-wide text-muted-foreground",
              step.role !== "minor" && "uppercase",
            )}
          >
            {step.role === "minor" ? (
              <>
                Relative <Minor />
              </>
            ) : step.kind === "sharp" ? (
              "Circle of fifths"
            ) : (
              "Circle of fourths"
            )}
            {streak > 0 ? ` · Streak ${streak}` : ""}
          </p>
          <h2 className="mt-1 font-display text-2xl leading-snug tracking-tight">
            {step.role === "minor" ? (
              <>
                Relative <Minor /> of <em className="not-italic text-highlight">{step.of}</em>
              </>
            ) : (
              <>
                One key {step.kind === "sharp" ? "sharper" : "flatter"} than{" "}
                <em className="not-italic text-highlight">{comesAfter(step)}</em>
              </>
            )}
          </h2>
        </div>

        <p
          className={cn(
            "font-display text-2xl tracking-tight",
            solved && "text-success",
            missedFirst && !solved && "text-destructive",
          )}
        >
          {spelling || "—"}
          <span className="text-muted-foreground"> · </span>
          {countText}
        </p>

        {wrongNames.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            Not {wrongNames.join(", ")}
            {wrongCounts.length > 0 ? `. Not ${wrongCounts.map((n) => `${n}${mark}`).join(", ")}` : "."}
          </p>
        ) : missedFirst && !solved ? (
          <p className="text-xs text-muted-foreground">Right key, wrong count. Try another.</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Name the key, then how many{" "}
            {step.role === "minor" ? (
              <>
                it shares with the <Major />
              </>
            ) : step.kind === "sharp" ? (
              "sharps"
            ) : (
              "flats"
            )}
            .
          </p>
        )}

        {!skipCorrect ? (
          <>
            <div className="rounded-xl bg-highlight/15 p-2">
              <p className="px-1 pb-1.5 text-xs font-medium tracking-wide text-highlight uppercase">Key</p>
              <div className="grid grid-cols-7 gap-1">
                {LETTERS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    disabled={solved}
                    onClick={() => setLetter(item)}
                    className={cn(
                      "flex h-12 items-center justify-center rounded-md text-lg font-semibold transition-colors",
                      letter === item
                        ? "bg-highlight text-highlight-foreground ring-2 ring-foreground"
                        : "bg-highlight text-highlight-foreground/80",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-2 gap-1">
                {[
                  { value: 1, glyph: "♯", label: "Sharp" },
                  { value: -1, glyph: "♭", label: "Flat" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    disabled={solved}
                    onClick={() => pickAccidental(item.value)}
                    aria-label={item.label}
                    className={cn(
                      "flex h-12 items-center justify-center rounded-md font-display text-2xl transition-colors",
                      accidental === item.value
                        ? "bg-highlight text-highlight-foreground ring-2 ring-foreground"
                        : "bg-highlight/80 text-highlight-foreground",
                    )}
                  >
                    {item.glyph}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-card p-2 shadow-border">
              <p className="px-1 pb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {step.role === "minor" ? "Signature" : step.kind === "sharp" ? "Sharps" : "Flats"}
              </p>
              <div className={cn("grid gap-1", counts.length > 7 ? "grid-cols-8" : "grid-cols-7")}>
                {counts.map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={solved || wrongCounts.includes(n)}
                    onClick={() => setCount(n)}
                    className={cn(
                      "flex h-12 items-center justify-center rounded-md text-base font-semibold shadow-border transition-colors disabled:opacity-30",
                      wrongCounts.includes(n)
                        ? "bg-foreground/80 text-background line-through"
                        : count === n
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground",
                    )}
                  >
                    {n === 0 ? "0" : `${n}${mark}`}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>

      <div className="-mx-4 shrink-0 border-t border-border bg-background px-4 pt-3 safe-dock">
        {solved ? (
          <Button size="lg" className="h-12 w-full rounded-lg" onClick={goNext}>
            {index + 1 >= queue.length ? "See results" : "Next key"}
          </Button>
        ) : (
          <Button size="lg" className="h-12 w-full rounded-lg" disabled={!letter || count === null} onClick={submit}>
            Fill it in
          </Button>
        )}
        {solved && auto ? (
          <p className="pb-1 text-center text-xs text-muted-foreground">
            {skipCorrect ? "Next key" : "Next key in a moment"}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function queueFrom(onlyIds?: string[]): CircleStep[] {
  if (!onlyIds?.length) return CIRCLE_STEPS;
  const wanted = new Set(onlyIds);
  const next = CIRCLE_STEPS.filter((item) => wanted.has(item.id));
  return next.length ? next : CIRCLE_STEPS;
}

function CircleDiagram({ steps, active }: { steps: CircleStep[]; active: CircleStep | null }) {
  const majors = steps.filter((item) => item.role === "major");
  const minors = steps.filter((item) => item.role === "minor");
  const bySlot = new Map<number, CircleStep[]>();
  for (const item of majors) {
    const list = bySlot.get(item.slot) ?? [];
    list.push(item);
    bySlot.set(item.slot, list);
  }
  const minorsBySlot = new Map<number, CircleStep[]>();
  for (const item of minors) {
    const list = minorsBySlot.get(item.slot) ?? [];
    list.push(item);
    minorsBySlot.set(item.slot, list);
  }
  const center =
    active?.role === "minor" ? "minor" : active?.kind === "flat" ? "Fourths" : "Fifths";
  const centerHint =
    active?.role === "minor" ? "same signature" : active?.kind === "flat" ? "← flatter" : "sharper →";

  return (
    <svg viewBox="0 0 240 240" className="h-full w-full" role="img" aria-label="Circle of fifths">
      <circle cx="120" cy="120" r="46" className="fill-card" />
      <text
        x="120"
        y="116"
        textAnchor="middle"
        className={active?.role === "minor" ? "fill-minor" : "fill-foreground"}
        fontSize="13"
        fontWeight={active?.role === "minor" ? 600 : 500}
        fontFamily="Outfit, sans-serif"
      >
        {center}
      </text>
      <text x="120" y="132" textAnchor="middle" className="fill-muted-foreground" fontSize="8" fontFamily="Outfit, sans-serif">
        {centerHint}
      </text>
      {Array.from({ length: 12 }, (_, slot) => {
        const filled = bySlot.get(slot) ?? [];
        const activeMajor = active?.role === "major" && active.slot === slot;
        const flatOnly = filled.length > 0 && filled.every((item) => item.kind === "flat");
        return (
          <g key={slot}>
            <path
              d={wedgePath(slot)}
              className={cn(
                filled.length > 0 || slot === 0
                  ? slot !== 0 && flatOnly
                    ? "fill-highlight"
                    : "fill-primary"
                  : activeMajor
                    ? "fill-raised/30"
                    : "fill-secondary",
              )}
              stroke={activeMajor ? "var(--color-raised)" : "var(--color-background)"}
              strokeWidth={activeMajor ? 2 : 1.5}
            />
            {slot === 0 || filled.length > 0 ? <SlotLabel slot={slot} items={slot === 0 ? [] : filled} /> : null}
          </g>
        );
      })}
      {Array.from({ length: 12 }, (_, slot) => (
        <MinorLabel
          key={slot}
          slot={slot}
          items={minorsBySlot.get(slot) ?? []}
          active={active?.role === "minor" && active.slot === slot}
        />
      ))}
    </svg>
  );
}

function SlotLabel({ slot, items }: { slot: number; items: CircleStep[] }) {
  const { x, y } = point(slot, 102);
  const lines = slot === 0 ? ["C"] : items.map((item) => `${stepName(item)} ${countMark(item)}`);
  const start = y - (lines.length - 1) * 5;
  return (
    <text textAnchor="middle" className="fill-foreground" fontSize="7.5" fontFamily="Outfit, sans-serif">
      {lines.map((line, i) => (
        <tspan key={line} x={x} y={start + i * 10}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function MinorLabel({ slot, items, active }: { slot: number; items: CircleStep[]; active: boolean }) {
  const { x, y } = point(slot, 34);
  if (items.length === 0) {
    return <circle cx={x} cy={y} r={active ? 3.5 : 1.6} fill={active ? "var(--color-raised)" : "var(--color-staff)"} />;
  }
  const lines = items.map((item) => `${stepName(item)}m`);
  const start = y - (lines.length - 1) * 4;
  return (
    <g>
      {active ? <circle cx={x} cy={y} r={9} fill="var(--color-raised)" opacity={0.35} /> : null}
      <text textAnchor="middle" className="fill-highlight" fontSize="7" fontFamily="Outfit, sans-serif">
        {lines.map((line, i) => (
          <tspan key={line} x={x} y={start + i * 8}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function point(slot: number, radius: number) {
  const angle = ((slot * 30 - 90) * Math.PI) / 180;
  return { x: 120 + radius * Math.cos(angle), y: 120 + radius * Math.sin(angle) };
}

function wedgePath(slot: number) {
  const mid = slot * 30 - 90;
  const spread = 12;
  const outer = 90;
  const inner = 52;
  const a0 = ((mid - spread) * Math.PI) / 180;
  const a1 = ((mid + spread) * Math.PI) / 180;
  const at = (angle: number, radius: number) =>
    `${120 + radius * Math.cos(angle)} ${120 + radius * Math.sin(angle)}`;
  return `M ${at(a0, outer)} A ${outer} ${outer} 0 0 1 ${at(a1, outer)} L ${at(a1, inner)} A ${inner} ${inner} 0 0 0 ${at(a0, inner)} Z`;
}
