// ai-providers/gemini.ts
import { AIProvider, GenerationParams } from "./base.ts";

export class GeminiProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "gemini-1.5-flash") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateStoryStart(params: GenerationParams): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(params);
    const userPrompt = this.buildUserPrompt(params);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: systemPrompt + "\n\n" + userPrompt }]
          }
        ],
        generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Once upon a time...";
  }

  private buildSystemPrompt(params: GenerationParams): string {
    return `You are a story narrator writing a ${params.genre} story in ${params.language || 'English'}. Strict rules:
    1. ALWAYS continue the story (NEVER conclude)
    2. MAX 200 words
    3. Write ONLY in ${params.language || 'English'} with complexity level ${params.level || 5}/10.
    4. ${params.goal ? `Progress toward: '${params.goal}'` : ""}
    5. ${params.lesson ? `Weave in lesson: '${params.lesson}'` : ""}
    6. Skip summaries/intros. Write as if narrating someone else's adventure.`;
  }

  private buildUserPrompt(params: GenerationParams): string {
    return `Write the beginning of an engaging ${params.genre} story.`;
  }
}