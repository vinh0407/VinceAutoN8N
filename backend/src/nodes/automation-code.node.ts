import { INodeType, IExecutionContext, INodeExecutionData, INode } from '../engine/types.js';

export class AutomationCodeNode implements INodeType {
  description = {
    name: 'automation.code',
    displayName: 'Code (JavaScript)',
    icon: 'Code2',
    category: 'automation' as const,
    description: 'Viết code JavaScript tự do để biến đổi hoặc tổng hợp dữ liệu',
    version: 1,
    properties: [
      {
        name: 'jsCode',
        displayName: 'JavaScript Code',
        type: 'code' as const,
        default: `// items chứa mảng các input items: [{ json: { ... } }]
// Trả về mảng items mới
return items.map((item, index) => {
  return {
    json: {
      ...item.json,
      vinceTimestamp: new Date().toISOString(),
      itemIndex: index,
      status: 'processed'
    }
  };
});`,
        required: true,
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
    const code = node.parameters.jsCode || 'return items;';
    const items = inputData.map((d) => ({ ...d }));

    const sandbox = {
      items,
      $variables: context.variables,
      $credentials: context.credentials,
      Math,
      Date,
      JSON,
      encodeURIComponent,
      decodeURIComponent,
      parseInt,
      parseFloat,
      console: {
        log: (...args: any[]) => context.log(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ')),
      },
    };

    try {
      const fn = new Function(...Object.keys(sandbox), `"use strict"; ${code}`);
      const result = await fn(...Object.values(sandbox));

      if (Array.isArray(result)) {
        return result.map((r) => (r && typeof r === 'object' && 'json' in r ? r : { json: r }));
      }
      return [{ json: typeof result === 'object' && result !== null ? result : { result } }];
    } catch (err: any) {
      throw new Error(`Lỗi thực thi JavaScript Code: ${err.message}`);
    }
  }
}
