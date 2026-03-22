
-- Add missing columns to profiles
ALTER TABLE public.profiles ADD COLUMN nudge_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN nudge_frequency TEXT DEFAULT 'medium';

-- Add logged_at to mood_entries (alias for created_at usage)
ALTER TABLE public.mood_entries ADD COLUMN logged_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- ═══ QUICK TASKS ═══
CREATE TABLE public.quick_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_done BOOLEAN DEFAULT false,
  created_date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quick_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quick_tasks" ON public.quick_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own quick_tasks" ON public.quick_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quick_tasks" ON public.quick_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own quick_tasks" ON public.quick_tasks FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_quick_tasks_date ON public.quick_tasks(created_date);

-- ═══ REMINDER NOTES ═══
CREATE TABLE public.reminder_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_done BOOLEAN DEFAULT false,
  notify_schedule TEXT,
  linked_alarm_id UUID REFERENCES public.alarms(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reminder_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminder_notes" ON public.reminder_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own reminder_notes" ON public.reminder_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reminder_notes" ON public.reminder_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reminder_notes" ON public.reminder_notes FOR DELETE USING (auth.uid() = user_id);
