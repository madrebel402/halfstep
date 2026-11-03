import { ArrowRight, RotateCcw } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

export interface SummaryItem {
  id: string;
  name: string;
  detail: string;
  correct: boolean;
}

export function SummaryView({
  items,
  onAgain,
  onMissed,
  onHome,
}: {
  items: SummaryItem[];
  onAgain: () => void;
  onMissed: () => void;
  onHome: () => void;
}) {
  const score = items.filter((item) => item.correct).length;
  const missed = items.filter((item) => !item.correct);
  const total = items.length || 1;

  return (
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden px-4 pt-5">
      <header className="shrink-0">
        <BrandMark />
      </header>

      <section className="stagger-in mt-8 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pb-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Session</p>
          <h1 className="mt-2 font-display text-display tabular-nums">
            {score}
            <span className="text-muted-foreground"> / {items.length}</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {score === items.length
              ? "Clean set."
              : score / total >= 0.7
                ? "Solid work. Review the misses below, then run it again."
                : "Look at the misses, then drill those again."}
          </p>
        </div>

        {missed.length > 0 ? (
          <div className="rounded-2xl bg-card p-5 shadow-border">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Missed</p>
            <ul className="mt-3 divide-y divide-border">
              {missed.map((item) => (
                <li key={`${item.id}-${item.name}`} className="flex items-baseline justify-between gap-3 py-2.5">
                  <span className="text-sm capitalize">{item.name}</span>
                  <span className="text-right text-sm text-muted-foreground">{item.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <div className="-mx-4 flex shrink-0 flex-col gap-2 border-t border-border bg-background px-4 pt-3 safe-dock">
        {missed.length > 0 ? (
          <Button size="lg" className="h-12 rounded-lg" onClick={onMissed}>
            Drill the misses
            <ArrowRight />
          </Button>
        ) : null}
        <Button
          size="lg"
          variant={missed.length > 0 ? "outline" : "default"}
          className="h-12 rounded-lg"
          onClick={onAgain}
        >
          <RotateCcw />
          Drill again
        </Button>
        <Button variant="ghost" className="h-11" onClick={onHome}>
          Back home
        </Button>
      </div>
    </div>
  );
}
