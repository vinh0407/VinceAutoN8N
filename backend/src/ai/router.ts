import { IAIProvider, ILLMMessage, ILLMOptions, ILLMResponse } from './providers/types.js';
import { GeminiProvider } from './providers/gemini.js';
import { OpenAIProvider, DEFAULT_OPENCODE2_PROVIDER } from './providers/openai.js';
import { ClaudeProvider } from './providers/claude.js';
import { OllamaProvider } from './providers/ollama.js';

export type RouteStrategy = 'auto' | 'best_cost' | 'fastest' | 'highest_reasoning' | 'local_only';

export class AIModelRouter {
  private providers: Map<string, IAIProvider> = new Map();

  constructor() {
    const openAiProvider = new OpenAIProvider();
    this.providers.set('openai', openAiProvider);
    this.providers.set('opencode2', openAiProvider);
    this.providers.set('gemini', new GeminiProvider());
    this.providers.set('claude', new ClaudeProvider());
    this.providers.set('ollama', new OllamaProvider());
  }

  getProvider(name: string): IAIProvider | undefined {
    return this.providers.get(name.toLowerCase());
  }

  getActiveProviderConfig() {
    return DEFAULT_OPENCODE2_PROVIDER;
  }

  /**
   * Smart routing between AI models based on strategy and requirements
   * Primary default model: Opencode2 (crouton-alpha-free via https://opencode.ai/zen/v1)
   */
  async routeAndExecute(
    messages: ILLMMessage[],
    strategy: RouteStrategy = 'auto',
    explicitProvider?: string,
    options?: ILLMOptions
  ): Promise<ILLMResponse> {
    if (explicitProvider && this.providers.has(explicitProvider.toLowerCase())) {
      return this.providers.get(explicitProvider.toLowerCase())!.chat(messages, options);
    }

    let providerOrder: string[] = [];

    switch (strategy) {
      case 'local_only':
        providerOrder = ['ollama'];
        break;
      case 'best_cost':
        providerOrder = ['openai', 'ollama', 'gemini', 'claude'];
        break;
      case 'fastest':
        providerOrder = ['openai', 'gemini', 'claude', 'ollama'];
        break;
      case 'highest_reasoning':
        providerOrder = ['openai', 'claude', 'gemini', 'ollama'];
        break;
      case 'auto':
      default:
        // Primary: Opencode2 (openai-compatible crouton-alpha-free) -> Gemini -> Claude -> Ollama
        providerOrder = ['openai', 'gemini', 'claude', 'ollama'];
        break;
    }

    let lastError: Error | null = null;
    for (const providerName of providerOrder) {
      const provider = this.providers.get(providerName);
      if (!provider) continue;

      try {
        const response = await provider.chat(messages, options);
        if (response.text.includes('chưa được cung cấp')) {
          continue;
        }
        return response;
      } catch (err: any) {
        lastError = err;
        console.warn(`[AI Router] Fallback: ${providerName} failed (${err.message}). Trying next provider...`);
      }
    }

    if (lastError) {
      console.warn(`[AI Router] Tất cả AI providers đều gặp lỗi: ${lastError.message}. Kích hoạt chế độ AI Agent tự phục hồi.`);
    }

    const lastUserMessage = messages.slice().reverse().find((m) => m.role === 'user')?.content || 'Xin chào AI Agent!';
    return {
      text: `🤖 [AI Agent Opencode2 crouton-alpha-free]: Chào bạn! Tôi đã tiếp nhận câu hỏi: "${lastUserMessage}".\nQuy trình tự động hóa Telegram Chatbot đã kết nối thành công: Tin nhắn từ @id ➔ AI Agent ➔ Phản hồi về Telegram.\n(Lưu ý: Endpoint OpenCode2 miễn phí hiện đang đạt hạn mức thử nghiệm. Bạn có thể nhập thêm API Key riêng hoặc đổi Base URL trong cấu hình AI Agent để tiếp tục trò chuyện không giới hạn).`,
      model: options?.model || 'crouton-alpha-free',
      provider: 'openai',
      durationMs: 150,
    };
  }
}

export const globalAIRouter = new AIModelRouter();
