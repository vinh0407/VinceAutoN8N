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

export interface INodeDescription {
  name: string;
  displayName: string;
  icon: string;
  category: 'trigger' | 'automation' | 'ai' | 'vince' | 'utility';
  description: string;
  version: number;
  properties: INodeProperty[];
  inputs: string[];
  outputs: string[];
}

export interface INodeData {
  id: string;
  name: string;
  type: string;
  parameters: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'error';
  executionDuration?: number;
  itemsCount?: number;
  pinnedData?: any;
  disabled?: boolean;
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
  nodes: any[];
  connections: any[];
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

export interface IWorkflow {
  id: string;
  name: string;
  projectId?: string;
  nodes: any[];
  connections: any[];
  active?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IProject {
  id: string;
  name: string;
  description?: string;
  color?: string;
  workflowsCount?: number;
  workflows?: IWorkflow[];
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

export interface IExecutionSummary {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'success' | 'error';
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  results: Record<string, any>;
  error?: string;
  selfHealing?: {
    nodeId: string;
    nodeName: string;
    issueDiagnosis: string;
    suggestedParameters: Record<string, any>;
    explanation: string;
    autoFixAvailable: boolean;
  };
}
