import { useState } from "react";
import { ChordDrill } from "@/components/chord-drill";
import { DrillView } from "@/components/drill-view";
import { InversionDrill } from "@/components/inversion-drill";
import { KeysDrill } from "@/components/keys-drill";
import { ScaleDrill } from "@/components/scale-drill";
import type { SummaryItem } from "@/components/summary-view";
import { noteLabel, stepsPhrase } from "@/lib/intervals/catalog";
import { notesPhrase } from "@/lib/scales/catalog";
import type { MixCard } from "@/lib/mix";

export function MixedDrill({
  cards,
  onExit,
  onDone,
}: {
  cards: MixCard[];
  onExit: () => void;
  onDone: (items: SummaryItem[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState<SummaryItem[]>([]);
  const card = cards[index];
  const deck = { current: index + 1, total: cards.length };

  function push(next: SummaryItem[]) {
    const all = [...items, ...next];
    if (index + 1 >= cards.length) {
      onDone(all);
      return;
    }
    setItems(all);
    setIndex((i) => i + 1);
  }

  if (!card) return null;
  if (card.type === "intervals") {
    return (
      <DrillView
        key={card.question.id}
        cards={[card.question]}
        deck={deck}
        onExit={onExit}
        onDone={(results) =>
          push(
            results.map((result) => ({
              id: result.question.id,
              name: result.question.interval.name,
              detail: stepsPhrase(result.question.interval.steps),
              correct: result.correct,
            })),
          )
        }
      />
    );
  }
  if (card.type === "chords") {
    return (
      <ChordDrill
        key={card.question.id}
        cards={[card.question]}
        deck={deck}
        onExit={onExit}
        onDone={(results) =>
          push(
            results.map((result) => ({
              id: result.question.id,
              name: result.question.chord.name,
              detail: result.question.chord.notes.map((note) => noteLabel(note, false)).join(" · "),
              correct: result.correct,
            })),
          )
        }
      />
    );
  }
  if (card.type === "accidentals") {
    return (
      <KeysDrill
        key={card.question.id}
        cards={[card.question]}
        deck={deck}
        onExit={onExit}
        onDone={(results) =>
          push(
            results.map((result) => ({
              id: result.question.id,
              name: result.question.promptEmphasis,
              detail: result.question.answer,
              correct: result.correct,
            })),
          )
        }
      />
    );
  }
  if (card.type === "scales") {
    return (
      <ScaleDrill
        key={card.question.id}
        cards={[card.question]}
        deck={deck}
        onExit={onExit}
        onDone={(results) =>
          push(
            results.map((result) => ({
              id: result.question.id,
              name: result.question.scale.name,
              detail: notesPhrase(result.question.scale),
              correct: result.correct,
            })),
          )
        }
      />
    );
  }
  return (
    <InversionDrill
      key={card.question.id}
      cards={[card.question]}
      deck={deck}
      onExit={onExit}
      onDone={(results) =>
        push(
          results.map((result) => ({
            id: result.question.id,
            name: result.question.chordName,
            detail: result.question.kind === "name" ? "Name the inversion" : "Spell the inversion",
            correct: result.correct,
          })),
        )
      }
    />
  );
}
