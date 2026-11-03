import type { ReactNode } from "react";
import type { Direction, Range } from "@/lib/intervals/quiz";
import { cn } from "@/lib/utils";

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-12 rounded-md px-3 text-base font-semibold transition-colors duration-150",
        active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}

export function SettingsBar({
  direction,
  range,
  onDirection,
  onRange,
}: {
  direction: Direction;
  range: Range;
  onDirection: (value: Direction) => void;
  onRange: (value: Range) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Ask me</p>
        <div className="flex flex-wrap gap-2">
          <Chip active={direction === "both"} onClick={() => onDirection("both")}>
            Both ways
          </Chip>
          <Chip active={direction === "name-to-steps"} onClick={() => onDirection("name-to-steps")}>
            Name → steps
          </Chip>
          <Chip active={direction === "steps-to-name"} onClick={() => onDirection("steps-to-name")}>
            Steps → name
          </Chip>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Range</p>
        <div className="flex flex-wrap gap-2">
          <Chip active={range === "core"} onClick={() => onRange("core")}>
            Core
          </Chip>
          <Chip active={range === "full"} onClick={() => onRange("full")}>
            All 13
          </Chip>
        </div>
        <p className="text-xs text-muted-foreground">
          {range === "core"
            ? "Seconds, thirds, fourth, fifth, and octave."
            : "Adds unison, tritone, sixths, and sevenths."}
        </p>
      </div>
    </div>
  );
}
