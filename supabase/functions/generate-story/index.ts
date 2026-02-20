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
  premise?: string;
  level?: number;
  level_label?: string;
  native_language?: string;
}

interface ContinuationParams {
  story_id: string;
  type: "ai" | "custom";
  user_direction?: string; // The text of the choice or custom input
  selected_choice_index?: number; // Added
  context_summary?: string;
  narrative_context?: any;
  native_language?: string;
  level_label?: string;
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

  constructor(apiKey: string, model: string = "gemini-2.5-flash") {
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
  // 2. CONTINUE AN EXISTING STORY
  async continueStory(params: ContinuationParams): Promise<StoryResponse> {
    const isCustom = params.type === "custom" && !!params.user_direction;
    const nativeLangInfo = params.native_language
      ? ` (Definitions in ${params.native_language})`
      : "";

    // Use the stored level config
    const levelConfig = this.getLevelConfig(params.level_label);

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
3. LENGTH: Write specifically between ${levelConfig.wordCount} words.
4. STRUCTURE: ${levelConfig.structure}.
5. LANGUAGE & STYLE: ${levelConfig.style}.
6. LEVEL: ${params.level_label || "Intermediate"}. ADJUST STRICTLY TO THIS LEVEL.
7. Content: Continue the plot logically.
8. Options: Provide 3 short, intriguing plot directions for what happens NEXT (max 10 words each) in the Target Language.
${
  isCustom
    ? `9. USER INPUT ANALYSIS: 
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
    // We also want to respect the original level constraints in continuation
    // But params here is ContinuationParams which doesn't have level info directly unless we pass it or infer it.
    // For now, we assume the system prompt rules (which are static per class instance? No, buildSystemPrompt is per call)
    // Wait, continueStory calls callGemini directly with a HARDCODED system prompt in the previous code.
    // We need to FIX this. content generation should respect level.
    // Ideally we should store the level in the 'stories' table and pass it to continueStory job.
    // For now, let's keep the hardcoded system prompt in continueStory but UPDATED with generic level instructions or pass it through.

    // Actually, looking at continueStory method below, it has its OWN system prompt string.
    // We should update that too to be dynamic if possible, OR just make it generic but professional.
    // A better way is to fetch the story level before calling continueStory, but the job params might not have it.
    // Let's rely on the "professional storyteller and language tutor" persona and add instruction to maintain style.

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

  private getLevelConfig(levelLabel?: string) {
    switch (levelLabel) {
      case "A1":
        return {
          wordCount: "100-150",
          structure: "1 simple paragraph",
          style:
            "Very simple sentences. High-frequency vocabulary (top 500 words). Avoid idioms. Focus on concrete actions. Present tense preference.",
        };
      case "A2":
        return {
          wordCount: "150-200",
          structure: "1-2 short paragraphs",
          style:
            "Compound sentences (and, but, because). Basic descriptive language. Everyday topics. Simple past tones.",
        };
      case "B1":
        return {
          wordCount: "200-250",
          structure: "2 paragraphs",
          style:
            "Connected text. Mix of simple and complex sentences. Clear descriptions of events and feelings.",
        };
      case "B2":
        return {
          wordCount: "250-300",
          structure: "2-3 paragraphs",
          style:
            "Complex arguments/narratives. Varied sentence structures. Specific vocabulary. Abstract topics.",
        };
      case "C1":
        return {
          wordCount: "300-350",
          structure: "3 paragraphs",
          style:
            "Long, complex, and detailed. Flexible use of language. Idiomatic expressions. Subtleties.",
        };
      case "C2":
        return {
          wordCount: "350-400",
          structure: "3-4 paragraphs",
          style:
            "Sophisticated, literary, and precise. Nuanced meaning. Rich vocabulary. Complete fluency.",
        };
      default:
        // Default to a middle ground if undefined
        return {
          wordCount: "200-250",
          structure: "2 engaging paragraphs",
          style: "Standard storytelling flow. Moderate vocabulary.",
        };
    }
  }

  private buildSystemPrompt(params: GenerationParams): string {
    const levelConfig = this.getLevelConfig(params.level_label);
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
2. LENGTH: Write specifically between ${levelConfig.wordCount} words.
3. STRUCTURE: ${levelConfig.structure}.
4. LANGUAGE & STYLE: ${levelConfig.style}.
5. LEVEL: ${params.level_label || "Intermediate"}. ADJUST STRICTLY TO THIS LEVEL.
6. Content: START the story immediately with action or dialogue.
7. Language: Write ONLY in ${params.language || "English"}.
8. Options: Provide 3 short, intriguing plot directions.
${params.goal ? `9. Goal: The characters should aim for: '${params.goal}'` : ""}
${params.lesson ? `10. Theme: Incorporate the theme: '${params.lesson}'` : ""}
${params.premise ? `11. PREMISE: Use this starting concept: '${params.premise}'` : ""}
`;
  }

  private buildStartUserPrompt(params: GenerationParams): string {
    return `Write the beginning of my ${params.genre} story${params.premise ? ` based on the premise: "${params.premise}"` : ""}. Follow the level constraints strictly.`;
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
        premise,
        level,
        level_label,
      } = job.params || {};

      const { content, options, vocabulary_highlight, narrative_context } =
        await aiProvider.generateStoryStart({
          genre,
          language,
          goal,
          lesson,
          premise,
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
          language_level: level_label,
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
        choices: options,
        vocabulary_highlight: vocabulary_highlight,
        is_user_input: false,
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
        selected_choice_index,
        context_summary,
        narrative_context,
      } = job.params || {};

      // ---------------------------------------------------------
      // STEP A: SAVE THE USER'S CHOICE TO THE PREVIOUS PART
      // ---------------------------------------------------------

      // 1. Find the last part (Part N)
      const { data: lastParts } = await supabase
        .from("story_parts")
        .select("id, part_number, choices")
        .eq("story_id", story_id)
        .order("part_number", { ascending: false })
        .limit(1);

      // Fetch story level
      const { data: storyData } = await supabase
        .from("stories")
        .select("language_level")
        .eq("id", story_id)
        .single();

      const storyLevel = storyData?.language_level || "Intermediate";

      const lastPart = lastParts?.[0];

      // Resolve user_direction for AI choice
      let resolvedUserDirection = user_direction;
      if (
        type === "ai" &&
        typeof selected_choice_index === "number" &&
        lastPart
      ) {
        const choices = lastPart.choices || [];
        if (choices[selected_choice_index]) {
          resolvedUserDirection = choices[selected_choice_index];
        }
      }

      // 2. Update it with what the user selected to trigger this new generation
      if (lastPart) {
        await supabase
          .from("story_parts")
          .update({
            // selected_choice is removed.
            selected_choice_index: selected_choice_index,
            user_custom_input: type === "custom" ? user_direction : null,
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
        user_direction: resolvedUserDirection,
        // selected_choice_index is not strictly needed by AI if user_direction (text) is resolved
        context_summary,
        narrative_context,
        native_language: userNativeLanguage,
        level_label: storyLevel, // Pass the level
      });

      // Calculate next part number
      const nextPartNumber = (lastPart?.part_number || 0) + 1;

      // Insert New Part
      const { error: partError } = await supabase.from("story_parts").insert({
        story_id,
        part_number: nextPartNumber,
        content: content,
        choices: options,
        // We track 'user_custom_input' on the NEW part only if it was TYPED (custom)
        user_custom_input: type === "custom" ? user_direction : null,
        correction: correction,
        vocabulary_highlight: vocabulary_highlight,
        is_user_input: false,
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
