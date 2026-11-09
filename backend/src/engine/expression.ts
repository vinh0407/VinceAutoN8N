import { IExecutionContext, INodeExecutionData } from './types.js';

export class ExpressionEvaluator {
  /**
   * Resolves expressions within a value (string, object, array).
   * Expressions are in the format {{ $json.property }} or {{ $('NodeName').item.json.property }}
   */
  static evaluate(
    value: any,
    currentData: INodeExecutionData | undefined,
    context: IExecutionContext,
    itemIndex: number = 0
  ): any {
    if (typeof value === 'string') {
      return this.evaluateString(value, currentData, context, itemIndex);
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.evaluate(item, currentData, context, itemIndex));
    }

    if (value !== null && typeof value === 'object') {
      const result: Record<string, any> = {};
      for (const [k, v] of Object.entries(value)) {
        result[k] = this.evaluate(v, currentData, context, itemIndex);
      }
      return result;
    }

    return value;
  }

  private static evaluateString(
    str: string,
    currentData: INodeExecutionData | undefined,
    context: IExecutionContext,
    itemIndex: number
  ): any {
    const expressionPattern = /\{\{([\s\S]+?)\}\}/g;
    if (!expressionPattern.test(str)) {
      return str;
    }

    // Exact single expression match like "{{ $json.foo }}" -> return the exact evaluated type (not stringified)
    const exactMatch = str.trim().match(/^\{\{([\s\S]+?)\}\}$/);
    if (exactMatch) {
      try {
        return this.executeExpression(exactMatch[1], currentData, context, itemIndex);
      } catch {
        return undefined;
      }
    }

    // Mixed string like "Hello {{ $json.name }}, status is {{ $json.status }}"
    return str.replace(expressionPattern, (_, code) => {
      try {
        const result = this.executeExpression(code, currentData, context, itemIndex);
        if (result === undefined || result === null) return '';
        if (typeof result === 'object') return JSON.stringify(result);
        return String(result);
      } catch (err: any) {
        return `[Expression Error: ${err.message}]`;
      }
    });
  }

  private static executeExpression(
    code: string,
    currentData: INodeExecutionData | undefined,
    context: IExecutionContext,
    itemIndex: number
  ): any {
    const $json = currentData?.json || {};
    const $binary = currentData?.binary || {};
    const $itemIndex = itemIndex;
    const $vars = context.variables || {};

    // Helper $('NodeName') to retrieve preceding node's output data (n8n style)
    const $ = (nodeName: string) => {
      const targetNode = context.workflow.nodes.find(
        (n) => n.name.toLowerCase() === nodeName.toLowerCase() || n.id === nodeName
      );
      if (!targetNode) {
        throw new Error(`Node "${nodeName}" not found in workflow`);
      }
      const output = context.nodeOutputs.get(targetNode.id) || [];
      const item = output[itemIndex] || output[0] || { json: {}, binary: {} };
      return {
        all: () => output,
        first: () => output[0] || { json: {}, binary: {} },
        last: () => output[output.length - 1] || { json: {}, binary: {} },
        item,
      };
    };

    // Activepieces style: "steps" dictionary mapping step name/id to its JSON output
    const steps: Record<string, any> = {};
    for (const node of context.workflow.nodes) {
      const output = context.nodeOutputs.get(node.id) || [];
      const item = output[itemIndex] || output[0];
      const payload = item?.json || {};
      steps[node.id] = payload;
      // also allow referencing by sanitized node name (e.g. steps.scraper.items)
      const cleanName = node.name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      steps[cleanName] = payload;
    }

    // Safe execution sandbox
    const sandbox = {
      $json,
      $binary,
      $,
      steps,
      $itemIndex,
      $vars,
      $workflow: {
        id: context.workflow.id,
        name: context.workflow.name,
      },
      $credentials: context.credentials,
      Math,
      Date,
      JSON,
      encodeURIComponent,
      decodeURIComponent,
      parseInt,
      parseFloat,
    };

    try {
      const fn = new Function(...Object.keys(sandbox), `"use strict"; return (${code});`);
      return fn(...Object.values(sandbox));
    } catch (e: any) {
      throw new Error(`Failed to evaluate expression "{{${code}}}": ${e.message}`);
    }
  }
}
