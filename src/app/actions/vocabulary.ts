"use server";

import { createClient } from "@/lib/supabase/server";

export async function saveVocabulary({
  word,
  translation,
  context_sentence,
  language,
  story_id,
}: {
  word: string;
  translation: string;
  context_sentence?: string;
  language: string;
  story_id?: number;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: "Unauthorized" };
    }

    const { data, error } = await supabase
      .from("saved_vocabulary")
      .upsert(
        {
          user_id: user.id,
          word,
          translation,
          context_sentence,
          language,
          story_id,
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
      console.error("Error saving vocabulary:", error);
      return { error: "Failed to save vocabulary" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { error: "An unexpected error occurred" };
  }
}
