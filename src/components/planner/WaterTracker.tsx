import { cn } from "@/lib/utils";
import { useWaterIntake } from "@/hooks/useWaterIntake";
import { Droplets } from "lucide-react";

const TOTAL_GLASSES = 8;

export function WaterTracker() {
  const { glasses, setGlasses } = useWaterIntake();
  const isDone = glasses >= TOTAL_GLASSES;

  const handleAddGlass = () => {
    if (glasses < TOTAL_GLASSES) {
      setGlasses.mutate(glasses + 1);
    }
  };

  const handleRemoveGlass = () => {
    if (glasses > 0) {
      setGlasses.mutate(glasses - 1);
    }
  };

  return (
    <div className="space-y-0">
      <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 px-3 py-2.5 transition-all hover:bg-primary/10">
        {/* Water icon */}
        <div className="flex h-6 w-6 shrink-0 items-center justify-center">
          <Droplets className={cn("h-5 w-5 transition-colors", isDone ? "text-primary" : "text-muted-foreground")} />
        </div>

        {/* Title + bars */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className={cn("text-sm font-medium", isDone && "text-primary")}>
              Drink Water
              {isDone && " ✓"}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {glasses}/{TOTAL_GLASSES}
            </span>
          </div>

          {/* 8 bars - tap anywhere to add, long press/double tap to undo */}
          <div
            className="flex gap-1 cursor-pointer active:scale-[0.97] transition-transform"
            onClick={handleAddGlass}
            onContextMenu={(e) => { e.preventDefault(); handleRemoveGlass(); }}
          >
            {Array.from({ length: TOTAL_GLASSES }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-3.5 flex-1 rounded-sm transition-all duration-300",
                  i < glasses
                    ? "bg-primary shadow-sm"
                    : "bg-muted-foreground/15",
                  i === glasses && "bg-primary/25"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Hint */}
      {!isDone ? (
        <p className="text-[10px] text-muted-foreground/60 px-12 pt-0.5">
          Tap to fill a glass · Long-press to undo
        </p>
      ) : (
        <p className="text-[10px] text-primary/60 px-12 pt-0.5">
          Great job staying hydrated! 💧
        </p>
      )}
    </div>
  );
}
