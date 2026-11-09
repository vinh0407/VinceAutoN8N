import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  IWorkflow,
  IExecutionSummary,
  IProject,
  ITaskSchedule,
  IWorkflowVersion,
  IDataTable,
  IDataTableRow,
} from '../engine/types.js';

export class WorkflowStore {
  private dataDir: string;
  private workflowsFile: string;
  private credentialsFile: string;
  private historyFile: string;
  private projectsFile: string;
  private tasksFile: string;
  private versionsFile: string;
  private tablesFile: string;

  private workflows: Map<string, IWorkflow> = new Map();
  private projects: Map<string, IProject> = new Map();
  private tasks: Map<string, ITaskSchedule> = new Map();
  private versions: Map<string, IWorkflowVersion[]> = new Map(); // workflowId -> versions
  private tables: Map<string, IDataTable> = new Map();
  private credentials: Record<string, any> = {};
  private executionHistory: IExecutionSummary[] = [];

  constructor(dataDir?: string) {
    const cwd = process.cwd().replace(/\\/g, '/');
    const rootDataDir = cwd.endsWith('/backend')
      ? path.resolve(process.cwd(), '../data')
      : path.resolve(process.cwd(), 'data');
    this.dataDir = dataDir || process.env.DATA_DIR || rootDataDir;

    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    this.workflowsFile = path.join(this.dataDir, 'workflows.json');
    this.projectsFile = path.join(this.dataDir, 'projects.json');
    this.credentialsFile = path.join(this.dataDir, 'credentials.json');
    this.historyFile = path.join(this.dataDir, 'history.json');
    this.tasksFile = path.join(this.dataDir, 'tasks.json');
    this.versionsFile = path.join(this.dataDir, 'versions.json');
    this.tablesFile = path.join(this.dataDir, 'tables.json');

    this.load();
  }

  private load() {
    // 1. Projects - Clean start (No sample projects auto-injected)
    if (fs.existsSync(this.projectsFile)) {
      try {
        const raw = fs.readFileSync(this.projectsFile, 'utf-8');
        const list: IProject[] = JSON.parse(raw);
        for (const p of list) this.projects.set(p.id, p);
      } catch {
        this.projects.clear();
      }
    } else {
      this.projects.clear();
      this.saveProjects();
    }

    // 2. Workflows - Clean start (No sample workflows auto-injected)
    if (fs.existsSync(this.workflowsFile)) {
      try {
        const raw = fs.readFileSync(this.workflowsFile, 'utf-8');
        const list: IWorkflow[] = JSON.parse(raw);
        for (const w of list) {
          this.workflows.set(w.id, w);
        }
      } catch {
        this.workflows.clear();
      }
    } else {
      this.workflows.clear();
      this.saveWorkflows();
    }

    // 3. Tasks - Clean start
    if (fs.existsSync(this.tasksFile)) {
      try {
        const raw = fs.readFileSync(this.tasksFile, 'utf-8');
        const list: ITaskSchedule[] = JSON.parse(raw);
        for (const t of list) this.tasks.set(t.id, t);
      } catch {
        this.tasks.clear();
      }
    } else {
      this.tasks.clear();
      this.saveTasks();
    }

    // 4. Versions
    if (fs.existsSync(this.versionsFile)) {
      try {
        const raw = fs.readFileSync(this.versionsFile, 'utf-8');
        const map: Record<string, IWorkflowVersion[]> = JSON.parse(raw);
        for (const [wfId, vers] of Object.entries(map)) {
          this.versions.set(wfId, vers);
        }
      } catch {
        this.versions.clear();
      }
    }

    // 5. Data Tables
    if (fs.existsSync(this.tablesFile)) {
      try {
        const raw = fs.readFileSync(this.tablesFile, 'utf-8');
        const list: IDataTable[] = JSON.parse(raw);
        for (const t of list) this.tables.set(t.id, t);
      } catch {
        this.initDefaultTables();
      }
    } else {
      this.initDefaultTables();
    }

    if (fs.existsSync(this.credentialsFile)) {
      try {
        this.credentials = JSON.parse(fs.readFileSync(this.credentialsFile, 'utf-8'));
      } catch {
        this.credentials = {};
      }
    }

    // Ensure default Opencode2 (crouton-alpha-free) provider structure
    if (!this.credentials.OPENCODE2_PROVIDER_NAME) {
      this.credentials.OPENCODE2_PROVIDER_NAME = 'Opencode2';
      this.credentials.OPENCODE2_PROVIDER_TYPE = 'openai';
      this.credentials.OPENCODE2_BASE_URL = process.env.OPENCODE2_BASE_URL || 'https://opencode.ai/zen/v1';
      this.credentials.OPENCODE2_API_KEY = process.env.OPENCODE2_API_KEY || '';
      this.credentials.OPENCODE2_MODEL = 'crouton-alpha-free';
      this.credentials.OPENCODE2_STATUS = this.credentials.OPENCODE2_API_KEY ? 'Kích hoạt' : 'Chưa nhập API Key';
      this.credentials.OPENCODE2_CREATED_AT = new Date().toISOString();
      if (!this.credentials.OPENAI_API_KEY) {
        this.credentials.OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENCODE2_API_KEY || '';
        this.credentials.OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://opencode.ai/zen/v1';
        this.credentials.OPENAI_MODEL = 'crouton-alpha-free';
      }
      try {
        fs.writeFileSync(this.credentialsFile, JSON.stringify(this.credentials, null, 2));
      } catch {
        // ignore
      }
    }

    if (fs.existsSync(this.historyFile)) {
      try {
        this.executionHistory = JSON.parse(fs.readFileSync(this.historyFile, 'utf-8'));
      } catch {
        this.executionHistory = [];
      }
    }
  }

