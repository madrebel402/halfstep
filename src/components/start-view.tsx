import { ArrowRight, Check, Settings } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { ReferenceDialog } from "@/components/reference-dialog";
import { Chip, SettingsBar } from "@/components/settings-bar";
import { Button } from "@/components/ui/button";
import { unlockAudio } from "@/lib/audio";
import { ALL_FILTERS, FILTERS } from "@/lib/chords/catalog";
import { MNEMONIC_SHARPS } from "@/lib/keys/catalog";
import { useDrillStore } from "@/lib/intervals/store";
import { ALL_FILTERS as ALL_SCALE_FILTERS, FILTERS as SCALE_FILTERS } from "@/lib/scales/catalog";
import { cn } from "@/lib/utils";

export function StartView({ onStart, onSettings }: { onStart: () => void; onSettings: () => void }) {
  const topic = useDrillStore((s) => s.topic);
  const direction = useDrillStore((s) => s.direction);
  const range = useDrillStore((s) => s.range);
  const reviewed = useDrillStore((s) => s.reviewed);
  const correct = useDrillStore((s) => s.correct);
  const streak = useDrillStore((s) => s.streak);
  const bestStreak = useDrillStore((s) => s.bestStreak);
  const hydrated = useDrillStore((s) => s.hydrated);
  const chordFilters = useDrillStore((s) => s.chordFilters);
  const scaleFilters = useDrillStore((s) => s.scaleFilters);
  const scaleMode = useDrillStore((s) => s.scaleMode);
  const sessionLength = useDrillStore((s) => s.sessionLength);
  const setTopic = useDrillStore((s) => s.setTopic);
  const setDirection = useDrillStore((s) => s.setDirection);
  const setRange = useDrillStore((s) => s.setRange);
  const toggleChordFilter = useDrillStore((s) => s.toggleChordFilter);
  const setAllChordFilters = useDrillStore((s) => s.setAllChordFilters);
  const toggleScaleFilter = useDrillStore((s) => s.toggleScaleFilter);
  const setAllScaleFilters = useDrillStore((s) => s.setAllScaleFilters);
  const setScaleMode = useDrillStore((s) => s.setScaleMode);
  const autoAdvance = useDrillStore((s) => s.autoAdvance);
  const autoSeconds = useDrillStore((s) => s.autoSeconds);
  const setAutoAdvance = useDrillStore((s) => s.setAutoAdvance);

  const accuracy = reviewed === 0 ? "—" : `${Math.round((correct / reviewed) * 100)}%`;
  const allOn = ALL_FILTERS.every((item) => chordFilters.includes(item));
  const allScalesOn = ALL_SCALE_FILTERS.every((item) => scaleFilters.includes(item));
  const canStart =
    topic === "chords" ? chordFilters.length > 0 : topic === "scales" && scaleMode === "spell" ? scaleFilters.length > 0 : true;

  const copy =
    topic === "chords"
      ? {
          title: "Spell it. Name it.",
          body: "Build the notes, or read the notes and name the chord. Pick the types you want to drill.",
        }
      : topic === "accidentals"
        ? {
            title: "Name the key. Count the sharps.",
            body: "Major keys, and the rhymes that keep the orders in your head.",
          }
        : topic === "scales"
          ? scaleMode === "shift"
            ? {
                title: "One letter at a time.",
                body: "Start from C major. The lesson tells you which notes stay, which get flatted, and which get sharped.",
              }
            : {
                title: "Spell the scale.",
                body: "Build every note, or read the notes and name the scale. Check the types you want.",
              }
          : topic === "circle"
            ? {
                title: "Walk the circle.",
                body: "C stays on the diagram. Name the next key and how many sharps it has. Then the flats, the other way. Then the relative minor of each key.",
              }
            : {
                title: "Learn the space between notes.",
                body: "A half-step is one piano key to the next, black keys included. Name the interval, or count the steps.",
              };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pt-5 sm:pt-8">
      <header className="flex items-center justify-between">
        <BrandMark />
        <div className="flex items-center gap-1">
          {topic === "intervals" ? <ReferenceDialog /> : null}
          <Button variant="ghost" size="icon-sm" onClick={onSettings} aria-label="Settings">
            <Settings />
          </Button>
        </div>
      </header>

      <section className="stagger-in mt-6 flex flex-col gap-5 pb-4">
        <div>
          <h1 className="font-display text-display text-foreground">{copy.title}</h1>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">{copy.body}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["intervals", "Intervals", "Half-steps"],
              ["chords", "Chords", "Build and name"],
              ["accidentals", "Keys", "Sharps and flats"],
              ["scales", "Scales", "Spell or slide"],
            ] as const
          ).map(([id, label, hint]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTopic(id)}
              className={cn(
                "flex min-h-16 flex-col items-start justify-center rounded-xl px-4 py-3 text-left shadow-border transition-colors duration-150",
                topic === id ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary",
              )}
            >
              <span className="text-sm font-medium">{label}</span>
              <span className={cn("mt-0.5 text-xs", topic === id ? "text-primary-foreground/70" : "text-muted-foreground")}>
                {hint}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setTopic("circle")}
          className={cn(
            "flex min-h-16 flex-col items-start justify-center rounded-xl px-4 py-3 text-left shadow-border transition-colors duration-150",
            topic === "circle" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary",
          )}
        >
          <span className="text-sm font-medium">Circle of fifths</span>
          <span className={cn("mt-0.5 text-xs", topic === "circle" ? "text-primary-foreground/70" : "text-muted-foreground")}>
            Fifths, then fourths
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAutoAdvance(!autoAdvance)}
          className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 text-left shadow-border"
        >
          <span>
            <span className="block text-sm font-medium">Auto-advance</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {autoAdvance
                ? autoSeconds === 0
                  ? "On · skips the correct screen"
                  : `On · correct screen for ${autoSeconds}s`
                : "Off · you tap Next"}
            </span>
          </span>
          <span
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium",
              autoAdvance ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
            )}
          >
            {autoAdvance ? "On" : "Off"}
          </span>
        </button>

        {topic === "chords" ? (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Chord types</p>
            <CheckRow checked={allOn} onClick={() => setAllChordFilters(!allOn)} strong>
              Check all
            </CheckRow>
            <div className="grid grid-cols-2 gap-1">
              {FILTERS.map((item) => (
                <CheckRow
                  key={item.id}
                  checked={chordFilters.includes(item.id)}
                  onClick={() => toggleChordFilter(item.id)}
                >
                  {item.label}
                </CheckRow>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">7th chords include dominant 7, maj7, and m7.</p>
          </div>
        ) : topic === "accidentals" ? (
          <div className="rounded-2xl bg-card px-5 py-5 shadow-border">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Example · mnemonic</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">“{MNEMONIC_SHARPS}”</p>
            <p className="mt-2 font-display text-lg tracking-tight">The order sharps are added</p>
          </div>
        ) : topic === "scales" ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Play</p>
              <div className="flex flex-wrap gap-2">
                <Chip active={scaleMode === "spell"} onClick={() => setScaleMode("spell")}>
                  Spell the notes
                </Chip>
                <Chip active={scaleMode === "shift"} onClick={() => setScaleMode("shift")}>
                  Lesson
                </Chip>
              </div>
            </div>
            {scaleMode === "shift" ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Eight scales, always from C major. Mixolydian first, then the minor scales, then Phrygian and Locrian.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Scale types</p>
                <CheckRow checked={allScalesOn} onClick={() => setAllScaleFilters(!allScalesOn)} strong>
                  Check all
                </CheckRow>
                <div className="grid grid-cols-2 gap-1">
                  {SCALE_FILTERS.map((item) => (
                    <CheckRow
                      key={item.id}
                      checked={scaleFilters.includes(item.id)}
                      onClick={() => toggleScaleFilter(item.id)}
                    >
                      {item.label}
                    </CheckRow>
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Minor and natural minor are the same scale — the natural form.
                </p>
              </div>
            )}
          </div>
        ) : topic === "circle" ? (
          <div className="rounded-2xl bg-card px-5 py-5 shadow-border">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">First step</p>
            <p className="mt-3 font-display text-2xl tracking-tight">G · 1♯</p>
            <p className="mt-2 text-sm text-muted-foreground">
              One key sharper than C. The diagram keeps every key you fill in.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-card px-5 py-5 shadow-border">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Example · minor third</p>
            <p className="mt-3 font-display text-2xl tracking-tight">3 half-steps</p>
            <p className="mt-2 text-sm text-muted-foreground">Name it, or count it. Build the answer with the keys.</p>
          </div>
        )}

        {hydrated && reviewed > 0 ? (
          <dl className="grid grid-cols-3 gap-2">
            <Stat label="Reviewed" value={String(reviewed)} />
            <Stat label="Accuracy" value={accuracy} />
            <Stat label="Streak" value={String(Math.max(streak, bestStreak))} />
          </dl>
        ) : null}

        {topic === "intervals" ? (
          <SettingsBar direction={direction} range={range} onDirection={setDirection} onRange={setRange} />
        ) : null}
      </section>

      <div className="sticky bottom-0 z-10 -mx-4 mt-4 border-t border-border bg-background px-4 pt-3 safe-dock sm:static sm:mx-0 sm:mt-2 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-10">
        <Button
          size="lg"
          className="h-12 w-full rounded-lg"
          disabled={!canStart}
          onClick={() => {
            unlockAudio();
            onStart();
          }}
        >
          {topic === "circle" ? "Start the circle" : `Start ${sessionLength} cards`}
          <ArrowRight />
        </Button>
        {topic === "chords" && !canStart ? (
          <p className="mt-2 text-center text-xs text-muted-foreground">Pick at least one chord type.</p>
        ) : null}
        {topic === "scales" && !canStart ? (
          <p className="mt-2 text-center text-xs text-muted-foreground">Pick at least one scale type.</p>
        ) : null}
      </div>
    </div>
  );
}

function CheckRow({
  checked,
  onClick,
  children,
  strong = false,
}: {
  checked: boolean;
  onClick: () => void;
  children: string;
  strong?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 items-center gap-3 rounded-md px-2 text-left transition-colors duration-150 hover:bg-secondary"
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-sm border",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
        )}
      >
        {checked ? <Check className="size-3.5" strokeWidth={3} /> : null}
      </span>
      <span className={cn("text-sm", strong ? "font-medium" : "font-normal")}>{children}</span>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card px-3 py-3 shadow-border">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-display text-xl tabular-nums">{value}</dd>
    </div>
  );
}
