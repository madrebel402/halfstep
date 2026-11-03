import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { stopDrone } from "@/lib/audio";
import {
  DEGREES,
  degreePitch,
  displayName,
  makeTonicNote,
  type Alteration,
  type Degree,
  type ScaleKind,
} from "@/lib/scales/catalog";
import { LESSON_TONIC, lessonResults, lessonScales, type ParallelResult } from "@/lib/scales/parallel";
import { cn } from "@/lib/utils";

const ORDINALS = ["", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th"];

export function ParallelDrill({
  onExit,
  onDone,
}: {
  onExit: () => void;
  onDone: (results: ParallelResult[]) => void;
}) {
  const scales = lessonScales();
  const [scaleIndex, setScaleIndex] = useState(0);
  const [degree, setDegree] = useState<Degree | "done">(1);
  const kind = scales[scaleIndex];

  useEffect(() => {
    stopDrone();
    return () => stopDrone();
  }, []);

  function next() {
    if (degree === "done") {
      if (scaleIndex + 1 >= scales.length) {
        onDone(lessonResults());
        return;
      }
      setScaleIndex((i) => i + 1);
      setDegree(1);
      return;
    }
    setDegree(degree === 7 ? "done" : ((degree + 1) as Degree));
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden px-4 pt-4">
      <header className="flex shrink-0 items-center justify-between gap-2">
        <Button variant="ghost" size="icon-sm" onClick={onExit} aria-label="Back">
          <ArrowLeft />
        </Button>
        <BrandMark compact />
        <span className="w-12 text-right text-xs tabular-nums text-muted-foreground">
          {scaleIndex + 1}/{scales.length}
        </span>
      </header>

      <div className="mt-4 flex min-h-0 flex-1 flex-col">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">From C major</p>
        <h2 className="mt-1 font-display text-2xl leading-snug tracking-tight">Let’s make C {kind.label}.</h2>

        <div className="mt-4 grid grid-cols-7 gap-1">
          {DEGREES.map((item) => (
            <NotePill key={item} kind={kind} degree={item} current={degree} />
          ))}
        </div>

        {degree === "done" ? (
          <div className="mt-4 rounded-2xl bg-card px-4 py-4 shadow-border">
            <p className="font-display text-xl tracking-tight">C {kind.label}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{kind.character}</p>
            <p className="mt-3 text-sm leading-relaxed">{changeSentence(kind)}</p>
          </div>
        ) : (
          <StepCopy kind={kind} degree={degree} />
        )}
      </div>

      <div className="-mx-4 shrink-0 border-t border-border bg-background px-4 pt-3 safe-dock">
        <Button size="lg" className="h-12 w-full rounded-lg" onClick={next}>
          {degree === "done" ? (scaleIndex + 1 >= scales.length ? "Finish" : "Next scale") : degree === 7 ? "See the scale" : "Next letter"}
        </Button>
      </div>
    </div>
  );
}

function NotePill({ kind, degree, current }: { kind: ScaleKind; degree: Degree; current: Degree | "done" }) {
  const shown = current === "done" || degree <= current;
  const alteration = shown ? kind.alterations[degree] : 0;
  const name = spell(degree, alteration);
  const active = current !== "done" && degree === current;
  return (
    <div
      className={cn(
        "flex h-14 items-center justify-center rounded-lg text-sm font-medium",
        active && alteration === -1 && "bg-lowered text-lowered-foreground ring-2 ring-foreground",
        active && alteration === 1 && "bg-raised text-raised-foreground ring-2 ring-foreground",
        active && alteration === 0 && "bg-primary text-primary-foreground",
        !active && shown && alteration === -1 && "bg-lowered/80 text-lowered-foreground",
        !active && shown && alteration === 1 && "bg-raised/80 text-raised-foreground",
        !active && shown && alteration === 0 && "bg-card text-foreground shadow-border",
        !shown && "bg-secondary text-muted-foreground",
      )}
    >
      {name}
    </div>
  );
}

function StepCopy({ kind, degree }: { kind: ScaleKind; degree: Degree }) {
  const alteration = kind.alterations[degree];
  const before = spell(degree, 0);
  const after = spell(degree, alteration);
  return (
    <div className="mt-4 rounded-2xl bg-card px-4 py-4 shadow-border">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{ORDINALS[degree]} degree</p>
      <p className="mt-2 font-display text-2xl tracking-tight">
        {alteration === 0 ? `${before} stays the same.` : alteration === -1 ? `Flat the ${before}.` : `Sharp the ${before}.`}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {alteration === 0
          ? degree === 1
            ? "It is the root of both scales."
            : `C ${kind.label} keeps this note.`
          : `${before} becomes ${after}.`}
      </p>
    </div>
  );
}

function spell(degree: Degree, alteration: Alteration): string {
  const root = makeTonicNote(LESSON_TONIC);
  const major = degreePitch(root, degree, 0);
  const note = degreePitch(root, degree, alteration);
  return displayName(note, alteration, major);
}

function changeSentence(kind: ScaleKind): string {
  const changed = DEGREES.filter((degree) => kind.alterations[degree] !== 0);
  if (changed.length === 0) return "Every note stays the same as C major.";
  const parts = changed.map((degree) => {
    const before = spell(degree, 0);
    return kind.alterations[degree] === -1 ? `${before} is flatted` : `${before} is sharped`;
  });
  return `From C major, ${join(parts)}.`;
}

function join(items: string[]): string {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}
