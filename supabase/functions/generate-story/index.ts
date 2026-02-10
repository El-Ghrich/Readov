// index.ts
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerationParams {
  genre: string;
  language?: string;
  goal?: string;
  lesson?: string;
  level?: number;
}

interface ContinuationParams {
  story_id: string;
  type: 'ai' | 'custom';
  user_direction?: string; // For custom
  context_summary?: string; // Previous parts
}

interface StoryResponse {
  content: string;
  options: string[];
}

class GeminiProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "gemini-2.5-flash") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateStoryStart(params: GenerationParams): Promise<StoryResponse> {
    const systemPrompt = this.buildSystemPrompt(params);
    const userPrompt = this.buildUserPrompt(params);
    return this.callGemini(systemPrompt, userPrompt);
  }

  async continueStory(params: ContinuationParams): Promise<StoryResponse> {
    const systemPrompt = `You are a professional storyteller continuing a story.
RULES:
1. OUTPUT FORMAT: STRICT JSON. Do not write markdown.
   Format: { "content": "Story text...", "options": ["Choice 1", "Choice 2", "Choice 3"] }
2. Write specifically between 150 and 250 words. Do not write less.
3. Structure: 1-2 engaging paragraphs.
4. Content: Continue the plot logically and creatively.
5. Style: Match the tone of the previous context.
6. Options: Provide 3 short, intriguing plot directions for what happens NEXT (max 10 words each).
${params.type === 'custom' && params.user_direction ? `7. DIRECTION: Follow this specific instruction: "${params.user_direction}"` : ""}
`;

    const userPrompt = `Here is the story so far:\n\n${params.context_summary}\n\nContinue the story now.${params.type === 'custom' && params.user_direction ? ` Specifically: ${params.user_direction}` : ""}`;

    return this.callGemini(systemPrompt, userPrompt);
  }

  private async callGemini(system: string, user: string): Promise<StoryResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    console.log(`Calling Gemini Model: ${this.model}`);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: system + "\n\n" + user }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.8,
          responseMimeType: "application/json" // Force JSON output mode if supported by model, otherwise prompt handles it
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error Body:", errorText);
      throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const rawText = candidate?.content?.parts?.[0]?.text?.trim();

    if (!rawText) return { content: "Error: No content generated.", options: [] };

    try {
      // Clean up potential markdown formatting
      const jsonString = rawText.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(jsonString);
      return {
        content: parsed.content || rawText,
        options: parsed.options || []
      };
    } catch (e) {
      console.error("Failed to parse JSON response:", rawText);
      // Fallback: return raw text and empty options
      return { content: rawText, options: [] };
    }
  }

  private buildSystemPrompt(params: GenerationParams): string {
    return `You are a professional storyteller writing a ${params.genre} story in ${params.language || 'English'}.
RULES:
1. OUTPUT FORMAT: STRICT JSON. Do not write markdown.
   Format: { "content": "Story text...", "options": ["Choice 1", "Choice 2", "Choice 3"] }
2. Write specificly between 150 and 250 words. Do not write less.
3. Structure: 1-2 engaging paragraphs.
4. Content: START the story immediately with action or dialogue.
5. Complexity: Level ${params.level || 5}/10.
6. Language: Write ONLY in ${params.language || 'English'}.
7. Options: Provide 3 short, intriguing plot directions for what happens NEXT (max 10 words each).
${params.goal ? `8. Goal: The characters should aim for: '${params.goal}'` : ""}
${params.lesson ? `9. Theme: Incorporate the theme: '${params.lesson}'` : ""}
`;
  }

  private buildUserPrompt(params: GenerationParams): string {
    return `Write the beginning of my ${params.genre} story. Ensure it is at least 150 words long and not more than 250 words.`;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let job = null, supabase = null, jobId = "unknown";

  try {
    const payload = await req.json();
    // Support both direct invocation (body) and Supabase database webhook (record)
    job = payload.record || payload;

    if (job?.id) jobId = job.id;

    console.log(`Processing job ${jobId}, type: ${job?.type}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!supabaseUrl || !supabaseKey || !apiKey) {
      throw new Error("Missing Environment Variables");
    }

    supabase = createClient(supabaseUrl, supabaseKey);
    const aiProvider = new GeminiProvider(apiKey); // Use stable model

    // Update job to processing
    if (jobId !== 'unknown') {
      await supabase.from('jobs').update({ status: 'processing' }).eq('id', jobId);
    }

    // --- HANDLE START STORY ---
    if (job.type === 'generate_start') {
      const { genre, language = 'English', goal, lesson, level } = job.params || {};
      console.log("Generating start...");

      const { content, options } = await aiProvider.generateStoryStart({ genre, language, goal, lesson, level });

      // Create Story
      const { data: story, error: storyError } = await supabase.from('stories').insert({
        user_id: job.user_id,
        title: "Your Story",
        genre, language, goal, lesson,
        full_story: content,
        is_published: false, is_completed: false
      }).select().single();

      if (storyError) throw storyError;

      // Create Part 1
      const { error: partError } = await supabase.from('story_parts').insert({
        story_id: story.id,
        part_number: 1,
        content: content,
        choices: options, // Store choices
        is_user_input: false
      });

      if (partError) throw partError;

      // Complete Job
      if (jobId !== 'unknown') {
        await supabase.from('jobs').update({ status: 'completed', result: { story_id: story.id } }).eq('id', jobId);
      }

      return new Response(JSON.stringify({ success: true, story_id: story.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- HANDLE CONTINUE STORY ---
    else if (job.type === 'continue_story') {
      const { story_id, type, user_direction, context_summary } = job.params || {};
      console.log("Continuing story...");

      const { content, options } = await aiProvider.continueStory({ story_id, type, user_direction, context_summary });

      // Get next part number
      const { count } = await supabase.from('story_parts').select('*', { count: 'exact', head: true }).eq('story_id', story_id);
      const nextPartNumber = (count || 0) + 1;

      // Insert new part
      const { error: partError } = await supabase.from('story_parts').insert({
        story_id,
        part_number: nextPartNumber,
        content: content,
        choices: options, // Store choices
        is_user_input: type === 'custom' // Mark if it was influenced by user direction? Or stricly if the user WROTE it? 
        // In this specific flow, AI writes it based on direction, so it mimics AI generation.
        // If the user literally wrote the text, we wouldn't use this AI job.
        // So is_user_input should be false because AI generated the text.
      });

      if (partError) throw partError;

      // Append to full story in parent table
      // First get current full story
      const { data: currentStory } = await supabase.from('stories').select('full_story').eq('id', story_id).single();
      const newFullStory = (currentStory?.full_story || '') + "\n\n" + content;

      await supabase.from('stories').update({ full_story: newFullStory, updated_at: new Date().toISOString() }).eq('id', story_id);

      // Complete Job
      if (jobId !== 'unknown') {
        await supabase.from('jobs').update({ status: 'completed', result: { story_id } }).eq('id', jobId);
      }

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    else {
      return new Response(JSON.stringify({ message: "Job type ignored" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

  } catch (error) {
    console.error("Error processing job:", error);
    if (supabase && jobId !== "unknown") {
      await supabase.from('jobs').update({
        status: 'failed',
        error: error instanceof Error ? error.message : String(error)
      }).eq('id', jobId);
    }
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});