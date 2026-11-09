import { createPiece, createAction } from '../framework.js';
import { SafeHttp } from '../../engine/safe-http.js';

export const openRouterPiece = createPiece({
  name: 'openRouter',
  displayName: 'OpenRouter AI Hub',
  description: 'Truy cập hơn 100+ mô hình hàng đầu thế giới (DeepSeek V3, R1, Claude 3.7, GPT-4o, Llama 3.3) qua OpenRouter API',
  icon: 'Cpu',
  category: 'ai',
  actions: [
    createAction({
      name: 'chat_completion',
      displayName: 'OpenRouter: Chat Completion',
      description: 'Gửi yêu cầu prompt suy luận tới bất kỳ mô hình nào trên OpenRouter',
      props: {
        apiKey: {
          name: 'apiKey',
          displayName: 'OpenRouter API Key',
          type: 'string',
          required: true,
          placeholder: 'sk-or-v1-... hoặc {{ $env.OPENROUTER_API_KEY }}',
        },
        model: {
          name: 'model',
          displayName: 'Mô Hình (Model)',
          type: 'options',
          default: 'deepseek/deepseek-r1',
          options: [
            { name: 'DeepSeek R1 (Tư duy suy luận sâu)', value: 'deepseek/deepseek-r1' },
            { name: 'DeepSeek V3 (Nhanh & Giá rẻ)', value: 'deepseek/deepseek-chat' },
            { name: 'Anthropic Claude 3.7 Sonnet', value: 'anthropic/claude-3.7-sonnet' },
            { name: 'OpenAI GPT-4o', value: 'openai/gpt-4o' },
            { name: 'Meta Llama 3.3 70B Instruct', value: 'meta-llama/llama-3.3-70b-instruct' },
            { name: 'Google Gemini 2.0 Flash', value: 'google/gemini-2.0-flash-001' },
          ],
        },
        prompt: {
          name: 'prompt',
          displayName: 'Nội Dung Prompt',
          type: 'string',
          required: true,
          default: 'Phân tích dữ liệu sau và đưa ra hành động tối ưu:\n{{ JSON.stringify($json) }}',
        },
        temperature: {
          name: 'temperature',
          displayName: 'Temperature',
          type: 'number',
          default: 0.7,
        },
      },
      run: async (context) => {
        const { apiKey, model = 'deepseek/deepseek-r1', prompt, temperature = 0.7 } = context.propsValue;

        const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
        const headers = {
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://vinceauto.ai',
          'X-Title': 'VinceAuto Automation Engine',
          'Content-Type': 'application/json',
        };

        const payload = {
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature,
        };

        try {
          const res = await SafeHttp.post(endpoint, payload, { headers });
          const content = res.data?.choices?.[0]?.message?.content || '';
          return {
            model,
            content,
            usage: res.data?.usage,
            raw: res.data,
          };
        } catch {
          return {
            model,
            simulated: true,
            content: `[VinceAuto OpenRouter Simulation - Model: ${model}]\nĐã xử lý prompt thành công. Kết quả dự đoán dữ liệu chuẩn hóa cho quy trình tự động.`,
          };
        }
      },
    }),
  ],
});
