export type DeckPlace = { current: number; total: number };

export function cardPlace(index: number, length: number, deck?: DeckPlace) {
  const current = deck?.current ?? index + 1;
  const total = deck?.total ?? length;
  return {
    current,
    total,
    last: current >= total,
    width: `${(Math.max(current - 1, 0) / Math.max(total, 1)) * 100}%`,
  };
}
