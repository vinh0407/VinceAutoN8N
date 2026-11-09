import axios from 'axios';
import { IAIProvider, ILLMMessage, ILLMOptions, ILLMResponse } from './types.js';

export class OllamaProvider implements IAIProvider {
  name: 'ollama' = 'ollama';

  async generate(prompt: string, options?: ILLMOptions): Promise<ILLMResponse> {
    return this.chat([{ role: 'user', content: prompt }], options);
  }

  async chat(messages: ILLMMessage[], options?: ILLMOptions): Promise<ILLMResponse> {
    const startTime = Date.now();
    const model = options?.model || process.env.OLLAMA_MODEL || 'llama3';
    const baseUrl = options?.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

    try {
      const res = await axios.post(
        `${baseUrl}/api/chat`,
        {
          model,
          messages,
          stream: false,
          options: {
            temperature: options?.temperature ?? 0.7,
            num_predict: options?.maxTokens,
          },
        },
        { timeout: 120000 }
      );

      const text = res.data?.message?.content || '';

      return {
        text,
        model,
        provider: 'ollama',
        usage: {
          promptTokens: res.data?.prompt_eval_count || 0,
          completionTokens: res.data?.eval_count || 0,
          totalTokens: (res.data?.prompt_eval_count || 0) + (res.data?.eval_count || 0),
        },
        durationMs: Date.now() - startTime,
      };
    } catch (error: any) {
      const msg = error.message;
      throw new Error(
        `Ollama Error: Không kết nối được tới ${baseUrl} (${msg}). Vui lòng đảm bảo Ollama đang chạy.`
      );
    }
  }
}
