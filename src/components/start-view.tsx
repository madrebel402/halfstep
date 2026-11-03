import { ArrowLeft, ArrowRight, Check, Settings } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { ReferenceDialog } from "@/components/reference-dialog";
import { SettingsBar } from "@/components/settings-bar";
import { Button } from "@/components/ui/button";
import { unlockAudio } from "@/lib/audio";
import { ALL_FILTERS, FILTERS } from "@/lib/chords/catalog";
import { useDrillStore, type Activity } from "@/lib/intervals/store";
import { ALL_FILTERS as ALL_SCALE_FILTERS, FILTERS as SCALE_FILTERS } from "@/lib/scales/catalog";
import { cn } from "@/lib/utils";

const FLASH_CARDS = [
  ["intervals", "Intervals", "Half-steps"],
  ["chords", "Chords", "Build and name"],
  ["accidentals", "Keys", "Sharps and flats"],
  ["scales", "Scales", "Spell the notes"],
  ["inversions", "Inversions", "Root, 1st, 2nd"],
] as const;

const PAGES: { id: Activity; label: string; hint: string }[] = [
  { id: "flash", label: "Flashcards", hint: "Intervals, chords, keys, scales, inversions" },
  { id: "circle", label: "Circle", hint: "Fifths, fourths, then relative minors" },
  { id: "scale-lesson", label: "Scale lesson", hint: "Build each scale from C major" },
  { id: "chord-lesson", label: "Chord lesson", hint: "Count the intervals from the root" },
];

