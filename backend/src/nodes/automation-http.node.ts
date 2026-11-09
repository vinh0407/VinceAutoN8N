import axios from 'axios';
import { INodeType, IExecutionContext, INodeExecutionData, INode } from '../engine/types.js';
import { ExpressionEvaluator } from '../engine/expression.js';

export class AutomationHttpNode implements INodeType {
  description = {
    name: 'automation.http',
    displayName: 'HTTP Request',
    icon: 'Globe',
    category: 'automation' as const,
    description: 'Gửi yêu cầu REST API tới bất kỳ dịch vụ web nào',
    version: 1,
    properties: [
      {
        name: 'url',
        displayName: 'URL',
        type: 'string' as const,
        default: 'https://api.github.com/users/octocat',
        placeholder: 'https://api.example.com/data',
        required: true,
      },
      {
        name: 'method',
        displayName: 'Method',
        type: 'options' as const,
        default: 'GET',
        options: [
          { name: 'GET', value: 'GET' },
          { name: 'POST', value: 'POST' },
          { name: 'PUT', value: 'PUT' },
          { name: 'DELETE', value: 'DELETE' },
          { name: 'PATCH', value: 'PATCH' },
        ],
      },
      {
        name: 'headers',
        displayName: 'Headers (JSON)',
        type: 'json' as const,
        default: '{\n  "Accept": "application/json"\n}',
      },
      {
        name: 'body',
        displayName: 'Body (JSON)',
        type: 'json' as const,
        default: '{}',
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
      const evaluatedUrl = ExpressionEvaluator.evaluate(node.parameters.url, item, context, i);
      const method = node.parameters.method || 'GET';

      let headers: any = {};
      if (node.parameters.headers) {
        try {
          const raw = typeof node.parameters.headers === 'string'
            ? ExpressionEvaluator.evaluate(node.parameters.headers, item, context, i)
            : node.parameters.headers;
          headers = typeof raw === 'string' ? JSON.parse(raw) : raw;
        } catch {
          headers = {};
        }
      }

      let data: any = undefined;
      if (['POST', 'PUT', 'PATCH'].includes(method) && node.parameters.body) {
        try {
          const raw = typeof node.parameters.body === 'string'
            ? ExpressionEvaluator.evaluate(node.parameters.body, item, context, i)
            : node.parameters.body;
          data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        } catch {
          data = node.parameters.body;
        }
      }

      const response = await axios({
        url: evaluatedUrl,
        method,
        headers,
        data,
        timeout: 30000,
      });

      results.push({
        json: {
          statusCode: response.status,
          headers: response.headers,
          data: response.data,
        },
      });
    }

    return results;
  }
}
