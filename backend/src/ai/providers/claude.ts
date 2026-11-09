import axios from 'axios';
import { IAIProvider, ILLMMessage, ILLMOptions, ILLMResponse } from './types.js';

export class ClaudeProvider implements IAIProvider {
  name: 'claude' = 'claude';

  async generate(prompt: string, options?: ILLMOptions): Promise<ILLMResponse> {
    return this.chat([{ role: 'user', content: prompt }], options);
  }

  async chat(messages: ILLMMessage[], options?: ILLMOptions): Promise<ILLMResponse> {
    const startTime = Date.now();
    const apiKey = options?.apiKey || process.env.ANTHROPIC_API_KEY;
    const model = options?.model || 'claude-3-5-sonnet-20241022';

    if (!apiKey) {
      return {
        text: `[Claude Provider]: API Key chưa được cung cấp. Vui lòng cấu hình ANTHROPIC_API_KEY trong VinceAuto Credentials.`,
        model,
        provider: 'claude',
        durationMs: Date.now() - startTime,
      };
    }

    try {
      const systemMessage = messages.find((m) => m.role === 'system');
      const chatMessages = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const payload: any = {
        model,
        messages: chatMessages,
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature ?? 0.7,
      };

      if (systemMessage) {
        payload.system = systemMessage.content;
      }

      const res = await axios.post('https://api.anthropic.com/v1/messages', payload, {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      });

      const text = res.data?.content?.[0]?.text || '';
      const usage = res.data?.usage;

      return {
        text,
        model,
        provider: 'claude',
        usage: usage
          ? {
              promptTokens: usage.input_tokens,
              completionTokens: usage.output_tokens,
              totalTokens: (usage.input_tokens || 0) + (usage.output_tokens || 0),
            }
          : undefined,
        durationMs: Date.now() - startTime,
      };
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || error.message;
      throw new Error(`Claude API Error: ${msg}`);
    }
  }
}
