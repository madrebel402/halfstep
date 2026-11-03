import { create } from "zustand";
import { ALL_FILTERS, type ChordFilter } from "@/lib/chords/catalog";
import { ALL_FILTERS as ALL_SCALE_FILTERS, type ScaleFilter } from "@/lib/scales/catalog";
import type { ParallelStage } from "@/lib/scales/parallel";
import type { ScaleMode } from "@/lib/scales/quiz";
import type { Direction, IntervalStats, Range } from "./quiz";
import { setMuted } from "@/lib/audio";

const STORAGE_KEY = "halfstep-v6";

export type Topic = "intervals" | "chords" | "accidentals" | "scales" | "circle" | "inversions";
export type Activity = "flash" | "circle" | "scale-lesson" | "chord-lesson" | "notes";
export type FlashTopic = "intervals" | "chords" | "accidentals" | "scales" | "inversions";
export const FLASH_TOPICS: FlashTopic[] = ["intervals", "chords", "accidentals", "scales", "inversions"];

export interface DrillSettings {
  direction: Direction;
  range: Range;
  topic: Topic;
  activity: Activity;
  flashTopics: FlashTopic[];
  chordFilters: ChordFilter[];
  scaleFilters: ScaleFilter[];
  scaleMode: ScaleMode;
  parallelStage: ParallelStage;
  sessionLength: 5 | 10 | 15;
  soundOn: boolean;
  autoAdvance: boolean;
  autoSeconds: number;
  nightMode: boolean;
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
  setActivity: (activity: Activity) => void;
  toggleFlashTopic: (topic: FlashTopic) => void;
  setAllFlashTopics: (on: boolean) => void;
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
  setNightMode: (on: boolean) => void;
  recordAnswer: (id: string, correct: boolean) => void;
}

const defaults: DrillSettings & DrillStats = {
  direction: "both",
  range: "core",
  topic: "intervals",
  activity: "flash",
  flashTopics: ["intervals"],
  chordFilters: ["major", "minor"],
  scaleFilters: ["major", "minor", "natural-minor", "harmonic-minor"],
  scaleMode: "spell",
  parallelStage: 2,
  sessionLength: 10,
  soundOn: true,
  autoAdvance: true,
  autoSeconds: 2,
  nightMode: false,
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
    activity: state.activity,
    flashTopics: state.flashTopics,
    chordFilters: state.chordFilters,
    scaleFilters: state.scaleFilters,
    scaleMode: state.scaleMode,
    parallelStage: state.parallelStage,
    sessionLength: state.sessionLength,
    soundOn: state.soundOn,
    autoAdvance: state.autoAdvance,
    autoSeconds: state.autoSeconds,
    nightMode: state.nightMode,
    reviewed: state.reviewed,
    correct: state.correct,
    streak: state.streak,
    bestStreak: state.bestStreak,
    byId: state.byId,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function applyNight(on: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", on);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", on ? "#141210" : "#f3eee4");
}

function isFlashTopic(value: unknown): value is FlashTopic {
  return value === "intervals" || value === "chords" || value === "accidentals" || value === "scales" || value === "inversions";
}

function clampSeconds(value: unknown): number {
  const n = typeof value === "number" ? value : 2;
  if (n < 0 || n > 5 || !Number.isInteger(n)) return 2;
  return n;
}

function readChordFilters(value: unknown): ChordFilter[] {
  if (!Array.isArray(value) || value.length === 0) return defaults.chordFilters;
  const next: ChordFilter[] = [];
  for (const item of value) {
    if (item === "seventh") {
      for (const id of ["dom7", "maj7", "min7"] as const) {
        if (!next.includes(id)) next.push(id);
      }
      continue;
    }
    if (typeof item === "string" && ALL_FILTERS.includes(item as ChordFilter) && !next.includes(item as ChordFilter)) {
      next.push(item as ChordFilter);
    }
  }
  return next.length ? next : defaults.chordFilters;
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
        const chordFilters = readChordFilters(parsed.chordFilters);
        const scaleFilters = parsed.scaleFilters?.length
          ? parsed.scaleFilters.filter((item): item is ScaleFilter => ALL_SCALE_FILTERS.includes(item))
          : defaults.scaleFilters;
        const topic =
          parsed.topic === "chords" ||
          parsed.topic === "accidentals" ||
          parsed.topic === "scales" ||
          parsed.topic === "circle" ||
          parsed.topic === "inversions"
            ? parsed.topic
            : "intervals";
        const activity =
          parsed.activity === "circle" ||
          parsed.activity === "scale-lesson" ||
          parsed.activity === "chord-lesson" ||
          parsed.activity === "notes"
            ? parsed.activity
            : parsed.topic === "circle"
              ? "circle"
              : parsed.topic === "scales" && parsed.scaleMode === "shift"
                ? "scale-lesson"
                : "flash";
        const flashTopics = parsed.flashTopics?.filter(isFlashTopic);
        const nightMode = parsed.nightMode === true;
        const soundOn = parsed.soundOn !== false;
        setMuted(!soundOn);
        applyNight(nightMode);
        set({
          direction: parsed.direction ?? defaults.direction,
          range: parsed.range ?? defaults.range,
          topic,
          activity,
          flashTopics: flashTopics?.length ? flashTopics : isFlashTopic(topic) ? [topic] : defaults.flashTopics,
          chordFilters,
          scaleFilters: scaleFilters.length ? scaleFilters : defaults.scaleFilters,
          scaleMode: parsed.scaleMode === "shift" ? "shift" : "spell",
          parallelStage: parseStage(parsed.parallelStage),
          sessionLength: parsed.sessionLength === 5 || parsed.sessionLength === 15 ? parsed.sessionLength : 10,
          soundOn,
          autoAdvance: parsed.autoAdvance !== false,
          autoSeconds: clampSeconds(parsed.autoSeconds),
          nightMode,
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
  setActivity: (activity) => {
    set({ activity });
    persist(get());
  },
  toggleFlashTopic: (topic) => {
    const current = get().flashTopics;
    const next = current.includes(topic) ? current.filter((item) => item !== topic) : [...current, topic];
    set({ flashTopics: next, activity: "flash" });
    persist(get());
  },
  setAllFlashTopics: (on) => {
    set({ flashTopics: on ? [...FLASH_TOPICS] : [], activity: "flash" });
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
  setNightMode: (nightMode) => {
    applyNight(nightMode);
    set({ nightMode });
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
