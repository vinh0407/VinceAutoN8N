import { INodeType, IExecutionContext, INodeExecutionData, INode } from '../engine/types.js';
import { ExpressionEvaluator } from '../engine/expression.js';
import { globalAIRouter } from '../ai/router.js';

export class VinceModelRouterNode implements INodeType {
  description = {
    name: 'vince.modelRouter',
    displayName: 'VinceAuto AI Model Router',
    icon: 'Cpu',
    category: 'vince' as const,
    description: 'Định tuyến thông minh giữa Gemini, OpenAI, Claude và Ollama',
    version: 1,
    properties: [
      {
        name: 'baseUrl',
        displayName: 'Base URL (Đường link API Endpoint)',
        type: 'string' as const,
        default: 'https://opencode.ai/zen/v1',
        placeholder: 'https://opencode.ai/zen/v1 hoặc https://api.openai.com/v1',
        required: true,
      },
      {
        name: 'model',
        displayName: 'Lựa chọn Model',
        type: 'options' as const,
        default: 'crouton-alpha-free',
        options: [
          { name: 'crouton-alpha-free (Opencode2 Miễn phí)', value: 'crouton-alpha-free' },
          { name: 'gpt-4o (OpenAI Omni Flagship)', value: 'gpt-4o' },
          { name: 'gpt-4o-mini (OpenAI Fast & Efficient)', value: 'gpt-4o-mini' },
          { name: 'o3-mini (OpenAI Reasoning)', value: 'o3-mini' },
          { name: 'gemini-2.0-flash (Google Gemini Flash)', value: 'gemini-2.0-flash' },
          { name: 'gemini-1.5-pro (Google Gemini Pro)', value: 'gemini-1.5-pro' },
          { name: 'claude-3-5-sonnet (Anthropic Claude)', value: 'claude-3-5-sonnet' },
          { name: 'deepseek-chat (DeepSeek V3)', value: 'deepseek-chat' },
          { name: 'deepseek-reasoner (DeepSeek R1)', value: 'deepseek-reasoner' },
          { name: 'llama3:latest (Local Ollama)', value: 'llama3' },
          { name: 'Custom Model (Tự nhập model khác)', value: 'custom' },
        ],
        required: true,
      },
      {
        name: 'customModel',
        displayName: 'Tên Model Tùy Chỉnh (Nếu chọn Custom)',
        type: 'string' as const,
        default: '',
        placeholder: 'Nhập tên model (VD: qwen2.5-coder:32b, mistral-large)...',
      },
      {
        name: 'apiKey',
        displayName: 'API Key (Tùy chọn, để trống dùng Credentials)',
        type: 'string' as const,
        default: '',
        placeholder: 'oc_sk_... hoặc sk-...',
      },
      {
        name: 'strategy',
        displayName: 'Routing Strategy',
        type: 'options' as const,
        default: 'auto',
        options: [
          { name: 'Tự động tối ưu (Auto Balanced)', value: 'auto' },
          { name: 'Tiết kiệm chi phí nhất (Best Cost / Free Ollama)', value: 'best_cost' },
          { name: 'Tốc độ phản hồi nhanh nhất (Fastest)', value: 'fastest' },
          { name: 'Tư duy logic sâu nhất (Highest Reasoning)', value: 'highest_reasoning' },
          { name: 'Chạy Offline / Local Only (Ollama)', value: 'local_only' },
        ],
        required: true,
      },
      {
        name: 'prompt',
        displayName: 'Prompt',
        type: 'string' as const,
        default: 'Hãy phân tích và tóm tắt thông tin sau:\n{{ JSON.stringify($json) }}',
        placeholder: 'Nhập prompt gửi cho AI...',
        required: true,
      },
      {
        name: 'systemPrompt',
        displayName: 'System Prompt (Optional)',
        type: 'string' as const,
        default: 'Bạn là chuyên gia phân tích dữ liệu tự động của VinceAuto.',
      },
      {
        name: 'temperature',
        displayName: 'Temperature',
        type: 'number' as const,
        default: 0.7,
      },
    ],
    inputs: ['main'],
    outputs: ['main'],
  };

  async execute(
    context: IExecutionContext,
    inputData: INodeExecutionData[],
    node: INode
  ): Promise<INodeExecutionData[]> {
    const results: INodeExecutionData[] = [];
    const items = inputData.length > 0 ? inputData : [{ json: {} }];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const evaluatedPrompt = ExpressionEvaluator.evaluate(node.parameters.prompt, item, context, i);
      const evaluatedSystem = ExpressionEvaluator.evaluate(node.parameters.systemPrompt, item, context, i);
      const strategy = node.parameters.strategy || 'auto';

      const messages: any[] = [];
      if (evaluatedSystem) {
        messages.push({ role: 'system', content: evaluatedSystem });
      }
      messages.push({ role: 'user', content: evaluatedPrompt });

      const baseUrl = node.parameters.baseUrl || process.env.OPENCODE2_BASE_URL || 'https://opencode.ai/zen/v1';
      const selectedModel = node.parameters.model === 'custom' && node.parameters.customModel
        ? node.parameters.customModel
        : (node.parameters.model || 'crouton-alpha-free');
      const apiKey = node.parameters.apiKey || context.credentials?.OPENCODE2_API_KEY || process.env.OPENCODE2_API_KEY;

      const response = await globalAIRouter.routeAndExecute(messages, strategy, undefined, {
        temperature: Number(node.parameters.temperature ?? 0.7),
        baseUrl,
        model: selectedModel,
        apiKey,
      });

      results.push({
        json: {
          ...item.json,
          aiResponse: response.text,
          aiModel: response.model,
          aiProvider: response.provider,
          aiDurationMs: response.durationMs,
          aiUsage: response.usage,
        },
      });
    }

    return results;
  }
}
