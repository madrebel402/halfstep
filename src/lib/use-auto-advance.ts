import { useEffect, useLayoutEffect, useRef } from "react";
import { useDrillStore } from "@/lib/intervals/store";

/** When a card is solved and auto-advance is on, move on after the saved delay. 0 skips the correct screen. */
export function useAutoAdvance(ready: boolean, onNext: () => void): boolean {
  const enabled = useDrillStore((s) => s.autoAdvance);
  const seconds = useDrillStore((s) => s.autoSeconds);
  const onNextRef = useRef(onNext);
  onNextRef.current = onNext;

  useLayoutEffect(() => {
    if (!ready || !enabled || seconds !== 0) return;
    onNextRef.current();
  }, [ready, enabled, seconds]);

  useEffect(() => {
    if (!ready || !enabled || seconds === 0) return;
    const id = window.setTimeout(() => onNextRef.current(), seconds * 1000);
    return () => window.clearTimeout(id);
  }, [ready, enabled, seconds]);

  return enabled && seconds === 0;
}
