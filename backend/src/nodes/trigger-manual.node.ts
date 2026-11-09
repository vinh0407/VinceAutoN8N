import { INodeType, IExecutionContext, INodeExecutionData, INode } from '../engine/types.js';

export class TriggerManualNode implements INodeType {
  description = {
    name: 'trigger.manual',
    displayName: 'Manual Trigger',
    icon: 'PlayCircle',
    category: 'trigger' as const,
    description: 'Kích hoạt quy trình thủ công từ giao diện hoặc qua API test',
    version: 1,
    properties: [],
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
          triggeredBy: 'manual',
          runId: context.runId,
        },
      },
    ];
  }
}
