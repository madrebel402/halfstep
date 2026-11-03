import { BLACK_PCS, noteLabel, type SpelledNote } from "@/lib/intervals/catalog";
import { cn } from "@/lib/utils";

export function IntervalKeys({
  lower,
  upper,
  showCount,
}: {
  lower: SpelledNote;
  upper: SpelledNote;
  showCount: boolean;
}) {
  const start = Math.min(lower.midi, upper.midi);
  const end = Math.max(lower.midi, upper.midi);
  const keys: number[] = [];
  for (let midi = start; midi <= end; midi += 1) keys.push(midi);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-0.5">
        {keys.map((midi, index) => {
          const highlighted = midi === lower.midi || midi === upper.midi;
          const isBlack = BLACK_PCS.has(midi % 12);
          const label =
            midi === lower.midi ? noteLabel(lower, false) : midi === upper.midi ? noteLabel(upper, false) : "";
          return (
            <div key={midi} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-14 w-full items-end justify-center rounded-sm pb-1.5 text-xs font-medium tabular-nums transition-colors duration-150",
                  highlighted
                    ? "bg-highlight text-highlight-foreground"
                    : isBlack
                      ? "bg-foreground/80 text-background"
                      : "bg-secondary text-muted-foreground",
                )}
              >
                {label}
              </div>
              {showCount ? (
                <span className="h-4 text-xs tabular-nums text-muted-foreground">
                  {index === 0 || index === keys.length - 1 || keys.length <= 7 ? (index === 0 ? "0" : String(index)) : ""}
                </span>
              ) : (
                <span className="h-4" />
              )}
            </div>
          );
        })}
      </div>
      {showCount && keys.length > 1 ? (
        <p className="text-center text-xs text-muted-foreground">
          {keys.length <= 7
            ? "Count each key from the first. The last number is the size in half-steps."
            : `${keys.length - 1} half-steps from the first key to the last.`}
        </p>
      ) : null}
    </div>
  );
}
