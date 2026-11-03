import { create } from "zustand";
import { ALL_FILTERS, type ChordFilter } from "@/lib/chords/catalog";
import { ALL_FILTERS as ALL_SCALE_FILTERS, type ScaleFilter } from "@/lib/scales/catalog";
import type { ParallelStage } from "@/lib/scales/parallel";
import type { ScaleMode } from "@/lib/scales/quiz";
import type { Direction, IntervalStats, Range } from "./quiz";
import { setMuted } from "@/lib/audio";

const STORAGE_KEY = "halfstep-v6";

export type Topic = "intervals" | "chords" | "accidentals" | "scales" | "circle";

export interface DrillSettings {
  direction: Direction;
  range: Range;
  topic: Topic;
  chordFilters: ChordFilter[];
  scaleFilters: ScaleFilter[];
  scaleMode: ScaleMode;
  parallelStage: ParallelStage;
  sessionLength: 5 | 10 | 15;
  soundOn: boolean;
  autoAdvance: boolean;
  autoSeconds: number;
}

export interface DrillStats {
  reviewed: number;
  correct: number;
  streak: number;
  bestStreak: number;
  byId: Record<string, IntervalStats>;
}

interface DrillState extends DrillSettings, DrillStats {
  hydrated: boolean;
  hydrate: () => void;
  setDirection: (direction: Direction) => void;
  setRange: (range: Range) => void;
  setTopic: (topic: Topic) => void;
  toggleChordFilter: (filter: ChordFilter) => void;
  setAllChordFilters: (on: boolean) => void;
  toggleScaleFilter: (filter: ScaleFilter) => void;
  setAllScaleFilters: (on: boolean) => void;
  setScaleMode: (mode: ScaleMode) => void;
  setParallelStage: (stage: ParallelStage) => void;
  setSessionLength: (length: 5 | 10 | 15) => void;
  setSoundOn: (on: boolean) => void;
  setAutoAdvance: (on: boolean) => void;
  setAutoSeconds: (seconds: number) => void;
  recordAnswer: (id: string, correct: boolean) => void;
}

const defaults: DrillSettings & DrillStats = {
  direction: "both",
  range: "core",
  topic: "intervals",
  chordFilters: ["major", "minor"],
  scaleFilters: ["major", "minor", "natural-minor", "harmonic-minor"],
  scaleMode: "spell",
  parallelStage: 2,
  sessionLength: 10,
  soundOn: true,
  autoAdvance: true,
  autoSeconds: 2,
  reviewed: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  byId: {},
};

