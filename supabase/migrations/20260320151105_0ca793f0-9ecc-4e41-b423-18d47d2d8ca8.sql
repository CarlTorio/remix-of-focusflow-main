CREATE OR REPLACE FUNCTION public.seed_example_content_for_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_due_tomorrow text := to_char((now() + interval '1 day')::date, 'YYYY-MM-DD');
  v_due_week text := to_char((now() + interval '7 days')::date, 'YYYY-MM-DD');
  v_alarm_time timestamptz := date_trunc('day', now() + interval '1 day') + interval '9 hours';
BEGIN
  INSERT INTO public.routines (user_id, title, description, order_index)
  SELECT p_user_id, seed.title, seed.description, seed.order_index
  FROM (
    VALUES
      ('Drink Water', 'Stay hydrated throughout the day', 0),
      ('Take a Break', 'Step away from the screen for 5 minutes', 1),
      ('Review Today''s Tasks', 'Check your planner and prioritize', 2)
  ) AS seed(title, description, order_index)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.routines r
    WHERE r.user_id = p_user_id
      AND r.title = seed.title
  );

  INSERT INTO public.tasks (user_id, title, description, due_date, priority, kind, estimated_hours, status, icon_emoji, icon_color)
  SELECT
    p_user_id,
    'My First Project',
    'This is an example project task. You can edit or delete it anytime!',
    v_due_week,
    'high',
    'project',
    3,
    'pending',
    '🚀',
    '#7c3aed'
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.tasks t
    WHERE t.user_id = p_user_id
      AND t.title = 'My First Project'
  );

  INSERT INTO public.tasks (user_id, title, description, due_date, priority, kind, estimated_hours, status, icon_emoji, icon_color)
  SELECT
    p_user_id,
    'Try adding a new task',
    'Tap the + button to create your own task. This is just an example!',
    v_due_tomorrow,
    'medium',
    'simple',
    1,
    'pending',
    '✏️',
    '#2563eb'
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.tasks t
    WHERE t.user_id = p_user_id
      AND t.title = 'Try adding a new task'
  );

  INSERT INTO public.tasks (user_id, title, description, due_date, priority, kind, estimated_hours, status, icon_emoji, icon_color)
  SELECT
    p_user_id,
    'Example Task',
    'This is your starter example task.',
    v_due_tomorrow,
    'medium',
    'simple',
    1,
    'pending',
    '✅',
    '#16a34a'
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.tasks t
    WHERE t.user_id = p_user_id
      AND t.title = 'Example Task'
  );

  INSERT INTO public.reminder_notes (user_id, title, notify_schedule, is_done)
  SELECT
    p_user_id,
    'Example Reminder',
    'Tomorrow 6:00 PM',
    false
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.reminder_notes rn
    WHERE rn.user_id = p_user_id
      AND rn.title = 'Example Reminder'
  );

  INSERT INTO public.alarms (
    user_id,
    title,
    alarm_time,
    original_alarm_time,
    alarm_type,
    sound_type,
    is_recurring,
    snooze_duration_minutes,
    max_snoozes,
    snooze_count,
    is_active
  )
  SELECT
    p_user_id,
    'Example Alarm',
    v_alarm_time,
    v_alarm_time,
    'custom',
    'alarm-1',
    false,
    5,
    3,
    0,
    true
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.alarms a
    WHERE a.user_id = p_user_id
      AND a.title = 'Example Alarm'
  );

  INSERT INTO public.notes (user_id, title, content, folder)
  SELECT
    p_user_id,
    'Welcome to Notes ✨',
    '<p>This is your first note! You can write anything here — ideas, reminders, or daily reflections.</p><p>Try creating folders to organize your notes. Happy writing!</p>',
    'General'
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.notes n
    WHERE n.user_id = p_user_id
      AND n.title = 'Welcome to Notes ✨'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, nickname, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'nickname', NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_id', 'avatar-01')
  )
  ON CONFLICT (id) DO NOTHING;

  PERFORM public.seed_example_content_for_user(NEW.id);

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (id, email, first_name, last_name, nickname, avatar_url)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', ''),
  COALESCE(au.raw_user_meta_data->>'last_name', ''),
  COALESCE(au.raw_user_meta_data->>'nickname', au.raw_user_meta_data->>'first_name', ''),
  COALESCE(au.raw_user_meta_data->>'avatar_id', 'avatar-01')
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1
  FROM public.profiles p
  WHERE p.id = au.id
);

SELECT public.seed_example_content_for_user(p.id)
FROM public.profiles p;