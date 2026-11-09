export interface ILLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ILLMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  baseUrl?: string;
  systemPrompt?: string;
}

export interface ILLMResponse {
  text: string;
  model: string;
  provider: 'gemini' | 'openai' | 'claude' | 'ollama';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  durationMs: number;
}

export interface IAIProvider {
  name: 'gemini' | 'openai' | 'claude' | 'ollama';
  chat(messages: ILLMMessage[], options?: ILLMOptions): Promise<ILLMResponse>;
  generate(prompt: string, options?: ILLMOptions): Promise<ILLMResponse>;
}
