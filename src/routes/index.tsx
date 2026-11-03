import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChordDrill } from "@/components/chord-drill";
import { ChordLesson } from "@/components/chord-lesson";
import { CircleDrill, type CircleResult } from "@/components/circle-drill";
import { DrillView } from "@/components/drill-view";
import { InversionDrill } from "@/components/inversion-drill";
import { KeysDrill } from "@/components/keys-drill";
import { MixedDrill } from "@/components/mixed-drill";
import { NotesLesson, type NotesPractice } from "@/components/notes-lesson";
import { ParallelDrill } from "@/components/parallel-drill";
import { ScaleDrill } from "@/components/scale-drill";
import { SettingsView } from "@/components/settings-view";
import { StartView } from "@/components/start-view";
import { SummaryView, type SummaryItem } from "@/components/summary-view";
import { makeChordSession, type ChordQuestion, type ChordResult } from "@/lib/chords/quiz";
import type { ChordFilter } from "@/lib/chords/catalog";
import type { IntervalId } from "@/lib/intervals/catalog";
import { noteLabel, stepsPhrase } from "@/lib/intervals/catalog";
import { makeSession, type CardResult, type Question } from "@/lib/intervals/quiz";
import { useDrillStore, type Activity, type FlashTopic } from "@/lib/intervals/store";
import { makeInversionSession, type InversionQuestion, type InversionResult } from "@/lib/inversions/quiz";
import { makeKeySession, type KeyQuestion, type KeyResult } from "@/lib/keys/quiz";
import { makeMix, type MixCard } from "@/lib/mix";
import { formulaStrip, notesPhrase } from "@/lib/scales/catalog";
import type { ParallelResult } from "@/lib/scales/parallel";
import { makeScaleSession, type ScaleQuestion, type ScaleResult } from "@/lib/scales/quiz";

export const Route = createFileRoute("/")({ component: Home });

type Screen =
  | "flash"
  | "start"
  | "settings"
  | "intervals"
  | "chords"
  | "accidentals"
  | "scales"
  | "inversions"
  | "parallel"
  | "chord-lesson"
  | "notes"
  | "summary"
  | "circle"
  | "mix";

type Round = "single" | "mix" | "circle" | "lesson";

