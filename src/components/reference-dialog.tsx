import { BookOpen } from "lucide-react";
import { INTERVALS } from "@/lib/intervals/catalog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ReferenceDialog({ compact = false }: { compact?: boolean }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size={compact ? "icon-sm" : "sm"} aria-label="Interval chart">
          <BookOpen />
          {compact ? null : <span className="hidden sm:inline">Chart</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[min(32rem,calc(100dvh-2rem))] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Interval chart</DialogTitle>
          <DialogDescription>
            Distance in half-steps. A half-step is one key to the next on the piano, black keys included.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-1 divide-y divide-border">
          {INTERVALS.map((interval) => (
            <div key={interval.id} className="flex items-baseline justify-between gap-3 py-2.5">
              <div>
                <p className="text-sm font-medium capitalize">{interval.name}</p>
                <p className="text-xs text-muted-foreground">{interval.shortName}</p>
              </div>
              <p className="font-display text-lg tabular-nums">{interval.steps}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
