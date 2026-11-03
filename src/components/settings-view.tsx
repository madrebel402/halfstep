import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Chip } from "@/components/settings-bar";
import { Button } from "@/components/ui/button";
import { useDrillStore } from "@/lib/intervals/store";
import { cn } from "@/lib/utils";

const SECONDS = [0, 1, 2, 3, 4, 5] as const;

export function SettingsView({ onBack }: { onBack: () => void }) {
  const autoAdvance = useDrillStore((s) => s.autoAdvance);
  const autoSeconds = useDrillStore((s) => s.autoSeconds);
  const soundOn = useDrillStore((s) => s.soundOn);
  const sessionLength = useDrillStore((s) => s.sessionLength);
  const setAutoAdvance = useDrillStore((s) => s.setAutoAdvance);
  const setAutoSeconds = useDrillStore((s) => s.setAutoSeconds);
  const setSoundOn = useDrillStore((s) => s.setSoundOn);
  const setSessionLength = useDrillStore((s) => s.setSessionLength);
  const nightMode = useDrillStore((s) => s.nightMode);
  const setNightMode = useDrillStore((s) => s.setNightMode);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pt-5 sm:pt-8">
      <header className="flex items-center justify-between">
        <Button variant="ghost" size="icon-sm" onClick={onBack} aria-label="Back">
          <ArrowLeft />
        </Button>
        <BrandMark compact />
        <span className="size-9" />
      </header>

      <section className="stagger-in mt-6 flex flex-col gap-6 pb-10">
        <div>
          <h1 className="font-display text-display text-foreground">Settings</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            These stick on this phone. Auto-advance only runs after a correct answer.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-border">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Night mode</p>
              <p className="mt-1 text-xs text-muted-foreground">Easier on the eyes after dark.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={nightMode}
              onClick={() => setNightMode(!nightMode)}
              className={cn(
                "relative h-8 w-14 shrink-0 rounded-full transition-colors duration-150",
                nightMode ? "bg-primary" : "bg-secondary",
              )}
            >
              <span
                className={cn(
                  "absolute top-1 size-6 rounded-full shadow-border transition-transform duration-150",
                  nightMode ? "translate-x-7 bg-primary-foreground" : "translate-x-1 bg-foreground",
                )}
              />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-border">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Auto-advance</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {autoAdvance
                  ? autoSeconds === 0
                    ? "Correct screen is skipped. Next card is immediate."
                    : `Correct screen stays up for ${autoSeconds} second${autoSeconds === 1 ? "" : "s"}.`
                  : "You tap Next yourself."}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoAdvance}
              onClick={() => setAutoAdvance(!autoAdvance)}
              className={cn(
                "relative h-8 w-14 shrink-0 rounded-full transition-colors duration-150",
                autoAdvance ? "bg-primary" : "bg-secondary",
              )}
            >
              <span
                className={cn(
                  "absolute top-1 size-6 rounded-full shadow-border transition-transform duration-150",
                  autoAdvance ? "translate-x-7 bg-primary-foreground" : "translate-x-1 bg-foreground",
                )}
              />
            </button>
          </div>

          <div className={cn("flex flex-col gap-2", !autoAdvance && "pointer-events-none opacity-40")}>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Correct screen</p>
            <div className="flex flex-wrap gap-2">
              {SECONDS.map((n) => (
                <Chip key={n} active={autoSeconds === n} onClick={() => setAutoSeconds(n)}>
                  {n === 0 ? "None" : `${n}s`}
                </Chip>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              None jumps straight to the next card. Bonus questions need at least 1 second.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Round</p>
          <div className="flex flex-wrap gap-2">
            {([5, 10, 15] as const).map((n) => (
              <Chip key={n} active={sessionLength === n} onClick={() => setSessionLength(n)}>
                {n} cards
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Sound</p>
          <div className="flex flex-wrap gap-2">
            <Chip active={soundOn} onClick={() => setSoundOn(true)}>
              On
            </Chip>
            <Chip active={!soundOn} onClick={() => setSoundOn(false)}>
              Off
            </Chip>
          </div>
          <p className="text-xs text-muted-foreground">Lessons stay silent. This is saved for later.</p>
        </div>
      </section>
    </div>
  );
}
