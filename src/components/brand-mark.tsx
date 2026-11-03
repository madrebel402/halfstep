import { cn } from "@/lib/utils";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", compact && "gap-2")}>
      <svg
        viewBox="0 0 28 22"
        className={cn("text-foreground", compact ? "h-5 w-6" : "h-6 w-7")}
        aria-hidden="true"
      >
        <line x1="1" x2="27" y1="3" y2="3" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
        <line x1="1" x2="27" y1="7.5" y2="7.5" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
        <line x1="1" x2="27" y1="12" y2="12" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
        <line x1="1" x2="27" y1="16.5" y2="16.5" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
        <line x1="1" x2="27" y1="21" y2="21" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1" />
        <ellipse cx="11" cy="16.5" rx="3.1" ry="2.2" transform="rotate(-18 11 16.5)" fill="currentColor" />
        <ellipse cx="19" cy="7.5" rx="3.1" ry="2.2" transform="rotate(-18 19 7.5)" fill="currentColor" />
      </svg>
      <span className={cn("font-display font-medium tracking-tight", compact ? "text-lg" : "text-xl")}>
        Halfstep
      </span>
    </div>
  );
}
