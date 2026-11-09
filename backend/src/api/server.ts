import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import { globalNodeRegistry } from '../nodes/registry.js';
import { globalWorkflowStore } from '../storage/store.js';
import { WorkflowRunner } from '../engine/runner.js';
import { AIWorkflowBuilder } from '../ai/workflow-builder.js';
import { SelfHealingEngine } from '../ai/self-healing.js';
import { globalCronScheduler } from '../scheduler/cron-manager.js';

export function createServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  app.use(cors());
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoints (for Render, Railway, UptimeRobot monitoring)
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'vinceauto-backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
    });
  });

  app.get('/ping', (req, res) => {
    res.status(200).send('pong');
  });

  // Broadcast WebSocket event
  const broadcast = (data: any) => {
    const msg = JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  };

  wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'connected', message: 'VinceAuto WebSocket connected' }));
  });

  // 1. Available Nodes
  app.get('/api/nodes', (req, res) => {
    res.json({
      success: true,
      nodes: globalNodeRegistry.getAllDescriptions(),
    });
  });

  // 1.5 Projects CRUD (Dự án & Bản vẽ)
  app.get('/api/projects', (req, res) => {
    const projects = globalWorkflowStore.getProjects();
    const allWorkflows = globalWorkflowStore.getWorkflows();
    const enriched = projects.map((p) => {
      const wfs = allWorkflows.filter((w) => w.projectId === p.id);
      return {
        ...p,
        workflowsCount: wfs.length,
        workflows: wfs,
      };
    });
    res.json({
      success: true,
      projects: enriched,
    });
  });

  app.post('/api/projects', (req, res) => {
    const project = req.body;
    if (!project.name) {
      return res.status(400).json({ success: false, error: 'Project name is required' });
    }
    const saved = globalWorkflowStore.saveProject(project);
    res.json({ success: true, project: saved });
  });

  app.post('/api/projects/delete-samples', (req, res) => {
    const result = globalWorkflowStore.deleteSampleProjects();
    res.json({ success: true, ...result });
  });

  app.delete('/api/projects/:id', (req, res) => {
    const ok = globalWorkflowStore.deleteProject(req.params.id);
    res.json({ success: ok });
  });

  // 2. Workflows CRUD
  app.get('/api/workflows', (req, res) => {
    res.json({
      success: true,
      workflows: globalWorkflowStore.getWorkflows(),
    });
  });

  app.get('/api/workflows/:id', (req, res) => {
    const wf = globalWorkflowStore.getWorkflow(req.params.id);
    if (!wf) return res.status(404).json({ success: false, error: 'Workflow not found' });
    res.json({ success: true, workflow: wf });
  });

  app.post('/api/workflows', (req, res) => {
    const workflow = req.body;
    if (!workflow.name) return res.status(400).json({ success: false, error: 'Workflow name is required' });
    const saved = globalWorkflowStore.saveWorkflow(workflow);
    globalCronScheduler.refresh();
    res.json({ success: true, workflow: saved });
  });

  app.delete('/api/workflows/:id', (req, res) => {
    const ok = globalWorkflowStore.deleteWorkflow(req.params.id);
    if (ok) globalCronScheduler.refresh();
    res.json({ success: ok });
  });

  // 3. Execution
  // Single Step Node Execution (Test Step inside NDV)
  app.post('/api/nodes/execute-step', async (req, res) => {
    const { node, inputData, workflow, credentials } = req.body;
    if (!node || !node.type) {
      return res.status(400).json({ success: false, error: 'Node and node.type are required' });
    }

    const nodeType = globalNodeRegistry.get(node.type);
    if (!nodeType) {
      return res.status(404).json({ success: false, error: `Node type "${node.type}" not found` });
    }

    const startTime = Date.now();
    const effectiveWorkflow = workflow || {
      id: 'test_step_wf',
      name: 'Single Step Test',
      nodes: [node],
      connections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const context: any = {
      workflow: effectiveWorkflow,
      runId: `test_step_${Date.now()}`,
      executionMode: 'manual',
      nodeOutputs: new Map(),
      variables: {},
      credentials: { ...globalWorkflowStore.getCredentials(), ...(credentials || {}) },
      log: (message: string) => console.log(`[TestStep:${node.name}] ${message}`),
    };

    try {
      const items = Array.isArray(inputData) && inputData.length > 0 ? inputData : [{ json: {} }];
      const outputData = await nodeType.execute(context, items, node);
      const durationMs = Date.now() - startTime;

      res.json({
        success: true,
        data: outputData,
        durationMs,
      });
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      let selfHealing: any = undefined;

      try {
        selfHealing = await SelfHealingEngine.diagnoseAndFix(node, err.message, inputData || []);
      } catch {
        // ignore
      }

      res.status(500).json({
        success: false,
        error: err.message,
        durationMs,
        selfHealing,
      });
    }
  });

  app.post('/api/workflows/:id/execute', async (req, res) => {
    const wf = globalWorkflowStore.getWorkflow(req.params.id);
    if (!wf) return res.status(404).json({ success: false, error: 'Workflow not found' });

    try {
      const summary = await WorkflowRunner.execute(wf, {
        executionMode: 'manual',
        credentials: globalWorkflowStore.getCredentials(),
        onProgress: (event: any) => broadcast(event),
      });

      globalWorkflowStore.addExecution(summary);
      res.json({ success: true, summary });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Execute directly from current Canvas draft
  app.post('/api/workflows/execute-adhoc', async (req, res) => {
    const workflow = req.body;
    if (!workflow || !Array.isArray(workflow.nodes)) {
      return res.status(400).json({ success: false, error: 'Invalid workflow payload' });
    }

    try {
      const summary = await WorkflowRunner.execute(workflow, {
        executionMode: 'manual',
        credentials: globalWorkflowStore.getCredentials(),
        onProgress: (event: any) => broadcast(event),
      });

      globalWorkflowStore.addExecution(summary);
      res.json({ success: true, summary });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3.8. Retry execution from a specific failed node (Partial Execution)
  app.post('/api/workflows/:id/retry', async (req, res) => {
    const { fromNodeId, previousOutputs } = req.body;
    const wf = globalWorkflowStore.getWorkflow(req.params.id);
    if (!wf) return res.status(404).json({ success: false, error: 'Workflow not found' });

    try {
      const summary = await WorkflowRunner.execute(wf, {
        executionMode: 'manual',
        startNodeId: fromNodeId,
        previousOutputs,
        credentials: globalWorkflowStore.getCredentials(),
        onProgress: (event: any) => broadcast(event),
      } as any);

      globalWorkflowStore.addExecution(summary);
      res.json({ success: true, summary });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3.9. Workflow Version History & Rollback
  app.get('/api/workflows/:id/versions', (req, res) => {
    const versions = globalWorkflowStore.getWorkflowVersions(req.params.id);
    res.json({ success: true, versions });
  });

  app.post('/api/workflows/:id/versions', (req, res) => {
    const wf = globalWorkflowStore.getWorkflow(req.params.id);
    if (!wf) return res.status(404).json({ success: false, error: 'Workflow not found' });
    const { changeSummary } = req.body;
    const ver = globalWorkflowStore.createWorkflowVersion(wf, changeSummary || 'Lưu snapshot thủ công');
    res.json({ success: true, version: ver });
  });

  app.post('/api/workflows/:id/versions/:verId/restore', (req, res) => {
    const restored = globalWorkflowStore.rollbackWorkflowVersion(req.params.id, req.params.verId);
    if (!restored) return res.status(404).json({ success: false, error: 'Version not found' });
    globalCronScheduler.refresh();
    res.json({ success: true, workflow: restored });
  });

  // 3.10. Task Scheduler & Recurring Daily Tasks
  app.get('/api/tasks', (req, res) => {
    const tasks = globalWorkflowStore.getTasks();
    res.json({ success: true, tasks });
  });

  app.post('/api/tasks', (req, res) => {
    const taskData = req.body;
    if (!taskData.title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }
    const saved = globalWorkflowStore.saveTask(taskData);
    globalCronScheduler.refresh();
    res.json({ success: true, task: saved });
  });

  app.delete('/api/tasks/:id', (req, res) => {
    const ok = globalWorkflowStore.deleteTask(req.params.id);
    if (ok) globalCronScheduler.refresh();
    res.json({ success: ok });
  });

  app.post('/api/tasks/:id/toggle', (req, res) => {
    const task = globalWorkflowStore.getTask(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    task.enabled = !task.enabled;
    const saved = globalWorkflowStore.saveTask(task);
    globalCronScheduler.refresh();
    res.json({ success: true, task: saved });
  });

  app.post('/api/tasks/:id/run', async (req, res) => {
    try {
      const outcome = await globalCronScheduler.runTaskNow(req.params.id);
      res.json(outcome);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3.11. Built-in Data Tables (Mini-database / Tables)
  app.get('/api/tables', (req, res) => {
    res.json({ success: true, tables: globalWorkflowStore.getTables() });
  });

  app.post('/api/tables', (req, res) => {
    const tableData = req.body;
    if (!tableData.name) {
      return res.status(400).json({ success: false, error: 'Table name is required' });
    }
    const saved = globalWorkflowStore.saveTable(tableData);
    res.json({ success: true, table: saved });
  });

  app.get('/api/tables/:id', (req, res) => {
    const tbl = globalWorkflowStore.getTable(req.params.id);
    if (!tbl) return res.status(404).json({ success: false, error: 'Table not found' });
    res.json({ success: true, table: tbl });
  });

  app.delete('/api/tables/:id', (req, res) => {
    const ok = globalWorkflowStore.deleteTable(req.params.id);
    res.json({ success: ok });
  });

  app.post('/api/tables/:id/rows', (req, res) => {
    const row = globalWorkflowStore.insertTableRow(req.params.id, req.body);
    if (!row) return res.status(404).json({ success: false, error: 'Table not found' });
    res.json({ success: true, row });
  });

  app.delete('/api/tables/:id/rows/:rowId', (req, res) => {
    const ok = globalWorkflowStore.deleteTableRow(req.params.id, req.params.rowId);
    res.json({ success: ok });
  });

  // 4. Execution History
  app.get('/api/executions', (req, res) => {
    res.json({
      success: true,
      history: globalWorkflowStore.getHistory(),
    });
  });

  // 5. AI Workflow Builder
  app.post('/api/ai/build', async (req, res) => {
    const { prompt, existingWorkflow, provider, baseUrl, model, apiKey } = req.body;
    if (!prompt) return res.status(400).json({ success: false, error: 'Prompt is required' });

    try {
      const plan = await AIWorkflowBuilder.buildFromPrompt(prompt, existingWorkflow, provider, {
        baseUrl,
        model,
        apiKey,
      });
      res.json({ success: true, plan });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. AI Self-Healing Diagnose
  app.post('/api/ai/self-healing', async (req, res) => {
    const { node, errorMessage, inputData, provider } = req.body;
    if (!node || !errorMessage) {
      return res.status(400).json({ success: false, error: 'Node and errorMessage are required' });
    }

    try {
      const suggestion = await SelfHealingEngine.diagnoseAndFix(
        node,
        errorMessage,
        inputData || [],
        provider
      );
      res.json({ success: true, suggestion });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. Credentials Management
  app.get('/api/credentials', (req, res) => {
    const creds = globalWorkflowStore.getCredentials();
    const masked: Record<string, string> = {};
    for (const [k, v] of Object.entries(creds)) {
      if (typeof v === 'string') {
        const isSecret = /(_KEY|_TOKEN|_SECRET|_PASSWORD)/i.test(k);
        if (isSecret) {
          masked[k] = v.length > 8 ? v.slice(0, 4) + '••••••••' + v.slice(-4) : '••••••••';
        } else {
          // URLs, Models, Provider Names, Status are unmasked for UI selection
          masked[k] = v;
        }
      }
    }
    res.json({ success: true, credentials: masked, rawKeys: Object.keys(creds) });
  });

  app.post('/api/credentials', (req, res) => {
    const newCreds = req.body;
    globalWorkflowStore.setCredentials(newCreds);

    // Also update current process env
    for (const [k, v] of Object.entries(newCreds)) {
      if (typeof v === 'string' && v) {
        process.env[k] = v;
      }
    }

    res.json({ success: true, message: 'Cập nhật API Key thành công' });
  });

  // 8. Universal Webhook Handler
  app.all('/webhook/:path', async (req, res) => {
    // Meta / Facebook / Messenger Webhook Verification Challenge
    if (req.method === 'GET' && req.query['hub.challenge']) {
      return res.status(200).send(req.query['hub.challenge']);
    }

    const webhookPath = req.params.path;
    const workflows = globalWorkflowStore.getWorkflows();

    const matchingWorkflows = workflows.filter((w) =>
      w.active &&
      w.nodes.some(
        (n) =>
          (n.type.startsWith('trigger.') || n.type === 'trigger.webhook') &&
          (n.parameters?.path === webhookPath || n.parameters?.path === `/${webhookPath}` || !n.parameters?.path) &&
          (!n.parameters?.httpMethod || n.parameters?.httpMethod === req.method)
      )
    );

    if (matchingWorkflows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Không có workflow nào đang kích hoạt lắng nghe webhook: /webhook/${webhookPath} [${req.method}]`,
      });
    }

    const payload = {
      headers: req.headers,
      query: req.query,
      body: req.body,
    };

    const runPromises = matchingWorkflows.map((wf) => {
      const webhookNode = wf.nodes.find(
        (n) => n.type === 'trigger.webhook' && n.parameters?.path === webhookPath
      );
      return WorkflowRunner.execute(wf, {
        executionMode: 'trigger',
        startNodeId: webhookNode?.id,
        initialData: [{ json: payload }],
        credentials: globalWorkflowStore.getCredentials(),
        onProgress: (event: any) => broadcast(event),
      });
    });

    const summaries = await Promise.all(runPromises);
    for (const s of summaries) globalWorkflowStore.addExecution(s);

    res.json({
      success: true,
      message: `Đã kích hoạt ${matchingWorkflows.length} workflow thành công qua webhook`,
      executions: summaries.map((s) => ({ id: s.id, workflowName: s.workflowName, status: s.status })),
    });
  });

  // 9. API Overview
  app.get(['/api', '/api/'], (req, res) => {
    res.json({
      status: 'online',
      service: 'vinceauto-backend-api',
      user: 'Ưng Đỗ Thế Vinh',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      endpoints: [
        '/',
        '/health',
        '/ping',
        '/api/nodes',
        '/api/projects',
        '/api/workflows',
        '/api/credentials',
        '/api/tasks',
        '/api/tables',
        '/api/ai/build',
        '/webhook/:path',
      ],
    });
  });

  // 10. Static Frontend Serving or Dedicated API Status Dashboard
  const candidateDirs = [
    path.resolve(process.cwd(), 'frontend/dist'),
    path.resolve(process.cwd(), '../frontend/dist'),
    path.resolve(process.cwd(), '../../frontend/dist'),
  ];
  const frontendDist = candidateDirs.find((d) => fs.existsSync(d) && fs.existsSync(path.join(d, 'index.html')));

  if (frontendDist) {
    app.use(express.static(frontendDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/webhook') || req.path === '/health' || req.path === '/ping') {
        return next();
      }
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  } else {
    // When frontend is not built or backend runs standalone (e.g. Render backend only)
    app.get('/', (req, res) => {
      if (req.headers.accept?.includes('application/json')) {
        return res.json({
          status: 'online',
          name: 'VinceAuto Automation & AI Agent API',
          user: 'Ưng Đỗ Thế Vinh',
          version: '1.0.0',
          uptime: process.uptime(),
          health: '/health',
          ping: '/ping',
          api: '/api',
        });
      }

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VinceAuto Backend API - Online</title>
  <style>
    body {
      background-color: #121214;
      color: #e6e8ec;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .card {
      background-color: #1a1a1e;
      border: 1px solid #2d2d34;
      border-radius: 16px;
      max-width: 640px;
      width: 100%;
      padding: 32px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 5px 14px;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      font-size: 12px;
      font-weight: 600;
    }
    .pulse {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #34d399;
      box-shadow: 0 0 10px #34d399;
    }
    h1 { font-size: 22px; margin: 18px 0 8px; font-weight: 700; color: #fff; }
    p { font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0 0 20px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 16px; }
    .btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      border-radius: 10px;
      background: #232328;
      border: 1px solid #32323a;
      color: #e6e8ec;
      text-decoration: none;
      font-size: 12px;
      font-family: monospace;
      transition: all 0.2s;
    }
    .btn:hover { background: #2b2b32; border-color: #454550; color: #fff; transform: translateY(-1px); }
    .tag { font-size: 10px; color: #60a5fa; font-family: sans-serif; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #282830; font-size: 11px; color: #71717a; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"><div class="pulse"></div> Backend API Đang Hoạt Động</div>
    <h1>VinceAuto API Service ⚡</h1>
    <p>Máy chủ tự động hóa quy trình & điều phối AI Agent của <strong>Ưng Đỗ Thế Vinh</strong> đang trực tuyến và sẵn sàng xử lý yêu cầu.</p>
    <div class="grid">
      <a href="/health" class="btn"><span>/health</span> <span class="tag">Trạng thái</span></a>
      <a href="/ping" class="btn"><span>/ping</span> <span class="tag">Keep-Alive</span></a>
      <a href="/api/nodes" class="btn"><span>/api/nodes</span> <span class="tag">400+ Nodes</span></a>
      <a href="/api/workflows" class="btn"><span>/api/workflows</span> <span class="tag">Quy trình</span></a>
      <a href="/api/projects" class="btn"><span>/api/projects</span> <span class="tag">Dự án</span></a>
      <a href="/api/credentials" class="btn"><span>/api/credentials</span> <span class="tag">API Keys</span></a>
    </div>
    <div class="footer">VinceAuto Platform v1.0.0 • Ưng Đỗ Thế Vinh</div>
  </div>
</body>
</html>`);
    });
  }

  // 11. Catch-all 404 Handler (prevents raw "Cannot GET ...")
  app.use((req, res) => {
    if (req.headers.accept?.includes('text/html')) {
      res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8').send(`
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>404 - VinceAuto</title>
  <style>body{background:#121214;color:#e6e8ec;font-family:sans-serif;padding:60px 20px;text-align:center;}a{color:#60a5fa;text-decoration:none;}a:hover{text-decoration:underline;}code{background:#222;padding:2px 6px;border-radius:4px;color:#f87171;}</style>
</head>
<body>
  <h2>404 — Tuyến đường không tồn tại</h2>
  <p>Đường dẫn <code>${req.method} ${req.originalUrl}</code> không có trên hệ thống.</p>
  <p><a href="/">Quay về Trang chủ Backend</a> • <a href="/health">Kiểm tra /health</a> • <a href="/api">Danh sách /api</a></p>
</body>
</html>`);
    } else {
      res.status(404).json({
        success: false,
        error: `Cannot ${req.method} ${req.originalUrl}`,
        message: 'Tuyến đường không tồn tại trên VinceAuto Backend API',
        availableEndpoints: ['/', '/health', '/ping', '/api', '/api/nodes', '/api/workflows', '/api/projects', '/webhook/:path'],
      });
    }
  });

  return { app, server, broadcast };
}
