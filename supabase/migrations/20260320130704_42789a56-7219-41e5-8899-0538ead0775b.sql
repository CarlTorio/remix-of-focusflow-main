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

  -- Seed default daily routines for new users
  INSERT INTO public.routines (user_id, title, description, order_index) VALUES
    (NEW.id, 'Drink Water', 'Stay hydrated throughout the day', 0),
    (NEW.id, 'Take a Break', 'Step away from the screen for 5 minutes', 1),
    (NEW.id, 'Review Today''s Tasks', 'Check your planner and prioritize', 2);

  RETURN NEW;
END;
$function$;