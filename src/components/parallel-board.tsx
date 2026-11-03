import { ChevronDown, ChevronUp } from "lucide-react";
import {
  DEGREES,
  degreePitch,
  degreeTag,
  displayName,
  makeTonicNote,
  octavePitch,
  type Alteration,
  type AlterMap,
  type Degree,
  type Tonic,
} from "@/lib/scales/catalog";
import { cn } from "@/lib/utils";

export function ParallelBoard({
  tonic,
  alterations,
  locked,
  marks,
  onChange,
}: {
  tonic: Tonic;
  alterations: AlterMap;
  locked: Set<number>;
  marks: Record<number, "correct" | "wrong" | null>;
  onChange: (degree: Degree, next: Alteration) => void;
}) {
  const root = makeTonicNote(tonic);
  const octave = octavePitch(root);

  return (
    <div className="flex gap-0.5">
      {DEGREES.map((degree) => {
        const alt = alterations[degree];
        const major = degreePitch(root, degree, 0);
        const current = degreePitch(root, degree, alt);
        const isLocked = locked.has(degree);
        return (
          <DegreeColumn
            key={degree}
            degree={degree}
            tag={degreeTag(degree, alt)}
            current={displayName(current, alt, major)}
            ghost={alt !== 0 ? displayName(major, 0, major) : null}
            alt={alt}
            locked={isLocked}
            mark={marks[degree] ?? null}
            onChange={(next) => onChange(degree, next)}
          />
        );
      })}
      <DegreeColumn
        degree={8}
        tag="1"
        current={displayName(octave, 0, octave)}
        ghost={null}
        alt={0}
        locked
        mark={marks[8] ?? null}
        onChange={() => {}}
      />
    </div>
  );
}

function DegreeColumn({
  degree,
  tag,
  current,
  ghost,
  alt,
  locked,
  mark,
  onChange,
}: {
  degree: number;
  tag: string;
  current: string;
  ghost: string | null;
  alt: Alteration;
  locked: boolean;
  mark: "correct" | "wrong" | null;
  onChange: (next: Alteration) => void;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <button
        type="button"
        aria-label={`Raise degree ${degree}`}
        disabled={locked || alt >= 1}
        onClick={() => onChange((alt + 1) as Alteration)}
        className="flex h-7 w-full items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-20"
      >
        <ChevronUp className="size-3.5" />
      </button>
      <div
        className={cn(
          "relative mt-0.5 flex h-14 w-full flex-col items-center justify-center rounded-md px-0.5 shadow-border transition-colors duration-150",
          mark === "correct" && "bg-success text-success-foreground",
          mark === "wrong" && "bg-destructive text-destructive-foreground",
          mark === null && alt < 0 && "bg-lowered text-lowered-foreground",
          mark === null && alt > 0 && "bg-raised text-raised-foreground",
          mark === null && alt === 0 && "bg-secondary text-foreground",
          locked && "opacity-80",
        )}
        style={{ transform: `translateY(${-alt * 5}px)` }}
      >
        <span className="font-display text-sm leading-none">{current}</span>
        {ghost ? <span className="mt-0.5 text-xs leading-none text-current opacity-50 line-through">{ghost}</span> : null}
      </div>
      <button
        type="button"
        aria-label={`Lower degree ${degree}`}
        disabled={locked || alt <= -1}
        onClick={() => onChange((alt - 1) as Alteration)}
        className="mt-0.5 flex h-7 w-full items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-20"
      >
        <ChevronDown className="size-3.5" />
      </button>
      <span className="mt-1 text-xs font-medium tabular-nums text-muted-foreground">{tag}</span>
    </div>
  );
}
