import { accidentalGlyph } from "@/lib/intervals/catalog";
import { cn } from "@/lib/utils";

export function alterMotion(accidental: number): string {
  if (accidental < 0) return "translate-y-1.5";
  if (accidental > 0) return "-translate-y-1.5";
  return "";
}

export function alterFill(accidental: number): string {
  if (accidental < 0) return "bg-lowered text-lowered-foreground";
  if (accidental > 0) return "bg-raised text-raised-foreground";
  return "";
}

export function NoteRow({
  notes,
  className,
}: {
  notes: { letter: string; accidental: number }[];
  className?: string;
}) {
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      {notes.map((note, i) => (
        <span
          key={`${note.letter}${note.accidental}-${i}`}
          className={cn(
            "inline-flex min-w-8 items-center justify-center rounded-md px-1.5 py-0.5 transition-transform duration-200",
            alterMotion(note.accidental),
            note.accidental !== 0 && alterFill(note.accidental),
          )}
        >
          {note.letter}
          {accidentalGlyph(note.accidental)}
        </span>
      ))}
    </span>
  );
}
