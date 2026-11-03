import { useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { accidentalGlyph, type Letter } from "@/lib/intervals/catalog";
import { cn } from "@/lib/utils";

const MIN = -2;
const MAX = 2;
const STEP = 28;

export function NoteSlider({
  letter,
  accidental,
  origin = 0,
  degree,
  mark,
  locked,
  onChange,
}: {
  letter: Letter;
  accidental: number;
  origin?: number;
  degree: number;
  mark: "correct" | "wrong" | null;
  locked: boolean;
  onChange: (accidental: number) => void;
}) {
  const drag = useRef<{ y: number; acc: number } | null>(null);
  const delta = accidental - origin;

  function setAcc(next: number) {
    const clamped = Math.max(MIN, Math.min(MAX, next));
    if (clamped !== accidental) onChange(clamped);
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (locked) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { y: event.clientY, acc: accidental };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current || locked) return;
    const steps = Math.round((drag.current.y - event.clientY) / STEP);
    setAcc(drag.current.acc + steps);
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    drag.current = null;
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <button
        type="button"
        aria-label={`Raise ${letter}`}
        disabled={locked || accidental >= MAX}
        onClick={() => setAcc(accidental + 1)}
        className="flex h-9 w-full items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground disabled:opacity-30"
      >
        <ChevronUp className="size-4" />
      </button>
      <div
        role="slider"
        aria-label={`${letter} degree ${degree}`}
        aria-valuemin={MIN}
        aria-valuemax={MAX}
        aria-valuenow={accidental}
        tabIndex={locked ? -1 : 0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={(event) => {
          if (locked) return;
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setAcc(accidental + 1);
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setAcc(accidental - 1);
          }
        }}
        className={cn(
          "mt-0.5 flex h-14 w-full touch-none select-none items-center justify-center rounded-lg shadow-border transition-[background-color,color,transform] duration-150",
          mark === "correct" && "bg-success text-success-foreground",
          mark === "wrong" && "bg-destructive text-destructive-foreground",
          mark === null && delta < 0 && "bg-lowered text-lowered-foreground",
          mark === null && delta > 0 && "bg-raised text-raised-foreground",
          mark === null && delta === 0 && "bg-secondary text-foreground",
          locked && "cursor-default",
          !locked && "cursor-ns-resize",
        )}
        style={{ transform: `translateY(${-accidental * 6}px)` }}
      >
        <span className="font-display text-lg leading-none">
          {letter}
          {accidentalGlyph(accidental)}
        </span>
      </div>
      <button
        type="button"
        aria-label={`Lower ${letter}`}
        disabled={locked || accidental <= MIN}
        onClick={() => setAcc(accidental - 1)}
        className="mt-0.5 flex h-9 w-full items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground disabled:opacity-30"
      >
        <ChevronDown className="size-4" />
      </button>
      <span className="mt-1 text-xs tabular-nums text-muted-foreground">{degree}</span>
    </div>
  );
}
