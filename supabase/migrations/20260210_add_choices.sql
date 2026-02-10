-- Add choices column to story_parts table
ALTER TABLE public.story_parts 
ADD COLUMN choices jsonb DEFAULT '[]'::jsonb;

-- Update the comment if needed
COMMENT ON COLUMN public.story_parts.choices IS 'Array of 3 AI-generated plot options for the NEXT part.';
