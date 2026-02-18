// index.ts
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// --- Types ---

interface GenerationParams {
  genre: string;
  language?: string;
  goal?: string;
  lesson?: string;
  level?: number;
  level_label?: string;
  native_language?: string;
}

interface ContinuationParams {
  story_id: string;
  type: "ai" | "custom";
  user_direction?: string; // The text of the choice or custom input
  context_summary?: string;
  narrative_context?: any;
  native_language?: string;
}

interface StoryResponse {
  content: string;
  options: string[];
  narrative_context: any;
  correction?: string | null;
  vocabulary_highlight?: Record<string, string> | null;
}

// --- AI Provider ---

class GeminiProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "gemini-1.5-flash") {
    this.apiKey = apiKey;
    this.model = model;
  }

  // 1. START A NEW STORY
  async generateStoryStart(params: GenerationParams): Promise<StoryResponse> {
    const systemPrompt = this.buildSystemPrompt(params);
    const userPrompt = this.buildStartUserPrompt(params);
    return this.callGemini(systemPrompt, userPrompt);
  }

  // 2. CONTINUE AN EXISTING STORY
  async continueStory(params: ContinuationParams): Promise<StoryResponse> {
    const isCustom = params.type === "custom" && !!params.user_direction;
    const nativeLangInfo = params.native_language
      ? ` (Definitions in ${params.native_language})`
      : "";

    const systemPrompt = `You are a professional storyteller and language tutor.
RULES:
1. OUTPUT FORMAT: STRICT JSON. Do not write markdown.
   Format: { 
     "content": "Story text...", 
     "options": ["Choice 1", "Choice 2", "Choice 3"],
     "narrative_context": { 
        "characters": [{ "name": "...", "status": "..." }],
        "current_location": "...",
        "key_items": []
     },
     "correction": "String (optional correction if user input has errors, else null)",
     "vocabulary_highlight": { "word": "definition" } (Object with 1-3 sophisticated words from YOUR GENERATED CONTENT and their brief definitions${nativeLangInfo})
   }
2. MEMORY: Use the provided 'narrative_context' to maintain continuity. 
   - If a character's status changes (e.g., becomes angry), UPDATE it in the returned JSON.
   - If the location changes, UPDATE 'current_location'.
3. Write specifically between 150 and 250 words.
4. Structure: 1-2 engaging paragraphs.
5. Content: Continue the plot logically.
6. Options: Provide 3 short, intriguing plot directions for what happens NEXT (max 10 words each) in the Target Language.
${
  isCustom
    ? `7. USER INPUT ANALYSIS: 
   - The user wrote: "${params.user_direction}"
   - Use this input to drive the story action.
   - Analyze their input for grammar/spelling errors.
   - If there are errors, provide a polite, helpful correction in the 'correction' field.
   - If no errors, 'correction' should be null.
`
    : ""
}
`;

    // Inject the Context so Gemini remembers facts
    const userPrompt = `
    CURRENT NARRATIVE CONTEXT: ${JSON.stringify(params.narrative_context || {})}
    STORY SO FAR SUMMARY: ${params.context_summary || "Start of story."}
    
    Continue the story now.${isCustom ? ` Specifically following this direction: ${params.user_direction}` : ""}
    `;

    return this.callGemini(systemPrompt, userPrompt);
  }

  private async callGemini(
    system: string,
    user: string,
  ): Promise<StoryResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    console.log(`Calling Gemini Model: ${this.model}`);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: system + "\n\n" + user }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.8,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const rawText = candidate?.content?.parts?.[0]?.text?.trim();

    if (!rawText)
      return {
        content: "Error: No content generated.",
        options: [],
        narrative_context: {},
      };

    try {
      const jsonString = rawText.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(jsonString);
      return {
        content: parsed.content || rawText,
        options: parsed.options || [],
        narrative_context: parsed.narrative_context || {},
        correction: parsed.correction || null,
        vocabulary_highlight: parsed.vocabulary_highlight || null,
      };
    } catch (e) {
      console.error("Failed to parse JSON response:", rawText);
      return { content: rawText, options: [], narrative_context: {} };
    }
  }

  private buildSystemPrompt(params: GenerationParams): string {
    const complexity = params.level_label
      ? `Level ${params.level_label}`
      : `Level ${params.level || 5}/10`;
    const nativeLangInfo = params.native_language
      ? ` (Definitions in ${params.native_language})`
      : "";

    return `You are a professional storyteller writing a ${params.genre} story in ${params.language || "English"}.
RULES:
1. OUTPUT FORMAT: STRICT JSON.
   Format: { 
     "content": "Story text...", 
     "options": ["Choice 1", "Choice 2", "Choice 3"],
     "narrative_context": { 
        "characters": [], 
        "current_location": "Start",
        "key_items": []
     },
     "vocabulary_highlight": { "word": "definition" } (Object with 1-3 sophisticated words${nativeLangInfo})
   }
2. Write between 150 and 250 words.
3. Structure: 1-2 engaging paragraphs.
4. Content: START the story immediately with action or dialogue.
5. Complexity: ${complexity}. Adjust vocabulary.
6. Language: Write ONLY in ${params.language || "English"}.
7. Options: Provide 3 short, intriguing plot directions.
${params.goal ? `8. Goal: The characters should aim for: '${params.goal}'` : ""}
${params.lesson ? `9. Theme: Incorporate the theme: '${params.lesson}'` : ""}
`;
  }

  private buildStartUserPrompt(params: GenerationParams): string {
    return `Write the beginning of my ${params.genre} story. Ensure it is at least 150 words long.`;
  }
}

