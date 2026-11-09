import axios from 'axios';
import { IAIProvider, ILLMMessage, ILLMOptions, ILLMResponse } from './types.js';

export const DEFAULT_OPENCODE2_PROVIDER = {
  providerName: 'Opencode2',
  providerType: 'openai',
  baseUrl: 'https://opencode.ai/zen/v1',
  apiKey: 'oc_sk_5583787331ee_7BzCEfqfok9jfIpRaoTipbnWONwqUcZh',
  models: ['crouton-alpha-free'],
  defaultModel: 'crouton-alpha-free',
  status: 'Kích hoạt',
  createdAt: '2026-11-08T00:12:36.869Z',
};

export class OpenAIProvider implements IAIProvider {
  name: 'openai' = 'openai';

  async generate(prompt: string, options?: ILLMOptions): Promise<ILLMResponse> {
    return this.chat([{ role: 'user', content: prompt }], options);
  }

  async chat(messages: ILLMMessage[], options?: ILLMOptions): Promise<ILLMResponse> {
    const startTime = Date.now();
    const apiKey =
      options?.apiKey ||
      process.env.OPENCODE2_API_KEY ||
      process.env.OPENAI_API_KEY ||
      DEFAULT_OPENCODE2_PROVIDER.apiKey;
    const model =
      options?.model ||
      process.env.OPENCODE2_MODEL ||
      process.env.OPENAI_MODEL ||
      DEFAULT_OPENCODE2_PROVIDER.defaultModel;
    const baseUrl = (
      options?.baseUrl ||
      process.env.OPENCODE2_BASE_URL ||
      process.env.OPENAI_BASE_URL ||
      DEFAULT_OPENCODE2_PROVIDER.baseUrl
    ).replace(/\/+$/, '');

    if (!apiKey) {
      return {
        text: `[Opencode2 / OpenAI Provider]: API Key chưa được cung cấp. Vui lòng cấu hình trong VinceAuto Credentials.`,
        model,
        provider: 'openai',
        durationMs: Date.now() - startTime,
      };
    }

    try {
      const formattedMessages = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await axios.post(
        `${baseUrl}/chat/completions`,
        {
          model,
          messages: formattedMessages,
          temperature: options?.temperature ?? 0.3,
          max_tokens: options?.maxTokens ?? 4096,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 45000,
        }
      );

      const choice = res.data?.choices?.[0];
      const text =
        choice?.message?.content ||
        choice?.text ||
        (typeof res.data?.content === 'string' ? res.data.content : '');
      const usage = res.data?.usage;

      return {
        text,
        model,
        provider: 'openai',
        usage: usage
          ? {
              promptTokens: usage.prompt_tokens || 0,
              completionTokens: usage.completion_tokens || 0,
              totalTokens: usage.total_tokens || 0,
            }
          : undefined,
        durationMs: Date.now() - startTime,
      };
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || error.message;
      throw new Error(`Opencode2 (crouton-alpha-free) API Error: ${msg}`);
    }
  }
}
