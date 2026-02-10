-- Add selected_choice_index to story_parts table
ALTER TABLE story_parts
ADD COLUMN selected_choice_index INTEGER;
