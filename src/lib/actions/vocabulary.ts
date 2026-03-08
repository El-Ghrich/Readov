"use server";

/**
 * Vocabulary Server Actions
 * ─────────────────────────
 * All mutations against the `saved_vocabulary` table live here.
 * Auth is verified server-side on every action.
 */

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./stories";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SaveVocabularyInput {
  word: string;
  translation: string;
  language: string;
  context_sentence?: string;
  story_id?: number;
}

export interface VocabularyEntry {
  id: string; // Changed to string (UUID)
  user_id: string;
  word: string;
  translation: string;
  language: string;
  context_sentence?: string;
  story_id?: number;
  mastery_level: number;
  created_at?: string;
}

export interface VocabularyFilters {
  searchTerm?: string;
  language?: string;
  page?: number;
  pageSize?: number;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

/**
 * Fetches all vocabulary for the current user, optional filtering.
 */
export async function getVocabulary(
  filters?: VocabularyFilters,
): Promise<ActionResult<{ list: VocabularyEntry[]; totalCount: number }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  let query = supabase
    .from("saved_vocabulary")
    .select("*", { count: "exact" }) // Get total count for pagination/stats
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (filters?.language && filters.language !== "All") {
    query = query.eq("language", filters.language);
  }

  if (filters?.searchTerm) {
    query = query.or(
      `word.ilike.%${filters.searchTerm}%,translation.ilike.%${filters.searchTerm}%,context_sentence.ilike.%${filters.searchTerm}%`,
    );
  }

  // Pagination logic
  if (filters?.page && filters?.pageSize) {
    const from = (filters.page - 1) * filters.pageSize;
    const to = from + filters.pageSize - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[getVocabulary]", error.message);
    return { success: false, error: "Failed to fetch vocabulary" };
  }

  return {
    success: true,
    data: { list: data as VocabularyEntry[], totalCount: count || 0 },
  };
}

/**
 * Upserts a vocabulary word for the current user.
 * Silently ignores duplicates (same user + language + word).
 */
export async function saveVocabulary(
  input: SaveVocabularyInput,
): Promise<ActionResult<VocabularyEntry>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("saved_vocabulary")
    .upsert(
      {
        user_id: user.id,
        word: input.word,
        translation: input.translation,
        context_sentence: input.context_sentence,
        language: input.language,
        story_id: input.story_id,
        mastery_level: 0,
      },
      {
        onConflict: "user_id, language, word",
        ignoreDuplicates: true,
      },
    )
    .select()
    .single();

  if (error) {
    console.error("[saveVocabulary]", error.message);
    return { success: false, error: "Failed to save vocabulary" };
  }

  return { success: true, data: data as VocabularyEntry };
}

/**
 * Updates the mastery level of a specific word.
 */
export async function updateMastery(
  id: string,
  level: number,
): Promise<ActionResult<VocabularyEntry>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("saved_vocabulary")
    .update({ mastery_level: level })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[updateMastery]", error.message);
    return { success: false, error: "Failed to update mastery level" };
  }

  return { success: true, data: data as VocabularyEntry };
}

/**
 * Deletes a word from the user's grimoire.
 */
export async function deleteVocabulary(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("saved_vocabulary")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deleteVocabulary]", error.message);
    return { success: false, error: "Failed to delete word" };
  }

  return { success: true };
}
