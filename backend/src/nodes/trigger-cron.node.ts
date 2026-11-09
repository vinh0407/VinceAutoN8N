import { INodeType, IExecutionContext, INodeExecutionData, INode } from '../engine/types.js';

export class TriggerCronNode implements INodeType {
  description = {
    name: 'trigger.cron',
    displayName: 'Schedule Trigger (Cron)',
    icon: 'Clock',
    category: 'trigger' as const,
    description: 'Tự động kích hoạt quy trình theo lịch biểu (Cron expression)',
    version: 1,
    properties: [
      {
        name: 'cronExpression',
        displayName: 'Cron Expression',
        type: 'string' as const,
        default: '0 8 * * *',
        placeholder: '*/15 * * * * hoặc 0 8 * * *',
        description: 'Định dạng cron: phút giờ ngày tháng thứ (ví dụ: 0 8 * * * = 8h sáng mỗi ngày)',
        required: true,
      },
      {
        name: 'timezone',
        displayName: 'Timezone',
        type: 'string' as const,
        default: 'Asia/Ho_Chi_Minh',
        description: 'Múi giờ thực thi',
      },
    ],
    inputs: [],
    outputs: ['main'],
  };

  async execute(
    context: IExecutionContext,
    inputData: INodeExecutionData[],
    node: INode
  ): Promise<INodeExecutionData[]> {
    return [
      {
        json: {
          timestamp: new Date().toISOString(),
          triggeredBy: 'cron',
          cronExpression: node.parameters.cronExpression || '0 8 * * *',
          timezone: node.parameters.timezone || 'Asia/Ho_Chi_Minh',
          runId: context.runId,
        },
      },
    ];
  }
}
