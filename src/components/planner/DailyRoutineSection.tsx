import { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp, Check, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRoutines, Routine } from "@/hooks/useRoutines";
import { format, isToday } from "date-fns";
import { WaterTracker } from "./WaterTracker";
import { useWaterIntake } from "@/hooks/useWaterIntake";
import { useBreak } from "@/contexts/BreakContext";

interface DailyRoutineSectionProps {
  onEditRoutine: (routine: Routine) => void;
  selectedDate?: Date;
}

function getCountdown(deadlineTime: string | null): {
  text: string;
  color: string;
  expired: boolean;
} | null {
  if (!deadlineTime) return null;
  const now = new Date();
  const [h, m] = deadlineTime.split(":").map(Number);
  const deadline = new Date();
  deadline.setHours(h, m, 0, 0);

  const diffMs = deadline.getTime() - now.getTime();
  if (diffMs <= 0) return { text: "Expired", color: "text-destructive", expired: true };

  const totalMin = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;

  let text: string;
  let color = "text-muted-foreground";

  if (hours > 0) {
    text = `${hours}h ${mins}m left`;
  } else {
    text = `${totalMin}m left`;
  }

  if (totalMin < 5) color = "text-destructive font-semibold";
  else if (totalMin < 10) color = "text-orange-500 font-medium";

  return { text, color, expired: false };
}

// Helper to normalize title for matching
function isSpecialRoutine(title: string): "water" | "break" | null {
  const t = title.trim().toLowerCase();
  if (t === "drink water") return "water";
  if (t === "take a break") return "break";
  return null;
}

