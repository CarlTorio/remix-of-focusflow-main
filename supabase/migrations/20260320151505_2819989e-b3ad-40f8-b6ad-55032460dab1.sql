CREATE OR REPLACE FUNCTION public.seed_example_content_for_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_due_tomorrow text := to_char((now() + interval '1 day')::date, 'YYYY-MM-DD');
  v_due_week text := to_char((now() + interval '7 days')::date, 'YYYY-MM-DD');
  v_today text := to_char(now()::date, 'YYYY-MM-DD');
  v_alarm_time timestamptz := date_trunc('day', now() + interval '1 day') + interval '9 hours';
  v_project_task_id uuid;
  v_simple_task_id uuid;
BEGIN
  -- Routines
  INSERT INTO public.routines (user_id, title, description, order_index)
  SELECT p_user_id, seed.title, seed.description, seed.order_index
  FROM (
    VALUES
      ('Drink Water', 'Stay hydrated throughout the day', 0),
      ('Take a Break', 'Step away from the screen for 5 minutes', 1),
      ('Review Today''s Tasks', 'Check your planner and prioritize', 2)
  ) AS seed(title, description, order_index)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.routines r WHERE r.user_id = p_user_id AND r.title = seed.title
  );

  -- Project task
  INSERT INTO public.tasks (user_id, title, description, due_date, priority, kind, estimated_hours, status, icon_emoji, icon_color)
  SELECT
    p_user_id, 'My First Project',
    'This is an example project task. You can edit or delete it anytime!',
    v_due_week, 'high', 'project', 3, 'pending', '🚀', '#7c3aed'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.tasks t WHERE t.user_id = p_user_id AND t.title = 'My First Project'
  )
  RETURNING id INTO v_project_task_id;

  -- Schedule the project task on today if we just created it
  IF v_project_task_id IS NOT NULL THEN
    INSERT INTO public.task_schedules (user_id, task_id, scheduled_date, allocated_hours, status, display_title, start_time, end_time)
    VALUES (p_user_id, v_project_task_id, v_today, 1, 'scheduled', 'My First Project', '09:00', '10:00');
  END IF;

  -- Simple task
  INSERT INTO public.tasks (user_id, title, description, due_date, priority, kind, estimated_hours, status, icon_emoji, icon_color)
  SELECT
    p_user_id, 'Try adding a new task',
    'Tap the + button to create your own task. This is just an example!',
    v_due_tomorrow, 'medium', 'simple', 1, 'pending', '✏️', '#2563eb'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.tasks t WHERE t.user_id = p_user_id AND t.title = 'Try adding a new task'
  )
  RETURNING id INTO v_simple_task_id;

  -- Schedule the simple task on today if we just created it
  IF v_simple_task_id IS NOT NULL THEN
    INSERT INTO public.task_schedules (user_id, task_id, scheduled_date, allocated_hours, status, display_title, start_time, end_time)
    VALUES (p_user_id, v_simple_task_id, v_today, 1, 'scheduled', 'Try adding a new task', '10:00', '11:00');
  END IF;

  -- Example Task
  INSERT INTO public.tasks (user_id, title, description, due_date, priority, kind, estimated_hours, status, icon_emoji, icon_color)
  SELECT
    p_user_id, 'Example Task',
    'This is your starter example task.',
    v_due_tomorrow, 'medium', 'simple', 1, 'pending', '✅', '#16a34a'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.tasks t WHERE t.user_id = p_user_id AND t.title = 'Example Task'
  );

  -- Reminder
  INSERT INTO public.reminder_notes (user_id, title, notify_schedule, is_done)
  SELECT p_user_id, 'Example Reminder', 'Tomorrow 6:00 PM', false
  WHERE NOT EXISTS (
    SELECT 1 FROM public.reminder_notes rn WHERE rn.user_id = p_user_id AND rn.title = 'Example Reminder'
  );

  -- Alarm
  INSERT INTO public.alarms (user_id, title, alarm_time, original_alarm_time, alarm_type, sound_type, is_recurring, snooze_duration_minutes, max_snoozes, snooze_count, is_active)
  SELECT p_user_id, 'Example Alarm', v_alarm_time, v_alarm_time, 'custom', 'alarm-1', false, 5, 3, 0, true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.alarms a WHERE a.user_id = p_user_id AND a.title = 'Example Alarm'
  );

  -- Note
  INSERT INTO public.notes (user_id, title, content, folder)
  SELECT p_user_id, 'Welcome to Notes ✨',
    '<p>This is your first note! You can write anything here — ideas, reminders, or daily reflections.</p><p>Try creating folders to organize your notes. Happy writing!</p>',
    'General'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.notes n WHERE n.user_id = p_user_id AND n.title = 'Welcome to Notes ✨'
  );
END;
$function$;

-- Backfill: schedule existing example tasks for users who have them but no schedules
INSERT INTO public.task_schedules (user_id, task_id, scheduled_date, allocated_hours, status, display_title, start_time, end_time)
SELECT t.user_id, t.id, to_char(now()::date, 'YYYY-MM-DD'), 1, 'scheduled', t.title, '09:00', '10:00'
FROM public.tasks t
WHERE t.title = 'My First Project'
  AND NOT EXISTS (
    SELECT 1 FROM public.task_schedules ts WHERE ts.task_id = t.id
  );

INSERT INTO public.task_schedules (user_id, task_id, scheduled_date, allocated_hours, status, display_title, start_time, end_time)
SELECT t.user_id, t.id, to_char(now()::date, 'YYYY-MM-DD'), 1, 'scheduled', t.title, '10:00', '11:00'
FROM public.tasks t
WHERE t.title = 'Try adding a new task'
  AND NOT EXISTS (
    SELECT 1 FROM public.task_schedules ts WHERE ts.task_id = t.id
  );