function Home() {
  const hydrate = useDrillStore((s) => s.hydrate);
  const [screen, setScreen] = useState<Screen>("start");
  const [round, setRound] = useState<Round>("single");
  const [intervalCards, setIntervalCards] = useState<Question[]>([]);
  const [chordCards, setChordCards] = useState<ChordQuestion[]>([]);
  const [keyCards, setKeyCards] = useState<KeyQuestion[]>([]);
  const [scaleCards, setScaleCards] = useState<ScaleQuestion[]>([]);
  const [inversionCards, setInversionCards] = useState<InversionQuestion[]>([]);
  const [mixCards, setMixCards] = useState<MixCard[]>([]);
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [focusIds, setFocusIds] = useState<string[] | undefined>();
  const [circleIds, setCircleIds] = useState<string[] | undefined>();
  const [practiceFilter, setPracticeFilter] = useState<ChordFilter | null>(null);

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

  function startChords(ids?: string[], filters?: ChordFilter[]) {
    const { byId, chordFilters, sessionLength } = useDrillStore.getState();
    const length = ids?.length ? Math.max(6, ids.length * 2) : sessionLength;
    setChordCards(makeChordSession({ length, stats: byId, filters: filters ?? chordFilters, onlyIds: ids }));
    setFocusIds(ids);
    setScreen("chords");
  }

  function practiceChords(filter: ChordFilter, ids?: string[]) {
    setPracticeFilter(filter);
    setRound("single");
    startChords(ids, [filter]);
  }

  function openActivity(activity: Activity) {
    setPracticeFilter(null);
    useDrillStore.getState().setActivity(activity);
    if (activity === "flash") {
      setScreen("flash");
      return;
    }
    start();
  }

  function startKeys(ids?: string[]) {
    const { byId, sessionLength } = useDrillStore.getState();
    const length = ids?.length ? Math.max(6, ids.length * 2) : sessionLength;
    setKeyCards(makeKeySession({ length, stats: byId, onlyIds: ids }));
    setFocusIds(ids);
    setScreen("accidentals");
  }

  function startScales(ids?: string[]) {
    const { byId, scaleFilters, sessionLength } = useDrillStore.getState();
    const length = ids?.length ? Math.max(6, ids.length * 2) : sessionLength;
    setScaleCards(makeScaleSession({ length, stats: byId, filters: scaleFilters, onlyIds: ids }));
    setFocusIds(ids);
    setScreen("scales");
  }

  function startInversions(ids?: string[]) {
    const { byId, sessionLength } = useDrillStore.getState();
    const length = ids?.length ? Math.max(6, ids.length * 2) : sessionLength;
    setInversionCards(makeInversionSession({ length, stats: byId, onlyIds: ids }));
    setFocusIds(ids);
    setScreen("inversions");
  }

  function startMix(cards?: MixCard[]) {
    const state = useDrillStore.getState();
    const topics = (state.flashTopics.length ? state.flashTopics : ["intervals"]) as FlashTopic[];
    const next =
      cards ??
      makeMix({
        topics,
        length: state.sessionLength,
        stats: state.byId,
        direction: state.direction,
        range: state.range,
        chordFilters: state.chordFilters,
        scaleFilters: state.scaleFilters,
      });
    setMixCards(next);
    setFocusIds(undefined);
    setRound("mix");
    setScreen("mix");
  }

  function practiceFromNotes(kind: NotesPractice) {
    if (kind === "scale-lesson") {
      useDrillStore.getState().setActivity("scale-lesson");
      setRound("lesson");
      setScreen("parallel");
      return;
    }
    const topic: FlashTopic =
      kind === "keys" ? "accidentals" : kind === "inversions" ? "inversions" : kind === "scales" ? "scales" : "intervals";
    const store = useDrillStore.getState();
    store.setAllFlashTopics(false);
    store.toggleFlashTopic(topic);
    setPracticeFilter(null);
    setRound("single");
    if (topic === "accidentals") startKeys();
    else if (topic === "scales") startScales();
    else if (topic === "inversions") startInversions();
    else startIntervals();
  }

  function start(ids?: string[]) {
    setPracticeFilter(null);
    const { activity, flashTopics } = useDrillStore.getState();
    if (activity === "circle") {
      setRound("circle");
      setCircleIds(ids);
      setScreen("circle");
      return;
    }
    if (activity === "scale-lesson") {
      setRound("lesson");
      setScreen("parallel");
      return;
    }
    if (activity === "chord-lesson") {
      setRound("lesson");
      setScreen("chord-lesson");
      return;
    }
    if (activity === "notes") {
      setRound("lesson");
      setScreen("notes");
      return;
    }
    const topics = flashTopics.length ? flashTopics : (["intervals"] as FlashTopic[]);
    if (topics.length > 1) {
      if (ids?.length && round === "mix") {
        const wanted = new Set(ids);
        const picked = mixCards.filter((card) => wanted.has(card.question.id));
        if (picked.length) {
          startMix(picked);
          return;
        }
      }
      startMix();
      return;
    }
    setRound("single");
    const topic = topics[0];
    if (topic === "chords") startChords(ids);
    else if (topic === "accidentals") startKeys(ids);
    else if (topic === "scales") startScales(ids);
    else if (topic === "inversions") startInversions(ids);
    else startIntervals(ids as IntervalId[] | undefined);
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

  function finishInversions(results: InversionResult[]) {
    setSummary(
      results.map((result) => ({
        id: result.question.id,
        name: result.question.chordName,
        detail: result.question.kind === "name" ? "Name the inversion" : "Spell the inversion",
        correct: result.correct,
      })),
    );
    setScreen("summary");
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      {screen === "start" ? (
        <StartView mode="launch" onOpen={openActivity} onSettings={() => setScreen("settings")} />
      ) : null}
      {screen === "flash" ? (
        <StartView mode="flash" onStart={() => start()} onBack={() => setScreen("start")} onSettings={() => setScreen("settings")} />
      ) : null}
      {screen === "settings" ? <SettingsView onBack={() => setScreen("start")} /> : null}
      {screen === "intervals" && intervalCards.length > 0 ? (
        <DrillView cards={intervalCards} onExit={() => setScreen("start")} onDone={finishIntervals} />
      ) : null}
      {screen === "chords" && chordCards.length > 0 ? (
        <ChordDrill
          cards={chordCards}
          filters={practiceFilter ? [practiceFilter] : undefined}
          onExit={() => {
            setPracticeFilter(null);
            setScreen("start");
          }}
          onDone={finishChords}
        />
      ) : null}
      {screen === "accidentals" && keyCards.length > 0 ? (
        <KeysDrill cards={keyCards} onExit={() => setScreen("start")} onDone={finishKeys} />
      ) : null}
      {screen === "scales" && scaleCards.length > 0 ? (
        <ScaleDrill cards={scaleCards} onExit={() => setScreen("start")} onDone={finishScales} />
      ) : null}
      {screen === "inversions" && inversionCards.length > 0 ? (
        <InversionDrill cards={inversionCards} onExit={() => setScreen("start")} onDone={finishInversions} />
      ) : null}
      {screen === "mix" && mixCards.length > 0 ? (
        <MixedDrill cards={mixCards} onExit={() => setScreen("start")} onDone={(items) => { setSummary(items); setScreen("summary"); }} />
      ) : null}
      {screen === "parallel" ? <ParallelDrill onExit={() => setScreen("start")} onDone={finishParallel} /> : null}
      {screen === "chord-lesson" ? (
        <ChordLesson onExit={() => setScreen("start")} onPractice={(filter) => practiceChords(filter)} />
      ) : null}
      {screen === "notes" ? <NotesLesson onExit={() => setScreen("start")} onPractice={practiceFromNotes} /> : null}
      {screen === "circle" ? (
        <CircleDrill onlyIds={circleIds} onExit={() => setScreen("start")} onDone={finishCircle} />
      ) : null}
      {screen === "summary" ? (
        <SummaryView
          items={summary}
          onAgain={() => (practiceFilter ? practiceChords(practiceFilter) : start(focusIds))}
          onMissed={() => {
            const missed = summary.filter((item) => !item.correct).map((item) => item.id);
            if (practiceFilter) practiceChords(practiceFilter, missed);
            else start(missed);
          }}
          onHome={() => {
            setPracticeFilter(null);
            setScreen("start");
          }}
        />
      ) : null}
    </main>
  );
}
