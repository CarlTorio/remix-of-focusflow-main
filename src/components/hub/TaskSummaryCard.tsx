import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { CheckSquare, Clock, ListTodo } from "lucide-react";

export function TaskSummaryCard() {
  const { user } = useAuth();
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const { data } = useQuery({
    queryKey: ["task-summary-week", format(weekStart, "yyyy-MM-dd"), user?.id],
    queryFn: async () => {
      const { data: schedules } = await supabase
        .from("task_schedules")
        .select("id, task_id, status, task:tasks(title)")
        .gte("scheduled_date", format(weekStart, "yyyy-MM-dd"))
        .lte("scheduled_date", format(weekEnd, "yyyy-MM-dd"));

      const rows = (schedules || []) as Array<{
        id: string;
        task_id: string;
        status: string;
        task: { title: string } | { title: string }[] | null;
      }>;

      const relevant = rows.filter((row) => row.status !== "skipped");
      const completed = relevant.filter((row) => row.status === "completed");
      const pending = relevant.filter((row) => row.status === "scheduled" || row.status === "in_progress");

      const completedByTask = new Map<string, { id: string; title: string }>();
      completed.forEach((row) => {
        const taskData = Array.isArray(row.task) ? row.task[0] : row.task;
        if (taskData?.title && !completedByTask.has(row.task_id)) {
          completedByTask.set(row.task_id, { id: row.task_id, title: taskData.title });
        }
      });

      return {
        totalActive: relevant.length,
        completedThisWeek: completed.length,
        pending: pending.length,
        completedTasks: Array.from(completedByTask.values()).slice(0, 5),
      };
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
  const stats = data ?? { totalActive: 0, completedThisWeek: 0, pending: 0, completedTasks: [] };

  return (
    <div className="rounded-2xl bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-foreground">Tasks This Week</h3>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="flex flex-col items-center rounded-xl bg-secondary p-3">
          <ListTodo className="mb-1 h-4 w-4 text-muted-foreground" />
          <span className="text-xl font-bold text-foreground">{stats.pending}</span>
          <span className="text-[10px] text-muted-foreground">Pending</span>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-primary/10 p-3">
          <CheckSquare className="mb-1 h-4 w-4 text-primary" />
          <span className="text-xl font-bold text-primary">{stats.completedThisWeek}</span>
          <span className="text-[10px] text-muted-foreground">Done</span>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-secondary p-3">
          <Clock className="mb-1 h-4 w-4 text-muted-foreground" />
          <span className="text-xl font-bold text-foreground">{stats.totalActive}</span>
          <span className="text-[10px] text-muted-foreground">Total</span>
        </div>
      </div>

      {stats.completedTasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Recently completed</p>
          {stats.completedTasks.map((task: any) => (
            <div key={task.id} className="flex items-center gap-2 text-sm">
              <CheckSquare className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate text-foreground">{task.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
