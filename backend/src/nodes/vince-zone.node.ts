import { INodeType, IExecutionContext, INodeExecutionData, INode } from '../engine/types.js';
import { ExpressionEvaluator } from '../engine/expression.js';

export class VinceZoneNode implements INodeType {
  description = {
    name: 'vince.zone',
    displayName: 'VinceZone Ecosystem Connector',
    icon: 'Layers',
    category: 'vince' as const,
    description: 'Kết nối và đồng bộ dữ liệu vào hệ sinh thái nền tảng VinceZone',
    version: 1,
    properties: [
      {
        name: 'resource',
        displayName: 'Resource Type',
        type: 'options' as const,
        default: 'automation_jobs',
        options: [
          { name: 'Automation Jobs (Quản lý tiến trình)', value: 'automation_jobs' },
          { name: 'Lead & Contact Pipeline (Khách hàng)', value: 'contacts' },
          { name: 'Analytics & Event Metric (Sự kiện)', value: 'events' },
          { name: 'Knowledge Base (Cơ sở tri thức RAG)', value: 'knowledge' },
        ],
        required: true,
      },
      {
        name: 'action',
        displayName: 'Action',
        type: 'options' as const,
        default: 'sync',
        options: [
          { name: 'Đồng bộ dữ liệu (Sync / Upsert)', value: 'sync' },
          { name: 'Truy vấn (Query / Search)', value: 'query' },
          { name: 'Kích hoạt thông báo (Trigger Alert)', value: 'alert' },
        ],
        required: true,
      },
      {
        name: 'payload',
        displayName: 'Payload Data (JSON)',
        type: 'json' as const,
        default: '{\n  "source": "VinceAuto",\n  "data": {{ JSON.stringify($json) }}\n}',
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
      let evaluatedPayload: any = {};

      if (node.parameters.payload) {
        try {
          const raw = typeof node.parameters.payload === 'string'
            ? ExpressionEvaluator.evaluate(node.parameters.payload, item, context, i)
            : node.parameters.payload;
          evaluatedPayload = typeof raw === 'string' ? JSON.parse(raw) : raw;
        } catch {
          evaluatedPayload = { raw: node.parameters.payload };
        }
      }

      context.log(`[VinceZone] Synchronizing ${node.parameters.resource} with action ${node.parameters.action}`);

      results.push({
        json: {
          ...item.json,
          vinceZone: {
            connected: true,
            resource: node.parameters.resource,
            action: node.parameters.action,
            syncId: `vz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            syncedAt: new Date().toISOString(),
            payloadReceived: evaluatedPayload,
          },
        },
      });
    }

    return results;
  }
}
