import { INodeType, IExecutionContext, INodeExecutionData, INode, INodeProperty } from '../engine/types.js';
import { ExpressionEvaluator } from '../engine/expression.js';

export interface IPieceProperty {
  name: string;
  displayName: string;
  type: 'string' | 'number' | 'boolean' | 'options' | 'json' | 'code';
  required?: boolean;
  default?: any;
  placeholder?: string;
  description?: string;
  options?: { name: string; value: any }[];
}

export interface IPieceActionContext {
  propsValue: Record<string, any>;
  inputData: INodeExecutionData[];
  credentials: Record<string, any>;
  log: (msg: string) => void;
}

export interface IPieceAction {
  name: string;
  displayName: string;
  description: string;
  props: Record<string, IPieceProperty>;
  run: (context: IPieceActionContext) => Promise<any>;
}

export interface IPieceTrigger {
  name: string;
  displayName: string;
  description: string;
  props: Record<string, IPieceProperty>;
  run: (context: IPieceActionContext) => Promise<any>;
}

export interface IPieceConfig {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  category?: 'ai' | 'automation' | 'vince' | 'trigger';
  actions: IPieceAction[];
  triggers?: IPieceTrigger[];
}

/**
 * Adapter converting Activepieces-style Pieces into n8n-style Node Types
 */
export function createPiece(config: IPieceConfig): INodeType[] {
  const nodeTypes: INodeType[] = [];

  // Convert Actions to NodeTypes
  for (const action of config.actions) {
    const properties: INodeProperty[] = Object.entries(action.props).map(([key, prop]) => ({
      name: key,
      displayName: prop.displayName || key,
      type: prop.type,
      required: prop.required,
      default: prop.default,
      placeholder: prop.placeholder,
      description: prop.description,
      options: prop.options,
    }));

    const nodeType: INodeType = {
      description: {
        name: `piece.${config.name}.${action.name}`,
        displayName: `${config.displayName}: ${action.displayName}`,
        icon: config.icon || 'Layers',
        category: config.category || 'vince',
        description: action.description || config.description,
        version: 1,
        properties,
        inputs: ['main'],
        outputs: ['main'],
      },
      async execute(context: IExecutionContext, inputData: INodeExecutionData[], node: INode): Promise<INodeExecutionData[]> {
        const results: INodeExecutionData[] = [];
        const items = inputData.length > 0 ? inputData : [{ json: {} }];

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          // Evaluate dynamic expressions
          const evaluatedProps: Record<string, any> = {};
          for (const [key, val] of Object.entries(node.parameters || {})) {
            evaluatedProps[key] = ExpressionEvaluator.evaluate(val, item, context, i);
          }

          const actionCtx: IPieceActionContext = {
            propsValue: evaluatedProps,
            inputData: [item],
            credentials: context.credentials,
            log: (msg) => context.log(`[${config.name}:${action.name}] ${msg}`),
          };

          const output = await action.run(actionCtx);
          results.push({
            json: {
              ...(typeof output === 'object' && output !== null ? output : { result: output }),
            },
          });
        }

        return results;
      },
    };

    nodeTypes.push(nodeType);
  }

  return nodeTypes;
}

export function createAction(action: IPieceAction): IPieceAction {
  return action;
}

export function createTrigger(trigger: IPieceTrigger): IPieceTrigger {
  return trigger;
}
