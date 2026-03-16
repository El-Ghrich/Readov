-- Indexes for performance improvements

-- For fetching a user's stories efficiently
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);

-- For fetching the public feed filtered by genre
CREATE INDEX IF NOT EXISTS idx_stories_is_published_genre ON public.stories(is_published, genre);

-- For joining story_parts to stories, or fetching parts for a story
CREATE INDEX IF NOT EXISTS idx_story_parts_story_id ON public.story_parts(story_id);

-- For looking up user jobs (e.g. rate limiting/checking generation count)
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.jobs(user_id);
