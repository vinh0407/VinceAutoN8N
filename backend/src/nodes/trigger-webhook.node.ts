import { INodeType, IExecutionContext, INodeExecutionData, INode } from '../engine/types.js';

export class TriggerWebhookNode implements INodeType {
  description = {
    name: 'trigger.webhook',
    displayName: 'Webhook Trigger',
    icon: 'Webhook',
    category: 'trigger' as const,
    description: 'Lắng nghe sự kiện HTTP Webhook từ ứng dụng bên ngoài',
    version: 1,
    properties: [
      {
        name: 'path',
        displayName: 'Webhook Path',
        type: 'string' as const,
        default: 'vince-webhook',
        placeholder: 'webhook-endpoint-name',
        required: true,
      },
      {
        name: 'httpMethod',
        displayName: 'HTTP Method',
        type: 'options' as const,
        default: 'POST',
        options: [
          { name: 'POST', value: 'POST' },
          { name: 'GET', value: 'GET' },
          { name: 'PUT', value: 'PUT' },
        ],
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
    // If webhook data was passed in variables, use it
    const payload = context.variables?.webhookPayload || {};
    return [
      {
        json: {
          timestamp: new Date().toISOString(),
          triggeredBy: 'webhook',
          path: node.parameters.path || 'vince-webhook',
          headers: payload.headers || {},
          query: payload.query || {},
          body: payload.body || {},
        },
      },
    ];
  }
}
