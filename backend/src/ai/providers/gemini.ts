import axios from 'axios';
import { IAIProvider, ILLMMessage, ILLMOptions, ILLMResponse } from './types.js';

export class GeminiProvider implements IAIProvider {
  name: 'gemini' = 'gemini';

  async generate(prompt: string, options?: ILLMOptions): Promise<ILLMResponse> {
    return this.chat([{ role: 'user', content: prompt }], options);
  }

  async chat(messages: ILLMMessage[], options?: ILLMOptions): Promise<ILLMResponse> {
    const startTime = Date.now();
    const apiKey = options?.apiKey || process.env.GEMINI_API_KEY;
    const model = options?.model || 'gemini-2.5-flash';

    if (!apiKey) {
      return {
        text: `[Gemini Provider]: API Key chưa được cung cấp. Vui lòng cấu hình GEMINI_API_KEY trong VinceAuto Credentials.`,
        model,
        provider: 'gemini',
        durationMs: Date.now() - startTime,
      };
    }

    try {
      const contents = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

      const systemMessage = messages.find((m) => m.role === 'system');

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload: any = { contents };

      if (systemMessage) {
        payload.systemInstruction = {
          parts: [{ text: systemMessage.content }],
        };
      }

      if (options?.temperature !== undefined) {
        payload.generationConfig = {
          temperature: options.temperature,
          maxOutputTokens: options.maxTokens,
        };
      }

      const res = await axios.post(url, payload, { timeout: 60000 });
      const candidate = res.data?.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text || '';
      const usage = res.data?.usageMetadata;

      return {
        text,
        model,
        provider: 'gemini',
        usage: usage
          ? {
              promptTokens: usage.promptTokenCount || 0,
              completionTokens: usage.candidatesTokenCount || 0,
              totalTokens: usage.totalTokenCount || 0,
            }
          : undefined,
        durationMs: Date.now() - startTime,
      };
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || error.message;
      throw new Error(`Gemini API Error: ${msg}`);
    }
  }
}
