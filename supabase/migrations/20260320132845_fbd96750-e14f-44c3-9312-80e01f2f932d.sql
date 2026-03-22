
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
  );

  -- Seed default daily routines
  INSERT INTO public.routines (user_id, title, description, order_index) VALUES
    (NEW.id, 'Drink Water', 'Stay hydrated throughout the day', 0),
    (NEW.id, 'Take a Break', 'Step away from the screen for 5 minutes', 1),
    (NEW.id, 'Review Today''s Tasks', 'Check your planner and prioritize', 2);

  -- Seed example main task
  INSERT INTO public.tasks (user_id, title, description, due_date, priority, kind, estimated_hours, icon_emoji, icon_color)
  VALUES (
    NEW.id,
    'My First Project',
    'This is an example project task. You can edit or delete it anytime!',
    to_char(now() + interval '7 days', 'YYYY-MM-DD'),
    'high',
    'project',
    3,
    '🚀',
    '#7c3aed'
  );

  -- Seed example simple task
  INSERT INTO public.tasks (user_id, title, description, due_date, priority, kind, estimated_hours, icon_emoji, icon_color)
  VALUES (
    NEW.id,
    'Try adding a new task',
    'Tap the + button to create your own task. This is just an example!',
    to_char(now() + interval '1 day', 'YYYY-MM-DD'),
    'medium',
    'simple',
    1,
    '✏️',
    '#2563eb'
  );

  -- Seed example note
  INSERT INTO public.notes (user_id, title, content, folder)
  VALUES (
    NEW.id,
    'Welcome to Notes ✨',
    '<p>This is your first note! You can write anything here — ideas, reminders, or daily reflections.</p><p>Try creating folders to organize your notes. Happy writing!</p>',
    'General'
  );

  RETURN NEW;
END;
$function$;