  private saveProjects() {
    fs.writeFileSync(
      this.projectsFile,
      JSON.stringify(Array.from(this.projects.values()), null, 2)
    );
  }

  private saveWorkflows() {
    fs.writeFileSync(
      this.workflowsFile,
      JSON.stringify(Array.from(this.workflows.values()), null, 2)
    );
  }

  private initDefaultProjects() {
    const defaultList: IProject[] = [
      {
        id: 'proj_ai',
        name: 'Dự án AI Agent & Tự Động Hóa',
        description: 'Tập hợp các bản vẽ AI Agent, Multi-Agent Supervisor và RAG',
        color: '#8b5cf6',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'proj_cskh',
        name: 'Dự án Chăm Sóc Khách Hàng Zalo OA',
        description: 'Bản vẽ tiếp nhận tin nhắn, gửi ZNS và tư vấn tự động 24/7',
        color: '#0ea5e9',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'proj_ecommerce',
        name: 'Dự án E-Commerce & Thanh Toán',
        description: 'Bản vẽ xử lý đơn hàng Shopee, TikTok Shop, MoMo và VNPAY',
        color: '#10b981',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const p of defaultList) this.projects.set(p.id, p);
    this.saveProjects();
  }

  getProjects(): IProject[] {
    return Array.from(this.projects.values());
  }

  getProject(id: string): IProject | undefined {
    return this.projects.get(id);
  }

  saveProject(project: Partial<IProject>): IProject {
    const id = project.id || `proj_${Date.now()}`;
    const now = new Date().toISOString();
    const existing = this.projects.get(id);

    const fullProject: IProject = {
      id,
      name: project.name || existing?.name || 'Dự án mới',
      description: project.description !== undefined ? project.description : (existing?.description || ''),
      color: project.color || existing?.color || '#8b5cf6',
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    this.projects.set(id, fullProject);
    this.saveProjects();
    return fullProject;
  }

  deleteProject(id: string): boolean {
    const deleted = this.projects.delete(id);
    if (deleted) {
      const wfs = this.getWorkflowsByProject(id);
      for (const w of wfs) {
        this.workflows.delete(w.id);
      }
      this.saveWorkflows();
      this.saveProjects();
    }
    return deleted;
  }

  deleteSampleProjects(): { deletedCount: number } {
    const count = this.projects.size;
    this.projects.clear();
    this.workflows.clear();
    this.saveProjects();
    this.saveWorkflows();
    return { deletedCount: count };
  }

  clearAllProjectsAndWorkflows(): { deletedCount: number } {
    return this.deleteSampleProjects();
  }

  getWorkflowsByProject(projectId: string): IWorkflow[] {
    return this.getWorkflows().filter((w) => w.projectId === projectId);
  }

  private saveCredentials() {
    fs.writeFileSync(this.credentialsFile, JSON.stringify(this.credentials, null, 2));
  }

  private saveHistory() {
    fs.writeFileSync(this.historyFile, JSON.stringify(this.executionHistory.slice(-100), null, 2));
  }

  getWorkflows(): IWorkflow[] {
    return Array.from(this.workflows.values());
  }

  getWorkflow(id: string): IWorkflow | undefined {
    return this.workflows.get(id);
  }

  saveWorkflow(workflow: IWorkflow, changeSummary?: string): IWorkflow {
    if (!workflow.id) workflow.id = uuidv4();
    workflow.updatedAt = new Date().toISOString();
    if (!workflow.createdAt) workflow.createdAt = workflow.updatedAt;

    this.workflows.set(workflow.id, workflow);
    this.saveWorkflows();

    // Auto-save a version in history
    this.createWorkflowVersion(workflow, changeSummary || 'Cập nhật bản vẽ tự động');

    return workflow;
  }

  deleteWorkflow(id: string): boolean {
    const deleted = this.workflows.delete(id);
    if (deleted) this.saveWorkflows();
    return deleted;
  }

  // ==========================================
  // WORKFLOW VERSION HISTORY & ROLLBACK
  // ==========================================
  private saveVersions() {
    const obj: Record<string, IWorkflowVersion[]> = {};
    for (const [wfId, list] of this.versions.entries()) {
      obj[wfId] = list;
    }
    fs.writeFileSync(this.versionsFile, JSON.stringify(obj, null, 2));
  }

  getWorkflowVersions(workflowId: string): IWorkflowVersion[] {
    return this.versions.get(workflowId) || [];
  }

  createWorkflowVersion(workflow: IWorkflow, changeSummary: string): IWorkflowVersion {
    const list = this.versions.get(workflow.id) || [];
    const nextVerNumber = list.length > 0 ? Math.max(...list.map((v) => v.versionNumber)) + 1 : 1;

    const versionItem: IWorkflowVersion = {
      id: `ver_${Date.now()}_${nextVerNumber}`,
      workflowId: workflow.id,
      versionNumber: nextVerNumber,
      name: workflow.name,
      nodes: JSON.parse(JSON.stringify(workflow.nodes || [])),
      connections: JSON.parse(JSON.stringify(workflow.connections || [])),
      savedAt: new Date().toISOString(),
      changeSummary,
    };

    list.unshift(versionItem);
    if (list.length > 30) list.pop(); // Keep last 30 versions
    this.versions.set(workflow.id, list);
    this.saveVersions();
    return versionItem;
  }

  rollbackWorkflowVersion(workflowId: string, versionId: string): IWorkflow | undefined {
    const list = this.versions.get(workflowId);
    if (!list) return undefined;
    const targetVer = list.find((v) => v.id === versionId);
    if (!targetVer) return undefined;

    const wf = this.workflows.get(workflowId);
    if (!wf) return undefined;

    wf.name = targetVer.name;
    wf.nodes = JSON.parse(JSON.stringify(targetVer.nodes));
    wf.connections = JSON.parse(JSON.stringify(targetVer.connections));
    wf.updatedAt = new Date().toISOString();

    this.workflows.set(workflowId, wf);
    this.saveWorkflows();
    this.createWorkflowVersion(wf, `Khôi phục về phiên bản v${targetVer.versionNumber} (${targetVer.savedAt})`);
    return wf;
  }

  // ==========================================
  // TASK SCHEDULER & RECURRING DAILY TASKS
  // ==========================================
  private saveTasks() {
    fs.writeFileSync(this.tasksFile, JSON.stringify(Array.from(this.tasks.values()), null, 2));
  }

  getTasks(): ITaskSchedule[] {
    return Array.from(this.tasks.values());
  }

  getTask(id: string): ITaskSchedule | undefined {
    return this.tasks.get(id);
  }

  saveTask(task: Partial<ITaskSchedule>): ITaskSchedule {
    const id = task.id || `task_${Date.now()}`;
    const now = new Date().toISOString();
    const existing = this.tasks.get(id);

    // Calculate cron expression if dailyTime given
    let cronExpression = task.cronExpression || existing?.cronExpression;
    if (task.frequency === 'daily' && task.dailyTime) {
      const [h, m] = task.dailyTime.split(':').map((s) => parseInt(s, 10));
      cronExpression = `${isNaN(m) ? 0 : m} ${isNaN(h) ? 8 : h} * * *`;
    } else if (task.frequency === 'hourly') {
      cronExpression = '0 * * * *';
    }

    const fullTask: ITaskSchedule = {
      id,
      title: task.title || existing?.title || 'Tác vụ tự động hàng ngày',
      description: task.description !== undefined ? task.description : existing?.description,
      workflowId: task.workflowId || existing?.workflowId,
      workflowName: task.workflowName || existing?.workflowName,
      prompt: task.prompt || existing?.prompt,
      frequency: task.frequency || existing?.frequency || 'daily',
      dailyTime: task.dailyTime || existing?.dailyTime || '08:00',
      cronExpression: cronExpression || '0 8 * * *',
      timezone: task.timezone || existing?.timezone || 'Asia/Ho_Chi_Minh',
      enabled: task.enabled !== undefined ? task.enabled : (existing?.enabled ?? true),
      lastRunAt: task.lastRunAt || existing?.lastRunAt,
      nextRunAt: task.nextRunAt || existing?.nextRunAt,
      lastStatus: task.lastStatus || existing?.lastStatus || 'idle',
      runCount: task.runCount !== undefined ? task.runCount : (existing?.runCount || 0),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    this.tasks.set(id, fullTask);
    this.saveTasks();
    return fullTask;
  }

  deleteTask(id: string): boolean {
    const deleted = this.tasks.delete(id);
    if (deleted) this.saveTasks();
    return deleted;
  }

  private initDefaultTasks() {
    const defaultTasks: ITaskSchedule[] = [
      {
        id: 'task_daily_social_01',
        title: 'Mỗi ngày lúc 08:30: AI Agent đăng bài lên TikTok, Threads, Instagram & Shorts',
        description: 'Tự động quét tin tức xu hướng, dùng AI Opencode2 viết kịch bản & đăng chéo lên 4 nền tảng mạng xã hội.',
        frequency: 'daily',
        dailyTime: '08:30',
        cronExpression: '30 8 * * *',
        timezone: 'Asia/Ho_Chi_Minh',
        enabled: true,
        runCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task_daily_payment_02',
        title: 'Mỗi ngày lúc 12:00: Đối soát thanh toán VietQR / MoMo & xuất báo cáo Sheets',
        description: 'Kiểm tra toàn bộ IPN Webhook thanh toán trong buổi sáng, đối chiếu đơn hàng và gửi thông báo biến động số dư Telegram.',
        frequency: 'daily',
        dailyTime: '12:00',
        cronExpression: '0 12 * * *',
        timezone: 'Asia/Ho_Chi_Minh',
        enabled: true,
        runCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task_daily_ecom_03',
        title: 'Mỗi ngày lúc 17:30: Đồng bộ đơn hàng Shopee / TikTok Shop & gửi Zalo ZNS',
        description: 'Tổng kết doanh số cuối ngày từ các sàn TMĐT, lọc đơn thành công và tự động gửi mã vận đơn qua Zalo OA.',
        frequency: 'daily',
        dailyTime: '17:30',
        cronExpression: '30 17 * * *',
        timezone: 'Asia/Ho_Chi_Minh',
        enabled: true,
        runCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const t of defaultTasks) this.tasks.set(t.id, t);
    this.saveTasks();
  }

  // ==========================================
  // BUILT-IN DATA STORE / MINI TABLES
  // ==========================================
  private saveTables() {
    fs.writeFileSync(this.tablesFile, JSON.stringify(Array.from(this.tables.values()), null, 2));
  }

  getTables(): IDataTable[] {
    return Array.from(this.tables.values());
  }

  getTable(id: string): IDataTable | undefined {
    return this.tables.get(id);
  }

  saveTable(table: Partial<IDataTable>): IDataTable {
    const id = table.id || `table_${Date.now()}`;
    const now = new Date().toISOString();
    const existing = this.tables.get(id);

    const fullTable: IDataTable = {
      id,
      name: table.name || existing?.name || 'Bảng dữ liệu nội bộ',
      description: table.description !== undefined ? table.description : existing?.description,
      columns: table.columns || existing?.columns || [
        { key: 'key', name: 'Khóa / Mã', type: 'string' },
        { key: 'value', name: 'Giá trị', type: 'string' },
        { key: 'note', name: 'Ghi chú', type: 'string' },
      ],
      rows: table.rows || existing?.rows || [],
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    this.tables.set(id, fullTable);
    this.saveTables();
    return fullTable;
  }

  deleteTable(id: string): boolean {
    const deleted = this.tables.delete(id);
    if (deleted) this.saveTables();
    return deleted;
  }

  insertTableRow(tableId: string, rowData: Record<string, any>): IDataTableRow | undefined {
    const table = this.tables.get(tableId);
    if (!table) return undefined;
    const now = new Date().toISOString();
    const row: IDataTableRow = {
      id: `row_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...rowData,
      _createdAt: now,
      _updatedAt: now,
    };
    table.rows.unshift(row);
    table.updatedAt = now;
    this.saveTables();
    return row;
  }

  deleteTableRow(tableId: string, rowId: string): boolean {
    const table = this.tables.get(tableId);
    if (!table) return false;
    const initialLen = table.rows.length;
    table.rows = table.rows.filter((r) => r.id !== rowId);
    if (table.rows.length !== initialLen) {
      table.updatedAt = new Date().toISOString();
      this.saveTables();
      return true;
    }
    return false;
  }

  private initDefaultTables() {
    const defaultTable: IDataTable = {
      id: 'table_anti_dedupe',
      name: 'Kho Dữ Liệu Nội Bộ & Chống Trùng Lặp',
      description: 'Lưu trữ các ID đơn hàng, ID tin tức cào và trạng thái xử lý nội bộ VinceAuto.',
      columns: [
        { key: 'itemKey', name: 'Item Key / ID', type: 'string' },
        { key: 'sourceApp', name: 'Nguồn (Shopee/TikTok/Drive)', type: 'string' },
        { key: 'status', name: 'Trạng thái', type: 'string' },
        { key: 'processedAt', name: 'Thời gian xử lý', type: 'date' },
      ],
      rows: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tables.set(defaultTable.id, defaultTable);
    this.saveTables();
  }

  getCredentials(): Record<string, any> {
    return { ...this.credentials };
  }

  setCredentials(data: Record<string, any>) {
    this.credentials = { ...this.credentials, ...data };
    this.saveCredentials();
  }

  addExecution(summary: IExecutionSummary) {
    this.executionHistory.unshift(summary);
    if (this.executionHistory.length > 100) {
      this.executionHistory = this.executionHistory.slice(0, 100);
    }
    this.saveHistory();
  }

  getHistory(): IExecutionSummary[] {
    return this.executionHistory;
  }

  private initDefaultWorkflows() {
    const sample1: IWorkflow = {
      id: 'vince-sample-ai-pipeline',
      name: 'VinceAuto Smart Market Intelligence & Telegram Alert',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nodes: [
        {
          id: 'node_1',
          name: 'Lên Lịch Hàng Ngày (8:00 AM)',
          type: 'trigger.cron',
          position: [80, 240],
          parameters: { cronExpression: '0 8 * * *', timezone: 'Asia/Ho_Chi_Minh' },
        },
        {
          id: 'node_2',
          name: 'Cào Tin Hacker News',
          type: 'vince.scraper',
          position: [380, 240],
          parameters: {
            url: 'https://news.ycombinator.com',
            mode: 'selector',
            selector: '.titleline > a',
          },
        },
        {
          id: 'node_3',
          name: 'VinceAuto AI Model Router',
          type: 'vince.modelRouter',
          position: [680, 240],
          parameters: {
            strategy: 'best_cost',
            prompt: `Phân tích top 5 tin công nghệ đáng chú ý nhất từ danh sách sau và viết tóm tắt súc tích:\n{{ JSON.stringify($json.items?.slice(0, 5)) }}`,
            systemPrompt: 'Bạn là chuyên gia phân tích công nghệ của VinceAuto.',
          },
        },
        {
          id: 'node_4',
          name: 'Báo Cáo Telegram Bot',
          type: 'vince.telegram',
          position: [980, 240],
          parameters: {
            botToken: '',
            chatId: '@ungdothevinh',
            message: '🚀 [VinceAuto Daily Tech Brief - Ưng Đỗ Thế Vinh]\n{{ $json.aiResponse }}',
            parseMode: 'HTML',
          },
        },
        {
          id: 'node_5',
          name: 'Đồng Bộ VinceZone',
          type: 'vince.zone',
          position: [1280, 240],
          parameters: {
            resource: 'knowledge',
            action: 'sync',
            payload: '{\n  "source": "HackerNews",\n  "summary": {{ JSON.stringify($json.aiResponse) }}\n}',
          },
        },
      ],
      connections: [
        { source: 'node_1', target: 'node_2' },
        { source: 'node_2', target: 'node_3' },
        { source: 'node_3', target: 'node_4' },
        { source: 'node_4', target: 'node_5' },
      ],
    };

    const sample2: IWorkflow = {
      id: 'vince-sample-multi-agent',
      name: 'VinceAgent Multi-Agent Decision Engine',
      active: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nodes: [
        {
          id: 'agent_start',
          name: 'Kích Hoạt Thủ Công',
          type: 'trigger.manual',
          position: [80, 240],
          parameters: {},
        },
        {
          id: 'agent_planner',
          name: 'VinceAgent Planner',
          type: 'vince.agentManager',
          position: [380, 160],
          parameters: {
            agentRole: 'planner',
            taskGoal: 'Lập chiến lược triển khai nền tảng AI Agent tự động hóa cho doanh nghiệp',
          },
        },
        {
          id: 'agent_critic',
          name: 'VinceAgent Critic',
          type: 'vince.agentManager',
          position: [700, 160],
          parameters: {
            agentRole: 'critic',
            taskGoal: 'Đánh giá rủi ro bảo mật và hiệu năng từ kế hoạch của Planner: {{ $json.agentOutput }}',
          },
        },
      ],
      connections: [
        { source: 'agent_start', target: 'agent_planner' },
        { source: 'agent_planner', target: 'agent_critic' },
      ],
    };

    this.workflows.set(sample1.id, sample1);
    this.workflows.set(sample2.id, sample2);
    this.saveWorkflows();
  }
}

export const globalWorkflowStore = new WorkflowStore();
