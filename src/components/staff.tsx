import { diatonicOffset, noteLabel, type SpelledNote } from "@/lib/intervals/catalog";
import { cn } from "@/lib/utils";

const LINE_GAP = 10;
const C4_Y = 86;
const STAFF_OFFSETS = [2, 4, 6, 8, 10];

function yFor(offsetFromC4: number): number {
  return C4_Y - offsetFromC4 * (LINE_GAP / 2);
}

function ledgerOffsets(d: number): number[] {
  const lines: number[] = [];
  if (d <= 1) {
    for (let line = 0; line >= d; line -= 2) lines.push(line);
  }
  if (d >= 11) {
    for (let line = 12; line <= d; line += 2) lines.push(line);
  }
  return lines;
}

function Accidental({ type, x, y }: { type: number; x: number; y: number }) {
  if (type === 0) return null;
  if (type > 0) {
    return (
      <g transform={`translate(${x} ${y})`} fill="none" stroke="currentColor" strokeWidth="1.35">
        <line x1="-3.2" y1="-9" x2="-3.2" y2="9" />
        <line x1="2.2" y1="-9" x2="2.2" y2="9" />
        <line x1="-5.4" y1="-3.2" x2="4.6" y2="-6.2" />
        <line x1="-5.4" y1="3.4" x2="4.6" y2="0.4" />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y})`} fill="currentColor" stroke="currentColor" strokeWidth="1.2">
      <line x1="-1.2" y1="-11" x2="-1.2" y2="6.5" fill="none" />
      <path d="M-1.2 2.2 C6.4 0.2 6.6 7.6 -1.2 6.5" fill="none" />
    </g>
  );
}

function NoteHead({ x, y }: { x: number; y: number }) {
  return <ellipse cx={x} cy={y} rx="6.6" ry="4.7" transform={`rotate(-18 ${x} ${y})`} fill="currentColor" />;
}

export function StaffInterval({
  lower,
  upper,
  compact = false,
}: {
  lower: SpelledNote;
  upper: SpelledNote;
  compact?: boolean;
}) {
  const d1 = diatonicOffset(lower) - 28;
  const d2 = diatonicOffset(upper) - 28;
  const y1 = yFor(d1);
  const y2 = yFor(d2);
  const isSecond = Math.abs(d2 - d1) === 1;
  const x = 168;
  const x2 = isSecond ? x + 13 : x;
  const ledgers = [...new Set([...ledgerOffsets(d1), ...ledgerOffsets(d2)])];

  return (
    <svg
      viewBox="0 0 260 128"
      className={cn("w-full text-foreground", compact && "max-h-28")}
      role="img"
      aria-label={`${noteLabel(lower)} to ${noteLabel(upper)}`}
    >
      {STAFF_OFFSETS.map((offset) => (
        <line
          key={offset}
          x1="36"
          x2="236"
          y1={yFor(offset)}
          y2={yFor(offset)}
          stroke="currentColor"
          strokeOpacity="0.28"
          strokeWidth="1"
        />
      ))}
      <g transform="translate(48 28)" fill="currentColor">
        <path d="M8.8 62.2c0 3.2-2.4 5.2-5.4 5.2-3.1 0-5.5-2.1-5.5-5.3 0-3.2 2.4-5.4 5.7-5.4 1.1 0 2.1.3 2.9.7.1-8.4.1-15.8.1-24-3.4 2.3-6.4 3.5-10 3.5-6.8 0-11.3-4.8-11.3-11.6C-14.7 16.2-7.6 8.6 2.8 8.6c3.2 0 6.1 1.1 9.6 3.6C13.3 5.8 17.2 1.6 23.9 1.6c5.9 0 9.8 4.1 9.8 10.1 0 12.1-15.3 14.7-15.3 30.4 0 6 .1 11.5.2 17.6zM-2.2 12.6c-5 0-8.2 3.6-8.2 8.2 0 4.5 3.3 7.8 7.9 7.8 2.7 0 5.2-1 8.3-3.4-1.2-8.1-2.5-12.6-8-12.6zm19.1-4.3c-3 0-5.2 2.5-6 7.2 4.4-1.7 8.3-4.6 8.3-8.5 0-2.4-1-3.4-2.3-3.4z" />
      </g>
      {ledgers.map((offset) => (
        <line
          key={`l-${offset}`}
          x1={x - 16}
          x2={x2 + 16}
          y1={yFor(offset)}
          y2={yFor(offset)}
          stroke="currentColor"
          strokeOpacity="0.38"
          strokeWidth="1"
        />
      ))}
      <Accidental type={lower.accidental} x={x - 18} y={y1} />
      <Accidental type={upper.accidental} x={x2 - 18} y={y2} />
      <NoteHead x={x} y={y1} />
      <NoteHead x={x2} y={y2} />
    </svg>
  );
}
