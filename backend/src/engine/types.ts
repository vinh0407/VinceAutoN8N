export type NodeCategory = 'trigger' | 'automation' | 'ai' | 'vince' | 'utility';

export interface INodeProperty {
  name: string;
  displayName: string;
  type: 'string' | 'number' | 'boolean' | 'options' | 'json' | 'code';
  default?: any;
  placeholder?: string;
  description?: string;
  options?: { name: string; value: any }[];
  required?: boolean;
}

export interface INodeExecutionData {
  json: Record<string, any>;
  binary?: Record<string, any>;
}

export interface INode {
  id: string;
  name: string;
  type: string;
  position: [number, number];
  parameters: Record<string, any>;
  disabled?: boolean;
  pinnedData?: any;
  outputHandles?: { id: string; label: string; color?: string }[];
}

export interface IConnection {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface ITaskSchedule {
  id: string;
  title: string;
  description?: string;
  workflowId?: string;
  workflowName?: string;
  prompt?: string;
  frequency: 'daily' | 'hourly' | 'weekly' | 'custom_cron' | 'once';
  dailyTime?: string; // e.g. "08:30" (Chạy lặp lại mỗi ngày lúc 08:30)
  cronExpression?: string;
  timezone: string;
  enabled: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  lastStatus?: 'idle' | 'running' | 'success' | 'error';
  runCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IWorkflowVersion {
  id: string;
  workflowId: string;
  versionNumber: number;
  name: string;
  nodes: INode[];
  connections: IConnection[];
  savedAt: string;
  changeSummary?: string;
}

export interface IDataTableRow {
  id: string;
  [key: string]: any;
  _createdAt: string;
  _updatedAt: string;
}

export interface IDataTable {
  id: string;
  name: string;
  description?: string;
  columns: { key: string; name: string; type: 'string' | 'number' | 'boolean' | 'date' | 'json' }[];
  rows: IDataTableRow[];
  createdAt: string;
  updatedAt: string;
}

export interface IChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  plan?: any;
}

export interface IChatSession {
  id: string;
  title: string;
  projectId?: string;
  projectName?: string;
  messages: IChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface IProject {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IWorkflow {
  id: string;
  name: string;
  projectId?: string;
  nodes: INode[];
  connections: IConnection[];
  active?: boolean;
  createdAt: string;
  updatedAt: string;
  settings?: Record<string, any>;
}

export interface IExecutionContext {
  workflow: IWorkflow;
  runId: string;
  executionMode: 'manual' | 'trigger' | 'cron';
  nodeOutputs: Map<string, INodeExecutionData[]>;
  variables: Record<string, any>;
  credentials: Record<string, any>;
  log: (message: string, level?: 'info' | 'warn' | 'error') => void;
}

export interface INodeExecutionResult {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  startTime: number;
  endTime: number;
  durationMs: number;
  status: 'success' | 'error' | 'waiting' | 'skipped';
  data?: INodeExecutionData[];
  error?: {
    message: string;
    stack?: string;
    details?: any;
  };
}

export interface IExecutionSummary {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'success' | 'error';
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  results: Record<string, INodeExecutionResult>;
  error?: string;
}

export interface INodeType {
  description: {
    name: string;
    displayName: string;
    icon: string;
    category: NodeCategory;
    description: string;
    version: number;
    properties: INodeProperty[];
    inputs: string[];
    outputs: string[];
  };
  execute(
    this: any,
    context: IExecutionContext,
    inputData: INodeExecutionData[],
    node: INode
  ): Promise<INodeExecutionData[]>;
}
