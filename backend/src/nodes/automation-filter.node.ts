import { INodeType, IExecutionContext, INodeExecutionData, INode } from '../engine/types.js';
import { ExpressionEvaluator } from '../engine/expression.js';

export class AutomationFilterNode implements INodeType {
  description = {
    name: 'automation.filter',
    displayName: 'Filter & Condition (IF)',
    icon: 'GitFork',
    category: 'automation' as const,
    description: 'Lọc dữ liệu dựa trên điều kiện logic JavaScript',
    version: 1,
    properties: [
      {
        name: 'condition',
        displayName: 'Condition Expression',
        type: 'string' as const,
        default: '{{ $json.status === "active" || $json.price > 0 }}',
        placeholder: '{{ $json.field !== null }}',
        description: 'Biểu thức trả về true hoặc false',
        required: true,
      },
    ],
    inputs: ['main'],
    outputs: ['true', 'false'],
  };

  async execute(
    context: IExecutionContext,
    inputData: INodeExecutionData[],
    node: INode
  ): Promise<INodeExecutionData[]> {
    const passedItems: INodeExecutionData[] = [];

    for (let i = 0; i < inputData.length; i++) {
      const item = inputData[i];
      const evaluated = ExpressionEvaluator.evaluate(node.parameters.condition, item, context, i);
      const isPassed = Boolean(evaluated);

      if (isPassed) {
        passedItems.push(item);
      }
    }

    return passedItems;
  }
}
