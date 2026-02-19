-- Add selected_choice_index to story_parts table
ALTER TABLE public.story_parts
ADD COLUMN IF NOT EXISTS selected_choice_index INTEGER;
