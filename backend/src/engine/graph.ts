import { IWorkflow, INode, IConnection } from './types.js';

export interface IGraphNodeInfo {
  node: INode;
  inDegree: number;
  parents: string[];
  children: string[];
}

export class WorkflowGraph {
  private workflow: IWorkflow;
  private nodeMap = new Map<string, INode>();
  private adjacencyList = new Map<string, string[]>(); // parentId -> childIds[]
  private reverseAdjacencyList = new Map<string, string[]>(); // childId -> parentIds[]

  constructor(workflow: IWorkflow) {
    this.workflow = workflow;
    for (const node of workflow.nodes) {
      this.nodeMap.set(node.id, node);
      this.adjacencyList.set(node.id, []);
      this.reverseAdjacencyList.set(node.id, []);
    }

    for (const conn of workflow.connections) {
      if (this.nodeMap.has(conn.source) && this.nodeMap.has(conn.target)) {
        this.adjacencyList.get(conn.source)?.push(conn.target);
        this.reverseAdjacencyList.get(conn.target)?.push(conn.source);
      }
    }
  }

  /**
   * Find entry / trigger nodes (nodes that have 0 incoming connections or are triggers)
   */
  getStartNodes(): INode[] {
    const startNodes: INode[] = [];
    for (const node of this.workflow.nodes) {
      const incoming = this.reverseAdjacencyList.get(node.id) || [];
      if (incoming.length === 0 || node.type.startsWith('trigger.')) {
        startNodes.push(node);
      }
    }
    return startNodes.length > 0 ? startNodes : (this.workflow.nodes.slice(0, 1) as INode[]);
  }

  /**
   * Returns topological execution order using Kahn's algorithm
   */
  getExecutionOrder(startNodeId?: string): INode[] {
    const inDegree = new Map<string, number>();
    for (const node of this.workflow.nodes) {
      inDegree.set(node.id, (this.reverseAdjacencyList.get(node.id) || []).length);
    }

    const queue: string[] = [];

    if (startNodeId) {
      queue.push(startNodeId);
    } else {
      for (const [id, deg] of inDegree.entries()) {
        if (deg === 0) {
          queue.push(id);
        }
      }
    }

    const ordered: INode[] = [];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const node = this.nodeMap.get(currentId);
      if (node) ordered.push(node);

      const children = this.adjacencyList.get(currentId) || [];
      for (const childId of children) {
        const currentDeg = inDegree.get(childId) || 1;
        inDegree.set(childId, currentDeg - 1);
        if (inDegree.get(childId)! <= 0 && !visited.has(childId)) {
          queue.push(childId);
        }
      }
    }

    // In case of disconnected components, add remaining unvisited nodes
    for (const node of this.workflow.nodes) {
      if (!visited.has(node.id)) {
        ordered.push(node);
      }
    }

    return ordered;
  }

  getParentNodes(nodeId: string): INode[] {
    const parentIds = this.reverseAdjacencyList.get(nodeId) || [];
    return parentIds.map((id) => this.nodeMap.get(id)!).filter(Boolean);
  }

  getChildNodes(nodeId: string): INode[] {
    const childIds = this.adjacencyList.get(nodeId) || [];
    return childIds.map((id) => this.nodeMap.get(id)!).filter(Boolean);
  }
}
