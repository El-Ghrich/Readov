"use server";

/**
 * Story Server Actions
 * ────────────────────
 * All mutations against the `stories` table live here.
 * Auth is verified server-side on every action.
 */

import { createClient } from "@/lib/supabase/server";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ActionResult<T = undefined> =
  | ({ success: true } & (T extends undefined ? object : { data: T }))
  | { success: false; error: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { supabase, user: null };
  return { supabase, user };
}

// ─── Actions ─────────────────────────────────────────────────────────────────

/**
 * Permanently deletes a story owned by the current user.
 * Double-checked server-side (user_id) + Supabase RLS guard.
 */
export async function deleteStory(storyId: number): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return { success: false, error: "You must be logged in." };
  }

  const { error } = await supabase
    .from("stories")
    .delete()
    .eq("id", storyId)
    .eq("user_id", user.id);

  if (error) {
    console.error("[deleteStory]", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Toggles the published state of a story owned by the current user.
 */
export async function togglePublishStory(
  storyId: number,
  publish: boolean,
): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return { success: false, error: "You must be logged in." };
  }

  const { error } = await supabase
    .from("stories")
    .update({ is_published: publish })
    .eq("id", storyId)
    .eq("user_id", user.id);

  if (error) {
    console.error("[togglePublishStory]", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Fetches published stories for the public feed.
 * Supports pagination and genre filtering.
 */
export async function getPublishedStories(filters: {
  genre?: string;
  page: number;
  pageSize: number;
}): Promise<ActionResult<{ list: any[]; hasMore: boolean }>> {
  const supabase = await createClient();

  let query = supabase
    .from("stories")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (filters.genre && filters.genre !== "All") {
    query = query.eq("genre", filters.genre);
  }

  const from = (filters.page - 1) * filters.pageSize;
  // Fetch one extra item to check if there are more
  const to = from + filters.pageSize;

  const { data, error } = await query.range(from, to);

  if (error) {
    console.error("[getPublishedStories]", error.message);
    return { success: false, error: "Failed to fetch stories" };
  }

  const hasMore = (data && data.length > filters.pageSize) || false;
  const actualData = hasMore ? data.slice(0, filters.pageSize) : (data || []);

  // Process data to include a preview
  const list = actualData.map((s: any) => ({
    ...s,
    content_preview:
      s.full_story?.substring(0, 150) + "..." ||
      "No preview available.",
    likes: 0, // Placeholder
    liked_by_user: false, // Placeholder
  }));

  return { success: true, data: { list, hasMore } };
}
