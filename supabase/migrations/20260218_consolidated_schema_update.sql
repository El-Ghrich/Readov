-- Add branching columns to stories table
ALTER TABLE public.stories
ADD COLUMN IF NOT EXISTS parent_story_id bigint REFERENCES public.stories(id), -- Changed to bigint to match id type
ADD COLUMN IF NOT EXISTS user_level TEXT,
ADD COLUMN IF NOT EXISTS narrative_context JSONB DEFAULT '{}'::JSONB;

-- Add EdTech columns to story_parts table
ALTER TABLE public.story_parts
ADD COLUMN IF NOT EXISTS user_custom_input TEXT,
ADD COLUMN IF NOT EXISTS correction TEXT,
ADD COLUMN IF NOT EXISTS vocabulary_highlight JSONB;

-- Add native_language to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS native_language TEXT DEFAULT 'English';

-- Update handle_new_user trigger to include native_language
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, first_name, last_name, date_of_birth, native_language)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name',
    (new.raw_user_meta_data->>'date_of_birth')::date,
    coalesce(new.raw_user_meta_data->>'native_language', 'English')
  );
  return new;
end;
$$ language plpgsql security definer;
