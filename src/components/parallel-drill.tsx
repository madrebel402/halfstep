import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { CorrectBurst } from "@/components/correct-burst";
import { ParallelBoard } from "@/components/parallel-board";
import { ChoicePad } from "@/components/keypad";
import { Button } from "@/components/ui/button";
import {
  isMuted,
  playNote,
  playScaleThenTriad,
  setMuted,
  startDrone,
  stopDrone,
  unlockAudio,
} from "@/lib/audio";
import { useDrillStore } from "@/lib/intervals/store";
import {
  DEGREES,
  diagnose,
  displayName,
  degreePitch,
  formulaStrip,
  intervalCallout,
  lockedDegrees,
  makeTonicNote,
  octavePitch,
  scaleNotes,
  triadQuality,
  ZERO_ALTS,
  type Alteration,
  type AlterMap,
  type Degree,
} from "@/lib/scales/catalog";
import type { ParallelQuestion, ParallelResult } from "@/lib/scales/parallel";

type Mark = "correct" | "wrong" | null;
type Phase = "play" | "name" | "solved";

function emptyMarks(): Record<number, Mark> {
  return { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null, 8: null };
}

function locksFor(question: ParallelQuestion): Set<number> {
  if (question.prompt === "ladder") {
    const lock = new Set<number>([1, 8]);
    const idx = question.ladderIndex ?? 0;
    if (idx < 4) lock.add(2);
    if (idx < 5) lock.add(5);
    return lock;
  }
  return lockedDegrees(question.target);
}

function midisFor(question: ParallelQuestion, alts: AlterMap): { scale: number[]; triad: number[] } {
  const tonic = makeTonicNote(question.tonic);
  const notes = scaleNotes(question.tonic, alts);
  const octave = octavePitch(tonic);
  return {
    scale: [...notes.map((note) => note.midi), octave.midi],
    triad: [notes[0].midi, notes[2].midi, notes[4].midi],
  };
}

