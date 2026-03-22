import { useBreak } from "@/contexts/BreakContext";
import { BreakCountdown } from "./BreakCountdown";
import { useRoutines } from "@/hooks/useRoutines";
import { format } from "date-fns";

export function GlobalBreakOverlay() {
  const { isBreakActive, endBreak, markBreakUsed } = useBreak();
  const { routines, completions, toggleCompletion } = useRoutines();
  const today = format(new Date(), "yyyy-MM-dd");

  if (!isBreakActive) return null;

  const handleComplete = () => {
    endBreak();
    markBreakUsed();
    // Mark the break routine as completed
    const breakRoutine = routines.find(
      (r) => r.title.trim().toLowerCase() === "take a break"
    );
    const alreadyCompleted = breakRoutine
      ? completions.some((c) => c.routine_id === breakRoutine.id)
      : false;
    if (breakRoutine && !alreadyCompleted) {
      toggleCompletion.mutate({ routineId: breakRoutine.id, isCompleted: false });
    }
  };

  const handleCancel = () => {
    endBreak();
  };

  return <BreakCountdown onComplete={handleComplete} onCancel={handleCancel} />;
}
