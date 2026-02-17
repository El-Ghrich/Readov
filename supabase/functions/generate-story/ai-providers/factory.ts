// ai-providers/factory.ts
import { AIProvider } from "./base.ts";
import { GeminiProvider } from "./gemini.ts";
// import { MistralProvider } from "./mistral.ts";

export function getAIProvider(): AIProvider {
  // Read from Environment Variable
  const providerName = Deno.env.get("AI_PROVIDER")?.toLowerCase() || "mistral";

  if (providerName === "gemini") {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
    return new GeminiProvider(apiKey);
  } 
  
//   else if (providerName === "mistral") {
//     const apiKey = Deno.env.get("MISTRAL_API_KEY");
//     if (!apiKey) throw new Error("MISTRAL_API_KEY is missing");
//     return new MistralProvider(apiKey, "https://api.deepinfra.com/v1/openai");
//   }

  throw new Error(`Unsupported AI Provider: ${providerName}`);
}