export function StartView({
  mode,
  onOpen,
  onStart,
  onBack,
  onSettings,
}: {
  mode: "launch" | "flash";
  onOpen?: (activity: Activity) => void;
  onStart?: () => void;
  onBack?: () => void;
  onSettings: () => void;
}) {
  const flashTopics = useDrillStore((s) => s.flashTopics);
  const direction = useDrillStore((s) => s.direction);
  const range = useDrillStore((s) => s.range);
  const reviewed = useDrillStore((s) => s.reviewed);
  const correct = useDrillStore((s) => s.correct);
  const streak = useDrillStore((s) => s.streak);
  const bestStreak = useDrillStore((s) => s.bestStreak);
  const hydrated = useDrillStore((s) => s.hydrated);
  const chordFilters = useDrillStore((s) => s.chordFilters);
  const scaleFilters = useDrillStore((s) => s.scaleFilters);
  const sessionLength = useDrillStore((s) => s.sessionLength);
  const toggleFlashTopic = useDrillStore((s) => s.toggleFlashTopic);
  const setAllFlashTopics = useDrillStore((s) => s.setAllFlashTopics);
  const setDirection = useDrillStore((s) => s.setDirection);
  const setRange = useDrillStore((s) => s.setRange);
  const toggleChordFilter = useDrillStore((s) => s.toggleChordFilter);
  const setAllChordFilters = useDrillStore((s) => s.setAllChordFilters);
  const toggleScaleFilter = useDrillStore((s) => s.toggleScaleFilter);
  const setAllScaleFilters = useDrillStore((s) => s.setAllScaleFilters);

  const accuracy = reviewed === 0 ? "—" : `${Math.round((correct / reviewed) * 100)}%`;
  const allOn = ALL_FILTERS.every((item) => chordFilters.includes(item));
  const allScalesOn = ALL_SCALE_FILTERS.every((item) => scaleFilters.includes(item));
  const allFlash = flashTopics.length === FLASH_CARDS.length;
  const canStart =
    flashTopics.length === 0
      ? false
      : flashTopics.includes("chords") && chordFilters.length === 0
        ? false
        : flashTopics.includes("scales") && scaleFilters.length === 0
          ? false
          : true;

  if (mode === "launch") {
    return (
      <div className="mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden px-4 pt-5 sm:pt-8">
        <header className="flex shrink-0 items-center justify-between">
          <BrandMark />
          <Button variant="ghost" size="icon-sm" onClick={onSettings} aria-label="Settings">
            <Settings />
          </Button>
        </header>
        <section className="stagger-in mt-6 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-6">
          <h1 className="font-display text-display text-foreground">What do you want to practice?</h1>
          <div className="flex flex-col gap-2">
            {PAGES.map((page) => (
              <button
                key={page.id}
                type="button"
                onClick={() => {
                  unlockAudio();
                  onOpen?.(page.id);
                }}
                className="flex min-h-16 flex-col items-start justify-center rounded-xl bg-card px-4 py-3 text-left shadow-border"
              >
                <span className="text-sm font-medium">{page.label}</span>
                <span className="mt-0.5 text-xs text-muted-foreground">{page.hint}</span>
              </button>
            ))}
          </div>
          {hydrated && reviewed > 0 ? (
            <dl className="grid grid-cols-3 gap-2">
              <Stat label="Reviewed" value={String(reviewed)} />
              <Stat label="Accuracy" value={accuracy} />
              <Stat label="Streak" value={String(Math.max(streak, bestStreak))} />
            </dl>
          ) : null}
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden px-4 pt-4">
      <header className="flex shrink-0 items-center justify-between gap-2">
        <Button variant="ghost" size="icon-sm" onClick={onBack} aria-label="Back">
          <ArrowLeft />
        </Button>
        <BrandMark compact />
        <div className="flex items-center justify-end">
          {flashTopics.includes("intervals") ? <ReferenceDialog /> : <span className="size-9" />}
          <Button variant="ghost" size="icon-sm" onClick={onSettings} aria-label="Settings">
            <Settings />
          </Button>
        </div>
      </header>

      <section className="stagger-in mt-4 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-4">
        <div>
          <h1 className="font-display text-display text-foreground">Flashcards</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Check one category, or mix two or more.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Categories</p>
            <button type="button" onClick={() => setAllFlashTopics(!allFlash)} className="text-xs font-medium text-highlight">
              {allFlash ? "Clear" : "All"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {FLASH_CARDS.map(([id, label, hint]) => {
              const on = flashTopics.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleFlashTopic(id)}
                  className={cn(
                    "flex min-h-16 flex-col items-start justify-center rounded-xl px-4 py-3 text-left shadow-border transition-colors duration-150",
                    on ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary",
                  )}
                >
                  <span className="text-sm font-medium">{label}</span>
                  <span className={cn("mt-0.5 text-xs", on ? "text-primary-foreground/70" : "text-muted-foreground")}>{hint}</span>
                </button>
              );
            })}
          </div>
        </div>

        {flashTopics.includes("chords") ? (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Chord types</p>
            <CheckRow checked={allOn} onClick={() => setAllChordFilters(!allOn)} strong>
              Check all
            </CheckRow>
            <div className="grid grid-cols-2 gap-1">
              {FILTERS.map((item) => (
                <CheckRow key={item.id} checked={chordFilters.includes(item.id)} onClick={() => toggleChordFilter(item.id)}>
                  {item.label}
                </CheckRow>
              ))}
            </div>
          </div>
        ) : null}

        {flashTopics.includes("scales") ? (
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
          </div>
        ) : null}

        {flashTopics.includes("intervals") ? (
          <SettingsBar direction={direction} range={range} onDirection={setDirection} onRange={setRange} />
        ) : null}
      </section>

      <div className="-mx-4 shrink-0 border-t border-border bg-background px-4 pt-3 safe-dock">
        <Button
          size="lg"
          className="h-12 w-full rounded-lg"
          disabled={!canStart}
          onClick={() => {
            unlockAudio();
            onStart?.();
          }}
        >
          {flashTopics.length > 1 ? `Start ${sessionLength} mixed cards` : `Start ${sessionLength} cards`}
          <ArrowRight />
        </Button>
        {flashTopics.length === 0 ? (
          <p className="mt-2 text-center text-xs text-muted-foreground">Pick at least one category.</p>
        ) : null}
        {flashTopics.includes("chords") && chordFilters.length === 0 ? (
          <p className="mt-2 text-center text-xs text-muted-foreground">Pick at least one chord type.</p>
        ) : null}
        {flashTopics.includes("scales") && scaleFilters.length === 0 ? (
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
