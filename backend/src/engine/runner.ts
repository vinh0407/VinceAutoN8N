import { v4 as uuidv4 } from 'uuid';
import {
  IWorkflow,
  INode,
  INodeExecutionData,
  IExecutionContext,
  INodeExecutionResult,
  IExecutionSummary,
} from './types.js';
import { WorkflowGraph } from './graph.js';
import { globalNodeRegistry } from '../nodes/registry.js';
import { SelfHealingEngine, ISelfHealingSuggestion } from '../ai/self-healing.js';

export type ExecutionProgressCallback = (event: {
  type: 'node_start' | 'node_finish' | 'node_error' | 'workflow_finish' | 'log';
  runId: string;
  nodeId?: string;
  data?: any;
}) => void;

export class WorkflowRunner {
  static async execute(
    workflow: IWorkflow,
    options?: {
      runId?: string;
      executionMode?: 'manual' | 'trigger' | 'cron';
      initialData?: INodeExecutionData[];
      startNodeId?: string;
      credentials?: Record<string, any>;
      onProgress?: ExecutionProgressCallback;
    }
  ): Promise<IExecutionSummary & { selfHealing?: ISelfHealingSuggestion }> {
    const runId = options?.runId || uuidv4();
    const startTime = Date.now();
    const graph = new WorkflowGraph(workflow);
    const executionOrder = graph.getExecutionOrder(options?.startNodeId);

    const context: IExecutionContext = {
      workflow,
      runId,
      executionMode: options?.executionMode || 'manual',
      nodeOutputs: new Map<string, INodeExecutionData[]>(),
      variables: {},
      credentials: options?.credentials || {},
      log: (message, level = 'info') => {
        options?.onProgress?.({
          type: 'log',
          runId,
          data: { message, level, timestamp: new Date().toISOString() },
        });
      },
    };

    const results: Record<string, INodeExecutionResult> = {};
    let workflowError: string | undefined = undefined;
    let selfHealingSuggestion: ISelfHealingSuggestion | undefined = undefined;

    // Load any previously saved node outputs (for partial execution / retry from node)
    if ((options as any)?.previousOutputs) {
      for (const [nodeId, data] of Object.entries((options as any).previousOutputs)) {
        context.nodeOutputs.set(nodeId, data as INodeExecutionData[]);
      }
    }

    for (const node of executionOrder) {
      if (node.disabled) {
        results[node.id] = {
          nodeId: node.id,
          nodeName: node.name,
          nodeType: node.type,
          startTime: Date.now(),
          endTime: Date.now(),
          durationMs: 0,
          status: 'skipped',
        };
        continue;
      }

      // 1. DATA PINNING SUPPORT (Exact n8n behavior):
      // If node data is pinned, bypass real execution and use frozen JSON snapshot directly
      const pinnedSnapshot = node.pinnedData || node.parameters?._pinnedData;
      if (pinnedSnapshot) {
        const pinnedOutputData: INodeExecutionData[] = Array.isArray(pinnedSnapshot)
          ? pinnedSnapshot.map((item) => (item?.json ? item : { json: item }))
          : [{ json: pinnedSnapshot }];

        context.nodeOutputs.set(node.id, pinnedOutputData);
        results[node.id] = {
          nodeId: node.id,
          nodeName: `${node.name} [Pinned 📌]`,
          nodeType: node.type,
          startTime: Date.now(),
          endTime: Date.now(),
          durationMs: 1,
          status: 'success',
          data: pinnedOutputData,
        };

        options?.onProgress?.({
          type: 'node_finish',
          runId,
          nodeId: node.id,
          data: {
            durationMs: 1,
            itemsCount: pinnedOutputData.length,
            sample: pinnedOutputData[0]?.json,
            isPinned: true,
          },
        });
        continue;
      }

      const nodeType = globalNodeRegistry.get(node.type);
      if (!nodeType) {
        throw new Error(`Node type "${node.type}" is not registered in VinceAuto.`);
      }

      // Gather input data from parent nodes
      const parents = graph.getParentNodes(node.id);
      let inputData: INodeExecutionData[] = [];

      if (parents.length === 0) {
        inputData = options?.initialData || [{ json: {} }];
      } else {
        // Collect outputs of all parents
        for (const parent of parents) {
          const parentOutput = context.nodeOutputs.get(parent.id);
          if (parentOutput) {
            inputData.push(...parentOutput);
          }
        }
      }

      options?.onProgress?.({
        type: 'node_start',
        runId,
        nodeId: node.id,
        data: { nodeName: node.name, nodeType: node.type },
      });

      const nodeStartTime = Date.now();
      try {
        const outputData = await nodeType.execute(context, inputData, node);
        const nodeDuration = Date.now() - nodeStartTime;

        context.nodeOutputs.set(node.id, outputData);
        results[node.id] = {
          nodeId: node.id,
          nodeName: node.name,
          nodeType: node.type,
          startTime: nodeStartTime,
          endTime: Date.now(),
          durationMs: nodeDuration,
          status: 'success',
          data: outputData,
        };

        options?.onProgress?.({
          type: 'node_finish',
          runId,
          nodeId: node.id,
          data: {
            durationMs: nodeDuration,
            itemsCount: outputData.length,
            sample: outputData[0]?.json,
          },
        });
      } catch (err: any) {
        const nodeDuration = Date.now() - nodeStartTime;
        workflowError = `Node "${node.name}" (${node.type}) failed: ${err.message}`;

        results[node.id] = {
          nodeId: node.id,
          nodeName: node.name,
          nodeType: node.type,
          startTime: nodeStartTime,
          endTime: Date.now(),
          durationMs: nodeDuration,
          status: 'error',
          error: {
            message: err.message,
            stack: err.stack,
          },
        };

        options?.onProgress?.({
          type: 'node_error',
          runId,
          nodeId: node.id,
          data: { error: err.message },
        });

        // Trigger AI Self-Healing analysis asynchronously
        try {
          selfHealingSuggestion = await SelfHealingEngine.diagnoseAndFix(
            node,
            err.message,
            inputData
          );
        } catch {
          // Ignore self-healing failure
        }

        break; // Stop downstream execution on error
      }
    }

    const summary: IExecutionSummary & { selfHealing?: ISelfHealingSuggestion } = {
      id: runId,
      workflowId: workflow.id,
      workflowName: workflow.name,
      status: workflowError ? 'error' : 'success',
      startedAt: new Date(startTime).toISOString(),
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      results,
      error: workflowError,
      selfHealing: selfHealingSuggestion,
    };

    options?.onProgress?.({
      type: 'workflow_finish',
      runId,
      data: summary,
    });

    return summary;
  }
}
