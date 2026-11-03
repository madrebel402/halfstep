import { Delete } from "lucide-react";
import { ROOT_LETTERS } from "@/lib/chords/catalog";
import type { Letter } from "@/lib/intervals/catalog";
import { cn } from "@/lib/utils";

const KEY =
  "flex h-12 items-center justify-center rounded-md bg-card text-xl font-semibold shadow-border transition-colors duration-150 hover:bg-secondary active:not-disabled:scale-[0.96] disabled:opacity-40";

const ACCIDENTALS: { value: number; glyph: string; label: string }[] = [
  { value: 2, glyph: "𝄪", label: "Double sharp" },
  { value: 1, glyph: "♯", label: "Sharp" },
  { value: -1, glyph: "♭", label: "Flat" },
  { value: -2, glyph: "𝄫", label: "Double flat" },
];

export function NoteKeypad({
  onLetter,
  onAccidental,
  onDelete,
  disabled = false,
}: {
  onLetter: (letter: Letter) => void;
  onAccidental?: (value: number) => void;
  onDelete?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-7 gap-1.5">
        {ROOT_LETTERS.map((letter) => (
          <button key={letter} type="button" disabled={disabled} onClick={() => onLetter(letter)} className={KEY}>
            {letter}
          </button>
        ))}
      </div>
      {onAccidental || onDelete ? (
        <div className="grid grid-cols-5 gap-1.5">
          {onAccidental
            ? ACCIDENTALS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => onAccidental(item.value)}
                  className={cn(KEY, "font-display text-2xl")}
                  aria-label={item.label}
                >
                  {item.glyph}
                </button>
              ))
            : null}
          {onDelete ? (
            <button type="button" disabled={disabled} onClick={onDelete} className={KEY} aria-label="Delete">
              <Delete />
            </button>
          ) : (
            <span />
          )}
        </div>
      ) : null}
    </div>
  );
}

export function ChoicePad({
  options,
  wrong,
  solved,
  answer,
  columns = 2,
  onPick,
}: {
  options: { value: string; label: string }[];
  wrong: string[];
  solved: boolean;
  answer?: string;
  columns?: 2 | 4 | 7;
  onPick: (value: string) => void;
}) {
  return (
    <div
      className={cn(
        "grid gap-1.5",
        columns === 7 && "grid-cols-7",
        columns === 4 && "grid-cols-4",
        columns === 2 && "grid-cols-2",
      )}
    >
      {options.map((option) => {
        const missed = wrong.includes(option.value);
        const showCorrect = solved && option.value === answer;
        return (
          <button
            key={option.value}
            type="button"
            disabled={solved || missed}
            onClick={() => onPick(option.value)}
            className={cn(
              KEY,
              "min-h-12 px-2 text-center text-lg font-semibold leading-none",
              showCorrect && "bg-success text-success-foreground hover:bg-success",
              missed && "bg-foreground text-primary-foreground hover:bg-foreground",
              solved && !showCorrect && !missed && "text-muted-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
