
CREATE OR REPLACE VIEW public.admin_user_stats
WITH (security_invoker = off)
AS
SELECT
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.nickname,
  COALESCE(p.first_name, p.nickname, p.email) AS display_name,
  p.avatar_url,
  p.onboarding_completed,
  p.created_at,
  p.theme_mode,
  COALESCE(t.total_tasks, 0)::int AS total_tasks,
  COALESCE(t.completed_tasks, 0)::int AS completed_tasks,
  COALESCE(n.total_notes, 0)::int AS total_notes,
  COALESCE(a.total_alarms, 0)::int AS total_alarms,
  COALESCE(m.total_mood_entries, 0)::int AS total_mood_entries,
  GREATEST(t.last_task, n.last_note, a.last_alarm, m.last_mood) AS last_activity
FROM public.profiles p
LEFT JOIN LATERAL (
  SELECT
    COUNT(*)::int AS total_tasks,
    COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_tasks,
    MAX(updated_at) AS last_task
  FROM public.tasks WHERE user_id = p.id
) t ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*)::int AS total_notes, MAX(updated_at) AS last_note
  FROM public.notes WHERE user_id = p.id
) n ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*)::int AS total_alarms, MAX(created_at) AS last_alarm
  FROM public.alarms WHERE user_id = p.id
) a ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*)::int AS total_mood_entries, MAX(created_at) AS last_mood
  FROM public.mood_entries WHERE user_id = p.id
) m ON true;

GRANT SELECT ON public.admin_user_stats TO authenticated;
