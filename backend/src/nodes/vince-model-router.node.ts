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

      const response = await globalAIRouter.routeAndExecute(messages, strategy, undefined, {
        temperature: Number(node.parameters.temperature ?? 0.7),
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