// --- Main Handler ---

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let job = null,
    supabase = null,
    jobId = "unknown";

  try {
    const payload = await req.json();
    job = payload.record || payload;

    if (job?.id) jobId = job.id;
    console.log(`Processing job ${jobId}, type: ${job?.type}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!supabaseUrl || !supabaseKey || !apiKey) {
      throw new Error("Missing Environment Variables");
    }

    supabase = createClient(supabaseUrl, supabaseKey);
    const aiProvider = new GeminiProvider(apiKey);

    // Update job to processing
    if (jobId !== "unknown") {
      await supabase
        .from("jobs")
        .update({ status: "processing" })
        .eq("id", jobId);
    }

    // Fetch User Native Language
    let userNativeLanguage = "English";
    if (job.user_id) {
      const { data: userData } = await supabase
        .from("users")
        .select("native_language")
        .eq("id", job.user_id)
        .single();
      if (userData?.native_language)
        userNativeLanguage = userData.native_language;
    }

    // --- CASE 1: START NEW STORY ---
    if (job.type === "generate_start") {
      const {
        genre,
        language = "English",
        goal,
        lesson,
        level,
        level_label,
      } = job.params || {};

      const { content, options, vocabulary_highlight, narrative_context } =
        await aiProvider.generateStoryStart({
          genre,
          language,
          goal,
          lesson,
          level,
          level_label,
          native_language: userNativeLanguage,
        });

      // 1. Create Story
      const { data: story, error: storyError } = await supabase
        .from("stories")
        .insert({
          user_id: job.user_id,
          title: "Your Story",
          genre,
          language,
          goal,
          lesson,
          full_story: content,
          is_published: false,
          is_completed: false,
          user_level: level_label,
          narrative_context: narrative_context,
        })
        .select()
        .single();

      if (storyError) throw storyError;

      // 2. Create Part 1
      const { error: partError } = await supabase.from("story_parts").insert({
        story_id: story.id,
        part_number: 1,
        content: content,
        suggested_choices: options,
        vocabulary_highlight: vocabulary_highlight,
        is_user_input: false,
        order_index: 1,
      });

      if (partError) throw partError;

      // 3. Complete Job
      if (jobId !== "unknown") {
        await supabase
          .from("jobs")
          .update({ status: "completed", result: { story_id: story.id } })
          .eq("id", jobId);
      }

      return new Response(
        JSON.stringify({ success: true, story_id: story.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // --- CASE 2: CONTINUE STORY ---
    else if (job.type === "continue_story") {
      const {
        story_id,
        type,
        user_direction,
        context_summary,
        narrative_context,
      } = job.params || {};

      // ---------------------------------------------------------
      // STEP A: SAVE THE USER'S CHOICE TO THE PREVIOUS PART
      // ---------------------------------------------------------

      // 1. Find the last part (Part N)
      const { data: lastParts } = await supabase
        .from("story_parts")
        .select("id, part_number")
        .eq("story_id", story_id)
        .order("part_number", { ascending: false })
        .limit(1);

      const lastPart = lastParts?.[0];

      // 2. Update it with what the user selected to trigger this new generation
      if (lastPart) {
        await supabase
          .from("story_parts")
          .update({
            selected_choice: user_direction, // <--- SAVING THE CHOICE HERE
            // If custom input, we also save it here?
            // Ideally selected_choice holds the button text,
            // user_custom_input holds typed text.
            // But for simplicity, we can store user_direction in selected_choice
            // so the UI knows which button to highlight.
          })
          .eq("id", lastPart.id);
      }

      // ---------------------------------------------------------
      // STEP B: GENERATE THE NEW PART (Part N+1)
      // ---------------------------------------------------------

      const {
        content,
        options,
        correction,
        vocabulary_highlight,
        narrative_context: newNarrativeContext,
      } = await aiProvider.continueStory({
        story_id,
        type,
        user_direction,
        context_summary,
        narrative_context,
        native_language: userNativeLanguage,
      });

      // Calculate next part number
      const nextPartNumber = (lastPart?.part_number || 0) + 1;

      // Insert New Part
      const { error: partError } = await supabase.from("story_parts").insert({
        story_id,
        part_number: nextPartNumber,
        content: content,
        suggested_choices: options,
        // We track 'user_custom_input' on the NEW part only if it was TYPED (custom)
        // If it was a button click (ai), we don't need it here because we saved it in previous part's selected_choice
        user_custom_input: type === "custom" ? user_direction : null,
        correction: correction,
        vocabulary_highlight: vocabulary_highlight,
        is_user_input: false,
        order_index: nextPartNumber,
      });

      if (partError) throw partError;

      // Update Story Brain
      const { data: currentStory } = await supabase
        .from("stories")
        .select("full_story")
        .eq("id", story_id)
        .single();
      const newFullStory = (currentStory?.full_story || "") + "\n\n" + content;

      await supabase
        .from("stories")
        .update({
          full_story: newFullStory,
          narrative_context: newNarrativeContext,
          updated_at: new Date().toISOString(),
        })
        .eq("id", story_id);

      // Complete Job
      if (jobId !== "unknown") {
        await supabase
          .from("jobs")
          .update({ status: "completed", result: { story_id } })
          .eq("id", jobId);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ message: "Job type ignored" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error processing job:", error);
    if (supabase && jobId !== "unknown") {
      await supabase
        .from("jobs")
        .update({
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
        })
        .eq("id", jobId);
    }
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