export function ParallelDrill({
  cards,
  onExit,
  onDone,
}: {
  cards: ParallelQuestion[];
  onExit: () => void;
  onDone: (results: ParallelResult[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [alts, setAlts] = useState<AlterMap>(cards[0]?.startAlterations ?? ZERO_ALTS);
  const [marks, setMarks] = useState<Record<number, Mark>>(emptyMarks);
  const [phase, setPhase] = useState<Phase>("play");
  const [missedFirst, setMissedFirst] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [callout, setCallout] = useState("");
  const [nameWrong, setNameWrong] = useState<string[]>([]);
  const [muted, setMutedState] = useState(isMuted());
  const resultsRef = useRef<ParallelResult[]>([]);
  const recordAnswer = useDrillStore((s) => s.recordAnswer);
  const streak = useDrillStore((s) => s.streak);

  const question = cards[index];
  const locked = phase === "play" ? locksFor(question) : new Set([1, 2, 3, 4, 5, 6, 7, 8]);
  const quality = triadQuality(alts);
  const formula = formulaStrip(alts);
  const notes = scaleNotes(question.tonic, alts);
  const root = makeTonicNote(question.tonic);
  const triadPhrase = ([1, 3, 5] as Degree[])
    .map((degree) => displayName(notes[degree - 1], alts[degree], degreePitch(root, degree, 0)))
    .join(" ");

  useEffect(() => {
    unlockAudio();
    startDrone(makeTonicNote(question.tonic).midi);
    return () => stopDrone();
  }, [question.tonic.id, question.tonic.letter, question.tonic.accidental]);

  function slide(degree: Degree, next: Alteration) {
    if (phase !== "play" || locked.has(degree)) return;
    unlockAudio();
    setAlts((prev) => ({ ...prev, [degree]: next }));
    setMarks((prev) => ({ ...prev, [degree]: null }));
    setCallout(intervalCallout(degree, next));
    setFeedback("");
    const pitch = scaleNotes(question.tonic, { ...alts, [degree]: next })[degree - 1];
    playNote(pitch.midi);
  }

  function submitPlay() {
    if (phase !== "play") return;
    const nextMarks: Record<number, Mark> = emptyMarks();
    let ok = true;
    for (const degree of DEGREES) {
      const hit = alts[degree] === question.requiredAlterations[degree];
      nextMarks[degree] = hit ? "correct" : "wrong";
      if (!hit) ok = false;
    }
    nextMarks[8] = "correct";
    setMarks(nextMarks);
    if (!ok) {
      setMissedFirst(true);
      setFeedback(diagnose(alts, question.target));
      return;
    }
    const { scale, triad } = midisFor(question, alts);
    playScaleThenTriad(scale, triad);
    if (question.prompt === "shape" && question.nameChoices) {
      setPhase("name");
      setFeedback("");
      return;
    }
    finish(true);
  }

  function pickName(id: string) {
    if (phase !== "name") return;
    if (id === question.target.id) {
      finish(!missedFirst && nameWrong.length === 0);
      return;
    }
    setNameWrong((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setMissedFirst(true);
  }

  function finish(correct: boolean) {
    setPhase("solved");
    recordAnswer(question.target.id, correct);
    resultsRef.current = [...resultsRef.current, { question, correct }];
  }

  function goNext() {
    if (index + 1 >= cards.length) {
      stopDrone();
      onDone(resultsRef.current);
      return;
    }
    const next = cards[index + 1];
    setIndex((i) => i + 1);
    setAlts(next.startAlterations);
    setMarks(emptyMarks());
    setPhase("play");
    setMissedFirst(false);
    setFeedback("");
    setCallout("");
    setNameWrong([]);
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (next) stopDrone();
    else {
      unlockAudio();
      startDrone(makeTonicNote(question.tonic).midi);
    }
  }

  const detail = [
    formulaStrip(question.requiredAlterations),
    `${question.tonic.name} ${triadQuality(question.requiredAlterations)} triad.`,
    question.target.character,
    question.tooltip,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden px-4 pt-4">
      <header className="flex shrink-0 items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            stopDrone();
            onExit();
          }}
          aria-label="Back"
        >
          <ArrowLeft />
        </Button>
        <BrandMark compact />
        <Button variant="ghost" size="icon-sm" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
          {muted ? <VolumeX /> : <Volume2 />}
        </Button>
      </header>

      <div className="mt-3 flex shrink-0 items-center justify-between text-xs tabular-nums text-muted-foreground">
        <span>
          {index + 1} / {cards.length}
        </span>
        <span>{streak > 0 ? `Streak ${streak}` : " "}</span>
      </div>
      <div className="mt-2 h-1 shrink-0 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-foreground transition-[width] duration-200 ease-out"
          style={{ width: `${(index / cards.length) * 100}%` }}
        />
      </div>

      <article key={question.id} className="stagger-in mt-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-3">
        <div className="rounded-2xl bg-card px-3 py-4 shadow-border sm:px-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {question.prompt === "ladder"
              ? `Brightness ladder · ${question.tonic.name}`
              : question.prompt === "shape"
                ? `Shape → name · ${question.tonic.name} major`
                : question.prompt === "function"
                  ? `Function → shape · ${question.tonic.name} major`
                  : "Name → shape"}
          </p>
          <h2 className="mt-2 font-display text-xl leading-snug tracking-tight sm:text-2xl">{question.instruction}</h2>
          {question.tooltip ? <p className="mt-1 text-xs text-muted-foreground">{question.tooltip}</p> : null}

          <div className="mt-4">
            <ParallelBoard tonic={question.tonic} alterations={alts} locked={locked} marks={marks} onChange={slide} />
          </div>

          <div className="mt-4 rounded-lg bg-secondary/70 px-3 py-2">
            <p className="font-display text-lg tracking-wide">{formula}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Triad {triadPhrase} · {quality}
              {callout ? ` · ${callout}` : ""}
            </p>
          </div>

          {phase === "name" && question.nameChoices ? (
            <div className="mt-4">
              <p className="mb-2 text-sm text-muted-foreground">Which scale is that?</p>
              <ChoicePad
                options={question.nameChoices.map((item) => ({ value: item.id, label: item.label }))}
                wrong={nameWrong}
                solved={false}
                onPick={pickName}
              />
            </div>
          ) : null}

          {phase === "solved" ? (
            <div className="mt-4">
              <CorrectBurst detail={detail} streak={streak} compact />
            </div>
          ) : feedback ? (
            <p className="mt-3 text-sm leading-snug text-foreground">{feedback}</p>
          ) : phase === "play" ? (
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-lowered" />
                Flattened · yellow
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-raised" />
                Raised · orange
              </span>
            </p>
          ) : null}
        </div>
      </article>

      <div className="-mx-4 shrink-0 border-t border-border bg-background px-4 pt-3 safe-dock">
        {phase === "solved" ? (
          <Button size="lg" className="h-12 w-full rounded-lg" onClick={goNext}>
            {index + 1 >= cards.length ? "See results" : question.prompt === "ladder" ? "Next step" : "Next scale"}
          </Button>
        ) : phase === "play" ? (
          <Button size="lg" className="h-12 w-full rounded-lg" onClick={submitPlay}>
            Submit
          </Button>
        ) : (
          <p className="pb-1 text-center text-xs text-muted-foreground">Name the scale</p>
        )}
      </div>
    </div>
  );
}
