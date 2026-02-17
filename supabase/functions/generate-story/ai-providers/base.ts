// ai-providers/base.ts

export interface GenerationParams {
  genre: string;
  language?: string;
  goal?: string;
  lesson?: string;
  level?: number;
}

export interface AIProvider {
  generateStoryStart(params: GenerationParams): Promise<string>;
}