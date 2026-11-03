import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChordDrill } from "@/components/chord-drill";
import { CircleDrill, type CircleResult } from "@/components/circle-drill";
import { DrillView } from "@/components/drill-view";
import { KeysDrill } from "@/components/keys-drill";
import { ParallelDrill } from "@/components/parallel-drill";
import { ScaleDrill } from "@/components/scale-drill";
import { SettingsView } from "@/components/settings-view";
import { StartView } from "@/components/start-view";
import { SummaryView, type SummaryItem } from "@/components/summary-view";
import { makeChordSession, type ChordQuestion, type ChordResult } from "@/lib/chords/quiz";
import type { IntervalId } from "@/lib/intervals/catalog";
import { noteLabel, stepsPhrase } from "@/lib/intervals/catalog";
import { makeSession, type CardResult, type Question } from "@/lib/intervals/quiz";
import { useDrillStore } from "@/lib/intervals/store";
import { makeKeySession, type KeyQuestion, type KeyResult } from "@/lib/keys/quiz";
import { formulaStrip, notesPhrase } from "@/lib/scales/catalog";
import type { ParallelResult } from "@/lib/scales/parallel";
import { makeScaleSession, type ScaleQuestion, type ScaleResult } from "@/lib/scales/quiz";

export const Route = createFileRoute("/")({ component: Home });

type Screen = "start" | "settings" | "intervals" | "chords" | "accidentals" | "scales" | "parallel" | "summary" | "circle";

function Home() {
  const hydrate = useDrillStore((s) => s.hydrate);
  const [screen, setScreen] = useState<Screen>("start");
  const [intervalCards, setIntervalCards] = useState<Question[]>([]);
  const [chordCards, setChordCards] = useState<ChordQuestion[]>([]);
  const [keyCards, setKeyCards] = useState<KeyQuestion[]>([]);
  const [scaleCards, setScaleCards] = useState<ScaleQuestion[]>([]);
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [focusIds, setFocusIds] = useState<string[] | undefined>();
  const [circleIds, setCircleIds] = useState<string[] | undefined>();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  function startIntervals(ids?: IntervalId[]) {
    const { direction, range, byId, sessionLength } = useDrillStore.getState();
    const length = ids?.length ? Math.max(6, ids.length * 2) : sessionLength;
    setIntervalCards(makeSession({ direction, range, length, stats: byId, onlyIds: ids }));
    setFocusIds(ids);
    setScreen("intervals");
  }

  function startChords(ids?: string[]) {
    const { byId, chordFilters, sessionLength } = useDrillStore.getState();
    const length = ids?.length ? Math.max(6, ids.length * 2) : sessionLength;
    setChordCards(makeChordSession({ length, stats: byId, filters: chordFilters, onlyIds: ids }));
    setFocusIds(ids);
    setScreen("chords");
  }

  function startKeys(ids?: string[]) {
    const { byId, sessionLength } = useDrillStore.getState();
    const length = ids?.length ? Math.max(6, ids.length * 2) : sessionLength;
    setKeyCards(makeKeySession({ length, stats: byId, onlyIds: ids }));
    setFocusIds(ids);
    setScreen("accidentals");
  }

  function startScales(ids?: string[]) {
    const { byId, scaleFilters, scaleMode, sessionLength } = useDrillStore.getState();
    if (scaleMode === "shift") {
      setScreen("parallel");
      return;
    }
    const length = ids?.length ? Math.max(6, ids.length * 2) : sessionLength;
    setScaleCards(makeScaleSession({ length, stats: byId, filters: scaleFilters, onlyIds: ids }));
    setFocusIds(ids);
    setScreen("scales");
  }

  function start(ids?: string[]) {
    const topic = useDrillStore.getState().topic;
    if (topic === "chords") startChords(ids);
    else if (topic === "accidentals") startKeys(ids);
    else if (topic === "scales") startScales(ids);
    else if (topic === "circle") {
      setCircleIds(ids);
      setScreen("circle");
    } else startIntervals(ids as IntervalId[] | undefined);
  }

  function finishIntervals(results: CardResult[]) {
    setSummary(
      results.map((result) => ({
        id: result.question.interval.id,
        name: result.question.interval.name,
        detail: stepsPhrase(result.question.interval.steps),
        correct: result.correct,
      })),
    );
    setScreen("summary");
  }

  function finishChords(results: ChordResult[]) {
    setSummary(
      results.map((result) => ({
        id: result.question.chord.id,
        name: result.question.chord.name,
        detail: result.question.chord.notes.map((note) => noteLabel(note, false)).join(" · "),
        correct: result.correct,
      })),
    );
    setScreen("summary");
  }

  function finishKeys(results: KeyResult[]) {
    setSummary(
      results.map((result) => ({
        id: result.question.topicId,
        name: result.question.promptEmphasis,
        detail: result.question.answer,
        correct: result.correct,
      })),
    );
    setScreen("summary");
  }

  function finishScales(results: ScaleResult[]) {
    setSummary(
      results.map((result) => ({
        id: result.question.scale.id,
        name: result.question.scale.name,
        detail: notesPhrase(result.question.scale),
        correct: result.correct,
      })),
    );
    setScreen("summary");
  }

  function finishCircle(results: CircleResult[]) {
    setSummary(results);
    setScreen("summary");
  }

  function finishParallel(results: ParallelResult[]) {
    setSummary(
      results.map((result) => ({
        id: result.question.target.id,
        name: `${result.question.tonic.name} ${result.question.target.label}`,
        detail: formulaStrip(result.question.requiredAlterations),
        correct: result.correct,
      })),
    );
    setScreen("summary");
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      {screen === "start" ? <StartView onStart={() => start()} onSettings={() => setScreen("settings")} /> : null}
      {screen === "settings" ? <SettingsView onBack={() => setScreen("start")} /> : null}
      {screen === "intervals" && intervalCards.length > 0 ? (
        <DrillView cards={intervalCards} onExit={() => setScreen("start")} onDone={finishIntervals} />
      ) : null}
      {screen === "chords" && chordCards.length > 0 ? (
        <ChordDrill cards={chordCards} onExit={() => setScreen("start")} onDone={finishChords} />
      ) : null}
      {screen === "accidentals" && keyCards.length > 0 ? (
        <KeysDrill cards={keyCards} onExit={() => setScreen("start")} onDone={finishKeys} />
      ) : null}
      {screen === "scales" && scaleCards.length > 0 ? (
        <ScaleDrill cards={scaleCards} onExit={() => setScreen("start")} onDone={finishScales} />
      ) : null}
      {screen === "parallel" ? <ParallelDrill onExit={() => setScreen("start")} onDone={finishParallel} /> : null}
      {screen === "circle" ? (
        <CircleDrill onlyIds={circleIds} onExit={() => setScreen("start")} onDone={finishCircle} />
      ) : null}
      {screen === "summary" ? (
        <SummaryView
          items={summary}
          onAgain={() => start(focusIds)}
          onMissed={() => start(summary.filter((item) => !item.correct).map((item) => item.id))}
          onHome={() => setScreen("start")}
        />
      ) : null}
    </main>
  );
}