// ─── Single Routine Item ──────────────────────────────────────────────────────
function RoutineItem({
  routine,
  isCompleted,
  countdown,
  isInteractive,
  onToggle,
}: {
  routine: Routine;
  isCompleted: boolean;
  countdown: ReturnType<typeof getCountdown>;
  isInteractive: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const expired = countdown?.expired ?? false;
  const canToggle = isInteractive && (!expired || isCompleted);

  return (
    <div className="space-y-0">
      <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 px-3 py-2.5 transition-all hover:bg-primary/10">
        {/* Checkbox */}
        <button
          onClick={canToggle ? onToggle : undefined}
          disabled={!canToggle}
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all",
            isCompleted
              ? "border-primary bg-primary text-primary-foreground"
              : expired
              ? "border-muted-foreground/30 bg-muted/50 cursor-not-allowed"
              : !isInteractive
              ? "border-muted-foreground/30 cursor-default"
              : "border-border hover:border-primary cursor-pointer"
          )}
        >
          {isCompleted && <Check className="h-4 w-4" />}
        </button>

        {/* Title (tappable for description expand) */}
        <div
          className={cn(
            "flex-1 min-w-0",
            routine.description && "cursor-pointer"
          )}
          onClick={() => routine.description && setExpanded(!expanded)}
        >
          <span
            className={cn(
              "text-sm font-medium transition-all truncate block",
              isCompleted && "line-through opacity-50",
              expired && !isCompleted && "opacity-40"
            )}
          >
            {routine.title}
            {["Drink Water", "Take a Break", "Review Today's Tasks"].includes(routine.title) && (
              <span className="ml-1.5 text-[10px] font-medium text-muted-foreground/60 italic">Example</span>
            )}
          </span>
        </div>

        {/* Right side: countdown or Done */}
        <div className="shrink-0 text-right">
          {isCompleted ? (
            <span className="text-xs font-medium text-primary">Done ✓</span>
          ) : countdown ? (
            <span className={cn("text-xs whitespace-nowrap", countdown.color)}>
              {countdown.text}
            </span>
          ) : null}
        </div>
      </div>

      {/* Expandable description */}
      {routine.description && expanded && (
        <div className="px-12 pb-2 animate-in slide-in-from-top-1 fade-in-0 duration-200">
          <p className="text-xs text-muted-foreground whitespace-pre-wrap">
            {routine.description}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Break Routine Item ───────────────────────────────────────────────────────
function BreakRoutineItem({
  routine,
  isCompleted,
  isInteractive,
  onStartBreak,
}: {
  routine: Routine;
  isCompleted: boolean;
  isInteractive: boolean;
  onStartBreak: () => void;
}) {
  return (
    <div className="space-y-0">
      <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 px-3 py-2.5 transition-all hover:bg-primary/10">
        {/* Icon */}
        <div className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-all",
          isCompleted
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground"
        )}>
          {isCompleted ? <Check className="h-4 w-4" /> : <Coffee className="h-4 w-4" />}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <span className={cn(
            "text-sm font-medium transition-all truncate block",
            isCompleted && "line-through opacity-50"
          )}>
            Take a Break
          </span>
        </div>

        {/* Action */}
        <div className="shrink-0">
          {isCompleted ? (
            <span className="text-xs font-medium text-primary">Done ✓</span>
          ) : isInteractive ? (
            <button
              onClick={onStartBreak}
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded-md hover:bg-primary/10"
            >
              Start 30m
            </button>
          ) : null}
        </div>
      </div>
      {!isCompleted && isInteractive && (
        <p className="text-[10px] text-muted-foreground/60 px-12 pt-0.5">
          Once per day · 30-minute break
        </p>
      )}
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export function DailyRoutineSection({ onEditRoutine, selectedDate }: DailyRoutineSectionProps) {
  const { routines, completions, toggleCompletion, getCompletionsForDate } = useRoutines();
  const { glasses } = useWaterIntake();
  const { startBreak, breakUsedToday } = useBreak();
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("routine_collapsed");
    return saved === "true";
  });
  const [, setTick] = useState(0);

  const viewingDate = selectedDate || new Date();
  const viewingToday = isToday(viewingDate);
  const viewingDateStr = format(viewingDate, "yyyy-MM-dd");

  // Re-check countdown every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("routine_collapsed", String(collapsed));
  }, [collapsed]);

  // For past dates, fetch completions
  const pastCompletions = getCompletionsForDate?.(viewingDateStr);

  // Filter routines that existed on the selected date
  const visibleRoutines = useMemo(() => {
    return routines.filter((r) => {
      const createdDate = r.created_at ? r.created_at.slice(0, 10) : "2000-01-01";
      return createdDate <= viewingDateStr;
    });
  }, [routines, viewingDateStr]);

  // Determine completions for the viewed date
  const completionSet = useMemo(() => {
    if (viewingToday) {
      return new Set(completions.map((c) => c.routine_id));
    }
    if (pastCompletions) {
      return new Set(pastCompletions.map((c: any) => c.routine_id));
    }
    return new Set<string>();
  }, [completions, pastCompletions, viewingToday]);

  // Count completed - water counts as done when 8 glasses, break counts via completionSet or breakUsedToday
  const completedCount = useMemo(() => {
    return visibleRoutines.filter((r) => {
      const special = isSpecialRoutine(r.title);
      if (special === "water") return glasses >= 8;
      if (special === "break") return completionSet.has(r.id) || breakUsedToday;
      return completionSet.has(r.id);
    }).length;
  }, [visibleRoutines, completionSet, glasses, breakUsedToday]);

  const allDone = completedCount === visibleRoutines.length && visibleRoutines.length > 0;

  if (visibleRoutines.length === 0) return null;

  return (
    <>
      <div className="mb-4">
        {/* Header */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mb-2 flex w-full items-center gap-2 text-xs"
        >
          <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
          <span className="font-bold uppercase tracking-wider text-primary">
            Daily Routine ({completedCount}/{visibleRoutines.length})
            {allDone && " ✓"}
          </span>
          {collapsed ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
          )}
        </button>

        {/* Routine list */}
        {!collapsed && (
          <div className="space-y-1.5 animate-in fade-in-0 duration-150">
            {visibleRoutines.map((routine) => {
              const completed = completionSet.has(routine.id);
              const countdown = viewingToday ? getCountdown(routine.deadline_time) : null;
              const special = isSpecialRoutine(routine.title);

              // Special: Drink Water
              if (special === "water" && viewingToday) {
                return <WaterTracker key={routine.id} />;
              }

              // Special: Take a Break
              if (special === "break" && viewingToday) {
                const breakDone = completed || breakUsedToday;
                return (
                  <BreakRoutineItem
                    key={routine.id}
                    routine={routine}
                    isCompleted={breakDone}
                    isInteractive={viewingToday && !breakDone}
                    onStartBreak={startBreak}
                  />
                );
              }

              // Normal routine
              return (
                <RoutineItem
                  key={routine.id}
                  routine={routine}
                  isCompleted={completed}
                  countdown={countdown}
                  isInteractive={viewingToday}
                  onToggle={() =>
                    toggleCompletion.mutate({
                      routineId: routine.id,
                      isCompleted: completed,
                    })
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
