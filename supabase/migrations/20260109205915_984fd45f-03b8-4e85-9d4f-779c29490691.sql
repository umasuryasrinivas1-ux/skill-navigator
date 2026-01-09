-- Create learning_activity table for tracking time spent and streaks
CREATE TABLE public.learning_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  minutes_spent INTEGER NOT NULL DEFAULT 0,
  skills_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.learning_activity ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own activity" 
ON public.learning_activity 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity" 
ON public.learning_activity 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity" 
ON public.learning_activity 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create skill_notes table for user notes on each skill
CREATE TABLE public.skill_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  roadmap_id UUID NOT NULL REFERENCES public.skill_roadmaps(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  phase TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, roadmap_id, skill_name, phase)
);

-- Enable RLS
ALTER TABLE public.skill_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own notes" 
ON public.skill_notes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" 
ON public.skill_notes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" 
ON public.skill_notes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" 
ON public.skill_notes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add weekly_goal_hours column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS weekly_goal_hours INTEGER DEFAULT 10;

-- Create trigger for updating skill_notes updated_at
CREATE TRIGGER update_skill_notes_updated_at
BEFORE UPDATE ON public.skill_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();