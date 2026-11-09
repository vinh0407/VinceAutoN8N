import { INodeType, IExecutionContext, INodeExecutionData, INode } from '../engine/types.js';
import { ExpressionEvaluator } from '../engine/expression.js';
import { globalAIRouter } from '../ai/router.js';

export class VinceAgentManagerNode implements INodeType {
  description = {
    name: 'vince.agentManager',
    displayName: 'VinceAgent Manager',
    icon: 'Bot',
    category: 'vince' as const,
    description: 'Điều phối các Sub-Agents chuyên trách (Researcher, Planner, Coder, Critic)',
    version: 1,
    properties: [
      {
        name: 'agentRole',
        displayName: 'Agent Role',
        type: 'options' as const,
        default: 'planner',
        options: [
          { name: 'Planner (Lập kế hoạch & phân rã mục tiêu)', value: 'planner' },
          { name: 'Researcher (Nghiên cứu & tổng hợp dữ liệu)', value: 'researcher' },
          { name: 'Coder (Viết code & cấu trúc kỹ thuật)', value: 'coder' },
          { name: 'Critic & Validator (Kiểm tra chất lượng & phản biện)', value: 'critic' },
          { name: 'Custom Specialist (Tùy chỉnh vai trò)', value: 'custom' },
        ],
        required: true,
      },
      {
        name: 'taskGoal',
        displayName: 'Mục Tiêu Tác Vụ',
        type: 'string' as const,
        default: 'Phân tích mục tiêu: {{ $json.goal || $json.data }} và lập kế hoạch thực thi chi tiết',
        required: true,
      },
      {
        name: 'customRolePrompt',
        displayName: 'Custom Role Instruction (Optional)',
        type: 'string' as const,
        default: '',
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

    const rolePrompts: Record<string, string> = {
      planner: 'Bạn là VinceAgent Planner. Nhiệm vụ: Phân rã mục tiêu thành các bước hành động cụ thể, xác định phụ thuộc và rủi ro.',
      researcher: 'Bạn là VinceAgent Researcher. Nhiệm vụ: Thu thập thông tin, tìm kiếm insight, tổng hợp số liệu và đúc kết phát hiện quan trọng.',
      coder: 'Bạn là VinceAgent Coder. Nhiệm vụ: Thiết kế giải pháp kỹ thuật, viết code chuẩn sạch, tối ưu hóa thuật toán và bảo mật.',
      critic: 'Bạn là VinceAgent Critic & QA. Nhiệm vụ: Soát lỗi logic, kiểm tra tính khả thi, phát hiện lỗ hổng và đề xuất phương án cải thiện.',
      custom: node.parameters.customRolePrompt || 'Bạn là VinceAgent Specialist.',
    };

    const role = node.parameters.agentRole || 'planner';
    const systemPrompt = rolePrompts[role] || rolePrompts.planner;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const evaluatedGoal = ExpressionEvaluator.evaluate(node.parameters.taskGoal, item, context, i);

      const response = await globalAIRouter.routeAndExecute(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: evaluatedGoal },
        ],
        'highest_reasoning'
      );

      results.push({
        json: {
          ...item.json,
          agentRole: role,
          agentOutput: response.text,
          agentModelUsed: response.model,
          timestamp: new Date().toISOString(),
        },
      });
    }

    return results;
  }
}