function persist(state: DrillState) {
  if (typeof window === "undefined") return;
  const payload: DrillSettings & DrillStats = {
    direction: state.direction,
    range: state.range,
    topic: state.topic,
    chordFilters: state.chordFilters,
    scaleFilters: state.scaleFilters,
    scaleMode: state.scaleMode,
    parallelStage: state.parallelStage,
    sessionLength: state.sessionLength,
    soundOn: state.soundOn,
    autoAdvance: state.autoAdvance,
    autoSeconds: state.autoSeconds,
    reviewed: state.reviewed,
    correct: state.correct,
    streak: state.streak,
    bestStreak: state.bestStreak,
    byId: state.byId,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function clampSeconds(value: unknown): number {
  const n = typeof value === "number" ? value : 2;
  if (n < 0 || n > 5 || !Number.isInteger(n)) return 2;
  return n;
}

function parseStage(value: unknown): ParallelStage {
  if (value === 1 || value === 2 || value === 3 || value === 4 || value === "ladder") return value;
  if (value === "1" || value === "2" || value === "3" || value === "4") return Number(value) as 1 | 2 | 3 | 4;
  return defaults.parallelStage;
}

export const useDrillStore = create<DrillState>((set, get) => ({
  ...defaults,
  hydrated: false,
  hydrate: () => {
    if (typeof window === "undefined") return;
    try {
      const raw =
        localStorage.getItem(STORAGE_KEY) ??
        localStorage.getItem("halfstep-v5") ??
        localStorage.getItem("halfstep-v4") ??
        localStorage.getItem("halfstep-v3") ??
        localStorage.getItem("halfstep-v2") ??
        localStorage.getItem("halfstep-v1");
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<DrillSettings & DrillStats>;
        const filters = parsed.chordFilters?.length
          ? parsed.chordFilters.filter((item): item is ChordFilter => ALL_FILTERS.includes(item))
          : defaults.chordFilters;
        const scaleFilters = parsed.scaleFilters?.length
          ? parsed.scaleFilters.filter((item): item is ScaleFilter => ALL_SCALE_FILTERS.includes(item))
          : defaults.scaleFilters;
        const topic =
          parsed.topic === "chords" ||
          parsed.topic === "accidentals" ||
          parsed.topic === "scales" ||
          parsed.topic === "circle"
            ? parsed.topic
            : "intervals";
        const soundOn = parsed.soundOn !== false;
        setMuted(!soundOn);
        set({
          direction: parsed.direction ?? defaults.direction,
          range: parsed.range ?? defaults.range,
          topic,
          chordFilters: filters.length ? filters : defaults.chordFilters,
          scaleFilters: scaleFilters.length ? scaleFilters : defaults.scaleFilters,
          scaleMode: parsed.scaleMode === "shift" ? "shift" : "spell",
          parallelStage: parseStage(parsed.parallelStage),
          sessionLength: parsed.sessionLength === 5 || parsed.sessionLength === 15 ? parsed.sessionLength : 10,
          soundOn,
          autoAdvance: parsed.autoAdvance !== false,
          autoSeconds: clampSeconds(parsed.autoSeconds),
          reviewed: parsed.reviewed ?? 0,
          correct: parsed.correct ?? 0,
          streak: parsed.streak ?? 0,
          bestStreak: parsed.bestStreak ?? 0,
          byId: parsed.byId ?? {},
          hydrated: true,
        });
        return;
      }
    } catch {
      /* ignore bad cache */
    }
    set({ hydrated: true });
  },
  setDirection: (direction) => {
    set({ direction });
    persist(get());
  },
  setRange: (range) => {
    set({ range });
    persist(get());
  },
  setTopic: (topic) => {
    set({ topic });
    persist(get());
  },
  toggleChordFilter: (filter) => {
    const current = get().chordFilters;
    const next = current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter];
    set({ chordFilters: next });
    persist(get());
  },
  setAllChordFilters: (on) => {
    set({ chordFilters: on ? [...ALL_FILTERS] : [] });
    persist(get());
  },
  toggleScaleFilter: (filter) => {
    const current = get().scaleFilters;
    const next = current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter];
    set({ scaleFilters: next });
    persist(get());
  },
  setAllScaleFilters: (on) => {
    set({ scaleFilters: on ? [...ALL_SCALE_FILTERS] : [] });
    persist(get());
  },
  setScaleMode: (scaleMode) => {
    set({ scaleMode });
    persist(get());
  },
  setParallelStage: (parallelStage) => {
    set({ parallelStage });
    persist(get());
  },
  setSessionLength: (sessionLength) => {
    set({ sessionLength });
    persist(get());
  },
  setSoundOn: (soundOn) => {
    setMuted(!soundOn);
    set({ soundOn });
    persist(get());
  },
  setAutoAdvance: (autoAdvance) => {
    set({ autoAdvance });
    persist(get());
  },
  setAutoSeconds: (seconds) => {
    set({ autoSeconds: clampSeconds(seconds) });
    persist(get());
  },
  recordAnswer: (id, correct) => {
    const state = get();
    const prev = state.byId[id] ?? { seen: 0, correct: 0 };
    const streak = correct ? state.streak + 1 : 0;
    set({
      reviewed: state.reviewed + 1,
      correct: state.correct + (correct ? 1 : 0),
      streak,
      bestStreak: Math.max(state.bestStreak, streak),
      byId: {
        ...state.byId,
        [id]: {
          seen: prev.seen + 1,
          correct: prev.correct + (correct ? 1 : 0),
        },
      },
    });
    persist(get());
  },
}));
