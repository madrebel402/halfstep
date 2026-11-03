import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const LINES = ["Nailed it.", "That's the one.", "Locked in.", "Yes."];

export function CorrectBurst({
  detail,
  streak = 0,
  compact = false,
}: {
  detail?: string;
  streak?: number;
  compact?: boolean;
}) {
  const line = streak >= 4 ? `Streak ${streak}.` : LINES[streak % LINES.length];

  return (
    <div
      className={cn(
        "correct-burst relative overflow-hidden rounded-2xl bg-success text-success-foreground shadow-border",
        compact ? "px-4 py-4" : "px-5 py-5",
      )}
    >
      <span className="correct-ring" aria-hidden="true" />
      <div className="relative flex items-start gap-3">
        <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-success-foreground/15">
          <Check className="size-5" strokeWidth={3} />
        </span>
        <div className="min-w-0">
          <p className="correct-pop font-display text-4xl leading-none tracking-tight">Correct</p>
          <p className="mt-2 text-sm font-medium tracking-wide uppercase opacity-80">{line}</p>
          {detail ? <p className="mt-2 text-sm leading-snug opacity-90">{detail}</p> : null}
        </div>
      </div>
    </div>
  );
}
